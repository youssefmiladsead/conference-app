// src/pages/ActivitiesPage.jsx
import { useEffect, useState } from 'react';
import { useConference } from '../context/ConferenceContext';
import { getActivities, createActivity, updateActivity, deleteActivity, seedDefaultActivities } from '../lib/firestore';
import Modal from '../components/common/Modal';
import { useToast, ToastContainer } from '../components/common/Toast';
import { PageLoader } from '../components/common/Spinner';

export default function ActivitiesPage() {
  const { activeConference } = useConference();
  const { toasts, toast } = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', day: 1, points: 10 });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    if (!activeConference) return;
    setLoading(true);
    try {
      setActivities(await getActivities(activeConference.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeConference]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', day: 1, points: 10 });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({ name: a.name, day: a.day, points: a.points });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateActivity(activeConference.id, editing.id, form);
        toast('Activity updated', 'success');
      } else {
        await createActivity(activeConference.id, form);
        toast('Activity created', 'success');
      }
      setShowModal(false);
      load();
    } catch {
      toast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a) => {
    if (!confirm(`Delete "${a.name}"?`)) return;
    try {
      await deleteActivity(activeConference.id, a.id);
      toast('Deleted', 'success');
      load();
    } catch {
      toast('Failed to delete', 'error');
    }
  };

  const handleSeed = async () => {
    if (!confirm('Add default activities? This will add the standard 12 activities.')) return;
    setSeeding(true);
    try {
      await seedDefaultActivities(activeConference.id);
      toast('Default activities added!', 'success');
      load();
    } catch {
      toast('Failed to seed activities', 'error');
    } finally {
      setSeeding(false);
    }
  };

  if (!activeConference) {
    return <div className="p-8 text-center text-gray-400">No active conference selected</div>;
  }

  const byDay = activities.reduce((acc, a) => {
    const d = `Day ${a.day}`;
    if (!acc[d]) acc[d] = [];
    acc[d].push(a);
    return acc;
  }, {});

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <ToastContainer toasts={toasts} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Activities</h1>
          <p className="text-gray-400 text-xs">{activities.length} total</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">+ Add</button>
      </div>

      {loading ? <PageLoader /> : (
        <>
          {activities.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-400 mb-4">No activities yet</p>
              <div className="flex flex-col gap-2">
                <button onClick={handleSeed} disabled={seeding} className="btn-primary">
                  {seeding ? 'Adding...' : '✨ Add Default Activities'}
                </button>
                <button onClick={openCreate} className="btn-secondary">+ Create Custom</button>
              </div>
            </div>
          ) : (
            <>
              {Object.entries(byDay).sort().map(([day, acts]) => (
                <div key={day} className="mb-5">
                  <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">{day}</h2>
                  <div className="space-y-2">
                    {acts.map(a => (
                      <div key={a.id} className="card flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{a.name}</p>
                          <p className="text-brand-400 text-sm font-semibold">+{a.points} pts</p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => openEdit(a)} className="text-gray-400 hover:text-white text-sm">Edit</button>
                          <button onClick={() => handleDelete(a)} className="text-red-400 hover:text-red-300 text-sm">Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={handleSeed} disabled={seeding} className="btn-secondary w-full text-sm">
                {seeding ? 'Adding...' : '+ Add Default Activities'}
              </button>
            </>
          )}
        </>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Activity' : 'New Activity'}>
        <div className="space-y-4">
          <div>
            <label className="label">Activity Name</label>
            <input
              className="input"
              placeholder="e.g. Fr. Elijah Sermon"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Day</label>
              <select
                className="input"
                value={form.day}
                onChange={e => setForm(p => ({ ...p, day: Number(e.target.value) }))}
              >
                {[1, 2, 3, 4, 5].map(d => (
                  <option key={d} value={d}>Day {d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Points</label>
              <input
                className="input"
                type="number"
                min="1"
                max="100"
                value={form.points}
                onChange={e => setForm(p => ({ ...p, points: Number(e.target.value) }))}
              />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary w-full">
            {saving ? 'Saving...' : editing ? 'Update' : 'Create Activity'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
