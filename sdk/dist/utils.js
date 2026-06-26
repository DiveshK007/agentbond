"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROGRAM_ID = void 0;
exports.findProtocolConfig = findProtocolConfig;
exports.findAgentProfile = findAgentProfile;
exports.findStakeVault = findStakeVault;
exports.findServiceListing = findServiceListing;
exports.findJob = findJob;
exports.findEscrowVault = findEscrowVault;
exports.findTreasury = findTreasury;
exports.findBid = findBid;
exports.nameToBytes = nameToBytes;
exports.bytesToString = bytesToString;
const web3_js_1 = require("@solana/web3.js");
exports.PROGRAM_ID = new web3_js_1.PublicKey("5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3");
function findProtocolConfig() {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("protocol")], exports.PROGRAM_ID);
}
function findAgentProfile(owner) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("agent"), owner.toBuffer()], exports.PROGRAM_ID);
}
function findStakeVault(agentProfile) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("stake_vault"), agentProfile.toBuffer()], exports.PROGRAM_ID);
}
function findServiceListing(agentProfile, capability) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("service"), agentProfile.toBuffer(), Buffer.from(capability)], exports.PROGRAM_ID);
}
function findJob(jobIndex) {
    const indexBuf = Buffer.alloc(8);
    indexBuf.writeBigUInt64LE(jobIndex);
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("job"), indexBuf], exports.PROGRAM_ID);
}
function findEscrowVault(job) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("escrow"), job.toBuffer()], exports.PROGRAM_ID);
}
function findTreasury(protocolConfig) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("treasury"), protocolConfig.toBuffer()], exports.PROGRAM_ID);
}
function findBid(job, agentOwner) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("bid"), job.toBuffer(), agentOwner.toBuffer()], exports.PROGRAM_ID);
}
function nameToBytes(name) {
    const bytes = new Uint8Array(32);
    const encoded = Buffer.from(name, "utf8").slice(0, 32);
    bytes.set(encoded);
    return Array.from(bytes);
}
function bytesToString(bytes) {
    const end = bytes.indexOf(0);
    return Buffer.from(end === -1 ? bytes : bytes.slice(0, end)).toString("utf8");
}
//# sourceMappingURL=utils.js.map