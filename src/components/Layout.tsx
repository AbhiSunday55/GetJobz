import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Video, 
  Search, 
  LogOut, 
  User as UserIcon,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { auth, logout } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const user = auth.currentUser;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resume', label: 'Resume Builder', icon: FileText },
    { id: 'interview', label: 'Mock Interview', icon: Video },
    { id: 'ats', label: 'ATS Checker', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex font-serif">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-[#141414] text-[#E4E3E0] flex flex-col border-r border-[#141414]/10"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold tracking-tighter italic"
            >
              GetJobz
            </motion.h1>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-[#E4E3E0] text-[#141414]" 
                  : "hover:bg-white/5 text-[#E4E3E0]/60 hover:text-[#E4E3E0]"
              )}
            >
              <item.icon size={20} className={cn(
                "shrink-0",
                activeTab === item.id ? "text-[#141414]" : "group-hover:scale-110 transition-transform"
              )} />
              {isSidebarOpen && (
                <span className="font-medium tracking-tight">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-[#E4E3E0] flex items-center justify-center text-[#141414]">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.displayName}</p>
                <p className="text-xs opacity-50 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button 
            onClick={logout}
            className={cn(
              "w-full mt-4 flex items-center gap-4 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-[#141414]/5 flex items-center px-8 justify-between">
          <h2 className="text-xl font-medium italic">
            {navItems.find(n => n.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs uppercase tracking-widest opacity-50 font-sans font-bold">Current Session</p>
              <p className="text-sm font-mono">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#F5F5F0]">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
