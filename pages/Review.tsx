
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store.ts';
import { 
  CheckCircle, 
  Calendar, 
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
  Quote
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

  // 计算当前周信息 (ISO-8601)
  const currentInfo = useMemo(() => {
    const now = new Date();
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

  // 加载已有数据
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
      // 优先对接后端接口，不再直接调用客户端 Gemini
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
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            复盘与进化
            <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] rounded-full uppercase tracking-widest">Growth Engine</div>
          </h1>
          <p className="text-slate-500 font-medium mt-1">记录每周轨迹，识别执行模式，推动自我进化。</p>
        </div>
        <div className="flex bg-white shadow-sm border border-slate-200 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('current')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'current' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <BookOpen size={18} /> 本周总结
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <History size={18} /> 成长档案
          </button>
        </div>
      </div>

      {activeTab === 'current' ? (
        <div className="space-y-8">
          {/* Current Week Banner */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm overflow-hidden relative">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50"></div>
            <div className="relative z-10 text-center md:text-left">
              <span className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-1 block">Current Cycle</span>
              <h2 className="text-3xl font-black text-slate-900">{currentInfo.year}年 第{currentInfo.week}周复盘</h2>
              <p className="text-slate-400 font-medium mt-1">回顾本周数据，深挖执行背后的逻辑。</p>
            </div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-500">{completed.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">已达成成就</p>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div className="text-center">
                <p className="text-2xl font-black text-rose-500">{pending.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">待复盘阻碍</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[
                { key: "wins_content", title: "本周高光时刻", desc: "哪些事情超出了预期？核心成功因素是什么？", icon: <Sparkles className="text-amber-500" />, color: "border-emerald-100" },
                { key: "obstacles_content", title: "核心阻碍与教训", desc: "遇到了什么瓶颈？如果重来一次你会怎么做？", icon: <MessageSquare className="text-rose-500" />, color: "border-rose-100" },
                { key: "next_focus_content", title: "下周唯一重心", desc: "如果下周只能做成一件事，那会是什么？", icon: <Target className="text-indigo-500" />, color: "border-indigo-100" },
              ].map((item, i) => (
                <div key={i} className={`bg-white p-8 rounded-[32px] border ${item.color} shadow-sm transition-all hover:shadow-md space-y-4`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl">{item.icon}</div>
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight">{item.title}</h4>
                      <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <textarea 
                    value={(formData as any)[item.key]}
                    onChange={(e) => setFormData({...formData, [item.key]: e.target.value})}
                    placeholder="输入你的思考..."
                    className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 h-32 resize-none transition-all"
                  ></textarea>
                </div>
              ))}
              
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSave}
                  className={`px-10 py-4 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center gap-3 ${
                    isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:-translate-y-1 hover:shadow-2xl'
                  }`}
                >
                  {isSaved ? <><CheckCircle size={24} /> 复盘归档成功</> : <>归档本周成长数据 <Send size={20} /></>}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Quote size={80}/></div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                  <Sparkles size={20} className="text-amber-400" />
                  回顾参考
                </h3>
                <div className="space-y-4 relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">本周已完成</p>
                    <div className="flex flex-wrap gap-2">
                      {completed.slice(0, 3).map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold">{t}</span>
                      ))}
                      {completed.length > 3 && <span className="text-[10px] font-bold text-slate-500">+{completed.length - 3}</span>}
                      {completed.length === 0 && <span className="text-xs text-slate-500">暂无完成任务</span>}
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">待跟进阻碍</p>
                    <div className="flex flex-wrap gap-2">
                      {pending.slice(0, 3).map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-rose-500/20 text-rose-200 rounded-lg text-[10px] font-bold">{t}</span>
                      ))}
                      {pending.length === 0 && <span className="text-xs text-slate-500">本周无遗留任务</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-8 space-y-4">
                <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                  <BrainCircuit size={20} />
                  复盘贴士
                </h4>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  真正的成长来自于“痛苦 + 反思”。不要只记录成功的喜悦，要深入分析那些让你感到困难或拖延的时刻。
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Timeline Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">成长时间轴</h3>
              <span className="text-[10px] font-bold text-slate-300">{reviews.length} 份档案</span>
            </div>
            <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[600px] pr-2">
              {reviews.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm">
                  尚未归档任何复盘记录
                </div>
              ) : reviews.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReviewId(r.id)}
                  className={`w-full p-6 text-left rounded-[28px] border transition-all flex items-center justify-between group ${
                    selectedReviewId === r.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1' : 'bg-white border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase opacity-60">{r.year} Year</span>
                    <span className="text-lg font-black tracking-tight">Week {r.week_number}</span>
                  </div>
                  <ChevronRight size={20} className={selectedReviewId === r.id ? 'text-white' : 'text-slate-300 group-hover:text-indigo-600'} />
                </button>
              ))}
            </div>

            {reviews.length >= 1 && (
              <button 
                onClick={handleAnalyzeTrends}
                disabled={analyzing}
                className="w-full mt-4 py-5 bg-slate-900 text-white rounded-[28px] font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 disabled:opacity-50"
              >
                {analyzing ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                AI 进化趋势诊断
              </button>
            )}
          </div>

          {/* Detailed Content */}
          <div className="lg:col-span-3">
            {aiInsight ? (
              <div className="bg-indigo-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-8">
                <div className="absolute top-0 right-0 p-12 opacity-10"><BrainCircuit size={160}/></div>
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="flex items-center gap-3 bg-white/10 px-5 py-2.5 rounded-full border border-white/10">
                    <TrendingUp size={20} className="text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-widest">Growth Evolution Report</span>
                  </div>
                  <button onClick={() => setAiInsight(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
                </div>
                <div className="relative z-10">
                  <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-10 border border-white/10 leading-relaxed font-medium text-indigo-50 text-lg whitespace-pre-wrap">
                    {aiInsight}
                  </div>
                </div>
              </div>
            ) : selectedReview ? (
              <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
                <div className="flex justify-between items-end pb-8 border-b border-slate-50">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">{selectedReview.year}W{selectedReview.week_number} 深度档案</h3>
                    <p className="text-slate-400 text-sm mt-1">归档于 {new Date(selectedReview.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="px-6 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-400 tracking-widest uppercase">Verified Record</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={16}/> 高光时刻
                    </h4>
                    <div className="p-8 bg-emerald-50/30 rounded-[32px] text-slate-700 font-medium leading-relaxed border border-emerald-50 text-lg">
                      {selectedReview.wins_content || '未记录成就'}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={16}/> 核心阻碍
                    </h4>
                    <div className="p-8 bg-rose-50/30 rounded-[32px] text-slate-700 font-medium leading-relaxed border border-rose-50 text-lg">
                      {selectedReview.obstacles_content || '未记录阻碍'}
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-indigo-600 text-white rounded-[40px] shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                  <div className="absolute right-0 bottom-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700"><Target size={120}/></div>
                  <h4 className="text-xs font-black text-indigo-100 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                    <Target size={20} />
                    该周确定的进化重心
                  </h4>
                  <p className="text-white font-black text-3xl leading-tight tracking-tight italic relative z-10">
                    “{selectedReview.next_focus_content || '未定义焦点'}”
                  </p>
                </div>

                {selectedReview.summary_ai && (
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <BrainCircuit size={14} /> AI 灵魂总结
                    </h4>
                    <p className="text-slate-600 italic font-medium">
                      {selectedReview.summary_ai}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-300 bg-white rounded-[48px] border-2 border-dashed border-slate-100 animate-pulse">
                <div className="p-6 bg-slate-50 rounded-full mb-6">
                  <History size={64} className="opacity-20" />
                </div>
                <p className="font-black text-xl text-slate-400">选择一份档案，开启跨时空对话</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
