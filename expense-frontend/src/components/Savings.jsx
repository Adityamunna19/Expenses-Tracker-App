import { useEffect, useMemo, useState } from 'react';
import { Vault, TrendingUp, History, PieChart, Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { formatStoredDate } from '../utils';
import { isGrowwAccount, resolveMerchantName } from '../utils/financeConfig';

export default function Savings({ darkMode, API_BASE, headers, transactions = [], accounts = [] }) {
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!headers?.['X-User-ID']) {
        setLoadingGoals(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/goals`, { headers });
        const data = await response.json();
        setGoals(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Vault synchronization failed.');
      } finally {
        setLoadingGoals(false);
      }
    };

    fetchGoals();
  }, [API_BASE, headers]);

  const growwAccounts = useMemo(() => accounts.filter((account) => isGrowwAccount(account)), [accounts]);

  const savingsMovements = useMemo(() => {
    const movements = (transactions || [])
      .filter((tx) => {
        const category = String(tx.category || '').toLowerCase();
        const hasGrowwLink = growwAccounts.some((account) => account.id === tx.account_id || account.id === tx.to_account_id);
        return category === 'savings' || hasGrowwLink;
      })
      .sort((a, b) => new Date(a.date || a.created_at || 0) - new Date(b.date || b.created_at || 0));

    let runningBalance = 0;
    return movements.map((tx) => {
      const amount = Number(tx.amount) || 0;
      const isDeposit = tx.type === 'debit';
      runningBalance += isDeposit ? amount : -amount;

      return {
        ...tx,
        amount,
        movement: isDeposit ? amount : -amount,
        balance: runningBalance,
      };
    });
  }, [transactions, growwAccounts]);

  const savingsInflow = savingsMovements
    .filter((tx) => tx.type === 'debit')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const savingsOutflow = savingsMovements
    .filter((tx) => tx.type === 'credit')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalVaultValue = Math.max(0, savingsInflow - savingsOutflow);

  const chartData = savingsMovements.map((tx) => ({
    ...tx,
    label: formatStoredDate(tx.date || tx.created_at, { year: false }) || '',
  }));

  if (loadingGoals) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="font-black opacity-20 text-2xl uppercase italic">Opening Vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        <div className={`p-10 rounded-[3rem] shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} flex flex-col justify-center`}>
          <div className="w-16 h-16 bg-indigo-600/10 text-indigo-600 rounded-3xl flex items-center justify-center mb-6">
            <Vault size={32} />
          </div>
          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mb-1">Savings Portfolio</p>
          <h2 className="text-5xl font-black text-indigo-600 tracking-tighter">₹{totalVaultValue.toLocaleString()}</h2>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.25em] opacity-40">
            {growwAccounts.length > 0 ? `Linked: ${growwAccounts.map((account) => account.name).join(', ')}` : 'No Groww account linked yet'}
          </p>
        </div>

        <div className={`p-10 rounded-[3rem] shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} flex flex-col justify-between gap-6`}>
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <ArrowDownLeft size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Incoming</p>
              <p className="text-4xl font-black text-emerald-500">₹{savingsInflow.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500">
              <ArrowUpRight size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Outgoing</p>
              <p className="text-4xl font-black text-rose-500">₹{savingsOutflow.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className={`lg:col-span-1 p-10 rounded-[3rem] shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} h-72`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black uppercase text-xs opacity-40 tracking-widest">Savings Momentum</h3>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} vertical={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '24px',
                  border: 'none',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  fontWeight: 'bold',
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  color: darkMode ? '#fff' : '#000',
                }}
                formatter={(value, name) => [
                  name === 'balance' ? `₹${Number(value).toLocaleString()}` : `₹${Number(value).toLocaleString()}`,
                  name === 'balance' ? 'Balance' : 'Movement',
                ]}
              />
              <Area type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorSavings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2 ml-2">
            <PieChart className="text-indigo-600" size={24} />
            <h3 className="text-2xl font-black italic tracking-tight uppercase">Goal Progress Overview</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {goals.length === 0 ? (
              <div className="py-10 text-center font-black opacity-30 text-sm uppercase italic tracking-widest border-2 border-dashed rounded-[2rem]">No Goals active</div>
            ) : (
              goals.map((goal) => {
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
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2 ml-2">
            <History className="text-indigo-600" size={24} />
            <h3 className="text-2xl font-black italic tracking-tight uppercase">Vault Ledger</h3>
          </div>
          <div className="space-y-4">
            {savingsMovements.length === 0 ? (
              <div className="py-20 text-center font-black opacity-30 text-lg uppercase italic tracking-widest border-2 border-dashed rounded-[3rem]">
                No savings flow recorded
              </div>
            ) : (
              savingsMovements
                .slice()
                .reverse()
                .map((entry) => (
                  <div key={entry.id} className={`p-6 rounded-[2.5rem] flex justify-between items-center transition-all hover:scale-[1.02] shadow-sm ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${entry.type === 'debit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {entry.type === 'debit' ? <TrendingUp size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-black text-sm tracking-tight">{resolveMerchantName(entry.title)}</p>
                        <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">
                          {formatStoredDate(entry.date || entry.created_at, { year: false })} • {entry.type === 'debit' ? 'Incoming' : 'Outgoing'}
                        </p>
                      </div>
                    </div>
                    <p className={`font-black text-xl tracking-tighter ${entry.type === 'debit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {entry.type === 'debit' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
