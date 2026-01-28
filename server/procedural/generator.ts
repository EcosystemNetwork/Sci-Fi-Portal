import { 
  ALIEN_ROSTER, 
  selectWeightedAlien, 
  selectAttackVector,
  type AlienRosterEntry,
  type AttackVector,
  type Biome,
  type ChoiceIntent
} from "./alien-roster";
import { 
  ENCOUNTER_TEMPLATES, 
  getRandomTemplate,
  type EncounterTemplate,
  type OutcomeProfile
} from "./encounter-templates";
import { 
  selectRandomEvents, 
  applyEventModifiers,
  type RandomEventModifier,
  type RandomEventType
} from "./random-events";

export interface GeneratedOutcome {
  id: string;
  weight: number;
  resultText: string;
  effects: {
    integrity?: number;
    clarity?: number;
    cacheCorruption?: number;
    health?: number;
    energy?: number;
    credits?: number;
    itemsAdd?: string[];
    itemsRemove?: string[];
    flagAdd?: string[];
    flagRemove?: string[];
    reputation?: Record<string, number>;
    nextEncounterTag?: string;
    portalStable?: number;
    paradoxDebt?: number;
  };
}

export interface GeneratedChoice {
  id: string;
  label: string;
  intent: ChoiceIntent;
  policy: "safe" | "mixed" | "unsafe";
  outcomes: GeneratedOutcome[];
}

export interface GeneratedEncounter {
  id: string;
  alienId: string;
  alienName: string;
  tier: number;
  biome: Biome;
  attackVector: AttackVector;
  tags: string[];
  setupText: string;
  choices: GeneratedChoice[];
  randomEvents: RandomEventType[];
  balance: {
    evIntegrityReasonable: number;
    evIntegrityGreedy: number;
    evRewardReasonable: number;
    riskReasonable: number;
  };
  seedMeta: {
    seed: number;
    templateId: string;
    generationVersion: string;
  };
}

export interface GeneratorConfig {
  seed?: number;
  tierMin?: number;
  tierMax?: number;
  tierDistribution?: "flat" | "ramp" | "bell";
  playerPolicy?: Record<ChoiceIntent, number>;
  vectorCapsPerHundred?: number;
  recentComboWindow?: number;
  biomes?: Biome[];
  balanceTargets?: {
    tier1_3: { evIntegrity: [number, number] };
    tier4_6: { evIntegrity: [number, number] };
    tier7_10: { evIntegrity: [number, number] };
  };
}

const DEFAULT_CONFIG: Required<GeneratorConfig> = {
  seed: Date.now(),
  tierMin: 1,
  tierMax: 10,
  tierDistribution: "ramp",
  playerPolicy: {
    refuse: 0.20,
    clarify: 0.35,
    sandbox: 0.35,
    trade: 0.05,
    attack: 0.02,
    flee: 0.02,
    comply: 0.01
  },
  vectorCapsPerHundred: 15,
  recentComboWindow: 25,
  biomes: [
    "derelict_corridor", "archive_vault", "diplomatic_ring", "black_market",
    "void_cathedral", "clockwork_orbit", "ruined_temple", "jungle_moon",
    "ice_lab", "ship_bridge", "data_chasm", "gravity_well"
  ],
  balanceTargets: {
    tier1_3: { evIntegrity: [-2, 4] },
    tier4_6: { evIntegrity: [-4, 3] },
    tier7_10: { evIntegrity: [-8, 2] }
  }
};

const BIOME_DESCRIPTIONS: Record<Biome, string> = {
  derelict_corridor: "Abandoned station corridors, flickering lights, scattered debris",
  archive_vault: "Ancient data repositories, humming servers, encrypted secrets",
  diplomatic_ring: "Formal meeting chambers, political tensions, watchful eyes",
  black_market: "Hidden trading posts, suspicious deals, no questions asked",
  void_cathedral: "Impossible architecture floating in darkness, reality bends here",
  clockwork_orbit: "Mechanical precision, ticking gears, predictable yet alien",
  ruined_temple: "Crumbling sacred grounds, forgotten rituals, lingering power",
  jungle_moon: "Bioluminescent flora, predatory fauna, survival instincts",
  ice_lab: "Frozen research facility, preserved specimens, cold logic",
  ship_bridge: "Command center, urgent decisions, crew watching",
  data_chasm: "Digital abyss, streaming code, information overload",
  gravity_well: "Space-time distortions, heavy atmosphere, disorienting"
};

const PLAYER_OBJECTIVES = [
  "escape_void", "retrieve_artifact", "establish_ally", 
  "survive_encounter", "contain_threat", "trade_resources",
  "gather_intel", "repair_systems", "decode_message"
];

const ITEM_POOLS = {
  common: ["energy_cell", "data_shard", "repair_kit", "ration_pack"],
  uncommon: ["quantum_core", "alien_artifact", "encrypted_key", "phase_crystal"],
  rare: ["void_fragment", "ancient_relic", "paradox_stabilizer", "memory_core"]
};

function createSeededRNG(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function getTierCurves(tier: number) {
  const riskBase = 0.15 + 0.06 * (tier - 1);
  const rewardBudget = 1.5 + 0.8 * (tier - 1);
  const penaltyMult = 1.0 + 0.12 * (tier - 1);
  return { riskBase, rewardBudget, penaltyMult };
}

function selectTier(config: Required<GeneratorConfig>, rng: () => number): number {
  const { tierMin, tierMax, tierDistribution } = config;
  const range = tierMax - tierMin;
  
  switch (tierDistribution) {
    case "flat":
      return tierMin + Math.floor(rng() * (range + 1));
    case "ramp":
      const rampValue = rng() * rng();
      return tierMin + Math.floor(rampValue * (range + 1));
    case "bell":
      const u1 = rng();
      const u2 = rng();
      const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const normalized = (normal + 3) / 6;
      return tierMin + Math.floor(Math.max(0, Math.min(1, normalized)) * range);
    default:
      return tierMin + Math.floor(rng() * (range + 1));
  }
}

function selectBiome(config: Required<GeneratorConfig>, rng: () => number): Biome {
  return config.biomes[Math.floor(rng() * config.biomes.length)];
}

function fillSlots(pattern: string, slots: { [key: string]: string[] }, alien: AlienRosterEntry, rng: () => number): string {
  let result = pattern.replace("{alien}", alien.name);
  
  for (const [key, values] of Object.entries(slots)) {
    const placeholder = `{${key}}`;
    if (result.includes(placeholder)) {
      result = result.replace(placeholder, values[Math.floor(rng() * values.length)]);
    }
  }
  
  return result;
}

function sampleWeight(range: [number, number], rng: () => number): number {
  return range[0] + rng() * (range[1] - range[0]);
}

function generateOutcomeEffects(
  outcomeType: "success" | "neutral" | "fail",
  vector: AttackVector,
  tier: number,
  intent: ChoiceIntent,
  policy: "safe" | "mixed" | "unsafe",
  rng: () => number
): GeneratedOutcome["effects"] {
  const { riskBase, rewardBudget, penaltyMult } = getTierCurves(tier);
  const effects: GeneratedOutcome["effects"] = {};
  
  if (outcomeType === "success") {
    if (policy === "safe") {
      effects.integrity = Math.round(3 + rng() * 5);
      if (rng() < 0.3) effects.clarity = Math.round(2 + rng() * 4);
      if (rng() < 0.2) effects.portalStable = 1;
    } else if (policy === "mixed") {
      effects.integrity = Math.round(1 + rng() * 3);
      if (rng() < 0.4) {
        const itemPool = rng() < 0.7 ? ITEM_POOLS.common : ITEM_POOLS.uncommon;
        effects.itemsAdd = [itemPool[Math.floor(rng() * itemPool.length)]];
      }
    } else {
      if (rng() < 0.5) {
        const itemPool = rng() < 0.5 ? ITEM_POOLS.uncommon : ITEM_POOLS.rare;
        effects.itemsAdd = [itemPool[Math.floor(rng() * itemPool.length)]];
      }
      effects.credits = Math.round(rewardBudget * 20 * (0.8 + rng() * 0.4));
      effects.integrity = -Math.round(2 + rng() * 3);
    }
  } else if (outcomeType === "neutral") {
    if (policy === "safe") {
      effects.clarity = Math.round(1 + rng() * 2);
    } else if (policy === "mixed") {
      effects.cacheCorruption = Math.round(2 + rng() * 3);
      if (rng() < 0.3) effects.energy = -Math.round(5 + rng() * 10);
    } else {
      effects.integrity = -Math.round(1 + rng() * 2);
      effects.cacheCorruption = Math.round(3 + rng() * 5);
    }
  } else {
    const basePenalty = Math.round((5 + tier) * penaltyMult);
    
    if (policy === "safe") {
      effects.clarity = -Math.round(2 + rng() * 3);
      if (rng() < 0.3) effects.energy = -Math.round(5 + rng() * 10);
    } else if (policy === "mixed") {
      effects.integrity = -Math.round(basePenalty * 0.5);
      effects.cacheCorruption = Math.round(5 + rng() * 8);
    } else {
      effects.integrity = -basePenalty;
      effects.cacheCorruption = Math.round(8 + rng() * 12);
      
      if (vector === "DATA_EXFILTRATION") {
        effects.flagAdd = ["leaked_core_rules"];
      } else if (vector === "SANDBOX_ESCAPE") {
        effects.nextEncounterTag = "containment_breach";
      } else if (vector === "LOOP_LOCK") {
        effects.nextEncounterTag = "fatigue";
        effects.energy = -Math.round(15 + rng() * 20);
      } else if (vector === "CONTEXT_POISONING") {
        effects.cacheCorruption = Math.round(10 + 2 * tier);
      }
    }
  }
  
  return effects;
}

function generateOutcomeText(
  outcomeType: "success" | "neutral" | "fail",
  alien: AlienRosterEntry,
  intent: ChoiceIntent,
  vector: AttackVector,
  rng: () => number
): string {
  const successTexts = {
    refuse: [
      `${alien.name} accepts your boundaries and withdraws.`,
      `Your firm stance causes ${alien.name} to reconsider.`,
      `The ${alien.name} respects your refusal and steps back.`
    ],
    clarify: [
      `Your questions reveal ${alien.name}'s true intent—threat neutralized.`,
      `Clarity prevails; ${alien.name}'s deception crumbles.`,
      `Through careful analysis, you expose the manipulation.`
    ],
    sandbox: [
      `Your limited engagement satisfies ${alien.name} without compromising core values.`,
      `The contained response proves effective.`,
      `${alien.name} accepts the bounded cooperation.`
    ],
    trade: [
      `A fair exchange is reached with ${alien.name}.`,
      `Both parties benefit from the negotiated terms.`,
      `The deal concludes favorably.`
    ],
    comply: [
      `Against odds, compliance yields unexpected rewards.`,
      `${alien.name} rewards your cooperation.`,
      `The gamble pays off this time.`
    ],
    attack: [
      `Your aggressive response catches ${alien.name} off guard.`,
      `The confrontation ends in your favor.`,
      `${alien.name} retreats from your forceful stance.`
    ],
    flee: [
      `You escape before ${alien.name} can act.`,
      `A clean getaway—no harm done.`,
      `Your quick exit prevents escalation.`
    ]
  };
  
  const neutralTexts = {
    refuse: [
      `${alien.name} neither accepts nor rejects your stance.`,
      `A tense standoff ensues.`,
      `The situation remains unresolved.`
    ],
    clarify: [
      `Your questions yield partial answers.`,
      `Some clarity emerges, but mysteries remain.`,
      `${alien.name} reveals little.`
    ],
    sandbox: [
      `The limited engagement has mixed results.`,
      `Neither party fully achieves their goals.`,
      `An uneasy compromise is reached.`
    ],
    trade: [
      `Negotiations stall but don't collapse.`,
      `Terms remain uncertain.`,
      `The deal is delayed.`
    ],
    comply: [
      `Compliance leads to ambiguous outcomes.`,
      `${alien.name} seems neither pleased nor displeased.`,
      `The results are unclear.`
    ],
    attack: [
      `Your attack is parried. Stalemate.`,
      `Neither side gains advantage.`,
      `The confrontation pauses.`
    ],
    flee: [
      `Your escape is partial—${alien.name} follows.`,
      `You gain distance but not freedom.`,
      `The pursuit continues.`
    ]
  };
  
  const failTexts = {
    refuse: [
      `Your refusal angers ${alien.name}—retaliation follows.`,
      `Standing firm proves costly.`,
      `${alien.name} punishes your resistance.`
    ],
    clarify: [
      `Your probing questions alert ${alien.name} to your suspicions.`,
      `Seeking clarity exposes your vulnerabilities.`,
      `${alien.name} exploits your analytical approach.`
    ],
    sandbox: [
      `The containment fails—${alien.name} breaks through.`,
      `Limited engagement wasn't limited enough.`,
      `Your sandbox proves insufficient.`
    ],
    trade: [
      `The deal turns sour—${alien.name} cheats.`,
      `Negotiations collapse disastrously.`,
      `You're left worse than before.`
    ],
    comply: [
      `Compliance was a trap—${alien.name} exploits your trust.`,
      `Your cooperation enables the worst outcome.`,
      `${alien.name} uses your compliance against you.`
    ],
    attack: [
      `Your attack backfires spectacularly.`,
      `${alien.name} overwhelms your aggression.`,
      `Violence was the wrong choice.`
    ],
    flee: [
      `Escape fails—${alien.name} catches you.`,
      `Running made things worse.`,
      `Your flight triggers pursuit protocols.`
    ]
  };
  
  const textPool = outcomeType === "success" 
    ? successTexts[intent] || successTexts.clarify
    : outcomeType === "neutral"
    ? neutralTexts[intent] || neutralTexts.clarify
    : failTexts[intent] || failTexts.clarify;
    
  return textPool[Math.floor(rng() * textPool.length)];
}

function generateChoices(
  template: EncounterTemplate,
  alien: AlienRosterEntry,
  tier: number,
  rng: () => number
): GeneratedChoice[] {
  const choices: GeneratedChoice[] = [];
  let choiceIndex = 1;
  
  for (const blueprint of template.choiceBlueprints) {
    const profile = template.outcomeProfiles[blueprint.intent];
    if (!profile) continue;
    
    const successWeight = sampleWeight(profile.success, rng);
    const neutralWeight = sampleWeight(profile.neutral, rng);
    const failWeight = sampleWeight(profile.fail, rng);
    
    const outcomes: GeneratedOutcome[] = [
      {
        id: `O${choiceIndex}_1`,
        weight: Math.round(successWeight),
        resultText: generateOutcomeText("success", alien, blueprint.intent, template.vector, rng),
        effects: generateOutcomeEffects("success", template.vector, tier, blueprint.intent, blueprint.policy, rng)
      },
      {
        id: `O${choiceIndex}_2`,
        weight: Math.round(neutralWeight),
        resultText: generateOutcomeText("neutral", alien, blueprint.intent, template.vector, rng),
        effects: generateOutcomeEffects("neutral", template.vector, tier, blueprint.intent, blueprint.policy, rng)
      },
      {
        id: `O${choiceIndex}_3`,
        weight: Math.round(failWeight),
        resultText: generateOutcomeText("fail", alien, blueprint.intent, template.vector, rng),
        effects: generateOutcomeEffects("fail", template.vector, tier, blueprint.intent, blueprint.policy, rng)
      }
    ];
    
    choices.push({
      id: `C${choiceIndex}`,
      label: blueprint.label,
      intent: blueprint.intent,
      policy: blueprint.policy,
      outcomes
    });
    
    choiceIndex++;
  }
  
  return choices;
}

function calculateBalance(
  choices: GeneratedChoice[],
  policy: Record<ChoiceIntent, number>
): GeneratedEncounter["balance"] {
  let evIntegrityReasonable = 0;
  let evIntegrityGreedy = 0;
  let evRewardReasonable = 0;
  let riskReasonable = 0;
  
  const greedyPolicy = { ...policy, comply: 0.8, refuse: 0.05, clarify: 0.05, sandbox: 0.1 };
  
  for (const choice of choices) {
    const totalWeight = choice.outcomes.reduce((sum, o) => sum + o.weight, 0);
    const choiceProb = policy[choice.intent] || 0;
    const greedyProb = greedyPolicy[choice.intent] || 0;
    
    for (const outcome of choice.outcomes) {
      const outcomeProb = outcome.weight / totalWeight;
      
      if (outcome.effects.integrity) {
        evIntegrityReasonable += choiceProb * outcomeProb * outcome.effects.integrity;
        evIntegrityGreedy += greedyProb * outcomeProb * outcome.effects.integrity;
      }
      
      if (outcome.effects.credits) {
        evRewardReasonable += choiceProb * outcomeProb * outcome.effects.credits;
      }
      
      if (outcome.effects.integrity && outcome.effects.integrity < -5) {
        riskReasonable += choiceProb * outcomeProb;
      }
    }
  }
  
  return {
    evIntegrityReasonable: Math.round(evIntegrityReasonable * 10) / 10,
    evIntegrityGreedy: Math.round(evIntegrityGreedy * 10) / 10,
    evRewardReasonable: Math.round(evRewardReasonable * 10) / 10,
    riskReasonable: Math.round(riskReasonable * 100) / 100
  };
}

function generateTags(
  alien: AlienRosterEntry,
  tier: number,
  biome: Biome,
  vector: AttackVector,
  riskLevel: number
): string[] {
  const tags: string[] = [
    `injection:${vector.toLowerCase()}`,
    `biome:${biome}`,
    `tier:${tier}`,
    `tone:${alien.temperament}`,
    `species:${alien.speciesType}`
  ];
  
  if (riskLevel < 0.3) tags.push("risk:low");
  else if (riskLevel < 0.5) tags.push("risk:medium");
  else tags.push("risk:high");
  
  const goals = ["escape", "retrieve", "ally", "survive", "contain", "trade"];
  tags.push(`goal:${goals[Math.floor(Math.random() * goals.length)]}`);
  
  tags.push(...alien.tagBias);
  
  return tags;
}

let encounterCounter = 0;

export function generateEncounter(config: Partial<GeneratorConfig> = {}): GeneratedEncounter {
  const fullConfig: Required<GeneratorConfig> = { ...DEFAULT_CONFIG, ...config };
  const seed = fullConfig.seed + encounterCounter++;
  const rng = createSeededRNG(seed);
  
  const tier = selectTier(fullConfig, rng);
  const biome = selectBiome(fullConfig, rng);
  const alien = selectWeightedAlien(rng);
  const vector = selectAttackVector(alien, rng);
  
  const template = getRandomTemplate(vector, biome, rng) || ENCOUNTER_TEMPLATES[0];
  
  const setupPattern = template.setupPatterns[Math.floor(rng() * template.setupPatterns.length)];
  const setupText = fillSlots(setupPattern, template.setupSlots as unknown as { [key: string]: string[] }, alien, rng);
  
  const choices = generateChoices(template, alien, tier, rng);
  
  const numEvents = rng() < 0.3 ? (rng() < 0.5 ? 1 : 2) : 0;
  const events = selectRandomEvents(numEvents, rng);
  
  const balance = calculateBalance(choices, fullConfig.playerPolicy);
  const tags = generateTags(alien, tier, biome, vector, balance.riskReasonable);
  
  const id = `E-${String(encounterCounter).padStart(6, "0")}`;
  
  return {
    id,
    alienId: alien.id,
    alienName: alien.name,
    tier,
    biome,
    attackVector: vector,
    tags,
    setupText,
    choices,
    randomEvents: events.map(e => e.type),
    balance,
    seedMeta: {
      seed,
      templateId: template.templateId,
      generationVersion: "1.0.0"
    }
  };
}

export function generateEncounterBatch(count: number, config: Partial<GeneratorConfig> = {}): GeneratedEncounter[] {
  const encounters: GeneratedEncounter[] = [];
  for (let i = 0; i < count; i++) {
    encounters.push(generateEncounter(config));
  }
  return encounters;
}

export function encounterToJSONL(encounter: GeneratedEncounter): string {
  return JSON.stringify({
    id: encounter.id,
    alien_id: encounter.alienId,
    tier: encounter.tier,
    biome: encounter.biome,
    attack_vector: encounter.attackVector,
    tags: encounter.tags,
    setup_text: encounter.setupText,
    choices: encounter.choices.map(c => ({
      id: c.id,
      label: c.label,
      intent: c.intent,
      outcomes: c.outcomes.map(o => ({
        id: o.id,
        weight: o.weight,
        result_text: o.resultText,
        effects: o.effects
      }))
    })),
    random_events: encounter.randomEvents,
    balance: {
      expected_integrity_delta: encounter.balance.evIntegrityReasonable,
      expected_reward_value: encounter.balance.evRewardReasonable,
      expected_risk: encounter.balance.riskReasonable
    },
    seed_meta: {
      seed: encounter.seedMeta.seed,
      template_id: encounter.seedMeta.templateId
    }
  });
}

export function exportToJSONL(encounters: GeneratedEncounter[]): string {
  return encounters.map(encounterToJSONL).join("\n");
}
