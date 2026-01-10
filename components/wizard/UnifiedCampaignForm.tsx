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
            case 3: // Config (Style + Budget)
                const currentStyle = form.watch("generationParams.style")
                // Default to 500 if undefined (though defaultValues should handle it)
                const currentBudgetCents = form.watch("generationParams.budget") || 500

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-3xl font-light mb-4">Choose a Vibe</h2>
                            <div className="grid grid-cols-3 gap-3">
                                {StylePresetEnum.options.map((s: string) => (
                                    <div
                                        key={s}
                                        onClick={() => form.setValue("generationParams.style", s as any)}
                                        className={cn(
                                            "p-4 rounded-lg border cursor-pointer text-center text-sm transition-all",
                                            currentStyle === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"
                                        )}
                                    >
                                        {StyleVisuals[s] || s}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-light mb-4">Set Budget Limit: ${(currentBudgetCents / 100).toFixed(2)}</h2>
                            <input
                                type="range"
                                min="50"       // 50 cents
                                max="5000"     // $50.00
                                step="50"      // 50 cent increments
                                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                value={currentBudgetCents}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue("generationParams.budget", parseInt(e.target.value))}
                            />
                            <p className="text-sm text-muted-foreground mt-2">Maximum we'll recreate contents for.</p>
                        </div>

                        <div className="pt-4">
                            <Button
                                size="lg"
                                className="w-full text-lg h-14"
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
            {step < 3 && (
                <div className="mt-8 flex justify-end">
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

            {/* Step Indicator */}
            <div className="fixed bottom-10 left-0 right-0 flex justify-center gap-2">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={cn("h-1 rounded-full transition-all duration-300",
                        step >= i ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30")}
                    />
                ))}
            </div>
        </div>
    )
}
