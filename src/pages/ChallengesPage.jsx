// src/pages/ChallengesPage.jsx
import { useEffect, useState } from 'react';
import { useConference } from '../context/ConferenceContext';
import { useAuth } from '../context/AuthContext';
import { getTeams, getTeamChallenges, awardTeamChallenge } from '../lib/firestore';
import { useToast, ToastContainer } from '../components/common/Toast';
import { PageLoader } from '../components/common/Spinner';

const PRESET_CHALLENGES = [
  { name: 'Vlog Challenge', points: 50 },
  { name: 'Sketch Performance', points: 50 },
  { name: 'Team Competition', points: 30 },
  { name: 'Best Team Spirit', points: 40 },
  { name: 'Trivia Winner', points: 25 },
  { name: 'Worship Leader Award', points: 35 },
];

export default function ChallengesPage() {
  const { activeConference } = useConference();
  const { user } = useAuth();
  const { toasts, toast } = useToast();
  const [teams, setTeams] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ teamId: '', challengeName: '', points: 50 });
  const [awarding, setAwarding] = useState(false);

  const load = async () => {
    if (!activeConference) return;
    setLoading(true);
    try {
      const [t, c] = await Promise.all([
        getTeams(activeConference.id),
        getTeamChallenges(activeConference.id),
      ]);
      setTeams(t);
      setChallenges(c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeConference]);

  const handleAward = async () => {
    if (!form.teamId || !form.challengeName || !form.points) {
      toast('Fill in all fields', 'error');
      return;
    }
    setAwarding(true);
    try {
      await awardTeamChallenge(
        activeConference.id,
        form.teamId,
        form.challengeName,
        Number(form.points),
        user?.email
      );
      const teamName = teams.find(t => t.id === form.teamId)?.name;
      toast(`🎉 ${teamName} awarded ${form.points} pts for ${form.challengeName}!`, 'success');
      setForm(p => ({ ...p, teamId: '', challengeName: '' }));
      load();
    } catch {
      toast('Failed to award points', 'error');
    } finally {
      setAwarding(false);
    }
  };

  const selectPreset = (p) => {
    setForm(prev => ({ ...prev, challengeName: p.name, points: p.points }));
  };

  if (!activeConference) {
    return <div className="p-8 text-center text-gray-400">No active conference selected</div>;
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <ToastContainer toasts={toasts} />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Team Challenges</h1>
        <p className="text-gray-400 text-xs">Award bonus points to entire teams</p>
      </div>

      {/* Award Form */}
      <div className="card mb-6">
        <h2 className="font-bold text-white mb-4">Award Points</h2>

        {/* Preset Challenges */}
        <div className="mb-4">
          <p className="label">Quick Select Challenge</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_CHALLENGES.map(p => (
              <button
                key={p.name}
                onClick={() => selectPreset(p)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  form.challengeName === p.name
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {p.name} (+{p.points})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Team</label>
            <select
              className="input"
              value={form.teamId}
              onChange={e => setForm(p => ({ ...p, teamId: e.target.value }))}
            >
              <option value="">Select a team...</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Challenge Name</label>
            <input
              className="input"
              placeholder="e.g. Vlog Challenge"
              value={form.challengeName}
              onChange={e => setForm(p => ({ ...p, challengeName: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Points to Award</label>
            <input
              className="input"
              type="number"
              min="1"
              max="500"
              value={form.points}
              onChange={e => setForm(p => ({ ...p, points: e.target.value }))}
            />
          </div>
          <button
            onClick={handleAward}
            disabled={awarding || !form.teamId || !form.challengeName || !form.points}
            className="btn-success w-full"
          >
            {awarding ? 'Awarding...' : `⚡ Award +${form.points} pts`}
          </button>
        </div>
      </div>

      {/* History */}
      <h2 className="section-title">Challenge History</h2>
      {loading ? <PageLoader /> : (
        <div className="space-y-2">
          {challenges.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500 text-sm">No challenges awarded yet</p>
            </div>
          ) : challenges.map(c => {
            const team = teams.find(t => t.id === c.teamId);
            return (
              <div key={c.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{c.challengeName}</p>
                  <p className="text-gray-400 text-xs">{team?.name || 'Unknown team'}</p>
                  <p className="text-gray-600 text-xs">
                    {c.awardedAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-emerald-400 font-bold text-lg">+{c.points}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
