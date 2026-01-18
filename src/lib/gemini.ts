import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface ExtractedTask {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    labels: string[];
    subtasks: { id?: string; text: string; completed: false }[];
}

const TASK_SCHEMA = `
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "low" | "medium" | "high" | "urgent",
      "labels": ["string"],
      "subtasks": [
        { "text": "string", "completed": false }
      ]
    }
  ]
}
`;

export async function extractTasksFromText(text: string, context?: string, existingTasks: string[] = []): Promise<ExtractedTask[]> {
    if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY is missing");
        return [];
    }

    const prompt = `
    You are an expert game development project manager. 
    Analyze the following text from a project document and extract clear, actionable tasks.
    
    COLUMNS AVAILABLE: "Todo", "In Progress", "Done" (default extracted tasks to "Todo").
    
    RULES:
    - Return ONLY valid JSON matching the schema: ${TASK_SCHEMA}
    - Avoid duplicating these EXISTING TASKS: ${existingTasks.join(", ") || "None"}
    - Keep titles concise but descriptive.
    - EVERY task MUST include a "subtasks" array (checklist) of at least 3-5 specific steps.
    - Write descriptions that explain the 'why' and 'what'.
    - Use 'urgent' and 'high' sparingly.
    - If context is provided, use it to better categorize labels.
    
    PROJECT CONTEXT: ${context || "A game development project."}
    
    TEXT TO ANALYZE:
    ${text}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Find JSON in response (Gemini sometimes wraps in backticks)
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const rawTasks = (parsed.tasks || []) as any[];

            return rawTasks.map(task => ({
                ...task,
                subtasks: (task.subtasks || []).map((st: any) => ({
                    ...st,
                    id: st.id || crypto.randomUUID(),
                    completed: st.completed ?? false
                }))
            })) as ExtractedTask[];
        }
        return [];
    } catch (error) {
        console.error("Gemini Extraction Error:", error);
        return [];
    }
}

export async function generateTasksFromPrompt(userPrompt: string, projectContext: string, existingTasks: string[] = []): Promise<ExtractedTask[]> {
    const prompt = `
    Based on the following request and project documents, create a set of tasks to achieve the goal.
    
    USER REQUEST: "${userPrompt}"
    
    PROJECT DOCUMENTS/CONTEXT:
    ${projectContext}

    EXISTING TASKS (DO NOT DUPLICATE THESE):
    ${existingTasks.join(", ") || "None"}
    
    RULES:
    - Return ONLY valid JSON matching the schema: ${TASK_SCHEMA}
    - EVERY task MUST include a "subtasks" array (checklist) of at least 3-5 specific implementation steps.
    - Ensure tasks are realistic for game development.
    - If a similar task exists, focus on the NEXT steps or specific implementation details.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const rawTasks = (parsed.tasks || []) as any[];

            return rawTasks.map(task => ({
                ...task,
                subtasks: (task.subtasks || []).map((st: any) => ({
                    ...st,
                    id: st.id || crypto.randomUUID(),
                    completed: st.completed ?? false
                }))
            })) as ExtractedTask[];
        }
        return [];
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        return [];
    }
}

export async function suggestSubtasks(taskTitle: string, taskDescription: string, projectContext: string): Promise<string[]> {
    const prompt = `
    You are an expert game developer. Suggest a checklist of 5-8 actionable subtasks for the following task:
    
    TASK TITLE: ${taskTitle}
    TASK DESCRIPTION: ${taskDescription}
    
    PROJECT CONTEXT: ${projectContext}
    
    Return ONLY a valid JSON array of strings. 
    Example format: ["Investigate X", "Integrate Y", "Test Z"]
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonMatch = textResponse.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error("Subtask Suggestion Error:", error);
        return [];
    }
}

export async function suggestWorldConnections(nodes: any[], projectContext: string): Promise<{ from_node_id: string; to_node_id: string; connection_type: string; notes: string }[]> {
    const prompt = `
    You are an expert world builder and level designer.
    Analyze these world locations and their lore to suggest logical connections.
    
    LOCATIONS:
    ${nodes.map(n => `ID: ${n.id}, Name: ${n.label}, Description: ${n.description}, Lore: ${n.lore}`).join("\n")}
    
    PROJECT CONTEXT:
    ${projectContext}
    
    RULES:
    - Return ONLY a JSON array of objects: [{"from_node_id": "uuid", "to_node_id": "uuid", "connection_type": "path" | "story" | "teleport", "notes": "string"}]
    - Only suggest the 3-5 most logical connections based on descriptions and lore.
    - If a connection is clear in the lore (e.g. "Gate to X"), use connection_type: "story" or "path".
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonMatch = textResponse.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error("Connection Suggestion Error:", error);
        return [];
    }
}

export async function generateSystemsFromPrompt(userPrompt: string, projectContext: string): Promise<{ name: string; description: string; inputs: string[]; outputs: string[] }[]> {
    const prompt = `
    You are a veteran game systems designer.
    Generate a set of interconnected game systems based on this request.
    
    REQUEST: "${userPrompt}"
    
    PROJECT CONTEXT:
    ${projectContext}
    
    RULES:
    - Return ONLY a JSON array: [{"name": "string", "description": "string", "inputs": ["string"], "outputs": ["string"]}]
    - Create 2-4 systems.
    - Ensure inputs and outputs overlap where logical (e.g., Output of System A is Input to System B).
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonMatch = textResponse.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error("System Generation Error:", error);
        return [];
    }
}

export async function suggestSystemIO(name: string, description: string, projectContext: string): Promise<{ inputs: string[]; outputs: string[] }> {
    const prompt = `
    You are an expert game systems designer.
    Suggest inputs and outputs for the following game system.
    
    SYSTEM NAME: ${name}
    DESCRIPTION: ${description}
    
    CONTEXT: ${projectContext}
    
    Return ONLY a JSON object: {"inputs": ["string"], "outputs": ["string"]}
    - Provide 3-5 of the most important inputs and outputs.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonMatch = textResponse.match(/\{.*\}/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return { inputs: [], outputs: [] };
    } catch (error) {
        console.error("System IO Suggestion Error:", error);
        return { inputs: [], outputs: [] };
    }
}
