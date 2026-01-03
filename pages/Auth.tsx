
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.ts';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle, Loader2, Settings, X, Globe, HelpCircle } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(localStorage.getItem('zenplan_api_url') || 'http://127.0.0.1:5000');
  
  const navigate = useNavigate();
  const { login, register, loading, error, token, setApiUrl } = useStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Auth process error:", err);
    }
  };

  const handleSaveApiSettings = () => {
    // 自动清理输入的空格
    const cleanUrl = tempApiUrl.trim().replace(/\/+$/, '');
    setApiUrl(cleanUrl);
    setShowApiSettings(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative">
      <button 
        onClick={() => setShowApiSettings(true)}
        className="absolute top-6 right-6 p-3 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 hover:shadow-md transition-all z-10"
        title="服务器连接设置"
      >
        <Settings size={20} />
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-10">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100">Z</div>
            </div>
            
            <div className="text-center space-y-2 mb-10">
              <h1 className="text-2xl font-black text-slate-900">
                {isLogin ? '欢迎回到 ZenPlan' : '开启你的进化之旅'}
              </h1>
              <p className="text-slate-500 text-sm">
                {isLogin ? '登录以继续管理你的目标与任务' : '创建一个账户来规划你的未来'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 text-sm animate-shake">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">连接异常</p>
                  <p className="opacity-80 whitespace-pre-wrap">{error}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button 
                      onClick={() => setShowApiSettings(true)}
                      className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg font-bold text-xs"
                    >
                      修改地址
                    </button>
                    <a 
                      href="https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS" 
                      target="_blank" 
                      className="px-3 py-1 bg-white border border-rose-200 text-rose-400 rounded-lg text-xs"
                    >
                      什么是 CORS？
                    </a>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">用户名</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="text"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="你的姓名或昵称"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">邮箱地址</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">访问密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-[20px] font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                    {isLogin ? '立即登录' : '创建账户'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-500 hover:text-indigo-600 text-sm font-semibold transition-colors"
              >
                {isLogin ? '还没有账户？点击注册' : '已有账户？点击登录'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API 设置模态框 */}
      {showApiSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Globe className="text-indigo-600" size={20} />
                  后端 API 地址
                </h3>
                <button onClick={() => setShowApiSettings(false)} className="text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle size={14} />
                  排错贴士
                </div>
                <p className="text-xs text-amber-600 leading-relaxed">
                  如果遇到 <b>CORS Preflight Redirect</b> 错误：请确保填写的地址与后端定义的路由完全一致。如果后端路由没有结尾斜杠，这里也不要加斜杠。
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1">当前地址</label>
                <input 
                  type="text" 
                  value={tempApiUrl}
                  onChange={(e) => setTempApiUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-mono text-sm"
                  placeholder="http://127.0.0.1:5000"
                />
              </div>
              <button 
                onClick={handleSaveApiSettings}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                保存并重载页面
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
