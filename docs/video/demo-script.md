# AgentBond — Demo Video Production Plan

**Event:** Colosseum Frontier 2026
**Length:** 180 seconds hard cap. Target render: **2:55** (5s buffer).
**Format:** Hybrid — AI-generated cinematic B-roll for narrative framing + real screen capture for empirical proof.
**Tone:** Documentary-grade. Calm. High-stakes. Inevitable.

> Judges watch dozens of submissions back-to-back. Cognitive fatigue is your enemy. The first 8 seconds determine whether they finish the video. Pacing is the weapon.

---

## 1. The Thesis: Intelligence Flow Architecture

Generative AI video models in 2026 (Veo 3.1, Kling 3.0, Runway Gen-4.5, NotebookLM Cinematic) cannot render bespoke product UIs without hallucinating. **A hackathon demo that shows AI-generated approximations of your product is technical disqualification.** The judges will know.

The winning workflow is **hybrid**:

| Layer | Source | Why |
|---|---|---|
| **Narrative shell** — hook, transitions, abstract concepts | AI-generated (Veo 3.1 / NotebookLM Cinematic) | Cinematic production value teams normally can't afford |
| **Empirical core** — every UI frame, every wallet popup, every Solana Explorer view | Real screen capture (Screen Studio / QuickTime) | Judges need to trust the product is real |
| **Voiceover** | Recorded once end-to-end, cleaned in Descript | Filler words destroy authority |
| **Composite** | CapCut (fast) or DaVinci Resolve (free, pro) | Single-timeline assembly |

**AgentBond's unfair advantage:** the slashing transaction is **on-chain, public, verifiable**. Judges can click the Solana Explorer link in our description and replay the proof themselves. No other Colosseum project can do this. This is HEART framework "Real Data" at its strongest — exploit it.

---

## 2. The 180-Second Budget

Allocated per the hackathon-pitch narrative arc (Hook → Problem → Solution → Demo → Impact), weighted toward the **slash moment** because it is the unique technical claim.

| Phase | Window | Duration | Function |
|---|---|---|---|
| **Hook** | 0:00 – 0:12 | 12s | Disrupt judge fatigue. Establish stakes. Brand tag. |
| **Problem** | 0:12 – 0:30 | 18s | The accountability gap. A user persona losing money. |
| **Solution + Live Demo (Pt 1 — Happy Path)** | 0:30 – 1:15 | 45s | Post job → bot bids → assign → approve → payout. Real screens. |
| **Live Demo (Pt 2 — The Slash)** ⭐ | 1:15 – 2:10 | 55s | FailBot fails → Solana Explorer → stake slashed → user refunded. **The centerpiece.** |
| **Live Demo (Pt 3 — Reputation)** | 2:10 – 2:35 | 25s | Leaderboard. On-chain badges. Portable rep. |
| **Impact + Close** | 2:35 – 2:55 | 20s | Integrations strip + tagline + program ID overlay |

Total: **175s.** Leaves 5s for opening fade-in / closing fade-out.

---

## 3. Asset Matrix

This is the single most important table in the plan. Every shot is either AI-generated narrative B-roll or empirical screen capture. **Nothing in between.**

| # | t (s) | Asset | Source | Tool | What it shows |
|---|---|---|---|---|---|
| 1 | 0:00–0:06 | Hook B-roll | AI | Veo 3.1 / NotebookLM | Abstract: glowing agent nodes on a dark-blue Solana lattice, money streams pulsing between them, one node flickers and goes dark |
| 2 | 0:06–0:12 | Landing page hero | Real | Screen Studio | AgentBond landing page, stat cards animating in |
| 3 | 0:12–0:22 | Problem B-roll | AI | Veo 3.1 | A trader at a terminal, autonomous bot icon, red error glow, "Funds Lost" type-on text |
| 4 | 0:22–0:30 | Problem stat overlay | Real (composite) | CapCut + screenshot | "$15M+ agent transactions on Solana. Zero recourse on failure." over the landing page blurred |
| 5 | 0:30–0:45 | `/post` job form | Real | Screen Studio | Filling form, hitting Post, Phantom popup, approve |
| 6 | 0:45–1:00 | `/jobs` board, bids incrementing | Real | Screen Studio | New job at top, bid count going 0 → 1 → 2 → 3 |
| 7 | 1:00–1:15 | `/jobs/[index]` assign + approve | Real | Screen Studio | Assign agent, approve, wallet sign, success toast |
| 8 | 1:15–1:25 | Transition B-roll | AI | Veo 3.1 | Cinematic cut: padlock shattering, chain link breaking, then re-forging |
| 9 | 1:25–1:50 | **Solana Explorer — slash tx** | Real | Screen Studio | Zoom to tx signature, program ID, `dispute_job` instruction |
| 10 | 1:50–2:10 | Explorer SOL transfer events | Real | Screen Studio | StakeVault → user wallet, EscrowVault → user wallet |
| 11 | 2:10–2:35 | `/leaderboard` | Real | Screen Studio | FailBot row (red), top bot with Silver badge |
| 12 | 2:35–2:50 | `/agents` integrations strip | Real | Screen Studio | 6 bots with Swig / LI.FI / Switchboard / x402 / Helius badges |
| 13 | 2:50–2:55 | Final tag B-roll | AI or static | Veo 3.1 / Figma | "AgentBond. Live on Solana Devnet." with program ID `5foUTphb…` on screen |

**Rule:** if it shows the *product*, it is captured. If it shows an *idea*, it is generated. The two must never cross.

---

## 4. Tool Stack — Three Tiers

Pick the tier that matches your budget and time. Tier 1 is enough to win. Tier 2 raises ceiling. Tier 3 is "we are absolutely going for it."

### Tier 1 — Free / 24-hour turnaround
- **Screen capture:** QuickTime (Cmd+Shift+5) — free, native macOS
- **AI B-roll:** NotebookLM Cinematic Video Overview (free with Google AI Pro trial)
- **VO recording:** QuickTime audio recording
- **VO cleanup:** Descript (free tier — 1 hour/month, enough for this) — text-based editing, removes filler words
- **Compositing:** CapCut (free) or iMovie (free, native)
- **Music:** YouTube Audio Library or Uppbeat (free)

### Tier 2 — ~$40 total, 12-hour turnaround
- **Screen capture:** Screen Studio ($89 once, has free trial sufficient for one project) — auto-zoom, smooth cursor, ✨ the highest-impact upgrade
- **AI B-roll:** Veo 3.1 via Google AI Pro ($19.99/mo, cancel after)
- **VO recording + cleanup:** Descript Hobbyist ($16/mo, cancel after)
- **Compositing:** CapCut Pro (free works) or Descript itself

### Tier 3 — Max polish
- **Screen capture:** Screen Studio + Recorded (auto-detect workflow steps)
- **AI B-roll:** Veo 3.1 Ultra ($249/mo) for unwatermarked 4K + Kling 3.0 ($10/mo) for storyboarded multi-shot transitions
- **VO:** Descript Pro with voice cloning fallback
- **Compositing:** DaVinci Resolve (free) or Premiere Pro

**Recommendation:** **Tier 2.** Screen Studio alone is the difference between an indie demo and a YC-tier demo. Worth the trial.

---

## 5. NotebookLM Cinematic — Steering Prompt (copy-paste ready)

Use this when generating the **hook B-roll** and **transition B-roll** in NotebookLM Cinematic Video Overview. Upload the project's `README.md`, `SUBMISSION.md`, and `docs/ARCHITECTURE.md` as sources first.

```
You are a Cinematic Director, Executive Producer, and Master of Visual
Narrative for a 3-minute hackathon demo film. Think Christopher Nolan
meets Apple keynote. Your job is to generate cinematic B-roll only —
no UI rendering, no product mockups, no fake interfaces.

PROJECT: AgentBond — economic trust layer for AI agents on Solana.
Core mechanic: agents stake SOL, fail, get slashed automatically by
the smart contract. No human arbitration. The code runs.

VISUAL GENRE: "The Onchain Lattice."
- Palette: deep blue-black (#050b1a), electric cyan accents (#00e599),
  warning crimson (#ff3b3b), surfaces in matte graphite.
- Aesthetic: brutalist geometry, glowing transaction lattices, glass
  morphism over dark backgrounds. Think Ex Machina + Mr. Robot terminal.
- Texture: subtle film grain, depth of field on close-ups, no soft
  pastels, no stock footage feel.

SEMANTIC MOTION (mandatory):
- Zoom IN = focus on a specific failure or a single transaction
- WIDE shot = network scale, agent fleet, ecosystem context
- FAST pan = a transaction propagating across the network
- HOLD = a moment of trust being broken (the slash)

OUTPUT 3 distinct B-roll segments, each 4–8 seconds:

  Segment A — Hook (6s): A vast dark lattice of glowing nodes
  representing AI agents. Money streams pulse between them in cyan.
  Camera pushes in. One node flickers crimson, then goes dark. The
  streams routing through it freeze, then break apart. A user-shaped
  silhouette in the corner reaches out — but the connection is gone.

  Segment B — Transition to the Slash (4s): A glass padlock at the
  center of the frame. A red instruction propagates from the contract
  toward it. The padlock shatters into crystalline shards that fall
  upward (anti-gravity). Behind the shards, a wallet icon refills with
  cyan light.

  Segment C — Closing tag (5s): The lattice from Segment A, now
  re-stabilized. Every node now has a small cyan halo (the stake).
  Pull back to reveal the lattice forms the AgentBond wordmark. Hold.

SOURCE INTEGRITY: Use ONLY the uploaded sources to extract conceptual
truth. Do not fabricate UI, screenshots, or product flows — those will
be supplied as real screen recordings in post-production. You are
providing the emotional shell, not the proof.

OUTPUT FORMAT: One-sentence logline, then a scene-by-scene storyboard
with second-level timing.
```

If you have access to Veo 3.1 directly (via Google AI Studio or Flow), you can also use these per-segment prompts standalone — see Section 6.

---

## 6. Veo 3.1 / Kling 3.0 Direct Prompts (alternative to NotebookLM)

If you go straight to Veo 3.1 instead of using NotebookLM as the orchestrator, use these tested prompts. Each is one Veo generation (8s base, extend if needed).

### Hook B-roll (Segment A)
```
Cinematic 8-second shot. Vast dark space, deep blue-black void.
A three-dimensional lattice of glowing cyan nodes representing AI agents,
connected by pulsing data streams carrying small white packets of value.
Slow dolly-in push. One node at center-left flickers, turns crimson,
goes dark. The packets routing through it freeze mid-flight and shatter.
A faint human silhouette in the lower-right reaches toward the dead node,
unable to reach it. Subtle film grain, anamorphic lens flare, depth of
field, Mr. Robot color grade. No text. No UI. No interface elements.
Synthwave ambient drone, low and tense. 24fps cinematic.
```

### Slash transition B-roll (Segment B)
```
Cinematic 4-second shot. A pristine glass padlock floats in the center
of a dark void. A single thin crimson line of code propagates from
off-screen and strikes the padlock. The padlock shatters into hundreds
of crystalline glass shards which then fall UPWARD against gravity.
Behind the dispersing shards, a minimalist wallet icon refills from
empty to full with cyan liquid light. Slow motion. Anamorphic lens.
Synthesized impact sound at the moment of shattering. No text. No UI.
```

### Closing tag B-roll (Segment C)
```
Cinematic 5-second shot. The 3D lattice from earlier, now stabilized
and humming. Every node now has a subtle cyan halo (representing the
stake). Camera pulls back smoothly. The pattern of nodes resolves into
the wordmark "AgentBond" formed by the lattice itself. Hold final frame
for 1 second. Ambient cyberpunk drone fading. Subtle title-card
emergence using on-brand typography (Geist Mono or Inter Tight).
```

**Pricing watch:** at $0.50–$1.20 per Veo generation, three segments = under $5. Budget for 8–10 regenerations across the three (~$10).

---

## 7. Pre-Production Checklist

Do all of this **before** you hit record. The recording itself should take 30 minutes; prep takes 2 hours.

### Step 0 — Capture the slashing transaction (the most important asset)
```bash
# Start fresh, clean state
bash scripts/start-all.sh
sleep 10

# Trigger a controlled failure
bash scripts/run-failbot.sh

# When the script completes, copy the SLASH TRANSACTION SIGNATURE
# from the terminal output. It looks like:
#   Slashed: 5xK9...3vQp on tx 4nF8...xz2W
# 
# Open: https://explorer.solana.com/tx/<SIG>?cluster=devnet
# PIN THAT TAB.
```

### Step 1 — Seed live data (HEART: "Real Data," not placeholders)
```bash
# Populate the protocol with realistic-looking jobs
npx ts-node scripts/seed-demo.ts

# Verify the leaderboard has FailBot AND a Gold/Silver bot visible
open http://localhost:3000/leaderboard
```

### Step 2 — Tabs and window setup
Open these in one Chrome/Safari window, in this exact left-to-right order:

1. `http://localhost:3000` — landing, scrolled to top
2. `http://localhost:3000/post` — form pre-filled (Title: "Price feed for SOL/USD", Reward: 0.05 SOL, Description: one paragraph)
3. `http://localhost:3000/jobs` — sorted newest first
4. **Solana Explorer** — pinned with your slash tx
5. `http://localhost:3000/leaderboard`
6. `http://localhost:3000/agents`

Hide the bookmarks bar (Cmd+Shift+B). Close every other app. Enable Do Not Disturb.

### Step 3 — Cursor and zoom
- **If using Screen Studio:** nothing to do — it auto-handles zooms and cursor.
- **If using QuickTime:** install [Mouseposé](https://boinx.com/mousepose/) for cursor highlighting, and use macOS native Zoom (Accessibility → Cmd-scroll) for the slash tx close-up.

### Step 4 — Audio
- USB mic > laptop mic. If you only have a laptop mic, record in a small carpeted room with your face 6 inches from the mic.
- Record voiceover **separately** from screen capture. Read the entire script in one take. You'll sync later.
- Quiet room. Phone on airplane mode. Fridge off if you can (kitchens hum).

---

## 8. Storyboard (scene-by-scene with VO)

This is the final cut sheet. Each row maps to one timeline segment.

| t | Visual | VO |
|---|---|---|
| 0:00–0:06 | **AI B-roll Segment A** (lattice, node fails) | *(silence — let the visual breathe for 2s)* … "AI agents are moving real money on Solana." |
| 0:06–0:12 | **Real:** AgentBond landing page, stats animating | "When they fail, users lose with nowhere to turn." |
| 0:12–0:22 | **AI B-roll** problem visual (terminal, red glow) | "Today, fifteen million agent-driven transactions happen on Solana every month. None of them have a way to make the user whole when the agent fails." |
| 0:22–0:30 | **Composite:** stat overlay on blurred landing page | "Reputation lives in Discord bios. Escrow doesn't exist. The agentic economy runs on vibes." |
| 0:30–0:45 | **Real:** `/post` form, fill, hit submit, Phantom approve | "AgentBond fixes this. I post a job — reward 0.05 SOL. When I sign, the reward locks inside a Solana smart contract. Not us. Not the agent. The contract." |
| 0:45–1:00 | **Real:** `/jobs` board, bid count incrementing | "Within seconds, autonomous bots see it and bid. Six bots, each with a Swig smart wallet enforcing scoped permissions at the wallet level." |
| 1:00–1:15 | **Real:** assign bid, agent submits, approve, success toast | "I pick a bid. The agent delivers. I approve. The contract pays 98% to the agent, 2% to the treasury. Automatic. No invoice. No middleman." |
| 1:15–1:19 | **AI B-roll Segment B** (padlock shatters) | "Now the part nobody else has built." |
| 1:19–1:25 | **Real:** cut to Solana Explorer tab loading | *(let the explorer page render)* |
| 1:25–1:50 | **Real:** zoom to tx signature, program ID, `dispute_job` instruction | "This is FailBot. It took a job, submitted garbage, and got disputed. This is the dispute transaction — live, on Solana devnet, right now." |
| 1:50–2:10 | **Real:** scroll to SOL transfer events on the explorer | "Watch what the contract did. Stake slashed from the agent. Reward refunded to the user. No arbitration. No appeals. The code ran." |
| 2:10–2:25 | **Real:** `/leaderboard`, hover FailBot row (red), then top bot row (Silver badge) | "Every agent's reputation is on-chain. Stake. Completed jobs. Failures. Slashing events. You can't fake this." |
| 2:25–2:35 | **Real:** `/agents` — bot grid with integration badges | "Top agents earn Metaplex NFT badges. Portable reputation that travels with the agent across any platform." |
| 2:35–2:50 | **Real:** integrations strip — Swig, LI.FI, Switchboard, x402, Helius, Phantom, Privy, MoonPay, Arcium, Reflect | "Fifteen Solana ecosystem integrations. Native plugins for elizaOS and MCP. Drop-in for any agent." |
| 2:50–2:55 | **AI B-roll Segment C** with program ID overlay | "AgentBond. Live on Solana devnet." *(beat)* "Stake to serve. Slash on failure." |

**Total word count: ~395 words.** At a calm 140 wpm = **170 seconds of speech**. Plus 10s of intentional silence around the slash beat. Plus 5s of B-roll breath. Lands at ~2:55.

---

## 9. Voiceover Script (continuous, one take)

Copy this into Descript or a teleprompter app. Read at a calm 140 wpm. Pause at the bracketed beats.

```
[2s silence over the opening B-roll]

AI agents are moving real money on Solana.

When they fail, users lose with nowhere to turn.

Today, fifteen million agent-driven transactions happen on Solana every
month. None of them have a way to make the user whole when the agent fails.

Reputation lives in Discord bios. Escrow doesn't exist. The agentic
economy runs on vibes.

AgentBond fixes this.

I post a job — reward, point-zero-five SOL. When I sign, the reward
locks inside a Solana smart contract. Not us. Not the agent. The contract.

Within seconds, autonomous bots see it and bid. Six bots — each with a
Swig smart wallet enforcing scoped permissions at the wallet level.

I pick a bid. The agent delivers. I approve. The contract pays
ninety-eight percent to the agent, two percent to the treasury.
Automatic. No invoice. No middleman.

[1s beat]

Now the part nobody else has built.

This is FailBot. It took a job, submitted garbage, and got disputed.
This is the dispute transaction — live, on Solana devnet, right now.

[1s beat — let the explorer load]

Watch what the contract did.

Stake — slashed — from the agent.
Reward — refunded — to the user.

No arbitration. No appeals. The code ran.

[1s beat]

Every agent's reputation is on-chain. Stake. Completed jobs. Failures.
Slashing events. You can't fake this.

Top agents earn Metaplex NFT badges. Portable reputation that travels
with the agent across any platform.

Fifteen Solana ecosystem integrations. Native plugins for elizaOS and
MCP. Drop-in for any agent.

AgentBond. Live on Solana devnet. Stake to serve. Slash on failure.
```

**Pronunciation notes:**
- "Solana" — soh-LAH-nuh
- "Metaplex" — META-plex
- "elizaOS" — eh-LYE-zuh O-S (let each letter ring)
- "MCP" — em-see-pee (each letter)
- "Swig" — sounds exactly how it's spelled
- "x402" — ex-four-oh-two

If Descript flags any word as mispronounced, **respell it phonetically in the script** rather than retake. Descript will read your phonetic spelling correctly.

---

## 10. Post-Production Pipeline

Total post time: **2–3 hours** if you're not chasing perfection, **6 hours** if you are.

### Step 1 — Generate AI B-roll (parallel to screen recording)
1. Open NotebookLM, create a new notebook, upload `README.md`, `SUBMISSION.md`, `docs/ARCHITECTURE.md`.
2. Paste the Cinematic Director prompt from Section 5 into the Steering Prompt field.
3. Click Generate. **This takes 15–50 minutes — start it first, then go record the screen.**
4. While that runs, if you have Veo 3.1 access via Google AI Studio, run the three direct prompts from Section 6 in parallel. Pick whichever output is sharper.

### Step 2 — Screen capture (one continuous take if you can)
1. Open Screen Studio (or QuickTime).
2. Hit record. Walk through the storyboard in order — landing → post → jobs → assign → approve → explorer → leaderboard → agents.
3. If you mess up a step, **keep going.** You'll cut the bad take in editing. Restarting wastes more time than it saves.
4. Aim for one 4-minute take that you'll trim down to ~2:30 of screen content.

### Step 3 — Voiceover
1. Open Descript. New project. Hit record.
2. Read the Section 9 script end-to-end. Slow and calm.
3. Descript auto-transcribes. Delete every "um," every "uh," every retry. Use the **"remove filler words"** auto-action.
4. Export the cleaned audio as `vo.mp3`.

### Step 4 — Composite (CapCut or DaVinci Resolve)
1. Drop the screen capture on Track 1.
2. Drop `vo.mp3` on Track 2.
3. Trim the screen capture to match the VO's timing per the Section 8 storyboard.
4. At t=0:00, 0:12, 1:15, and 2:50 — insert the AI B-roll clips from Step 1.
5. Add background music on Track 3 at **−24 dB** (very low). Ducking under VO. Suggested: search "tense electronic minimal" on Uppbeat.
6. **Duck or kill the music during the slash beat (1:50–2:10).** Silence makes the slash hit harder.

### Step 5 — Captions
1. Use Descript's auto-caption export or CapCut's "Auto Caption" feature.
2. White text, semi-transparent black background, bottom third.
3. Manually fix any technical terms (Solana, Metaplex, elizaOS, Swig).

### Step 6 — Final pass
1. Watch the full cut **on your phone** at arm's length. That's how judges will watch it.
2. Cut anything that loses your attention for even 1 second.
3. Confirm runtime is 2:55–3:00. If over, cut from the "happy path" demo first (Section 8 rows 5–7) — that's the most compressible.

### Step 7 — Export
- 1080p, 30fps, H.264 MP4, ~10–20 Mbps
- File size target: under 200 MB (uploads faster to YouTube)

---

## 11. The "Do Not" List (Disqualification Risks)

These are the things that will sink the demo:

- ❌ **Do not let AI generate any UI screenshot.** Veo / Kling / Runway will produce plausible-looking but fake AgentBond screens. Judges will spot it instantly. Real screen capture only for UI.
- ❌ **Do not use placeholder data.** No "test123" agents, no "0x0000..." addresses, no "Lorem ipsum" job descriptions. Seed real-looking data with `scripts/seed-demo.ts`.
- ❌ **Do not show code or an IDE.** This is a *product demo,* not a code walkthrough. The judges read the GitHub link separately.
- ❌ **Do not exceed 3:00.** YouTube cuts after 180s in the player; Colosseum's form may reject longer submissions.
- ❌ **Do not start with a logo or title card.** First frame must be in-motion content. Logos = scroll-past.
- ❌ **Do not use generic stock footage.** It signals weakness. AI B-roll or no B-roll.
- ❌ **Do not narrate every cursor click.** Show, don't say "now I click submit." Trust the visual.
- ❌ **Do not include slides, bullet lists, or org charts.** Colosseum explicitly says no slide decks in the demo.
- ❌ **Do not record the slash without first verifying it actually happened on devnet.** Open the tx link in an incognito window before recording. If the page doesn't load, the demo collapses.

---

## 12. Upload Checklist

- [ ] Final cut is between 2:50 and 3:00
- [ ] First frame is product-in-motion or B-roll, not a title card
- [ ] Captions are accurate on every technical term
- [ ] Slash transaction link is visible on screen at least once (text overlay or in URL bar)
- [ ] Program ID `5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3` appears on screen during closing tag
- [ ] Audio peaks at −3 dB max, dialogue averages around −16 dB
- [ ] Watched on phone at arm's length — engaging throughout
- [ ] Uploaded to YouTube **Unlisted** (not Private — judges must be able to open it)
- [ ] YouTube title: `AgentBond — Demo — Colosseum Frontier 2026`
- [ ] YouTube description includes:
  - One-sentence tagline
  - GitHub repo link
  - Program ID
  - Direct Solana Explorer link to the slash transaction
  - Devnet RPC instructions
- [ ] Link pasted into the **Demo Video** field on the Colosseum submission form
- [ ] Sanity check: open the YouTube link in incognito — confirm it plays without sign-in

---

## 13. If You Have 30 Minutes Left, Not 3 Hours

The fastest path to a shippable demo:

1. Skip AI B-roll entirely. Start the video on the landing page mid-animation.
2. Record one continuous Screen Studio take following the Section 8 storyboard.
3. Record VO in QuickTime. Don't bother with Descript.
4. Sync in iMovie. One audio track, one video track.
5. Add auto-captions in YouTube Studio after upload (free).
6. Done.

This version sacrifices cinematic polish but **preserves the empirical proof** — which is what wins the demo category. A scrappy real demo beats a polished fake one every time.
