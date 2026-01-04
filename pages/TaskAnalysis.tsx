
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store.ts';
import { Priority } from '../types.ts';
import { 
  BrainCircuit, 
  Sparkles, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer
} from 'recharts';

const TaskAnalysis: React.FC = () => {
  const { todos, fetchTaskAnalysis } = useStore();
  const [displayedText, setDisplayedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 用于累积原始流数据，判断是否为 JSON
  const rawBuffer = useRef("");

  // Unicode 解码工具：将 \u4efb 转换为 任务
  const unescapeUnicode = (str: string) => {
    return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, grp) => {
      return String.fromCharCode(parseInt(grp, 16));
    });
  };

  // 智能内容提取：如果后端返回的是 {"analysis": "内容..."}，尝试只提取内容
  const processChunk = (chunk: string) => {
    rawBuffer.current += chunk;
    const currentFull = rawBuffer.current.trim();

    // 如果检测到是 JSON 格式的流（以 { 开头）
    if (currentFull.startsWith('{')) {
      try {
        // 尝试寻找分析内容的起始位置 (针对 "analysis":" 或 "report":" )
        const markers = ['"analysis":"', '"report":"', '"data":"'];
        let contentStartIndex = -1;
        
        for (const marker of markers) {
          const idx = currentFull.indexOf(marker);
          if (idx !== -1) {
            contentStartIndex = idx + marker.length;
            break;
          }
        }

        if (contentStartIndex !== -1) {
          // 提取从标记之后到结尾的部分
          let content = currentFull.slice(contentStartIndex);
          // 移除末尾可能的 JSON 闭合符号 ( "} )
          content = content.replace(/["}]$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
          setDisplayedText(unescapeUnicode(content));
        } else {
          // 还没读到内容标记，先不显示
        }
      } catch (e) {
        // 如果解析出错，回退到普通展示并解码
        setDisplayedText(unescapeUnicode(currentFull));
      }
    } else {
      // 纯文本流，直接解码显示
      setDisplayedText(unescapeUnicode(currentFull));
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

  const radarData = [
    { subject: '执行力', A: (todos.filter(t => t.is_completed).length / (todos.length || 1)) * 100, fullMark: 100 },
    { subject: '规划感', A: (todos.filter(t => t.goal_id).length / (todos.length || 1)) * 100, fullMark: 100 },
    { subject: '紧迫感', A: (todos.filter(t => t.priority === Priority.HIGH).length / (todos.length || 1)) * 100, fullMark: 100 },
    { subject: '专注度', A: 85, fullMark: 100 },
    { subject: '预估准度', A: 70, fullMark: 100 },
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
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                <Radar
                  name="User"
                  dataKey="A"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fill="#6366f1"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-6 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">基于近 30 天任务执行链路建模</p>
        </div>

        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
            <BrainCircuit size={280} />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 bg-indigo-500/20 border border-indigo-400/30 px-5 py-2 rounded-full">
                <Sparkles size={16} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest text-indigo-100">AI 智能诊断报告</span>
              </div>
              {loading && <div className="flex gap-1.5"><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div></div>}
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
              <div className="bg-white/[0.03] backdrop-blur-3xl rounded-3xl p-8 border border-white/10 min-h-[300px]">
                {displayedText ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="text-lg leading-relaxed text-slate-200 font-medium whitespace-pre-wrap">
                      {displayedText}
                      {loading && <span className="inline-block w-1.5 h-5 bg-indigo-400 animate-pulse ml-1 translate-y-1"></span>}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
                    <RefreshCw size={48} className="opacity-10" />
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
