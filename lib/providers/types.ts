import { StylePreset } from "../contracts";

// --- Image Generation ---

export interface GenerateImageInput {
    prompt: string;
    style: StylePreset;
    referenceAssetUrls?: string[];
    aspectRatio?: "1:1" | "9:16" | "16:9"; // Optional constraint
}

export interface GenerateImageOutput {
    imageUrl: string;
}

export interface ImageProvider {
    generateImage(input: GenerateImageInput): Promise<GenerateImageOutput>;
}

// --- Text Generation ---

export interface GenerateTextInput {
    systemPrompt: string; // E.g. "You are an expert copywriter..."
    userPrompt: string;   // Specific request
    context?: string;     // Brand voice, campaign goal, etc.
}

export interface GenerateTextOutput {
    text: string;
}

export interface TextProvider {
    generateText(input: GenerateTextInput): Promise<GenerateTextOutput>;
}
