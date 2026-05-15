import { LayoutDashboard, Box, GraduationCap, FileText, Settings, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Box },
  { id: 'borrow', label: 'Borrow/Return', icon: GraduationCap },
];

export default function Sidebar({ isOpen, onClose, activeTab, setActiveTab }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay: พื้นหลังสีดำจางๆ ตอนกดเปิดเมนูบนมือถือ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar: เปลี่ยนมาใช้คลาส Tailwind ควบคุมการสไลด์ */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Box className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-gray-900 text-lg tracking-tight">Smart IT</h1>
          </div>
          {/* ปุ่มกากบาทปิด โชว์เฉพาะจอมือถือ (lg:hidden) */}
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>
          {menuItems.map((item) => (
            <button
              id={`nav-${item.id}`}
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                // ถ้าเป็นจอมือถือ กดเมนูแล้วให้ปิด Sidebar อัตโนมัติ
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {item.label}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab" 
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
                />
              )}
            </button>
          ))}

          <div className="pt-8 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">System</div>
          
          {/* 👇 1. แก้ไขปุ่ม Settings ตรงนี้ 👇 */}
          <button 
            onClick={() => {
              setActiveTab('settings');
              if (window.innerWidth < 1024) onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === 'settings' 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
            Settings
            {activeTab === 'settings' && (
              <motion.div 
                layoutId="activeTab" 
                className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
              />
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 mb-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group">
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}