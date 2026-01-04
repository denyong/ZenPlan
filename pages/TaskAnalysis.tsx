
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
  
  const [radarStats, setRadarStats] = useState({
    execution: 0,
    planning: 0,
    urgency: 0,
    focus: 0,
    estimation_accuracy: 0
  });

  const rawBuffer = useRef("");

  // 针对后端 JSON 转义字符的解码处理
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

    // 匹配分析内容（兼容后端 data.analysis 结构）
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

    // 匹配雷达图分值
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
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {chartData.map(d => (
              <div key={d.subject} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[10px] font-black text-slate-400">{d.subject}</span>
                <span className="text-xs font-black text-indigo-600">{d.A}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 报告面板 - 强化背景与文字对比 */}
        <div className="lg:col-span-2 bg-[#020617] rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative group border border-white/5">
          <div className="absolute top-0 right-0 p-12 opacity-[0.04] rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-[3000ms]">
            <Quote size={240} className="text-white" />
          </div>

          <div className="p-1 w-full h-full flex flex-col flex-1">
             <div className="p-10 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-400/20 px-5 py-2.5 rounded-full">
                  <Sparkles size={16} className="text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-300">AI 深度诊断报告</span>
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
                    <div className="markdown-body">
                      <ReactMarkdown>{displayedText}</ReactMarkdown>
                      {loading && (
                        <span className="inline-block w-2.5 h-6 bg-indigo-500 animate-pulse ml-2 translate-y-1"></span>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-slate-500 space-y-6">
                      <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-600 border border-white/5 animate-pulse">
                        <BarChart3 size={48} />
                      </div>
                      <div className="text-center">
                        <p className="font-black text-slate-200 text-xl mb-2 tracking-tight">等待启动深度审计...</p>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                          系统将绕过多余的 UI 装饰，直接呈现由 AI 生成的高对比度分析报告。
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
