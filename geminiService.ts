
import { GoogleGenAI, Type } from "@google/genai";

// Removed module-level initialization to ensure fresh API key usage within functions.

export const getGoalBreakdown = async (goalTitle: string, description: string) => {
  // Always create a new instance before API calls to handle potential key updates.
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

/**
 * 跨周进化趋势分析
 */
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

export const analyzeTaskPatterns = async (todosJson: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze these tasks for patterns in priority management and execution efficiency. Provide a diagnostic report in Chinese:\n${todosJson}`,
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
