import { useState } from 'react';
import { X, Building2, CreditCard, Trash2, Plus, Loader2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserProfilePane({ user, accounts, onClose, onSuccess, darkMode, API_BASE, onLogout }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', type: 'bank' });
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this account?")) return;
    try {
      await fetch(`${API_BASE}/accounts/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-ID': user?.id }
      });
      toast.success("Account removed");
      onSuccess();
    } catch (err) {
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
    } catch (err) {
      toast.error("Failed to add account");
    } finally {
      setLoading(false);
    }
  };

  const panelBg = darkMode ? 'bg-slate-900 border-l border-slate-800 text-white' : 'bg-[#f4f6f8] text-slate-900';
  const cardBg = darkMode ? 'bg-slate-800' : 'bg-white';

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
    </>
  );
}
