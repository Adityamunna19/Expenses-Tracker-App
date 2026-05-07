import { useState } from 'react';
import { X, Loader2, Landmark, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddLoanModal({ user, onClose, onSuccess, darkMode, API_BASE, accounts = [] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loanCategories = [
    "Personal Loan",
    "Gold Loan",
    "Education Loan",
    "Home Loan",
    "Vehicle Loan",
    "Credit Card EMI",
    "Business Loan"
  ];
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Personal Loan',
    payment_method: 'Bank Transfer',
    account_id: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    type: 'credit',
    is_debt_payment: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.account_id) {
      return toast.error("Please fill in Lender, Amount, and Bank Account");
    }

    setIsSubmitting(true);
    try {
      const payload = { 
        ...formData,
        amount: parseFloat(formData.amount),
        user_id: user?.id,
        goal_id: null,
        note: formData.note || null
      };

      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-ID': user?.id },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMessage = "Failed to save loan";
        try {
          const errorBody = await res.json();
          if (typeof errorBody?.detail === 'string') {
            errorMessage = errorBody.detail;
          } else if (Array.isArray(errorBody?.detail) && errorBody.detail.length > 0) {
            errorMessage = errorBody.detail.map((item) => item?.msg).filter(Boolean).join(', ') || errorMessage;
          }
        } catch {
          // Ignore JSON parse errors and keep the generic message
        }
        throw new Error(errorMessage);
      }
      
      toast.success("Loan recorded! Bank balance updated.", { icon: '🏦' });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to record loan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm font-medium ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-amber-500 text-white' : 'bg-white border-slate-200 focus:border-amber-500 text-slate-900'}`;
  const labelClass = `block text-sm font-bold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-lg p-8 rounded-3xl shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-[#f8f9fa]'}`}>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/30">
              <Landmark size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-amber-600 uppercase tracking-tighter italic">Record a Loan</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Log Incoming Debt</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        <div className={`flex items-start gap-3 p-4 mb-6 rounded-2xl border ${darkMode ? 'bg-amber-900/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-500" />
          <p className="text-xs font-bold leading-relaxed">
            Recording a loan will <span className="underline decoration-amber-500 underline-offset-2">increase</span> your selected bank balance, but will also be added to your active liabilities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Lender Name / Institution</label>
            <input 
              type="text"
              placeholder="e.g. HDFC Bank, SBI, or John Doe..." 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className={inputClass} 
            />
          </div>
          <div>
            <label className={labelClass}>Loan Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={inputClass}
            >
              {loanCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className={labelClass}>Principal Amount</label>
              <input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Date Received</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={inputClass} />
            </div>
          </div>

          <div className="animate-in slide-in-from-top-2">
            <label className={labelClass}>Deposit Into Account</label>
            <select 
              value={formData.account_id} 
              onChange={(e) => setFormData({...formData, account_id: e.target.value})} 
              className={inputClass}
            >
              <option value="">Select Bank Account...</option>
              {accounts.filter(a => a.type === 'bank').map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Terms / Notes</label>
            <textarea 
              placeholder="Interest rate, duration, or any other details..." 
              value={formData.note} 
              onChange={(e) => setFormData({...formData, note: e.target.value})} 
              className={`${inputClass} resize-none h-20`} 
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-2 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-amber-600 active:scale-[0.98] transition-all flex justify-center shadow-lg shadow-amber-500/20">
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm Loan Disbursement'}
          </button>
        </form>
      </div>
    </div>
  );
}
