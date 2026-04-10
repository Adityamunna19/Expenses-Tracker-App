import { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp } from 'lucide-react';

export default function Savings({ darkMode, API_BASE, headers }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  
  // State to hold the specific fund amount typed for each goal
  const [fundAmounts, setFundAmounts] = useState({});

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_BASE}/goals`, { headers });
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      } else {
        setError("Backend rejected the request.");
      }
    } catch (err) {
      setError("Unable to reach goals service.");
    } finally {
      setLoading(false);
    }
  };

  // 🚨 THE FIX: This prevents the Infinite Loop!
  useEffect(() => {
    fetchGoals();
  }, []); // The empty brackets mean "Only run this ONCE when the component mounts"

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalTarget) return;

    try {
      const response = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          title: newGoalTitle,
          target_amount: parseFloat(newGoalTarget),
          current_amount: 0.0,
          // Extract the user ID directly from the headers prop
          user_id: headers['X-User-ID'] 
        })
      });

      if (response.ok) {
        setNewGoalTitle('');
        setNewGoalTarget('');
        fetchGoals(); // Refresh the list without looping
      } else {
        alert("Failed to create goal. Check database RLS.");
      }
    } catch (err) {
      alert("Network error while creating goal.");
    }
  };

  const handleAddFund = async (goalId) => {
    const amountToAdd = parseFloat(fundAmounts[goalId]);
    if (!amountToAdd || amountToAdd <= 0) return;

    try {
      const response = await fetch(`${API_BASE}/goals/${goalId}/add`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ amount_to_add: amountToAdd })
      });

      if (response.ok) {
        // Clear the input box for this specific goal
        setFundAmounts({ ...fundAmounts, [goalId]: '' });
        fetchGoals(); // Refresh the progress bars
      } else {
        alert("Failed to add funds.");
      }
    } catch (err) {
      alert("Network error while adding funds.");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* Header Section */}
      <div className={`p-8 rounded-[3rem] shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
            <Target size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black">Future Funds</h2>
            <p className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Allocate cash flow to your financial goals.</p>
          </div>
        </div>

        {error && <p className="text-red-500 font-bold mb-4">{error}</p>}

        <form onSubmit={handleCreateGoal} className="flex gap-4 mt-6">
          <input 
            type="text" 
            placeholder="Goal Title (e.g., Emergency Fund)" 
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            className={`flex-2 px-6 py-4 rounded-2xl font-bold outline-none border focus:border-indigo-500 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`}
            required
          />
          <input 
            type="number" 
            placeholder="Target Amount (₹)" 
            value={newGoalTarget}
            onChange={(e) => setNewGoalTarget(e.target.value)}
            className={`flex-1 px-6 py-4 rounded-2xl font-black outline-none border focus:border-indigo-500 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`}
            required
          />
          <button type="submit" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2">
            <Plus size={20} /> Create Goal
          </button>
        </form>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="font-bold text-slate-400 p-4">Loading your cockpit goals...</p>
        ) : goals.length === 0 ? (
          <p className="font-bold text-slate-400 p-4">No goals plotted yet. Enter a destination above!</p>
        ) : (
          goals.map(goal => {
            const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const isCompleted = progress >= 100;

            return (
              <div key={goal.id} className={`p-8 rounded-[3rem] shadow-lg border-2 ${isCompleted ? 'border-emerald-500' : 'border-transparent'} ${darkMode ? 'bg-slate-800' : 'bg-white'} flex flex-col justify-between`}>
                
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-black">{goal.title}</h3>
                    <div className={`px-4 py-2 rounded-xl font-bold text-sm ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {progress.toFixed(1)}% Funded
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <div className="flex justify-between font-bold text-sm">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Current: ₹{goal.current_amount.toLocaleString()}</span>
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Target: ₹{goal.target_amount.toLocaleString()}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className={`w-full h-4 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Add Funds Action */}
                {!isCompleted && (
                  <div className="flex gap-3">
                    <input 
                      type="number" 
                      placeholder="Add Amount"
                      value={fundAmounts[goal.id] || ''}
                      onChange={(e) => setFundAmounts({...fundAmounts, [goal.id]: e.target.value})}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold outline-none text-sm border focus:border-indigo-500 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-transparent'}`}
                    />
                    {/* 🚨 FIX: ensure onClick uses an arrow function so it doesn't run instantly */}
                    <button 
                      onClick={() => handleAddFund(goal.id)}
                      className="bg-slate-900 text-white px-4 py-3 rounded-xl font-black shadow-md hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center"
                      title="Fund this goal"
                    >
                      <TrendingUp size={18} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}