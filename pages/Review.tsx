
import React, { useState, useMemo } from 'react';
import { useStore } from '../store.ts';
import { CheckCircle, Calendar, MessageSquare, Sparkles, Send } from 'lucide-react';

const Review: React.FC = () => {
  const { todos, saveReview } = useStore();

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

  const handleSave = () => {
    saveReview({
      year: currentInfo.year,
      week_number: currentInfo.week,
      ...formData
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full font-extrabold text-xs tracking-widest uppercase">
          <Calendar size={16} />
          {currentInfo.year}年 第{currentInfo.week}周 复盘回顾
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">这一周，你的灵魂进化了吗？</h1>
        <p className="text-slate-500 max-w-lg mx-auto text-lg">停下来，审视你在这个世界的锚点。沉淀经验，是为了下次更精准的俯冲。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700"></div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-600 relative z-10">
            <CheckCircle size={24} />
            高光时刻
          </h3>
          <ul className="space-y-4 relative z-10">
            {completed.slice(0, 5).map((win, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                {win}
              </li>
            ))}
            {completed.length > 5 && <li className="text-slate-400 text-sm pl-5">...及其他 {completed.length - 5} 项成就</li>}
            {completed.length === 0 && <li className="text-slate-400 italic text-sm pl-5">本周尚未解锁成就</li>}
          </ul>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700"></div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-rose-600 relative z-10">
            <MessageSquare size={24} />
            阻碍与反思
          </h3>
          <ul className="space-y-4 relative z-10">
            {pending.slice(0, 5).map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                {p}
              </li>
            ))}
            {pending.length > 5 && <li className="text-slate-400 text-sm pl-5">...及其他 {pending.length - 5} 项遗留项</li>}
            {pending.length === 0 && <li className="text-slate-400 italic text-sm pl-5">本周所有阻碍均已突破！</li>}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { key: "wins_content", q: "哪些事做得好？", a: "列出 3 个成功的关键点...", icon: <Sparkles className="text-amber-500" size={18}/> },
          { key: "obstacles_content", q: "遇到了哪些阻碍？", a: "识别导致延期的瓶颈因素...", icon: <MessageSquare className="text-indigo-500" size={18}/> },
          { key: "next_focus_content", q: "下周的头等大事？", a: "定义下周最核心的一个目标...", icon: <Send className="text-emerald-500" size={18}/> },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
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
      
      <div className="flex justify-center pt-4">
        <button 
          onClick={handleSave}
          className={`px-12 py-5 rounded-[24px] font-bold text-xl shadow-2xl transition-all flex items-center gap-3 ${
            isSaved 
              ? 'bg-emerald-500 text-white translate-y-0 shadow-emerald-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle size={24} />
              复盘已归档
            </>
          ) : (
            <>
              保存本周复盘记录
              <Send size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Review;
