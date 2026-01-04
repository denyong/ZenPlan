
import { GoogleGenAI, Type } from "@google/genai";

export const getGoalBreakdown = async (goalTitle: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `将以下目标拆解为 3-5 个具体的、可执行的子目标：\n目标：${goalTitle}\n描述：${description}`,
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
 * 核心：任务执行模式深度诊断 (重构版 - 纯文本约束)
 */
export const analyzeTaskPatterns = async (todosJson: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `你是一名资深的个人效能专家与认知行为分析师。请深度审计以下JSON格式的用户任务数据。

要求（必须严格遵守，否则视为失败）：
1. 严禁使用任何Markdown语法（如 #, **, -, > 等）或特殊装饰符号。
2. 输出必须是完全的纯文本平铺。
3. 必须严格遵守以下结构：
维度简评：执行力=[分数，一句话深度评价]；规划感=[分数，一句话深度评价]；紧迫感=[分数，一句话深度评价]；专注度=[分数，一句话深度评价]；预估准度=[分数，一句话深度评价]。
总评：[此处进行150字左右的行为模式分析，揭示用户完成任务背后的心理动机、执行漏洞或潜意识阻碍]。
建议：1) [针对性的底层逻辑建议与具体行动指令] 2) [建议二] 3) [建议三]。

待审计数据内容：
${todosJson}`,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    return response.text || "诊断失败：未能生成文本报告。";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI 诊断接口异常。";
  }
};

export const getWeeklySummary = async (completedTodos: string[], pendingTodos: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `根据以下任务，提供一份简短专业的周复盘总结（中文）：
      已完成：${completedTodos.join(', ')}
      待处理：${pendingTodos.join(', ')}`,
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
      contents: `分析以下复盘数据，输出趋势分析报告：\n${reviewsJson}`,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text || "数据不足。";
  } catch (error) {
    console.error("Review trend analysis failed:", error);
    return "AI 趋势诊断不可用。";
  }
};
