
import React, { useState, useEffect } from 'react';
import { useStore } from '../store.ts';
import { GoalLevel, Goal } from '../types.ts';
import { 
  Target, 
  MoreVertical, 
  Plus, 
  LayoutGrid, 
  List, 
  PlusCircle, 
  X,
  Trash2,
  Edit3,
  Search,
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react';

const GoalManager: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, fetchGoals, fetchGoalBreakdown, loading } = useStore();
  const [selectedLevel, setSelectedLevel] = useState<GoalLevel | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiBreaking, setAiBreaking] = useState(false);
  
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: GoalLevel.SHORT,
    progress: 0,
    deadline: ''
  });

  const filteredGoals = goals.filter(g => {
    const matchesLevel = selectedLevel === 'all' || g.level === selectedLevel;
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  const openModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description,
        level: goal.level,
        progress: goal.progress,
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        level: GoalLevel.SHORT,
        progress: 0,
        deadline: ''
      });
    }
    setIsModalOpen(true);
    setShowMenuId(null);
  };

  const handleAiBreakdown = async () => {
    if (!formData.title) return;
    setAiBreaking(true);
    try {
      // 改为调用 store 中的后端 API
      const result = await fetchGoalBreakdown(formData.title, formData.description);
      if (result && result.subgoals) {
        const breakdownText = result.subgoals.map((sg: any) => `• ${sg.title}: ${sg.description}`).join('\n');
        setFormData(prev => ({
          ...prev,
          description: prev.description ? `${prev.description}\n\n[后端 AI 建议拆解]:\n${breakdownText}` : breakdownText
        }));
      } else if (typeof result === 'string') {
        // 如果后端直接返回字符串
        setFormData(prev => ({
          ...prev,
          description: prev.description ? `${prev.description}\n\n[后端 AI 建议拆解]:\n${result}` : result
        }));
      }
    } catch (error: any) {
      console.error(error);
      alert("AI 拆解失败: " + error.message);
    } finally {
      setAiBreaking(false);
    }
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setShowMenuId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined
    };
    if (editingGoal) {
      await updateGoal(editingGoal.id, payload);
    } else {
      await addGoal(payload);
    }
    setIsModalOpen(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '未设定';
    return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {showMenuId && (
        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowMenuId(null)} />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">目标管理</h1>
          <p className="text-slate-500 text-sm font-medium">规划你的愿景，并追踪多层级的执行进度。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
              title="网格视图"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
              title="列表视图"
            >
              <List size={20} />
            </button>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <PlusCircle size={20} />
            创建新目标
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['all', GoalLevel.LONG, GoalLevel.MID, GoalLevel.SHORT] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-6 py-3 text-sm font-bold transition-all whitespace-nowrap relative ${
                selectedLevel === level ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {level === 'all' ? '全部' : level === GoalLevel.LONG ? '长期' : level === GoalLevel.MID ? '中期' : '短期'}目标
              {selectedLevel === level && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
          ))}
        </div>
        
        <div className="relative pb-2 sm:pb-0 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="搜索目标名称..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {loading && goals.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>数据加载中...</p>
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {filteredGoals.map((goal) => (
            <div 
              key={goal.id} 
              className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all group relative ${showMenuId === goal.id ? 'z-50' : 'z-10'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  goal.level === GoalLevel.LONG ? 'bg-purple-50 text-purple-600' :
                  goal.level === GoalLevel.MID ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {goal.level === GoalLevel.LONG ? '长期战略' : goal.level === GoalLevel.MID ? '中期规划' : '短期突击'}
                </div>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenuId(showMenuId === goal.id ? null : goal.id);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${showMenuId === goal.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {showMenuId === goal.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[60] animate-in fade-in zoom-in duration-200">
                      <button 
                        type="button"
                        onClick={(e) => handleAction(e, () => openModal(goal))}
                        className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <Edit3 size={14} className="text-indigo-500" /> 编辑
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleAction(e, () => deleteGoal(goal.id))}
                        className="w-full px-4 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={14} /> 删除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{goal.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 min-h-[2.5rem] font-medium leading-relaxed">{goal.description || '无详细描述'}</p>
              </div>

              <div className="mt-6 flex items-center gap-4 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                  <Calendar size={14} className="text-slate-400" />
                  <span>截止: {formatDate(goal.deadline)}</span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">当前进度</span>
                  <span className="text-indigo-600 font-black text-sm">{goal.progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 shadow-sm ${
                      goal.level === GoalLevel.LONG ? 'bg-purple-500' :
                      goal.level === GoalLevel.MID ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          {(!searchTerm || filteredGoals.length > 0) && (
            <button 
              onClick={() => openModal()}
              className="border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center p-8 text-slate-400 hover:bg-white hover:border-indigo-400 hover:text-indigo-500 transition-all cursor-pointer min-h-[260px] bg-slate-50 group shadow-sm hover:shadow-md"
            >
              <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 text-slate-300 group-hover:text-indigo-600 group-hover:scale-110 transition-all shadow-sm">
                <Plus size={32} />
              </div>
              <p className="font-black uppercase tracking-widest text-xs">定义新战略</p>
            </button>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingGoal ? '重塑战略目标' : '建立新战略'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shadow-sm">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">目标愿景</label>
                  <button
                    type="button"
                    onClick={handleAiBreakdown}
                    disabled={aiBreaking || !formData.title}
                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black hover:bg-indigo-100 transition-all disabled:opacity-50 border border-indigo-100"
                  >
                    {aiBreaking ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    AI 智能拆解
                  </button>
                </div>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="例如：成为全栈开发专家"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">详细描述</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="为了实现这个愿景，我需要..."
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none font-medium custom-scrollbar"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">目标层级</label>
                  <select 
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value as GoalLevel})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value={GoalLevel.LONG}>长期战略 (1-3年)</option>
                    <option value={GoalLevel.MID}>中期规划 (3-6月)</option>
                    <option value={GoalLevel.SHORT}>短期突击 (1月内)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">截止日期</label>
                  <input 
                    type="date" 
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">当前进度</label>
                   <span className="text-indigo-600 font-black">{formData.progress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100"
                  value={formData.progress}
                  onChange={e => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all">
                  {editingGoal ? '确认重塑战略' : '启动新战略'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalManager;
