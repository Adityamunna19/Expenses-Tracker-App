import { useState, useEffect } from 'react';
import { X, Percent, IndianRupee } from 'lucide-react';

export default function EMICalculatorModal({ onClose, darkMode }) {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(10.5); // Annual interest rate
  const [years, setYears] = useState(5);
  
  const [results, setResults] = useState({ emi: 0, totalInterest: 0, totalPayment: 0 });

  useEffect(() => {
    const P = parseFloat(principal);
    const R = parseFloat(rate);
    const N = parseFloat(years) * 12; // Convert years to months

    if (P > 0 && R > 0 && N > 0) {
      const monthlyRate = R / 12 / 100;
      const emi = (P * monthlyRate * Math.pow(1 + monthlyRate, N)) / (Math.pow(1 + monthlyRate, N) - 1);
      const totalPayment = emi * N;
      const totalInterest = totalPayment - P;

      setResults({
        emi: Math.round(emi),
        totalInterest: Math.round(totalInterest),
        totalPayment: Math.round(totalPayment)
      });
    } else {
      setResults({ emi: 0, totalInterest: 0, totalPayment: 0 });
    }
  }, [principal, rate, years]);

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all outline-none font-black text-lg ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'}`;
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-2xl p-8 rounded-[3rem] shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-[#f4f6f8]'}`}>
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
              <Percent size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-indigo-600 uppercase tracking-tighter italic">Loan Planner</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Calculate EMI & Interest</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* INPUTS */}
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Principal Amount (₹)</label>
              <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Annual Interest Rate (%)</label>
              <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Loan Tenure (Years)</label>
              <input type="number" step="0.5" value={years} onChange={(e) => setYears(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* RESULTS DASHBOARD */}
          <div className={`p-6 rounded-[2rem] flex flex-col justify-center gap-6 border-2 ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div>
              <p className={labelClass}>Monthly EMI</p>
              <h3 className="text-4xl font-black text-indigo-500">₹{results.emi.toLocaleString()}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className={labelClass}>Total Interest</p>
                <p className="text-xl font-black text-rose-500">₹{results.totalInterest.toLocaleString()}</p>
              </div>
              <div>
                <p className={labelClass}>Total Payment</p>
                <p className="text-xl font-black">₹{results.totalPayment.toLocaleString()}</p>
              </div>
            </div>

            {/* Visual Breakdown Bar */}
            <div className="w-full h-3 flex rounded-full overflow-hidden mt-4">
               <div style={{ width: `${(principal / results.totalPayment) * 100}%` }} className="h-full bg-emerald-500" title="Principal" />
               <div style={{ width: `${(results.totalInterest / results.totalPayment) * 100}%` }} className="h-full bg-rose-500" title="Interest" />
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50 mt-1">
               <span className="text-emerald-500">Principal</span>
               <span className="text-rose-500">Interest</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}