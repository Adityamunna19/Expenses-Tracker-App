import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Landmark,
  NotebookPen,
  Sparkles,
  Tags,
  Vault,
  X,
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const highlightIcons = {
  'Custom categories': Tags,
  'Savings portfolio': Vault,
  'Loan buckets': Landmark,
  'Card expenses': CreditCard,
  'Merchant aliases': BadgeCheck,
  'Personal diary': NotebookPen,
};

const normalizeHighlights = (highlights) => {
  const parsedHighlights = (() => {
    if (Array.isArray(highlights)) return highlights;
    if (typeof highlights === 'string') {
      try {
        const parsed = JSON.parse(highlights);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  return parsedHighlights
    .map((item) => ({
      title: String(item?.title || '').trim(),
      description: String(item?.description || '').trim(),
    }))
    .filter((item) => item.title || item.description);
};

export default function FeatureAnnouncement({ darkMode, userId, userName }) {
  const [announcement, setAnnouncement] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadLatestAnnouncement = async () => {
      setAnnouncement(null);
      setIsOpen(false);

      if (!supabase || !userId) {
        return;
      }

      try {
        const nowIso = new Date().toISOString();

        const { data: latestAnnouncement, error: announcementError } = await supabase
          .from('announcements')
          .select('id, slug, title, summary, highlights, cta_label, cta_subtext, published_at')
          .eq('is_active', true)
          .lte('published_at', nowIso)
          .order('published_at', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (announcementError) throw announcementError;

        if (isCancelled || !latestAnnouncement) {
          return;
        }

        const { data: readRecord, error: readError } = await supabase
          .from('announcement_reads')
          .select('id')
          .eq('announcement_id', latestAnnouncement.id)
          .eq('user_id', userId)
          .maybeSingle();

        if (readError) throw readError;

        if (isCancelled) {
          return;
        }

        const nextAnnouncement = {
          ...latestAnnouncement,
          highlights: normalizeHighlights(latestAnnouncement.highlights),
        };

        setAnnouncement(nextAnnouncement);

        if (readRecord) {
          return;
        }

        setIsOpen(true);

        supabase
          .from('announcement_reads')
          .upsert(
            {
              announcement_id: latestAnnouncement.id,
              user_id: userId,
              seen_at: new Date().toISOString(),
            },
            { onConflict: 'announcement_id,user_id' }
          )
          .catch((error) => {
            console.error('Failed to mark announcement as read:', error);
          });
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load announcement:', error);
        }
      }
    };

    loadLatestAnnouncement();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  if (!isOpen || !announcement) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div
        className={`w-full max-w-4xl overflow-hidden rounded-[2.5rem] shadow-2xl ${
          darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
        }`}
      >
        <div className="relative overflow-hidden px-8 py-7 sm:px-10 sm:py-8">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-sky-600 to-emerald-500 opacity-95" />
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
          <div className="relative flex items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
                <Sparkles size={14} />
                What&apos;s new
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Welcome back{userName ? `, ${userName}` : ''}
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/85 sm:text-base">
                {announcement.summary ||
                  'We pulled the latest announcement from the database so you can see what changed right after login.'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-2xl bg-white/15 p-3 text-white transition hover:bg-white/25"
              aria-label="Close announcement"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          {announcement.highlights.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {announcement.highlights.map((item) => {
                const Icon = highlightIcons[item.title] || Sparkles;

                return (
                  <div
                    key={`${announcement.id}-${item.title || item.description}`}
                    className={`rounded-[1.75rem] border p-5 shadow-sm transition-transform hover:-translate-y-0.5 ${
                      darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 className="text-base font-black tracking-tight">{item.title}</h3>
                        <p className={`mt-1 text-sm leading-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div
            className={`mt-8 flex flex-col gap-4 rounded-[2rem] px-5 py-5 sm:flex-row sm:items-center sm:justify-between ${
              darkMode ? 'bg-slate-800' : 'bg-slate-50'
            }`}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] opacity-40">Ready when you are</p>
              <p className="mt-1 text-sm font-medium opacity-80">
                {announcement.cta_subtext ||
                  'Open the dashboard to start using the latest release update right away.'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-slate-800"
            >
              {announcement.cta_label || 'Got it'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
