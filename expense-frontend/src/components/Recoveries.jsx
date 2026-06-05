import { Undo2, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { resolveMerchantName } from '../utils/financeConfig';

export default function Recoveries({ transactions, onSuccess, darkMode, API_BASE, headers }) {
  // Filter for debits that are meant to be recovered but haven't been yet
  const pendingRecoveries = transactions.filter(t => t.is_recovery && !t.is_recovered && t.type === 'debit');

  const handleResolve = async (id) => {
    const loadingToast = toast.loading("Resolving recovery...");
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}/resolve-recovery`, {
        method: 'PUT',
        headers
      });
      if (!res.ok) throw new Error("Failed to resolve");
      
      toast.success("Funds Recovered & Added to Income!", { id: loadingToast });
      onSuccess(); // Refresh all data in App.jsx
    } catch {
      toast.error("Error resolving recovery", { id: loadingToast });
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl"><Undo2 size={28}/></div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">Active Recoveries</h2>
          <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Money owed to you</p>
        </div>
      </div>

      <div className="space-y-4">
        {pendingRecoveries.length === 0 ? (
          <div className="py-20 text-center font-black opacity-30 text-xl uppercase italic tracking-widest border-4 border-dashed rounded-[3rem]">No pending recoveries</div>
        ) : (
          pendingRecoveries.map(t => {
            const isOverdue = new Date(t.expected_recovery_date) < new Date();
            
            return (
              <div key={t.id} className={`p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-transparent'}`}>
                <div>
                  <h3 className="text-xl font-black">{resolveMerchantName(t.title)}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-rose-500 font-black text-lg">₹{t.amount.toLocaleString()}</span>
                    {t.expected_recovery_date && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Clock size={12}/> Due: {new Date(t.expected_recovery_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleResolve(t.id)}
                  className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} /> Mark Recovered
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
