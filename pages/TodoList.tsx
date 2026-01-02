
import React, { useState } from 'react';
import { useStore } from '../store';
import { Priority, Status, Todo } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flag, 
  Plus, 
  Filter, 
  Search,
  Calendar,
  MoreVertical,
  Trash2,
  CalendarDays,
  Target,
  X,
  Edit3
} from 'lucide-react';

const TodoList: React.FC = () => {
  const { todos, goals, toggleTodo, deleteTodo, addTodo, updateTodo } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');

  // 模态框状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    goalId: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: Priority.MEDIUM,
    estimatedTime: 30
  });

  const filteredTodos = todos.filter(t => {
    const matchesFilter = filter === 'all' || (filter === 'pending' && !t.completed) || (filter === 'completed' && t.completed);
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
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
        goalId: todo.goalId || '',
        dueDate: new Date(todo.dueDate).toISOString().split('T')[0],
        priority: todo.priority,
        estimatedTime: todo.estimatedTime
      });
    } else {
      setEditingTodo(null);
      setFormData({
        title: '',
        goalId: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: Priority.MEDIUM,
        estimatedTime: 30
      });
    }
    setIsModalOpen(true);
    setShowMenuId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString()
    };
    if (editingTodo) {
      updateTodo(editingTodo.id, payload);
    } else {
      addTodo(payload);
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
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          添加任务
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* 控制区 */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-lg">
            {[
              { id: 'all', label: '全部' },
              { id: 'pending', label: '待处理' },
              { id: 'completed', label: '已完成' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === f.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="搜索任务..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors border border-slate-200 rounded-lg" title="筛选">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* 列表区 */}
        <div className="divide-y divide-slate-50">
          {filteredTodos.map((todo) => (
            <div key={todo.id} className="group px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-all">
              <button 
                onClick={() => toggleTodo(todo.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  todo.completed 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'border-slate-300 group-hover:border-indigo-400'
                }`}
              >
                {todo.completed && <CheckCircle2 size={16} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold truncate ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {todo.title}
                  </h4>
                  {todo.priority === Priority.HIGH && (
                    <Flag size={14} className="text-rose-500 fill-rose-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-1">
                  {getGoalTitle(todo.goalId) && (
                    <div className="flex items-center gap-1 text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                      <Target size={12} />
                      {getGoalTitle(todo.goalId)}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar size={12} />
                    {new Date(todo.dueDate).toLocaleDateString('zh-CN')}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={12} />
                    {todo.estimatedTime} 分钟
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`hidden md:block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(todo.priority)}`}>
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
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in duration-200">
                      <button 
                        onClick={() => openModal(todo)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit3 size={14} /> 编辑
                      </button>
                      <button 
                        onClick={() => { deleteTodo(todo.id); setShowMenuId(null); }}
                        className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> 删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredTodos.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CalendarDays size={32} />
              </div>
              <p className="font-medium text-lg text-slate-500">未找到相关任务</p>
              <p className="text-sm">保持专注，或者调整你的筛选条件。</p>
            </div>
          )}
        </div>

        {/* 页脚信息 */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
          <span>共计 {filteredTodos.length} 项</span>
          <span>实时同步中</span>
        </div>
      </div>

      {/* 待办事项模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">{editingTodo ? '编辑任务' : '添加新任务'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">任务内容</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="你想完成什么？"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">关联目标 (可选)</label>
                <select 
                  value={formData.goalId}
                  onChange={e => setFormData({...formData, goalId: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="">不关联目标</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">截止日期</label>
                  <input 
                    type="date" 
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">预计耗时 (分钟)</label>
                  <input 
                    type="number" 
                    value={formData.estimatedTime}
                    onChange={e => setFormData({...formData, estimatedTime: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">优先级</label>
                <div className="grid grid-cols-3 gap-3">
                  {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({...formData, priority: p})}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        formData.priority === p 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      {p === Priority.HIGH ? '紧急' : p === Priority.MEDIUM ? '中等' : '普通'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                  {editingTodo ? '保存修改' : '确认添加'}
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
