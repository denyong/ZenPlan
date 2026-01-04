
import React, { useState, useEffect } from 'react';
import { useStore } from '../store.ts';
import { Priority } from '../types.ts';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  RefreshCw
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer
} from 'recharts';

const TaskAnalysis: React.FC = () => {
  const { todos, fetchTaskAnalysis } = useStore();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const performAnalysis = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // 直接调用 store 封装的后端接口
      const result = await fetchTaskAnalysis();
      setAiAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setAiAnalysis(`AI 分析请求失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 首次进入页面，如果有任务且没分析过，则自动分析一次
    if (todos.length > 0 && !aiAnalysis) {
      performAnalysis();
    }
  }, [todos.length]); // 仅依赖任务数量变化

  const radarData = [
    { subject: '执行力', A: (todos.filter(t => t.is_completed).length / (todos.length || 1)) * 100, fullMark: 100 },
    { subject: '规划感', A: (todos.filter(t => t.goal_id).length / (todos.length || 1)) * 100, fullMark: 100 },
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
          <p className="text-slate-500">利用后端 AI 模型深度剖析你的任务模式与效能瓶颈。</p>
        </div>
        <button 
          onClick={performAnalysis}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? '分析中...' : '重新分析'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-bold mb-6 w-full flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            综合效能画像
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
            <p className="text-xs text-slate-400">基于客观行为数据建模</p>
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
                    {aiAnalysis || "点击重新分析以调取后端 AI 诊断数据。"}
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
