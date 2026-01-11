// @ts-ignore
import { ImageProvider, GenerateImageInput, GenerateImageResult } from './types';

export class FreepikImageProvider implements ImageProvider {
    private apiKey: string;
    private baseUrl: string = 'https://api.freepik.com/v1/ai';

    constructor() {
        this.apiKey = process.env.FREEPIK_API_KEY || '';
        console.log("FreepikProvider initialized. API Key present:", !!this.apiKey, "Length:", this.apiKey.length);
        if (!this.apiKey) {
            console.warn("FreepikImageProvider: No FREEPIK_API_KEY found in environment variables.");
        }
    }

    async generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
        if (!this.apiKey) {
            throw new Error("Missing Freepik API Key");
        }

        // Mapping style preset to Freepik styling prompts or parameters is possible here
        // For now, we append the style to the prompt
        const prompt = `${input.prompt} ${input.style ? `, style: ${input.style}` : ''}`;

        // Using 'flux-realism' model for high quality
        // Endpoint: POST /v1/ai/text-to-image/flux-realism (or similar, verifying via standard paths)
        // Fallback to generic text-to-image if specific model endpoint varies
        // Based on research: https://api.freepik.com/v1/ai/text-to-image/flux-realism  is a likely candidate, 
        // but 'mystic' is their flagship. Let's use 'mystic' for best results if available, otherwise 'flux-realism'.
        // Docs say: https://api.freepik.com/v1/ai/text-to-image/mystic

        // Correct Mystic endpoint: v1/ai/mystic
        const endpoint = `${this.baseUrl}/mystic`;

        console.log(`[Freepik] Calling endpoint: ${endpoint}`);
        console.log(`[Freepik] Headers:`, { 'Content-Type': 'application/json', 'x-freepik-api-key': '***', 'Accept': 'application/json' });

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-freepik-api-key': this.apiKey,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    num_images: 1,
                    // aspect_ratio: "square", // Optional: "square", "portrait", "landscape"
                    // safety_filter: true
                })
            });

            console.log(`[Freepik] Response Status: ${response.status}`);
            const errorText = await response.text();
            console.log(`[Freepik] Raw Response: ${errorText.substring(0, 500)}...`);

            if (!response.ok) {
                throw new Error(`Freepik API Error ${response.status}: ${errorText}`);
            }

            // Reparse since we consumed the stream
            let data = JSON.parse(errorText);

            // Handle Async Response (IN_PROGRESS / CREATED)
            // If we have a task_id and it's not finished, we poll.
            if (data.data && data.data.task_id && data.data.status !== 'COMPLETED') {
                console.log(`[Freepik] Async Task Found: ${data.data.task_id} (Status: ${data.data.status}). Polling...`);
                data = await this.waitForCompletion(data.data.task_id);
            }

            // Expected response format: { data: [ { url: "...", base64: "..." } ] }
            // or { images: [ { url: "..." } ] } 

            // Adjusted based on actual API response structure
            // Mystic 'generated' is array of strings (URLs)
            const generatedItem = data.data?.generated?.[0]; // Could be string "url"
            const dataItem = data.data?.[0]; // Generic fallback object

            let finalUrl = undefined;
            let imageBase64 = undefined;

            if (typeof generatedItem === 'string') {
                finalUrl = generatedItem;
            } else {
                finalUrl = generatedItem?.url || dataItem?.url;
                imageBase64 = generatedItem?.base64 || dataItem?.base64;
            }

            if (!finalUrl && imageBase64) {
                finalUrl = `data:image/png;base64,${imageBase64}`;
            }

            if (!finalUrl) {
                console.error("[Freepik] Unexpected Response Structure:", JSON.stringify(data, null, 2));
                throw new Error("No image URL or Base64 found in Freepik response");
            }

            return {
                imageUrl: finalUrl
            };

        } catch (error) {
            console.error("Freepik Generation Failed:", error);
            throw error;
        }
    }

    private async waitForCompletion(taskId: string): Promise<any> {
        const pollEndpoint = `${this.baseUrl}/mystic/${taskId}`;
        const maxRetries = 60; // 120 seconds max (2s interval)

        for (let i = 0; i < maxRetries; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

            console.log(`[Freepik] Polling attempt ${i + 1}/${maxRetries}...`);
            const response = await fetch(pollEndpoint, {
                headers: {
                    'x-freepik-api-key': this.apiKey,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const txt = await response.text();
                console.warn(`[Freepik] Poll failed: ${response.status} ${txt}`);
                continue;
            }

            const data = await response.json();
            const status = data.data?.status;
            console.log(`[Freepik] Poll Status: ${status}`);

            if (status === 'COMPLETED') {
                console.log("[Freepik] Generation Completed!");
                return data;
            } else if (status === 'FAILED') {
                throw new Error(`Freepik Task Failed: ${JSON.stringify(data)}`);
            }

            // If IN_PROGRESS, loop continues
        }

        throw new Error("Freepik Task Timed Out");
    }
}
