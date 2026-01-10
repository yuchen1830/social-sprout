import {
    ImageProvider,
    TextProvider,
    GenerateImageInput,
    GenerateImageOutput,
    GenerateTextInput,
    GenerateTextOutput,
} from "./types";

export class StubImageProvider implements ImageProvider {
    async generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
        // Simulate latency
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Return deterministic placeholder based on style
        const styleParam = input.style.toLowerCase().replace("_", "-");
        const hasAssets = input.referenceAssetUrls && input.referenceAssetUrls.length > 0;
        return {
            imageUrl: `https://stub-provider.com/generated/${styleParam}${hasAssets ? '-with-ref' : ''}-option.jpg`,
        };
    }
}

export class StubTextProvider implements TextProvider {
    async generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {
        // Simulate latency
        await new Promise((resolve) => setTimeout(resolve, 300));

        return {
            text: "This is a deterministic stub caption for testing. It simulates a successful generation from an AI provider. #SocialSprout #MVP",
        };
    }
}
