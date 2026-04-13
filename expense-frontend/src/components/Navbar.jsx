import { LayoutDashboard, ReceiptText, Landmark, Undo2, Target, Vault } from 'lucide-react';

// Added onOpenProfile to the props
export default function Navbar({ currentTab, setCurrentTab, user, darkMode, onOpenProfile }) {
  const tabs = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Transactions', icon: <ReceiptText size={18} /> },
    { name: 'Debts', icon: <Landmark size={18} /> },
    { name: 'Recoveries', icon: <Undo2 size={18} /> },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Savings', icon: <Vault size={18} /> }
  ];

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
      
      {/* TRIGGER BUTTON: Wrapped the profile area in a button */}
      <button 
        onClick={onOpenProfile}
        className={`flex items-center gap-4 p-2 pr-6 rounded-[2rem] transition-all hover:scale-105 active:scale-95 border-2 border-transparent ${darkMode ? 'hover:bg-slate-800 hover:border-slate-700' : 'hover:bg-white hover:border-slate-200 hover:shadow-sm'}`}
      >
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-white font-black text-xl tracking-tighter">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'MC'}
          </span>
        </div>
        <div className="text-left">
          <h1 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Money Cockpit</h1>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Pilot: {user?.name}</p>
        </div>
      </button>

      <div className={`flex justify-start md:justify-center gap-2 p-2 rounded-[2.5rem] border shadow-sm w-full md:w-auto overflow-x-auto scrollbar-hide ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 backdrop-blur-md'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setCurrentTab(tab.name)}
            className={`flex items-center gap-2 px-5 py-3 rounded-[2rem] font-bold text-sm transition-all whitespace-nowrap ${
              currentTab === tab.name
                ? (darkMode ? 'bg-white text-slate-900 shadow-md' : 'bg-slate-900 text-white shadow-md')
                : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}