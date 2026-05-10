declare module "x402-express" {
  export function paymentMiddleware(
    facilitator: string,
    receiver: string,
    options: {
      amountUsd: number;
      description?: string;
      mimeType?: string;
      maxDeadlineSeconds?: number;
      resource?: string;
      outputSchema?: Record<string, string>;
    }
  ): import("express").RequestHandler;
}
