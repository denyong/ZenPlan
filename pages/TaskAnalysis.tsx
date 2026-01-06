
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
        .replace(/\\"/g, '"');
    } catch (e) { return str; }
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
      }
      setDisplayedText(decodeAiText(content));
    } else if (!fullText.startsWith('{')) {
      setDisplayedText(decodeAiText(fullText));
    }

    const radarMatch = fullText.match(/"radar_stats"\s*:\s*({[^}]+})/);
    if (radarMatch) {
      try {
        const stats = JSON.parse(radarMatch[1]);
        setRadarStats(prev => ({ ...prev, ...stats }));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">AI 行为诊断</h1>
            <p className="text-slate-400 font-bold text-xs">基于执行数据，由后端 AI 模型进行深度行为建模。</p>
          </div>
        </div>
        <button 
          onClick={performAnalysis}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
          {loading ? '诊断中...' : '启动行为审计'}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-hidden pb-2">
        <div className="xl:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center min-h-[400px]">
            <h3 className="text-xs font-black mb-4 w-full flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-2"><div className="w-1 h-4 bg-indigo-600 rounded-full"></div>能力分布</span>
              <BarChart3 className="text-slate-200" size={16} />
            </h3>
            <div className="w-full flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                  <Radar name="Score" dataKey="A" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-4 grid grid-cols-2 gap-2">
              {chartData.map(d => (
                <div key={d.subject} className="flex flex-col p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.subject}</span>
                  <span className="text-xl font-black text-slate-900">{d.A}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 bg-[#0f172a] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
            <Quote size={200} className="text-white" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col p-8 md:p-10 overflow-hidden">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">SERVER-SIDE AI REPORT</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
              {error ? (
                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-100 flex gap-4">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              ) : displayedText ? (
                <div className="markdown-body">
                  <ReactMarkdown>{displayedText}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <BrainCircuit size={64} className="mb-4 opacity-10" />
                  <p className="text-sm font-bold">待命。点击“启动行为审计”以请求后端诊断。</p>
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
