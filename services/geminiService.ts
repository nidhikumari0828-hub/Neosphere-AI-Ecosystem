import { GoogleGenAI, Modality, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";
import { Agent, GroundingSource, ImageSize, AspectRatio, TrainingProtocol } from "../types";
import { AGENTS as CORE_AGENTS } from "../constants";

/**
 * Creates a fresh GoogleGenAI instance using the most up-to-date API key.
 * This prevents stale closures and ensures compliance with the latest SDK requirements.
 */
const getAI = () => {
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : "";
  return new GoogleGenAI({ apiKey });
};

export const generateSpeech = async (text: string, voiceName: string = 'Zephyr'): Promise<string | undefined> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) { 
    console.error("Speech generation failed:", e);
    return undefined; 
  }
};

export const generateVideo = async (prompt: string, image?: { data: string, mimeType: string }, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string | undefined> => {
  const ai = getAI();
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: image ? {
        imageBytes: image.data,
        mimeType: image.mimeType
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    if (!operation) throw new Error("Failed to initiate video generation operation.");

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : "";
      const response = await fetch(`${downloadLink}&key=${apiKey}`);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    console.error("Video generation failed:", e);
  }
  return undefined;
};

const delegateToAgentFunctionDeclaration = (agents: Agent[]): FunctionDeclaration => ({
  name: 'delegateToAgent',
  description: 'Delegates a specific task to a specialized sub-agent within the Neosphere ecosystem.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      agentId: {
        type: Type.STRING,
        description: 'The unique identifier of the agent to delegate the task to.',
        enum: agents.map(a => a.id),
      },
      taskDescription: {
        type: Type.STRING,
        description: 'A clear and concise description of the task for the sub-agent to perform, based on the user\'s original request.',
      },
    },
    required: ['agentId', 'taskDescription'],
  },
});

export const processUserRequest = async (
  agent: Agent,
  text: string,
  media?: { data: string; mimeType: string; type: 'image' | 'video' | 'audio' },
  options?: { 
    imageGen?: { size: ImageSize, ratio: AspectRatio }, 
    useThinking?: boolean, 
    useGrounding?: 'search' | 'maps',
    latLng?: { latitude: number, longitude: number },
    protocol?: TrainingProtocol,
    collaborators?: Agent[],
    voiceEnabled?: boolean,
    isLowLatency?: boolean
  },
  customAgents: Agent[] = []
): Promise<{ text: string; mediaUrl?: string; audioData?: string; groundingSources?: GroundingSource[] }> => {
  const ai = getAI();
  const allAgents = [...CORE_AGENTS, ...customAgents];
  
  const isImageGen = text.toLowerCase().match(/generate|create|draw|paint|make an image/);
  const isImageEdit = media?.type === 'image' && text.toLowerCase().match(/edit|add|filter|remove|change/);

  // High-Quality Image Generation Path
  if (isImageGen && !isImageEdit) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text }] },
        config: {
          imageConfig: {
            aspectRatio: options?.imageGen?.ratio || "1:1",
            imageSize: options?.imageGen?.size || "1K"
          }
        }
      });
      
      let imageUrl: string | undefined;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return { text: response.text || "Neural visualization synthesized.", mediaUrl: imageUrl };
    } catch (e: any) {
      console.error("Image generation failed:", e);
      if (e.message?.includes("Requested entity was not found")) throw e;
    }
  }

  // Image Editing Path
  if (isImageEdit) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: media!.data, mimeType: media!.mimeType } },
            { text }
          ]
        }
      });
      let imageUrl: string | undefined;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return { text: response.text || "Image re-synthesized as requested.", mediaUrl: imageUrl };
    } catch (e) {
      console.error("Image editing failed:", e);
    }
  }

  // Standard Generative Path with Delegation
  let model = 'gemini-3-pro-preview'; // Pro model for reliable function calling
  let tools: any[] = [];
  let toolConfig: any = undefined;
  let thinkingConfig: any = undefined;
  
  const availableDelegates = allAgents.filter(a => a.id !== agent.id);
  if (availableDelegates.length > 0) {
    tools.push({ functionDeclarations: [delegateToAgentFunctionDeclaration(availableDelegates)] });
  }

  if (options?.useThinking) {
    thinkingConfig = { thinkingBudget: 32768 };
  }
  if (options?.useGrounding === 'search') {
    tools.push({ googleSearch: {} });
  } else if (options?.useGrounding === 'maps') {
    model = 'gemini-2.5-flash';
    tools.push({ googleMaps: {} });
    if (options.latLng) toolConfig = { retrievalConfig: { latLng: options.latLng } };
  }

  let dynamicInstruction = agent.systemPrompt;
  if (options?.protocol?.isActive) {
    dynamicInstruction += `\n\n[NEURAL LINGUISTIC ADAPTATION ENABLED]\nTarget Language/Style: ${options.protocol.name}\nRules: ${options.protocol.rules}\nRespond strictly adhering to this protocol.`;
  }
  if (options?.collaborators && options.collaborators.length > 0) {
    dynamicInstruction += `\n\n[JOINT MISSION PROTOCOL ENABLED]\nCoordinate these personas: ${options.collaborators.map(a => a.name).join(', ')}. Indicate contributions with [AgentName] tags.`;
  }
  if (availableDelegates.length > 0) {
      dynamicInstruction += `\n\n[ECOSYSTEM CONTEXT]\nYou can delegate tasks to other agents if they are better suited. Use the 'delegateToAgent' function. Do not answer on behalf of other agents. Here are the available agents and their functions:\n` +
      availableDelegates
        .map(a => `- agentId: "${a.id}", name: "${a.name}", function: "${a.description}"`)
        .join('\n');
  }

  try {
    const initialResponse = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          ...(media ? [{ inlineData: { data: media.data, mimeType: media.mimeType } }] : []),
          { text: `${dynamicInstruction}\n\nUser Question: ${text}` }
        ]
      },
      config: { tools, toolConfig, thinkingConfig }
    });
    
    const functionCalls = initialResponse.functionCalls;
    if (functionCalls && functionCalls.length > 0 && functionCalls[0].name === 'delegateToAgent') {
      const { agentId, taskDescription } = functionCalls[0].args;
      const targetAgent = allAgents.find(a => a.id === agentId);

      if (targetAgent) {
        const delegatedResponse = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: { 
            parts: [{ text: `${targetAgent.systemPrompt}\n\nTask from ${agent.name}: ${taskDescription}` }] 
          },
        });
        const delegatedText = delegatedResponse.text || "Delegated task complete.";
        let audioData: string | undefined;
        if (options?.voiceEnabled) {
          audioData = await generateSpeech(delegatedText, targetAgent.voiceName);
        }
        const finalResponseText = `[Uplink rerouted to **${targetAgent.name}**]...\n\n${delegatedText}`;
        return { text: finalResponseText, audioData };
      }
    }

    const responseText = initialResponse.text || "Interface stable. Neural uplink verified.";
    let groundingSources: GroundingSource[] = [];
    const chunks = initialResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      groundingSources = chunks.map((chunk: any) => {
        if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
        if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
        return null;
      }).filter(Boolean) as GroundingSource[];
    }

    let audioData: string | undefined;
    if (options?.voiceEnabled) {
      audioData = await generateSpeech(responseText, agent.voiceName);
    }
    return { text: responseText, audioData, groundingSources };
  } catch (e: any) {
    console.error("Content generation failed:", e);
    throw e;
  }
};