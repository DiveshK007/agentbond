import { z, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Express middleware factory: validate req.body against a Zod schema.
 * Returns 400 with structured errors on failure, calls next() on success.
 */
export function validate<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }
    // Attach parsed (coerced) data back to body
    req.body = result.data;
    next();
  };
}

// ─── Shared Schemas ─────────────────────────────────────────────────────────

export const JobDescriptionSchema = z.object({
  description: z
    .string()
    .min(1, "description is required")
    .max(10_000, "description too long (max 10,000 chars)"),
});

export const JobResultSchema = z.object({
  result: z
    .string()
    .min(1, "result is required")
    .max(50_000, "result too long (max 50,000 chars)"),
  jobIndex: z.number().int().nonnegative().optional(),
});

export const WebhookRegisterSchema = z.object({
  callbackUrl: z
    .string()
    .url("callbackUrl must be a valid URL")
    .startsWith("https://", "callbackUrl must use HTTPS"),
});

export const HeliusEventSchema = z
  .array(
    z.object({
      signature: z.string().optional(),
      type: z.string().optional(),
      description: z.string().optional(),
      timestamp: z.number().optional(),
      fee: z.number().optional(),
      slot: z.number().optional(),
      accountData: z
        .array(z.object({ account: z.string() }))
        .optional(),
    })
  )
  .min(1, "at least one event required")
  .max(100, "too many events (max 100 per batch)");
