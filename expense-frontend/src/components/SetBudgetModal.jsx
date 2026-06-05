import { useState } from 'react';
import { X, Loader2, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_EXPENSE_CATEGORIES } from '../utils/financeConfig';

export default function SetBudgetModal({ user, onClose, onSuccess, darkMode, API_BASE, categories = [] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ category: 'Food', monthly_limit: '' });

  const budgetCategories = categories.length > 0
    ? categories
    : DEFAULT_EXPENSE_CATEGORIES.filter((category) => !['Savings', 'Goals', 'Credit Card Payment', 'Other'].includes(category));
  const selectableCategories =
    formData.category && !budgetCategories.some((category) => category.toLowerCase() === formData.category.toLowerCase())
      ? [...budgetCategories, formData.category]
      : budgetCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.monthly_limit) return toast.error("Please enter a limit");

    setIsSubmitting(true);
    try {
      // Upsert logic: If budget exists for category, update it. Else, insert.
      const res = await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-ID': user?.id },
        body: JSON.stringify({ ...formData, monthly_limit: parseFloat(formData.monthly_limit) })
      });

      if (!res.ok) throw new Error();
      
      toast.success("Budget target locked in!", { icon: '🎯' });
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to set budget");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all outline-none font-bold ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-indigo-500 text-white' : 'bg-white border-slate-200 focus:border-indigo-500 text-slate-900'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-md p-8 rounded-[3rem] shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-[#f8f9fa]'}`}>
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-indigo-600 uppercase tracking-tighter italic">Set Limit</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Category</label>
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={inputClass}>
              {selectableCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monthly Maximum (₹)</label>
            <input type="number" placeholder="5000" value={formData.monthly_limit} onChange={(e) => setFormData({...formData, monthly_limit: e.target.value})} className={inputClass} />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all flex justify-center shadow-lg shadow-indigo-500/20">
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Engage Limit'}
          </button>
        </form>
      </div>
    </div>
  );
}
