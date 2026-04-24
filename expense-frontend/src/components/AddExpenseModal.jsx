import { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Zap, Building2, CreditCard, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

// 👇 1. ADDED editData = null TO PROPS
export default function AddExpenseModal({ user, onClose, onSuccess, darkMode, API_BASE, accounts = [], prefill = null, budgets = [], analytics = { categories: [] }, editData = null }) {
  
  // 👇 2. UPDATED STATE TO PULL FROM editData FIRST
  const [formData, setFormData] = useState({
    title: editData?.title || prefill?.title || '',
    amount: editData?.amount || prefill?.amount || '',
    category: editData?.category || prefill?.category || 'Food',
    payment_method: editData?.payment_method || prefill?.payment_mode || 'UPI',
    account_id: editData?.account_id || '',
    to_account_id: editData?.to_account_id || '',
    date: editData?.date || prefill?.date || new Date().toISOString().split('T')[0],
    note: editData?.note || '', 
    is_secret: editData?.is_secret || false,
    is_recovery: editData?.is_recovery || false,
    expected_recovery_date: editData?.expected_recovery_date || '',
    is_debt_payment: editData?.is_debt_payment || false,
    type: 'debit'
  });

  const [smartInput, setSmartInput] = useState('');
  const [isSmartLoading, setIsSmartLoading] = useState(false);
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(editData?.goal_id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["Food", "Transport","Cafe","Coffee", "Bills", "Shopping", "Entertainment", "Savings", "Goals", "Credit Card Payment","Beauty","Travel","Medicines","Family Maintenance","Fancy","Repairs","Other"];
  const paymentMethods = ["UPI", "Cash", "Card", "Bank Transfer", "NetBanking"];

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_BASE}/goals`, { headers: { 'X-User-ID': user.id } });
        const data = await res.json();
        setGoals(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Error fetching goals:", err); }
    };
    fetchGoals();
  }, [API_BASE, user?.id]);

  useEffect(() => {
    if (prefill && !editData) {
      setFormData(prev => ({
        ...prev,
        title: prefill.title,
        amount: prefill.amount,
        date: prefill.date || prev.date,
        payment_method: prefill.payment_method || 'UPI',
        category: prefill.category || prev.category
      }));
    }
  }, [prefill, editData]);

  // Auto-select credit card when category is "Credit Card Payment" or when prefill has to_account_id
  useEffect(() => {
    if (formData.category === 'Credit Card Payment' && !formData.to_account_id) {
      const creditCard = accounts.find(a => a.type === 'card');
      if (creditCard) {
        setFormData(prev => ({
          ...prev,
          to_account_id: creditCard.id,
          payment_method: 'UPI' // Default to UPI for credit card bill payments
        }));
      }
    }
    // If prefill has to_account_id and category is Credit Card Payment, ensure it's set
    if (prefill?.to_account_id && prefill.category === 'Credit Card Payment') {
      const creditCard = accounts.find(a => a.id === prefill.to_account_id);
      if (creditCard) {
        setFormData(prev => ({
          ...prev,
          category: 'Credit Card Payment',
          to_account_id: creditCard.id,
          payment_method: 'UPI'
        }));
      }
    }
  }, [formData.category, accounts, prefill]);

  const localPreParse = (text, availableGoals, availableAccounts) => {
    // ... (Your existing localPreParse logic stays exactly the same)
    let t = text.toLowerCase().trim();
    const amountMatch = t.match(/\d+(\.\d+)?/);
    if (!amountMatch) return null; 
    const amount = parseFloat(amountMatch[0]);
    let cleanText = t.replace(amountMatch[0], '').trim(); 

    let account_id = '';
    let payment_method = '';

    const forceCard = t.includes('card') || t.includes('swipe') || t.includes('online');
    const forceUPI = t.includes('upi') || t.includes('scan') || t.includes('phone');

    for (const acc of availableAccounts) {
      const accName = acc.name.toLowerCase();
      const acronym = accName.split(/\s+/).map(w => w[0]).join('');
      const coreWords = accName.split(/\s+/).filter(w => !['bank', 'card', 'account', 'credit', 'debit', 'of'].includes(w));
      const isBankMatch = t.includes(acronym) || coreWords.some(w => t.includes(w));

      if (isBankMatch) {
        if (forceCard && acc.type === 'card') {
          account_id = acc.id; payment_method = 'Card';
        } else if (forceUPI && acc.type === 'bank') {
          account_id = acc.id; payment_method = 'UPI';
        } else if (!forceCard && !forceUPI) {
          account_id = acc.id; payment_method = acc.type === 'card' ? 'Card' : 'UPI';
        }

        if (account_id) {
          const matchedWord = t.includes(acronym) ? acronym : coreWords.find(w => t.includes(w));
          cleanText = cleanText.replace(new RegExp(matchedWord, 'gi'), '').trim();
          cleanText = cleanText.replace(/(card|swipe|online|upi|scan|phone|pay)/gi, '').trim();
          break;
        }
      }
    }

    for (const goal of availableGoals) {
      if (cleanText.includes(goal.title.toLowerCase())) {
        return { title: `Saved for ${goal.title}`, amount, category: "Goals", linked_goal_id: goal.id, account_id, payment_method };
      }
    }

    const dictionary = {
      "Food": ["kfc", "swiggy", "zomato", "tea", "coffee", "dinner", "lunch", "starbucks", "grocery", "blinkit", "zepto"],
      "Transport": ["uber", "ola", "auto", "metro", "petrol", "bus", "train", "flight", "cab", "rapido"],
      "Bills": ["wifi", "electricity", "recharge", "airtel", "jio", "rent", "water", "bill"],
      "Shopping": ["amazon", "flipkart", "zara", "myntra", "clothes", "shoes", "mall"],
      "Entertainment": ["netflix", "movie", "spotify", "cinema", "prime", "game"],
      "Savings": ["sip", "stocks", "fixed deposit", "fd", "gold", "mutual fund", "mf"],
      "Credit Card Payment": ["cc payment", "credit card payment", "card payment", "bill payment", "pay cc", "pay card"]
    };

    for (const [cat, keywords] of Object.entries(dictionary)) {
      const matchedWord = keywords.find(kw => cleanText.includes(kw));
      if (matchedWord) {
        let title = cleanText.replace(/^(for|on|to|at|via|using)\s+/i, '').trim();
        if (title.length < 2) title = matchedWord; 
        title = title.charAt(0).toUpperCase() + title.slice(1); 
        return { title, amount, category: cat, linked_goal_id: null, account_id, payment_method };
      }
    }
    return null; 
  };

  const handleSmartAdd = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!smartInput) return;

      const localResult = localPreParse(smartInput, goals, accounts);
      if (localResult) {
        setFormData(prev => ({
          ...prev, 
          title: localResult.title, 
          amount: localResult.amount, 
          category: localResult.category,
          account_id: localResult.account_id || prev.account_id, 
          payment_method: localResult.payment_method || prev.payment_method
        }));
        if (localResult.linked_goal_id) setSelectedGoalId(localResult.linked_goal_id);
        toast.success("Quick matched! ⚡", { icon: '⚡' });
        setSmartInput('');
        return; 
      }

      setIsSmartLoading(true);
      const loadingToast = toast.loading("AI Parsing...");
      try {
        const res = await fetch(`${API_BASE}/smart-parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: smartInput, available_goals: goals.map(g => ({ id: g.id, title: g.title })) })
        });
        const parsed = await res.json();
        setFormData(prev => ({ 
          ...prev, 
          title: parsed.title, 
          amount: parsed.amount, 
          category: parsed.category 
        }));
        if (parsed.category === "Goals" && parsed.linked_goal_id) setSelectedGoalId(parsed.linked_goal_id);
        toast.success("AI parsed!", { id: loadingToast });
        setSmartInput('');
      } catch (err) { 
        toast.error("AI Error", { id: loadingToast }); 
      } finally { 
        setIsSmartLoading(false); 
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isCardPaymentTransfer = formData.category === 'Credit Card Payment';

    if (isCardPaymentTransfer) {
      if (!formData.amount || !formData.account_id || !formData.to_account_id) {
        return toast.error("Select the source bank, target card, and amount");
      }
    } else if (!formData.title || !formData.amount) {
      return toast.error("Merchant and Amount are required");
    }
    
    setIsSubmitting(true);
    try {
      const expenseAmount = parseFloat(formData.amount);
      const payload = isCardPaymentTransfer
        ? {
            title: `Transfer: ${accounts.find((a) => a.id === formData.account_id)?.name || 'Bank'} → ${accounts.find((a) => a.id === formData.to_account_id)?.name || 'Card'}`,
            amount: expenseAmount,
            category: 'CC Payment',
            payment_method: formData.payment_method,
            account_id: formData.account_id || null,
            to_account_id: formData.to_account_id || null,
            date: formData.date,
            note: formData.note,
            type: 'transfer',
            user_id: user?.id
          }
        : { 
            ...formData, 
            amount: expenseAmount, 
            user_id: user?.id, 
            goal_id: formData.category === "Goals" ? selectedGoalId : null,
            account_id: formData.account_id || null,
            expected_recovery_date: formData.expected_recovery_date || null
          };

      const method = editData && !isCardPaymentTransfer ? 'PUT' : 'POST';
      const url = editData && !isCardPaymentTransfer ? `${API_BASE}/transactions/${editData.id}` : `${API_BASE}/transactions`;

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'X-User-ID': user?.id },
        body: JSON.stringify(payload)
      });
      
      if (res.ok && formData.category === "Goals" && selectedGoalId && !editData) {
        await fetch(`${API_BASE}/goals/${selectedGoalId}/add`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-User-ID': user?.id },
          body: JSON.stringify({ amount_to_add: expenseAmount })
        });
      }

      // Impact Warning Logic (Only run if it's a NEW transaction, not an edit)
      if (!editData && !isCardPaymentTransfer) {
        const targetBudget = budgets.find(b => b.category.toLowerCase() === formData.category.toLowerCase());
        
        if (targetBudget && res.ok) {
          const previousSpend = analytics?.categories?.find(
            c => c?.category && c.category.toLowerCase() === formData.category.toLowerCase()
          )?.total || 0;
          
          const newTotal = previousSpend + expenseAmount;

          if (newTotal > targetBudget.monthly_limit) {
            const overage = newTotal - targetBudget.monthly_limit;
            toast.error(
              `Budget Breached! You are ₹${overage.toLocaleString()} over your ${targetBudget.category} limit.`, 
              { duration: 6000, icon: '🚨' }
            );
          } else if (newTotal > (targetBudget.monthly_limit * 0.85)) {
            toast.success(
              `Warning: You only have ₹${(targetBudget.monthly_limit - newTotal).toLocaleString()} left in ${targetBudget.category}.`, 
              { duration: 5000, icon: '⚠️', style: { border: '1px solid #f59e0b', color: '#b45309' } }
            );
          } else {
            toast.success("Expense recorded securely!");
          }
        } else if (res.ok) {
          toast.success("Expense recorded securely!");
        }
      } else if (res.ok && !isCardPaymentTransfer) {
        // Simple success for an Edit
        toast.success("Record amended securely!");
      } else if (res.ok && isCardPaymentTransfer) {
        toast.success("Card payment recorded!");
      }

      onSuccess();
      onClose();
    } catch (err) { 
      toast.error("Failed to save"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm font-medium ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-rose-500 text-white' : 'bg-white border-slate-200 focus:border-rose-500 text-slate-900'}`;
  const labelClass = `block text-sm font-bold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`w-full max-w-lg p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-900' : 'bg-[#f4f6f8]'}`}>
        <div className="flex justify-between items-center mb-6">
          {/* 👇 4. DYNAMIC HEADER 👇 */}
          <h2 className="text-2xl font-black text-rose-600 italic tracking-tighter uppercase">
            {editData ? "Amend Record" : "Expense Record"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"><X size={20} /></button>
        </div>

        {/* Hide Smart Add when Editing */}
        {!editData && (
          <div className={`flex items-center gap-2 px-4 py-3 mb-6 rounded-xl border border-rose-100 bg-rose-50/50 ${darkMode ? 'bg-rose-900/20 border-rose-500/30' : ''}`}>
            {isSmartLoading ? <Loader2 className="animate-spin text-rose-500" size={18} /> : <Zap className="text-rose-500" size={18} />}
            <input 
              placeholder="Smart Add: e.g., '1000 swiggy sbi'..." 
              value={smartInput}
              onChange={(e) => setSmartInput(e.target.value)} 
              onKeyDown={handleSmartAdd}
              className="flex-1 bg-transparent outline-none text-sm font-medium text-rose-900 dark:text-rose-200 placeholder:text-rose-400/60"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Merchant / Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className={inputClass} 
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={labelClass}>Amount</label>
              <input 
                type="number" 
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                className={inputClass} 
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Category</label>
              <select 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                className={inputClass}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {formData.category === "Goals" && (
            <div className="animate-in slide-in-from-top-2">
              <label className={labelClass}>Link to Goal</label>
              <select 
                value={selectedGoalId} 
                onChange={(e) => setSelectedGoalId(e.target.value)} 
                className={inputClass}
              >
                <option value="">Select vision...</option>
                {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1">
               <label className={labelClass}>Payment method</label>
               <select 
                 value={formData.payment_method} 
                 onChange={(e) => setFormData({...formData, payment_method: e.target.value, account_id: ''})} 
                 className={inputClass}
               >
                 {/* For Credit Card Payment category, only show UPI and NetBanking */}
                 {formData.category === 'Credit Card Payment' 
                   ? ['UPI', 'NetBanking'].map(method => <option key={method} value={method}>{method}</option>)
                   : paymentMethods.map(method => <option key={method} value={method}>{method}</option>)
                 }
               </select>
            </div>
            <div className="flex-1">
               <label className={labelClass}>Date</label>
               <input 
                 type="date" 
                 value={formData.date} 
                 onChange={(e) => setFormData({...formData, date: e.target.value})} 
                 className={inputClass} 
               />
            </div>
          </div>

          {/* Account Selectors */}
          {/* Bank selector - shown when payment method is not Card AND category is not Credit Card Payment */}
          {((formData.payment_method !== 'Card' && formData.category !== 'Credit Card Payment') && accounts.filter(a => a.type === 'bank').length > 0) && (
            <div className="animate-in slide-in-from-top-2">
              <label className={labelClass}>Paid From Bank</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 opacity-50" size={18} />
                <select 
                  value={formData.account_id} 
                  onChange={(e) => setFormData({...formData, account_id: e.target.value})} 
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Account...</option>
                  {accounts.filter(a => a.type === 'bank').map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {formData.category === 'Credit Card Payment' && accounts.filter(a => a.type === 'bank').length > 0 && (
            <div className="animate-in slide-in-from-top-2">
              <label className={labelClass}>Amount Debited From Bank</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 opacity-50" size={18} />
                <select 
                  value={formData.account_id} 
                  onChange={(e) => setFormData({...formData, account_id: e.target.value})} 
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Bank...</option>
                  {accounts.filter(a => a.type === 'bank').map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Credit Card Payment Category - Show Card Selector */}
          {formData.category === 'Credit Card Payment' && accounts.filter(a => a.type === 'card').length > 0 && (
            <div className="animate-in slide-in-from-top-2">
              <label className={labelClass}>Amount Credited To Card</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 opacity-50" size={18} />
                <select 
                  value={formData.to_account_id} 
                  onChange={(e) => setFormData({...formData, to_account_id: e.target.value})} 
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Card...</option>
                  {accounts.filter(a => a.type === 'card').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] mt-1.5 font-bold uppercase tracking-wider text-amber-600">
                Choose which card bill you are paying with UPI or NetBanking
              </p>
            </div>
          )}

          {/* Regular Card Payment Method - Show Card Selector */}
          {formData.payment_method === 'Card' && formData.category !== 'Credit Card Payment' && accounts.filter(a => a.type === 'card').length > 0 && (
            <div className="animate-in slide-in-from-top-2">
              <label className={labelClass}>Paid With Credit Card</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 opacity-50" size={18} />
                <select 
                  value={formData.account_id} 
                  onChange={(e) => setFormData({...formData, account_id: e.target.value})} 
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Card...</option>
                  {accounts.filter(a => a.type === 'card').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Note Section */}
          <div className="animate-in slide-in-from-top-2">
            <label className={`${labelClass} flex items-center gap-2`}>
              <FileText size={16} className="opacity-50" />
              Note / Reason
            </label>
            <textarea 
              placeholder="e.g., Lunch with team, Monthly electricity bill, Fuel for trip..."
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              className={`${inputClass} resize-none min-h-[100px] py-3`}
              rows={3}
            />
            <p className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {formData.note.length > 0 ? `${formData.note.length} characters` : 'Add details about this expense'}
            </p>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 py-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.is_recovery} 
                onChange={(e) => setFormData({...formData, is_recovery: e.target.checked})} 
                className="w-5 h-5 accent-indigo-600 rounded" 
              />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Lending / Recoverable?</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.is_debt_payment} 
                onChange={(e) => setFormData({...formData, is_debt_payment: e.target.checked})} 
                className="w-5 h-5 accent-emerald-600 rounded" 
              />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Debt Repayment?</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-rose-700 transition-all flex justify-center"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (editData ? 'Save Changes' : 'Confirm Transaction')}
          </button>
        </form>
      </div>
    </div>
  );
}
