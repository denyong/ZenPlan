
import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '../store.ts';
import { 
  BrainCircuit, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  BarChart3,
  Play,
  Quote,
  ArrowRight
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
  
  const [radarStats, setRadarStats] = useState({
    execution: 0,
    planning: 0,
    urgency: 0,
    focus: 0,
    estimation_accuracy: 0
  });

  const rawBuffer = useRef("");

  const decodeAiText = (str: string) => {
    if (!str) return "";
    try {
      return str
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, grp) => String.fromCharCode(parseInt(grp, 16)))
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\t/g, '  ')
        .replace(/\\r/g, '');
    } catch (e) {
      return str;
    }
  };

  const processChunk = (chunk: string) => {
    rawBuffer.current += chunk;
    const fullText = rawBuffer.current;

    const analysisMatch = fullText.match(/"analysis"\s*:\s*"/);
    if (analysisMatch && analysisMatch.index !== undefined) {
      const startPos = analysisMatch.index + analysisMatch[0].length;
      let content = fullText.slice(startPos);
      
      const terminatorMatch = content.match(/[^\\]"\s*[,}]/);
      if (terminatorMatch && terminatorMatch.index !== undefined) {
        content = content.slice(0, terminatorMatch.index + 1);
      } else if (content.endsWith('"')) {
        content = content.slice(0, -1);
      }
      
      setDisplayedText(decodeAiText(content));
    } else if (!fullText.startsWith('{')) {
      setDisplayedText(decodeAiText(fullText));
    }

    const radarMatch = fullText.match(/"radar_stats"\s*:\s*({[^}]+})/);
    if (radarMatch) {
      try {
        const statsStr = radarMatch[1];
        const extract = (key: string) => {
          const m = statsStr.match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`));
          return m ? parseInt(m[1]) : 0;
        };
        
        setRadarStats({
          execution: extract('execution'),
          planning: extract('planning'),
          urgency: extract('urgency'),
          focus: extract('focus'),
          estimation_accuracy: extract('estimation_accuracy'),
        });
      } catch (e) {}
    }
  };

  const performAnalysis = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setDisplayedText("");
    setRadarStats({ execution: 0, planning: 0, urgency: 0, focus: 0, estimation_accuracy: 0 });
    rawBuffer.current = "";
    
    try {
      await fetchTaskAnalysis((chunk) => {
        processChunk(chunk);
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
    { subject: '预估准度', A: radarStats.estimation_accuracy, fullMark: 100 },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6 overflow-hidden animate-in fade-in duration-700">
      {/* 紧凑型页头 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">任务审计</h1>
            <p className="text-slate-400 font-medium text-xs">冷静规划，极致执行。</p>
          </div>
        </div>
        <button 
          onClick={performAnalysis}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm transition-all shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
          {loading ? '审计中...' : '启动 AI 诊断'}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-hidden pb-2">
        {/* 左侧：量化面板 (高度自适应) */}
        <div className="xl:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center relative overflow-hidden">
            <h3 className="text-sm font-black mb-4 w-full flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                效能画像
              </span>
              <BarChart3 className="text-slate-200" size={16} />
            </h3>
            
            <div className="w-full flex-1 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="#6366f1"
                    fillOpacity={0.1}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full mt-4 grid grid-cols-2 gap-2">
              {chartData.map(d => (
                <div key={d.subject} className="flex flex-col p-3 bg-slate-50 border border-slate-100 rounded-2xl transition-all">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{d.subject}</span>
                  <span className="text-xl font-black text-slate-900">{d.A}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：报告展示面板 (固定高度，内部滚动) */}
        <div className="xl:col-span-8 bg-[#020617] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative group glow-border border border-white/5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.04),transparent_50%)]"></div>
          
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] rotate-12 pointer-events-none group-hover:scale-105 transition-transform duration-[4000ms]">
            <Quote size={200} className="text-white" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col p-8 md:p-10 overflow-hidden">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">AI 深度行为审计报告</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-slate-700 font-bold text-[9px] tracking-widest uppercase">
                CALMEXEC V3.0
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
              {error ? (
                <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex items-start gap-4">
                  <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-black text-rose-100 text-sm mb-1">审计中断</h4>
                    <p className="text-rose-100/70 text-xs leading-relaxed font-medium">{error}</p>
                  </div>
                </div>
              ) : displayedText ? (
                <div className="markdown-body animate-in slide-in-from-bottom-4 duration-700">
                  <ReactMarkdown>{displayedText}</ReactMarkdown>
                  {loading && (
                    <div className="mt-6 flex items-center gap-3 text-indigo-400 font-black text-[10px] animate-pulse">
                      <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                      正在注入诊断建议...
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-10 text-slate-500 space-y-6">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-700 border border-white/5 animate-pulse">
                    <BarChart3 size={32} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-black text-slate-200 text-lg mb-2">等待数据扫描</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto text-xs leading-relaxed">
                      启动审计后，AI 将在此单屏容器内精准呈现所有维度的效能分析。
                    </p>
                  </div>
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
