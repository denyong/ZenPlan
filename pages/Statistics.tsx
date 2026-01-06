
import React, { useMemo } from 'react';
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
import { useStore } from '../store.ts';
import { Priority } from '../types.ts';
import { TrendingUp, Calendar, Zap, PieChart as PieIcon } from 'lucide-react';

const Statistics: React.FC = () => {
  const { todos, goals } = useStore();

  const taskCompletionData = useMemo(() => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      const dayTodos = todos.filter(t => t.due_date.startsWith(dateStr));
      result.push({
        name: dayName,
        已完成: dayTodos.filter(t => t.is_completed).length,
        待处理: dayTodos.filter(t => !t.is_completed).length,
      });
    }
    return result;
  }, [todos]);

  const priorityData = useMemo(() => [
    { name: '高优先级', value: todos.filter(t => t.priority === Priority.HIGH).length },
    { name: '中优先级', value: todos.filter(t => t.priority === Priority.MEDIUM).length },
    { name: '低优先级', value: todos.filter(t => t.priority === Priority.LOW).length },
  ], [todos]);

  const COLORS = ['#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold">执行数据分析</h1>
        <p className="text-slate-500">通过客观的数据维度审视你的成长轨迹。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={20} />
              本周执行趋势 (真实数据)
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1.5 rounded-lg">
              <Calendar size={14} />
              最近 7 天
            </div>
          </div>
          <div className="h-64 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
              <BarChart data={taskCompletionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar name="已完成" dataKey="已完成" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar name="待处理" dataKey="待处理" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <PieIcon className="text-indigo-600" size={20} />
              任务优先级分布
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-64 w-full min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {priorityData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value} 项</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[450px]">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Zap className="text-indigo-600" size={24} />
            目标深度与达标率分析
          </h2>
          <div className="h-80 w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
              <LineChart data={goals.map(g => ({ name: g.title, 进度: g.progress }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Line name="进度 (%)" type="monotone" dataKey="进度" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
