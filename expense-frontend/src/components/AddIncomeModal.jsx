import { useState } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddIncomeModal({ user, onClose, onSuccess, darkMode, API_BASE }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '', 
    category: 'Income', 
    payment_method: 'Bank Transfer',
    date: new Date().toISOString().split('T')[0],
    note: '', is_secret: false, 
    type: 'credit',
    is_debt_payment: false, 
    type: 'credit'
  });

  const [smartInput, setSmartInput] = useState('');
  const [isSmartLoading, setIsSmartLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["Salary", "Refund", "Gift", "Other","Maintenance"];
  const paymentMethods = ["UPI", "Cash", "Card", "Bank Transfer"];

  const handleSmartAdd = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!smartInput) return;
      setIsSmartLoading(true);
      const loadingToast = toast.loading("Processing...");

      try {
        const response = await fetch(`${API_BASE}/smart-parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: smartInput, available_goals: [] }) // No goals for income
        });
        const parsed = await response.json();
        
        setFormData(prev => ({
          ...prev, title: parsed.title || prev.title, amount: parsed.amount || prev.amount, category: parsed.category || prev.category,
        }));

        toast.success("Details filled!", { id: loadingToast });
        setSmartInput('');
      } catch (err) { toast.error("Couldn't parse that.", { id: loadingToast }); } 
      finally { setIsSmartLoading(false); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return toast.error("Source and Amount are required");

    setIsSubmitting(true);
    try {
      const transRes = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-ID': user?.id },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount), user_id: user?.id, goal_id: null })
      });

      if (!transRes.ok) throw new Error("Failed to save transaction");

      toast.success("Income recorded");
      onSuccess();
      onClose();
    } catch (err) { toast.error("Failed to save"); }
    finally { setIsSubmitting(false); }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm font-medium ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white' : 'bg-white border-slate-200 focus:border-emerald-500 text-slate-900'}`;
  const labelClass = `block text-sm font-bold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`w-full max-w-lg p-8 rounded-3xl shadow-2xl ${darkMode ? 'bg-slate-900' : 'bg-[#f4f6f8]'}`}>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">Income Record</h2>
          <button onClick={onClose} className={`p-2 rounded-xl hover:bg-black/5 transition-colors ${darkMode && 'hover:bg-white/10'}`}><X size={20} /></button>
        </div>

        <div className={`flex items-center gap-2 px-4 py-3 mb-6 rounded-xl border border-emerald-100 bg-emerald-50/50 ${darkMode && 'bg-emerald-900/20 border-emerald-500/30'}`}>
          {isSmartLoading ? <Loader2 className="animate-spin text-emerald-500" size={18} /> : <Sparkles className="text-emerald-500" size={18} />}
          <input 
            placeholder="Smart Add: Type '5000 salary from TCS' & hit Enter..." value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)} onKeyDown={handleSmartAdd}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-emerald-900 dark:text-emerald-200 placeholder:text-emerald-400/60"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Source / Title</label>
            <input type="text" placeholder="Salary, Client A, Refund..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className={inputClass} />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={labelClass}>Amount</label>
              <input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={inputClass}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Received via</label>
            <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className={inputClass}>
              {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Date</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={inputClass} />
          </div>
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-500/30">
  <label className="flex items-center gap-3 cursor-pointer">
    <input 
      type="checkbox" 
      checked={formData.is_debt_payment} 
      onChange={(e) => setFormData({...formData, is_debt_payment: e.target.checked})} 
      className="w-5 h-5 accent-rose-600" 
    />
    <span className="text-xs font-black text-rose-600 uppercase tracking-widest">
      Is this borrowed money? (Adds to Debts)
    </span>
  </label>
</div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 active:scale-[0.98] transition-all flex justify-center">
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm Income'}
          </button>
        </form>
      </div>
    </div>
  );
}