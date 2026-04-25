import { useState, useEffect } from 'react';
import { Vault, TrendingUp, History, PieChart, Loader2 } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { formatStoredDate } from '../utils';

export default function Savings({ darkMode, API_BASE, headers }) {
  const [goals, setGoals] = useState([]);
  const [savingsHistory, setSavingsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!headers['X-User-ID']) return;
    try {
      const [gRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/goals`, { headers }),
        fetch(`${API_BASE}/transactions`, { headers })
      ]);
      
      const gData = await gRes.json();
      const tData = await tRes.json();
      
      setGoals(Array.isArray(gData) ? gData : []);
      // Filter transactions to ONLY show General "Savings"
      const filtered = Array.isArray(tData) ? tData.filter(t => t.category === "Savings") : [];
      setSavingsHistory(filtered.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at)));
    } catch (err) {
      toast.error("Vault synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_BASE, headers]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="font-black opacity-20 text-2xl uppercase italic">Opening Vault...</p>
    </div>
  );

  // NEW MATH: Total Vault Value is now the sum of your 'Savings' transactions, NOT your goals!
  const totalVaultValue = savingsHistory.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* HEADER SECTION: STATS & CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        <div className={`p-10 rounded-[3rem] shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} flex flex-col justify-center`}>
          <div className="w-16 h-16 bg-indigo-600/10 text-indigo-600 rounded-3xl flex items-center justify-center mb-6">
            <Vault size={32} />
          </div>
          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mb-1">General Savings</p>
          <h2 className="text-5xl font-black text-indigo-600 tracking-tighter">₹{totalVaultValue.toLocaleString()}</h2>
        </div>

        <div className={`lg:col-span-2 p-10 rounded-[3rem] shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} h-72`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black uppercase text-xs opacity-40 tracking-widest">Savings Momentum</h3>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[...savingsHistory].reverse()}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#000' }} />
              <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorSavings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CONTENT SECTION: PROGRESS & LEDGER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-4">
        
        {/* GOAL PROGRESS OVERVIEW */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2 ml-2">
            <PieChart className="text-indigo-600" size={24} />
            <h3 className="text-2xl font-black italic tracking-tight uppercase">Goal Progress Overview</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {goals.length === 0 ? (
               <div className="py-10 text-center font-black opacity-30 text-sm uppercase italic tracking-widest border-2 border-dashed rounded-[2rem]">No Goals active</div>
            ) : goals.map(goal => {
              const progress = Math.min(((goal.current_amount || 0) / (goal.target_amount || 1)) * 100, 100);
              return (
                <div key={goal.id} className={`p-8 rounded-[2.5rem] shadow-lg border-2 border-transparent hover:border-indigo-500/20 transition-all ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-black text-lg tracking-tight">{goal.title}</span>
                    <span className="text-xs font-black px-4 py-1.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/20">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className={`w-full h-4 rounded-full p-1 mb-4 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                    <div 
                      className="h-full rounded-full bg-indigo-600 transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-black opacity-40 uppercase tracking-widest">
                    <span>Saved: ₹{goal.current_amount?.toLocaleString()}</span>
                    <span>Target: ₹{goal.target_amount?.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GENERAL SAVINGS LEDGER */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2 ml-2">
            <History className="text-indigo-600" size={24} />
            <h3 className="text-2xl font-black italic tracking-tight uppercase">Vault Ledger</h3>
          </div>
          <div className="space-y-4">
            {savingsHistory.length === 0 ? (
              <div className="py-20 text-center font-black opacity-30 text-lg uppercase italic tracking-widest border-2 border-dashed rounded-[3rem]">No deposits found</div>
            ) : (
              savingsHistory.map(t => (
                <div key={t.id} className={`p-6 rounded-[2.5rem] flex justify-between items-center transition-all hover:scale-[1.02] shadow-sm ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="font-black text-sm tracking-tight">{t.title}</p>
                      <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">{formatStoredDate(t.date || t.created_at, { year: false })}</p>
                    </div>
                  </div>
                  <p className="font-black text-emerald-500 text-xl tracking-tighter">+₹{t.amount.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
