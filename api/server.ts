import "dotenv/config";
import express from "express";
import cors from "cors";
import protocolRouter from "./routes/protocol";
import agentsRouter from "./routes/agents";
import jobsRouter from "./routes/jobs";
import metadataRouter from "./routes/metadata";

const app = express();
const PORT = process.env["PORT"] ? parseInt(process.env["PORT"]) : 3001;

app.use(cors());
app.use(express.json());

app.use("/api/protocol", protocolRouter);
app.use("/api/agents", agentsRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/metadata", metadataRouter);

app.listen(PORT, () => {
  console.log(`AgentBond API listening on port ${PORT}`);
});
