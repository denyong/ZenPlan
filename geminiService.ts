import { GoogleGenAI, Type } from "@google/genai";

// Initializing the Gemini AI client using the mandatory environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Breaks down a high-level goal into actionable subgoals using Gemini 3 Pro.
 */
export const getGoalBreakdown = async (goalTitle: string, description: string) => {
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

/**
 * Generates an encouraging weekly summary using Gemini 3 Flash.
 */
export const getWeeklySummary = async (completedTodos: string[], pendingTodos: string[]) => {
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
 * Analyzes task behavior patterns and efficiency using Gemini 3 Pro reasoning.
 */
export const analyzeTaskPatterns = async (todosJson: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze these tasks for patterns in priority management and execution efficiency. Provide a diagnostic report in Chinese:\n${todosJson}`,
      config: {
        // Higher thinking budget for deeper reasoning on task patterns
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    return response.text || "未能生成分析报告。";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI 诊断报告暂时无法生成。";
  }
};
