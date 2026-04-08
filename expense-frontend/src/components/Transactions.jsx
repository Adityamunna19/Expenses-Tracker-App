import { Search, Trash2, Edit3, Download, Filter, Receipt } from 'lucide-react';

export default function Transactions({ 
  transactions, 
  searchQuery, 
  setSearchQuery, 
  onDelete, 
  onEdit, 
  darkMode 
}) {

  // Function to Export Ledger to CSV
  const exportToCSV = () => {
    const headers = ["Date", "Title", "Type", "Amount", "Category", "Mode"];
    const rows = transactions.map(tx => [
      new Date(tx.created_at).toLocaleDateString(),
      tx.title,
      tx.type,
      tx.amount,
      tx.category,
      tx.payment_mode || "UPI"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Money_Cockpit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header & Search Bar Area */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-10 gap-6 px-2">
        <div>
          <h2 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Financial Ledger
          </h2>
          <p className="text-slate-500 font-bold mt-1">Audit and manage your historical records.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Search Engine */}
          <div className="relative w-full md:w-96 group">
            <Search 
              className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-slate-500' : 'text-slate-400'} group-focus-within:text-blue-500`} 
              size={20} 
            />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or category..."
              className={`w-full pl-14 pr-6 py-4 rounded-2xl border-none outline-none font-bold shadow-sm transition-all ${
                darkMode 
                ? 'bg-slate-800 text-white placeholder:text-slate-500 ring-1 ring-slate-700 focus:ring-2 focus:ring-blue-500' 
                : 'bg-white text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-50'
              }`}
            />
          </div>

          {/* Export Button */}
          <button 
            onClick={exportToCSV}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-sm ${
              darkMode 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3 px-2">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <div 
              key={tx.id} 
              className={`group p-5 md:p-6 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all border ${
                darkMode 
                ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600' 
                : 'bg-white border-transparent hover:border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-5">
                {/* Transaction Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner shrink-0 ${
                  tx.type === 'credit' 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-rose-500/10 text-rose-500'
                }`}>
                  {tx.type === 'credit' ? <Receipt size={24} /> : <Filter size={24} className="rotate-180" />}
                </div>

                <div>
                  <h5 className={`text-lg font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {tx.title}
                  </h5>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tx.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(tx.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {tx.is_secret && (
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                        • Secret
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-8">
                {/* Amount Display */}
                <div className="text-right">
                  <p className={`text-2xl font-black ${
                    tx.type === 'credit' 
                    ? 'text-emerald-500' 
                    : (darkMode ? 'text-white' : 'text-slate-900')
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    via {tx.payment_mode || 'UPI'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onEdit(tx)}
                    className={`p-3 rounded-xl transition-all ${
                      darkMode ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Edit3 size={20} />
                  </button>
                  <button 
                    onClick={() => onDelete(tx.id)}
                    className="p-3 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`text-center py-20 rounded-[3rem] border-2 border-dashed ${
            darkMode ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <p className="text-slate-400 font-bold text-lg">No transactions matched your search.</p>
            <button 
              onClick={() => setSearchQuery("")} 
              className="text-blue-500 font-black mt-2 hover:underline"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}