import { X, User, Wallet, CreditCard } from 'lucide-react';
import { useState } from 'react';

export default function AddTransactionModal({ type, onClose, onSuccess, editData }) {
  const isCredit = type === 'credit';
  const isEditing = !!editData;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
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
      is_recovered: false // Default for new entries
    };

    try {
      const url = isEditing 
        ? `http://localhost:8000/transactions/${editData.id}` 
        : 'http://localhost:8000/transactions';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        console.error("Failed:", await response.text());
        alert("Failed to save transaction. Check console.");
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl border border-white animate-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center p-10 pb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isEditing ? 'Update Entry' : (isCredit ? 'Record Income' : 'Record Expense')}
            </h2>
            <p className="text-slate-500 font-bold mt-1">Specify amount, category, and payment rail.</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-6">
          
          {/* Title / Source */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              <Wallet size={14} /> Title / Source
            </label>
            <input 
              name="title" 
              type="text" 
              defaultValue={editData?.title || ""} 
              className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-slate-100 font-bold text-xl" 
              placeholder={isCredit ? "e.g. Salary, Friend payback" : "e.g. EMIs, Groceries, Dinner"} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Amount (₹)</label>
              <input 
                name="amount" 
                type="number" 
                step="0.01" 
                defaultValue={editData?.amount || ""} 
                className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-slate-100 font-black text-2xl text-slate-900" 
                placeholder="0.00" 
                required 
              />
            </div>

            {/* Payment Mode */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                <CreditCard size={14} /> Payment Mode
              </label>
              <select 
                name="payment_mode" 
                defaultValue={editData?.payment_mode || "UPI"} 
                className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-slate-100 font-bold text-lg bg-white cursor-pointer"
              >
                <option value="UPI">UPI (GPay/PhonePe)</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="NetBanking">Net Banking</option>
                <option value="Cash">Cash / Physical</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category</label>
            <select 
              name="category" 
              defaultValue={editData?.category || "Others"} 
              className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-slate-100 font-bold text-lg bg-white cursor-pointer"
            >
              {isCredit ? (
                <><option>Salary</option><option>Freelance</option><option>Gift/Refund</option><option>Borrowed</option></>
              ) : (
                <><option>EMIs / Debt</option><option>Food & Drinks</option><option>Groceries</option><option>Family</option><option>Shopping</option></>
              )}
              <option>Others</option>
            </select>
          </div>

          {/* ======================================= */}
          {/* DYNAMIC EXTRAS: INCOME vs EXPENSE         */}
          {/* ======================================= */}
          {isCredit ? (
            /* --- INCOME EXTRAS --- */
            <div className="space-y-4">
              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                 <label className="flex items-center gap-2 text-xs font-black text-emerald-700 uppercase mb-3">
                   <User size={14} /> Sender Name
                 </label>
                 <input 
                   name="sender" 
                   type="text" 
                   defaultValue={editData?.sender || ""} 
                   className="w-full px-6 py-4 bg-white border border-emerald-200 rounded-xl font-bold placeholder:text-emerald-300" 
                   placeholder="Who sent this?" 
                 />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Recovery Received Toggle */}
                 <div className="p-4 bg-blue-50 rounded-[1.5rem] border border-blue-100 flex items-center gap-3">
                    <input name="is_recovery" type="checkbox" id="isRecoveryReceived" defaultChecked={editData?.is_recovery} className="w-6 h-6 accent-blue-600 rounded-md" />
                    <label htmlFor="isRecoveryReceived" className="text-sm font-black text-blue-800 cursor-pointer">Recovery (Money returned)</label>
                 </div>

                 {/* Borrowed Money Toggle */}
                 <div className="p-4 bg-rose-50 rounded-[1.5rem] border border-rose-100 flex items-center gap-3">
                    <input name="is_debt_payment" type="checkbox" id="isBorrowed" defaultChecked={editData?.is_debt_payment} className="w-6 h-6 accent-rose-600 rounded-md" />
                    <label htmlFor="isBorrowed" className="text-sm font-black text-rose-800 cursor-pointer">Borrowed Money (Increases Debt)</label>
                 </div>
              </div>
            </div>
          ) : (
            /* --- EXPENSE EXTRAS --- */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Mark as Recovery Toggle */}
               <div className="p-4 bg-amber-50 rounded-[1.5rem] border border-amber-100 flex items-center gap-3">
                  <input name="is_recovery" type="checkbox" id="isRecovery" defaultChecked={editData?.is_recovery} className="w-6 h-6 accent-amber-600 rounded-md" />
                  <label htmlFor="isRecovery" className="text-sm font-black text-amber-800 cursor-pointer">Mark as Recovery</label>
               </div>
               
               {/* Debt Payment Toggle */}
               <div className="p-4 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex items-center gap-3">
                  <input name="is_debt_payment" type="checkbox" id="isDebt" defaultChecked={editData?.is_debt_payment} className="w-6 h-6 accent-emerald-600 rounded-md" />
                  <label htmlFor="isDebt" className="text-sm font-black text-emerald-800 cursor-pointer">Debt Payment</label>
               </div>
            </div>
          )}

          {/* ======================================= */}
          {/* Footer Controls                           */}
          {/* ======================================= */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-4 py-2 group">
              <input name="is_secret" type="checkbox" id="secret" defaultChecked={editData?.is_secret} className="w-5 h-5 accent-slate-900" />
              <label htmlFor="secret" className="text-sm font-black text-slate-500 group-hover:text-slate-800 cursor-pointer">Secret Transaction</label>
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 w-full bg-[#1e293b] hover:bg-slate-800 text-white font-black py-6 rounded-[1.8rem] shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] text-xl disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isEditing ? 'Update Record' : 'Confirm Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}