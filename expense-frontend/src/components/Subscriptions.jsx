import { useState, useEffect } from 'react';
import { RefreshCw, Calendar, AlertCircle } from 'lucide-react';

export default function Subscriptions({ API_BASE, headers, darkMode }) {
  const [data, setData] = useState({ monthly_burn: 0, subscriptions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await fetch(`${API_BASE}/subscriptions`, { headers });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [API_BASE, headers]);

  if (loading) {
    return <div className="text-center p-10 animate-pulse">Scanning transaction history for subscriptions...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Monthly Burn Header */}
      <div className={`p-8 rounded-3xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} text-center`}>
        <h2 className="text-lg font-medium text-slate-500 mb-2">Total Monthly Burn</h2>
        <div className="text-5xl font-extrabold text-rose-500 flex items-center justify-center gap-2">
          ₹{data.monthly_burn.toLocaleString()}
        </div>
        <p className="text-sm mt-4 text-slate-400">
          Identified {data.subscriptions.length} active recurring payments.
        </p>
      </div>

      {/* Subscription List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
          <RefreshCw size={20} className="text-blue-500" /> Active Subscriptions
        </h3>

        {data.subscriptions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-500">
            No recurring subscriptions detected yet. Keep logging transactions!
          </div>
        ) : (
          data.subscriptions.map((sub, i) => {
            const dueDate = new Date(sub.next_due_date);
            const isDueSoon = (dueDate - new Date()) / (1000 * 60 * 60 * 24) <= 5; // Due in next 5 days

            return (
              <div 
                key={sub.id || i} 
                className={`p-5 rounded-2xl flex items-center justify-between border ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                } transition-all hover:shadow-md`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isDueSoon ? 'bg-orange-100 text-orange-600' : (darkMode ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-600')}`}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{sub.merchant}</h4>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {sub.frequency} • Paid {sub.history_count} times
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold">₹{sub.amount.toLocaleString()}</div>
                  <div className={`text-sm font-medium flex items-center justify-end gap-1 ${isDueSoon ? 'text-orange-500' : 'text-slate-400'}`}>
                    {isDueSoon && <AlertCircle size={14} />}
                    Due: {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}