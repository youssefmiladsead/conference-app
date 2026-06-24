// src/pages/ConferencesPage.jsx
import { useState } from 'react';
import { useConference } from '../context/ConferenceContext';
import { createConference, archiveConference, seedDefaultActivities } from '../lib/firestore';
import Modal from '../components/common/Modal';
import { useToast, ToastContainer } from '../components/common/Toast';

export default function ConferencesPage() {
  const { conferences, setActiveConference, reload } = useConference();
  const { toasts, toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', year: new Date().getFullYear().toString() });
  const [saving, setSaving] = useState(false);
  const [seedNew, setSeedNew] = useState(true);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const id = await createConference({ name: form.name, year: form.year });
      if (seedNew) {
        await seedDefaultActivities(id);
      }
      await reload();
      toast(`Conference "${form.name}" created!`, 'success');
      setShowModal(false);
      setForm({ name: '', year: new Date().getFullYear().toString() });
    } catch {
      toast('Failed to create conference', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (conf) => {
    if (!confirm(`Archive "${conf.name} ${conf.year}"? It won't appear as active anymore.`)) return;
    try {
      await archiveConference(conf.id);
      await reload();
      toast('Conference archived', 'success');
    } catch {
      toast('Failed to archive', 'error');
    }
  };

  const active = conferences.filter(c => !c.archived);
  const archived = conferences.filter(c => c.archived);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <ToastContainer toasts={toasts} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Conferences</h1>
          <p className="text-gray-400 text-xs">Manage yearly conferences</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm py-2 px-4">+ New</button>
      </div>

      {/* Active */}
      {active.length > 0 && (
        <>
          <h2 className="section-title">Active</h2>
          <div className="space-y-3 mb-6">
            {active.map(conf => (
              <div key={conf.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-lg">{conf.name}</h3>
                    <p className="text-gray-400">{conf.year}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => { setActiveConference(conf); toast(`Now using: ${conf.name}`, 'success'); }}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Set Active
                    </button>
                    <button
                      onClick={() => handleArchive(conf)}
                      className="text-gray-400 hover:text-amber-400 text-xs transition-colors"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Archived */}
      {archived.length > 0 && (
        <>
          <h2 className="text-base font-semibold text-gray-500 mb-3">Archived</h2>
          <div className="space-y-2">
            {archived.map(conf => (
              <div key={conf.id} className="card opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{conf.name}</h3>
                    <p className="text-gray-500 text-sm">{conf.year}</p>
                  </div>
                  <span className="badge bg-gray-800 text-gray-400">Archived</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {conferences.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🏛️</p>
          <p className="text-gray-400 mb-4">No conferences yet</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Create First Conference</button>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Conference">
        <div className="space-y-4">
          <div>
            <label className="label">Conference Name</label>
            <input
              className="input"
              placeholder="e.g. Summer Youth Conference"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Year</label>
            <input
              className="input"
              type="number"
              value={form.year}
              onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
            <input
              type="checkbox"
              id="seed"
              checked={seedNew}
              onChange={e => setSeedNew(e.target.checked)}
              className="w-4 h-4 accent-brand-500"
            />
            <label htmlFor="seed" className="text-gray-300 text-sm">
              Add default activities automatically
            </label>
          </div>
          <button onClick={handleCreate} disabled={saving || !form.name} className="btn-primary w-full">
            {saving ? 'Creating...' : '✝️ Create Conference'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
