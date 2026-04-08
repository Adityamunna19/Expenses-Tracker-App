import { Search, Filter, Trash2, Edit3, ReceiptText } from 'lucide-react';

export default function Transactions({ transactions, searchQuery, setSearchQuery, onDelete, onEdit }) {
  const filtered = transactions.filter(tx => 
    tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-10 px-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Ledger</h2>
      </div>

      <div className="bg-white px-8 py-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10 flex items-center gap-6">
        <Search className="text-slate-300" size={28} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..." 
          className="w-full bg-transparent border-none focus:outline-none font-black text-xl"
        />
      </div>

      <div className="space-y-4 px-4">
        {filtered.map((tx) => (
          <div key={tx.id} className="bg-white/70 p-7 rounded-[2.5rem] border border-white flex items-center justify-between group hover:bg-white transition-all">
            <div className="flex items-center gap-8">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-xl ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {tx.type === 'credit' ? 'IN' : 'OUT'}
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">{tx.title}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase">{tx.category} • {new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <p className={`text-3xl font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                ₹{tx.amount.toLocaleString()}
              </p>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => onEdit(tx)} className="p-3 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => onDelete(tx.id)} className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}