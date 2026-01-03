
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
  Target
} from 'lucide-react';
import { analyzeReviewTrends } from '../geminiService.ts';

const Review: React.FC = () => {
  const { todos, reviews, saveReview, fetchReviews } = useStore();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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
    if (reviews.length < 2) return;
    setAnalyzing(true);
    try {
      const simplified = reviews.map(r => ({
        week: r.week_number,
        wins: r.wins_content,
        obstacles: r.obstacles_content,
        focus: r.next_focus_content
      }));
      const result = await analyzeReviewTrends(JSON.stringify(simplified));
      setAiInsight(result);
    } catch (err) {
      setAiInsight("分析失败，请检查网络或配置。");
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedReview = reviews.find(r => r.id === selectedReviewId);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">灵魂复盘与成长档案</h1>
          <p className="text-slate-500 mt-1">每一周的总结，都是通往卓越的必经之路。</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('current')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'current' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            <BookOpen size={18} /> 本周总结
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            <History size={18} /> 成长档案
          </button>
        </div>
      </div>

      {activeTab === 'current' ? (
        <div className="space-y-10">
          <div className="text-center space-y-4 py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full font-extrabold text-xs tracking-widest uppercase">
              <Calendar size={16} />
              {currentInfo.year}年 第{currentInfo.week}周
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">此刻，请与真实的自己对话。</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700"></div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-600 relative z-10">
                <CheckCircle size={24} />
                高光成就
              </h3>
              <ul className="space-y-4 relative z-10">
                {completed.slice(0, 5).map((win, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    {win}
                  </li>
                ))}
                {completed.length === 0 && <li className="text-slate-400 italic text-sm">本周尚未解锁成就</li>}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700"></div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-rose-600 relative z-10">
                <MessageSquare size={24} />
                挑战与阻碍
              </h3>
              <ul className="space-y-4 relative z-10">
                {pending.slice(0, 5).map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                    <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                    {p}
                  </li>
                ))}
                {pending.length === 0 && <li className="text-slate-400 italic text-sm">本周战无不胜！</li>}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: "wins_content", q: "哪些事做得好？", a: "列出 3 个成功的关键点...", icon: <Sparkles className="text-amber-500" size={18}/> },
              { key: "obstacles_content", q: "遇到了哪些阻碍？", a: "识别导致延期的瓶颈因素...", icon: <MessageSquare className="text-indigo-500" size={18}/> },
              { key: "next_focus_content", q: "下周的头等大事？", a: "定义下周最核心的一个目标...", icon: <Target className="text-emerald-500" size={18}/> },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <h4 className="font-bold text-slate-900">{item.q}</h4>
                </div>
                <textarea 
                  value={(formData as any)[item.key]}
                  onChange={(e) => setFormData({...formData, [item.key]: e.target.value})}
                  placeholder={item.a}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 h-40 resize-none transition-all"
                ></textarea>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={handleSave}
              className={`px-12 py-5 rounded-3xl font-black text-xl shadow-2xl transition-all flex items-center gap-3 ${
                isSaved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:-translate-y-1'
              }`}
            >
              {isSaved ? <><CheckCircle size={24} /> 复盘已归档</> : <>保存并结束本周复盘 <Send size={20} /></>}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 历史列表 */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">历程时间轴</h3>
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                  暂无历史记录
                </div>
              ) : reviews.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReviewId(r.id)}
                  className={`w-full p-5 text-left rounded-[24px] border transition-all flex items-center justify-between group ${
                    selectedReviewId === r.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase opacity-70">{r.year}年</span>
                    <span className="text-lg font-black tracking-tight">第 {r.week_number} 周复盘</span>
                  </div>
                  <ChevronRight size={20} className={selectedReviewId === r.id ? 'text-white' : 'text-slate-300'} />
                </button>
              ))}
            </div>

            {reviews.length >= 2 && (
              <button 
                onClick={handleAnalyzeTrends}
                disabled={analyzing}
                className="w-full mt-6 py-5 bg-indigo-50 text-indigo-600 rounded-[24px] font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100"
              >
                {analyzing ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                AI 进化趋势洞察
              </button>
            )}
          </div>

          {/* 详情或 AI 板块 */}
          <div className="lg:col-span-2">
            {aiInsight ? (
              <div className="bg-indigo-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-4">
                <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit size={120}/></div>
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
                    <TrendingUp size={20} className="text-amber-400" />
                    <span className="text-sm font-black uppercase tracking-widest">多周成长进化报告</span>
                  </div>
                  <button onClick={() => setAiInsight(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
                </div>
                <div className="prose prose-invert max-w-none">
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 leading-relaxed font-medium">
                    {aiInsight}
                  </div>
                </div>
              </div>
            ) : selectedReview ? (
              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
                <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                  <h3 className="text-2xl font-black text-slate-900">{selectedReview.year}W{selectedReview.week_number} 深度档案</h3>
                  <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-400">ARCHIVED</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest">高光时刻</h4>
                    <p className="p-5 bg-emerald-50/50 rounded-2xl text-slate-700 font-medium leading-relaxed">{selectedReview.wins_content || '未填写'}</p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">核心阻碍</h4>
                    <p className="p-5 bg-rose-50/50 rounded-2xl text-slate-700 font-medium leading-relaxed">{selectedReview.obstacles_content || '未填写'}</p>
                  </div>
                </div>

                <div className="p-8 bg-indigo-50 rounded-[32px] border border-indigo-100">
                  <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target size={18} />
                    该周设定的下周重心
                  </h4>
                  <p className="text-indigo-900 font-black text-xl leading-relaxed italic">
                    “{selectedReview.next_focus_content || '未定焦点'}”
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-300 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <History size={48} className="mb-4 opacity-20" />
                <p className="font-bold">从左侧选择一个档案开始回顾</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
