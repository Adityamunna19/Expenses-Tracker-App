import { Minus, Plus, ArrowRight, PieChart as PieIcon, BarChart3, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

export default function Dashboard({ 
  recentTransactions, pendingRecoveries, stats, analytics, onAddExpense, onAddCredit, onViewLedger 
}) {
  const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500 pb-10">
      
      {/* =========================================
          LEFT COLUMN: Insights & Data (Spans 8/12)
          ========================================= */}
      <div className="xl:col-span-8 space-y-8">
        
        {/* 1. Greeting & Top Line Stats */}
        <div>
          <p className="text-xs font-bold text-amber-600 tracking-widest mb-2 uppercase">Overview</p>
          <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">
            {stats.net >= 0 ? "You are still cash-positive." : "You've spent more than you earned."}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] text-slate-400 font-black uppercase mb-2 tracking-widest">Net Flow</p>
              <p className={`text-2xl font-black ${stats.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ₹{stats.net?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] text-slate-400 font-black uppercase mb-2 tracking-widest">Top Category</p>
              <p className="text-2xl font-black text-slate-900 truncate">
                {analytics?.categories?.[0]?.name || 'N/A'}
              </p>
            </div>
            <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] text-amber-600/70 font-black uppercase mb-2 tracking-widest">Recoveries</p>
              <p className="text-2xl font-black text-amber-600">{pendingRecoveries.length} Pending</p>
            </div>
          </div>
        </div>

        {/* 2. Charts Row (Given room to breathe!) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
             <div className="flex items-center gap-2 mb-6">
                <PieIcon size={16} className="text-blue-500" />
                <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Category Spend</h3>
             </div>
             <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={analytics?.categories || []} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                     {analytics?.categories?.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
             <div className="flex items-center gap-2 mb-6">
                <BarChart3 size={16} className="text-emerald-500" />
                <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Payment Rail</h3>
             </div>
             <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={analytics?.payment_modes || []} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                   <Tooltip cursor={{ fill: '#f8fafc', radius: 8 }} formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                   <Bar dataKey="value" fill="#1e293b" radius={[6, 6, 6, 6]} maxBarSize={40} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* 3. Recent Activity */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity size={20} className="text-slate-400" /> Recent Ledger
            </h3>
            <button onClick={onViewLedger} className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors bg-blue-50 px-4 py-2 rounded-full">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-3 border border-white shadow-sm space-y-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white rounded-[2rem] transition-all border border-transparent hover:border-slate-100 group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-md">{tx.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{tx.category}</p>
                    </div>
                  </div>
                  <span className={`font-black text-lg ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    ₹{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="p-10 text-center text-slate-400 font-bold">No transactions found.</p>
            )}
          </div>
        </div>

      </div>

      {/* =========================================
          RIGHT COLUMN: Action Center (Spans 4/12)
          ========================================= */}
      <div className="xl:col-span-4 space-y-4">
        
        {/* Total Debits Highlight */}
        <div className="bg-[#1e293b] text-white p-8 md:p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3">Total Monthly Debits</p>
          <h3 className="text-5xl md:text-6xl font-black tracking-tighter relative z-10">
            ₹{stats.total_out?.toLocaleString() || "0"}
          </h3>
        </div>

        {/* Total Income */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Total Money In</p>
            <h3 className="text-3xl font-black text-slate-900">₹{stats.total_in?.toLocaleString() || "0"}</h3>
          </div>
          <div className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
             <Plus size={24} />
          </div>
        </div>

        {/* Quick Actions Array */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button onClick={onAddExpense} className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-6 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 transition-all active:scale-95 border border-rose-100">
            <div className="bg-white rounded-full p-2 shadow-sm"><Minus size={20} /></div>
            <span className="text-xs tracking-wide">Add Expense</span>
          </button>
          
          <button onClick={onAddCredit} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-6 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 transition-all active:scale-95 border border-emerald-100">
            <div className="bg-white rounded-full p-2 shadow-sm"><Plus size={20} /></div>
            <span className="text-xs tracking-wide">Add Credit</span>
          </button>
        </div>

      </div>
    </div>
  );
}