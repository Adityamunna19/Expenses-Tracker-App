import { Landmark, ArrowUpRight } from 'lucide-react';

export default function Debts({ transactions, onAddDebt }) {
  // 1. Base Debt - Set to 0 so no "ghost" numbers appear
  const INITIAL_DEBT = 0;

  // 2. Calculate DEBT PAID (Debits marked as debt)
  const totalPaid = transactions
    .filter(tx => tx.is_debt_payment && tx.type === 'debit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 3. Calculate NEW DEBT TAKEN (Credits marked as debt)
  const newDebtTaken = transactions
    .filter(tx => tx.is_debt_payment && tx.type === 'credit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 4. Calculate Final Numbers
  const totalDebtBasis = INITIAL_DEBT + newDebtTaken;
  const remainingDebt = totalDebtBasis - totalPaid;
  const progressPercent = totalDebtBasis > 0 
    ? Math.min((totalPaid / totalDebtBasis) * 100, 100).toFixed(1) 
    : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto pb-10">
      <div className="mb-12 text-center lg:text-left px-4">
        <div className="flex justify-between items-end mb-12 px-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Debt Liquidation</h2>
          <p className="text-slate-500 font-bold">Track your journey to becoming debt-free.</p>
        </div>
        {/* This button will trigger the Credit Modal with Debt auto-selected */}
        <button 
          onClick={onAddDebt}
          className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          + Record New Loan
        </button>
      </div>
      </div>

      <div className="px-4">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                <Landmark size={36} />
              </div>
              <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-5 py-2.5 rounded-full uppercase tracking-[0.1em] shadow-sm">
                {progressPercent}% Paid Off
              </span>
            </div>
            
            <h4 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Total Liabilities</h4>
            
            <div className="flex items-center gap-4 mb-8">
               <p className="text-slate-400 font-black tracking-widest uppercase text-[10px]">
                 Base Debt: ₹{INITIAL_DEBT.toLocaleString()}
               </p>
               {newDebtTaken > 0 && (
                 <p className="text-rose-400 font-black tracking-widest uppercase text-[10px] flex items-center gap-1">
                   <ArrowUpRight size={12} /> +₹{newDebtTaken.toLocaleString()} Borrowed
                 </p>
               )}
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-50 p-6 rounded-[2rem]">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-3xl font-black text-emerald-500">₹{totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-rose-50 p-6 rounded-[2rem]">
                <p className="text-rose-400 font-bold text-xs uppercase tracking-widest mb-1">Remaining</p>
                <p className="text-3xl font-black text-rose-600">₹{remainingDebt.toLocaleString()}</p>
              </div>
            </div>

            <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}