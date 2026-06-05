import { useEffect, useState } from 'react';
import { Loader2, NotebookPen, PencilLine, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import { formatStoredDate } from '../utils';

const getStorageKey = (userId) => `money-cockpit:notes:${userId || 'guest'}`;

export default function DiarySection({ user, darkMode }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const persistLocalNotes = (nextNotes) => {
    if (typeof window === 'undefined' || !user?.id) return;
    window.localStorage.setItem(getStorageKey(user.id), JSON.stringify(nextNotes));
  };

  const loadLocalNotes = () => {
    if (typeof window === 'undefined' || !user?.id) return [];
    try {
      const raw = window.localStorage.getItem(getStorageKey(user.id));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const syncNotes = async () => {
    if (!user?.id) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error('Supabase unavailable');

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const nextNotes = Array.isArray(data) ? data : [];
      setNotes(nextNotes);
      persistLocalNotes(nextNotes);
    } catch {
      setNotes(loadLocalNotes());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setFormData({
      title: note.title || '',
      content: note.content || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this diary entry?')) return;

    try {
      if (supabase && user?.id) {
        const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id);
        if (error) throw error;
      }

      const nextNotes = notes.filter((note) => note.id !== id);
      setNotes(nextNotes);
      persistLocalNotes(nextNotes);

      if (editingId === id) resetForm();
      toast.success('Diary entry removed');
    } catch {
      const nextNotes = notes.filter((note) => note.id !== id);
      setNotes(nextNotes);
      persistLocalNotes(nextNotes);
      if (editingId === id) resetForm();
      toast.success('Diary entry removed locally');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    const title = formData.title.trim() || 'Diary entry';
    const content = formData.content.trim();
    if (!content) return toast.error('Write something in your diary first');

    setSaving(true);
    const now = new Date().toISOString();

    try {
      const payload = {
        user_id: user.id,
        title,
        content,
        updated_at: now,
      };

      let savedNote = null;

      if (supabase) {
        if (editingId) {
          const { data, error } = await supabase
            .from('notes')
            .update(payload)
            .eq('id', editingId)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) throw error;
          savedNote = data;
        } else {
          const { data, error } = await supabase
            .from('notes')
            .insert({ ...payload, created_at: now })
            .select()
            .single();

          if (error) throw error;
          savedNote = data;
        }
      } else {
        const localNote = editingId
          ? {
              id: editingId,
              user_id: user.id,
              title,
              content,
              updated_at: now,
              created_at: notes.find((note) => note.id === editingId)?.created_at || now,
            }
          : {
              id: `note-${Date.now()}`,
              user_id: user.id,
              title,
              content,
              created_at: now,
              updated_at: now,
            };

        savedNote = localNote;
      }

      const nextNotes = editingId
        ? notes.map((note) => (note.id === editingId ? savedNote : note))
        : [savedNote, ...notes];

      setNotes(nextNotes);
      persistLocalNotes(nextNotes);
      resetForm();
      toast.success(editingId ? 'Diary entry updated' : 'Diary entry saved');
    } catch {
      const fallbackNote = editingId
        ? {
            id: editingId,
            user_id: user.id,
            title,
            content,
            updated_at: now,
            created_at: notes.find((note) => note.id === editingId)?.created_at || now,
          }
        : {
            id: `note-${Date.now()}`,
            user_id: user.id,
            title,
            content,
            created_at: now,
            updated_at: now,
          };

      const nextNotes = editingId
        ? notes.map((note) => (note.id === editingId ? fallbackNote : note))
        : [fallbackNote, ...notes];

      setNotes(nextNotes);
      persistLocalNotes(nextNotes);
      resetForm();
      toast.success(editingId ? 'Diary entry updated locally' : 'Diary entry saved locally');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`mt-10 p-8 rounded-[3rem] shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500">
          <NotebookPen size={28} />
        </div>
        <div>
          <h3 className="text-3xl font-black tracking-tight uppercase">Personal Diary</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Private notes saved per user</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8">
        <form onSubmit={handleSubmit} className={`p-6 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="mb-5">
            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="How was your day?"
              className={`w-full px-4 py-3 rounded-xl border outline-none font-bold ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-amber-500 text-white' : 'bg-white border-slate-200 focus:border-amber-500 text-slate-900'}`}
            />
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Entry</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Capture thoughts, reminders, wins, or anything you want to remember..."
              className={`w-full min-h-[220px] px-4 py-4 rounded-[1.5rem] border outline-none font-medium resize-none ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-amber-500 text-white' : 'bg-white border-slate-200 focus:border-amber-500 text-slate-900'}`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 rounded-2xl bg-amber-500 text-white font-black uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {editingId ? 'Update Entry' : 'Save Entry'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className={`py-4 px-6 rounded-2xl font-black uppercase tracking-widest ${darkMode ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center rounded-[2.5rem] border-2 border-dashed opacity-40 font-black uppercase tracking-widest">
              Syncing diary...
            </div>
          ) : notes.length === 0 ? (
            <div className="py-20 text-center rounded-[2.5rem] border-2 border-dashed opacity-40 font-black uppercase tracking-widest">
              No notes yet
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`p-5 rounded-[2rem] border shadow-sm transition-all hover:shadow-md ${darkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-100'}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h4 className="font-black text-lg truncate">{note.title || 'Diary entry'}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                      {formatStoredDate(note.created_at || note.updated_at, { year: false })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(note)}
                      className={`p-2 rounded-xl ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                      <PencilLine size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className={`text-sm leading-6 whitespace-pre-wrap ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {note.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
