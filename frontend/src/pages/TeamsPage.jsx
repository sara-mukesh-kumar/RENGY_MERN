import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { Building2, Plus, Users, Trash2, UserPlus, UserMinus, Shield } from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [membersModal, setMembersModal] = useState(null); // team object
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });
  const [addForm, setAddForm] = useState({ userId: '', roleIds: [] });
  const [saving, setSaving] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teams');
      setTeams(data.teams);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const openMembers = async (team) => {
    setMembersModal(team);
    const [m, u, r] = await Promise.all([
      api.get(`/teams/${team._id}/members`),
      api.get('/users?limit=100'),
      api.get('/roles'),
    ]);
    setMembers(m.data.members);
    setAllUsers(u.data.users);
    setAllRoles(r.data.roles);
    setAddForm({ userId: '', roleIds: [] });
  };

  const createTeam = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/teams', form);
      toast.success('Team created!');
      setCreateModal(false);
      setForm({ name: '', description: '', color: COLORS[0] });
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteTeam = async (id) => {
    if (!confirm('Delete this team and all memberships?')) return;
    try {
      await api.delete(`/teams/${id}`);
      toast.success('Team deleted');
      fetchTeams();
    } catch { toast.error('Failed'); }
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!addForm.userId) return;
    setSaving(true);
    try {
      await api.post(`/teams/${membersModal._id}/members`, { userId: addForm.userId, roleIds: addForm.roleIds });
      toast.success('Member added!');
      openMembers(membersModal);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (userId) => {
    try {
      await api.delete(`/teams/${membersModal._id}/members/${userId}`);
      toast.success('Member removed');
      openMembers(membersModal);
    } catch { toast.error('Failed'); }
  };

  const updateMemberRoles = async (userId, roleIds) => {
    try {
      await api.put(`/teams/${membersModal._id}/members/${userId}/roles`, { roleIds });
      toast.success('Roles updated!');
      openMembers(membersModal);
    } catch { toast.error('Failed'); }
  };

  const nonMembers = allUsers.filter(u => !members.find(m => m.user?._id === u._id));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 size={24} className="text-cyan-400" /> Teams
          </h1>
          <p className="text-slate-400 text-sm mt-1">{teams.length} teams</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="btn-primary">
          <Plus size={16} /> New Team
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="card shimmer h-44" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team._id} className="card glass-hover group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: team.color }} />
              <div className="flex items-start justify-between mb-3 mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg"
                    style={{ background: `${team.color}30`, border: `1px solid ${team.color}40` }}>
                    {team.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{team.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Users size={11} />{team.memberCount} members
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteTeam(team._id)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              {team.description && <p className="text-sm text-slate-400 mb-4">{team.description}</p>}
              <button onClick={() => openMembers(team)} className="btn-secondary w-full text-sm justify-center !py-2">
                <Users size={14} /> Manage Members
              </button>
            </div>
          ))}
          {teams.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-500">No teams yet. Create one!</div>
          )}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Team">
        <form onSubmit={createTeam} className="space-y-4">
          <div>
            <label className="label">Team Name</label>
            <input className="input" placeholder="Team Alpha" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" placeholder="What does this team do?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button type="button" key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                  className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal open={!!membersModal} onClose={() => setMembersModal(null)} title={`Members — ${membersModal?.name}`} size="lg">
        <div className="space-y-6">
          {/* Add member */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2"><UserPlus size={14} /> Add Member</h4>
            <form onSubmit={addMember} className="space-y-3">
              <select className="input" value={addForm.userId} onChange={e => setAddForm(p => ({ ...p, userId: e.target.value }))}>
                <option value="">Select user...</option>
                {nonMembers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
              <div>
                <p className="text-xs text-slate-500 mb-2">Assign roles (optional):</p>
                <div className="flex flex-wrap gap-2">
                  {allRoles.map(r => (
                    <label key={r._id} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="rounded"
                        checked={addForm.roleIds.includes(r._id)}
                        onChange={e => setAddForm(p => ({
                          ...p,
                          roleIds: e.target.checked ? [...p.roleIds, r._id] : p.roleIds.filter(id => id !== r._id)
                        }))} />
                      <span className="text-sm text-slate-300">{r.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={saving || !addForm.userId} className="btn-primary text-sm">
                <UserPlus size={14} /> Add to Team
              </button>
            </form>
          </div>

          {/* Current members */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2"><Users size={14} /> Current Members ({members.length})</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {members.map(m => (
                <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {m.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{m.user?.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {allRoles.map(r => {
                        const hasRole = m.roles?.find(mr => mr._id === r._id);
                        return (
                          <button key={r._id}
                            onClick={() => {
                              const current = m.roles?.map(mr => mr._id) || [];
                              const updated = current.includes(r._id) ? current.filter(id => id !== r._id) : [...current, r._id];
                              updateMemberRoles(m.user._id, updated);
                            }}
                            className={`text-xs px-2 py-0.5 rounded-md border transition-all ${hasRole ? 'border-violet-500/50 bg-violet-500/20 text-violet-300' : 'border-slate-600 bg-slate-800 text-slate-500 hover:border-slate-500'}`}>
                            <Shield size={9} className="inline mr-0.5" />{r.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button onClick={() => removeMember(m.user._id)} className="btn-danger !p-1.5 !px-1.5 flex-shrink-0">
                    <UserMinus size={13} />
                  </button>
                </div>
              ))}
              {members.length === 0 && <p className="text-center text-slate-500 py-4 text-sm">No members yet</p>}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
