"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubTextProvider = exports.StubImageProvider = void 0;
// --- Stub Implementation ---
class StubImageProvider {
    async generateImage(input) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Simple deterministic stub
        const styleId = input.style || "default";
        return {
            imageUrl: `https://placehold.co/1024x1024?text=${encodeURIComponent(input.prompt)}&style=${styleId}`,
        };
    }
}
exports.StubImageProvider = StubImageProvider;
class StubTextProvider {
    async generateText(input) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
            text: `[STUB] Caption for ${input.userPrompt}. #MVP #Hackathon`,
        };
    }
}
exports.StubTextProvider = StubTextProvider;
