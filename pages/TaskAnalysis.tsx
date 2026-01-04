
import React, { useState, useRef, useMemo } from 'react';
import { useStore } from '../store.ts';
import { 
  BrainCircuit, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  BarChart3,
  Play,
  Quote
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, PolarRadiusAxis
} from 'recharts';

const TaskAnalysis: React.FC = () => {
  const { fetchTaskAnalysis } = useStore();
  const [displayedText, setDisplayedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const rawBuffer = useRef("");

  // 从纯文本中尝试提取分数的正则逻辑（作为雷达图的后备显示）
  const radarStats = useMemo(() => {
    const stats = { execution: 0, planning: 0, urgency: 0, focus: 0, estimation: 0 };
    const text = displayedText;
    
    const matchVal = (key: string) => {
      const reg = new RegExp(`${key}=\\[(\\d+)`);
      const m = text.match(reg);
      return m ? parseInt(m[1]) : 0;
    };

    stats.execution = matchVal('执行力');
    stats.planning = matchVal('规划感');
    stats.urgency = matchVal('紧迫感');
    stats.focus = matchVal('专注度');
    stats.estimation = matchVal('预估准度');

    return stats;
  }, [displayedText]);

  const performAnalysis = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setDisplayedText("");
    rawBuffer.current = "";
    
    try {
      await fetchTaskAnalysis((chunk) => {
        rawBuffer.current += chunk;
        setDisplayedText(rawBuffer.current);
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { subject: '执行力', A: radarStats.execution, fullMark: 100 },
    { subject: '规划感', A: radarStats.planning, fullMark: 100 },
    { subject: '紧迫感', A: radarStats.urgency, fullMark: 100 },
    { subject: '专注度', A: radarStats.focus, fullMark: 100 },
    { subject: '预估准度', A: radarStats.estimation, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm">
              <BrainCircuit size={28} />
            </div>
            任务智能分析
          </h1>
          <p className="text-slate-500 font-medium mt-1">AI 深度剖析您的执行链路。冷静规划，极致执行。</p>
        </div>
        <button 
          onClick={performAnalysis}
          disabled={loading}
          className={`flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black transition-all disabled:opacity-50 group shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {loading ? <RefreshCw size={20} className="animate-spin" /> : <Play size={20} fill="currentColor" />}
          {loading ? '正在进行深度审计...' : '启动 AI 效能诊断'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 数据面板 */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-black mb-8 w-full flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
            量化效能画像
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="AI Score"
                  dataKey="A"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fill="#6366f1"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-6 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center px-4">根据右侧文本实时捕捉的执行指标</p>
        </div>

        {/* 报告面板 */}
        <div className="lg:col-span-2 bg-[#0f172a] rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-[3000ms]">
            <Quote size={240} className="text-white" />
          </div>

          <div className="p-1 w-full h-full flex flex-col flex-1">
             <div className="bg-white/5 backdrop-blur-3xl p-10 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 bg-indigo-500/20 border border-indigo-400/30 px-5 py-2 rounded-full">
                  <Sparkles size={16} className="text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-100">专家纯文本审计报告</span>
                </div>
              </div>

              {error ? (
                <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl flex items-start gap-4">
                  <AlertCircle className="text-rose-400 shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-black text-rose-200 mb-2">审计链路异常</h4>
                    <p className="text-rose-100/70 text-sm leading-relaxed font-medium">{error}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                  {displayedText ? (
                    <div className="text-slate-300 font-medium text-lg leading-relaxed whitespace-pre-wrap font-sans selection:bg-indigo-500/30">
                      {displayedText}
                      {loading && (
                        <span className="inline-block w-2 h-5 bg-indigo-500 animate-pulse ml-1 translate-y-1"></span>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-slate-500 space-y-6">
                      <div className="w-24 h-24 bg-indigo-500/5 rounded-[2rem] flex items-center justify-center text-indigo-400 border border-indigo-500/10 animate-pulse">
                        <BarChart3 size={48} />
                      </div>
                      <div className="text-center">
                        <p className="font-black text-slate-200 text-xl mb-2 tracking-tight">等待启动深度审计...</p>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                          点击“启动”按钮，系统将绕过格式化处理，直接输出由专家撰写的底层执行模式诊断报告。
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalysis;
