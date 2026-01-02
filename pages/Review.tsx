
import React, { useState } from 'react';
import { useStore } from '../store';
import { CheckCircle, Calendar, MessageSquare } from 'lucide-react';

const Review: React.FC = () => {
  const { todos } = useStore();

  const completed = todos.filter(t => t.completed).map(t => t.title);
  const pending = todos.filter(t => !t.completed).map(t => t.title);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold text-sm">
          <Calendar size={16} />
          周期性复盘回顾
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">这一周感觉如何？</h1>
        <p className="text-slate-500 max-w-lg mx-auto">停下来审视你的成就，沉淀经验，并为下周制定更明智的计划。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-600">
            <CheckCircle size={20} />
            高光时刻 (已完成)
          </h3>
          <ul className="space-y-3">
            {completed.slice(0, 5).map((win, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                {win}
              </li>
            ))}
            {completed.length > 5 && <li className="text-slate-400 text-sm">以及另外 {completed.length - 5} 项...</li>}
            {completed.length === 0 && <li className="text-slate-400 italic text-sm">本周暂无完成任务</li>}
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-rose-600">
            <MessageSquare size={20} />
            待改进项 (未完成)
          </h3>
          <ul className="space-y-3">
            {pending.slice(0, 5).map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600">
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                {p}
              </li>
            ))}
            {pending.length > 5 && <li className="text-slate-400 text-sm">以及另外 {pending.length - 5} 项...</li>}
            {pending.length === 0 && <li className="text-slate-400 italic text-sm">本周所有任务均已完成！</li>}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { q: "本周哪些事做得好？", a: "列出 3 个成功的关键点..." },
          { q: "遇到了哪些阻碍？", a: "识别导致延期的瓶颈因素..." },
          { q: "下周的头等大事？", a: "定义最核心的一个目标..." },
        ].map((q, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900">{q.q}</h4>
            <textarea 
              placeholder={q.a}
              className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
            ></textarea>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-indigo-700 transition-all">
          保存复盘记录
        </button>
      </div>
    </div>
  );
};

export default Review;
