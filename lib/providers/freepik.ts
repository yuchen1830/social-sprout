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
            const data = JSON.parse(errorText);

            // Expected response format: { data: [ { url: "...", base64: "..." } ] }
            // or { images: [ { url: "..." } ] } - Checking standard Freepik structure
            // Usually: { data: [ { base64: "..." } ] } for some endpoints, or URLs.
            // Mystic usually returns base64 by default or requires a parameter.
            // Let's assume standard JSON response. If it returns base64, we handle it.

            // Adjust based on actual API response structure (usually data[0].base64 or url)
            const imageBase64 = data.data?.[0]?.base64;
            const imageUrl = data.data?.[0]?.url;

            let finalUrl = imageUrl;
            if (!finalUrl && imageBase64) {
                finalUrl = `data:image/png;base64,${imageBase64}`;
            }

            if (!finalUrl) {
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
}
