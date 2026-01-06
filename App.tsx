
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  BarChart2, 
  Settings, 
  Calendar,
  Menu,
  X,
  LogOut,
  BrainCircuit,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useStore } from './store';
import Dashboard from './pages/Dashboard';
import GoalManager from './pages/GoalManager';
import TodoList from './pages/TodoList';
import Statistics from './pages/Statistics';
import Review from './pages/Review';
import TaskAnalysis from './pages/TaskAnalysis';
import Auth from './pages/Auth';

const SidebarItem = ({ to, icon: Icon, label, active, isAi }: { to: string, icon: any, label: string, active: boolean, isAi?: boolean }) => (
  <Link
    to={to}
    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
    {isAi && (
      <Sparkles size={14} className={active ? 'text-indigo-200' : 'text-amber-400'} />
    )}
  </Link>
);

const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">C</div>
              <h1 className="text-xl font-bold tracking-tight">CalmExec</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1 custom-scrollbar overflow-y-auto">
            <SidebarItem to="/" icon={LayoutDashboard} label="仪表盘" active={location.pathname === '/'} />
            
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">执行管理</div>
            <SidebarItem to="/goals" icon={Target} label="目标管理" active={location.pathname.startsWith('/goals')} />
            <SidebarItem to="/todos" icon={CheckSquare} label="待办事项" active={location.pathname.startsWith('/todos')} />
            
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              深度洞察 <Sparkles size={12} className="text-amber-400" />
            </div>
            <SidebarItem to="/analysis" icon={BrainCircuit} label="AI 智能分析" active={location.pathname === '/analysis'} isAi />
            <SidebarItem to="/stats" icon={BarChart2} label="数据统计" active={location.pathname === '/stats'} />
            <SidebarItem to="/review" icon={Calendar} label="每周复盘" active={location.pathname === '/review'} />
            
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">个人账户</div>
            <SidebarItem to="/settings" icon={Settings} label="设置" active={location.pathname === '/settings'} />
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 relative group">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-indigo-100" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.username || 'Guest'}</p>
                <div className="flex items-center gap-1">
                   {isOnline ? (
                     <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-black uppercase tracking-widest">
                       <Wifi size={8} /> 云端同步中
                     </div>
                   ) : (
                     <div className="flex items-center gap-1 text-[9px] text-amber-600 font-black uppercase tracking-widest">
                       <WifiOff size={8} /> 离线工作模式
                     </div>
                   )}
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-auto"
                title="注销"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'pl-0'}`}>
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-3 min-h-[56px]">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-md">
                  <Menu size={20} />
                </button>
              )}
            </div>
            {!isOnline && (
              <div className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-full flex items-center gap-2">
                <WifiOff size={14} className="text-amber-500" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">本地缓存模式</span>
              </div>
            )}
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { token } = useStore();
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const { checkAuth } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/goals" element={<GoalManager />} />
                  <Route path="/todos" element={<TodoList />} />
                  <Route path="/analysis" element={<TaskAnalysis />} />
                  <Route path="/stats" element={<Statistics />} />
                  <Route path="/review" element={<Review />} />
                  <Route path="*" element={<div className="flex items-center justify-center h-96 text-slate-400 font-bold">页面开发中...</div>} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
