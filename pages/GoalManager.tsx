
import React, { useState, useEffect } from 'react';
import { useStore } from '../store.ts';
import { GoalLevel, Status, Goal } from '../types.ts';
import { 
  Target, 
  MoreVertical, 
  Plus, 
  LayoutGrid, 
  List, 
  PlusCircle, 
  ArrowRight,
  X,
  Trash2,
  Edit3,
  Search,
  Loader2
} from 'lucide-react';

const GoalManager: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, fetchGoals, loading } = useStore();
  const [selectedLevel, setSelectedLevel] = useState<GoalLevel | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: GoalLevel.SHORT,
    progress: 0
  });

  const filteredGoals = goals.filter(g => {
    const matchesLevel = selectedLevel === 'all' || g.level === selectedLevel;
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         g.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const openModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description,
        level: goal.level,
        progress: goal.progress
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        level: GoalLevel.SHORT,
        progress: 0
      });
    }
    setIsModalOpen(true);
    setShowMenuId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      await updateGoal(editingGoal.id, formData);
    } else {
      await addGoal(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">目标管理</h1>
          <p className="text-slate-500 text-sm">规划你的愿景，并追踪多层级的执行进度。</p>
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
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <PlusCircle size={20} />
            创建新目标
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
          {(['all', GoalLevel.LONG, GoalLevel.MID, GoalLevel.SHORT] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-6 py-3 text-sm font-semibold transition-all whitespace-nowrap relative ${
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
            placeholder="搜索目标名称或描述..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {loading && goals.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>加载中...</p>
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {filteredGoals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${
                  goal.level === GoalLevel.LONG ? 'bg-purple-100 text-purple-600' :
                  goal.level === GoalLevel.MID ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <Target size={24} />
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowMenuId(showMenuId === goal.id ? null : goal.id)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {showMenuId === goal.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in duration-200">
                      <button 
                        onClick={() => openModal(goal)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit3 size={14} /> 编辑
                      </button>
                      <button 
                        onClick={() => { deleteGoal(goal.id); setShowMenuId(null); }}
                        className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> 删除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{goal.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 min-h-[2.5rem]">{goal.description}</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">完成进度</span>
                  <span className="text-indigo-600 font-bold">{goal.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      goal.level === GoalLevel.LONG ? 'bg-purple-500' :
                      goal.level === GoalLevel.MID ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          {filteredGoals.length === 0 && searchTerm && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
              <Search size={32} className="mb-4" />
              <p className="font-medium text-lg text-slate-500">未找到匹配的目标</p>
            </div>
          )}

          {(!searchTerm || filteredGoals.length > 0) && (
            <div 
              onClick={() => openModal()}
              className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer min-h-[300px]"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Plus size={24} />
              </div>
              <p className="font-medium">定义新目标</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">{editingGoal ? '编辑目标' : '创建新目标'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">目标名称</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="例如：学习 React 高级架构"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">目标描述</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="详细描述你的目标愿景..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">目标级别</label>
                  <select 
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value as GoalLevel})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value={GoalLevel.LONG}>长期目标</option>
                    <option value={GoalLevel.MID}>中期目标</option>
                    <option value={GoalLevel.SHORT}>短期目标</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">当前进度 (%)</label>
                  <input 
                    type="number" 
                    min="0" max="100"
                    value={formData.progress}
                    onChange={e => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                  {editingGoal ? '保存修改' : '立即创建'}
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
