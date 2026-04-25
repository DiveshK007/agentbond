import { readFileSync } from "fs";
import { homedir } from "os";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, Idl } from "@coral-xyz/anchor";
import { IDL } from "../../sdk/src/idl";

const DEVNET_RPC = "https://api.devnet.solana.com";

async function main(): Promise<void> {
  const keypairPath = `${homedir()}/.config/solana/apex-bot-devnet.json`;
  const raw = JSON.parse(readFileSync(keypairPath, "utf8")) as number[];
  const keypair = Keypair.fromSecretKey(Uint8Array.from(raw));

  const connection = new Connection(DEVNET_RPC, "confirmed");
  const wallet = new Wallet(keypair);
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  const program = new Program(IDL as Idl, provider);

  const programId = new PublicKey(IDL.address);
  const [protocolConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("protocol")],
    programId
  );

  console.log(`Protocol config PDA: ${protocolConfig.toBase58()}`);
  console.log(`Admin: ${wallet.publicKey.toBase58()}`);

  const existing = await connection.getAccountInfo(protocolConfig);
  if (existing !== null) {
    console.log("Protocol already initialized.");
    return;
  }

  const tx = await program.methods
    .initializeProtocol()
    .accounts({
      protocolConfig,
      admin: wallet.publicKey,
    })
    .rpc();

  console.log(`Transaction: ${tx}`);
  console.log("Protocol initialized — platform_fee_bps = 200 (2%)");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
