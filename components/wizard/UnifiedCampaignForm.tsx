"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CreateCampaignInputSchema, CategoryEnum, StylePresetEnum } from "@/lib/contracts"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// --- Custom Schema for Wizard (Relaxed) ---
// We make Enums optional initially so the form doesn't crash on "undefined"
const WizardSchema = CreateCampaignInputSchema.extend({
    brandName: z.string().optional(),
    goal: z.string().optional(),
    brandCategory: CategoryEnum.optional(),
    platforms: z.array(z.string()).optional(),
})

type WizardFormValues = z.infer<typeof WizardSchema>

// --- Icons / Visuals Mapping ---
const StyleVisuals: Record<string, string> = {
    UGC: "📱 Raw & Real",
    CLEAN_STUDIO: "✨ Polished",
    WARM_LIFESTYLE: "🌅 Cozy",
    EDITORIAL: "📰 Chic",
    MINIMAL: "⚪️ Simple",
    DOCUMENTARY: "📹 Story",
}

export function UnifiedCampaignForm() {
    const [step, setStep] = React.useState(0)
    const [isGenerating, setIsGenerating] = React.useState(false)

    const form = useForm<WizardFormValues>({
        resolver: zodResolver(WizardSchema),
        defaultValues: {
            brandName: "",
            goal: "",
            brandCategory: undefined, // Safe now due to .optional()
            platforms: ["INSTAGRAM"],
            generationParams: {
                budget: 500, // 500 Cents = $5.00
            }
        },
        mode: "onChange"
    })

    // Watch values for progressive disclosure
    const brandName = form.watch("brandName")
    const goal = form.watch("goal")
    const category = form.watch("brandCategory")

    // Calculate validity to enable "Next"
    const canAdvance = () => {
        if (step === 0) return !!brandName && brandName.length > 0;
        if (step === 1) return !!goal && goal.length > 0;
        if (step === 2) return !!category;
        if (step === 3) return !!form.watch("generationParams.style"); // Require style now
        return true
    }

    const nextStep = () => setStep(s => s + 1)

    const onSubmit = async (data: WizardFormValues) => {
        // Final Client Validation before API Call
        const finalValidation = CreateCampaignInputSchema.safeParse(data);
        if (!finalValidation.success) {
            alert("Please fill in all fields.");
            return;
        }

        setIsGenerating(true)
        console.log("Submitting:", data)

        // Simulate API Call
        try {
            const res = await fetch('/api/campaigns', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            const json = await res.json();
            console.log("Response:", json)

            if (json.error) {
                alert(`Error: ${JSON.stringify(json.error)}`)
            } else {
                alert("Campaign Created! Check Console for JSON.")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsGenerating(false)
        }
    }

    // --- Step Components ---

    const renderStep = () => {
        switch (step) {
            case 0: // Brand Name
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <h2 className="text-4xl font-light tracking-tight">First, what's your brand called?</h2>
                        <Input
                            placeholder="e.g. Acme Co."
                            {...form.register("brandName")}
                            autoFocus
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && canAdvance()) nextStep() }}
                        />
                    </motion.div>
                )
            case 1: // Goal
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <h2 className="text-4xl font-light tracking-tight">What do you want to accomplish?</h2>
                        <p className="text-xl text-muted-foreground">e.g. grow users, create brand awareness, launch a product</p>
                        <Input
                            placeholder="I want to..."
                            {...form.register("goal")}
                            autoFocus
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && canAdvance()) nextStep() }}
                        />
                    </motion.div>
                )
            case 2: // Category (Select)
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <h2 className="text-4xl font-light tracking-tight">Which category fits best?</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {CategoryEnum.options.map((cat: string) => (
                                <div
                                    key={cat}
                                    onClick={() => { form.setValue("brandCategory", cat as any); nextStep() }}
                                    className={cn(
                                        "p-6 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]",
                                        form.watch("brandCategory") === cat ? "border-primary bg-secondary" : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <span className="font-medium">{cat.replace(/_/g, " ")}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )
            case 3: // Config (Style ONLY)
                const currentStyle = form.watch("generationParams.style")
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-4xl font-light mb-8">Choose a Vibe</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {StylePresetEnum.options.map((s: string) => (
                                    <div
                                        key={s}
                                        onClick={() => { form.setValue("generationParams.style", s as any); nextStep() }} // Auto advance on selection
                                        className={cn(
                                            "p-6 rounded-xl border cursor-pointer text-center text-sm transition-all hover:scale-[1.02]",
                                            currentStyle === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"
                                        )}
                                    >
                                        <span className="text-2xl mr-2 block mb-2">{StyleVisuals[s]?.split(" ")[0]}</span>
                                        {StyleVisuals[s]?.split(" ").slice(1).join(" ") || s}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Added "Skip" or manual Next if they want to keep default style? But for now forcing selection is cleaner UI-wise or we keep the Next button. 
                We added auto-advance above, but let's keep the Next button logic outside safe. */}
                    </motion.div>
                )

            case 4: // Reference Image + Generate (No Budget)
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-3xl font-light mb-4">Got any inspiration? <span className="text-lg text-muted-foreground">(Optional)</span></h2>
                            <p className="text-muted-foreground mb-4">Upload a reference image and we'll match its style.</p>
                            <Input
                                type="file"
                                accept="image/*"
                                className="cursor-pointer file:cursor-pointer p-4 h-auto border-dashed border-2"
                                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const formData = new FormData();
                                        formData.append("file", file);
                                        try {
                                            const res = await fetch("/api/assets/upload", {
                                                method: "POST",
                                                body: formData,
                                            });
                                            const json = await res.json();
                                            if (json.id) {
                                                form.setValue("generationParams.referenceAssetIds", [json.id]);
                                                alert("Image uploaded successfully!");
                                            }
                                        } catch (err) {
                                            console.error("Upload failed", err);
                                            alert("Upload failed. Check console.");
                                        }
                                    }
                                }}
                            />
                        </div>

                        <div className="pt-8">
                            <Button
                                size="lg"
                                className="w-full text-lg h-16 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-xl"
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isGenerating}
                            >
                                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
                                Generate Campaign
                            </Button>
                        </div>
                    </motion.div>
                )
            default:
                return null
        }
    }

    return (
        <div className="max-w-xl mx-auto min-h-[400px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
                {renderStep()}
            </AnimatePresence>

            {/* Navigation for manual advance if needed (except last step) */}
            {step < 4 && (
                <div className="mt-12 flex justify-end min-h-[40px]">
                    <Button
                        variant="ghost"
                        onClick={nextStep}
                        disabled={!canAdvance()}
                        className={cn("transition-opacity", canAdvance() ? "opacity-100" : "opacity-0")}
                    >
                        Next <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Step Indicator (5 Steps: 0,1,2,3,4) */}
            <div className="fixed bottom-10 left-0 right-0 flex justify-center gap-2">
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className={cn("h-1 rounded-full transition-all duration-300",
                        step >= i ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30")}
                    />
                ))}
            </div>
        </div>
    )
}
