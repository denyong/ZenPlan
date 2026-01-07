
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
        deadline: formatToBeijingISO(goal.deadline)
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        level: GoalLevel.SHORT,
        progress: 0,
        deadline: formatToBeijingISO()
      });
    }
    setIsModalOpen(true);
    setShowMenuId(null);
  };

  const handleAiBreakdown = async () => {
    if (!formData.title) return;
    setAiBreaking(true);
    try {
      const result = await fetchGoalBreakdown(formData.title, formData.description);
      if (result && result.subgoals) {
        const breakdownText = result.subgoals.map((sg: any) => `• ${sg.title}: ${sg.description}`).join('\n');
        setFormData(prev => ({
          ...prev,
          description: prev.description ? `${prev.description}\n\n[AI 建议拆解]:\n${breakdownText}` : breakdownText
        }));
      }
    } catch (error: any) {
      console.error(error);
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
      deadline: formData.deadline ? `${formData.deadline}T00:00:00.000+08:00` : undefined
    };
    if (editingGoal) {
      await updateGoal(editingGoal.id, payload);
    } else {
      await addGoal(payload);
    }
    setIsModalOpen(false);
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '未设定';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return '无效日期';
    }
  };

  return (
    <div className="space-y-6">
      {showMenuId && (
        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowMenuId(null)} />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">目标管理</h1>
          <p className="text-slate-500 text-sm font-medium">规划你的愿景，并追踪多层级的执行进度。</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={20} />
            </button>
          </div>
          <button 
            onClick={() => openModal()}
            className="group flex items-center gap-2.5 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-7 py-3.5 rounded-2xl font-black text-sm shadow-[0_12px_24px_-8px_rgba(79,70,229,0.4)] hover:shadow-[0_18px_30px_-8px_rgba(79,70,229,0.5)] hover:-translate-y-1 active:scale-95 transition-all duration-300"
          >
            <PlusCircle size={20} />
            <span className="tracking-wide">创建新目标</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
          {(['all', GoalLevel.LONG, GoalLevel.MID, GoalLevel.SHORT] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-6 py-3 text-xs font-black transition-all whitespace-nowrap relative uppercase tracking-widest ${
                selectedLevel === level ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {level === 'all' ? '全部' : level === GoalLevel.LONG ? '长期' : level === GoalLevel.MID ? '中期' : '短期'}目标
              {selectedLevel === level && (
                <div className="absolute bottom-0 left-4 right-4 h-1 bg-indigo-600 rounded-full animate-in slide-in-from-bottom-2"></div>
              )}
            </button>
          ))}
        </div>
        
        <div className="relative pb-2 sm:pb-3 min-w-[260px]">
          <Search className="absolute left-4 top-1/2 -translate-y-[calc(50%+4px)] sm:-translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="搜索目标名称..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading && goals.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p className="font-bold">数据同步中...</p>
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-8`}>
          {filteredGoals.map((goal) => (
            <div 
              key={goal.id} 
              className={`bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 hover:shadow-2xl hover:-translate-y-1.5 transition-all group relative ${showMenuId === goal.id ? 'z-50' : 'z-10'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] ${
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
                    className={`p-2 rounded-xl transition-all ${showMenuId === goal.id ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {showMenuId === goal.id && (
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-2xl border border-slate-50 py-2.5 z-[60] animate-in fade-in zoom-in duration-200">
                      <button 
                        type="button"
                        onClick={(e) => handleAction(e, () => openModal(goal))}
                        className="w-full px-5 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                      >
                        <Edit3 size={16} className="text-indigo-500" /> 编辑
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleAction(e, () => deleteGoal(goal.id))}
                        className="w-full px-5 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                      >
                        <Trash2 size={16} /> 删除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors tracking-tight">{goal.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 min-h-[3.75rem] font-medium leading-relaxed">{goal.description || '无详细描述'}</p>
              </div>

              <div className="mt-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50 shadow-sm">
                  <Calendar size={14} className="text-slate-300" />
                  <span>截止: {formatDateDisplay(goal.deadline)}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">当前进展</span>
                  <span className="text-indigo-600 font-black text-base">{goal.progress}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner p-0.5">
                  <div 
                    className={`h-full transition-all duration-1000 rounded-full shadow-sm ${
                      goal.level === GoalLevel.LONG ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      goal.level === GoalLevel.MID ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
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
              className="border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-8 text-slate-400 hover:bg-white hover:border-indigo-300 hover:text-indigo-500 transition-all cursor-pointer min-h-[320px] bg-slate-50/50 group shadow-sm hover:shadow-xl"
            >
              <div className="w-20 h-20 rounded-[28px] bg-white border border-slate-100 flex items-center justify-center mb-6 text-slate-200 group-hover:text-indigo-600 group-hover:scale-110 group-hover:rotate-90 transition-all shadow-sm">
                <Plus size={40} strokeWidth={1.5} />
              </div>
              <p className="font-black uppercase tracking-[0.2em] text-xs">定义新战略</p>
            </button>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[48px] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100">
            <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingGoal ? '重塑战略目标' : '建立新战略'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shadow-sm">
                <X size={28} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-12 space-y-8">
              <div className="space-y-3 relative">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">目标愿景</label>
                  <button
                    type="button"
                    onClick={handleAiBreakdown}
                    disabled={aiBreaking || !formData.title}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black hover:bg-indigo-100 transition-all disabled:opacity-50 border border-indigo-100 shadow-sm shadow-indigo-100/50"
                  >
                    {aiBreaking ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="fill-indigo-100" />}
                    AI 智能拆解
                  </button>
                </div>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="例如：成为全栈开发专家"
                  className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-black text-lg placeholder:font-normal"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">详细描述</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="为了实现这个愿景，我需要..."
                  rows={4}
                  className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none font-bold custom-scrollbar"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">目标层级</label>
                  <select 
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value as GoalLevel})}
                    className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-black appearance-none cursor-pointer"
                  >
                    <option value={GoalLevel.LONG}>长期战略 (1-3年)</option>
                    <option value={GoalLevel.MID}>中期规划 (3-6月)</option>
                    <option value={GoalLevel.SHORT}>短期突击 (1月内)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">截止日期</label>
                  <input 
                    type="date" 
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-black cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">当前进度</label>
                   <span className="text-indigo-600 font-black text-lg">{formData.progress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100"
                  value={formData.progress}
                  onChange={e => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                  className="w-full h-2.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
                />
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full py-6 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-[28px] font-black text-xl shadow-2xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-1.5 active:scale-95 transition-all duration-300 tracking-tight">
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
