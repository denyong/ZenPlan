
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store.ts';
import { Priority } from '../types.ts';
import { 
  BrainCircuit, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, PolarRadiusAxis
} from 'recharts';

const TaskAnalysis: React.FC = () => {
  const { todos, fetchTaskAnalysis } = useStore();
  const [displayedText, setDisplayedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 动态雷达图数据
  const [radarStats, setRadarStats] = useState({
    execution: 0,
    planning: 0,
    urgency: 0,
    focus: 0,
    estimation_accuracy: 0
  });

  const rawBuffer = useRef("");

  // 深度解码：处理 Unicode、换行符和转义引号
  const decodeAiText = (str: string) => {
    try {
      return str
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, grp) => String.fromCharCode(parseInt(grp, 16)))
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\r/g, '');
    } catch (e) {
      return str;
    }
  };

  // 智能解析流中的字段
  const processChunk = (chunk: string) => {
    rawBuffer.current += chunk;
    const fullText = rawBuffer.current;

    // 1. 提取 Analysis 文本 (针对 {"analysis": "..."})
    const analysisMarker = '"analysis":';
    const analysisStart = fullText.indexOf(analysisMarker);
    
    if (analysisStart !== -1) {
      // 找到引号开始的位置
      const valueStart = fullText.indexOf('"', analysisStart + analysisMarker.length);
      if (valueStart !== -1) {
        // 寻找结束引号（这里由于是流式，我们取当前能拿到的最远内容，并过滤掉末尾可能的截断 JSON）
        let content = fullText.slice(valueStart + 1);
        
        // 尝试寻找该字段的结束（下一个字段起始或 JSON 结束）
        const nextMarker = '","';
        const endIdx = content.indexOf(nextMarker);
        if (endIdx !== -1) {
          content = content.slice(0, endIdx);
        } else if (content.endsWith('"}')) {
          content = content.slice(0, -2);
        }
        
        setDisplayedText(decodeAiText(content));
      }
    } else if (!fullText.startsWith('{')) {
      // 如果不是 JSON 格式，直接原样显示
      setDisplayedText(decodeAiText(fullText));
    }

    // 2. 尝试提取雷达图数据 (针对 "radar_stats":{...})
    const radarMarker = '"radar_stats":';
    const radarStart = fullText.indexOf(radarMarker);
    if (radarStart !== -1) {
      const braceStart = fullText.indexOf('{', radarStart);
      const braceEnd = fullText.indexOf('}', braceStart);
      if (braceStart !== -1 && braceEnd !== -1) {
        try {
          const statsJson = fullText.slice(braceStart, braceEnd + 1);
          const parsed = JSON.parse(statsJson);
          setRadarStats(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          // 部分解析失败不影响 UI
        }
      }
    }
  };

  const performAnalysis = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setDisplayedText("");
    rawBuffer.current = "";
    
    try {
      await fetchTaskAnalysis((chunk) => {
        processChunk(chunk);
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (todos.length > 0 && !displayedText && !loading) {
      performAnalysis();
    }
  }, []);

  // 格式化雷达图数据
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
          <p className="text-slate-500 font-medium mt-1">AI 深度剖析你的任务模式，发现效能瓶颈与进化空间。</p>
        </div>
        <button 
          onClick={performAnalysis}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:shadow-lg hover:border-indigo-200 transition-all disabled:opacity-50 group ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <RefreshCw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          {loading ? 'AI 推演中...' : '重新分析数据'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-black mb-8 w-full flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
            客观数据画像
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
          <p className="mt-6 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center px-4">基于 AI 对执行链路的量化建模</p>
        </div>

        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 flex flex-col">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
            <Sparkles size={280} />
          </div>
          
          <div className="relative z-10 space-y-8 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 bg-indigo-500/20 border border-indigo-400/30 px-5 py-2 rounded-full">
                <Sparkles size={16} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest text-indigo-100">AI 智能诊断报告</span>
              </div>
              {loading && (
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              )}
            </div>

            {error ? (
              <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl flex items-start gap-4">
                <AlertCircle className="text-rose-400 shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-black text-rose-200 mb-2">服务通信异常</h4>
                  <p className="text-rose-100/70 text-sm leading-relaxed font-medium">{error}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.03] backdrop-blur-3xl rounded-3xl p-8 border border-white/10 flex-1 overflow-y-auto custom-scrollbar">
                {displayedText ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="text-lg leading-relaxed text-slate-200 font-medium whitespace-pre-wrap">
                      {displayedText.split('\n').map((line, idx) => {
                        // 简单的加粗解析
                        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        
                        if (line.startsWith('维度简评：') || line.startsWith('建议：') || line.startsWith('总评：')) {
                          return (
                            <div key={idx} className="mb-6 first:mt-0">
                              <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-black mb-2 uppercase tracking-wider border border-indigo-500/10">
                                {line.split('：')[0]}
                              </span>
                              <p className="text-slate-100 font-bold ml-1">{line.split('：')[1]}</p>
                            </div>
                          );
                        }
                        
                        if (line.match(/^\d\)/)) {
                          return (
                            <div key={idx} className="flex gap-3 ml-4 mb-3">
                              <span className="text-indigo-400 font-black shrink-0">{line.slice(0, 2)}</span>
                              <span className="text-slate-300">{line.slice(2).trim()}</span>
                            </div>
                          );
                        }

                        return <p key={idx} className="mb-4 text-slate-300 last:mb-0" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
                      })}
                      {loading && <span className="inline-block w-1.5 h-5 bg-indigo-400 animate-pulse ml-1 translate-y-1"></span>}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
                    <BarChart3 size={48} className="opacity-10" />
                    <p className="font-bold text-slate-500 italic">等待数据注入，开始深度诊断...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalysis;
