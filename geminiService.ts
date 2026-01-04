
import { GoogleGenAI, Type } from "@google/genai";

export const getGoalBreakdown = async (goalTitle: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Break down the following goal into 3-5 specific, actionable subgoals:\nGoal: ${goalTitle}\nDescription: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subgoals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["title", "description"]
              }
            }
          },
          required: ["subgoals"]
        }
      }
    });

    return JSON.parse(response.text || '{"subgoals": []}');
  } catch (error) {
    console.error("Gemini breakdown failed:", error);
    return { subgoals: [] };
  }
};

export const getWeeklySummary = async (completedTodos: string[], pendingTodos: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the following tasks, provide a brief, professional weekly summary in Chinese:
      Completed: ${completedTodos.join(', ')}
      Pending: ${pendingTodos.join(', ')}`,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini summary failed:", error);
    return "无法生成 AI 复盘总结。";
  }
};

export const analyzeReviewTrends = async (reviewsJson: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `这是过去几周的复盘数据，请分析其中的成长趋势、反复出现的阻碍，并给出针对性的建议。请使用中文回答，保持客观且具有启发性：\n${reviewsJson}`,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text || "数据不足，暂无法生成趋势分析。";
  } catch (error) {
    console.error("Review trend analysis failed:", error);
    return "AI 趋势诊断不可用。";
  }
};

/**
 * 核心：任务执行模式深度诊断
 * 更新提示词以支持 Markdown
 */
export const analyzeTaskPatterns = async (todosJson: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `你是一个资深的个人效能与心理学专家。请深度分析以下 JSON 格式的待办事项数据。
      要求：
      1. 使用 Markdown 语法输出一份优美的诊断报告。
      2. 报告结构必须包含：
         # 个人效能智能诊断报告
         ## 维度评估
         分别针对 **执行力**、**规划感**、**紧迫感**、**专注度**、**预估准度** 进行 0-100 打分并配以简短深度评价。
         ## 深度总评
         挖掘用户执行模式背后的潜意识逻辑、常见阻碍及核心痛点。
         ## 改进建议
         提供 3 条具体的、极具可操作性的进化建议，采用 1. 2. 3. 列表格式。
      
      数据如下：\n${todosJson}`,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    return response.text || "未能生成分析报告。";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI 诊断报告暂时无法生成。";
  }
};
