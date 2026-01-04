
import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { Target, CheckCircle2, Flame, TrendingUp, Clock, ChevronRight, Activity, Loader2, Sparkles, Calendar, Zap } from 'lucide-react';
import { GoalLevel, Status, Priority } from '../types';

const StatCard = ({ title, value, subtext, icon: Icon, color, trend, trendLabel }: { title: string, value: string | number, subtext: string, icon: any, color: string, trend?: number, trendLabel?: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
        <Icon className="text-white" size={24} />
      </div>
      {trend !== undefined && (
        <div className="relative group/trend">
          <div className={`flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-lg cursor-help transition-colors ${trend >= 0 ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-rose-600 bg-rose-50 hover:bg-rose-100'}`}>
            <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover/trend:opacity-100 transition-all pointer-events-none text-center font-black z-30 shadow-xl translate-y-2 group-hover/trend:translate-y-0">
            {trendLabel}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}
    </div>
    <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</h3>
    <div className="flex items-baseline gap-2 mt-1">
      <span className="text-3xl font-black text-slate-900">{value}</span>
      <span className="text-slate-400 text-xs font-bold">{subtext}</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { goals, todos, reviews, toggleTodo, fetchGoals, fetchTodos, fetchStats, fetchReviews, stats, loading, user } = useStore();
  
  useEffect(() => {
    fetchGoals();
    fetchTodos();
    fetchStats();
    fetchReviews();
  }, [fetchGoals, fetchTodos, fetchStats, fetchReviews]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) return '早安';
    if (hour >= 9 && hour < 12) return '上午好';
    if (hour >= 12 && hour < 14) return '午安';
    if (hour >= 14 && hour < 19) return '下午好';
    if (hour >= 19 && hour < 24) return '晚上好';
    return '深夜好';
  }, []);

  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeTodos = Array.isArray(todos) ? todos : [];

  const calculations = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const todayTasks = safeTodos.filter(t => t.due_date.startsWith(todayStr));
    const todayCompleted = todayTasks.filter(t => t.is_completed).length;
    
    const yesterdayTasks = safeTodos.filter(t => t.due_date.startsWith(yesterdayStr));
    const yesterdayCompleted = yesterdayTasks.filter(t => t.is_completed).length;

    let todoTrend = 0;
    if (yesterdayCompleted > 0) {
      todoTrend = Math.round(((todayCompleted - yesterdayCompleted) / yesterdayCompleted) * 100);
    } else if (todayCompleted > 0) {
      todoTrend = 100;
    }

    const newGoalsCount = safeGoals.filter(g => new Date(g.created_at) > sevenDaysAgo).length;
    const goalGrowthTrend = safeGoals.length > 0 ? Math.round((newGoalsCount / safeGoals.length) * 100) : 0;

    const thisWeekTasks = safeTodos.filter(t => new Date(t.due_date) > sevenDaysAgo);
    const lastWeekTasks = safeTodos.filter(t => {
      const d = new Date(t.due_date);
      return d > fourteenDaysAgo && d <= sevenDaysAgo;
    });

    const thisWeekRate = thisWeekTasks.length > 0 ? (thisWeekTasks.filter(t => t.is_completed).length / thisWeekTasks.length) : 0;
    const lastWeekRate = lastWeekTasks.length > 0 ? (lastWeekTasks.filter(t => t.is_completed).length / lastWeekTasks.length) : 0;
    
    const efficiencyRate = Math.round(thisWeekRate * 100);
    const efficiencyTrend = Math.round((thisWeekRate - lastWeekRate) * 100);

    const mainGoal = safeGoals[0];
    let mainProgressTrend = 0;
    if (mainGoal) {
      const isRecentlyUpdated = new Date(mainGoal.updated_at) > sevenDaysAgo;
      mainProgressTrend = isRecentlyUpdated ? Math.min(Math.round(mainGoal.progress * 0.2), 15) : 0;
    }

    return {
      todayCount: todayTasks.length,
      todayCompleted,
      todoTrend,
      goalGrowthTrend,
      efficiencyRate,
      efficiencyTrend,
      mainProgressTrend
    };
  }, [safeGoals, safeTodos]);

  const activeGoals = safeGoals.filter(g => g && g.status === Status.PENDING).slice(0, 3);
  const pendingTodosDisplay = safeTodos.filter(t => t && !t.is_completed).slice(0, 5);
  const lastFocus = reviews.length > 0 ? reviews[reviews.length - 1].next_focus_content : null;

  const formatDateShort = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading && safeGoals.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-bold">同步 CalmExec 核心战略中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{greeting}, {user?.username || '拓荒者'}</h1>
          <p className="text-slate-500 font-medium mt-1">CalmExec 战略执行系统已就绪。冷静规划，极致执行。</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm px-6 py-3 rounded-3xl font-bold">
          <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
            <Flame size={20} className="fill-amber-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">连续达标</span>
            <span className="text-slate-900">第 {stats?.streak_days || 0} 天</span>
          </div>
        </div>
      </div>

      {lastFocus && (
        <div className="bg-white border-2 border-indigo-50 p-6 rounded-[2rem] shadow-sm flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 text-indigo-600"><Sparkles size={100}/></div>
          <div className="relative z-10">
            <h4 className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-1">本周进化重心</h4>
            <p className="text-2xl font-black tracking-tight italic text-slate-900">“{lastFocus}”</p>
          </div>
          <Link to="/review" className="relative z-10 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 hover:-translate-y-0.5">
            审计详情 <ChevronRight size={14}/>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="战略目标" 
          value={safeGoals.length} 
          subtext="项正在进行" 
          icon={Target} 
          color="bg-indigo-600" 
          trend={calculations.goalGrowthTrend}
          trendLabel="近 7 天新目标占比"
        />
        <StatCard 
          title="今日完成" 
          value={calculations.todayCompleted} 
          subtext={`/${calculations.todayCount} 项任务`} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
          trend={calculations.todoTrend}
          trendLabel="对比昨日完成数增长"
        />
        <StatCard 
          title="整体效能" 
          value={`${calculations.efficiencyRate}%`} 
          subtext="完成转化率" 
          icon={Activity} 
          color="bg-orange-500" 
          trend={calculations.efficiencyTrend}
          trendLabel="本周 vs 上周转化率差值"
        />
        <StatCard 
          title="核心进展" 
          value={`${Math.round(safeGoals[0]?.progress || 0)}%`} 
          subtext="主攻目标" 
          icon={TrendingUp} 
          color="bg-indigo-400"
          trend={calculations.mainProgressTrend > 0 ? calculations.mainProgressTrend : undefined}
          trendLabel="主攻目标近期进度增量"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
            <h2 className="text-xl font-black flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              今日聚焦执行
            </h2>
            <Link to="/todos" className="px-4 py-2 bg-slate-50 text-indigo-600 text-xs font-black rounded-xl hover:bg-indigo-50 transition-colors uppercase tracking-widest">查看全部</Link>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
            {pendingTodosDisplay.map((todo) => (
              <div key={todo.id} className="group px-8 py-5 flex items-center gap-6 hover:bg-slate-50 transition-all">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shadow-sm ${
                    todo.is_completed 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'border-slate-300 group-hover:border-indigo-400 group-hover:scale-110'
                  }`}
                >
                  {todo.is_completed && <CheckCircle2 size={16} />}
                </button>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-lg truncate tracking-tight ${todo.is_completed ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                    {todo.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Clock size={12} /> {todo.estimated_time}min
                    </span>
                    {todo.description && <span className="text-[10px] text-slate-300">| {todo.description}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    todo.priority === Priority.HIGH ? 'bg-rose-50 text-rose-600' :
                    todo.priority === Priority.MEDIUM ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {todo.priority === Priority.HIGH ? '紧急' : todo.priority === Priority.MEDIUM ? '中等' : '普通'}
                  </span>
                  <ChevronRight size={20} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
            {pendingTodosDisplay.length === 0 && (
              <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
                   <CheckCircle2 size={40} />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-2xl">完美清空！</p>
                  <p className="text-slate-400 font-medium">冷静的执行力无可挑剔。</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3">
             <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
            战略目标跟踪
          </h2>
          <div className="space-y-10 flex-1">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                      {goal.level === GoalLevel.LONG ? '长期战略' : goal.level === GoalLevel.MID ? '中期规划' : '短期突击'}
                    </span>
                    <span className="font-black text-slate-800 text-lg leading-tight truncate max-w-[180px]">{goal.title}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-indigo-600 font-black text-xl">{goal.progress}%</span>
                    {goal.deadline && (
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Calendar size={10} /> {formatDateShort(goal.deadline)} 截止
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className={`h-full transition-all duration-1000 shadow-sm ${
                      goal.level === GoalLevel.LONG ? 'bg-indigo-600' : 
                      goal.level === GoalLevel.MID ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {activeGoals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                <Target size={48} className="opacity-20 mb-4" />
                <p className="font-bold">暂无活跃目标</p>
              </div>
            )}
          </div>
          <Link to="/goals" className="w-full mt-10 py-5 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 hover:-translate-y-1 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2">
            进入战略推演
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
