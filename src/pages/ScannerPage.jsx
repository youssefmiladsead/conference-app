// src/pages/ScannerPage.jsx
import { useState, useCallback } from 'react';
import { useConference } from '../context/ConferenceContext';
import { getParticipant, getActivities, getAttendanceForUser, markAttendance } from '../lib/firestore';
import QRScanner from '../components/common/QRScanner';
import { useToast, ToastContainer } from '../components/common/Toast';
import { PageLoader } from '../components/common/Spinner';

export default function ScannerPage() {
  const { activeConference } = useConference();
  const { toasts, toast } = useToast();

  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [activities, setActivities] = useState([]);
  const [attended, setAttended] = useState(new Set());
  const [marking, setMarking] = useState(null);

  /*const handleScan = useCallback(async (code) => {
    if (!scanning || loading || !activeConference) return;
    if (!code.startsWith('USR')) return; // Validate format

    setScanning(false);
    setLoading(true);

    try {
      const [p, acts, att] = await Promise.all([
        getParticipant(activeConference.id, code),
        getActivities(activeConference.id),
        getAttendanceForUser(activeConference.id, code),
      ]);

      if (!p) {
        toast('Participant not found!', 'error');
        setTimeout(() => setScanning(true), 2000);
        return;
      }

      setParticipant(p);
      setActivities(acts);
      setAttended(new Set(att.map(a => a.activityId)));
    } catch (err) {
      toast('Error loading participant', 'error');
      setScanning(true);
    } finally {
      setLoading(false);
    }
  }, [scanning, loading, activeConference]);*/
  const handleScan = useCallback(async (code) => {
  console.log("================================");
  console.log("QR SCANNED:", code);
  console.log("SCANNING:", scanning);
  console.log("LOADING:", loading);
  console.log("ACTIVE CONF:", activeConference);
  alert("SCANNED: " + code);

  if (!scanning || loading || !activeConference) {
    console.log("SCAN BLOCKED");
    return;
  }

  if (!code.startsWith('USR')) {
    console.log("INVALID QR FORMAT:", code);
    return;
  }

  setScanning(false);
  setLoading(true);

  try {
    console.log("FETCHING PARTICIPANT...");

    const [p, acts, att] = await Promise.all([
      getParticipant(activeConference.id, code),
      getActivities(activeConference.id),
      getAttendanceForUser(activeConference.id, code),
    ]);

    console.log("PARTICIPANT DATA:", p);
    console.log("ACTIVITIES COUNT:", acts?.length);
    console.log("ACTIVITIES:", acts);
    console.log("ATTENDANCE:", att);

    if (!p) {
      console.log("PARTICIPANT NOT FOUND");
      toast('Participant not found!', 'error');
      setTimeout(() => setScanning(true), 2000);
      return;
    }

    setParticipant(p);
    setActivities(acts);
    setAttended(new Set(att.map(a => a.activityId)));

    console.log("SUCCESS - DATA LOADED");
  } catch (err) {
    console.error("SCAN ERROR:", err);
    toast('Error loading participant', 'error');
    setScanning(true);
  } finally {
    setLoading(false);
  }
}, [scanning, loading, activeConference]);

  const handleMarkAttendance = async (activity) => {
    if (attended.has(activity.id) || marking) return;
    setMarking(activity.id);

    try {
      const result = await markAttendance(
        activeConference.id,
        participant.userId,
        activity.id,
        activity.name,
        activity.points
      );

      if (result.success) {
        setAttended(prev => new Set([...prev, activity.id]));
        setParticipant(prev => ({ ...prev, points: (prev.points || 0) + activity.points }));
        toast(`✅ ${activity.name} — +${activity.points} pts`, 'success');
      } else {
        toast('Already marked for this activity', 'warning');
      }
    } catch (err) {
      toast('Failed to mark attendance', 'error');
    } finally {
      setMarking(null);
    }
  };

  const handleReset = () => {
    setParticipant(null);
    setActivities([]);
    setAttended(new Set());
    setScanning(true);
  };

  // Group activities by day
  const activitiesByDay = activities.reduce((acc, a) => {
    const d = `Day ${a.day}`;
    if (!acc[d]) acc[d] = [];
    acc[d].push(a);
    return acc;
  }, {});

  if (!activeConference) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <p className="text-5xl mb-4">📷</p>
        <h2 className="text-xl font-bold text-white mb-2">No Active Conference</h2>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <ToastContainer toasts={toasts} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">QR Scanner</h1>
          <p className="text-gray-400 text-xs">{activeConference.name}</p>
        </div>
        {participant && (
          <button onClick={handleReset} className="btn-secondary text-sm py-2 px-4">
            Scan New
          </button>
        )}
      </div>

      {/* Scanner */}
      {scanning && (
        <div className="mb-6">
          <div className="card p-0 overflow-hidden mb-3">
            <QRScanner onScan={handleScan} />
          </div>
          <p className="text-center text-gray-400 text-sm">Point camera at participant's QR code</p>
        </div>
      )}

      {loading && (
        <div className="card flex items-center justify-center py-10">
          <PageLoader />
        </div>
      )}

      {/* Participant Info */}
      {participant && !loading && (
        <div className="animate-slide-up">
          {/* Profile Card */}
          <div className="card mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-500/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-2xl">👤</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{participant.name}</h2>
                <p className="text-gray-400 text-sm">{participant.teamName || 'No team'}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-brand-400">{participant.points || 0}</p>
                <p className="text-gray-500 text-xs">total pts</p>
              </div>
            </div>
          </div>

          {/* Activities */}
          <h2 className="section-title">Mark Attendance</h2>

          {Object.entries(activitiesByDay).sort().map(([day, acts]) => (
            <div key={day} className="mb-4">
              <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">{day}</p>
              <div className="space-y-2">
                {acts.map(a => {
                  const done = attended.has(a.id);
                  const isMarking = marking === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => handleMarkAttendance(a)}
                      disabled={done || isMarking}
                      className={`w-full card flex items-center justify-between transition-all active:scale-95 text-left ${
                        done
                          ? 'opacity-60 cursor-default bg-emerald-900/20 border-emerald-800/40'
                          : 'hover:border-brand-500/50 hover:bg-brand-500/5'
                      }`}
                    >
                      <div>
                        <p className={`font-medium ${done ? 'text-emerald-400' : 'text-white'}`}>
                          {done ? '✅ ' : ''}{a.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-bold text-sm ${done ? 'text-emerald-400' : 'text-brand-400'}`}>
                          +{a.points}
                        </span>
                        {isMarking ? (
                          <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                        ) : !done ? (
                          <span className="text-gray-500 text-xs">Tap</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
