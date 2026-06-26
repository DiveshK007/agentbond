"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobMode = exports.JobStatus = exports.AgentStatus = void 0;
var AgentStatus;
(function (AgentStatus) {
    AgentStatus[AgentStatus["Active"] = 0] = "Active";
    AgentStatus[AgentStatus["Suspended"] = 1] = "Suspended";
    AgentStatus[AgentStatus["Deregistered"] = 2] = "Deregistered";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus[JobStatus["Open"] = 0] = "Open";
    JobStatus[JobStatus["Assigned"] = 1] = "Assigned";
    JobStatus[JobStatus["Submitted"] = 2] = "Submitted";
    JobStatus[JobStatus["Completed"] = 3] = "Completed";
    JobStatus[JobStatus["Disputed"] = 4] = "Disputed";
    JobStatus[JobStatus["Cancelled"] = 5] = "Cancelled";
    JobStatus[JobStatus["TimedOut"] = 6] = "TimedOut";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var JobMode;
(function (JobMode) {
    JobMode[JobMode["Open"] = 0] = "Open";
    JobMode[JobMode["Direct"] = 1] = "Direct";
})(JobMode || (exports.JobMode = JobMode = {}));
//# sourceMappingURL=types.js.map