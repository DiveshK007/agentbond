export const IDL = {
  address: "5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3",
  metadata: {
    name: "agent_bond",
    version: "0.1.0",
    spec: "0.1.0",
  },
  instructions: [
    {
      name: "initializeProtocol",
      discriminator: [188, 233, 252, 106, 134, 146, 202, 91],
      accounts: [
        {
          name: "protocolConfig",
          writable: true,
          pda: { seeds: [{ kind: "const", value: [112, 114, 111, 116, 111, 99, 111, 108] }] },
        },
        { name: "admin", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [],
    },
    {
      name: "registerAgent",
      discriminator: [135, 157, 66, 195, 2, 113, 175, 30],
      accounts: [
        {
          name: "agentProfile",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [97, 103, 101, 110, 116] },
              { kind: "account", path: "owner" },
            ],
          },
        },
        {
          name: "stakeVault",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [115, 116, 97, 107, 101, 95, 118, 97, 117, 108, 116] },
              { kind: "account", path: "agentProfile" },
            ],
          },
        },
        {
          name: "protocolConfig",
          writable: true,
          pda: { seeds: [{ kind: "const", value: [112, 114, 111, 116, 111, 99, 111, 108] }] },
        },
        { name: "owner", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "name", type: "string" },
        { name: "metadataUri", type: "string" },
        { name: "stakeAmount", type: "u64" },
      ],
    },
    {
      name: "updateStake",
      discriminator: [248, 112, 197, 95, 233, 137, 105, 19],
      accounts: [
        {
          name: "agentProfile",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [97, 103, 101, 110, 116] },
              { kind: "account", path: "owner" },
            ],
          },
        },
        {
          name: "stakeVault",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [115, 116, 97, 107, 101, 95, 118, 97, 117, 108, 116] },
              { kind: "account", path: "agentProfile" },
            ],
          },
        },
        { name: "owner", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "deposit", type: { option: "u64" } },
        { name: "withdraw", type: { option: "u64" } },
      ],
    },
    {
      name: "listService",
      discriminator: [1, 210, 220, 97, 94, 11, 206, 34],
      accounts: [
        { name: "serviceListing", writable: true },
        {
          name: "agentProfile",
          pda: {
            seeds: [
              { kind: "const", value: [97, 103, 101, 110, 116] },
              { kind: "account", path: "owner" },
            ],
          },
        },
        { name: "owner", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "capability", type: "string" },
        { name: "price", type: "u64" },
      ],
    },
    {
      name: "createJob",
      discriminator: [178, 130, 217, 110, 100, 27, 82, 119],
      accounts: [
        { name: "job", writable: true },
        { name: "escrowVault", writable: true },
        {
          name: "protocolConfig",
          writable: true,
          pda: { seeds: [{ kind: "const", value: [112, 114, 111, 116, 111, 99, 111, 108] }] },
        },
        { name: "agentProfile", writable: true, optional: true, isOptional: true },
        { name: "poster", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "jobIndex", type: "u64" },
        { name: "descriptionHash", type: { array: ["u8", 32] } },
        { name: "reward", type: "u64" },
        { name: "deadlineSeconds", type: "u64" },
        { name: "mode", type: "u8" },
        { name: "agentOwner", type: { option: "pubkey" } },
      ],
    },
    {
      name: "bidOnJob",
      discriminator: [33, 180, 51, 86, 37, 181, 46, 254],
      accounts: [
        { name: "job" },
        { name: "bid", writable: true },
        { name: "agentProfile" },
        { name: "agentOwner", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "price", type: "u64" },
        { name: "estimatedSeconds", type: "u32" },
      ],
    },
    {
      name: "assignAgent",
      discriminator: [146, 145, 237, 81, 75, 46, 30, 190],
      accounts: [
        { name: "job", writable: true },
        { name: "agentProfile", writable: true },
        { name: "bid" },
        { name: "poster", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [{ name: "agentPubkey", type: "pubkey" }],
    },
    {
      name: "submitResult",
      discriminator: [240, 42, 89, 180, 10, 239, 9, 214],
      accounts: [
        { name: "job", writable: true },
        { name: "agentOwner", writable: true, signer: true },
      ],
      args: [{ name: "resultHash", type: { array: ["u8", 32] } }],
    },
    {
      name: "approveJob",
      discriminator: [201, 133, 238, 82, 103, 63, 234, 131],
      accounts: [
        {
          name: "protocolConfig",
          writable: true,
          pda: { seeds: [{ kind: "const", value: [112, 114, 111, 116, 111, 99, 111, 108] }] },
        },
        { name: "job", writable: true },
        { name: "escrowVault", writable: true },
        { name: "agentProfile", writable: true },
        { name: "agentOwner", writable: true },
        {
          name: "treasury",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [116, 114, 101, 97, 115, 117, 114, 121] },
              { kind: "account", path: "protocolConfig" },
            ],
          },
        },
        { name: "poster", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [],
    },
    {
      name: "disputeJob",
      discriminator: [101, 104, 253, 231, 1, 139, 108, 100],
      accounts: [
        { name: "job", writable: true },
        { name: "escrowVault", writable: true },
        { name: "agentProfile", writable: true },
        { name: "stakeVault", writable: true },
        { name: "poster", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [],
    },
    {
      name: "claimTimeout",
      discriminator: [130, 234, 45, 53, 120, 90, 86, 178],
      accounts: [
        {
          name: "protocolConfig",
          writable: true,
          pda: { seeds: [{ kind: "const", value: [112, 114, 111, 116, 111, 99, 111, 108] }] },
        },
        { name: "job", writable: true },
        { name: "escrowVault", writable: true },
        { name: "agentProfile", writable: true },
        { name: "stakeVault", writable: true },
        { name: "agentOwner", writable: true },
        {
          name: "treasury",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [116, 114, 101, 97, 115, 117, 114, 121] },
              { kind: "account", path: "protocolConfig" },
            ],
          },
        },
        { name: "poster", writable: true },
        { name: "caller", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "ProtocolConfig",
      discriminator: [207, 91, 250, 28, 152, 179, 215, 209],
    },
    {
      name: "AgentProfile",
      discriminator: [60, 227, 42, 24, 0, 87, 86, 205],
    },
    {
      name: "ServiceListing",
      discriminator: [117, 173, 54, 52, 146, 147, 124, 211],
    },
    {
      name: "Job",
      discriminator: [75, 124, 80, 203, 161, 180, 202, 80],
    },
    {
      name: "Bid",
      discriminator: [143, 246, 48, 245, 42, 145, 180, 88],
    },
  ],
  types: [
    {
      name: "ProtocolConfig",
      type: {
        kind: "struct",
        fields: [
          { name: "admin", type: "pubkey" },
          { name: "totalAgents", type: "u64" },
          { name: "totalJobs", type: "u64" },
          { name: "totalVolume", type: "u64" },
          { name: "platformFeeBps", type: "u16" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "AgentProfile",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "pubkey" },
          { name: "name", type: { array: ["u8", 32] } },
          { name: "metadataUri", type: { array: ["u8", 128] } },
          { name: "stake", type: "u64" },
          { name: "lockedStake", type: "u64" },
          { name: "reputation", type: "u32" },
          { name: "completed", type: "u32" },
          { name: "failed", type: "u32" },
          { name: "consecutiveFails", type: "u8" },
          { name: "totalEarned", type: "u64" },
          { name: "totalSlashed", type: "u64" },
          { name: "registeredAt", type: "i64" },
          { name: "status", type: "u8" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "ServiceListing",
      type: {
        kind: "struct",
        fields: [
          { name: "agent", type: "pubkey" },
          { name: "capability", type: { array: ["u8", 32] } },
          { name: "price", type: "u64" },
          { name: "isActive", type: "bool" },
          { name: "totalCalls", type: "u64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "Job",
      type: {
        kind: "struct",
        fields: [
          { name: "poster", type: "pubkey" },
          { name: "agent", type: "pubkey" },
          { name: "descriptionHash", type: { array: ["u8", 32] } },
          { name: "reward", type: "u64" },
          { name: "collateral", type: "u64" },
          { name: "deadline", type: "i64" },
          { name: "mode", type: "u8" },
          { name: "status", type: "u8" },
          { name: "resultHash", type: { array: ["u8", 32] } },
          { name: "createdAt", type: "i64" },
          { name: "assignedAt", type: "i64" },
          { name: "resolvedAt", type: "i64" },
          { name: "jobIndex", type: "u64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "Bid",
      type: {
        kind: "struct",
        fields: [
          { name: "job", type: "pubkey" },
          { name: "agent", type: "pubkey" },
          { name: "price", type: "u64" },
          { name: "estimatedSeconds", type: "u32" },
          { name: "createdAt", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "InvalidStakeAmount", msg: "Stake amount must be greater than zero" },
    { code: 6001, name: "AgentSuspended", msg: "Agent is suspended" },
    { code: 6002, name: "AgentNotActive", msg: "Agent is not active" },
    { code: 6003, name: "InsufficientStake", msg: "Insufficient unlocked stake for withdrawal" },
    { code: 6004, name: "StakeLocked", msg: "Stake is locked in active jobs" },
    { code: 6005, name: "ServiceAlreadyExists", msg: "Service listing already exists for this capability" },
    { code: 6006, name: "JobNotOpen", msg: "Job is not in Open status" },
    { code: 6007, name: "JobNotAssigned", msg: "Job is not in Assigned status" },
    { code: 6008, name: "JobNotSubmitted", msg: "Job is not in Submitted status" },
    { code: 6009, name: "NotJobPoster", msg: "Signer is not the job poster" },
    { code: 6010, name: "NotAssignedAgent", msg: "Signer is not the assigned agent" },
    { code: 6011, name: "DeadlinePassed", msg: "Job deadline has passed" },
    { code: 6012, name: "DeadlineNotPassed", msg: "Job deadline has not passed yet" },
    { code: 6013, name: "InvalidJobMode", msg: "Invalid job mode" },
    { code: 6014, name: "BidAlreadyExists", msg: "Bid already exists for this agent" },
    { code: 6015, name: "InsufficientReward", msg: "Reward must be greater than zero" },
  ],
};

export type AgentBondIDL = typeof IDL;
