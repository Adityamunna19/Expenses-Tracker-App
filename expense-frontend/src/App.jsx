import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Recoveries from './components/Recoveries';
import Debts from './components/Debts';
import Savings from './components/Savings';
import AddTransactionModal from './components/AddTransactionModal';
import { Moon, Sun, LogOut } from 'lucide-react';

function MainApp() {
  const { user, signOut } = useAuth();
  
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_in: 0, total_out: 0, net: 0 });
  const [analytics, setAnalytics] = useState({ categories: [] });

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // GLOBAL FETCH HEADER CONFIG
  const fetchOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': user?.id  // Send the logged-in user's ID to Python
    }
  };

  const fetchData = async () => {
    if (!user) return;
    try {
      const transRes = await fetch('http://localhost:8000/transactions', fetchOptions);
      setTransactions(await transRes.json());

      const statsRes = await fetch(`http://localhost:8000/stats?month=${filterMonth}&year=${filterYear}`, fetchOptions);
      setStats(await statsRes.json());

      const analyticsRes = await fetch(`http://localhost:8000/analytics?month=${filterMonth}&year=${filterYear}`, fetchOptions);
      setAnalytics(await analyticsRes.json());
    } catch (err) { console.error("Data Fetch Error:", err); }
  };

  useEffect(() => {
    fetchData();
  }, [filterMonth, filterYear, user]);

  const filteredTransactions = transactions.filter(tx => 
    tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRecoveries = transactions.filter(t => t.is_recovery && t.type === 'debit' && !t.is_recovered);

  return (
    <div className={`${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#f8eee4] text-slate-800'} min-h-screen transition-colors duration-500 p-4 md:p-10 pb-24 font-sans`}>
      
      {/* --- UTILITY BAR --- */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <button onClick={signOut} className="p-4 bg-rose-500 text-white rounded-full shadow-2xl active:scale-90"><LogOut size={24} /></button>
        <button onClick={() => setDarkMode(!darkMode)} className={`p-4 rounded-full shadow-2xl transition-all ${darkMode ? 'bg-amber-400 text-slate-900' : 'bg-slate-900 text-white'}`}><Sun size={24} /></button>
      </div>

      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} user={{ name: user.email.split('@')[0] }} darkMode={darkMode} />

      <main className="max-w-7xl mx-auto">
        {currentTab === 'Dashboard' && <Dashboard recentTransactions={transactions} pendingRecoveries={pendingRecoveries} stats={stats} analytics={analytics} filterMonth={filterMonth} setFilterMonth={setFilterMonth} filterYear={filterYear} setFilterYear={setFilterYear} onAddExpense={() => setActiveModal('debit')} onAddCredit={() => setActiveModal('credit')} onViewLedger={() => setCurrentTab('Transactions')} darkMode={darkMode} />}
        {currentTab === 'Transactions' && <Transactions transactions={filteredTransactions} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onDelete={async (id) => { await fetch(`http://localhost:8000/transactions/${id}`, { method: 'DELETE', ...fetchOptions }); fetchData(); }} onEdit={() => {}} darkMode={darkMode} />}
        {currentTab === 'Debts' && <Debts transactions={transactions} darkMode={darkMode} />}
        {currentTab === 'Recoveries' && <Recoveries transactions={transactions} onSuccess={fetchData} darkMode={darkMode} />}
        {currentTab === 'Savings' && <Savings darkMode={darkMode} />}
      </main>

      {activeModal && (
        <AddTransactionModal 
          type={activeModal} 
          user={user} 
          onClose={() => setActiveModal(null)} 
          onSuccess={fetchData} 
          darkMode={darkMode} 
        />
      )}
    </div>
  );
}

// Wrapper for Auth context
function AuthWrapper() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? <MainApp /> : <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}