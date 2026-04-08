import { Plus, PiggyBank, Landmark } from 'lucide-react';

export default function Savings() {
  const goals = [
    { id: 1, title: 'MacBook Pro M3', target: 160000, saved: 104000, color: 'bg-blue-600', icon: <PiggyBank size={32}/>, percent: 65 },
    { id: 2, title: 'Emergency Fund', target: 200000, saved: 40000, color: 'bg-emerald-500', icon: <Landmark size={32}/>, percent: 20 }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-10 px-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Savings Goals</h2>
          <p className="text-slate-500 font-bold">Fuel your future purchases.</p>
        </div>
        <button className="bg-[#1e293b] hover:bg-slate-800 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-2 shadow-xl transition-all">
          <Plus size={20} /> New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-slate-50 text-slate-600 rounded-3xl flex items-center justify-center shadow-inner">
                {goal.icon}
              </div>
              <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-4 py-2 rounded-full uppercase tracking-[0.1em]">{goal.percent}% Reached</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 mb-1">{goal.title}</h4>
            <p className="text-slate-400 font-bold text-sm mb-6">Target: ₹{goal.target.toLocaleString()}</p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Saved: ₹{goal.saved.toLocaleString()}</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${goal.color} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${goal.percent}%` }}></div>
              </div>
            </div>
            <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 rounded-2xl font-black transition-all border border-slate-100">
              Add Funds
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}