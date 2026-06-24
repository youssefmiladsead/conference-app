// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/common/Toast';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toasts, toast } = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/admin');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin');
    } catch (err) {
      toast('Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <ToastContainer toasts={toasts} />

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-gray-400 text-sm mt-1">Conference management portal</p>
        </div>

        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="admin@church.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                disabled={loading}
                onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !form.email || !form.password}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </div>
        </div>

        <button onClick={() => navigate('/')} className="w-full text-center text-gray-500 text-sm mt-4 py-2 hover:text-gray-300 transition-colors">
          ← Back to registration
        </button>
      </div>
    </div>
  );
}
