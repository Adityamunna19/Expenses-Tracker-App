import { LayoutDashboard, ReceiptText, Landmark, Undo2, PiggyBank, LogOut } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab, user }) {
  const tabs = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Transactions', icon: <ReceiptText size={18} /> },
    { name: 'Credits', icon: <Landmark size={18} /> },
    { name: 'Recoveries', icon: <Undo2 size={18} /> },
    { name: 'Savings', icon: <PiggyBank size={18} /> },
  ];

  return (
    <nav className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg rounded-[3rem] p-5 md:px-12 flex flex-col lg:flex-row justify-between items-center shadow-sm border border-white mb-12 gap-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Money Cockpit</h1>
        <p className="text-[9px] font-black text-slate-400 tracking-[0.5em] uppercase mt-1">Avionics System v1.0</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 p-2 bg-slate-200/40 rounded-[2rem]">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setCurrentTab(tab.name)}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-sm font-black transition-all ${
              currentTab === tab.name 
              ? 'bg-[#1e293b] text-white shadow-2xl scale-105' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6 lg:pl-10">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-black text-slate-900">{user.name}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pilot Profile</p>
        </div>
        <button className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-rose-500 shadow-sm group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
    </nav>
  );
}