// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';
import { useAuth } from '../context/AuthContext';
import { getParticipants, getTeams, getAttendanceStats } from '../lib/firestore';

function StatCard({ label, value, icon, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-500/20 text-brand-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    purple: 'bg-purple-500/20 text-purple-400',
  };
  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-gray-400 text-sm mt-1">{label}</p>
    </div>
  );
}

function QuickAction({ label, icon, path, color }) {
  const navigate = useNavigate();
  const colors = {
    blue: 'bg-brand-500 hover:bg-brand-600',
    green: 'bg-emerald-600 hover:bg-emerald-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    red: 'bg-red-600 hover:bg-red-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
  };
  return (
    <button
      onClick={() => navigate(path)}
      className={`${colors[color]} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold text-center leading-tight">{label}</span>
    </button>
  );
}

export default function AdminDashboard() {
  const { activeConference, setActiveConference, conferences } = useConference();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ participants: 0, teams: 0, attendance: 0 });
  const [topTeams, setTopTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeConference) return;
    const load = async () => {
      setLoading(true);
      try {
        const [participants, teams, attendance] = await Promise.all([
          getParticipants(activeConference.id),
          getTeams(activeConference.id),
          getAttendanceStats(activeConference.id),
        ]);
        setStats({
          participants: participants.length,
          teams: teams.length,
          attendance: attendance.length,
        });
        setTopTeams(teams.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeConference]);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-xs">{user?.email}</p>
        </div>
        <button onClick={logout} className="text-gray-400 hover:text-red-400 text-sm transition-colors">
          Sign Out
        </button>
      </div>

      {/* Conference Selector */}
      {conferences.length > 0 && (
        <div className="card mb-6">
          <label className="label">Active Conference</label>
          <select
            className="input"
            value={activeConference?.id || ''}
            onChange={e => {
              const conf = conferences.find(c => c.id === e.target.value);
              setActiveConference(conf);
            }}
          >
            {conferences.filter(c => !c.archived).map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.year}</option>
            ))}
          </select>
        </div>
      )}

      {!activeConference ? (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">🏛️</p>
          <p className="text-gray-400 mb-4">No active conference</p>
          <button onClick={() => navigate('/admin/conferences')} className="btn-primary">
            Create Conference
          </button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard label="Participants" value={stats.participants} icon="👥" color="brand" />
            <StatCard label="Teams" value={stats.teams} icon="🏆" color="amber" />
            <StatCard label="Check-ins" value={stats.attendance} icon="✅" color="emerald" />
            <StatCard label="Avg per person" value={stats.participants > 0 ? Math.round(stats.attendance / stats.participants) : 0} icon="📊" color="purple" />
          </div>

          {/* Quick Actions */}
          <h2 className="section-title">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <QuickAction label="Scan QR" icon="📷" path="/admin/scanner" color="blue" />
            <QuickAction label="Teams" icon="🏆" path="/admin/teams" color="amber" />
            <QuickAction label="Activities" icon="📋" path="/admin/activities" color="green" />
            <QuickAction label="Challenges" icon="⚡" path="/admin/challenges" color="purple" />
            <QuickAction label="Participants" icon="👥" path="/admin/participants" color="orange" />
            <QuickAction label="Conferences" icon="🏛️" path="/admin/conferences" color="red" />
          </div>

          {/* Top Teams */}
          {topTeams.length > 0 && (
            <>
              <h2 className="section-title">Top Teams</h2>
              <div className="space-y-2 mb-4">
                {topTeams.map((team, i) => (
                  <div key={team.id} className="card flex items-center gap-3">
                    <span className="text-xl">{['🥇','🥈','🥉'][i]}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{team.name}</p>
                    </div>
                    <p className="text-brand-400 font-bold">{team.points} pts</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/leaderboard')} className="btn-secondary w-full text-sm">
                View Full Leaderboard →
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
