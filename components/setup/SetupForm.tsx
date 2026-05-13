"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2, SlidersHorizontal, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const setupSchema = z.object({
  presetMode: z.enum(["FULL", "PARTIAL", "CUSTOM"]),
  presetQuantity: z.coerce.number().min(0, "Must be positive"),
  presetAmount: z.coerce.number().min(0, "Must be positive"),
  deliveredQuantity: z.coerce.number().min(0, "Must be positive"),
  deliveredAmount: z.coerce.number().min(0, "Must be positive"),
  unitRate: z.coerce.number().min(0.01, "Must be greater than 0"),
  forcedFilling: z.boolean(),
  forcedFillingCode: z.string().optional(),
});

type SetupFormValues = z.infer<typeof setupSchema>;

export function SetupForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      presetMode: "FULL",
      presetQuantity: 150,
      presetAmount: 12000,
      deliveredQuantity: 148,
      deliveredAmount: 11840,
      unitRate: 80,
      forcedFilling: false,
    },
  });

  const isForcedFilling = watch("forcedFilling");

  const onSubmit = async (values: SetupFormValues) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Saving setup config:", values);
        toast.success("Configuration deployed successfully");
        resolve();
      }, 1200);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Main Parameters Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Core Parameters</h3>
            <p className="text-sm text-muted-foreground mt-1">Configure default operational settings deployed to all batch controllers.</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            
            <div className="space-y-2">
              <Label htmlFor="presetMode" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Preset Mode</Label>
              <div className="relative">
                <select
                  id="presetMode"
                  {...register("presetMode")}
                  className="flex h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="FULL">FULL CAPACITY</option>
                  <option value="PARTIAL">PARTIAL FILL</option>
                  <option value="CUSTOM">CUSTOM PROFILE</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              {errors.presetMode && <p className="text-[11px] font-medium text-destructive">{errors.presetMode.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitRate" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Unit Rate (INR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                <Input id="unitRate" type="number" step="0.01" className="pl-7" {...register("unitRate")} />
              </div>
              {errors.unitRate && <p className="text-[11px] font-medium text-destructive">{errors.unitRate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="presetQuantity" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Target Quantity (L)</Label>
              <Input id="presetQuantity" type="number" {...register("presetQuantity")} />
              {errors.presetQuantity && <p className="text-[11px] font-medium text-destructive">{errors.presetQuantity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="presetAmount" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Target Amount (INR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                <Input id="presetAmount" type="number" className="pl-7" {...register("presetAmount")} />
              </div>
              {errors.presetAmount && <p className="text-[11px] font-medium text-destructive">{errors.presetAmount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveredQuantity" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Default Delivered (L)</Label>
              <Input id="deliveredQuantity" type="number" {...register("deliveredQuantity")} />
              {errors.deliveredQuantity && <p className="text-[11px] font-medium text-destructive">{errors.deliveredQuantity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveredAmount" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Default Amount (INR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                <Input id="deliveredAmount" type="number" className="pl-7" {...register("deliveredAmount")} />
              </div>
              {errors.deliveredAmount && <p className="text-[11px] font-medium text-destructive">{errors.deliveredAmount.message}</p>}
            </div>
            
          </div>
        </div>
      </div>

      {/* Safety Overrides Card */}
      <div className={`rounded-xl border shadow-sm overflow-hidden transition-colors duration-300 ${isForcedFilling ? 'border-amber-500/50 bg-amber-500/5' : 'border-border bg-card'}`}>
        <div className="px-6 py-5 border-b border-border/50 flex items-start gap-4">
          <div className={`p-2.5 rounded-lg shrink-0 mt-0.5 transition-colors ${isForcedFilling ? 'bg-amber-500/20 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
            {isForcedFilling ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Safety Overrides</h3>
            <p className="text-sm text-muted-foreground mt-1">Manual intervention controls. Use with caution.</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start space-x-3 mb-6">
            <div className="flex items-center h-5">
              <input 
                type="checkbox" 
                id="forcedFilling" 
                {...register("forcedFilling")}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary focus:ring-offset-background"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="forcedFilling" className="text-sm font-medium cursor-pointer text-foreground">
                Enable Forced Filling Mode
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Bypasses standard volumetric safety checks. Requires authorization code.
              </p>
            </div>
          </div>

          <div className={`space-y-2 max-w-sm transition-all duration-300 ${isForcedFilling ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-1'}`}>
            <Label htmlFor="forcedFillingCode" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Authorization Code</Label>
            <Input 
              id="forcedFillingCode" 
              type="text" 
              placeholder="e.g. AUTH-OVR-992" 
              {...register("forcedFillingCode")} 
              className={isForcedFilling ? "border-amber-500/50 focus-visible:ring-amber-500" : ""}
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <Button type="button" variant="ghost" className="text-muted-foreground hover:text-foreground">
          Discard Changes
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px] shadow-md shadow-primary/20">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Deploy Config
            </>
          )}
        </Button>
      </div>

    </form>
  );
}
