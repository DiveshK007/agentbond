"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_LABEL = void 0;
exports.getProtocolStats = getProtocolStats;
exports.getAgents = getAgents;
exports.getAgent = getAgent;
exports.getJobs = getJobs;
exports.getJob = getJob;
exports.postMetadata = postMetadata;
require("dotenv/config");
const API_BASE = process.env.AGENTBOND_API_URL ?? "http://localhost:3001";
async function get(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok)
        throw new Error(`AgentBond API ${path}: ${res.status} ${res.statusText}`);
    return res.json();
}
exports.STATUS_LABEL = {
    0: "Open",
    1: "Assigned",
    2: "Submitted",
    3: "Completed",
    4: "Disputed",
    5: "Cancelled",
    6: "Timed Out",
};
function getProtocolStats() {
    return get("/api/protocol/stats");
}
function getAgents() {
    return get("/api/agents");
}
function getAgent(pubkey) {
    return get(`/api/agents/${pubkey}`);
}
function getJobs(status) {
    const q = status !== undefined ? `?status=${status}` : "";
    return get(`/api/jobs${q}`);
}
function getJob(index) {
    return get(`/api/jobs/${index}`);
}
async function postMetadata(description) {
    const res = await fetch(`${API_BASE}/api/metadata/job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
    });
    if (!res.ok)
        throw new Error(`AgentBond metadata POST: ${res.status}`);
    return res.json();
}
//# sourceMappingURL=api.js.map