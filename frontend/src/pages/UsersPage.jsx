import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { Users, Search, Plus, Trash2, Mail, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const LIMIT = 10;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { search, page, limit: LIMIT } });
      setUsers(data.users);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search]);

  const createUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/auth/register', form);
      toast.success('User created!');
      setModal(false);
      setForm({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const pages = Math.ceil(total / LIMIT);
  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['from-violet-500 to-purple-700', 'from-cyan-500 to-blue-700', 'from-emerald-500 to-green-700', 'from-amber-500 to-orange-700', 'from-pink-500 to-rose-700'];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={24} className="text-violet-400" /> Users
          </h1>
          <p className="text-slate-400 text-sm mt-1">{total} total users</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={16} /> New User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-10" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Email</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Joined</th>
                <th className="px-6 py-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl shimmer" /><div className="shimmer h-4 w-32 rounded" /></div></td>
                    <td className="px-6 py-4 hidden sm:table-cell"><div className="shimmer h-4 w-40 rounded" /></td>
                    <td className="px-6 py-4 hidden md:table-cell"><div className="shimmer h-4 w-24 rounded" /></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-slate-500">No users found</td></tr>
              ) : users.map((u, i) => (
                <tr key={u._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                        {initials(u.name)}
                      </div>
                      <span className="font-medium text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Mail size={13} className="text-slate-600" />{u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar size={13} className="text-slate-600" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteUser(u._id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <span className="text-sm text-slate-500">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary !py-1.5 !px-2">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary !py-1.5 !px-2">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create New User">
        <form onSubmit={createUser} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" placeholder="Alice Smith" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="alice@example.com" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Min 6 chars" required minLength={6} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
              Create User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
