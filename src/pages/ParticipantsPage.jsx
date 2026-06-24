// src/pages/ParticipantsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';
import { getParticipants } from '../lib/firestore';
import { PageLoader } from '../components/common/Spinner';

export default function ParticipantsPage() {
  const { activeConference } = useConference();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!activeConference) return;
    const load = async () => {
      setLoading(true);
      try {
        setParticipants(await getParticipants(activeConference.id));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeConference]);

  if (!activeConference) {
    return <div className="p-8 text-center text-gray-400">No active conference selected</div>;
  }

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Participants</h1>
          <p className="text-gray-400 text-xs">{participants.length} registered</p>
        </div>
      </div>

      <input
        className="input mb-4"
        placeholder="Search by name or phone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? <PageLoader /> : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-gray-500">No participants found</p>
            </div>
          ) : filtered.map((p, i) => (
            <button
              key={p.id}
              onClick={() => navigate(`/profile/${p.userId}?conf=${activeConference.id}`)}
              className="card w-full flex items-center gap-3 text-left active:scale-95 transition-transform"
            >
              <div className="w-9 h-9 bg-brand-500/20 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-brand-400">
                {p.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{p.name}</p>
                <p className="text-gray-500 text-xs">{p.teamName || 'No team'} · {p.phone}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-brand-400 font-bold">{p.points || 0}</p>
                <p className="text-gray-600 text-xs">pts</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
