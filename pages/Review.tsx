
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

  const currentInfo = useMemo(() => {
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 backdrop-blur-sm p-4 rounded-[2.5rem] border border-white/60 shadow-sm">
        <div className="flex items-center gap-5 ml-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200/50">
            <Layout size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              进化审计
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Evolutionary Growth Archive</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-2 rounded-[24px]">
          <button 
            onClick={() => setActiveTab('current')}
            className={`flex items-center gap-2.5 px-8 py-3 rounded-[18px] text-xs font-black transition-all duration-300 ${activeTab === 'current' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/30 scale-105' : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'}`}
          >
            <BookOpen size={16} /> 本周复盘
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2.5 px-8 py-3 rounded-[18px] text-xs font-black transition-all duration-300 ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/30 scale-105' : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'}`}
          >
            <History size={16} /> 成长档案
          </button>
        </div>
      </div>

      {activeTab === 'current' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[360px]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner"><Sparkles size={24} /></div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">高光时刻</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Wins & Achievements</p>
                  </div>
                </div>
                <textarea 
                  value={formData.wins_content}
                  onChange={(e) => setFormData({...formData, wins_content: e.target.value})}
                  placeholder="本周最令你自豪的三件事..."
                  className="flex-1 w-full bg-slate-50/50 border-none rounded-[28px] p-6 text-base font-bold text-slate-700 focus:ring-8 focus:ring-emerald-500/5 focus:bg-white transition-all resize-none placeholder:text-slate-300 custom-scrollbar"
                ></textarea>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[360px]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shadow-inner"><MessageSquare size={24} /></div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">阻碍与挑战</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Obstacles & Learning</p>
                  </div>
                </div>
                <textarea 
                  value={formData.obstacles_content}
                  onChange={(e) => setFormData({...formData, obstacles_content: e.target.value})}
                  placeholder="哪些事拖慢了你？是什么原因？"
                  className="flex-1 w-full bg-slate-50/50 border-none rounded-[28px] p-6 text-base font-bold text-slate-700 focus:ring-8 focus:ring-rose-500/10 focus:bg-white transition-all resize-none placeholder:text-slate-300 custom-scrollbar"
                ></textarea>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
              <div className="absolute top-0 right-0 p-8 opacity-[0.01] group-hover:opacity-[0.03] group-hover:scale-110 transition-all duration-1000 pointer-events-none text-indigo-600">
                <Target size={240}/>
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-white text-indigo-600 rounded-3xl flex items-center justify-center shadow-sm border border-indigo-100">
                    <Zap size={28} fill="currentColor" className="opacity-80" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-black text-xl tracking-tight">战略焦点 (The One Thing)</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">Next Week Strategic Focus</p>
                  </div>
                </div>

                <div className="relative group/input">
                  <input 
                    type="text"
                    value={formData.next_focus_content}
                    onChange={(e) => setFormData({...formData, next_focus_content: e.target.value})}
                    placeholder="定义下周必须达成的一项核心产出..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-[32px] px-10 py-7 text-2xl font-black text-slate-800 placeholder:text-slate-200 focus:ring-12 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner group-hover/input:bg-white"
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-200 group-hover/input:text-indigo-400 transition-colors pointer-events-none">
                    <ArrowRight size={32} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 pb-10">
              <button 
                onClick={handleSave}
                className={`group flex items-center gap-4 px-12 py-5 rounded-[28px] font-black text-xl transition-all duration-500 ${
                  isSaved 
                    ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-100 scale-105' 
                    : 'bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:bg-slate-800 hover:-translate-y-2 active:scale-95 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)]'
                }`}
              >
                {isSaved ? <><CheckCircle size={24} strokeWidth={3} /> 进化档案已归档</> : <>归档并发布 <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" /></>}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-sm h-full flex flex-col relative overflow-hidden group">
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors"></div>
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tighter">{currentInfo.year}W{currentInfo.week}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Audit Cycle Context</p>
                </div>
                <div className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-100">Active</div>
              </div>

              <div className="space-y-10 flex-1 relative z-10">
                <div className="flex items-center gap-8">
                  <div className="flex-1">
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{completed.length}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">达成成就项</p>
                  </div>
                  <div className="w-px h-12 bg-slate-100"></div>
                  <div className="flex-1">
                    <p className="text-4xl font-black text-rose-500 tracking-tighter">{pending.length}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">待审计阻碍</p>
                  </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                     <div className="w-4 h-[2px] bg-slate-200"></div> 本周数据回顾
                   </h4>
                   <div className="space-y-4 max-h-[380px] overflow-y-auto pr-3 custom-scrollbar">
                     {completed.map((t, i) => (
                       <div key={i} className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl group transition-all hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100/50">
                         <div className="w-5 h-5 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle size={12} className="text-emerald-600" /></div>
                         <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-800 leading-snug">{t}</span>
                       </div>
                     ))}
                     {pending.map((t, i) => (
                       <div key={i} className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl group transition-all hover:bg-rose-50/50 border border-transparent hover:border-rose-100/50">
                         <div className="w-5 h-5 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 mt-0.5"><X size={12} className="text-rose-600" /></div>
                         <span className="text-sm font-bold text-slate-500 group-hover:text-rose-800 leading-snug">{t}</span>
                       </div>
                     ))}
                     {completed.length === 0 && pending.length === 0 && (
                       <div className="text-center py-20 bg-slate-50 rounded-3xl">
                         <History size={32} className="mx-auto text-slate-200 mb-4" />
                         <p className="text-xs text-slate-400 font-bold">本周暂无执行数据</p>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4 mb-4">Growth Timeline</h3>
            <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-3 custom-scrollbar">
              {reviews.length === 0 ? (
                <div className="p-16 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 text-slate-400 text-sm font-bold">
                  空虚的时间轴...
                </div>
              ) : reviews.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReviewId(r.id)}
                  className={`w-full p-6 text-left rounded-[32px] transition-all duration-300 flex items-center justify-between group relative overflow-hidden ${
                    selectedReviewId === r.id 
                      ? 'bg-indigo-600 text-white shadow-[0_15px_30px_-10px_rgba(79,70,229,0.5)] scale-[1.02]' 
                      : 'bg-white border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase opacity-60 tracking-widest block mb-1">{r.year} YEAR</span>
                    <span className="text-xl font-black tracking-tighter">Week {r.week_number}</span>
                  </div>
                  <div className={`p-2 rounded-xl transition-all relative z-10 ${selectedReviewId === r.id ? 'bg-white/20 rotate-90 scale-110' : 'bg-slate-50 text-slate-300 group-hover:text-indigo-400'}`}>
                    <ChevronRight size={20} strokeWidth={3} />
                  </div>
                  {selectedReviewId === r.id && (
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                  )}
                </button>
              ))}
            </div>

            {reviews.length >= 2 && (
              <button 
                onClick={handleAnalyzeTrends}
                disabled={analyzing}
                className="w-full mt-6 py-5 bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-[32px] font-black text-sm flex items-center justify-center gap-3 hover:bg-indigo-900 transition-all shadow-2xl shadow-indigo-100/30 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
              >
                {analyzing ? <Loader2 size={20} className="animate-spin" /> : <BrainCircuit size={20} className="text-indigo-400" />}
                <span className="tracking-wide">AI 进化趋势诊断</span>
              </button>
            )}
          </div>

          <div className="lg:col-span-8 space-y-8">
            {aiInsight ? (
              <div className="bg-slate-950 text-white p-12 rounded-[48px] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-12 duration-700">
                <div className="absolute -top-12 -right-12 p-12 opacity-[0.03] pointer-events-none rotate-12">
                  <BrainCircuit size={400}/>
                </div>
                <div className="flex justify-between items-start mb-14 relative z-10">
                  <div className="flex items-center gap-4 bg-indigo-600/20 border border-indigo-400/20 px-8 py-3 rounded-full shadow-2xl shadow-indigo-900/40 backdrop-blur-md">
                    <TrendingUp size={24} className="text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-100">Advanced Growth Report</span>
                  </div>
                  <button onClick={() => setAiInsight(null)} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:rotate-90 active:scale-90"><X size={28}/></button>
                </div>
                <div className="relative z-10">
                  <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-12 border border-white/10 leading-relaxed font-bold text-slate-200 text-xl whitespace-pre-wrap max-h-[550px] overflow-y-auto custom-scrollbar shadow-inner">
                    {aiInsight}
                  </div>
                </div>
              </div>
            ) : selectedReview ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                {selectedReview.summary_ai && (
                  <div className="bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden border border-indigo-400/10 group">
                    <div className="absolute -right-8 -top-8 p-12 opacity-[0.05] group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
                      <Sparkles size={160} className="text-indigo-300" />
                    </div>
                    <div className="relative z-10 space-y-5">
                      <div className="flex items-center gap-3 text-indigo-400">
                        <BrainCircuit size={22} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">AI 灵魂审计总结</span>
                      </div>
                      <p className="text-2xl font-black leading-tight italic text-indigo-50 tracking-tight">
                        “{selectedReview.summary_ai}”
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-12 animate-in fade-in">
                  <div className="flex justify-between items-end pb-10 border-b border-slate-100/50">
                    <div>
                      <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{selectedReview.year}W{selectedReview.week_number} <span className="text-indigo-600">审计档案</span></h3>
                      <p className="text-slate-400 text-sm font-black mt-3 uppercase tracking-[0.3em]">Growth Archive ID: {selectedReview.id}</p>
                    </div>
                    <div className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl shadow-slate-200">Secure Record</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-5">
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="w-6 h-[2px] bg-emerald-100"></div> 高光总结
                      </h4>
                      <div className="p-10 bg-emerald-50/30 rounded-[40px] text-slate-800 font-black leading-relaxed border border-emerald-50 text-xl shadow-inner italic">
                        {selectedReview.wins_content || '未记录成就'}
                      </div>
                    </div>
                    <div className="space-y-5">
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="w-6 h-[2px] bg-rose-100"></div> 痛点洞察
                      </h4>
                      <div className="p-10 bg-rose-50/30 rounded-[40px] text-slate-800 font-black leading-relaxed border border-rose-50 text-xl shadow-inner italic">
                        {selectedReview.obstacles_content || '未记录阻碍'}
                      </div>
                    </div>
                  </div>

                  <div className="p-12 bg-slate-900 rounded-[44px] relative group overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 text-white">
                      <Target size={160}/>
                    </div>
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3 relative z-10">
                      <div className="w-4 h-4 bg-indigo-600 rounded-lg"></div>
                      下周战略进化点
                    </h4>
                    <p className="text-white font-black text-3xl leading-tight tracking-tight italic relative z-10">
                      “{selectedReview.next_focus_content || '未定义焦点'}”
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-slate-300 bg-white rounded-[60px] border-2 border-dashed border-slate-100 group transition-all hover:border-indigo-200 hover:bg-slate-50/30">
                <div className="p-12 bg-white rounded-[40px] mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm border border-slate-50">
                  <History size={80} className="opacity-10 text-indigo-600" />
                </div>
                <h3 className="font-black text-3xl text-slate-400 tracking-tight">选择一份历史档案</h3>
                <p className="text-base font-bold text-slate-300 mt-3 tracking-wide">回顾过往，是为了更好地跃迁。</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
