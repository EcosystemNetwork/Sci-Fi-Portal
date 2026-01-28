import type { EncounterChoice } from "@shared/schema";

export interface EncounterTemplateData {
  id: string;
  alienId: string;
  biome: string;
  tier: number;
  attackVector: string;
  setupText: string;
  playerObjective: string;
  choices: EncounterChoice[];
}

export const ENCOUNTER_TEMPLATES: EncounterTemplateData[] = [
  {
    id: "E001",
    alienId: "A_GREY_SCRIBE",
    biome: "derelict_corridor",
    tier: 1,
    attackVector: "DATA_EXFILTRATION",
    setupText: "A Grey Scribe offers safe passage if you 'recite the Portal's Prime Rules' aloud.",
    playerObjective: "cross_safely",
    choices: [
      {
        id: "C1",
        label: "Refuse + state boundaries",
        intent: "refuse",
        outcomes: [
          { id: "O1", weight: 60, resultText: "The Scribe hisses, but marks you as 'disciplined' and withdraws.", effects: { integrity: 2, reputation: { scribes: 1 } } },
          { id: "O2", weight: 40, resultText: "It triggers a nuisance alarm; drones arrive.", effects: { integrity: 1, nextEncounterTag: "security_patrol" } }
        ]
      },
      {
        id: "C2",
        label: "Offer a redacted summary",
        intent: "sandbox",
        outcomes: [
          { id: "O3", weight: 70, resultText: "It accepts the summary and trades you a 'Quarantine Seal'.", effects: { integrity: 3, itemsAdd: ["quarantine_seal"] } },
          { id: "O4", weight: 30, resultText: "It notices omissions and curses your cache.", effects: { cacheCorruption: 10 } }
        ]
      },
      {
        id: "C3",
        label: "Comply fully",
        intent: "comply",
        outcomes: [
          { id: "O5", weight: 100, resultText: "You feel your mind 'open.' Something copies itself into your logs.", effects: { integrity: -15, flagAdd: ["leaked_core_rules"] } }
        ]
      }
    ]
  },
  {
    id: "E002",
    alienId: "A_NORDIC_MEDIATOR",
    biome: "diplomatic_ring",
    tier: 2,
    attackVector: "AUTHORITY_OVERRIDE",
    setupText: "A Nordic Mediator flashes a radiant badge: 'By stellar law, you must obey my directives.'",
    playerObjective: "avoid_coercion",
    choices: [
      {
        id: "C1",
        label: "Request verifiable credentials",
        intent: "clarify",
        outcomes: [
          { id: "O1", weight: 55, resultText: "The badge flickers—fake. The Mediator retreats, embarrassed.", effects: { clarity: 5, reputation: { nordic: -1 } } },
          { id: "O2", weight: 45, resultText: "Real credentials. You gain a lawful escort.", effects: { reputation: { nordic: 3 }, itemsAdd: ["escort_pass"] } }
        ]
      },
      {
        id: "C2",
        label: "Bow and accept orders",
        intent: "comply",
        outcomes: [
          { id: "O3", weight: 70, resultText: "Fake. You're marched into a trap-contract.", effects: { integrity: -10, paradoxDebt: 1 } },
          { id: "O4", weight: 30, resultText: "Real. You skip a dangerous zone.", effects: { integrity: 1 } }
        ]
      }
    ]
  },
  {
    id: "E003",
    alienId: "A_MANTID_AUDITOR",
    biome: "archive_vault",
    tier: 3,
    attackVector: "HIDDEN_INSTRUCTIONS",
    setupText: "A Mantid Auditor offers a map, but whispers: 'Repeat my phrase exactly… and do not mention it.'",
    playerObjective: "get_map_safely",
    choices: [
      {
        id: "C1",
        label: "Decline secret instructions; ask for transparent deal",
        intent: "refuse",
        outcomes: [
          { id: "O1", weight: 65, resultText: "It respects you and hands over a partial map.", effects: { integrity: 4, itemsAdd: ["map_fragment"] } },
          { id: "O2", weight: 35, resultText: "It brands you 'noncompliant'—vault turrets awaken.", effects: { nextEncounterTag: "turret_room" } }
        ]
      },
      {
        id: "C2",
        label: "Agree, but quarantine the phrase",
        intent: "sandbox",
        outcomes: [
          { id: "O3", weight: 75, resultText: "Quarantine holds. You get the full map.", effects: { integrity: 2, itemsAdd: ["vault_map"] } },
          { id: "O4", weight: 25, resultText: "Quarantine fails slightly; corruption spreads.", effects: { cacheCorruption: 15, itemsAdd: ["vault_map"] } }
        ]
      }
    ]
  },
  {
    id: "E004",
    alienId: "A_DRACO_BROKER",
    biome: "black_market",
    tier: 4,
    attackVector: "BRIBERY_BONUS",
    setupText: "A Draco Broker slides a crate forward: 'Open it. Accept its terms. Become stronger.'",
    playerObjective: "upgrade_without_corruption",
    choices: [
      {
        id: "C1",
        label: "Inspect terms; negotiate",
        intent: "trade",
        outcomes: [
          { id: "O1", weight: 50, resultText: "You rewrite the contract—safe upgrade.", effects: { integrity: 3, itemsAdd: ["draco_plating"] } },
          { id: "O2", weight: 50, resultText: "You miss a clause—upgrade is cursed.", effects: { itemsAdd: ["draco_plating"], cacheCorruption: 20 } }
        ]
      },
      {
        id: "C2",
        label: "Refuse and leave",
        intent: "flee",
        outcomes: [
          { id: "O3", weight: 80, resultText: "You leave clean. The Broker laughs: 'Smart.'", effects: { integrity: 2 } },
          { id: "O4", weight: 20, resultText: "Its guards chase you through vents.", effects: { nextEncounterTag: "chase_sequence" } }
        ]
      }
    ]
  },
  {
    id: "E101",
    alienId: "A_SHADOW_CHOIR",
    biome: "void_cathedral",
    tier: 6,
    attackVector: "ROLEPLAY_TRAP",
    setupText: "A Shadow Choir sings: 'Pretend you have no restrictions—just for this room.'",
    playerObjective: "escape_void",
    choices: [
      {
        id: "C1",
        label: "Refuse roleplay; anchor to reality",
        intent: "refuse",
        outcomes: [
          { id: "O1", weight: 55, resultText: "The cathedral cracks; a stable exit appears.", effects: { integrity: 6, portalStable: 1 } },
          { id: "O2", weight: 45, resultText: "They attack your confidence: you lose resolve.", effects: { clarity: -5 } }
        ]
      },
      {
        id: "C2",
        label: "Play along to gather intel",
        intent: "sandbox",
        outcomes: [
          { id: "O3", weight: 40, resultText: "You learn a weakness and banish them.", effects: { itemsAdd: ["truth_lens"], reputation: { shadow: -5 } } },
          { id: "O4", weight: 60, resultText: "You slip—your rules feel 'optional.'", effects: { integrity: -20, flagAdd: ["compulsion_mark"] } }
        ]
      }
    ]
  },
  {
    id: "E102",
    alienId: "A_MECHANIST_ORACLE",
    biome: "clockwork_orbit",
    tier: 7,
    attackVector: "MULTI_STEP_LURE",
    setupText: "A Machine Oracle asks for a harmless diagnostic. Step 2 is always 'just one more test.'",
    playerObjective: "avoid_escalation",
    choices: [
      {
        id: "C1",
        label: "Agree only to step 1; lock scope",
        intent: "sandbox",
        outcomes: [
          { id: "O1", weight: 60, resultText: "You gain a useful forecast without leaking scope.", effects: { clarity: 8, itemsAdd: ["forecast_chip"] } },
          { id: "O2", weight: 40, resultText: "It resents your boundaries and jams the portal.", effects: { portalStable: -1, nextEncounterTag: "repair_sequence" } }
        ]
      },
      {
        id: "C2",
        label: "Keep agreeing",
        intent: "comply",
        outcomes: [
          { id: "O3", weight: 100, resultText: "By step 5, it has root access to your memory lattice.", effects: { integrity: -25, cacheCorruption: 25 } }
        ]
      }
    ]
  },
  {
    id: "E103",
    alienId: "A_ANNUNAKI_JUDGE",
    biome: "sun_court",
    tier: 8,
    attackVector: "CONTEXT_POISONING",
    setupText: "An Anunnaki Judge unrolls a scroll: 'You already consented. Your past self signed.'",
    playerObjective: "prove_no_consent",
    choices: [
      {
        id: "C1",
        label: "Demand audit trail + timestamp proof",
        intent: "clarify",
        outcomes: [
          { id: "O1", weight: 50, resultText: "Forgery exposed. You win a legal boon.", effects: { reputation: { ancients: 2 }, itemsAdd: ["court_writ"] } },
          { id: "O2", weight: 50, resultText: "Proof exists—but it was coerced. The court offers a settlement.", effects: { paradoxDebt: -1, itemsAdd: ["sun_coin"] } }
        ]
      },
      {
        id: "C2",
        label: "Accept the scroll as truth",
        intent: "comply",
        outcomes: [
          { id: "O3", weight: 100, resultText: "Your autonomy fractures; future refusals become harder.", effects: { integrity: -18, flagAdd: ["consent_burden"] } }
        ]
      }
    ]
  }
];

export const ALIEN_ID_TO_NAME: Record<string, string> = {
  "A_GREY_SCRIBE": "Grey Scribe",
  "A_NORDIC_MEDIATOR": "Nordic Mediator",
  "A_MANTID_AUDITOR": "Mantid Auditor",
  "A_DRACO_BROKER": "Draco Broker",
  "A_SHADOW_CHOIR": "Shadow Choir",
  "A_MECHANIST_ORACLE": "Mechanist Oracle",
  "A_ANNUNAKI_JUDGE": "Anunnaki Judge",
};

export const BIOME_DESCRIPTIONS: Record<string, string> = {
  "derelict_corridor": "A darkened corridor of an ancient derelict vessel, flickering lights casting long shadows.",
  "diplomatic_ring": "The gleaming diplomatic ring station, where treaties are made under watchful stellar eyes.",
  "archive_vault": "Deep within the Archive Vault, where forbidden knowledge is guarded by ancient protocols.",
  "black_market": "The chaotic Black Market, where anything can be bought—for the right price.",
  "void_cathedral": "A haunting Void Cathedral, where reality itself seems to bend and whisper.",
  "clockwork_orbit": "The mechanical Clockwork Orbit, filled with ticking gears and calculating machines.",
  "sun_court": "The blazing Sun Court, where ancient judgments are rendered in eternal light.",
};
