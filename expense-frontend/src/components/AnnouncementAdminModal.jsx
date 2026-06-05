import { useEffect, useState } from 'react';
import {
  CalendarClock,
  Copy,
  EyeOff,
  Loader2,
  PencilLine,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';

const nowToInputValue = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const offsetMinutes = date.getTimezoneOffset();
  return new Date(date.getTime() - offsetMinutes * 60000).toISOString().slice(0, 16);
};

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const normalizeHighlightsText = (highlights) => {
  if (!Array.isArray(highlights)) return '';
  return highlights.map((item) => `${item?.title || ''} | ${item?.description || ''}`.trim()).join('\n');
};

const parseHighlightsText = (value) =>
  String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawTitle, ...rawDescriptionParts] = line.split('|');
      const title = String(rawTitle || '').trim();
      const description = String(rawDescriptionParts.join('|') || '').trim();
      return {
        title: title || 'Update',
        description: description || title || 'Update',
      };
    });

const createEmptyForm = () => ({
  slug: '',
  title: '',
  summary: '',
  highlightsText: '',
  ctaLabel: 'Got it',
  ctaSubtext: 'Open the dashboard to start using the latest update right away.',
  publishedAt: nowToInputValue(),
  isActive: true,
});

const formatPublishedAt = (value) => {
  if (!value) return 'Draft';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Draft';
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

export default function AnnouncementAdminModal({ darkMode, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm());

  const loadAnnouncements = async () => {
    if (!supabase) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, slug, title, summary, highlights, cta_label, cta_subtext, is_active, published_at, created_at')
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
      toast.error('Could not load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (announcement) => {
    setEditingId(announcement.id);
    setForm({
      slug: announcement.slug || '',
      title: announcement.title || '',
      summary: announcement.summary || '',
      highlightsText: normalizeHighlightsText(announcement.highlights),
      ctaLabel: announcement.cta_label || 'Got it',
      ctaSubtext:
        announcement.cta_subtext || 'Open the dashboard to start using the latest update right away.',
      publishedAt: nowToInputValue(announcement.published_at || announcement.created_at || new Date()),
      isActive: Boolean(announcement.is_active),
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(createEmptyForm());
  };

  const duplicateAnnouncement = (announcement) => {
    setEditingId(null);
    setForm({
      slug: announcement.slug ? `${announcement.slug}-copy` : '',
      title: announcement.title ? `${announcement.title} copy` : '',
      summary: announcement.summary || '',
      highlightsText: normalizeHighlightsText(announcement.highlights),
      ctaLabel: announcement.cta_label || 'Got it',
      ctaSubtext:
        announcement.cta_subtext || 'Open the dashboard to start using the latest update right away.',
      publishedAt: nowToInputValue(),
      isActive: false,
    });
  };

  const handleDelete = async (announcement) => {
    if (!window.confirm(`Delete "${announcement.title}"?`)) return;

    try {
      const { error } = await supabase.from('announcements').delete().eq('id', announcement.id);
      if (error) throw error;

      setAnnouncements((current) => current.filter((item) => item.id !== announcement.id));
      if (editingId === announcement.id) {
        resetForm();
      }
      toast.success('Announcement deleted');
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      toast.error('Could not delete announcement');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) {
      toast.error('Enter an announcement title');
      return;
    }

    const payload = {
      slug: form.slug.trim() || slugify(title),
      title,
      summary: form.summary.trim(),
      highlights: parseHighlightsText(form.highlightsText),
      cta_label: form.ctaLabel.trim() || 'Got it',
      cta_subtext: form.ctaSubtext.trim(),
      is_active: form.isActive,
      published_at: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(),
    };

    setSaving(true);

    try {
      const query = editingId
        ? supabase.from('announcements').update(payload).eq('id', editingId)
        : supabase.from('announcements').insert(payload);

      const { data, error } = await query.select('id, slug, title, summary, highlights, cta_label, cta_subtext, is_active, published_at, created_at').single();

      if (error) throw error;

      if (editingId) {
        setAnnouncements((current) =>
          current.map((item) => (item.id === editingId ? data : item)).sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
        );
      } else {
        setAnnouncements((current) => [data, ...current].sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)));
      }

      toast.success(editingId ? 'Announcement updated' : 'Announcement published');
      resetForm();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      toast.error(error?.message || 'Could not save announcement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-6xl overflow-hidden rounded-[2.5rem] shadow-2xl ${
          darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
        }`}
      >
        <div className="relative overflow-hidden px-8 py-7 sm:px-10 sm:py-8">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-sky-600 to-emerald-500 opacity-95" />
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
          <div className="relative flex items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
                <ShieldCheck size={14} />
                Admin only
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Announcement Manager</h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/85 sm:text-base">
                Create the next big update here. The latest active announcement is what users will see when they log in.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl bg-white/15 p-3 text-white transition hover:bg-white/25"
              aria-label="Close announcement manager"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="grid gap-8 p-8 lg:grid-cols-[1.05fr_0.95fr] sm:p-10">
          <form
            onSubmit={handleSubmit}
            className={`rounded-[2rem] border p-6 shadow-sm ${
              darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'
            }`}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black tracking-tight">
                  {editingId ? 'Edit announcement' : 'Create announcement'}
                </h3>
                <p className={`mt-1 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  Separate highlights with one line per item using <span className="font-black">Title | Description</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest transition ${
                  darkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Plus size={14} />
                New
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] opacity-40">Title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="June feature drop"
                  className={`w-full rounded-2xl border px-4 py-3 font-bold outline-none ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900 focus:border-indigo-500'
                      : 'border-slate-200 bg-white focus:border-indigo-500'
                  }`}
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] opacity-40">Slug</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
                  placeholder="june-feature-drop"
                  className={`w-full rounded-2xl border px-4 py-3 font-bold outline-none ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900 focus:border-indigo-500'
                      : 'border-slate-200 bg-white focus:border-indigo-500'
                  }`}
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] opacity-40">Published</span>
                <input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(event) => setForm({ ...form, publishedAt: event.target.value })}
                  className={`w-full rounded-2xl border px-4 py-3 font-bold outline-none ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900 focus:border-indigo-500'
                      : 'border-slate-200 bg-white focus:border-indigo-500'
                  }`}
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] opacity-40">Summary</span>
                <textarea
                  value={form.summary}
                  onChange={(event) => setForm({ ...form, summary: event.target.value })}
                  placeholder="Short intro users will read first."
                  className={`min-h-28 w-full rounded-[1.5rem] border px-4 py-3 font-medium outline-none ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900 focus:border-indigo-500'
                      : 'border-slate-200 bg-white focus:border-indigo-500'
                  }`}
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] opacity-40">Highlights</span>
                <textarea
                  value={form.highlightsText}
                  onChange={(event) => setForm({ ...form, highlightsText: event.target.value })}
                  placeholder={'Custom categories | Deepu gets Smoking and Drinking.\nSavings portfolio | Track Groww inflows and outflows.'}
                  className={`min-h-48 w-full rounded-[1.5rem] border px-4 py-3 font-medium outline-none ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900 focus:border-indigo-500'
                      : 'border-slate-200 bg-white focus:border-indigo-500'
                  }`}
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] opacity-40">CTA label</span>
                <input
                  type="text"
                  value={form.ctaLabel}
                  onChange={(event) => setForm({ ...form, ctaLabel: event.target.value })}
                  className={`w-full rounded-2xl border px-4 py-3 font-bold outline-none ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900 focus:border-indigo-500'
                      : 'border-slate-200 bg-white focus:border-indigo-500'
                  }`}
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] opacity-40">Status</span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 font-black ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <span>{form.isActive ? 'Active' : 'Draft'}</span>
                  {form.isActive ? <Sparkles size={16} /> : <EyeOff size={16} />}
                </button>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] opacity-40">CTA subtext</span>
                <textarea
                  value={form.ctaSubtext}
                  onChange={(event) => setForm({ ...form, ctaSubtext: event.target.value })}
                  className={`min-h-24 w-full rounded-[1.5rem] border px-4 py-3 font-medium outline-none ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900 focus:border-indigo-500'
                      : 'border-slate-200 bg-white focus:border-indigo-500'
                  }`}
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <PencilLine size={16} />}
                {editingId ? 'Update' : 'Publish'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-widest transition ${
                    darkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel editing
                </button>
              )}
            </div>
          </form>

          <div className="space-y-4">
            <div
              className={`rounded-[2rem] border p-5 ${
                darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <CalendarClock size={18} className="text-indigo-500" />
                <h3 className="text-lg font-black tracking-tight">Stored announcements</h3>
              </div>
              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                The newest active announcement is shown to users on login, and each one is stored in history.
              </p>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div
                  className={`flex items-center justify-center rounded-[2rem] border px-5 py-10 ${
                    darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-white'
                  }`}
                >
                  <Loader2 size={22} className="animate-spin opacity-70" />
                </div>
              ) : announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`rounded-[2rem] border p-5 shadow-sm ${
                      darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-black tracking-tight">{announcement.title}</h4>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                              announcement.is_active
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : darkMode
                                  ? 'bg-slate-800 text-slate-300'
                                  : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {announcement.is_active ? 'Active' : 'Draft'}
                          </span>
                        </div>
                        <p className={`mt-1 text-xs font-bold uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                          {announcement.slug || 'untitled'} • {formatPublishedAt(announcement.published_at || announcement.created_at)}
                        </p>
                        <p className={`mt-3 text-sm leading-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {announcement.summary || 'No summary provided.'}
                        </p>
                        <p className={`mt-3 text-xs font-bold uppercase tracking-[0.2em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {Array.isArray(announcement.highlights) ? announcement.highlights.length : 0} highlights
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(announcement)}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest ${
                          darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <PencilLine size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateAnnouncement(announcement)}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest ${
                          darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Copy size={14} />
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(announcement)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-rose-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-500 hover:text-white"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={`rounded-[2rem] border border-dashed px-5 py-10 text-center ${
                    darkMode ? 'border-slate-800 bg-slate-950/50 text-slate-300' : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  No announcements yet. Publish the first one from the form on the left.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
