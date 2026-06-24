// src/components/layout/Layout.jsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConference } from '../../context/ConferenceContext';

const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a7 7 0 100 14A7 7 0 0011 4zM20 20l-4.35-4.35" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4M5 3H3a2 2 0 00-2 2v3a4 4 0 004 4h1m10-9h2a2 2 0 012 2v3a4 4 0 01-4 4h-1M5 3h14l-1 9a5 5 0 01-5 5h0a5 5 0 01-5-5L5 3z" />
  </svg>
);

const ScanIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const DashIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const PeopleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const RegisterIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

export default function Layout({ admin }) {
  const { user } = useAuth();
  const { activeConference } = useConference();
  const location = useLocation();
  const navigate = useNavigate();

  const publicNav = [
    { path: '/', label: 'Register', icon: <RegisterIcon /> },
    { path: '/leaderboard', label: 'Rankings', icon: <TrophyIcon /> },
  ];

  const adminNav = [
    { path: '/admin', label: 'Dashboard', icon: <DashIcon /> },
    { path: '/admin/scanner', label: 'Scan', icon: <ScanIcon />, highlight: true },
    { path: '/admin/participants', label: 'People', icon: <PeopleIcon /> },
    { path: '/leaderboard', label: 'Rankings', icon: <TrophyIcon /> },
  ];

  const nav = user ? adminNav : publicNav;

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Conference Banner */}
      {activeConference && (
        <div className="bg-brand-600/20 border-b border-brand-500/20 px-4 py-1.5 text-center">
          <p className="text-brand-300 text-xs font-medium tracking-wide">
            ✝️ {activeConference.name} {activeConference.year}
          </p>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 safe-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {nav.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all min-w-[60px] ${
                  item.highlight
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 -mt-2 py-3 px-4'
                    : active
                    ? 'text-brand-400'
                    : 'text-gray-500'
                }`}
              >
                {item.icon}
                <span className={`text-[10px] font-medium ${item.highlight ? 'text-white' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
