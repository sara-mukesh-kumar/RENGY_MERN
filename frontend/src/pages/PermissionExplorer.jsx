import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Search, Users, Building2, Shield, Key, Zap, AlertCircle, ChevronRight } from 'lucide-react';

const CAT_COLORS = {
  task: { bg: 'bg-violet-500/15', border: 'border-violet-500/30', text: 'text-violet-300', dot: 'bg-violet-400', glow: 'shadow-violet-500/20' },
  team: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-300', dot: 'bg-cyan-400', glow: 'shadow-cyan-500/20' },
  user: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400', glow: 'shadow-emerald-500/20' },
  report: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-300', dot: 'bg-amber-400', glow: 'shadow-amber-500/20' },
};

export default function PermissionExplorer() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  useEffect(() => {
    Promise.all([api.get('/users?limit=100'), api.get('/teams?limit=100')]).then(([u, t]) => {
      setUsers(u.data.users);
      setTeams(t.data.teams);
    }).finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (!selectedUser || !selectedTeam) { setResult(null); return; }
    setLoading(true);
    api.get(`/teams/${selectedTeam}/members/${selectedUser}/permissions`)
      .then(r => setResult(r.data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [selectedUser, selectedTeam]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()));

  const byCategory = result?.permissions?.reduce((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {}) || {};

  const selectedUserObj = users.find(u => u._id === selectedUser);
  const selectedTeamObj = teams.find(t => t._id === selectedTeam);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search size={24} className="text-violet-400" /> Permission Explorer
        </h1>
        <p className="text-slate-400 text-sm mt-1">Select a user and team to see their effective permissions</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* User selector */}
        <div className="card space-y-3">
          <label className="label flex items-center gap-2"><Users size={14} /> Select User</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-9 text-sm py-2" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {fetching ? Array(4).fill(0).map((_, i) => <div key={i} className="shimmer h-12 rounded-xl" />) :
              filteredUsers.map(u => (
                <button key={u._id} onClick={() => setSelectedUser(u._id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
                    ${selectedUser === u._id ? 'bg-violet-500/20 border border-violet-500/40' : 'hover:bg-white/5 border border-transparent'}`}>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{u.name}</div>
                    <div className="text-xs text-slate-500 truncate">{u.email}</div>
                  </div>
                  {selectedUser === u._id && <ChevronRight size={14} className="text-violet-400 flex-shrink-0" />}
                </button>
              ))
            }
          </div>
        </div>

        {/* Team selector */}
        <div className="card space-y-3">
          <label className="label flex items-center gap-2"><Building2 size={14} /> Select Team</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-9 text-sm py-2" placeholder="Search teams..." value={teamSearch} onChange={e => setTeamSearch(e.target.value)} />
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {fetching ? Array(4).fill(0).map((_, i) => <div key={i} className="shimmer h-12 rounded-xl" />) :
              filteredTeams.map(t => (
                <button key={t._id} onClick={() => setSelectedTeam(t._id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
                    ${selectedTeam === t._id ? 'border' : 'hover:bg-white/5 border border-transparent'}`}
                  style={selectedTeam === t._id ? { background: `${t.color}15`, borderColor: `${t.color}40` } : {}}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                    style={{ background: t.color }}>
                    {t.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.memberCount} members</div>
                  </div>
                  {selectedTeam === t._id && <ChevronRight size={14} style={{ color: t.color }} className="flex-shrink-0" />}
                </button>
              ))
            }
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="card flex items-center justify-center gap-3 py-12">
          <span className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
          <span className="text-slate-400">Resolving permissions...</span>
        </div>
      )}

      {!loading && result && (
        <div className="animate-slide-up">
          {/* User + Team summary */}
          <div className="card mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-white">
                  {selectedUserObj?.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{selectedUserObj?.name}</div>
                  <div className="text-xs text-slate-500">{selectedUserObj?.email}</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-600" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                  style={{ background: selectedTeamObj?.color }}>
                  {selectedTeamObj?.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{selectedTeamObj?.name}</div>
                  <div className="text-xs text-slate-500">Team</div>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Zap size={16} className="text-violet-400" />
                <span className="text-sm font-medium text-violet-300">{result.permissions?.length || 0} effective permissions</span>
              </div>
            </div>
          </div>

          {/* Roles */}
          {result.roles?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-slate-500 flex items-center gap-1"><Shield size={13} /> Roles:</span>
              {result.roles.map(r => (
                <span key={r._id} className="badge border text-sm font-medium px-3 py-1"
                  style={{ background: `${r.color}20`, borderColor: `${r.color}40`, color: r.color }}>
                  {r.name}
                </span>
              ))}
            </div>
          )}

          {/* Not a member */}
          {result.message && (
            <div className="card flex items-center gap-3 text-amber-400 border border-amber-500/20 bg-amber-500/5">
              <AlertCircle size={18} />
              <div>
                <div className="font-medium">{result.message}</div>
                <div className="text-sm text-slate-400">This user has no permissions in this team.</div>
              </div>
            </div>
          )}

          {/* Permission cards by category */}
          {result.permissions?.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(byCategory).map(([cat, perms]) => {
                const style = CAT_COLORS[cat] || CAT_COLORS.task;
                return (
                  <div key={cat} className={`card ${style.bg} border ${style.border}`}>
                    <div className={`badge ${style.bg} border ${style.border} ${style.text} mb-4 capitalize font-semibold`}>
                      <Key size={11} />{cat} permissions
                    </div>
                    <div className="space-y-2">
                      {perms.map(p => (
                        <div key={p._id} className={`perm-card flex items-start gap-3 p-3 rounded-xl bg-black/20 border ${style.border} shadow-lg ${style.glow}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${style.dot} flex-shrink-0`} />
                          <div>
                            <div className={`font-mono text-sm font-medium ${style.text}`}>{p.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{p.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {result.permissions?.length === 0 && !result.message && (
            <div className="card text-center py-10 text-slate-500">
              <Shield size={32} className="mx-auto mb-3 opacity-30" />
              <p>No permissions — this user has roles with no permissions assigned.</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !result && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-violet-400 opacity-60" />
          </div>
          <h3 className="font-semibold text-white mb-2">Select a user and team</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Choose a user and a team to see what permissions they have based on their assigned roles.
          </p>
        </div>
      )}
    </div>
  );
}
