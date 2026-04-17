import React, { useState } from 'react';
import { CreditCard, Wifi, ArrowRightLeft, History, X, Plus } from 'lucide-react';
import CardTransactionsModal from './CardTransactionsModal';
import SetLimitModal from './SetLimitModal';
import { getCardBalanceSnapshot } from '../utils';

export default function CardsPage({ accounts = [], transactions = [], darkMode, user, API_BASE, onSuccess, onPayBill }) {
  const [viewingCard, setViewingCard] = useState(null);
  const [editingLimit, setEditingLimit] = useState(null);

  const cards = accounts.filter(a => a.type === 'card').map(card => {
    const { outstanding, totalSpent, totalPaid } = getCardBalanceSnapshot(card.id, transactions);
    const limit = Number(card.credit_limit) || 0;
    const available = Math.max(0, limit - outstanding);
    const pctUsed = limit > 0 ? Math.min((outstanding / limit) * 100, 100) : 0;
    
    let colorTheme = "from-slate-700 via-slate-800 to-slate-900";
    if (pctUsed > 85) colorTheme = "from-rose-500 via-rose-700 to-rose-900";
    else if (pctUsed > 50) colorTheme = "from-amber-400 via-amber-600 to-amber-800";
    else if (limit > 0) colorTheme = "from-indigo-500 via-purple-700 to-slate-900";

    return { ...card, outstanding, available, limit, pctUsed, colorTheme, totalSpent, totalPaid };
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      <div className="mb-10 px-2">
        <h2 className={`text-4xl font-black tracking-tight uppercase italic drop-shadow-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Credit Cards
        </h2>
        <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Manage limits and audit history</p>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <CreditCard size={48} className="mx-auto mb-4" />
          <p className="font-bold">No credit cards found in your accounts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-2">
          {cards.map(card => (
            <div key={card.id} className="flex flex-col gap-4">
              
              <div className={`w-full p-8 rounded-[2.5rem] text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-gradient-to-br ${card.colorTheme} relative overflow-hidden flex flex-col justify-between min-h-[240px] transition-transform hover:-translate-y-2 border border-white/10`}>
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent z-0 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                
                <button 
                  onClick={() => setEditingLimit(card)}
                  className="absolute bottom-6 right-8 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all z-20 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10"
                >
                  {card.limit > 0 ? 'Edit Limit' : 'Set Limit'}
                </button>
                
                <div className="flex justify-between items-start z-10 relative">
                  <h4 className="font-black text-2xl tracking-tighter opacity-95 drop-shadow-md">{card.name}</h4>
                  <Wifi size={28} className="rotate-90 opacity-60 drop-shadow-md" />
                </div>

                <div className="my-6 z-10 relative">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mb-1 drop-shadow-sm">Outstanding Bill</p>
                  <h2 className="text-4xl font-black tracking-tight drop-shadow-md">₹{card.outstanding.toLocaleString()}</h2>
                </div>

                <div className="z-10 relative">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Available Limit</p>
                    <p className="font-black drop-shadow-sm">₹{card.available.toLocaleString()}</p>
                  </div>
                  <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="h-full bg-white/90 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${card.pctUsed}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setViewingCard(card)} 
                  className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                    darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50 shadow-sm border border-slate-100'
                  }`}
                >
                  <History size={16} /> History
                </button>

                <button 
                  onClick={() => onPayBill?.(card.id)} 
                  className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                    darkMode ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/50' : 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/30'
                  }`}
                >
                  <ArrowRightLeft size={16} /> Pay Bill
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {viewingCard && (
        <CardTransactionsModal 
          card={viewingCard} 
          transactions={transactions} 
          onClose={() => setViewingCard(null)} 
          darkMode={darkMode} 
        />
      )}

      {editingLimit && (
        <SetLimitModal 
          card={editingLimit} 
          user={user}
          API_BASE={API_BASE}
          onClose={() => setEditingLimit(null)} 
          onSuccess={onSuccess} 
          darkMode={darkMode} 
        />
      )}

    </div>
  );
}
