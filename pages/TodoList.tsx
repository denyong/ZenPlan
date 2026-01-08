
import React, { useState, useEffect } from 'react';
import { useStore } from '../store.ts';
import { Priority, Todo } from '../types.ts';
import { 
  CheckCircle2, 
  Clock, 
  Flag, 
  Plus, 
  Search,
  Calendar,
  MoreVertical,
  Trash2,
  CalendarDays,
  Target,
  X,
  Edit3,
  AlignLeft,
  Loader2,
  Sparkles
} from 'lucide-react';

const formatToBeijingISO = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch (e) {
    return '';
  }
};

const TodoList: React.FC = () => {
  const { todos, goals, toggleTodo, deleteTodo, addTodo, updateTodo, fetchTodos, fetchGoals, loading } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTodos();
    fetchGoals();
  }, [fetchTodos, fetchGoals]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    goal_id: string | number;
    due_date: string;
    priority: Priority;
    estimated_time: number;
  }>({
    title: '',
    description: '',
    goal_id: '',
    due_date: formatToBeijingISO(),
    priority: Priority.MEDIUM,
    estimated_time: 30
  });

  const filteredTodos = todos.filter(t => {
    const matchesFilter = filter === 'all' || (filter === 'pending' && !t.is_completed) || (filter === 'completed' && t.is_completed);
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                         (t.description?.toLowerCase().includes(search.toLowerCase()) || false);
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.HIGH: return 'text-rose-500 bg-rose-50/50 border-rose-100';
      case Priority.MEDIUM: return 'text-amber-500 bg-amber-50/50 border-amber-100';
      case Priority.LOW: return 'text-emerald-500 bg-emerald-50/50 border-emerald-100';
    }
  };

  const getGoalTitle = (goalId?: string | number) => {
    if (!goalId) return null;
    return goals.find(g => g.id === goalId)?.title;
  };

  const openModal = (todo?: Todo) => {
    if (todo) {
      setEditingTodo(todo);
      setFormData({
        title: todo.title,
        description: todo.description || '',
        goal_id: todo.goal_id || '',
        due_date: formatToBeijingISO(todo.due_date),
        priority: todo.priority,
        estimated_time: todo.estimated_time
      });
    } else {
      setEditingTodo(null);
      setFormData({
        title: '',
        description: '',
        goal_id: '',
        due_date: formatToBeijingISO(),
        priority: Priority.MEDIUM,
        estimated_time: 30
      });
    }
    setIsModalOpen(true);
    setShowMenuId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      due_date: `${formData.due_date}T00:00:00.000+08:00` 
    };
    if (editingTodo) {
      await updateTodo(editingTodo.id, payload);
    } else {
      await addTodo(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            待办事项
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
          </h1>
          <p className="text-slate-500 font-bold text-sm tracking-wide">追踪微观执行，掌控每一个细节。</p>
        </div>
        
        {/* 高级交互按钮 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <button 
            onClick={() => openModal()}
            className="relative flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-white/10"
          >
            <div className="bg-indigo-500 p-1.5 rounded-lg shadow-lg shadow-indigo-500/30">
              <Plus size={18} strokeWidth={3} />
            </div>
            <span className="tracking-[0.1em] uppercase">添加核心任务</span>
            <Sparkles size={14} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden">
        {/* 顶部过滤条 */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 bg-slate-50/40">
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/40 rounded-[20px] backdrop-blur-sm">
            {[
              { id: 'all', label: '全部' },
              { id: 'pending', label: '进行中' },
              { id: 'completed', label: '已达成' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-8 py-2.5 text-xs font-black rounded-2xl transition-all duration-300 tracking-wider ${
                  filter === f.id 
                    ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50 ring-1 ring-slate-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative group/search flex-1 sm:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover/search:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="搜索任务或备注..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 w-full sm:w-80 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* 列表内容 */}
        <div className="divide-y divide-slate-100">
          {loading && todos.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-indigo-500" size={40} />
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest">数据同步中...</p>
            </div>
          ) : filteredTodos.map((todo) => (
            <div 
              key={todo.id} 
              className={`group px-8 py-6 flex items-center gap-6 hover:bg-slate-50/80 transition-all relative ${todo.is_completed ? 'opacity-70' : ''}`}
            >
              <button 
                onClick={() => toggleTodo(todo.id)}
                className={`flex-shrink-0 w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 shadow-sm ${
                  todo.is_completed 
                    ? 'bg-emerald-500 border-emerald-500 text-white rotate-[360deg]' 
                    : 'border-slate-200 bg-white group-hover:border-indigo-400 group-hover:scale-110 group-hover:shadow-indigo-100'
                }`}
              >
                {todo.is_completed && <CheckCircle2 size={20} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h4 className={`font-black text-xl truncate tracking-tight transition-all ${todo.is_completed ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                    {todo.title}
                  </h4>
                  <div className={`px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${getPriorityColor(todo.priority)}`}>
                    {todo.priority === Priority.HIGH ? 'P0' : todo.priority === Priority.MEDIUM ? 'P1' : 'P2'}
                  </div>
                </div>
                
                {todo.description && (
                  <p className={`text-sm mt-1.5 line-clamp-1 font-bold ${todo.is_completed ? 'text-slate-200' : 'text-slate-400'}`}>
                    {todo.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-3">
                  {getGoalTitle(todo.goal_id) && (
                    <div className="flex items-center gap-2 text-[10px] text-indigo-500 font-black uppercase tracking-widest bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100/50">
                      <Target size={12} className="opacity-70" />
                      {getGoalTitle(todo.goal_id)}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
                    <Calendar size={12} className="opacity-50" />
                    {formatToBeijingISO(todo.due_date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="hidden md:flex flex-col items-end">
                   <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-1">耗时预估</div>
                   <div className="text-sm font-black text-slate-700">{todo.estimated_time} MIN</div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenuId(showMenuId === todo.id ? null : todo.id);
                    }}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-sm ring-1 ring-slate-100"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {showMenuId === todo.id && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowMenuId(null)}></div>
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-slate-100 py-3 z-30 animate-in fade-in zoom-in duration-300">
                        <button 
                          onClick={() => openModal(todo)}
                          className="w-full px-6 py-4 text-left text-sm font-black text-slate-600 hover:bg-slate-50 flex items-center gap-4 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Edit3 size={16} />
                          </div>
                          编辑任务
                        </button>
                        <div className="h-px bg-slate-50 mx-4 my-1"></div>
                        <button 
                          onClick={() => { deleteTodo(todo.id); setShowMenuId(null); }}
                          className="w-full px-6 py-4 text-left text-sm font-black text-rose-500 hover:bg-rose-50 flex items-center gap-4 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                            <Trash2 size={16} />
                          </div>
                          移除记录
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredTodos.length === 0 && !loading && (
            <div className="py-40 flex flex-col items-center justify-center space-y-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative w-32 h-32 bg-white rounded-[40px] border border-slate-100 shadow-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-700">
                  <CalendarDays size={56} className="text-slate-100" strokeWidth={1} />
                  <Sparkles className="absolute top-6 right-6 text-amber-300 animate-pulse" size={24} />
                </div>
              </div>
              <div className="text-center">
                <p className="font-black text-2xl text-slate-800 tracking-tight">暂无任何安排</p>
                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Everything is Calm & Clear</p>
              </div>
              <button 
                onClick={() => openModal()}
                className="px-10 py-4 bg-slate-100 text-indigo-600 rounded-2xl font-black text-xs hover:bg-indigo-600 hover:text-white transition-all tracking-widest uppercase shadow-sm"
              >
                立即开始规划
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[48px] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-500 border border-white/20">
            <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingTodo ? '重塑任务细节' : '定义新任务'}</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Deployment Protocol v2.5</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:rotate-90">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-12 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">核心指令 (Title)</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-black text-xl text-slate-900 focus:ring-12 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all placeholder:font-normal placeholder:text-slate-300"
                  placeholder="你想完成什么？"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">关联愿景 (Goal)</label>
                <select 
                  value={formData.goal_id}
                  onChange={e => setFormData({...formData, goal_id: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-black text-slate-700 focus:ring-12 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer appearance-none shadow-sm"
                >
                  <option value="">独立任务 (不关联目标)</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">截止日期</label>
                  <input 
                    type="date" 
                    value={formData.due_date}
                    onChange={e => setFormData({...formData, due_date: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-black text-slate-700 cursor-pointer shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">时间预估 (MIN)</label>
                  <input 
                    type="number" 
                    value={formData.estimated_time}
                    onChange={e => setFormData({...formData, estimated_time: parseInt(e.target.value) || 0})}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-black text-slate-700 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">优先级别 (Priority)</label>
                <div className="grid grid-cols-3 gap-4">
                  {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({...formData, priority: p})}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${
                        formData.priority === p 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.05]' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
                      }`}
                    >
                      {p === Priority.HIGH ? '紧急/高' : p === Priority.MEDIUM ? '中等/常' : '普通/低'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[36px] blur-lg opacity-20 animate-pulse"></div>
                <button type="submit" className="relative w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xl shadow-2xl hover:bg-black hover:-translate-y-1 active:scale-95 transition-all duration-300 tracking-wider">
                  {editingTodo ? '执行更新指令' : '立即部署任务'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
