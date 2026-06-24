// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';
import { registerParticipant } from '../lib/firestore';
import QRCode from '../components/common/QRCode';
import { useToast, ToastContainer } from '../components/common/Toast';

export default function RegisterPage() {
  const { activeConference } = useConference();
  const navigate = useNavigate();
  const { toasts, toast } = useToast();

  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast('Please fill in all fields', 'error');
      return;
    }
    if (!activeConference) {
      toast('No active conference found', 'error');
      return;
    }

    setLoading(true);
    try {
      const userId = await registerParticipant(activeConference.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      setRegistered({ userId, name: form.name.trim() });
      toast('Registration successful! 🎉', 'success');
    } catch (err) {
      toast('Registration failed. Try again.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQR = () => {
    const canvas = document.querySelector('#qr-save canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${registered.userId}.png`;
    a.click();
    setSaved(true);
    toast('QR Code saved!', 'success');
  };

  const handleViewProfile = () => {
    navigate(`/profile/${registered.userId}?conf=${activeConference.id}`);
  };

  if (registered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <ToastContainer toasts={toasts} />

        <div className="w-full max-w-sm animate-fade-in">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-ring">
              <span className="text-3xl">✝️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome, {registered.name}!</h1>
            <p className="text-gray-400 text-sm">Your registration is complete</p>
          </div>

          {/* QR Card */}
          <div className="card text-center mb-4">
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-4">Your QR Code</p>
            <div id="qr-save">
              <QRCode value={registered.userId} size={200} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-xs mt-3 font-mono">{registered.userId}</p>

            <div className="border-t border-gray-800 mt-4 pt-4">
              <p className="text-gray-400 text-xs leading-relaxed">
                Show this QR code to admins during the conference to mark your attendance and earn points.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button onClick={handleSaveQR} className="btn-primary w-full flex items-center justify-center gap-2">
              <span>⬇️</span>
              {saved ? 'Saved!' : 'Save QR Code'}
            </button>
            <button onClick={handleViewProfile} className="btn-secondary w-full flex items-center justify-center gap-2">
              <span>👤</span>
              View My Profile
            </button>
            <button
              onClick={() => { setRegistered(null); setForm({ name: '', phone: '' }); setSaved(false); }}
              className="text-gray-500 text-sm py-2 hover:text-gray-300 transition-colors"
            >
              Register another participant
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <ToastContainer toasts={toasts} />

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✝️</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {activeConference?.name || 'Church Conference'}
          </h1>
          <p className="text-gray-400 mt-1">
            {activeConference?.year || new Date().getFullYear()}
          </p>
        </div>

        {!activeConference ? (
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">🏛️</p>
            <p className="text-gray-400">No active conference. Check back soon!</p>
          </div>
        ) : (
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-1">Register</h2>
            <p className="text-gray-400 text-sm mb-6">Join the conference and get your QR code</p>

            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  className="input"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  className="input"
                  type="tel"
                  placeholder="+20 100 000 0000"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !form.name || !form.phone}
                className="btn-primary w-full mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </span>
                ) : 'Register & Get QR Code'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-gray-600 text-xs mt-6">
          Already registered?{' '}
          <button onClick={() => navigate('/leaderboard')} className="text-brand-400 hover:text-brand-300">
            View leaderboard
          </button>
        </p>
      </div>
    </div>
  );
}
