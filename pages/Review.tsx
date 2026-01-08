
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
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/60 backdrop-blur-xl p-5 rounded-[40px] border border-white shadow-2xl shadow-slate-200/50">
        <div className="flex items-center gap-6 ml-4">
          <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center text-white shadow-2xl rotate-3 group-hover:rotate-0 transition-all">
            <Layout size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              进化审计
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Growth Archive Proto</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-2 rounded-[32px] ring-1 ring-slate-200/50 shadow-inner">
          <button 
            onClick={() => setActiveTab('current')}
            className={`flex items-center gap-3 px-10 py-4 rounded-[26px] text-xs font-black transition-all duration-500 uppercase tracking-widest ${activeTab === 'current' ? 'bg-white text-indigo-600 shadow-2xl shadow-indigo-100 scale-105 ring-1 ring-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BookOpen size={18} /> 本周审计
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 px-10 py-4 rounded-[26px] text-xs font-black transition-all duration-500 uppercase tracking-widest ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-2xl shadow-indigo-100 scale-105 ring-1 ring-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <History size={18} /> 历史记录
          </button>
        </div>
      </div>

      {activeTab === 'current' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-700 flex flex-col h-[400px]">
                <div className="flex items-center gap-5 mb-8">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl shadow-inner"><Sparkles size={28} /></div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">高光审计</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Wins of the week</p>
                  </div>
                </div>
                <textarea 
                  value={formData.wins_content}
                  onChange={(e) => setFormData({...formData, wins_content: e.target.value})}
                  placeholder="本周最令你自豪的突破..."
                  className="flex-1 w-full bg-slate-50/40 border-none rounded-[40px] p-8 text-lg font-bold text-slate-700 focus:ring-12 focus:ring-emerald-500/5 focus:bg-white transition-all resize-none placeholder:text-slate-200 custom-scrollbar shadow-inner"
                ></textarea>
              </div>

              <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-700 flex flex-col h-[400px]">
                <div className="flex items-center gap-5 mb-8">
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-3xl shadow-inner"><MessageSquare size={28} /></div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">障碍分析</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Obstacles analysis</p>
                  </div>
                </div>
                <textarea 
                  value={formData.obstacles_content}
                  onChange={(e) => setFormData({...formData, obstacles_content: e.target.value})}
                  placeholder="是什么阻碍了你的飞跃？"
                  className="flex-1 w-full bg-slate-50/40 border-none rounded-[40px] p-8 text-lg font-bold text-slate-700 focus:ring-12 focus:ring-rose-500/5 focus:bg-white transition-all resize-none placeholder:text-slate-200 custom-scrollbar shadow-inner"
                ></textarea>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[64px] shadow-[0_30px_80px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.01] group-hover:opacity-[0.04] group-hover:scale-110 transition-all duration-1000 pointer-events-none text-indigo-600">
                <Target size={300}/>
              </div>
              
              <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-900 text-indigo-400 rounded-[28px] flex items-center justify-center shadow-2xl border border-white/10">
                    <Zap size={32} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-black text-2xl tracking-tighter uppercase">战略进化点</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-1">Next Week Objective</p>
                  </div>
                </div>

                <div className="relative group/input">
                  <input 
                    type="text"
                    value={formData.next_focus_content}
                    onChange={(e) => setFormData({...formData, next_focus_content: e.target.value})}
                    placeholder="下周必须达成的一项核心产出..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-[40px] px-12 py-9 text-3xl font-black text-slate-900 placeholder:text-slate-100 focus:ring-20 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                  />
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-100 group-hover/input:text-indigo-400 transition-colors pointer-events-none">
                    <ArrowRight size={48} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-10 px-4">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[40px] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <button 
                  onClick={handleSave}
                  className={`relative group flex items-center gap-6 px-16 py-7 rounded-[36px] font-black text-2xl transition-all duration-500 ${
                    isSaved 
                      ? 'bg-emerald-500 text-white shadow-emerald-200' 
                      : 'bg-slate-900 text-white hover:bg-black hover:-translate-y-2 active:scale-95 shadow-[0_30px_60px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  {isSaved ? <><CheckCircle size={32} strokeWidth={3} /> 档案已加密归档</> : <>归档并发布进化日志 <ArrowRight size={32} strokeWidth={3} className="group-hover:translate-x-3 transition-transform" /></>}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="bg-slate-900 rounded-[64px] p-12 shadow-2xl h-full flex flex-col relative overflow-hidden group border border-white/5">
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]"></div>
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <div>
                  <h3 className="font-black text-white text-3xl tracking-tighter">{currentInfo.year}W{currentInfo.week}</h3>
                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] mt-2">Evolution Cycle</p>
                </div>
                <div className="px-5 py-2 bg-indigo-500 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest animate-pulse">Live Audit</div>
              </div>

              <div className="space-y-12 flex-1 relative z-10">
                <div className="flex items-center gap-10">
                  <div className="flex-1">
                    <p className="text-5xl font-black text-white tracking-tighter">{completed.length}</p>
                    <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mt-2 opacity-60">Success Ops</p>
                  </div>
                  <div className="w-px h-16 bg-white/10"></div>
                  <div className="flex-1">
                    <p className="text-5xl font-black text-rose-500 tracking-tighter">{pending.length}</p>
                    <p className="text-[10px] text-rose-300 font-black uppercase tracking-widest mt-2 opacity-60">Pending Audit</p>
                  </div>
                </div>

                <div className="space-y-8">
                   <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-4">
                     <div className="w-8 h-[1px] bg-white/20"></div> RAW DATA INPUT
                   </h4>
                   <div className="space-y-5 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                     {completed.map((t, i) => (
                       <div key={i} className="flex items-start gap-5 p-5 bg-white/5 rounded-3xl border border-white/5 group transition-all hover:bg-emerald-500/10 hover:border-emerald-500/20">
                         <div className="w-6 h-6 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1"><CheckCircle size={14} className="text-emerald-400" /></div>
                         <span className="text-sm font-bold text-white/80 group-hover:text-white leading-snug">{t}</span>
                       </div>
                     ))}
                     {pending.map((t, i) => (
                       <div key={i} className="flex items-start gap-5 p-5 bg-white/5 rounded-3xl border border-white/5 group transition-all hover:bg-rose-500/10 hover:border-rose-500/20">
                         <div className="w-6 h-6 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 mt-1"><X size={14} className="text-rose-400" /></div>
                         <span className="text-sm font-bold text-white/40 group-hover:text-white/80 leading-snug">{t}</span>
                       </div>
                     ))}
                     {completed.length === 0 && pending.length === 0 && (
                       <div className="text-center py-24 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                         <History size={48} className="mx-auto text-white/10 mb-6" />
                         <p className="text-xs text-white/30 font-black uppercase tracking-widest">No Execution Data Found</p>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-6 mb-6">Archive Explorer</h3>
            <div className="space-y-5 max-h-[calc(100vh-380px)] overflow-y-auto pr-4 custom-scrollbar">
              {reviews.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-[56px] border-2 border-dashed border-slate-100 text-slate-300 text-sm font-black uppercase tracking-widest">
                  Timeline Empty
                </div>
              ) : reviews.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReviewId(r.id)}
                  className={`w-full p-8 text-left rounded-[40px] transition-all duration-500 flex items-center justify-between group relative overflow-hidden ${
                    selectedReviewId === r.id 
                      ? 'bg-slate-900 text-white shadow-2xl scale-[1.03] ring-4 ring-indigo-500/20' 
                      : 'bg-white border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-xl'
                  }`}
                >
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase opacity-40 tracking-[0.3em] block mb-2">{r.year} PROTOCOL</span>
                    <span className="text-2xl font-black tracking-tighter">Week {r.week_number}</span>
                  </div>
                  <div className={`p-4 rounded-2xl transition-all relative z-10 ${selectedReviewId === r.id ? 'bg-indigo-500 text-white rotate-90 scale-110 shadow-lg' : 'bg-slate-50 text-slate-200 group-hover:text-indigo-600'}`}>
                    <ChevronRight size={24} strokeWidth={3} />
                  </div>
                </button>
              ))}
            </div>

            {reviews.length >= 2 && (
              <div className="relative group mt-10">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <button 
                  onClick={handleAnalyzeTrends}
                  disabled={analyzing}
                  className="relative w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-sm flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl shadow-indigo-100/30 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                >
                  {analyzing ? <Loader2 size={24} className="animate-spin" /> : <BrainCircuit size={24} className="text-indigo-400" />}
                  <span className="tracking-[0.2em] uppercase">行为进化趋势分析</span>
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-10">
            {aiInsight ? (
              <div className="bg-slate-950 text-white p-14 rounded-[64px] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-20 duration-1000">
                <div className="absolute -top-20 -right-20 p-20 opacity-[0.05] pointer-events-none rotate-12">
                  <BrainCircuit size={500}/>
                </div>
                <div className="flex justify-between items-start mb-16 relative z-10">
                  <div className="flex items-center gap-5 bg-indigo-600/10 border border-indigo-500/20 px-10 py-4 rounded-full shadow-2xl shadow-indigo-950/40 backdrop-blur-2xl">
                    <TrendingUp size={28} className="text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-[0.5em] text-indigo-100">Evolutionary Core Intelligence</span>
                  </div>
                  <button onClick={() => setAiInsight(null)} className="p-5 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:rotate-90 active:scale-75 shadow-xl"><X size={32}/></button>
                </div>
                <div className="relative z-10">
                  <div className="bg-white/5 backdrop-blur-[100px] rounded-[48px] p-14 border border-white/10 leading-[1.6] font-bold text-slate-100 text-2xl whitespace-pre-wrap max-h-[600px] overflow-y-auto custom-scrollbar shadow-inner selection:bg-indigo-500 selection:text-white">
                    {aiInsight}
                  </div>
                </div>
              </div>
            ) : selectedReview ? (
              <div className="space-y-10 animate-in fade-in duration-700">
                {selectedReview.summary_ai && (
                  <div className="bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 text-white p-12 rounded-[56px] shadow-2xl relative overflow-hidden border border-white/10 group">
                    <div className="absolute -right-12 -top-12 p-16 opacity-[0.05] group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
                      <Sparkles size={200} className="text-indigo-400" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4 text-indigo-400">
                        <BrainCircuit size={28} strokeWidth={2.5} />
                        <span className="text-[11px] font-black uppercase tracking-[0.5em]">System Intelligence Summary</span>
                      </div>
                      <p className="text-3xl font-black leading-tight italic text-indigo-50 tracking-tighter">
                        “{selectedReview.summary_ai}”
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white p-14 rounded-[64px] border border-slate-100 shadow-[0_40px_100px_rgba(0,0,0,0.04)] space-y-14 animate-in fade-in">
                  <div className="flex justify-between items-end pb-12 border-b border-slate-50">
                    <div className="space-y-2">
                      <h3 className="text-6xl font-black text-slate-900 tracking-tighter">{selectedReview.year}W{selectedReview.week_number} <span className="text-indigo-600">审计档案</span></h3>
                      <p className="text-slate-300 text-sm font-black uppercase tracking-[0.4em]">Historical Record Identifier: {selectedReview.id}</p>
                    </div>
                    <div className="px-10 py-4 bg-slate-900 text-white rounded-3xl text-[10px] font-black tracking-[0.3em] uppercase shadow-2xl">Immutable Record</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] flex items-center gap-4">
                        <div className="w-8 h-[2px] bg-emerald-100"></div> SUCCESS MILESTONES
                      </h4>
                      <div className="p-12 bg-emerald-50/20 rounded-[48px] text-slate-900 font-black leading-relaxed border border-emerald-50 text-2xl shadow-inner italic">
                        {selectedReview.wins_content || '未记录成就'}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] flex items-center gap-4">
                        <div className="w-8 h-[2px] bg-rose-100"></div> BOTTLENECK ANALYSIS
                      </h4>
                      <div className="p-12 bg-rose-50/20 rounded-[48px] text-slate-900 font-black leading-relaxed border border-rose-50 text-2xl shadow-inner italic">
                        {selectedReview.obstacles_content || '未记录阻碍'}
                      </div>
                    </div>
                  </div>

                  <div className="p-14 bg-slate-900 rounded-[56px] relative group overflow-hidden shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 text-white">
                      <Target size={200}/>
                    </div>
                    <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-8 flex items-center gap-4 relative z-10">
                      <div className="w-5 h-5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30"></div>
                      STRATEGIC SHIFT FOR NEXT CYCLE
                    </h4>
                    <p className="text-white font-black text-4xl leading-[1.1] tracking-tighter italic relative z-10">
                      “{selectedReview.next_focus_content || '未定义焦点'}”
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[650px] flex flex-col items-center justify-center text-slate-300 bg-white rounded-[80px] border-2 border-dashed border-slate-100 group transition-all hover:border-indigo-200 hover:bg-slate-50/50">
                <div className="p-16 bg-white rounded-[56px] mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl border border-slate-50">
                  <History size={100} className="opacity-[0.08] text-indigo-600" />
                </div>
                <h3 className="font-black text-4xl text-slate-400 tracking-tighter uppercase">选择一份历史档案</h3>
                <p className="text-lg font-bold text-slate-300 mt-4 tracking-widest uppercase">Select an archive to review your evolution</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
