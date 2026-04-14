import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  History, 
  Camera, 
  Sparkles, 
  AlertCircle,
  Calculator, // NEW IMPORT
  Equal       // NEW IMPORT
} from 'lucide-react';

// ==========================================
// 1. QUICK MATH COMPONENT (Built right here!)
// ==========================================
function QuickMathCard({ darkMode }) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    const val = e.target.value;
    setExpression(val);
    
    try {
      // Safely evaluate math strings (only allow numbers and math operators)
      if (/^[0-9+\-*/().\s]*$/.test(val) && val.trim() !== '') {
        // eslint-disable-next-line no-new-func
        const calcResult = new Function(`return ${val}`)();
        if (isFinite(calcResult)) setResult(calcResult);
      } else {
        setResult(null);
      }
    } catch {
      setResult(null);
    }
  };

  return (
    <div className={`p-8 rounded-[3rem] shadow-xl transition-all duration-300 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
          <Calculator size={24} />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight text-indigo-500">Quick Math</h3>
      </div>
      
      <div className={`flex flex-col rounded-3xl border-2 overflow-hidden ${darkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
        <input 
          type="text" 
          placeholder="e.g. 1250 / 3"
          value={expression}
          onChange={handleCalculate}
          className="w-full bg-transparent p-6 outline-none font-black text-2xl text-center placeholder:opacity-30"
        />
        <div className={`flex items-center justify-center gap-3 p-4 font-black text-3xl border-t-2 ${darkMode ? 'border-slate-700 text-emerald-400' : 'border-slate-100 text-emerald-500'}`}>
          <Equal size={24} className="opacity-50" />
          {result !== null ? result.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. MAIN DASHBOARD COMPONENT
// ==========================================
export default function Dashboard({ 
  onAddWithScreenshot, 
  recentTransactions, 
  pendingRecoveries, 
  stats, 
  analytics, 
  filterMonth, 
  setFilterMonth, 
  filterYear, 
  setFilterYear, 
  onAddExpense, 
  onAddCredit, 
  onViewLedger, 
  darkMode 
}) {

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const cardClass = `p-8 rounded-[3rem] shadow-xl transition-all duration-300 ${
    darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'
  }`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black tracking-tighter italic uppercase">Overview</h2>
          <p className="font-bold opacity-50 uppercase text-[10px] tracking-[0.3em]">Financial Mission Control</p>
        </div>
        
        <div className="flex gap-3 bg-black/5 dark:bg-white/5 p-2 rounded-[2rem] backdrop-blur-md">
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(parseInt(e.target.value))}
            className="bg-transparent font-black px-4 py-2 outline-none cursor-pointer"
          >
            {months.map((m, i) => <option key={m} value={i + 1} className="text-black">{m}</option>)}
          </select>
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
            className="bg-transparent font-black px-4 py-2 outline-none cursor-pointer"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y} className="text-black">{y}</option>)}
          </select>
        </div>
      </div>

      {/* QUICK ACTIONS & STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* MAGIC SCAN CARD */}
        <label className={`group relative overflow-hidden p-8 rounded-[3rem] shadow-xl cursor-pointer transition-all hover:-translate-y-2 border-4 border-transparent hover:border-indigo-500/30 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) onAddWithScreenshot(file);
            }} 
          />
          <div className="flex items-center gap-5">
            <div className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[1.8rem] shadow-lg shadow-indigo-500/40">
              <Camera size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tight">Magic Scan</h3>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">PhonePe Screenshot</p>
            </div>
          </div>
          <Sparkles className="absolute -right-4 -bottom-4 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors" size={120} />
        </label>

        {/* TOTAL INCOME */}
        <div className={cardClass}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
              <ArrowDownLeft size={24} />
            </div>
            <button onClick={onAddCredit} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">+ Add Income</button>
          </div>
          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Total Received</p>
          <h4 className="text-3xl font-black">₹{stats.total_in?.toLocaleString() || 0}</h4>
        </div>

        {/* TOTAL EXPENSE */}
        <div className={cardClass}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl">
              <ArrowUpRight size={24} />
            </div>
            <button onClick={onAddExpense} className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">+ Add Expense</button>
          </div>
          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Total Spent</p>
          <h4 className="text-3xl font-black">₹{stats.total_out?.toLocaleString() || 0}</h4>
        </div>
      </div>

      {/* BOTTOM SECTION: 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT SIDE: RECENT TRANSACTIONS (Takes up 2 columns) */}
        <div className={`${cardClass} lg:col-span-2`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <History size={20} className="text-indigo-500" /> Recent Activity
            </h3>
            <button onClick={onViewLedger} className="text-[10px] font-black opacity-50 uppercase hover:opacity-100 transition-opacity">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${tx.type === 'credit' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div>
                      <p className="font-black text-sm">{tx.title}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase">{tx.category} • {tx.payment_method}</p>
                    </div>
                  </div>
                  <p className={`font-black ${tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center py-10 font-bold opacity-30 italic">No missions recorded this month.</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: RECOVERIES & CALCULATOR (Stacked in 1 column) */}
        <div className="space-y-8">
          
          {/* PENDING RECOVERIES ALERTS */}
          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-8 text-rose-500">
              <AlertCircle size={24} />
              <h3 className="text-xl font-black uppercase tracking-tight">Active Recoveries</h3>
            </div>
            
            <div className="space-y-4">
              {pendingRecoveries && pendingRecoveries.length > 0 ? (
                pendingRecoveries.map((tx) => (
                  <div key={tx.id} className="p-5 rounded-[2rem] border-2 border-rose-500/20 bg-rose-500/5 flex justify-between items-center">
                    <div>
                      <p className="font-black text-sm">{tx.title}</p>
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Expected: {tx.expected_recovery_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-rose-600">₹{tx.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="font-bold opacity-30 italic text-sm">All debts collected.</p>
                </div>
              )}
            </div>
          </div>

          {/* QUICK MATH COMPONENT PLACED HERE */}
          <QuickMathCard darkMode={darkMode} />

        </div>
      </div>
    </div>
  );
}