import { createHash } from "crypto";
import { readFileSync } from "fs";
import { homedir } from "os";
import * as http from "http";
import { Connection, Keypair } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { AgentBondClient } from "../../sdk/src/client";
import { PROGRAM_ID } from "../../sdk/src/utils";

const DEVNET_RPC = "https://api.devnet.solana.com";
const DESCRIPTION = "Fetch the current SOL/USDC price";

function postMetadata(description: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ description });
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path: "/api/metadata/job",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Metadata store failed: ${res.statusCode}`));
        } else {
          res.resume();
          res.on("end", resolve);
        }
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main(): Promise<void> {
  const keypairPath = `${homedir()}/.config/solana/apex-bot-devnet.json`;
  const raw = JSON.parse(readFileSync(keypairPath, "utf8")) as number[];
  const keypair = Keypair.fromSecretKey(Uint8Array.from(raw));

  const connection = new Connection(DEVNET_RPC, "confirmed");
  const wallet = new Wallet(keypair);
  const client = new AgentBondClient(connection, wallet);

  console.log(`Program ID: ${PROGRAM_ID.toBase58()}`);
  console.log(`Poster: ${wallet.publicKey.toBase58()}`);

  const descriptionHash = new Uint8Array(
    createHash("sha256").update(DESCRIPTION).digest()
  );

  await postMetadata(DESCRIPTION);

  const stats = await client.getProtocolStats();
  const jobIndex = stats.totalJobs;

  const tx = await client.postJob(descriptionHash, BigInt(50_000), BigInt(300));

  console.log(`Job index: ${jobIndex}`);
  console.log(`Transaction: ${tx}`);
  console.log("Job posted! Now run the bots to see them bid.");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
