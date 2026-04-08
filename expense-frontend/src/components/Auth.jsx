import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp } = useAuth();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = isSignUp 
        ? await signUp(email, password) 
        : await signIn(email, password);

      if (error) {
        console.error("Auth Error Object:", error);
        alert(`Auth Error: ${error.message}`);
        return;
      }

      if (data && isSignUp) {
        alert("Check your email for the confirmation link! (Or check Supabase logs if email is disabled)");
      }
    } catch (err) {
      console.error("Network Error:", err);
      alert("Failed to reach Supabase. Check your internet connection or supabaseClient.js config.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8eee4] p-6">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md border border-white">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl">
            <Zap className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Money Cockpit</h2>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Authorization Required</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input type="email" placeholder="Email Address" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl outline-none font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input type="password" placeholder="Password" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl outline-none font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95">
            {isSignUp ? 'Create Account' : 'Enter Cockpit'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 font-bold text-sm">
          {isSignUp ? "Already a pilot?" : "New to the cockpit?"} 
          <button onClick={() => setIsSignUp(!isSignUp)} className="ml-2 text-blue-600 hover:underline">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}