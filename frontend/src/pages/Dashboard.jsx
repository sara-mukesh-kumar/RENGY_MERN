import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Users, Building2, Shield, Key, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users?limit=1'),
      api.get('/teams?limit=1'),
      api.get('/roles'),
      api.get('/roles/permissions'),
    ]).then(([u, t, r, p]) => {
      setStats({
        users: u.data.total,
        teams: t.data.total,
        roles: r.data.roles.length,
        permissions: p.data.permissions.length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats?.users, icon: Users, color: 'from-violet-500/20 to-violet-600/20', iconColor: 'text-violet-400', border: 'border-violet-500/20', to: '/users' },
    { label: 'Teams', value: stats?.teams, icon: Building2, color: 'from-cyan-500/20 to-cyan-600/20', iconColor: 'text-cyan-400', border: 'border-cyan-500/20', to: '/teams' },
    { label: 'Roles', value: stats?.roles, icon: Shield, color: 'from-amber-500/20 to-amber-600/20', iconColor: 'text-amber-400', border: 'border-amber-500/20', to: '/roles' },
    { label: 'Permissions', value: stats?.permissions, icon: Key, color: 'from-emerald-500/20 to-emerald-600/20', iconColor: 'text-emerald-400', border: 'border-emerald-500/20', to: '/permissions' },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            {user?.name?.split(' ')[0]}
          </span> 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's your TeamSync overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, iconColor, border, to }) => (
          <Link key={label} to={to} className={`card bg-gradient-to-br ${color} border ${border} glass-hover group`}>
            <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon size={20} className={iconColor} />
            </div>
            <div className="text-2xl font-bold text-white">
              {loading ? <span className="shimmer w-8 h-6 block rounded" /> : value ?? '—'}
            </div>
            <div className="text-sm text-slate-400 mt-1 flex items-center gap-1">
              {label}
              <ArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-violet-400" />
            <h2 className="font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Explore User Permissions', desc: 'Check what a user can do in a team', to: '/explorer', color: 'text-violet-400' },
              { label: 'Manage Team Members', desc: 'Add/remove users and assign roles', to: '/teams', color: 'text-cyan-400' },
              { label: 'Configure Roles', desc: 'Create roles and assign permissions', to: '/roles', color: 'text-amber-400' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                <div className={`w-2 h-2 rounded-full bg-current ${a.color}`} />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${a.color}`}>{a.label}</div>
                  <div className="text-xs text-slate-500">{a.desc}</div>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-white mb-4">How RBAC Works</h2>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Create users and teams', color: 'bg-violet-500/20 text-violet-400' },
              { step: '2', text: 'Define roles with specific permissions', color: 'bg-cyan-500/20 text-cyan-400' },
              { step: '3', text: 'Add users to teams with roles', color: 'bg-amber-500/20 text-amber-400' },
              { step: '4', text: 'Permissions are resolved per user-team pair', color: 'bg-emerald-500/20 text-emerald-400' },
            ].map(({ step, text, color }) => (
              <div key={step} className="flex items-start gap-3">
                <span className={`badge ${color} shrink-0 mt-0.5`}>{step}</span>
                <p className="text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
          <Link to="/explorer" className="btn-primary w-full justify-center mt-5 text-sm">
            Try the Permission Explorer
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
