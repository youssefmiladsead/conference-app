// src/pages/TeamsPage.jsx
import { useEffect, useState } from 'react';
import { useConference } from '../context/ConferenceContext';
import { getTeams, createTeam, updateTeam, deleteTeam, getParticipants, assignTeam } from '../lib/firestore';
import Modal from '../components/common/Modal';
import { useToast, ToastContainer } from '../components/common/Toast';
import { PageLoader } from '../components/common/Spinner';

const TEAM_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
];

export default function TeamsPage() {
  const { activeConference } = useConference();
  const { toasts, toast } = useToast();
  const [teams, setTeams] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#3B82F6' });
  const [saving, setSaving] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');

  const load = async () => {
    if (!activeConference) return;
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

  useEffect(() => { load(); }, [activeConference]);

  const openCreate = () => {
    setEditingTeam(null);
    setForm({ name: '', color: '#3B82F6' });
    setShowModal(true);
  };

  const openEdit = (team) => {
    setEditingTeam(team);
    setForm({ name: team.name, color: team.color || '#3B82F6' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingTeam) {
        await updateTeam(activeConference.id, editingTeam.id, { name: form.name, color: form.color });
        toast('Team updated', 'success');
      } else {
        await createTeam(activeConference.id, { name: form.name, color: form.color });
        toast('Team created', 'success');
      }
      setShowModal(false);
      load();
    } catch {
      toast('Failed to save team', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (team) => {
    if (!confirm(`Delete "${team.name}"? This cannot be undone.`)) return;
    try {
      await deleteTeam(activeConference.id, team.id);
      toast('Team deleted', 'success');
      load();
    } catch {
      toast('Failed to delete', 'error');
    }
  };

  const openAssign = (team) => {
    setSelectedTeam(team);
    setAssignSearch('');
    setShowAssignModal(true);
  };

  const handleAssign = async (participant) => {
    try {
      await assignTeam(activeConference.id, participant.userId, selectedTeam.id, selectedTeam.name);
      toast(`${participant.name} → ${selectedTeam.name}`, 'success');
      load();
    } catch {
      toast('Failed to assign', 'error');
    }
  };

  const handleUnassign = async (participant) => {
    try {
      await assignTeam(activeConference.id, participant.userId, null, null);
      toast(`${participant.name} removed from team`, 'success');
      load();
    } catch {
      toast('Failed to unassign', 'error');
    }
  };

  if (!activeConference) {
    return <div className="p-8 text-center text-gray-400">No active conference selected</div>;
  }

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(assignSearch.toLowerCase())
  );

  const teamMembers = selectedTeam ? participants.filter(p => p.teamId === selectedTeam.id) : [];

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <ToastContainer toasts={toasts} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Teams</h1>
          <p className="text-gray-400 text-xs">{activeConference.name}</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">+ New Team</button>
      </div>

      {loading ? <PageLoader /> : (
        <div className="space-y-3">
          {teams.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-gray-400 mb-4">No teams yet</p>
              <button onClick={openCreate} className="btn-primary">Create First Team</button>
            </div>
          ) : teams.map(team => {
            const members = participants.filter(p => p.teamId === team.id);
            return (
              <div key={team.id} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ background: team.color || '#3B82F6' }} />
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{team.name}</h3>
                    <p className="text-gray-400 text-xs">{members.length} members · {team.points || 0} pts</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openAssign(team)} className="text-brand-400 hover:text-brand-300 text-sm font-medium">
                      Members
                    </button>
                    <button onClick={() => openEdit(team)} className="text-gray-400 hover:text-white text-sm">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(team)} className="text-red-400 hover:text-red-300 text-sm">
                      Del
                    </button>
                  </div>
                </div>
                {members.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {members.map(m => (
                      <span key={m.id} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                        {m.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingTeam ? 'Edit Team' : 'New Team'}>
        <div className="space-y-4">
          <div>
            <label className="label">Team Name</label>
            <input
              className="input"
              placeholder="e.g. Team Drift"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Team Color</label>
            <div className="flex flex-wrap gap-2">
              {TEAM_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setForm(p => ({ ...p, color }))}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary w-full">
            {saving ? 'Saving...' : editingTeam ? 'Update Team' : 'Create Team'}
          </button>
        </div>
      </Modal>

      {/* Assign Members Modal */}
      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)} title={`${selectedTeam?.name} — Members`}>
        <div className="space-y-3">
          {/* Current members */}
          {teamMembers.length > 0 && (
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Current Members</p>
              {teamMembers.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-white text-sm">{p.name}</span>
                  <button
                    onClick={() => handleUnassign(p)}
                    className="text-red-400 text-xs hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add members */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Add Participant</p>
            <input
              className="input mb-2"
              placeholder="Search by name..."
              value={assignSearch}
              onChange={e => setAssignSearch(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredParticipants
                .filter(p => p.teamId !== selectedTeam?.id)
                .map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleAssign(p)}
                    className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                  >
                    <div>
                      <p className="text-white text-sm">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.teamName ? `Currently: ${p.teamName}` : 'No team'}</p>
                    </div>
                    <span className="text-brand-400 text-sm">+ Assign</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
