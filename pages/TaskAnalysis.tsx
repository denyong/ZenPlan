
import React, { useState, useEffect, useRef } from 'react';
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
  const { todos, fetchTaskAnalysis } = useStore();
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

  // 深度解码与清理
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

  // 核心解析逻辑：从流中提取 analysis 内容
  const processChunk = (chunk: string) => {
    rawBuffer.current += chunk;
    const fullText = rawBuffer.current;

    // 1. 动态提取 Analysis 核心内容
    // 匹配 "analysis":" 之后到结束的内容
    const analysisMatch = fullText.match(/"analysis"\s*:\s*"/);
    if (analysisMatch && analysisMatch.index !== undefined) {
      const startPos = analysisMatch.index + analysisMatch[0].length;
      let content = fullText.slice(startPos);
      
      // 寻找字段结束标记：可以是 "," 或 "} 或 字符串末尾的引号
      // 我们寻找最后出现的引号，如果它后面跟着 , 或 }
      const terminatorMatch = content.match(/"\s*[,}]/);
      if (terminatorMatch && terminatorMatch.index !== undefined) {
        content = content.slice(0, terminatorMatch.index);
      } else if (content.endsWith('"')) {
        // 如果流正好以引号结束，可能也是结束
        content = content.slice(0, -1);
      }
      
      setDisplayedText(decodeAiText(content));
    } else if (!fullText.startsWith('{')) {
      // 兼容非 JSON 格式的纯文本流
      setDisplayedText(decodeAiText(fullText));
    }

    // 2. 动态同步雷达图数据
    const radarMatch = fullText.match(/"radar_stats"\s*:\s*({[^}]+})/);
    if (radarMatch) {
      try {
        const stats = JSON.parse(radarMatch[1]);
        setRadarStats(prev => ({ ...prev, ...stats }));
      } catch (e) {
        // 忽略解析中的片段错误
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

  // 渲染格式化的行内容
  const renderFormattedLines = (text: string) => {
    // 首先按显式换行符切分
    const rawLines = text.split('\n');
    const finalElements: React.ReactNode[] = [];

    rawLines.forEach((line, lineIdx) => {
      if (!line.trim()) return;

      // 针对“总评：”可能出现在行中的情况进行二次拆分
      const sections = line.split(/(维度简评：|建议：|总评：)/);
      let currentHeader = "";

      sections.forEach((segment, segIdx) => {
        const trimmed = segment.trim();
        if (!trimmed) return;

        if (trimmed === '维度简评：' || trimmed === '建议：' || trimmed === '总评：') {
          currentHeader = trimmed.replace('：', '');
        } else {
          if (currentHeader) {
            finalElements.push(
              <div key={`${lineIdx}-${segIdx}`} className="mb-6 animate-in slide-in-from-left-4 duration-500">
                <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-black mb-3 uppercase tracking-wider border border-indigo-500/10">
                  {currentHeader}
                </span>
                <p className="text-slate-100 font-bold text-lg leading-relaxed ml-1">{trimmed}</p>
              </div>
            );
            currentHeader = ""; // 重置
          } else if (trimmed.match(/^\d\)/)) {
            // 处理数字列表建议
            finalElements.push(
              <div key={`${lineIdx}-${segIdx}`} className="flex gap-4 ml-4 mb-4 group">
                <span className="text-indigo-400 font-black shrink-0 group-hover:scale-110 transition-transform">{trimmed.slice(0, 2)}</span>
                <span className="text-slate-300 font-medium">{trimmed.slice(2).trim()}</span>
              </div>
            );
          } else {
            // 普通段落
            finalElements.push(
              <p key={`${lineIdx}-${segIdx}`} className="mb-4 text-slate-300 leading-relaxed font-medium">
                {trimmed}
              </p>
            );
          }
        }
      });
    });

    return finalElements;
  };

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
          className={`flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black transition-all disabled:opacity-50 group shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {loading ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
          {loading ? '核心演化推演中...' : '开始 AI 诊断分析'}
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
          <p className="mt-6 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center px-4">基于执行链路数据自动生成的量化模型</p>
        </div>

        <div className="lg:col-span-2 bg-[#0f172a] rounded-[2.5rem] p-1 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
          <div className="bg-white/5 backdrop-blur-3xl p-10 flex-1 flex flex-col relative">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
              <Quote size={240} className="text-white" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 bg-indigo-500/20 border border-indigo-400/30 px-5 py-2 rounded-full">
                  <Sparkles size={16} className="text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-100">AI 智能诊断报告</span>
                </div>
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
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
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                  {displayedText ? (
                    <div className="prose prose-invert max-w-none">
                      {renderFormattedLines(displayedText)}
                      {loading && (
                        <div className="inline-block w-2 h-6 bg-indigo-500 animate-pulse ml-2 translate-y-1"></div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-slate-500 space-y-6">
                      <div className="w-24 h-24 bg-indigo-500/5 rounded-[2rem] flex items-center justify-center text-indigo-400 border border-indigo-500/10 animate-pulse">
                        <BarChart3 size={48} />
                      </div>
                      <div className="text-center">
                        <p className="font-black text-slate-200 text-xl mb-2 tracking-tight">准备好进行深度诊断了吗？</p>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                          点击上方按钮，系统将扫描您的所有战略目标与待办事项，构建完整的效能画像。
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
