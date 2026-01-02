
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { useStore } from '../store';
import { Priority, Status } from '../types';
import { Info, TrendingUp, Calendar, Zap, PieChart as PieIcon } from 'lucide-react';

const Statistics: React.FC = () => {
  const { todos, goals } = useStore();

  const taskCompletionData = [
    { name: '周一', 已完成: 4, 待处理: 2 },
    { name: '周二', 已完成: 7, 待处理: 1 },
    { name: '周三', 已完成: 5, 待处理: 3 },
    { name: '周四', 已完成: 8, 待处理: 0 },
    { name: '周五', 已完成: 6, 待处理: 2 },
    { name: '周六', 已完成: 3, 待处理: 4 },
    { name: '周日', 已完成: 2, 待处理: 1 },
  ];

  const priorityData = [
    { name: '高优先级', value: todos.filter(t => t.priority === Priority.HIGH).length },
    { name: '中优先级', value: todos.filter(t => t.priority === Priority.MEDIUM).length },
    { name: '低优先级', value: todos.filter(t => t.priority === Priority.LOW).length },
  ];

  const COLORS = ['#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">执行数据分析</h1>
        <p className="text-slate-500">通过客观的数据维度审视你的成长轨迹。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 完成趋势 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={20} />
              本周执行趋势
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar size={14} />
              最近 7 天
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskCompletionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="已完成" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="待处理" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 优先级分布 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <PieIcon className="text-indigo-600" size={20} />
              任务优先级分布
            </h2>
            <button className="text-slate-400 hover:text-slate-600">
              <Info size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {priorityData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.value} 项</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 目标进度深度分析 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
            <Zap className="text-indigo-600" size={20} />
            目标深度与达标率
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={goals.map(g => ({ name: g.title, 进度: g.progress }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip />
                <Line name="进度 (%)" type="monotone" dataKey="进度" stroke="#6366f1" strokeWidth={3} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
