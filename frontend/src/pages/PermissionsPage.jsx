import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { Key, Plus, Trash2 } from 'lucide-react';

const CATEGORIES = ['task', 'team', 'user', 'report'];
const CAT_COLORS = { task: 'text-violet-400 bg-violet-400/10 border-violet-400/20', team: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', user: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', report: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'task' });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/roles/permissions');
    setPermissions(data.permissions);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/roles/permissions', { ...form, name: form.name.toUpperCase().replace(/\s+/g, '_') });
      toast.success('Permission created!');
      setModal(false);
      setForm({ name: '', description: '', category: 'task' });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this permission? It will be removed from all roles.')) return;
    try {
      await api.delete(`/roles/permissions/${id}`);
      toast.success('Permission deleted');
      fetch();
    } catch { toast.error('Failed'); }
  };

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = permissions.filter(p => p.category === cat);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Key size={24} className="text-emerald-400" /> Permissions</h1>
          <p className="text-slate-400 text-sm mt-1">{permissions.length} permissions across {CATEGORIES.length} categories</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> New Permission</button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">{Array(4).fill(0).map((_, i) => <div key={i} className="card shimmer h-48" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {CATEGORIES.map(cat => (
            <div key={cat} className="card">
              <div className={`badge ${CAT_COLORS[cat]} border mb-4 capitalize font-semibold`}>
                <Key size={11} />{cat}
              </div>
              <div className="space-y-2">
                {byCategory[cat].map(p => (
                  <div key={p._id} className="perm-card flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 group hover:border-slate-600 transition-all">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${CAT_COLORS[cat].split(' ')[0].replace('text-', 'bg-')}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-white">{p.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.description}</div>
                    </div>
                    <button onClick={() => del(p._id)} className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {byCategory[cat].length === 0 && (
                  <div className="text-center py-6 text-slate-600 text-sm">No {cat} permissions</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Permission">
        <form onSubmit={create} className="space-y-4">
          <div>
            <label className="label">Permission Name</label>
            <input className="input font-mono" placeholder="CREATE_TASK" required value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <p className="text-xs text-slate-600 mt-1">Will be uppercased and underscored automatically</p>
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" placeholder="What does this permission allow?" required value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(c => (
                <button type="button" key={c} onClick={() => setForm(p => ({ ...p, category: c }))}
                  className={`py-2.5 px-3 rounded-xl border text-sm capitalize transition-all ${form.category === c ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
