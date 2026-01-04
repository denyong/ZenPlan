
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store.ts';
import { 
  CheckCircle, 
  MessageSquare, 
  Sparkles, 
  Send, 
  History, 
  ChevronRight, 
  BookOpen, 
  BrainCircuit,
  X,
  Loader2,
  TrendingUp,
  Target,
  Quote,
  Layout,
  ArrowRight,
  Zap
} from 'lucide-react';

const Review: React.FC = () => {
  const { todos, reviews, saveReview, fetchReviews, fetchTrendReport } = useStore();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedReviewId, setSelectedReviewId] = useState<string | number | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // 获取北京时区的 ISO 周数
  const currentInfo = useMemo(() => {
    // 获取当前的北京时间
    const beijingDateStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    }).format(new Date());
    
    const now = new Date(beijingDateStr);
    const target = new Date(now.valueOf());
    const dayNr = (now.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    const weekNo = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    return { year: now.getFullYear(), week: weekNo };
  }, []);

  const completed = todos.filter(t => t.is_completed).map(t => t.title);
  const pending = todos.filter(t => !t.is_completed).map(t => t.title);

  const [formData, setFormData] = useState({
    wins_content: '',
    obstacles_content: '',
    next_focus_content: ''
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const existing = reviews.find(r => r.year === currentInfo.year && r.week_number === currentInfo.week);
    if (existing) {
      setFormData({
        wins_content: existing.wins_content || '',
        obstacles_content: existing.obstacles_content || '',
        next_focus_content: existing.next_focus_content || ''
      });
    }
  }, [reviews, currentInfo]);

  const handleSave = async () => {
    await saveReview({
      year: currentInfo.year,
      week_number: currentInfo.week,
      ...formData
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAnalyzeTrends = async () => {
    if (reviews.length < 1) return;
    setAnalyzing(true);
    try {
      const result = await fetchTrendReport();
      setAiInsight(result);
    } catch (err: any) {
      setAiInsight(`分析失败: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedReview = reviews.find(r => r.id === selectedReviewId);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 backdrop-blur-sm p-4 rounded-[2rem] border border-white/60 shadow-sm">
        <div className="flex items-center gap-4 ml-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Layout size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              进化审计
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md uppercase tracking-tighter">Asia/Shanghai</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Evolutionary Growth Archive</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('current')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'current' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BookOpen size={16} /> 本周复盘
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <History size={16} /> 成长档案
          </button>
        </div>
      </div>

      {activeTab === 'current' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-[320px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm"><Sparkles size={20} /></div>
                  <div>
                    <h3 className="font-black text-slate-900">高光时刻</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Wins & Achievements</p>
                  </div>
                </div>
                <textarea 
                  value={formData.wins_content}
                  onChange={(e) => setFormData({...formData, wins_content: e.target.value})}
                  placeholder="本周最令你自豪的三件事..."
                  className="flex-1 w-full bg-slate-50/50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 resize-none transition-all placeholder:text-slate-300"
                ></textarea>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-[320px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shadow-sm"><MessageSquare size={20} /></div>
                  <div>
                    <h3 className="font-black text-slate-900">阻碍与挑战</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Obstacles & Learning</p>
                  </div>
                </div>
                <textarea 
                  value={formData.obstacles_content}
                  onChange={(e) => setFormData({...formData, obstacles_content: e.target.value})}
                  placeholder="哪些事拖慢了你？是什么原因？"
                  className="flex-1 w-full bg-slate-50/50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-rose-500/10 resize-none transition-all placeholder:text-slate-300"
                ></textarea>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                <Target size={180}/>
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100">
                      <Zap size={24} fill="currentColor" className="opacity-80" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-black text-lg tracking-tight">战略焦点 (The One Thing)</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Next Week Strategic Focus</p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <input 
                    type="text"
                    value={formData.next_focus_content}
                    onChange={(e) => setFormData({...formData, next_focus_content: e.target.value})}
                    placeholder="定义下周必须达成的一项核心产出..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-6 text-xl font-black text-slate-800 placeholder:text-slate-300 focus:ring-8 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200 pointer-events-none">
                    <ArrowRight size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSave}
                className={`group flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-lg transition-all ${
                  isSaved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 shadow-2xl shadow-slate-200'
                }`}
              >
                {isSaved ? <><CheckCircle size={22} /> 进化档案已归档</> : <>归档并发布 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{currentInfo.year}W{currentInfo.week}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Audit Cycle Context</p>
                </div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase">Active</div>
              </div>

              <div className="space-y-8 flex-1">
                <div className="flex items-center gap-6">
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{completed.length}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">达成成就项</p>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-slate-100"></div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-3xl font-black text-rose-500 tracking-tighter">{pending.length}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">待审计阻碍</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Quote size={12}/> 本周数据回顾
                   </h4>
                   <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                     {completed.map((t, i) => (
                       <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl group transition-colors hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100">
                         <div className="w-4 h-4 rounded-full border-2 border-emerald-400 mt-1"></div>
                         <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-700">{t}</span>
                       </div>
                     ))}
                     {pending.map((t, i) => (
                       <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl group transition-colors hover:bg-rose-50/50 border border-transparent hover:border-rose-100">
                         <div className="w-4 h-4 rounded-full border-2 border-rose-300 mt-1"></div>
                         <span className="text-xs font-bold text-slate-500 group-hover:text-rose-700">{t}</span>
                       </div>
                     ))}
                     {completed.length === 0 && pending.length === 0 && (
                       <p className="text-xs text-slate-300 italic py-4 text-center">本周暂无执行数据</p>
                     )}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Growth Timeline</h3>
            <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
              {reviews.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm">
                  空虚的时间轴...
                </div>
              ) : reviews.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReviewId(r.id)}
                  className={`w-full p-5 text-left rounded-[1.75rem] transition-all flex items-center justify-between group ${
                    selectedReviewId === r.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border border-slate-100 hover:border-indigo-200 shadow-sm'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-black uppercase opacity-60 block">{r.year} YEAR</span>
                    <span className="text-lg font-black tracking-tight">Week {r.week_number}</span>
                  </div>
                  <div className={`p-1.5 rounded-lg transition-colors ${selectedReviewId === r.id ? 'bg-white/20' : 'bg-slate-50'}`}>
                    <ChevronRight size={18} />
                  </div>
                </button>
              ))}
            </div>

            {reviews.length >= 2 && (
              <button 
                onClick={handleAnalyzeTrends}
                disabled={analyzing}
                className="w-full mt-4 py-4 bg-slate-900 text-white rounded-[1.75rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 disabled:opacity-50"
              >
                {analyzing ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                AI 进化趋势诊断
              </button>
            )}
          </div>

          <div className="lg:col-span-9 space-y-6">
            {aiInsight ? (
              <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-8">
                <div className="absolute top-0 right-0 p-12 opacity-5"><BrainCircuit size={240}/></div>
                <div className="flex justify-between items-start mb-12 relative z-10">
                  <div className="flex items-center gap-3 bg-indigo-500 px-6 py-2.5 rounded-full shadow-lg shadow-indigo-500/20">
                    <TrendingUp size={20} className="text-white" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Advanced Growth Report</span>
                  </div>
                  <button onClick={() => setAiInsight(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={24}/></button>
                </div>
                <div className="relative z-10">
                  <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 leading-relaxed font-medium text-slate-100 text-lg whitespace-pre-wrap max-h-[500px] overflow-y-auto custom-scrollbar">
                    {aiInsight}
                  </div>
                </div>
              </div>
            ) : selectedReview ? (
              <div className="space-y-6">
                {selectedReview.summary_ai && (
                  <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden border border-indigo-500/20 group">
                    <div className="absolute -right-4 -top-4 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                      <Sparkles size={120} className="text-indigo-400" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-2 text-indigo-300">
                        <BrainCircuit size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">AI 灵魂审计总结</span>
                      </div>
                      <p className="text-lg font-bold leading-relaxed italic text-indigo-50">
                        “{selectedReview.summary_ai}”
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
                  <div className="flex justify-between items-end pb-8 border-b border-slate-50">
                    <div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedReview.year}W{selectedReview.week_number} 审计档案</h3>
                      <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">Growth Archive ID: {selectedReview.id}</p>
                    </div>
                    <div className="px-6 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-lg shadow-slate-100">Secure Record</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={16}/> 高光总结
                      </h4>
                      <div className="p-8 bg-emerald-50/40 rounded-[2rem] text-slate-700 font-bold leading-relaxed border border-emerald-50 text-lg shadow-inner">
                        {selectedReview.wins_content || '未记录成就'}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={16}/> 痛点洞察
                      </h4>
                      <div className="p-8 bg-rose-50/40 rounded-[2rem] text-slate-700 font-bold leading-relaxed border border-rose-50 text-lg shadow-inner">
                        {selectedReview.obstacles_content || '未记录阻碍'}
                      </div>
                    </div>
                  </div>

                  <div className="p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-5"><Target size={80}/></div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Target size={16} className="text-indigo-600" />
                      本周核心进化点
                    </h4>
                    <p className="text-slate-900 font-black text-2xl leading-tight tracking-tight italic">
                      “{selectedReview.next_focus_content || '未定义焦点'}”
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[550px] flex flex-col items-center justify-center text-slate-300 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 group transition-all hover:border-indigo-200">
                <div className="p-8 bg-slate-50 rounded-[2rem] mb-6 group-hover:scale-110 transition-transform">
                  <History size={64} className="opacity-20 text-indigo-600" />
                </div>
                <h3 className="font-black text-2xl text-slate-400">选择一份历史档案</h3>
                <p className="text-sm font-medium text-slate-300 mt-2">回顾过往，是为了更好地跃迁。</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
