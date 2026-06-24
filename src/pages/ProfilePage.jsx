// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getParticipant, getAttendanceForUser } from '../lib/firestore';
import { useConference } from '../context/ConferenceContext';
import QRCode from '../components/common/QRCode';
import { PageLoader } from '../components/common/Spinner';

export default function ProfilePage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const { activeConference, conferences } = useConference();
  const navigate = useNavigate();

  const [participant, setParticipant] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const confId = searchParams.get('conf') || activeConference?.id;

  useEffect(() => {
    if (!confId || !userId) return;
    const load = async () => {
      try {
        const [p, a] = await Promise.all([
          getParticipant(confId, userId),
          getAttendanceForUser(confId, userId),
        ]);
        setParticipant(p);
        setAttendance(a);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [confId, userId]);

  if (loading) return <PageLoader />;

  if (!participant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-xl font-bold text-white mb-2">Participant Not Found</h2>
        <p className="text-gray-400 mb-6">This QR code doesn't match any registered participant.</p>
        <button onClick={() => navigate('/')} className="btn-secondary">← Go Back</button>
      </div>
    );
  }

  const sortedAttendance = [...attendance].sort((a, b) => {
    const ta = a.markedAt?.toDate?.() || 0;
    const tb = b.markedAt?.toDate?.() || 0;
    return tb - ta;
  });

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="text-gray-400 text-sm mb-6 flex items-center gap-1 hover:text-white transition-colors">
        ← Back
      </button>

      {/* Profile Card */}
      <div className="card mb-4 text-center">
        <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">👤</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{participant.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{participant.phone}</p>
        {participant.teamName && (
          <div className="inline-flex items-center gap-1.5 bg-brand-500/20 text-brand-300 rounded-full px-3 py-1 text-sm font-medium mt-2">
            🏆 {participant.teamName}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-brand-400">{participant.points || 0}</p>
          <p className="text-gray-400 text-xs mt-1">Total Points</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-emerald-400">{attendance.length}</p>
          <p className="text-gray-400 text-xs mt-1">Activities</p>
        </div>
      </div>

      {/* QR Code Toggle */}
      <div className="card mb-4">
        <button
          onClick={() => setShowQR(!showQR)}
          className="w-full flex items-center justify-between"
        >
          <span className="font-semibold text-white">My QR Code</span>
          <span className="text-gray-400 text-sm">{showQR ? '▲ Hide' : '▼ Show'}</span>
        </button>
        {showQR && (
          <div className="mt-4 text-center animate-fade-in">
            <QRCode value={participant.userId} size={180} className="mx-auto" />
            <p className="text-gray-500 text-xs mt-2 font-mono">{participant.userId}</p>
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div>
        <h2 className="section-title">Attendance History</h2>
        {sortedAttendance.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 text-sm">No attendance recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAttendance.map(a => (
              <div key={a.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{a.activityName}</p>
                  <p className="text-gray-500 text-xs">
                    {a.markedAt?.toDate?.()?.toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-emerald-400 font-bold text-sm">+{a.points}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
