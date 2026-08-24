import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { askTutorAI } from "./tutor.server";

export const askTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
          .min(1)
          .max(20),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: settings } = await context.supabase
      .from("app_settings")
      .select("value")
      .eq("key", "subscriptions_enabled")
      .maybeSingle();
    const gated = (settings?.value as string | undefined) === "on";

    if (gated) {
      const { data: ent } = await context.supabase.rpc("my_entitlement");
      const tier = (ent as { tier: string }[] | null)?.[0]?.tier;
      if (tier !== "max") throw new Error("The AI tutor is part of the Max Pro plan.");
    }

    const reply = await askTutorAI(data.messages);
    return { reply };
  });
