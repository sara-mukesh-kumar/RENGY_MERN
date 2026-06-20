import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { Shield, Plus, Key, Trash2, Edit2, CheckSquare } from 'lucide-react';

const COLORS = ['#ef4444','#f59e0b','#3b82f6','#6b7280','#8b5cf6','#10b981','#ec4899'];

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[4], permissionIds: [] });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [r, p] = await Promise.all([api.get('/roles'), api.get('/roles/permissions')]);
    setRoles(r.data.roles);
    setPermissions(p.data.permissions);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const togglePerm = (id) => setForm(f => ({
    ...f,
    permissionIds: f.permissionIds.includes(id) ? f.permissionIds.filter(x => x !== id) : [...f.permissionIds, id]
  }));

  const createRole = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/roles', { name: form.name, description: form.description, color: form.color });
      if (form.permissionIds.length) {
        await api.put(`/roles/${data.role._id}/permissions`, { permissionIds: form.permissionIds });
      }
      toast.success('Role created!');
      setModal(false);
      setForm({ name: '', description: '', color: COLORS[4], permissionIds: [] });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (role) => {
    setEditModal(role);
    setForm({ name: role.name, description: role.description, color: role.color, permissionIds: role.permissions.map(p => p._id) });
  };

  const updateRole = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/roles/${editModal._id}`, { name: form.name, description: form.description, color: form.color });
      await api.put(`/roles/${editModal._id}/permissions`, { permissionIds: form.permissionIds });
      toast.success('Role updated!');
      setEditModal(null);
      fetch();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const deleteRole = async (id) => {
    if (!confirm('Delete this role?')) return;
    try {
      await api.delete(`/roles/${id}`);
      toast.success('Role deleted');
      fetch();
    } catch { toast.error('Failed'); }
  };

  const byCategory = permissions.reduce((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  const RoleForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Role Name</label>
        <input className="input" placeholder="Admin" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div>
        <label className="label">Description</label>
        <input className="input" placeholder="What can this role do?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      </div>
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button type="button" key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
              className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <div>
        <label className="label flex items-center gap-2"><Key size={14} /> Permissions</label>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {Object.entries(byCategory).map(([cat, perms]) => (
            <div key={cat}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{cat}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {perms.map(p => (
                  <label key={p._id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border
                    ${form.permissionIds.includes(p._id) ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                    <input type="checkbox" className="hidden" checked={form.permissionIds.includes(p._id)} onChange={() => togglePerm(p._id)} />
                    <CheckSquare size={13} className={form.permissionIds.includes(p._id) ? 'text-violet-400' : 'text-slate-600'} />
                    <span className="text-xs font-mono">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => { setModal(false); setEditModal(null); }} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
          {editModal ? 'Update' : 'Create'} Role
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield size={24} className="text-amber-400" /> Roles</h1>
          <p className="text-slate-400 text-sm mt-1">{roles.length} roles defined</p>
        </div>
        <button onClick={() => { setForm({ name: '', description: '', color: COLORS[4], permissionIds: [] }); setModal(true); }} className="btn-primary">
          <Plus size={16} /> New Role
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="card shimmer h-52" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <div key={role._id} className="card glass-hover group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: role.color }} />
              <div className="flex items-start justify-between mb-3 mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${role.color}20`, border: `1px solid ${role.color}40` }}>
                    <Shield size={14} style={{ color: role.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{role.name}</h3>
                    <p className="text-xs text-slate-500">{role.permissions.length} permissions</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEdit(role)} className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-400/10"><Edit2 size={13} /></button>
                  <button onClick={() => deleteRole(role._id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10"><Trash2 size={13} /></button>
                </div>
              </div>
              {role.description && <p className="text-xs text-slate-400 mb-3">{role.description}</p>}
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map(p => (
                  <span key={p._id} className="badge bg-slate-800 text-slate-400 border border-slate-700 font-mono text-[10px]">
                    {p.name}
                  </span>
                ))}
                {role.permissions.length === 0 && <span className="text-xs text-slate-600 italic">No permissions</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Create Role" size="md">
        <RoleForm onSubmit={createRole} />
      </Modal>
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit Role — ${editModal?.name}`} size="md">
        <RoleForm onSubmit={updateRole} />
      </Modal>
    </div>
  );
}
