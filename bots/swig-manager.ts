import "dotenv/config";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  Actions,
  createEd25519AuthorityInfo,
  findSwigPda,
  getCreateSwigInstruction,
} from "@swig-wallet/classic";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";

const DEVNET_RPC = process.env.RPC_URL || "https://api.devnet.solana.com";
const SWIG_REGISTRY_PATH =
  process.env.SWIG_REGISTRY ?? `${homedir()}/.config/agentbond/swig-registry.json`;

/**
 * Permission presets for different bot types.
 * Each preset defines what actions the bot's Swig wallet is allowed to perform.
 *
 * Available Actions: all(), manageAuthority(), allButManageAuthority(),
 * closeSwigAuthority(), rentDestination(), programAll(), programCurated(),
 * subAccount(), stakeAll()
 */
export const PERMISSION_PRESETS = {
  /**
   * SwapBot: Can execute transactions but NOT manage authorities.
   * This means it can transfer SOL/tokens and interact with programs,
   * but cannot add/remove other signers — economic guardrails.
   */
  swap: () =>
    Actions.set()
      .allButManageAuthority()
      .get(),

  /**
   * PriceBot: Can only interact with curated programs (read-heavy operations).
   * Cannot transfer SOL/tokens freely.
   */
  readonly: () =>
    Actions.set()
      .programCurated()
      .get(),

  /**
   * PortfolioBot: Same as readonly — curated program access only.
   */
  portfolio: () =>
    Actions.set()
      .programCurated()
      .get(),

  /**
   * Root authority: Full admin access for the deployment keypair.
   */
  admin: () =>
    Actions.set()
      .all()
      .get(),
} as const;

export type PermissionPreset = keyof typeof PERMISSION_PRESETS;

interface SwigRegistryEntry {
  botName: string;
  swigAddress: string;
  swigId: string;
  preset: PermissionPreset;
  createdAt: string;
}

type SwigRegistry = Record<string, SwigRegistryEntry>;

/**
 * SwigWalletManager provisions and manages Swig smart wallets for AgentBond bots.
 *
 * Each bot gets a dedicated Swig wallet with scoped permissions:
 * - SwapBot → can transfer SOL + SPL tokens
 * - PriceBot → read-only, cannot move funds
 * - PortfolioBot → read-only, cannot move funds
 *
 * The manager persists a registry file so Swig addresses survive restarts.
 */
export class SwigWalletManager {
  private connection: Connection;
  private registry: SwigRegistry;

  constructor(connection?: Connection) {
    this.connection = connection ?? new Connection(DEVNET_RPC, "confirmed");
    this.registry = this.loadRegistry();
  }

  /**
   * Provision a Swig wallet for a bot. If one already exists, returns the cached address.
   *
   * @param botName - Unique bot identifier (e.g. "SwapBot")
   * @param ownerKeypair - The bot's keypair (becomes the Swig root authority)
   * @param preset - Permission preset to apply
   * @returns The Swig PDA address
   */
  async provisionSwig(
    botName: string,
    ownerKeypair: Keypair,
    preset: PermissionPreset
  ): Promise<PublicKey> {
    // Check if we already have a Swig for this bot
    const existing = this.registry[botName];
    if (existing) {
      const swigAddress = new PublicKey(existing.swigAddress);
      const accountInfo = await this.connection.getAccountInfo(swigAddress);
      if (accountInfo !== null) {
        console.log(
          `[SwigManager] Swig for "${botName}" already exists: ${swigAddress.toBase58()}`
        );
        return swigAddress;
      }
      // Account doesn't exist on-chain anymore, recreate
      console.log(
        `[SwigManager] Swig for "${botName}" was lost on-chain, reprovisioning...`
      );
    }

    console.log(`[SwigManager] Creating Swig wallet for "${botName}" with preset "${preset}"...`);

    // Generate a deterministic-ish ID from the bot name + owner
    const id = new Uint8Array(32);
    const encoder = new TextEncoder();
    const seed = encoder.encode(`agentbond:${botName}:${ownerKeypair.publicKey.toBase58()}`);
    // Hash the seed into the ID for determinism
    for (let i = 0; i < 32; i++) {
      id[i] = seed[i % seed.length] ^ (i * 37);
    }

    const swigAddress = findSwigPda(id);

    // Create the root authority from the bot's keypair
    const rootAuthorityInfo = createEd25519AuthorityInfo(ownerKeypair.publicKey);
    const actions = PERMISSION_PRESETS[preset]();

    // Build and send the create instruction
    const createSwigIx = await getCreateSwigInstruction({
      payer: ownerKeypair.publicKey,
      id,
      actions,
      authorityInfo: rootAuthorityInfo,
    });

    const transaction = new Transaction().add(createSwigIx);
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [ownerKeypair]
    );

    console.log(
      `[SwigManager] ✓ Swig created for "${botName}": ${swigAddress.toBase58()} (tx: ${signature})`
    );

    // Save to registry
    this.registry[botName] = {
      botName,
      swigAddress: swigAddress.toBase58(),
      swigId: Buffer.from(id).toString("hex"),
      preset,
      createdAt: new Date().toISOString(),
    };
    this.saveRegistry();

    return swigAddress;
  }

  /**
   * Get the Swig address for a bot, or null if not provisioned.
   */
  getSwigAddress(botName: string): PublicKey | null {
    const entry = this.registry[botName];
    return entry ? new PublicKey(entry.swigAddress) : null;
  }

  /**
   * Get the permission preset for a bot.
   */
  getPreset(botName: string): PermissionPreset | null {
    return this.registry[botName]?.preset ?? null;
  }

  /**
   * Get a summary of all provisioned Swig wallets.
   */
  listAll(): SwigRegistryEntry[] {
    return Object.values(this.registry);
  }

  private loadRegistry(): SwigRegistry {
    try {
      if (existsSync(SWIG_REGISTRY_PATH)) {
        return JSON.parse(readFileSync(SWIG_REGISTRY_PATH, "utf8"));
      }
    } catch {
      console.warn("[SwigManager] Could not load registry, starting fresh");
    }
    return {};
  }

  private saveRegistry(): void {
    try {
      const dir = SWIG_REGISTRY_PATH.substring(0, SWIG_REGISTRY_PATH.lastIndexOf("/"));
      if (!existsSync(dir)) {
        const { mkdirSync } = require("fs");
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(SWIG_REGISTRY_PATH, JSON.stringify(this.registry, null, 2));
    } catch (err) {
      console.warn(`[SwigManager] Could not save registry: ${String(err)}`);
    }
  }
}
