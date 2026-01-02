
import React, { useState, useEffect } from 'react';
import { useStore } from '../store.ts';
import { Priority, Status } from '../types.ts';
import { analyzeTaskPatterns } from '../geminiService.ts';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  BarChart3,
  Clock,
  Target,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie
} from 'recharts';

const TaskAnalysis: React.FC = () => {
  const { todos, goals } = useStore();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const performAnalysis = async () => {
    setLoading(true);
    try {
      const simplifiedTodos = todos.map(t => ({
        title: t.title,
        priority: t.priority,
        isCompleted: t.isCompleted,
        estimatedTime: t.estimatedTime,
        dueDate: t.dueDate
      }));
      const result = await analyzeTaskPatterns(JSON.stringify(simplifiedTodos));
      setAiAnalysis(result);
    } catch (err) {
      console.error(err);
      setAiAnalysis("AI 分析暂时不可用，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (todos.length > 0 && !aiAnalysis) {
      performAnalysis();
    }
  }, [todos, aiAnalysis]);

  const radarData = [
    { subject: '执行力', A: (todos.filter(t => t.isCompleted).length / (todos.length || 1)) * 100, fullMark: 100 },
    { subject: '规划感', A: (todos.filter(t => t.goalId).length / (todos.length || 1)) * 100, fullMark: 100 },
    { subject: '紧迫感', A: (todos.filter(t => t.priority === Priority.HIGH).length / (todos.length || 1)) * 100, fullMark: 100 },
    { subject: '专注度', A: 85, fullMark: 100 },
    { subject: '预估准度', A: 70, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BrainCircuit className="text-indigo-600" size={32} />
            任务智能分析
          </h1>
          <p className="text-slate-500">利用 AI 模型深度剖析你的任务模式与效能瓶颈。</p>
        </div>
        <button 
          onClick={performAnalysis}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          重新分析
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-bold mb-6 w-full flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            综合效能画像
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Radar
                  name="User"
                  dataKey="A"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">基于近 30 天的任务行为数据建模</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit size={120} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full w-fit">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-sm font-bold">AI 智能诊断报告</span>
            </div>

            {loading ? (
              <div className="space-y-4 py-8">
                <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse"></div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <p className="text-lg leading-relaxed text-indigo-50 whitespace-pre-wrap">
                    {aiAnalysis || "点击上方按钮开始 AI 深度任务模式分析。"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalysis;
