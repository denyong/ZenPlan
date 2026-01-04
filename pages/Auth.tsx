
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  Loader2, 
  Settings, 
  X, 
  Globe, 
  Terminal,
  RefreshCw
} from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(localStorage.getItem('calmexec_api_url') || 'http://127.0.0.1:5000');
  
  const [rememberEmail, setRememberEmail] = useState(localStorage.getItem('calmexec_rem_e_flag') === 'true');
  const [rememberPassword, setRememberPassword] = useState(localStorage.getItem('calmexec_rem_p_flag') === 'true');

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

  // 加载记住的信息
  useEffect(() => {
    if (isLogin) {
      const savedEmail = localStorage.getItem('calmexec_rem_email');
      const savedPass = localStorage.getItem('calmexec_rem_pass');
      
      if (savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
      }
      if (savedPass) {
        setFormData(prev => ({ ...prev, password: savedPass }));
      }
    }
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        
        // 登录成功后处理“记住”逻辑
        if (rememberEmail) {
          localStorage.setItem('calmexec_rem_email', formData.email);
          localStorage.setItem('calmexec_rem_e_flag', 'true');
        } else {
          localStorage.removeItem('calmexec_rem_email');
          localStorage.setItem('calmexec_rem_e_flag', 'false');
        }

        if (rememberPassword) {
          localStorage.setItem('calmexec_rem_pass', formData.password);
          localStorage.setItem('calmexec_rem_p_flag', 'true');
        } else {
          localStorage.removeItem('calmexec_rem_pass');
          localStorage.setItem('calmexec_rem_p_flag', 'false');
        }
      } else {
        await register(formData.username, formData.email, formData.password);
        setIsLogin(true);
      }
    } catch (err) {
      console.error("认证失败:", err);
    }
  };

  const handleSaveApiSettings = () => {
    let cleanUrl = tempApiUrl.trim();
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `http://${cleanUrl}`;
    }
    setApiUrl(cleanUrl);
    setShowApiSettings(false);
    window.location.reload();
  };

  const toggleTrailingSlash = () => {
    setTempApiUrl(prev => prev.endsWith('/') ? prev.slice(0, -1) : `${prev}/`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative selection:bg-indigo-100 selection:text-indigo-900">
      <button 
        onClick={() => setShowApiSettings(true)}
        className="absolute top-6 right-6 p-3 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 hover:shadow-xl hover:-translate-y-0.5 transition-all z-10 shadow-sm"
        title="服务器连接配置"
      >
        <Settings size={22} />
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-10">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform cursor-default">
                C
              </div>
            </div>
            
            <div className="text-center space-y-2 mb-10">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {isLogin ? '欢迎回到 CalmExec' : '开启进化之旅'}
              </h1>
              <p className="text-slate-500 font-medium">
                {isLogin ? '冷静规划你的愿景，掌控极致执行。' : '建立一个能自我进化的效率系统。'}
              </p>
            </div>

            {error && (
              <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-3xl space-y-4 animate-shake">
                <div className="flex items-start gap-3 text-rose-600">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm font-bold">连接异常诊断</div>
                </div>
                <div className="bg-white/60 p-4 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-600 border border-rose-100/50 whitespace-pre-wrap">
                  {error}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowApiSettings(true)}
                    className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-colors shadow-lg shadow-rose-100"
                  >
                    配置服务器地址
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="p-2 bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">用户名</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="text"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold placeholder:font-normal"
                      placeholder="你的姓名或昵称"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">电子邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold placeholder:font-normal"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">访问密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold placeholder:font-normal"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={rememberEmail}
                      onChange={(e) => setRememberEmail(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                    />
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">记住账号</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={rememberPassword}
                      onChange={(e) => setRememberPassword(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                    />
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">记住密码</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                    {isLogin ? '立即登录系统' : '创建新账户'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-400 hover:text-indigo-600 text-sm font-black transition-colors"
              >
                {isLogin ? '还没有账户？去注册' : '已有账户？去登录'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showApiSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Globe size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">后端连接配置</h3>
                </div>
                <button onClick={() => setShowApiSettings(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 font-black text-[10px] uppercase tracking-widest">
                  <Terminal size={14} />
                  高级排错贴士
                </div>
                <p className="text-xs text-amber-600/80 font-medium leading-relaxed">
                  若遇到 <b>"CORS Preflight Redirect"</b> 错误：这通常是因为请求 URL 与后端定义的路径不匹配导致了重定向。尝试在地址末尾<b>添加</b>或<b>移除</b>斜杠。
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">服务器 Base URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={tempApiUrl}
                      onChange={(e) => setTempApiUrl(e.target.value)}
                      className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-mono text-sm focus:border-indigo-500 transition-colors"
                      placeholder="http://127.0.0.1:5000"
                    />
                    <button 
                      onClick={toggleTrailingSlash}
                      className={`px-4 rounded-2xl font-black text-sm border transition-all ${
                        tempApiUrl.endsWith('/') 
                          ? 'bg-indigo-600 border-indigo-600 text-white' 
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                      title="切换尾部斜杠"
                    >
                      /
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-bold px-1">
                  当前连接请求示例：<span className="text-indigo-500 font-mono">{tempApiUrl}{tempApiUrl.endsWith('/') ? '' : '/'}api/v1/goals</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setTempApiUrl('http://127.0.0.1:5000'); }}
                  className="px-6 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors"
                >
                  重置默认
                </button>
                <button 
                  onClick={handleSaveApiSettings}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                >
                  确认并刷新页面
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
