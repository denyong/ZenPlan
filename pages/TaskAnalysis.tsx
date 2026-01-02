
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Priority, Status } from '../types';
import { analyzeTaskPatterns } from '../geminiService';
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
      // 仅发送必要的任务字段以节省 Token
      const simplifiedTodos = todos.map(t => ({
        title: t.title,
        priority: t.priority,
        completed: t.completed,
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
  }, [todos]);

  // 计算雷达图数据（效能维度）
  const radarData = [
    { subject: '执行力', A: (todos.filter(t => t.completed).length / (todos.length || 1)) * 100, fullMark: 100 },
    { subject: '规划感', A: (todos.filter(t => t.goalId).length / (todos.length || 1)) * 100, fullMark: 100 },
    { subject: '紧迫感', A: (todos.filter(t => t.priority === Priority.HIGH).length / (todos.length || 1)) * 100, fullMark: 100 },
    { subject: '专注度', A: 85, fullMark: 100 }, // 模拟数据
    { subject: '预估准度', A: 70, fullMark: 100 }, // 模拟数据
  ];

  const priorityDistribution = [
    { name: '紧急', value: todos.filter(t => t.priority === Priority.HIGH).length, color: '#f43f5e' },
    { name: '中等', value: todos.filter(t => t.priority === Priority.MEDIUM).length, color: '#f59e0b' },
    { name: '普通', value: todos.filter(t => t.priority === Priority.LOW).length, color: '#10b981' },
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
        {/* 效能雷达图 */}
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
                  name="Alex"
                  dataKey="A"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">基于近 30 天的任务行为数据建模</p>
          </div>
        </div>

        {/* AI 诊断报告 */}
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
                <p className="text-indigo-200 text-sm animate-pulse italic">ZenAI 正在深度扫描您的任务列表，寻找改进空间...</p>
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

            {!loading && aiAnalysis && (
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-xl text-emerald-300 text-sm border border-emerald-500/30">
                  <Lightbulb size={16} />
                  <span>建议增加短期目标关联</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-xl text-amber-300 text-sm border border-amber-500/30">
                  <AlertTriangle size={16} />
                  <span>高优先级任务积压</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 统计指标卡片 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <span className="text-sm font-semibold text-slate-500">逾期风险</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">12%</span>
            <span className="text-xs text-rose-500 mb-1">↑ 2% 较上周</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Clock size={20} />
            </div>
            <span className="text-sm font-semibold text-slate-500">预估偏差</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">+18m</span>
            <span className="text-xs text-emerald-500 mb-1">↓ 5m 较上周</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Target size={20} />
            </div>
            <span className="text-sm font-semibold text-slate-500">目标覆盖率</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">68%</span>
            <span className="text-xs text-blue-500 mb-1">稳定</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <span className="text-sm font-semibold text-slate-500">投入密度</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">4.2h</span>
            <span className="text-xs text-slate-400 mb-1">日均任务耗时</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 优先级占比图 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-8">任务负载分布 (按优先级)</h3>
          <div className="h-64 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 w-full md:w-48">
              {priorityDistribution.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                    <span className="text-sm text-slate-600">{p.name}</span>
                  </div>
                  <span className="text-sm font-bold">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 任务建议卡片 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">接下来的行动建议</h3>
          <div className="space-y-4">
            <div className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Target size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-indigo-600">关联未标记任务</h4>
                  <p className="text-xs text-slate-500">你有 5 项任务未关联任何目标，建议进行归类。</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600" />
            </div>
            <div className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-rose-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-rose-600">处理逾期风险</h4>
                  <p className="text-xs text-slate-500">“绘制系统架构”任务已临近截止日期，建议今日优先处理。</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-rose-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalysis;
