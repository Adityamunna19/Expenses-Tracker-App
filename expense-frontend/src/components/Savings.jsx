import { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, Sparkles, Loader2, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast'; // Import the toaster

export default function Savings({ darkMode, API_BASE, headers }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isResearching, setIsResearching] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [fundAmounts, setFundAmounts] = useState({});

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_BASE}/goals`, { headers });
      if (!response.ok) throw new Error("Failed to fetch goals from database.");
      const data = await response.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleResearch = async () => {
  if (!newGoalTitle) return toast.error("Enter a product name first!");
  setIsResearching(true);
  
  const loadingToast = toast.loading("Azure AI is researching...");
  
  try {
    const response = await fetch(`${API_BASE}/goals/research?query=${newGoalTitle}`, { headers });
    const data = await response.json();

    // Mapping ensures target_amount is NEVER zero if price exists
    const finalData = {
      title: data.title || newGoalTitle,
      target_amount: data.price || data.target_amount || 0, // Fallback chain
      image_url: data.image_url || `https://source.unsplash.com/featured/300x300?${data.image_keyword || 'tech'}`
    };

    if (finalData.target_amount === 0) {
      toast.error("AI found the product but couldn't verify the price.");
    }

    setAiResult(finalData);
    setShowConfirmModal(true);
    // ...
  } catch (err) {
    toast.error("Research failed.");
  }
};

  const confirmAiGoal = async () => {
    try {
      const response = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          title: aiResult?.title,
          target_amount: aiResult?.target_amount,
          current_amount: 0.0,
          user_id: headers['X-User-ID'],
          image_url: aiResult?.image_url
        })
      });

      if (!response.ok) throw new Error("Database rejected the new goal.");
      
      toast.success("Goal Plotted Successfully!");
      setNewGoalTitle('');
      setShowConfirmModal(false);
      fetchGoals();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const response = await fetch(`${API_BASE}/goals/${goalId}`, {
        method: 'DELETE',
        headers: headers
      });
      if (!response.ok) throw new Error("Could not delete. Check RLS policies.");
      
      toast.success("Goal Deleted");
      fetchGoals();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- PREVENT BLANK SCREEN: LOADING STATE ---
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="font-black opacity-20 text-2xl uppercase italic">Scanning Horizons...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10 relative pb-20">
      
      {/* --- AI CONFIRMATION MODAL --- */}
      {showConfirmModal && aiResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-sm overflow-hidden rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className="aspect-square w-full relative">
              <img src={aiResult.image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            </div>
            <div className="p-8 text-center -mt-10 relative">
              <h3 className="text-2xl font-black mb-1">{aiResult.title}</h3>
              <p className="text-3xl font-black text-indigo-500 mb-6">
  ₹{(aiResult.target_amount || aiResult.price || 0).toLocaleString()}
</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">Cancel</button>
                <button onClick={confirmAiGoal} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- INPUT HEADER --- */}
      <div className={`p-10 rounded-[3.5rem] shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex items-center gap-5 mb-8">
          <div className="p-5 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-500/30"><Target size={32} /></div>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">Goal Cockpit</h2>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Azure AI Research</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-[3] relative">
            <input 
              type="text" placeholder="What are we saving for?" value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className={`w-full px-8 py-5 pr-16 rounded-3xl font-bold outline-none border-2 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-slate-50 border-transparent text-slate-900 focus:border-indigo-500'}`}
            />
            <button
              type="button" onClick={handleResearch} disabled={isResearching}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {isResearching ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- GOALS HERO GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 px-2">
        {goals.length === 0 ? (
          <div className="col-span-full text-center py-20 font-black opacity-20 text-2xl uppercase tracking-widest">No Destinations Plotted</div>
        ) : (
          goals.map(goal => {
            const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const isCompleted = progress >= 100;

            return (
              <div key={goal.id} className={`group relative overflow-hidden rounded-[3.5rem] shadow-2xl border-2 transition-all duration-500 hover:-translate-y-3 ${isCompleted ? 'border-emerald-500' : 'border-transparent'} ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                
                <button 
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="absolute top-6 left-6 z-20 p-3.5 bg-white/10 backdrop-blur-md text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 shadow-xl"
                >
                  <Trash2 size={20} />
                </button>

                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200 dark:bg-slate-900">
                  <img 
                    src={goal.image_url || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=500"} 
                    alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className={`absolute top-6 right-6 px-4 py-2 rounded-2xl font-black text-[10px] tracking-widest shadow-xl backdrop-blur-md ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-900'}`}>
                    {progress.toFixed(0)}% FUNDED
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-black mb-6 truncate tracking-tight">{goal.title}</h3>
                  <div className="space-y-6">
                    <div className={`w-full h-5 rounded-full p-1.5 ${darkMode ? 'bg-slate-900' : 'bg-slate-100 shadow-inner'}`}>
                      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between items-end pt-2">
                      <div>
                        <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Available</p>
                        <p className="text-2xl font-black text-indigo-600">₹{goal.current_amount?.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Target</p>
                        <p className="text-sm font-black opacity-60">₹{goal.target_amount?.toLocaleString()}</p>
                      </div>
                    </div>
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