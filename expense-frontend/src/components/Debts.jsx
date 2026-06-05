import { useMemo } from 'react';
import { Landmark, ArrowUpRight, Calculator } from 'lucide-react';
import { getLoanBucketName } from '../utils/financeConfig';

export default function Debts({ transactions, darkMode, onAddDebt, onOpenCalculator }) {
  const debtTransactions = transactions.filter((tx) => tx.is_debt_payment);

  const debtSummary = useMemo(() => {
    const groups = new Map();

    debtTransactions.forEach((tx) => {
      const bucketName = getLoanBucketName(tx);
      if (!groups.has(bucketName)) {
        groups.set(bucketName, { name: bucketName, borrowed: 0, repaid: 0, transactions: [] });
      }

      const group = groups.get(bucketName);
      const amount = Number(tx.amount) || 0;
      group.transactions.push(tx);

      if (tx.type === 'credit') {
        group.borrowed += amount;
      } else if (tx.type === 'debit') {
        group.repaid += amount;
      }
    });

    return Array.from(groups.values()).map((group) => {
      const remaining = Math.max(0, group.borrowed - group.repaid);
      const progress = group.borrowed > 0 ? Math.min((group.repaid / group.borrowed) * 100, 100) : 0;
      return { ...group, remaining, progress };
    });
  }, [debtTransactions]);

  const totalBorrowed = debtTransactions
    .filter((tx) => tx.type === 'credit')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalRepaid = debtTransactions
    .filter((tx) => tx.type === 'debit')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const remainingDebt = Math.max(0, totalBorrowed - totalRepaid);
  const progressPercent = totalBorrowed > 0 ? Math.min((totalRepaid / totalBorrowed) * 100, 100).toFixed(1) : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto pb-10">
      <div className="mb-12 text-center lg:text-left px-4">
        <div className="flex justify-between items-end mb-12 px-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Debt Liquidation</h2>
          <p className="text-slate-500 font-bold">Track your journey to becoming debt-free.</p>
        </div>
        <button 
            onClick={onOpenCalculator} 
            className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase tracking-widest transition-all ${
              darkMode 
                ? 'bg-slate-800 text-indigo-400 hover:bg-slate-700' 
                : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm border border-slate-200'
            }`}
          >
            <Calculator size={18} />
            <span className="hidden sm:inline">EMI Planner</span>
          </button>
        {/* This button will trigger the Credit Modal with Debt auto-selected */}
        <button 
          onClick={onAddDebt} 
          className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
        >
          + Add Loan
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
                 Borrowed: ₹{totalBorrowed.toLocaleString()}
               </p>
               {totalRepaid > 0 && (
                 <p className="text-rose-400 font-black tracking-widest uppercase text-[10px] flex items-center gap-1">
                   <ArrowUpRight size={12} /> Repaid: ₹{totalRepaid.toLocaleString()}
                 </p>
               )}
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-50 p-6 rounded-[2rem]">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-3xl font-black text-emerald-500">₹{totalRepaid.toLocaleString()}</p>
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

      <div className="px-4 mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-black tracking-tight">Loan Buckets</h3>
            <p className="text-sm font-bold opacity-50">Track each lender separately</p>
          </div>
        </div>

        {debtSummary.length === 0 ? (
          <div className="py-20 text-center font-black opacity-30 text-lg uppercase italic tracking-widest border-2 border-dashed rounded-[3rem]">
            No debt buckets yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {debtSummary.map((bucket) => (
              <div key={bucket.name} className={`p-8 rounded-[2.5rem] shadow-lg border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-transparent'}`}>
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Loan Account</p>
                    <h4 className="text-2xl font-black tracking-tight">{bucket.name}</h4>
                  </div>
                  <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full uppercase tracking-widest">
                    {bucket.progress.toFixed(0)}% Paid
                  </span>
                </div>

                <div className={`w-full h-4 rounded-full p-1 mb-5 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                    style={{ width: `${bucket.progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Borrowed</p>
                    <p className="text-xl font-black text-rose-500">₹{bucket.borrowed.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Remaining</p>
                    <p className="text-xl font-black text-emerald-500">₹{bucket.remaining.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
