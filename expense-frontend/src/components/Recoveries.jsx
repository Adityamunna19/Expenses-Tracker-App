import { Clock, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';

export default function Recoveries({ transactions, onSuccess }) {
  const [loadingId, setLoadingId] = useState(null);

  // Filter for items marked as recovery
  const recoveryItems = transactions.filter(tx => tx.is_recovery && tx.type === 'debit');
  
  // Split into Pending and Settled
  const pending = recoveryItems.filter(tx => !tx.is_recovered);
  const settled = recoveryItems.filter(tx => tx.is_recovered);

  const totalPending = pending.reduce((sum, tx) => sum + tx.amount, 0);
  const totalSettled = settled.reduce((sum, tx) => sum + tx.amount, 0);

  const markAsRecovered = async (tx) => {
    setLoadingId(tx.id);
    try {
      // 1. Build a PERFECTLY clean payload for Python (No extra Supabase fields)
      const cleanUpdateData = {
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        payment_mode: tx.payment_mode || "UPI",
        is_secret: tx.is_secret || false,
        sender: tx.sender || null,
        is_recovery: tx.is_recovery || false,
        is_debt_payment: tx.is_debt_payment || false,
        is_recovered: true // <-- The crucial change
      };

      // 2. Update the original transaction
      const putRes = await fetch(`http://localhost:8000/transactions/${tx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanUpdateData),
      });

      if (!putRes.ok) {
        console.error("Failed to update original:", await putRes.text());
        alert("Backend rejected the update. Check your Python terminal.");
        setLoadingId(null);
        return;
      }

      // 3. Automatically create a NEW Credit transaction for the money coming back
      const creditData = {
        title: `Recovered: ${tx.title}`,
        amount: tx.amount,
        type: 'credit',
        category: 'Gift/Refund',
        payment_mode: 'UPI',
        sender: 'Auto-Recovered',
        is_secret: tx.is_secret || false,
        is_recovery: false,
        is_debt_payment: false,
        is_recovered: false
      };

      const postRes = await fetch('http://localhost:8000/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creditData),
      });

      if (!postRes.ok) {
        console.error("Failed to create credit:", await postRes.text());
        alert("Original was updated, but failed to create the new credit.");
      }

      // 4. Refresh global data safely
      if (onSuccess) {
        onSuccess();
      } else {
        console.warn("onSuccess prop is missing! Data won't refresh automatically.");
      }

    } catch (err) {
      console.error("Network or code error:", err);
      alert("Something went wrong. Check the browser console.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl mx-auto pb-10">
      <div className="mb-12 text-center lg:text-left px-4">
        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Owed to You</h2>
        <p className="text-slate-500 font-bold text-lg">Track money you lent out and mark it when it returns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 px-4">
        <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-amber-600" size={24} />
            <h3 className="font-black text-amber-900 uppercase tracking-widest text-xs">Total Pending</h3>
          </div>
          <p className="text-5xl font-black text-amber-600">₹{totalPending.toLocaleString()}</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="text-emerald-600" size={24} />
            <h3 className="font-black text-emerald-900 uppercase tracking-widest text-xs">Total Recovered</h3>
          </div>
          <p className="text-5xl font-black text-emerald-600">₹{totalSettled.toLocaleString()}</p>
        </div>
      </div>

      <div className="px-4 space-y-12">
        {/* PENDING SECTION */}
        <div>
          <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><Clock size={20} className="text-slate-400" /> Waiting on ({pending.length})</h4>
          <div className="space-y-4">
            {pending.length > 0 ? pending.map((tx) => (
              <div key={tx.id} className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                    <ArrowRightLeft size={24} />
                  </div>
                  <div>
                    <h5 className="text-xl font-black text-slate-900">{tx.title}</h5>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{new Date(tx.created_at).toLocaleDateString()} • {tx.payment_mode}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full md:w-auto gap-6">
                  <p className="text-2xl font-black text-slate-900">₹{tx.amount.toLocaleString()}</p>
                  <button 
                    onClick={() => markAsRecovered(tx)}
                    disabled={loadingId === tx.id}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
                  >
                    {loadingId === tx.id ? 'Processing...' : 'Mark Received'}
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 bg-white/40 rounded-[2rem] border-2 border-dashed border-white">
                <p className="text-slate-400 font-bold">No pending recoveries.</p>
              </div>
            )}
          </div>
        </div>

        {/* SETTLED SECTION */}
        {settled.length > 0 && (
          <div>
            <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><CheckCircle2 size={20} className="text-emerald-500" /> Settled</h4>
            <div className="space-y-4 opacity-75">
              {settled.map((tx) => (
                <div key={tx.id} className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center opacity-50">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h5 className="text-lg font-black text-slate-700 line-through decoration-emerald-300">{tx.title}</h5>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Settled</p>
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-400 line-through decoration-emerald-300">₹{tx.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}