// src/pages/LeaderboardPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParticipants, getTeams } from '../lib/firestore';
import { useConference } from '../context/ConferenceContext';
import { PageLoader } from '../components/common/Spinner';

const medals = ['🥇', '🥈', '🥉'];
const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

export default function LeaderboardPage() {
  const { activeConference } = useConference();
  const navigate = useNavigate();
  const [tab, setTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeConference) return;
    const load = async () => {
      setLoading(true);
      try {
        const [t, p] = await Promise.all([
          getTeams(activeConference.id),
          getParticipants(activeConference.id),
        ]);
        setTeams(t);
        setParticipants(p);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeConference]);

  if (!activeConference) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <p className="text-5xl mb-4">🏆</p>
        <h2 className="text-xl font-bold text-white mb-2">No Active Conference</h2>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">🏆 Leaderboard</h1>
        <p className="text-gray-400 text-sm mt-1">{activeConference.name}</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-900 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('teams')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'teams' ? 'bg-brand-500 text-white' : 'text-gray-400'
          }`}
        >
          Teams
        </button>
        <button
          onClick={() => setTab('participants')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'participants' ? 'bg-brand-500 text-white' : 'text-gray-400'
          }`}
        >
          Participants
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : tab === 'teams' ? (
        <div className="space-y-3 animate-fade-in">
          {teams.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-gray-500">No teams yet</p>
            </div>
          ) : teams.map((team, i) => (
            <div
              key={team.id}
              className={`card flex items-center gap-4 ${i === 0 ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}
            >
              <div className="w-10 text-center">
                {i < 3 ? (
                  <span className="text-2xl">{medals[i]}</span>
                ) : (
                  <span className="text-gray-500 font-bold text-lg">#{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-lg ${i < 3 ? rankColors[i] : 'text-white'}`}>
                  {team.name}
                </p>
                {team.color && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: team.color }} />
                    <span className="text-gray-500 text-xs">{team.color}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${i < 3 ? rankColors[i] : 'text-brand-400'}`}>
                  {team.points || 0}
                </p>
                <p className="text-gray-500 text-xs">pts</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          {participants.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-gray-500">No participants yet</p>
            </div>
          ) : participants.map((p, i) => (
            <button
              key={p.id}
              onClick={() => navigate(`/profile/${p.userId}?conf=${activeConference.id}`)}
              className={`card w-full flex items-center gap-3 text-left active:scale-95 transition-transform ${
                i === 0 ? 'border-yellow-500/30 bg-yellow-500/5' : ''
              }`}
            >
              <div className="w-8 text-center shrink-0">
                {i < 3 ? (
                  <span className="text-xl">{medals[i]}</span>
                ) : (
                  <span className="text-gray-500 font-bold">#{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${i < 3 ? rankColors[i] : 'text-white'}`}>
                  {p.name}
                </p>
                {p.teamName && (
                  <p className="text-gray-500 text-xs truncate">{p.teamName}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className={`text-xl font-bold ${i < 3 ? rankColors[i] : 'text-brand-400'}`}>
                  {p.points || 0}
                </p>
                <p className="text-gray-500 text-xs">pts</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
