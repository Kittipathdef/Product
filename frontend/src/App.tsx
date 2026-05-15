import { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import StatCard from './components/StatCard';
import InventoryTable from './components/InventoryTable';
import TransactionHistory from './components/TransactionHistory';
// 👇 1. Import ไฟล์ MasterDataManagement เข้ามา
import MasterDataManagement from './components/MasterDataManagement'; 
import Login from './components/Login'; 
import { Package, Users, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsAuthenticated(true);
      setUserName(JSON.parse(userStr).name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/assets')
      .then(res => res.json())
      .then(data => setAssets(data.data || []))
      .catch(err => console.error("Error fetching for stats:", err));
  }, [isAuthenticated]); 

  const stats = useMemo(() => ({
    total: assets.length,
    borrowed: assets.filter(a => a.status === 'Borrowed').length,
    issue: assets.filter(a => ['Maintenance', 'Broken'].includes(a.status)).length,
    expiring: assets.filter(a => {
      if (!a.warrantyExpire) return false;
      const expDate = new Date(a.warrantyExpire);
      const now = new Date();
      const diffMonths = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return diffMonths > 0 && diffMonths <= 12;
    }).length,
  }), [assets]);

  const getPageTitle = (tab: string) => {
    if (tab === 'dashboard') return 'Dashboard';
    if (tab === 'borrow') return 'Borrow & Return History';
    if (tab === 'inventory') return 'Inventory Management';
    if (tab === 'settings') return 'Settings & Master Data'; // แอบเปลี่ยนชื่อหัวเว็บให้ดูโปรขึ้น
    return tab.charAt(0).toUpperCase() + tab.slice(1);
  };

  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={() => {
          setIsAuthenticated(true);
          const userStr = localStorage.getItem('user');
          if (userStr) setUserName(JSON.parse(userStr).name);
        }} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-600">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)} 
          title={getPageTitle(activeTab)}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto">

          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {userName.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm text-gray-500 leading-tight">Welcome back,</p>
                <p className="text-sm font-bold text-gray-900">{userName || 'Admin'}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
            >
              Logout
            </button>
          </div>
          
          {/* ----- หน้า Dashboard ----- */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard index={0} title="Total Assets" value={stats.total} icon={Package} trend="Updated" color="blue" />
              <StatCard index={1} title="Currently Borrowed" value={stats.borrowed} icon={Users} color="emerald" />
              <StatCard index={2} title="In Maintenance / Broken" value={stats.issue} icon={AlertTriangle} color="rose" />
              <StatCard index={3} title="Warranty Expiring Soon" value={stats.expiring} icon={ShieldCheck} trend="Next 12 mo." color="amber" />
            </div>
          )}

          {/* ----- หน้า Inventory ----- */}
          {activeTab === 'inventory' && (
            <InventoryTable />
          )}

          {/* ----- หน้า Borrow/Return ----- */}
          {activeTab === 'borrow' && (
            <TransactionHistory />
          )}

          {/* 👇 2. เพิ่มหน้า Settings ตรงนี้ 👇 */}
          {activeTab === 'settings' && (
            <MasterDataManagement />
          )}

          {/* 👇 3. เพิ่ม activeTab !== 'settings' เข้าไปในเงื่อนไขการซ่อน เพื่อปลดล็อกป้าย Under Development ออก 👇 */}
          {activeTab !== 'dashboard' && activeTab !== 'borrow' && activeTab !== 'inventory' && activeTab !== 'settings' && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Module Under Development</h3>
              <p className="text-gray-500 max-w-xs mt-1">
                The {activeTab} section is currently being built. Check back soon for updates!
              </p>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}