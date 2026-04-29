window.BERT_DOCS = [
  {
    slug: "overview",
    group: "Start",
    title: "BERT V2 Overview",
    summary: "What BERT V2 is, what changed, and which modules now define the live protocol.",
    content: `
      <h1>BERT V2 Documentation</h1>
      <p class="lead">BERT V2 is the current on-chain proposal, voting, and staged grant execution protocol. It replaces the older single-release grant model with author stake at idea creation, milestone-based payouts, stricter validation, and storage-safe upgrade discipline.</p>

      <div>
        <span class="badge">BERT V2</span>
        <span class="badge">5000 BTK entry stake</span>
        <span class="badge">30 / 40 / 30 release rail</span>
        <span class="badge">Upgradeable proxies</span>
        <span class="badge">Subgraph indexed</span>
      </div>

      <h2>What BERT V2 solves</h2>
      <ul>
        <li>Reduces low-commitment idea spam by requiring a real BTK stake at submission.</li>
        <li>Replaces blind full grant release with staged execution tied to proof and validator review.</li>
        <li>Improves operational safety by documenting storage-layout constraints for upgradeable contracts.</li>
        <li>Keeps live state authoritative on-chain while using The Graph for history, lists, and analytics.</li>
      </ul>

      <h2>Core modules in the live V2 stack</h2>
      <ul>
        <li><strong>IdeaRegistryUpgradeable</strong>: canonical idea records, statuses, reviews, author stake entry checks.</li>
        <li><strong>VotingSystemUpgradeable</strong>: round creation, voting windows, min stake, winner selection.</li>
        <li><strong>FundingPoolUpgradeable</strong>: vote stake accounting, author stake locking, treasury balance, reserve logic.</li>
        <li><strong>GrantManagerUpgradeable</strong>: initial claim, milestone proof review, staged payout execution.</li>
        <li><strong>GovernanceTokenUpgradeable (BTK)</strong>: ERC-20 used for submission stake and vote stake.</li>
        <li><strong>ReputationSystemUpgradeable</strong>: outcome-based reputation lifecycle.</li>
        <li><strong>VoterProgressionUpgradeable</strong>: winning-vote progression and role unlock counters.</li>
        <li><strong>RolesRegistryUpgradeable</strong>: central source of functional and system roles.</li>
        <li><strong>BRTFaucet</strong>: testnet BTK onboarding for demos and QA.</li>
      </ul>

      <div class="callout info">
        <strong>Scope note:</strong> this site documents the current <strong>BERT V2</strong> behavior and the Sepolia deployment that the frontend and subgraph are currently aligned to.
      </div>
    `,
  },
  {
    slug: "v2-changes",
    group: "Start",
    title: "What Changed in BERT V2",
    summary: "Exact protocol-level differences between the older flow and the live V2 mechanics.",
    content: `
      <h1>What Changed in BERT V2</h1>
      <p class="lead">BERT V2 is not a cosmetic release. It changes idea entry economics, grant execution, contract storage layout, frontend preflight logic, and subgraph coverage.</p>

      <h2>Headline changes</h2>
      <table>
        <thead>
          <tr><th>Area</th><th>Before</th><th>BERT V2</th></tr>
        </thead>
        <tbody>
          <tr><td>Idea creation</td><td>Metadata-only submission</td><td>Requires <code>authorMinStake</code>, currently <strong>5000 BTK</strong></td></tr>
          <tr><td>Grant release</td><td>Single post-win release path</td><td><strong>30% / 40% / 30%</strong> staged payout</td></tr>
          <tr><td>Milestone validation</td><td>Not part of the release rail</td><td>Explicit proof submission and reviewer approvals per stage</td></tr>
          <tr><td>Idea lifecycle</td><td>Ended at funded/completed in simpler flow</td><td>Adds <code>InProcess</code> stage between <code>Funded</code> and <code>Completed</code></td></tr>
          <tr><td>FundingPool</td><td>Vote stake accounting only</td><td>Also stores <code>authorStakeByIdea</code> and author slashing path</td></tr>
          <tr><td>Frontend writes</td><td>Basic write prompts</td><td>Allowance, stake, role, and status preflight checks before write</td></tr>
        </tbody>
      </table>

      <h2>Upgraded contracts in V2</h2>
      <ul>
        <li><strong>IdeaRegistryUpgradeable</strong>: new author stake flow, funding pool wiring, stricter status transitions, stage-aware completion path.</li>
        <li><strong>FundingPoolUpgradeable</strong>: author stake storage and author-stake treasury flows.</li>
        <li><strong>GrantManagerUpgradeable</strong>: milestone proof submission, reviewer approvals, staged release accounting.</li>
        <li><strong>Frontend ABI layer</strong>: patched ABI surface for new V2 functions and structs.</li>
        <li><strong>Subgraph schema + mappings</strong>: extended for V2 read models.</li>
      </ul>

      <h2>Live numeric rules in V2</h2>
      <ul>
        <li>Idea submission minimum: <strong>5000 BTK</strong></li>
        <li>Initial payout: <strong>30%</strong> after win and author claim</li>
        <li>Stage 1 payout: <strong>40%</strong> after validators confirm real execution progress</li>
        <li>Stage 2 payout: <strong>30%</strong> after validators confirm launch / production readiness</li>
        <li>Stage 1 reviewer threshold: <strong>3 approvals out of 5 reviewers</strong></li>
        <li>Stage 2 reviewer threshold: <strong>2 approvals out of 3 reviewers</strong></li>
        <li>Rejected proof cooldown: <strong>48 hours</strong> before re-submission</li>
      </ul>

      <div class="callout warning">
        <strong>Migration warning:</strong> any integration, docs page, or frontend component that still assumes “winning idea = full grant released immediately” is outdated for BERT V2.
      </div>
    `,
  },
  {
    slug: "architecture",
    group: "Protocol",
    title: "Architecture",
    summary: "Authoritative data paths, cross-contract calls, and why BERT V2 keeps state narrowly owned.",
    content: `
      <h1>BERT V2 Architecture</h1>
      <p class="lead">BERT V2 is a modular proxy-based architecture. Each core contract owns a narrow domain and cross-contract writes are explicit, role-gated, and expected to be auditable.</p>

      <h2>Data authority model</h2>
      <ul>
        <li><strong>Authoritative live state:</strong> direct RPC reads from deployed proxies.</li>
        <li><strong>History, list pages, and analytics:</strong> The Graph projections.</li>
        <li><strong>Policy state:</strong> admin setters, pause state, and role registry wiring.</li>
      </ul>

      <h2>High-level cross-contract graph</h2>
      <ul>
        <li><strong>IdeaRegistry</strong> calls into <strong>FundingPool</strong> for author stake locking on <code>createIdea</code>.</li>
        <li><strong>VotingSystem</strong> calls <strong>FundingPool</strong> for vote stake deposits and updates <strong>IdeaRegistry</strong> statuses.</li>
        <li><strong>GrantManager</strong> reads winner state from <strong>VotingSystem</strong>, reads idea author/status from <strong>IdeaRegistry</strong>, and executes staged payouts from <strong>FundingPool</strong>.</li>
        <li><strong>ReputationSystem</strong> and <strong>VoterProgression</strong> are update targets for outcome-based behavior and role progression.</li>
      </ul>

      <h2>Frontend read model</h2>
      <ol>
        <li>Use direct RPC for current eligibility, allowance, role, stake, and status checks.</li>
        <li>Use subgraph for large historical lists, page-level aggregation, and resilient fallback when older read paths are unavailable.</li>
        <li>Patch ABI layer centrally rather than scattering hand-written fragments across components.</li>
      </ol>

      <pre><code>// Recommended V2 UI strategy
// 1) authoritative eligibility from RPC
const payout = await grantManager.read.getGrantPayout([roundId])
const status = await ideaRegistry.read.getStatus([ideaId])

// 2) page history from subgraph
const votes = await fetchAllVotesByIdeaFromSubgraph(String(ideaId))</code></pre>

      <h2>Why the narrow ownership matters</h2>
      <ul>
        <li>Storage layout changes become easier to reason about per module.</li>
        <li>Incidents can be isolated by pausing only affected write surfaces.</li>
        <li>Frontend teams can map business rules to one clear source of truth per feature.</li>
      </ul>
    `,
  },
  {
    slug: "contract-reference",
    group: "Protocol",
    title: "Contract Reference",
    summary: "V2 business behavior and critical functions for each on-chain module.",
    content: `
      <h1>BERT V2 Contract Reference</h1>
      <p class="lead">This section documents what each contract owns in BERT V2 and which functions matter most for protocol behavior and integrations.</p>

      <h2>RolesRegistryUpgradeable</h2>
      <ul>
        <li>Canonical source of admin, functional, and system roles.</li>
        <li>Used through the RolesAware pattern by most core contracts.</li>
        <li>Critical for upgrade safety, write permissions, and inter-contract trust.</li>
      </ul>

      <h2>IdeaRegistryUpgradeable</h2>
      <ul>
        <li>Stores canonical idea metadata and lifecycle status.</li>
        <li>V2 <code>createIdea(title, description, link, amount)</code> requires BTK stake and FundingPool wiring.</li>
        <li>Exposes <code>authorMinStake()</code> and <code>fundingPool()</code> for V2 clients.</li>
        <li>Supports review and low-quality marking guards while idea is in <code>Voting</code>.</li>
        <li>V2 lifecycle: <code>Pending → Voting → WonVoting/Rejected → Funded → InProcess → Completed</code>.</li>
      </ul>

      <h2>VotingSystemUpgradeable</h2>
      <ul>
        <li>Owns round creation, vote window timing, min stake, and winner selection.</li>
        <li>Maintains <code>currentRoundId</code>, <code>lastUsedIdeaId</code>, and per-round totals.</li>
        <li>Enforces one vote per wallet per round.</li>
        <li>Transitions selected ideas into <code>Voting</code> and finalizes winner on end.</li>
      </ul>

      <h2>FundingPoolUpgradeable</h2>
      <ul>
        <li>Stores vote stake and pool accounting.</li>
        <li>V2 adds <code>authorStakeByIdea(ideaId)</code>.</li>
        <li>Receives author stake through <code>depositAuthorStakeFrom</code> path.</li>
        <li>Can slash losing/invalid author stake to reserve where policy requires it.</li>
        <li>Still owns <code>totalPoolBalance</code>, <code>protocolReserve</code>, distribution records, and reconciliation path <code>syncBalance()</code>.</li>
      </ul>

      <h2>GrantManagerUpgradeable</h2>
      <ul>
        <li>Owns initial author claim and staged milestone releases.</li>
        <li>Exposes V2 read model: <code>getGrantPayout(roundId)</code> and <code>getMilestoneRequest(roundId, stage)</code>.</li>
        <li>Exposes V2 write model: <code>submitMilestoneProof</code> and <code>reviewMilestoneProof</code>.</li>
        <li>Moves idea status from <code>Funded</code> to <code>InProcess</code> and later to <code>Completed</code> through validated execution flow.</li>
      </ul>

      <h2>GovernanceTokenUpgradeable (BTK)</h2>
      <ul>
        <li>BTK is the staking token for idea entry and vote participation.</li>
        <li>Used in wallet balance checks, allowance checks, and pool deposits.</li>
        <li>BTK is <strong>not</strong> the gas token. Gas remains native Sepolia ETH.</li>
      </ul>

      <h2>ReputationSystemUpgradeable</h2>
      <ul>
        <li>Tracks reputation initialization and win/loss effects.</li>
        <li>Legacy and V2 flows both require correct system role wiring for author initialization.</li>
      </ul>

      <h2>VoterProgressionUpgradeable</h2>
      <ul>
        <li>Tracks successful voting on winning ideas.</li>
        <li>Feeds reviewer/curator unlock criteria shown in the frontend.</li>
      </ul>

      <h2>BRTFaucet</h2>
      <ul>
        <li>Provides BTK for testnet onboarding.</li>
        <li>Useful for smoke testing V2 flows from fresh wallets.</li>
      </ul>

      <div class="callout warning">
        <strong>Integration tip:</strong> for BERT V2, clients should always pre-check status, stake, allowance, and reviewer/author role context before attempting writes.
      </div>
    `,
  },
  {
    slug: "idea-creation-v2",
    group: "Protocol",
    title: "Idea Creation in V2",
    summary: "Exact BERT V2 author entry rules, stake path, and failure conditions for createIdea.",
    content: `
      <h1>Idea Creation in BERT V2</h1>
      <p class="lead">Idea creation is no longer metadata-only. In BERT V2, every idea must be backed by a locked BTK stake before it can enter the round pipeline.</p>

      <h2>Current live rule</h2>
      <ul>
        <li><strong>Minimum author stake:</strong> <code>5000 BTK</code></li>
        <li><strong>Entry function:</strong> <code>IdeaRegistry.createIdea(title, description, link, amount)</code></li>
        <li><strong>Initial status:</strong> <code>Pending</code></li>
      </ul>

      <h2>Execution sequence</h2>
      <ol>
        <li>Frontend reads <code>authorMinStake()</code>.</li>
        <li>Wallet checks BTK balance and allowance to FundingPool.</li>
        <li>Author approves BTK spend to FundingPool if needed.</li>
        <li><code>createIdea</code> validates metadata, configured FundingPool, balance, allowance, and minimum amount.</li>
        <li>IdeaRegistry calls FundingPool to lock the author stake for the new idea id.</li>
        <li>Idea is stored with status <code>Pending</code>.</li>
      </ol>

      <h2>Why the stake exists</h2>
      <ul>
        <li>Prevents free spam submissions.</li>
        <li>Aligns idea entry with economic commitment.</li>
        <li>Creates a stronger quality signal before an idea can ever reach a round.</li>
      </ul>

      <h2>Frontend preflight checklist</h2>
      <ul>
        <li>Read <code>IdeaRegistry.authorMinStake()</code>.</li>
        <li>Read <code>IdeaRegistry.fundingPool()</code> and ensure it matches configured FundingPool proxy address.</li>
        <li>Read BTK <code>balanceOf(user)</code>.</li>
        <li>Read BTK <code>allowance(user, fundingPool)</code>.</li>
        <li>Block submit if <code>authorMinStake == 0</code> or FundingPool wiring is broken.</li>
      </ul>

      <h2>Important revert causes</h2>
      <ul>
        <li><code>FundingPoolNotConfigured</code></li>
        <li><code>InsufficientStake</code></li>
        <li><code>InsufficientTokenBalance</code></li>
        <li><code>InsufficientAllowance</code></li>
        <li><code>ExternalCallFailed("FundingPool", "depositAuthorStakeFrom")</code></li>
      </ul>

      <div class="callout info">
        <strong>V2 UX rule:</strong> if the client can detect stake, allowance, or wiring failure before prompting the wallet, it should block early and show a readable reason instead of letting the user sign a revert.
      </div>
    `,
  },
  {
    slug: "voting-round-flow",
    group: "Protocol",
    title: "Voting Round Flow",
    summary: "How pending ideas enter rounds, how BTK voting works, and how winner finalization behaves in V2.",
    content: `
      <h1>Voting Round Flow</h1>
      <p class="lead">Round mechanics remain stake-based in BERT V2, but they now feed a stricter downstream grant execution model.</p>

      <h2>Round creation</h2>
      <ul>
        <li>Anyone can call <code>startVotingRound()</code> when enough pending ideas are available.</li>
        <li>The threshold is controlled by <code>IDEAS_PER_ROUND</code>.</li>
        <li>Ideas selected into the round move from <code>Pending</code> to <code>Voting</code>.</li>
      </ul>

      <h2>Vote mechanics</h2>
      <ul>
        <li>Votes are backed by BTK stake through FundingPool.</li>
        <li><code>minStake</code> is enforced by VotingSystem.</li>
        <li>One wallet can vote only once per round.</li>
        <li>Frontend should check token balance, allowance, min stake, round window, and “hasVoted” before write.</li>
      </ul>

      <h2>Round end</h2>
      <ol>
        <li>Round can be ended once <code>endTime</code> has passed.</li>
        <li>Highest total staked votes wins.</li>
        <li>Winning idea moves to <code>WonVoting</code>.</li>
        <li>Non-winning ideas move to <code>Rejected</code>.</li>
        <li>Progression and reputation hooks can be applied from result state.</li>
      </ol>

      <h2>Why round data still matters in V2</h2>
      <ul>
        <li>The winner of the round is the only idea eligible for staged grant release.</li>
        <li>GrantManager uses round result state to gate initial claim and milestone execution.</li>
        <li>Frontend round pages should explain that “winning the round” no longer means “receive 100% immediately”.</li>
      </ul>
    `,
  },
  {
    slug: "grant-flow-v2",
    group: "Protocol",
    title: "Grant Flow in V2",
    summary: "The exact 30 / 40 / 30 payout rail, milestone proof process, and reviewer thresholds.",
    content: `
      <h1>Grant Flow in BERT V2</h1>
      <p class="lead">This is the most important protocol change in BERT V2. Winning a round no longer triggers a blind full treasury release. Payout now follows a validated milestone rail.</p>

      <h2>Release rail</h2>
      <table>
        <thead>
          <tr><th>Stage</th><th>Release</th><th>Condition</th></tr>
        </thead>
        <tbody>
          <tr><td>Initial claim</td><td><strong>30%</strong></td><td>Winning author claims after round settlement</td></tr>
          <tr><td>Checkpoint one</td><td><strong>40%</strong></td><td>Validators confirm build is actively in progress</td></tr>
          <tr><td>Final checkpoint</td><td><strong>30%</strong></td><td>Validators confirm project is launched / working</td></tr>
        </tbody>
      </table>

      <h2>State progression behind the payouts</h2>
      <ul>
        <li><code>WonVoting</code> → initial claim → <code>Funded</code></li>
        <li>After stage 1 proof approval → <code>InProcess</code></li>
        <li>After stage 2 proof approval → <code>Completed</code></li>
      </ul>

      <h2>Milestone proof mechanics</h2>
      <ul>
        <li>Author submits proof through <code>submitMilestoneProof(roundId, stage, metadataURI, details)</code>.</li>
        <li>Reviewers evaluate through <code>reviewMilestoneProof(roundId, stage, approved)</code>.</li>
        <li>Frontend can read live milestone state through <code>getMilestoneRequest</code>.</li>
      </ul>

      <h2>Current reviewer thresholds</h2>
      <ul>
        <li><strong>Stage 1:</strong> 3 approvals out of 5 reviewers</li>
        <li><strong>Stage 2:</strong> 2 approvals out of 3 reviewers</li>
      </ul>

      <h2>Important restrictions</h2>
      <ul>
        <li>The idea author cannot review their own proof.</li>
        <li>Only reviewer role wallets can approve or reject proof.</li>
        <li>If proof is rejected, the author must wait through cooldown before re-submitting.</li>
        <li>No milestone UI should appear for non-winning ideas.</li>
      </ul>

      <h2>Frontend presentation rules</h2>
      <ul>
        <li>Round page should present claim of the first <code>30%</code>.</li>
        <li>Winning idea page should present milestone proof submission and review state.</li>
        <li>Profile and stats pages should surface locked stake, grants in progress, and payout stage state.</li>
      </ul>

      <div class="callout danger">
        <strong>Do not document V2 as “grant released after win”.</strong> That sentence is wrong now. The only immediate release after win is the first <strong>30%</strong>, and even that still requires the author claim path.
      </div>
    `,
  },
  {
    slug: "upgrade-safety",
    group: "Deployment",
    title: "Upgrade Safety & Storage Notes",
    summary: "What changed in the V2 contract upgrades, where storage collisions happened, and how they were fixed.",
    content: `
      <h1>Upgrade Safety & Storage Notes</h1>
      <p class="lead">BERT V2 runs on upgradeable proxies. That makes storage layout correctness a protocol-level requirement, not an implementation detail.</p>

      <h2>Why this matters</h2>
      <ul>
        <li>Adding fields in the wrong place in a proxy-backed contract can reinterpret old storage and corrupt live behavior.</li>
        <li>The most dangerous cases are mappings, counters, arrays, and newly inserted state variables before old slots.</li>
      </ul>

      <h2>Actual V2 issues that had to be fixed</h2>
      <ul>
        <li><strong>IdeaRegistryUpgradeable:</strong> new V2 fields were initially inserted before legacy storage. That caused proxy slot reinterpretation, broke <code>totalIdeas()</code>, and made <code>fundingPool()</code> read invalid state.</li>
        <li><strong>FundingPoolUpgradeable:</strong> new author-stake storage was initially inserted before legacy mappings/arrays, creating a storage collision risk for round balances and distribution history.</li>
      </ul>

      <h2>How the fix was done</h2>
      <ul>
        <li>Restore the original legacy storage order exactly.</li>
        <li>Append new V2 state variables only at the tail.</li>
        <li>Reduce storage gap instead of inserting fields in the middle.</li>
        <li>Use a versioned initializer such as <code>initializeV2(...)</code> for new V2 fields on existing proxies.</li>
      </ul>

      <h2>IdeaRegistry V2 post-upgrade checks</h2>
      <ol>
        <li><code>fundingPool()</code> returns live FundingPool proxy address</li>
        <li><code>authorMinStake()</code> returns <code>5000e18</code></li>
        <li><code>totalIdeas()</code> returns correct live count</li>
        <li><code>getIdea(1)</code> reads historical idea correctly</li>
      </ol>

      <h2>FundingPool V2 post-upgrade checks</h2>
      <ol>
        <li><code>totalPoolBalance()</code> matches expected live pool balance</li>
        <li><code>protocolReserve()</code> is sane</li>
        <li><code>getDistributionCount()</code> still reads old distribution history</li>
        <li><code>authorStakeByIdea()</code> works for newly created V2 ideas</li>
      </ol>

      <h2>Required upgrade testing discipline</h2>
      <ul>
        <li>Keep legacy mock implementations in tests.</li>
        <li>Run “upgrade from old layout, preserve old state, continue new writes” tests for every storage-changing release.</li>
        <li>Do not rely only on fresh deployment tests.</li>
      </ul>

      <div class="callout warning">
        <strong>Rule:</strong> if a V2 release changes state variables in a proxy-backed contract, treat upgrade safety as a blocker. No docs, frontend, or deployment task is complete until upgrade preservation is tested.
      </div>
    `,
  },
  {
    slug: "v2-migration-checklist",
    group: "Deployment",
    title: "BERT V2 Migration Checklist",
    summary: "Step-by-step checklist for upgrading contracts, frontend, subgraph, and docs into a coherent V2 deployment.",
    content: `
      <h1>BERT V2 Migration Checklist</h1>
      <p class="lead">Use this checklist when moving a BERT environment from the older flow into the live BERT V2 mechanics. This page is intentionally operational and should be treated like a release runbook.</p>

      <h2>1. Contract preparation</h2>
      <ul>
        <li>Validate storage layout changes for every upgraded proxy-backed contract.</li>
        <li>Keep legacy mock implementations for upgrade-preservation tests.</li>
        <li>Run upgrade tests that prove old state survives and new V2 writes still work.</li>
      </ul>

      <h2>2. Proxy upgrade execution</h2>
      <ol>
        <li>Upgrade <code>FundingPoolUpgradeable</code> with storage-safe V2 implementation.</li>
        <li>Upgrade <code>IdeaRegistryUpgradeable</code> with storage-safe V2 implementation.</li>
        <li>Run post-upgrade initializer call for IdeaRegistry: <code>initializeV2(fundingPool, 5000e18)</code>.</li>
        <li>Verify proxy implementation addresses and tx hashes are recorded.</li>
      </ol>

      <h2>3. Live on-chain verification</h2>
      <ul>
        <li><code>IdeaRegistry.fundingPool()</code> matches live FundingPool proxy.</li>
        <li><code>IdeaRegistry.authorMinStake()</code> returns <code>5000e18</code>.</li>
        <li><code>IdeaRegistry.totalIdeas()</code> reads historical ideas correctly.</li>
        <li><code>FundingPool.totalPoolBalance()</code> and <code>getDistributionCount()</code> remain sane.</li>
      </ul>

      <h2>4. Frontend migration</h2>
      <ul>
        <li>Update ABI layer for V2 functions and structs.</li>
        <li>Add preflight checks for allowance, minimum author stake, grant eligibility, and milestone stages.</li>
        <li>Update public copy so it never claims “full grant immediately after win”.</li>
        <li>Pin chain selection and RPC defaults to the correct deployment network.</li>
      </ul>

      <h2>5. Subgraph migration</h2>
      <ul>
        <li>Refresh ABIs in subgraph config.</li>
        <li>Regenerate types and mappings together.</li>
        <li>Update start blocks if contract deployments changed.</li>
        <li>Rebuild and redeploy the Studio subgraph version used by the frontend.</li>
      </ul>

      <h2>6. Docs migration</h2>
      <ul>
        <li>Replace all old grant-flow descriptions with the V2 staged payout rail.</li>
        <li>Document storage collision lessons and post-upgrade verification checks.</li>
        <li>Update environment addresses and operational runbooks.</li>
      </ul>

      <h2>7. Final smoke pass</h2>
      <ol>
        <li>Claim faucet BTK / confirm wallet setup</li>
        <li>Create idea with <code>5000 BTK</code></li>
        <li>Vote in active round</li>
        <li>End round when eligible</li>
        <li>Claim initial <code>30%</code> from winner wallet</li>
        <li>Submit milestone proof</li>
        <li>Review proof from reviewer wallet</li>
      </ol>

      <div class="callout info">
        <strong>Release discipline:</strong> BERT V2 migration is only complete when contracts, frontend, subgraph, and docs all describe the same mechanics and addresses.
      </div>
    `,
  },
  {
    slug: "sepolia-addresses",
    group: "Deployment",
    title: "Sepolia Addresses",
    summary: "Current BERT V2 proxy addresses and integration endpoints for the live Sepolia stack.",
    content: `
      <h1>BERT V2 Sepolia Addresses</h1>
      <p class="lead">This page is the canonical BERT V2 environment snapshot for the current Sepolia deployment used by the frontend and docs.</p>

      <h2>Core proxies</h2>
      <table>
        <thead>
          <tr><th>Contract</th><th>Address</th></tr>
        </thead>
        <tbody>
          <tr><td>RolesRegistryUpgradeable</td><td><code>0xD0BD6093bC008326E522b39eC79c350c44A99db1</code></td></tr>
          <tr><td>ReputationSystemUpgradeable</td><td><code>0x51d08e9871e06763E7f34BCea4D359DC217DC6A5</code></td></tr>
          <tr><td>VoterProgressionUpgradeable</td><td><code>0x4f654ED420Bd2F8EB01060f48b9bE8fAb787c94f</code></td></tr>
          <tr><td>IdeaRegistryUpgradeable</td><td><code>0xFf4F0AEeCe93847d68E0FF169142E64f613850BE</code></td></tr>
          <tr><td>GovernanceTokenUpgradeable (BTK)</td><td><code>0x89F0645551D669aa8813b245266E8c09Bbe0F9c2</code></td></tr>
          <tr><td>FundingPoolUpgradeable</td><td><code>0x822e853dB65B288FE01Ca76Ed6e8B4895070F32D</code></td></tr>
          <tr><td>VotingSystemUpgradeable</td><td><code>0x34B611EFEc9ce93d5443Bfcf1fc7D10640cfb943</code></td></tr>
          <tr><td>GrantManagerUpgradeable</td><td><code>0x0efEF5542f41e705cdf402070268C42473281FEA</code></td></tr>
          <tr><td>BRTFaucet</td><td><code>0xbb28E64127fAa14C77A5021e6a5D307B89a39c70</code></td></tr>
        </tbody>
      </table>

      <h2>Important live V2 checks</h2>
      <ul>
        <li><code>IdeaRegistry.fundingPool()</code> should resolve to <code>0x822e853dB65B288FE01Ca76Ed6e8B4895070F32D</code></li>
        <li><code>IdeaRegistry.authorMinStake()</code> should resolve to <code>5000000000000000000000</code></li>
        <li><code>FundingPool.totalPoolBalance()</code> should be read from live RPC, not guessed from subgraph alone</li>
      </ul>

      <h2>Network and endpoints</h2>
      <ul>
        <li>Network: <strong>Sepolia</strong> (chainId <code>11155111</code>)</li>
        <li>Frontend should use a Sepolia RPC and must not fall back to localhost by accident.</li>
        <li>Subgraph endpoint should match the currently deployed Studio version used by the frontend env.</li>
      </ul>

      <h2>Verification checklist</h2>
      <ol>
        <li>Wallet network is Sepolia.</li>
        <li>Frontend <code>.env</code> matches the addresses above.</li>
        <li>BTK imported in wallet with correct decimals.</li>
        <li>Smoke flow succeeds: faucet claim → approve → create idea → vote → read round → read profile.</li>
      </ol>
    `,
  },
  {
    slug: "admin-operations",
    group: "Operations",
    title: "Admin Operations",
    summary: "V2 runbook for setters, pause controls, upgrades, and post-upgrade verification.",
    content: `
      <h1>Admin Operations for BERT V2</h1>
      <p class="lead">Admin control in BERT V2 is more sensitive than before because idea entry stake, milestone payout, and storage-safe upgrades all depend on correct wiring and disciplined operations.</p>

      <h2>Highest-priority operator responsibilities</h2>
      <ol>
        <li>Protect proxy admin / admin signers.</li>
        <li>Verify role registry wiring before enabling new flows.</li>
        <li>Keep pause state explicit and documented.</li>
        <li>Treat every upgrade as a storage and wiring event, not only an implementation swap.</li>
      </ol>

      <h2>Critical V2 setter surface</h2>
      <ul>
        <li><code>IdeaRegistry.setFundingPool</code></li>
        <li><code>IdeaRegistry.setAuthorMinStake</code></li>
        <li><code>VotingSystem.setVotingDuration</code></li>
        <li><code>VotingSystem.setMinStake</code></li>
        <li><code>VotingSystem.setIdeaPerRound</code></li>
        <li><code>GrantManager.setAuthorShare</code></li>
        <li><code>FundingPool.syncBalance</code></li>
        <li><code>BRTFaucet.setClaimAmount</code> and <code>BRTFaucet.setCooldown</code></li>
      </ul>

      <h2>V2 upgrade runbook</h2>
      <pre><code>1. Confirm ProxyAdmin owner signer
2. Verify new implementation storage layout
3. Deploy implementation
4. Run upgrade or upgradeAndCall
5. For IdeaRegistry V2, call initializeV2(fundingPool, 5000e18)
6. Re-check live reads
7. Run frontend smoke flow
8. Publish updated addresses and release notes</code></pre>

      <h2>Post-upgrade live checks</h2>
      <ul>
        <li>Can frontend read totals, ideas, rounds, and profile values?</li>
        <li>Does create-idea flow pass stake and allowance preflight?</li>
        <li>Do round pages and winning idea pages expose the right V2 grant actions?</li>
        <li>Do subgraph pages still align with live RPC state?</li>
      </ul>

      <div class="callout warning">
        Never batch a proxy upgrade, role rewiring, and unrelated parameter changes into one opaque admin session. Keep admin actions atomic so rollback and audit stay realistic.
      </div>
    `,
  },
  {
    slug: "frontend-integration",
    group: "Integration",
    title: "Frontend Integration",
    summary: "How the BERT V2 frontend should read, preflight, and write against live contracts.",
    content: `
      <h1>Frontend Integration for BERT V2</h1>
      <p class="lead">BERT V2 frontend behavior should be deterministic: read current truth from RPC, use subgraph for history, and block invalid writes before the wallet prompt whenever possible.</p>

      <h2>Required environment alignment</h2>
      <ul>
        <li>Wallet network</li>
        <li>Wagmi default chain</li>
        <li>RPC transport URL</li>
        <li>Frontend contract addresses</li>
        <li>Subgraph endpoint</li>
      </ul>

      <h2>Critical V2 client preflight rules</h2>
      <ul>
        <li><strong>Create idea:</strong> check min stake, balance, allowance, FundingPool wiring.</li>
        <li><strong>Vote:</strong> check round status, min stake, allowance, balance, hasVoted, own-idea restriction.</li>
        <li><strong>Claim 30%:</strong> check round ended, winner exists, wallet is winner author, grant is claimable.</li>
        <li><strong>Submit milestone proof:</strong> check wallet is author and the correct previous payout state is complete.</li>
        <li><strong>Review proof:</strong> check reviewer role, active request, and “not author” constraint.</li>
      </ul>

      <h2>RPC-first / subgraph-second rule</h2>
      <table>
        <thead><tr><th>Use case</th><th>Preferred source</th></tr></thead>
        <tbody>
          <tr><td>Current eligibility / role / status / allowance</td><td>Direct RPC</td></tr>
          <tr><td>Lists of ideas, votes, rounds, historical reviews</td><td>Subgraph</td></tr>
          <tr><td>Write gating</td><td>Direct RPC only</td></tr>
          <tr><td>Analytics cards</td><td>Subgraph or mixed</td></tr>
        </tbody>
      </table>

      <h2>Known V2 frontend responsibilities</h2>
      <ul>
        <li>Map common contract errors into readable UX messages.</li>
        <li>Pin reads to the correct protocol chain when env says Sepolia.</li>
        <li>Fall back to subgraph for list pages when older or broken direct read paths are unsafe.</li>
        <li>Present V2 copy accurately: not “full grant on win”, but “30 / 40 / 30 release rail”.</li>
      </ul>

      <pre><code>// Example: safe chain support check
const isSupported = chain
  ? supportedChains.some((supportedChain) => supportedChain.id === chain.id)
  : false</code></pre>
    `,
  },
  {
    slug: "subgraph",
    group: "Integration",
    title: "The Graph Integration",
    summary: "How the docs, frontend, and V2 operations should treat subgraph data versus direct on-chain reads.",
    content: `
      <h1>The Graph Integration for BERT V2</h1>
      <p class="lead">The subgraph is essential for scalable lists and history, but it is not the authority for write gating. In BERT V2, eligibility checks must remain on RPC.</p>

      <h2>What the subgraph is best at</h2>
      <ul>
        <li>Idea lists</li>
        <li>Vote history</li>
        <li>Round pages with many historical rows</li>
        <li>Profile timelines</li>
        <li>Homepage and protocol analytics widgets</li>
      </ul>

      <h2>What should stay on direct RPC</h2>
      <ul>
        <li><code>authorMinStake()</code></li>
        <li><code>fundingPool()</code> wiring</li>
        <li>Allowance and token balance checks</li>
        <li>Claim eligibility</li>
        <li>Live milestone request state before write</li>
      </ul>

      <h2>V2 subgraph deployment discipline</h2>
      <ul>
        <li>ABI set must match the upgraded live contracts.</li>
        <li><code>startBlock</code> values should be updated when deployments move.</li>
        <li>Generated types and mappings should be regenerated together, not partially.</li>
      </ul>

      <h2>Frontend fallback rule</h2>
      <p>If a non-critical direct read path is broken or too expensive for large history pages, fall back to subgraph for rendering, but never let the subgraph alone decide whether a write is allowed.</p>
    `,
  },
  {
    slug: "sepolia-user-guide",
    group: "User Guides",
    title: "Sepolia User Guide",
    summary: "What users need for gas, BTK setup, approvals, and the full BERT V2 test flow.",
    content: `
      <h1>Sepolia User Guide for BERT V2</h1>
      <p class="lead">This guide is for testers and early users interacting with the live BERT V2 deployment on Sepolia.</p>

      <h2>Gas token vs protocol token</h2>
      <ul>
        <li><strong>Sepolia ETH</strong> pays gas.</li>
        <li><strong>BTK</strong> is used for idea entry stake and voting stake.</li>
      </ul>

      <h2>Basic V2 user journey</h2>
      <ol>
        <li>Get Sepolia ETH for gas.</li>
        <li>Claim or obtain BTK.</li>
        <li>Approve BTK when prompted.</li>
        <li>Create idea with <code>5000 BTK</code> minimum if testing author flow.</li>
        <li>Vote in active rounds with BTK stake.</li>
        <li>If your idea wins, claim first <code>30%</code>.</li>
        <li>Submit milestone proof for the next payout stages.</li>
      </ol>

      <h2>Common user confusion points</h2>
      <ul>
        <li><strong>“Why did MetaMask open but tx reverted?”</strong> Usually stake, allowance, or role preconditions were not met.</li>
        <li><strong>“Why can’t I create an idea?”</strong> Most often because BTK balance or FundingPool allowance is below <code>5000 BTK</code>.</li>
        <li><strong>“Why didn’t I get the full grant after win?”</strong> Because BERT V2 uses staged milestone payouts, not immediate 100% release.</li>
      </ul>
    `,
  },
  {
    slug: "faq",
    group: "Reference",
    title: "V2 FAQ",
    summary: "Concise answers to the recurring technical and product questions around BERT V2.",
    content: `
      <h1>BERT V2 FAQ</h1>

      <h2>Why does createIdea now require BTK?</h2>
      <p>BERT V2 adds an author stake requirement to reduce spam and force real commitment before an idea enters the round pipeline.</p>

      <h2>What is the current minimum for idea creation?</h2>
      <p>The live V2 configuration is <strong>5000 BTK</strong>.</p>

      <h2>Does winning a round still release the full grant immediately?</h2>
      <p>No. In BERT V2 the release rail is <strong>30% / 40% / 30%</strong>, with validator checkpoints between stages.</p>

      <h2>Who can approve milestone proofs?</h2>
      <p>Only wallets with reviewer role, and the idea author cannot review their own proof.</p>

      <h2>Why can a page show subgraph data even if one contract read path was previously broken?</h2>
      <p>Because list/history rendering can fall back to subgraph, while authoritative write gating and live checks still depend on RPC.</p>

      <h2>Why are storage-layout docs part of protocol docs?</h2>
      <p>Because BERT V2 runs behind upgradeable proxies. Storage layout mistakes are protocol failures, not only developer mistakes.</p>
    `,
  },
  {
    slug: "release-notes-template",
    group: "Reference",
    title: "BERT V2 Release Notes Template",
    summary: "Template for documenting future V2.x protocol, frontend, and subgraph releases.",
    content: `
      <h1>BERT V2 Release Notes Template</h1>
      <p class="lead">Use this template for every V2.x release that touches contracts, addresses, env manifests, subgraph, or frontend write paths.</p>

      <pre><code># BERT V2.x Release - YYYY-MM-DD

## Scope
- Contracts:
- Frontend:
- Subgraph:
- Docs:

## Changed modules
- IdeaRegistry:
- FundingPool:
- GrantManager:
- VotingSystem:
- Other:

## Storage layout impact
- None / appended fields / reinitializer used / tests updated

## Deployment changes
- New implementation addresses:
- Proxies touched:
- Post-upgrade calls:

## Frontend changes
- New ABI functions:
- New env vars:
- New preflight checks:

## Verification
- Role wiring:
- Pause state:
- Direct RPC reads:
- Subgraph sync:
- Smoke flows:

## Rollback plan
- Trigger conditions:
- Revert strategy:
- Owner / operator:
</code></pre>
    `,
  },
];
