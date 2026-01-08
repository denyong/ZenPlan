
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
  Loader2
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
      case Priority.HIGH: return 'text-rose-500 bg-rose-50';
      case Priority.MEDIUM: return 'text-amber-500 bg-amber-50';
      case Priority.LOW: return 'text-emerald-500 bg-emerald-50';
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">待办事项</h1>
          <p className="text-slate-500 text-sm font-medium">追踪微观执行，掌控每一个细节。</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="group relative flex items-center gap-2.5 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-7 py-3.5 rounded-2xl font-black text-sm shadow-[0_12px_24px_-8px_rgba(79,70,229,0.4)] hover:shadow-[0_18px_30px_-8px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
        >
          <div className="bg-white/20 p-1 rounded-lg">
            <Plus size={18} strokeWidth={3} />
          </div>
          <span className="tracking-wide">添加任务</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/50 rounded-2xl">
            {[
              { id: 'all', label: '全部' },
              { id: 'pending', label: '待处理' },
              { id: 'completed', label: '已完成' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-6 py-2 text-xs font-black rounded-xl transition-all ${
                  filter === f.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="搜索任务或备注..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 w-full sm:w-64 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading && todos.length === 0 ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : filteredTodos.map((todo) => (
            <div 
              key={todo.id} 
              className={`group px-6 py-5 flex items-center gap-5 hover:bg-slate-50/80 transition-all relative ${showMenuId === todo.id ? 'z-50 ring-1 ring-indigo-50 bg-indigo-50/10' : 'z-0'}`}
            >
              <button 
                onClick={() => toggleTodo(todo.id)}
                className={`flex-shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shadow-sm ${
                  todo.is_completed 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'border-slate-300 bg-white group-hover:border-indigo-400 group-hover:scale-110'
                }`}
              >
                {todo.is_completed && <CheckCircle2 size={18} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-black text-lg truncate tracking-tight ${todo.is_completed ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                    {todo.title}
                  </h4>
                </div>
                
                {todo.description && (
                  <p className={`text-sm mt-1 line-clamp-1 font-medium ${todo.is_completed ? 'text-slate-200' : 'text-slate-500'}`}>
                    {todo.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-2">
                  {getGoalTitle(todo.goal_id) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-black uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-lg">
                      <Target size={12} />
                      {getGoalTitle(todo.goal_id)}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    <Calendar size={12} />
                    {formatToBeijingISO(todo.due_date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`hidden md:block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getPriorityColor(todo.priority)}`}>
                  {todo.priority === Priority.HIGH ? '紧急' : todo.priority === Priority.MEDIUM ? '中等' : '普通'}
                </div>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenuId(showMenuId === todo.id ? null : todo.id);
                    }}
                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative z-10"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {showMenuId === todo.id && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowMenuId(null)}></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in duration-200">
                        <button 
                          onClick={() => openModal(todo)}
                          className="w-full px-5 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                        >
                          <Edit3 size={16} className="text-indigo-500" /> 编辑任务
                        </button>
                        <div className="h-px bg-slate-50 mx-2"></div>
                        <button 
                          onClick={() => { deleteTodo(todo.id); setShowMenuId(null); }}
                          className="w-full px-5 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                        >
                          <Trash2 size={16} /> 删除任务
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredTodos.length === 0 && !loading && (
            <div className="py-32 flex flex-col items-center justify-center text-slate-300">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CalendarDays size={40} className="opacity-20 text-slate-400" />
              </div>
              <p className="font-black text-xl text-slate-400 tracking-tight">空空如也</p>
              <p className="text-sm font-medium mt-1">今天是个放松的好日子吗？</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingTodo ? '重塑任务细节' : '定义新任务'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full shadow-sm transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">任务名称</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:font-normal"
                  placeholder="你想完成什么？"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">关联战略目标</label>
                <select 
                  value={formData.goal_id}
                  onChange={e => setFormData({...formData, goal_id: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="">独立任务 (不关联目标)</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">截止日期</label>
                  <input 
                    type="date" 
                    value={formData.due_date}
                    onChange={e => setFormData({...formData, due_date: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">预计耗时 (分)</label>
                  <input 
                    type="number" 
                    value={formData.estimated_time}
                    onChange={e => setFormData({...formData, estimated_time: parseInt(e.target.value) || 0})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">紧急程度</label>
                <div className="grid grid-cols-3 gap-4">
                  {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({...formData, priority: p})}
                      className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all ${
                        formData.priority === p 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_10px_15px_-5px_rgba(79,70,229,0.3)]' 
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200'
                      }`}
                    >
                      {p === Priority.HIGH ? '紧急' : p === Priority.MEDIUM ? '中等' : '普通'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 active:scale-95 transition-all">
                  {editingTodo ? '确认重塑任务' : '部署新任务'}
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
