import { useState, useEffect } from 'react';
import { RefreshCw, Calendar, AlertCircle, Plus, CreditCard, Tag, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Subscriptions({ API_BASE, headers, darkMode, onAddExpense, transactions = [] }) {
  const [data, setData] = useState({ monthly_burn: 0, subscriptions: [] });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchSubscriptions();
  }, [API_BASE, headers]);

  const manualSubscriptions = transactions
    .filter((tx) => tx.type === 'debit' && (tx.is_subscription || tx.category === 'Subscription'))
    .reduce((acc, tx) => {
      const key = `${(tx.title || '').trim().toLowerCase()}::${Number(tx.amount) || 0}::${tx.category || 'Subscription'}`;

      if (!acc[key]) {
        acc[key] = {
          id: `manual-${tx.id}`,
          merchant: tx.title || 'Subscription',
          amount: Number(tx.amount) || 0,
          category: tx.category || 'Subscription',
          frequency: 'manual',
          history_count: 1,
          next_due_date: tx.date,
          source: 'manual'
        };
      } else {
        const existingDate = new Date(acc[key].next_due_date);
        const currentDate = new Date(tx.date);
        acc[key].history_count += 1;
        if (currentDate > existingDate) {
          acc[key].next_due_date = tx.date;
        }
      }

      return acc;
    }, {});

  const mergedSubscriptions = [...data.subscriptions];
  Object.values(manualSubscriptions).forEach((manualSub) => {
    const alreadyPresent = mergedSubscriptions.some((sub) => {
      const merchantMatch = (sub.merchant || '').trim().toLowerCase() === manualSub.merchant.trim().toLowerCase();
      const amountMatch = Number(sub.amount) === manualSub.amount;
      return merchantMatch && amountMatch;
    });

    if (!alreadyPresent) {
      mergedSubscriptions.push(manualSub);
    }
  });

  const displayedSubscriptions = mergedSubscriptions.sort((a, b) => {
    const aDate = new Date(a.next_due_date || 0);
    const bDate = new Date(b.next_due_date || 0);
    return aDate - bDate;
  });

  const displayedMonthlyBurn = displayedSubscriptions.reduce((sum, sub) => {
    const amount = Number(sub.amount) || 0;
    const frequency = (sub.frequency || '').toLowerCase();

    if (frequency.includes('year')) return sum + (amount / 12);
    if (frequency.includes('week')) return sum + (amount * 4);
    return sum + amount;
  }, 0);

  const handleLogPayment = (sub) => {
    if (onAddExpense) {
      onAddExpense({
        type: 'debit',
        prefill: {
          title: sub.merchant,
          amount: sub.amount,
          category: sub.category || 'Subscription',
          is_subscription: true,
          note: `Recurring payment - ${sub.frequency} subscription`
        }
      });
    } else {
      toast.error("Unable to open expense form");
    }
  };

  const handleAddSubscription = () => {
    if (onAddExpense) {
      onAddExpense({
        type: 'debit',
        prefill: {
          category: 'Subscription',
          is_subscription: true
        }
      });
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food': 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      'Transport': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      'Bills': 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Shopping': 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
      'Entertainment': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      'Subscription': 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
      'Savings': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Credit Card Payment': 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
      'Beauty': 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
      'Travel': 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
      'Medicines': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[category] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  };

  if (loading) {
    return <div className="text-center p-10 animate-pulse">Scanning transaction history for subscriptions...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Monthly Burn Header */}
      <div className={`p-8 rounded-3xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} text-center`}>
        <h2 className="text-lg font-medium text-slate-500 mb-2">Total Monthly Burn</h2>
        <div className="text-5xl font-extrabold text-rose-500 flex items-center justify-center gap-2">
          ₹{Math.round(displayedMonthlyBurn).toLocaleString()}
        </div>
        <p className="text-sm mt-4 text-slate-400">
          Identified {displayedSubscriptions.length} active recurring payments.
        </p>
      </div>

      {/* Subscription List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <RefreshCw size={20} className="text-blue-500" /> Active Subscriptions
          </h3>
          <button
            onClick={handleAddSubscription}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/30"
          >
            <Plus size={18} /> Add Subscription
          </button>
        </div>

        {displayedSubscriptions.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border-2 border-dashed ${darkMode ? 'border-slate-700' : 'border-slate-300'} ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <RefreshCw size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className={`text-lg font-bold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              No recurring subscriptions detected yet.
            </p>
            <p className="text-sm text-slate-400 mb-4">
              Log expenses with the "Recurring / Subscription" toggle checked, or use the button above to add one manually.
            </p>
            <button
              onClick={handleAddSubscription}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-700 transition-all"
            >
              <Plus size={18} /> Add Your First Subscription
            </button>
          </div>
        ) : (
          displayedSubscriptions.map((sub, i) => {
            const dueDate = new Date(sub.next_due_date);
            const isDueSoon = (dueDate - new Date()) / (1000 * 60 * 60 * 24) <= 5;
            const isOverdue = (dueDate - new Date()) / (1000 * 60 * 60 * 24) < 0;

            return (
              <div
                key={sub.id || i}
                className={`p-5 rounded-2xl border ${
                  isOverdue
                    ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                    : isDueSoon
                      ? 'border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-900/10'
                      : darkMode
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-slate-100'
                } transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-xl shrink-0 ${
                      isOverdue
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        : isDueSoon
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          : darkMode
                            ? 'bg-slate-700 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Calendar size={24} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-lg truncate">{sub.merchant}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest ${getCategoryColor(sub.category)}`}>
                          <Tag size={10} className="inline mr-1" />{sub.category || 'Subscription'}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {sub.frequency} • Paid {sub.history_count} times
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xl font-bold">₹{sub.amount.toLocaleString()}</div>
                      <div className={`text-sm font-medium flex items-center justify-end gap-1 ${
                        isOverdue
                          ? 'text-red-500'
                          : isDueSoon
                            ? 'text-orange-500'
                            : 'text-slate-400'
                      }`}>
                        {(isOverdue || isDueSoon) && <AlertCircle size={14} />}
                        {isOverdue ? 'Overdue!' : `Due: ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleLogPayment(sub)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 bg-violet-600/10 text-violet-600 hover:bg-violet-600/20 dark:text-violet-400 dark:hover:bg-violet-500/20"
                      title="Log a payment for this subscription"
                    >
                      <CreditCard size={14} />
                      <span className="hidden sm:inline">Log Payment</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Help Text */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
          <LogIn size={16} className="text-violet-500" /> How Subscriptions Work
        </h4>
        <ul className={`text-xs space-y-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <li>• Subscriptions are auto-detected from your recurring transactions</li>
          <li>• When adding an expense, check the <span className="font-bold text-violet-500">"Recurring / Subscription?"</span> toggle to mark it</li>
          <li>• Use the <span className="font-bold text-violet-500">"Subscription"</span> category or any category with the subscription toggle</li>
          <li>• Click <span className="font-bold text-violet-500">"Log Payment"</span> on any subscription to quickly record a payment</li>
        </ul>
      </div>
    </div>
  );
}
