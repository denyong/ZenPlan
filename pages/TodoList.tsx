
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
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalId: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: Priority.MEDIUM,
    estimatedTime: 30
  });

  const filteredTodos = todos.filter(t => {
    const matchesFilter = filter === 'all' || (filter === 'pending' && !t.isCompleted) || (filter === 'completed' && t.isCompleted);
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

  const getGoalTitle = (goalId?: string) => {
    if (!goalId) return null;
    return goals.find(g => g.id === goalId)?.title;
  };

  const openModal = (todo?: Todo) => {
    if (todo) {
      setEditingTodo(todo);
      setFormData({
        title: todo.title,
        description: todo.description || '',
        goalId: todo.goalId || '',
        dueDate: new Date(todo.dueDate).toISOString().split('T')[0],
        priority: todo.priority,
        estimatedTime: todo.estimatedTime
      });
    } else {
      setEditingTodo(null);
      setFormData({
        title: '',
        description: '',
        goalId: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: Priority.MEDIUM,
        estimatedTime: 30
      });
    }
    setIsModalOpen(true);
    setShowMenuId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString()
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
          <h1 className="text-3xl font-bold">待办事项</h1>
          <p className="text-slate-500 text-sm">管理你的微观执行，确保每一份努力都有迹可循。</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          添加任务
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'all', label: '全部' },
              { id: 'pending', label: '待处理' },
              { id: 'completed', label: '已完成' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
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
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {loading && todos.length === 0 ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : filteredTodos.map((todo) => (
            <div key={todo.id} className="group px-6 py-5 flex items-center gap-5 hover:bg-slate-50 transition-all">
              <button 
                onClick={() => toggleTodo(todo.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  todo.isCompleted 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'border-slate-300 group-hover:border-indigo-400'
                }`}
              >
                {todo.isCompleted && <CheckCircle2 size={16} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold text-lg truncate ${todo.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {todo.title}
                  </h4>
                </div>
                
                {todo.description && (
                  <p className={`text-sm mt-1 line-clamp-1 ${todo.isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                    {todo.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-2">
                  {getGoalTitle(todo.goalId) && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
                      <Target size={12} />
                      {getGoalTitle(todo.goalId)}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar size={12} />
                    {new Date(todo.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`hidden md:block px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${getPriorityColor(todo.priority)}`}>
                  {todo.priority === Priority.HIGH ? '紧急' : todo.priority === Priority.MEDIUM ? '中等' : '普通'}
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowMenuId(showMenuId === todo.id ? null : todo.id)}
                    className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {showMenuId === todo.id && (
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in duration-200">
                      <button 
                        onClick={() => openModal(todo)}
                        className="w-full px-5 py-2.5 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit3 size={16} /> 编辑
                      </button>
                      <button 
                        onClick={() => { deleteTodo(todo.id); setShowMenuId(null); }}
                        className="w-full px-5 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Trash2 size={16} /> 删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredTodos.length === 0 && !loading && (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
              <CalendarDays size={40} className="mb-4" />
              <p className="font-bold text-xl text-slate-500">空空如也</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">{editingTodo ? '编辑任务详情' : '定义新任务'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full shadow-sm transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">任务名称</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">关联战略目标</label>
                <select 
                  value={formData.goalId}
                  onChange={e => setFormData({...formData, goalId: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                >
                  <option value="">独立任务 (不关联目标)</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">截止日期</label>
                  <input 
                    type="date" 
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">预计耗时 (分)</label>
                  <input 
                    type="number" 
                    value={formData.estimatedTime}
                    onChange={e => setFormData({...formData, estimatedTime: parseInt(e.target.value) || 0})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">紧急程度</label>
                <div className="grid grid-cols-3 gap-3">
                  {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({...formData, priority: p})}
                      className={`py-3 px-4 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest border transition-all ${
                        formData.priority === p 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {p === Priority.HIGH ? '紧急' : p === Priority.MEDIUM ? '中等' : '普通'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-[20px] font-bold text-lg">
                  {editingTodo ? '保存修改' : '确认添加任务'}
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
