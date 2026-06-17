import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { validateEnv } from "./env";
import protocolRouter from "./routes/protocol";
import agentsRouter from "./routes/agents";
import jobsRouter from "./routes/jobs";
import metadataRouter from "./routes/metadata";
import swigRouter from "./routes/swig";
import servicesRouter from "./routes/services";
import webhooksRouter from "./routes/webhooks";
import badgesRouter from "./routes/badges";
import feedRouter from "./routes/feed";
import healthRouter from "./routes/health";
import leaderboardRouter from "./routes/leaderboard";

validateEnv();

const app = express();
const PORT = process.env["PORT"] ? parseInt(process.env["PORT"]) : 3001;

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,       // Allow frontend to embed API responses
  crossOriginResourcePolicy: false,   // Allow cross-origin resource loading
}));

// ── Rate limiting ────────────────────────────────────────────────────────────
// Global: 100 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});
app.use(globalLimiter);

// Stricter limit for write endpoints (POST/PUT/DELETE): 20 per minute
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Write rate limit exceeded, please try again later" },
});

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env["ALLOWED_ORIGINS"]
  ? process.env["ALLOWED_ORIGINS"].split(",").map((s) => s.trim())
  : null;

app.use(
  cors({
    origin: allowedOrigins
      ? (origin, cb) => {
          if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
          cb(new Error(`CORS: origin ${origin} not allowed`));
        }
      : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));

// ── Request logging (lightweight) ────────────────────────────────────────────
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/health", healthRouter);
app.use("/api/protocol", protocolRouter);
app.use("/api/agents", agentsRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/metadata", metadataRouter);
app.use("/api/swig", swigRouter);
app.use("/api/services", servicesRouter);
app.use("/api/webhooks", writeLimiter, webhooksRouter);  // stricter limit on webhooks
app.use("/api/badges", badgesRouter);
app.use("/api/feed", feedRouter);
app.use("/api/leaderboard", leaderboardRouter);

// ── Catch-all JSON error handler ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[API error]", err);
  res.status(err?.status ?? 500).json({ error: err?.message ?? "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`AgentBond API listening on port ${PORT}`);
});
