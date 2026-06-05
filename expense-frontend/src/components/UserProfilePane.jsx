import { useEffect, useState } from 'react';
import { X, Building2, CreditCard, Trash2, Plus, Loader2, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import AnnouncementAdminModal from './AnnouncementAdminModal';

export default function UserProfilePane({
  user,
  accounts,
  onClose,
  onSuccess,
  darkMode,
  API_BASE,
  onLogout,
  categoryPreferences = { expenseCustom: [], incomeCustom: [] },
  onAddCategory,
  onRemoveCategory,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', type: 'bank' });
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categoryScope, setCategoryScope] = useState('expense');
  const [isAnnouncementAdmin, setIsAnnouncementAdmin] = useState(false);
  const [checkingAnnouncementAdmin, setCheckingAnnouncementAdmin] = useState(true);
  const [isAnnouncementManagerOpen, setIsAnnouncementManagerOpen] = useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this account?")) return;
    try {
      await fetch(`${API_BASE}/accounts/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-ID': user?.id }
      });
      toast.success("Account removed");
      onSuccess();
    } catch {
      toast.error("Failed to delete account");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newAcc.name) return toast.error("Enter an account name");
    
    setLoading(true);
    try {
      await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-ID': user?.id },
        body: JSON.stringify({
          name: newAcc.name,
          type: newAcc.type,
          user_id: user?.id,
          is_primary: accounts.length === 0 
        })
      });
      toast.success("Account added!");
      setNewAcc({ name: '', type: 'bank' });
      setIsAdding(false);
      onSuccess();
    } catch {
      toast.error("Failed to add account");
    } finally {
      setLoading(false);
    }
  };

  const panelBg = darkMode ? 'bg-slate-900 border-l border-slate-800 text-white' : 'bg-[#f4f6f8] text-slate-900';
  const cardBg = darkMode ? 'bg-slate-800' : 'bg-white';
  const expenseCustomCategories = categoryPreferences?.expenseCustom || [];
  const incomeCustomCategories = categoryPreferences?.incomeCustom || [];
  const firstName = user?.user_metadata?.first_name || '';

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return toast.error('Enter a category name');

    onAddCategory?.(categoryScope, newCategory.trim());
    setNewCategory('');
  };

  useEffect(() => {
    let isCancelled = false;

    const checkAnnouncementAdmin = async () => {
      if (!user?.id || !supabase) {
        setIsAnnouncementAdmin(false);
        setCheckingAnnouncementAdmin(false);
        return;
      }

      setCheckingAnnouncementAdmin(true);

      try {
        const { data, error } = await supabase.rpc('is_announcement_admin');
        if (error) throw error;
        if (!isCancelled) {
          setIsAnnouncementAdmin(Boolean(data));
        }
      } catch (error) {
        console.error('Failed to check announcement admin access:', error);
        if (!isCancelled) {
          setIsAnnouncementAdmin(false);
        }
      } finally {
        if (!isCancelled) {
          setCheckingAnnouncementAdmin(false);
        }
      }
    };

    checkAnnouncementAdmin();

    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  const handleClaimAnnouncementAdmin = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase.rpc('claim_announcement_admin');
      if (error) throw error;
      if (data) {
        setIsAnnouncementAdmin(true);
        toast.success('Announcement admin access claimed');
      }
    } catch (error) {
      console.error('Failed to claim announcement admin access:', error);
      toast.error(error?.message || 'Could not claim announcement access');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Sliding Pane */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-[200] shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto ${panelBg}`}>
        
        <div className="p-8 pb-4 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
          <h2 className="text-2xl font-black tracking-tight">Pilot Profile</h2>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 pt-4 space-y-10">
          
          {/* User Info Section */}
          <div className={`p-6 rounded-[2rem] shadow-lg flex items-center gap-5 ${cardBg}`}>
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-inner uppercase">
              {user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0) || 'P'}
            </div>
            <div>
              <h3 className="text-xl font-black">
                {user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : 'Captain'}
              </h3>
              <p className="text-xs font-bold opacity-50">{user?.email || 'No email provided'}</p>
            </div>
          </div>

          {/* Accounts Management Section */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-lg font-black uppercase tracking-widest opacity-40">Connected Wallets</h3>
              {!isAdding && (
                <button onClick={() => setIsAdding(true)} className="text-xs font-black text-indigo-600 flex items-center gap-1 hover:opacity-70">
                  <Plus size={14}/> Add New
                </button>
              )}
            </div>

            <div className="space-y-4">
              {accounts.map(acc => (
                <div key={acc.id} className={`p-5 rounded-2xl flex justify-between items-center shadow-sm border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all ${cardBg}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${acc.type === 'card' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {acc.type === 'card' ? <CreditCard size={20} /> : <Building2 size={20} />}
                    </div>
                    <div>
                      <p className="font-black text-sm">{acc.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{acc.type === 'card' ? 'Credit Card' : 'Bank Account'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(acc.id)} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {accounts.length === 0 && !isAdding && (
                <div className="text-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl opacity-50 font-bold text-sm">
                  No accounts linked.
                </div>
              )}

              {/* Add New Account Form */}
              {isAdding && (
                <form onSubmit={handleAdd} className={`p-5 rounded-2xl border-2 border-indigo-500/30 animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-indigo-950/20' : 'bg-indigo-50'}`}>
                  <div className="flex gap-3 mb-4">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="e.g. ICICI Bank" 
                      value={newAcc.name}
                      onChange={(e) => setNewAcc({...newAcc, name: e.target.value})}
                      className={`flex-1 p-3 rounded-xl text-sm font-bold outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                    />
                    <select 
                      value={newAcc.type} 
                      onChange={(e) => setNewAcc({...newAcc, type: e.target.value})}
                      className={`p-3 rounded-xl text-sm font-bold outline-none border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                    >
                      <option value="bank">Bank</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsAdding(false)} 
                      className="flex-1 py-3 text-xs font-black text-slate-500 bg-slate-200 dark:bg-slate-800 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="flex-1 py-3 text-xs font-black text-white bg-indigo-600 rounded-xl flex justify-center items-center"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : 'Save Account'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Custom Categories Section */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-lg font-black uppercase tracking-widest opacity-40">Personal Categories</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Per user</p>
            </div>

            <form onSubmit={handleAddCategory} className={`p-5 rounded-2xl border-2 border-indigo-500/20 mb-5 ${darkMode ? 'bg-indigo-950/20' : 'bg-indigo-50'}`}>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  placeholder="e.g. Weekend Trip"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={`flex-1 p-3 rounded-xl text-sm font-bold outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                />
                <select
                  value={categoryScope}
                  onChange={(e) => setCategoryScope(e.target.value)}
                  className={`p-3 rounded-xl text-sm font-bold outline-none border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 text-xs font-black text-white bg-indigo-600 rounded-xl flex justify-center items-center gap-2"
              >
                <Plus size={14} />
                Save Category
              </button>
            </form>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mb-3">Expense Custom</p>
                <div className="flex flex-wrap gap-2">
                  {expenseCustomCategories.length > 0 ? (
                    expenseCustomCategories.map((category) => (
                      <span key={category} className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-black ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                        {category}
                        <button
                          type="button"
                          onClick={() => onRemoveCategory?.('expense', category)}
                          className="text-rose-500 hover:text-rose-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs font-bold opacity-40">No custom expense categories yet.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mb-3">Income Custom</p>
                <div className="flex flex-wrap gap-2">
                  {incomeCustomCategories.length > 0 ? (
                    incomeCustomCategories.map((category) => (
                      <span key={category} className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-black ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                        {category}
                        <button
                          type="button"
                          onClick={() => onRemoveCategory?.('income', category)}
                          className="text-rose-500 hover:text-rose-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs font-bold opacity-40">No custom income categories yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Announcement Admin Section */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-lg font-black uppercase tracking-widest opacity-40">Announcements</h3>
              {checkingAnnouncementAdmin ? (
                <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40">Checking</span>
              ) : isAnnouncementAdmin ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">
                  <ShieldCheck size={12} />
                  Admin
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-30">Locked</span>
              )}
            </div>

            <div className={`p-5 rounded-2xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
              {isAnnouncementAdmin ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="font-black">Publish announcements</p>
                      <p className="text-xs font-medium opacity-60">
                        Create the next login popup and keep the announcement history in Supabase.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnnouncementManagerOpen(true)}
                    className="w-full py-3 text-xs font-black text-white bg-indigo-600 rounded-xl flex justify-center items-center gap-2"
                  >
                    <Plus size={14} />
                    Manage Announcements
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="font-black">Claim announcement admin</p>
                      <p className="text-xs font-medium opacity-60">
                        Claim the single publishing account for announcements.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClaimAnnouncementAdmin}
                    className="w-full py-3 text-xs font-black text-white bg-slate-900 rounded-xl flex justify-center items-center gap-2"
                  >
                    <ShieldCheck size={14} />
                    Claim access
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* LOGOUT BUTTON - Moved here from App.jsx */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => {
                onLogout();
                onClose(); // Close the profile pane after initiating logout
              }}
              className="w-full py-4 flex items-center justify-center gap-3 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all border-2 border-rose-500/20 hover:border-rose-500"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>

        </div>
      </div>

      {isAnnouncementManagerOpen && (
        <AnnouncementAdminModal
          darkMode={darkMode}
          onClose={() => setIsAnnouncementManagerOpen(false)}
        />
      )}
    </>
  );
}
