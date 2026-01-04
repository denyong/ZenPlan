
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
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-4 tracking-tight text-slate-900">
            <div className="p-3 bg-indigo-600 text-white rounded-[1.25rem] shadow-xl shadow-indigo-100">
              <BrainCircuit size={32} />
            </div>
            任务执行审计
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">AI 深度剖析您的执行链路。冷静规划，极致执行。</p>
        </div>
        <button 
          onClick={performAnalysis}
          disabled={loading}
          className={`flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg transition-all disabled:opacity-50 group shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {loading ? <RefreshCw size={24} className="animate-spin" /> : <Play size={24} fill="currentColor" />}
          {loading ? '正在诊断模式...' : '启动 AI 效能诊断'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* 左侧：量化面板 */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <h3 className="text-xl font-black mb-10 w-full flex items-center justify-between">
              <span className="flex items-center gap-3 text-slate-800">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                核心效能画像
              </span>
              <BarChart3 className="text-slate-200" size={24} />
            </h3>
            
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="AI 分值"
                    dataKey="A"
                    stroke="#6366f1"
                    strokeWidth={4}
                    fill="#6366f1"
                    fillOpacity={0.1}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full mt-10 grid grid-cols-2 gap-3">
              {chartData.map(d => (
                <div key={d.subject} className="flex flex-col p-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] transition-all hover:bg-indigo-50 hover:border-indigo-100 group">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400">{d.subject}</span>
                  <span className="text-2xl font-black text-slate-900 group-hover:text-indigo-600">{d.A}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：报告展示面板 - 极致汉化与留白 */}
        <div className="xl:col-span-8 bg-[#020617] rounded-[3.5rem] shadow-2xl overflow-hidden min-h-[800px] flex flex-col relative group glow-border border border-white/5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_60%)]"></div>
          
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-[4000ms]">
            <Quote size={300} className="text-white" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col p-16 md:p-24">
            <div className="flex items-center justify-between mb-20">
              <div className="flex items-center gap-4 bg-indigo-500/10 border border-indigo-400/20 px-6 py-3 rounded-full backdrop-blur-md">
                <Sparkles size={18} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-300">AI 深度行为审计报告</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-slate-600 font-bold text-[10px] tracking-widest uppercase">
                CalmExec 智能分析引擎 v3.0
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-8">
              {error ? (
                <div className="bg-rose-500/10 border border-rose-500/20 p-12 rounded-[3rem] flex items-start gap-8">
                  <AlertCircle className="text-rose-400 shrink-0 mt-1" size={36} />
                  <div>
                    <h4 className="font-black text-rose-100 text-2xl mb-4">审计链路异常</h4>
                    <p className="text-rose-100/70 text-lg leading-relaxed font-medium">{error}</p>
                  </div>
                </div>
              ) : displayedText ? (
                <div className="markdown-body animate-in slide-in-from-bottom-8 duration-1000">
                  <ReactMarkdown>{displayedText}</ReactMarkdown>
                  {loading && (
                    <div className="mt-12 flex items-center gap-4 text-indigo-400 font-black text-sm animate-pulse">
                      <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                      正在实时注入底层逻辑诊断...
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-500 space-y-10">
                  <div className="w-36 h-36 bg-white/5 rounded-[3.5rem] flex items-center justify-center text-slate-700 border border-white/5 animate-pulse">
                    <BarChart3 size={64} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-black text-slate-100 text-3xl mb-5 tracking-tight">准备进行深度审计</h3>
                    <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed text-lg">
                      系统已就绪，正在等待扫描任务流中的隐藏模式。启动诊断后，AI 报告将以极致清晰的 Markdown 结构呈现在此。
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
