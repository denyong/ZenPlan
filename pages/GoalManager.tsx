
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
  Sparkles,
  Zap
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
    return matchesSearch && matchesLevel;
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
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
               <Target size={28} />
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">战略目标</h1>
          </div>
          <p className="text-slate-500 font-bold text-sm tracking-wide ml-1">规划你的长期愿景，并追踪多层级的执行进度。</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="bg-white p-2 rounded-[24px] border border-slate-200 flex shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={22} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={22} />
            </button>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-[28px] blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <button 
              onClick={() => openModal()}
              className="relative flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[26px] font-black text-sm shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-95 border border-white/10"
            >
              <PlusCircle size={22} />
              <span className="tracking-widest uppercase">定义新愿景</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['all', GoalLevel.LONG, GoalLevel.MID, GoalLevel.SHORT] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-8 py-4 text-[10px] font-black transition-all whitespace-nowrap rounded-2xl uppercase tracking-[0.2em] ${
                selectedLevel === level 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white'
              }`}
            >
              {level === 'all' ? '全部视角' : level === GoalLevel.LONG ? '长期战略' : level === GoalLevel.MID ? '中期规划' : '短期突击'}
            </button>
          ))}
        </div>
        
        <div className="relative group/search min-w-[320px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover/search:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="在愿景中检索..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[24px] text-sm font-bold focus:outline-none focus:ring-12 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading && goals.length === 0 ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">战略图谱加载中...</p>
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-10`}>
          {filteredGoals.map((goal) => (
            <div 
              key={goal.id} 
              className={`bg-white rounded-[48px] border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.03)] p-10 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 group relative ${showMenuId === goal.id ? 'z-50' : 'z-10'}`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                  goal.level === GoalLevel.LONG ? 'bg-purple-600 text-white shadow-purple-100' :
                  goal.level === GoalLevel.MID ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-emerald-600 text-white shadow-emerald-100'
                }`}>
                  {goal.level === GoalLevel.LONG ? 'Strategic' : goal.level === GoalLevel.MID ? 'Planning' : 'Tactical'}
                </div>
                
                <div className="relative">
                  <button 
                    onClick={(e) => { e.preventDefault(); setShowMenuId(showMenuId === goal.id ? null : goal.id); }}
                    className={`p-3 rounded-2xl transition-all ${showMenuId === goal.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-300 hover:text-slate-900 hover:bg-slate-50'}`}
                  >
                    <MoreVertical size={22} />
                  </button>
                  {showMenuId === goal.id && (
                    <div className="absolute right-0 mt-3 w-40 bg-white rounded-3xl shadow-2xl border border-slate-50 py-3 z-[60] animate-in fade-in zoom-in duration-300">
                      <button 
                        onClick={() => openModal(goal)}
                        className="w-full px-6 py-4 text-left text-sm font-black text-slate-600 hover:bg-slate-50 flex items-center gap-4 transition-colors"
                      >
                        <Edit3 size={18} className="text-indigo-500" /> 编辑
                      </button>
                      <button 
                        onClick={() => deleteGoal(goal.id)}
                        className="w-full px-6 py-4 text-left text-sm font-black text-rose-500 hover:bg-rose-50 flex items-center gap-4 transition-colors"
                      >
                        <Trash2 size={18} /> 删除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 leading-[1.1] group-hover:text-indigo-600 transition-colors tracking-tight">{goal.title}</h3>
                <p className="text-slate-400 text-base font-bold leading-relaxed line-clamp-2 h-[3rem]">{goal.description || '无详细描述'}</p>
              </div>

              <div className="mt-10 flex items-center gap-3">
                <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-300" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{formatDateDisplay(goal.deadline)}</span>
                </div>
                {goal.progress >= 100 && (
                   <div className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-2xl flex items-center gap-1.5 animate-bounce">
                      <Zap size={14} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Achieved</span>
                   </div>
                )}
              </div>

              <div className="mt-10 space-y-5">
                <div className="flex justify-between items-end">
                  <span className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">当前执行进度</span>
                  <span className="text-indigo-600 font-black text-2xl tracking-tighter">{goal.progress}%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-slate-50">
                  <div 
                    className={`h-full transition-all duration-1000 rounded-full shadow-lg ${
                      goal.level === GoalLevel.LONG ? 'bg-gradient-to-r from-purple-500 to-purple-700' :
                      goal.level === GoalLevel.MID ? 'bg-gradient-to-r from-indigo-500 to-blue-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'
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
              className="border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center p-12 text-slate-300 hover:bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all duration-500 cursor-pointer min-h-[400px] bg-slate-50/40 group shadow-sm hover:shadow-[0_40px_80px_rgba(79,70,229,0.1)]"
            >
              <div className="w-24 h-24 rounded-[36px] bg-white border border-slate-100 flex items-center justify-center mb-8 text-slate-200 group-hover:text-indigo-600 group-hover:scale-110 group-hover:shadow-xl transition-all shadow-sm">
                <Plus size={48} strokeWidth={1.5} />
              </div>
              <p className="font-black uppercase tracking-[0.3em] text-xs">建立新战略</p>
              <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-widest">Start your evolution</p>
            </button>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[60px] shadow-[0_50px_100px_rgba(0,0,0,0.3)] w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-20 duration-500 border border-white/20">
            <div className="px-14 py-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{editingGoal ? '重塑愿景' : '开启愿景'}</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Goal Architecture Prototype</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-3xl shadow-sm transition-all hover:rotate-90">
                <X size={32} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-14 space-y-10">
              <div className="space-y-4 relative">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">战略标题 (Mission)</label>
                  <button
                    type="button"
                    onClick={handleAiBreakdown}
                    disabled={aiBreaking || !formData.title}
                    className="flex items-center gap-3 px-6 py-2.5 bg-indigo-900 text-white rounded-2xl text-[10px] font-black hover:bg-black transition-all disabled:opacity-30 shadow-xl shadow-indigo-100"
                  >
                    {aiBreaking ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-indigo-400" />}
                    AI 战略拆解
                  </button>
                </div>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="你想达成的宏伟愿景..."
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-12 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-2xl placeholder:font-normal placeholder:text-slate-200 shadow-sm"
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">行动详情 (Protocol)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="详细描述你的执行策略..."
                  rows={4}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-12 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none font-bold text-slate-700 shadow-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">战略周期 (Cycle)</label>
                  <select 
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value as GoalLevel})}
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-12 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-black appearance-none cursor-pointer shadow-sm text-slate-700"
                  >
                    <option value={GoalLevel.LONG}>长期战略 (1-3年)</option>
                    <option value={GoalLevel.MID}>中期规划 (3-6月)</option>
                    <option value={GoalLevel.SHORT}>短期突击 (1月内)</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">最终截止 (Deadline)</label>
                  <input 
                    type="date" 
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-12 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-black cursor-pointer shadow-sm text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-6 relative">
                 <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[44px] blur-2xl opacity-10 animate-pulse"></div>
                 <button type="submit" className="relative w-full py-8 bg-slate-900 text-white rounded-[40px] font-black text-2xl shadow-2xl hover:bg-black hover:-translate-y-2 active:scale-[0.98] transition-all duration-500 tracking-tighter">
                  {editingGoal ? '同步战略修改' : '立即启动战略'}
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
