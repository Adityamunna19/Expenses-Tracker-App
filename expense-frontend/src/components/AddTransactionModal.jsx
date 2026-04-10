import { X } from 'lucide-react';

export default function AddTransactionModal({ type, user, onClose, onSuccess, darkMode, API_BASE }) {
  const isCredit = type === 'credit';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Build the data payload with ALL the advanced features
    const data = {
      title: formData.get('title'),
      amount: parseFloat(formData.get('amount')),
      type: type,
      category: formData.get('category'),
      payment_mode: formData.get('payment_mode'),
      is_secret: formData.get('is_secret') === 'on',
      sender: formData.get('sender') || null,
      is_recovery: formData.get('is_recovery') === 'on',
      is_debt_payment: formData.get('is_debt_payment') === 'on',
      user_id: user.id
    };

    try {
      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': user.id
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess(); 
        onClose();   
      } else {
        const errorData = await response.json();
        alert(`Failed to save: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (err) { 
      console.error(err);
      alert("Network error: Could not reach the backend.");
    }
  };

  const inputClass = `w-full px-6 py-4 rounded-2xl font-bold border border-transparent outline-none transition-all ${darkMode ? 'bg-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 text-slate-900 focus:border-slate-300'}`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black">{isCredit ? 'Income Record' : 'Expense Record'}</h2>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Core Details */}
          <input name="title" placeholder="Title (e.g., Grocery Shopping, Salary)" className={inputClass} required />
          
          <div className="grid grid-cols-2 gap-4">
            <input name="amount" type="number" step="0.01" placeholder="Amount (₹)" className={`${inputClass} font-black text-xl`} required />
            <select name="category" className={inputClass}>
              {isCredit ? (
                <>
                  <option>Salary</option>
                  <option>Freelance</option>
                  <option>Gift</option>
                  <option>Recovery</option>
                  <option>Others</option>
                </>
              ) : (
                <>
                  <option>Food</option>
                  <option>Shopping</option>
                  <option>Rent</option>
                  <option>Travel</option>
                  <option>Bills</option>
                  <option>Others</option>
                </>
              )}
            </select>
          </div>

          <div className="flex gap-4">
            <select name="payment_mode" className={`flex-1 ${inputClass}`}>
              <option>UPI</option><option>Cash</option><option>Card</option><option>Bank Transfer</option>
            </select>
            <div className={`flex-1 flex items-center justify-center gap-3 rounded-2xl border border-transparent ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <input type="checkbox" name="is_secret" id="secret" className="w-5 h-5 accent-indigo-600 cursor-pointer" />
              <label htmlFor="secret" className={`text-sm font-bold cursor-pointer ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Secret Transaction?</label>
            </div>
          </div>

          {/* 2. ADVANCED FEATURES (The missing piece!) */}
          <div className="pt-2">
            <h3 className={`text-sm font-black uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Advanced Options</h3>
            
            {isCredit ? (
              // INCOME SPECIFIC OPTIONS
              <div className="flex gap-4">
                <input name="sender" placeholder="Sender Name (Optional)" className={`flex-1 ${inputClass}`} />
                <div className={`flex-1 flex items-center justify-center gap-3 rounded-2xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <input type="checkbox" name="is_recovery" id="recovery" className="w-5 h-5 accent-emerald-500 cursor-pointer" />
                  <label htmlFor="recovery" className={`text-sm font-bold cursor-pointer ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Is this a Recovery?</label>
                </div>
              </div>
            ) : (
              // EXPENSE SPECIFIC OPTIONS
              <div className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <input type="checkbox" name="is_debt_payment" id="debt" className="w-5 h-5 accent-rose-500 cursor-pointer" />
                <label htmlFor="debt" className={`text-sm font-bold cursor-pointer ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Is this paying off a Debt?</label>
              </div>
            )}
          </div>

          {/* 3. Submit */}
          <button type="submit" className="w-full mt-4 bg-indigo-600 text-white font-black py-5 rounded-3xl text-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
            Confirm Entry
          </button>
        </form>
      </div>
    </div>
  );
}