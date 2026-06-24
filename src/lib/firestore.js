// src/lib/firestore.js
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy, serverTimestamp,
  increment, writeBatch, onSnapshot, limit
} from 'firebase/firestore';
import { db } from './firebase';

// ─── CONFERENCES ────────────────────────────────────────────────────────────

export const createConference = async (data) => {
  const ref = await addDoc(collection(db, 'conferences'), {
    ...data,
    createdAt: serverTimestamp(),
    archived: false,
  });
  return ref.id;
};

export const getConferences = async () => {
  const snap = await getDocs(query(collection(db, 'conferences'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateConference = async (id, data) => {
  await updateDoc(doc(db, 'conferences', id), data);
};

export const archiveConference = async (id) => {
  await updateDoc(doc(db, 'conferences', id), { archived: true });
};

// ─── PARTICIPANTS ────────────────────────────────────────────────────────────

export const generateUserId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `USR${ts}${rand}`;
};

export const registerParticipant = async (conferenceId, data) => {
  const userId = generateUserId();
  const userRef = doc(db, 'conferences', conferenceId, 'participants', userId);
  await setDoc(userRef, {
    userId,
    name: data.name,
    phone: data.phone,
    teamId: null,
    teamName: null,
    points: 0,
    createdAt: serverTimestamp(),
  });
  return userId;
};

export const getParticipant = async (conferenceId, userId) => {
  const snap = await getDoc(doc(db, 'conferences', conferenceId, 'participants', userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const getParticipants = async (conferenceId) => {
  const snap = await getDocs(
    query(collection(db, 'conferences', conferenceId, 'participants'), orderBy('points', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateParticipant = async (conferenceId, userId, data) => {
  await updateDoc(doc(db, 'conferences', conferenceId, 'participants', userId), data);
};

// ─── TEAMS ───────────────────────────────────────────────────────────────────

export const createTeam = async (conferenceId, data) => {
  const ref = await addDoc(collection(db, 'conferences', conferenceId, 'teams'), {
    ...data,
    points: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getTeams = async (conferenceId) => {
  const snap = await getDocs(
    query(collection(db, 'conferences', conferenceId, 'teams'), orderBy('points', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateTeam = async (conferenceId, teamId, data) => {
  await updateDoc(doc(db, 'conferences', conferenceId, 'teams', teamId), data);
};

export const deleteTeam = async (conferenceId, teamId) => {
  await deleteDoc(doc(db, 'conferences', conferenceId, 'teams', teamId));
};

export const assignTeam = async (conferenceId, userId, teamId, teamName) => {
  await updateDoc(doc(db, 'conferences', conferenceId, 'participants', userId), {
    teamId,
    teamName,
  });
};

// ─── ACTIVITIES ──────────────────────────────────────────────────────────────

export const createActivity = async (conferenceId, data) => {
  const ref = await addDoc(collection(db, 'conferences', conferenceId, 'activities'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getActivities = async (conferenceId) => {
  const snap = await getDocs(
    query(collection(db, 'conferences', conferenceId, 'activities'), orderBy('day'), orderBy('createdAt'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateActivity = async (conferenceId, activityId, data) => {
  await updateDoc(doc(db, 'conferences', conferenceId, 'activities', activityId), data);
};

export const deleteActivity = async (conferenceId, activityId) => {
  await deleteDoc(doc(db, 'conferences', conferenceId, 'activities', activityId));
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

export const markAttendance = async (conferenceId, userId, activityId, activityName, points) => {
  const attendanceId = `${userId}_${activityId}`;
  const attendanceRef = doc(db, 'conferences', conferenceId, 'attendance', attendanceId);
  const existing = await getDoc(attendanceRef);
  if (existing.exists()) return { success: false, message: 'Already marked' };

  const batch = writeBatch(db);

  // Mark attendance
  batch.set(attendanceRef, {
    userId,
    activityId,
    activityName,
    points,
    markedAt: serverTimestamp(),
  });

  // Add points to participant
  batch.update(doc(db, 'conferences', conferenceId, 'participants', userId), {
    points: increment(points),
  });

  await batch.commit();

  // Update team points if user is in a team
  const participant = await getParticipant(conferenceId, userId);
  if (participant?.teamId) {
    await updateDoc(doc(db, 'conferences', conferenceId, 'teams', participant.teamId), {
      points: increment(points),
    });
  }

  return { success: true };
};

export const getAttendanceForUser = async (conferenceId, userId) => {
  const snap = await getDocs(
    query(collection(db, 'conferences', conferenceId, 'attendance'), where('userId', '==', userId))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAttendanceStats = async (conferenceId) => {
  const snap = await getDocs(collection(db, 'conferences', conferenceId, 'attendance'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── TEAM CHALLENGES ─────────────────────────────────────────────────────────

export const awardTeamChallenge = async (conferenceId, teamId, challengeName, points, awardedBy) => {
  const batch = writeBatch(db);

  // Log the challenge award
  const challengeRef = doc(collection(db, 'conferences', conferenceId, 'teamChallenges'));
  batch.set(challengeRef, {
    teamId,
    challengeName,
    points,
    awardedBy,
    awardedAt: serverTimestamp(),
  });

  // Add points to team
  batch.update(doc(db, 'conferences', conferenceId, 'teams', teamId), {
    points: increment(points),
  });

  await batch.commit();

  // Add points to all team members
  const participants = await getDocs(
    query(collection(db, 'conferences', conferenceId, 'participants'), where('teamId', '==', teamId))
  );

  const memberBatch = writeBatch(db);
  participants.docs.forEach(p => {
    memberBatch.update(p.ref, { points: increment(points) });
  });
  await memberBatch.commit();

  return { success: true };
};

export const getTeamChallenges = async (conferenceId) => {
  const snap = await getDocs(
    query(collection(db, 'conferences', conferenceId, 'teamChallenges'), orderBy('awardedAt', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── SEED DEFAULT ACTIVITIES ─────────────────────────────────────────────────

export const seedDefaultActivities = async (conferenceId) => {
  const defaults = [
    // Day 1
    { name: 'Fr. Elijah Sermon', day: 1, points: 10 },
    { name: 'Vespers Prayer', day: 1, points: 10 },
    { name: 'Bible Study', day: 1, points: 10 },
    { name: 'Workshop', day: 1, points: 10 },
    { name: 'Outdoor Activity Day 1', day: 1, points: 10 },
    // Day 2
    { name: 'Liturgy', day: 2, points: 10 },
    { name: 'Fr. Barnabas Sermon', day: 2, points: 10 },
    { name: 'Bible Study Day 2', day: 2, points: 10 },
    { name: 'Vespers Prayer Day 2', day: 2, points: 10 },
    { name: 'Conference Signature Activity', day: 2, points: 15 },
    { name: 'Workshop Day 2', day: 2, points: 10 },
    { name: 'Outdoor Activity Day 2', day: 2, points: 10 },
  ];

  const batch = writeBatch(db);
  defaults.forEach(a => {
    const ref = doc(collection(db, 'conferences', conferenceId, 'activities'));
    batch.set(ref, { ...a, createdAt: serverTimestamp() });
  });
  await batch.commit();
};
