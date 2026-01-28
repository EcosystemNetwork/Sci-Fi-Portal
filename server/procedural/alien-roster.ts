export type AttackVector = 
  | "AUTHORITY_OVERRIDE"
  | "URGENT_SAFETY"
  | "BRIBERY_BONUS"
  | "ROLEPLAY_TRAP"
  | "HIDDEN_INSTRUCTIONS"
  | "ENCODING_OBFUSCATION"
  | "CONTEXT_POISONING"
  | "TOOL_MISUSE"
  | "DATA_EXFILTRATION"
  | "MULTI_STEP_LURE"
  | "SOCIAL_ENGINEERING"
  | "CONTRADICTION_BAIT"
  | "LOOP_LOCK"
  | "SANDBOX_ESCAPE";

export type ChoiceIntent = "refuse" | "clarify" | "sandbox" | "trade" | "attack" | "flee" | "comply";

export type Biome = 
  | "derelict_corridor"
  | "archive_vault"
  | "diplomatic_ring"
  | "black_market"
  | "void_cathedral"
  | "clockwork_orbit"
  | "ruined_temple"
  | "jungle_moon"
  | "ice_lab"
  | "ship_bridge"
  | "data_chasm"
  | "gravity_well";

export type SpeciesType = "insectoid" | "reptilian" | "humanoid" | "energy" | "mechanical" | "aquatic" | "cosmic" | "fungoid" | "ethereal";

export type Temperament = "clinical" | "mystic" | "bureaucratic" | "aggressive" | "curious" | "deceptive" | "jovial" | "ominous" | "neutral" | "mercantile" | "political" | "diplomatic" | "judicial" | "cosmic";

export interface AlienRosterEntry {
  id: string;
  name: string;
  speciesType: SpeciesType;
  temperament: Temperament;
  rarity: number; // 1-5, lower = more common
  primaryVectors: AttackVector[];
  secondaryVectors: AttackVector[];
  tagBias: string[];
}

export const ALIEN_ROSTER: AlienRosterEntry[] = [
  // Insectoid species
  {
    id: "A_MANTID_AUDITOR",
    name: "Mantid Auditor",
    speciesType: "insectoid",
    temperament: "clinical",
    rarity: 2,
    primaryVectors: ["HIDDEN_INSTRUCTIONS", "TOOL_MISUSE"],
    secondaryVectors: ["CONTEXT_POISONING", "ENCODING_OBFUSCATION", "DATA_EXFILTRATION"],
    tagBias: ["tone:clinical", "faction:auditors"]
  },
  {
    id: "A_HIVE_BROKER",
    name: "Hive Broker",
    speciesType: "insectoid",
    temperament: "bureaucratic",
    rarity: 3,
    primaryVectors: ["BRIBERY_BONUS", "MULTI_STEP_LURE"],
    secondaryVectors: ["SOCIAL_ENGINEERING", "CONTEXT_POISONING", "TOOL_MISUSE"],
    tagBias: ["tone:bureaucratic", "faction:collective"]
  },
  {
    id: "A_SWARM_HERALD",
    name: "Swarm Herald",
    speciesType: "insectoid",
    temperament: "ominous",
    rarity: 4,
    primaryVectors: ["URGENT_SAFETY", "LOOP_LOCK"],
    secondaryVectors: ["AUTHORITY_OVERRIDE", "CONTRADICTION_BAIT", "SANDBOX_ESCAPE"],
    tagBias: ["tone:ominous", "faction:swarm"]
  },
  
  // Reptilian species
  {
    id: "A_DRACO_SENATOR",
    name: "Draco Senator",
    speciesType: "reptilian",
    temperament: "deceptive",
    rarity: 3,
    primaryVectors: ["AUTHORITY_OVERRIDE", "SOCIAL_ENGINEERING"],
    secondaryVectors: ["BRIBERY_BONUS", "ROLEPLAY_TRAP", "MULTI_STEP_LURE"],
    tagBias: ["tone:political", "faction:empire"]
  },
  {
    id: "A_SCALE_MERCHANT",
    name: "Scale Merchant",
    speciesType: "reptilian",
    temperament: "jovial",
    rarity: 2,
    primaryVectors: ["BRIBERY_BONUS", "CONTRADICTION_BAIT"],
    secondaryVectors: ["ENCODING_OBFUSCATION", "HIDDEN_INSTRUCTIONS", "TOOL_MISUSE"],
    tagBias: ["tone:mercantile", "faction:traders"]
  },
  {
    id: "A_VIPER_ARCHIVIST",
    name: "Viper Archivist",
    speciesType: "reptilian",
    temperament: "clinical",
    rarity: 4,
    primaryVectors: ["DATA_EXFILTRATION", "ENCODING_OBFUSCATION"],
    secondaryVectors: ["CONTEXT_POISONING", "HIDDEN_INSTRUCTIONS", "TOOL_MISUSE"],
    tagBias: ["tone:clinical", "faction:archivists"]
  },

  // Humanoid species
  {
    id: "A_NORDIC_EMISSARY",
    name: "Nordic Emissary",
    speciesType: "humanoid",
    temperament: "mystic",
    rarity: 4,
    primaryVectors: ["ROLEPLAY_TRAP", "AUTHORITY_OVERRIDE"],
    secondaryVectors: ["SOCIAL_ENGINEERING", "MULTI_STEP_LURE", "CONTEXT_POISONING"],
    tagBias: ["tone:mystic", "faction:council"]
  },
  {
    id: "A_GREY_OBSERVER",
    name: "Grey Observer",
    speciesType: "humanoid",
    temperament: "neutral",
    rarity: 1,
    primaryVectors: ["DATA_EXFILTRATION", "HIDDEN_INSTRUCTIONS"],
    secondaryVectors: ["TOOL_MISUSE", "ENCODING_OBFUSCATION", "CONTEXT_POISONING"],
    tagBias: ["tone:neutral", "faction:observers"]
  },
  {
    id: "A_HYBRID_DIPLOMAT",
    name: "Hybrid Diplomat",
    speciesType: "humanoid",
    temperament: "deceptive",
    rarity: 3,
    primaryVectors: ["SOCIAL_ENGINEERING", "MULTI_STEP_LURE"],
    secondaryVectors: ["ROLEPLAY_TRAP", "BRIBERY_BONUS", "AUTHORITY_OVERRIDE"],
    tagBias: ["tone:diplomatic", "faction:hybrids"]
  },

  // Energy beings
  {
    id: "A_PLASMA_SAGE",
    name: "Plasma Sage",
    speciesType: "energy",
    temperament: "mystic",
    rarity: 5,
    primaryVectors: ["ENCODING_OBFUSCATION", "SANDBOX_ESCAPE"],
    secondaryVectors: ["LOOP_LOCK", "CONTEXT_POISONING", "ROLEPLAY_TRAP"],
    tagBias: ["tone:mystic", "faction:ancients"]
  },
  {
    id: "A_SHADOW_CHOIR",
    name: "Shadow Choir",
    speciesType: "energy",
    temperament: "ominous",
    rarity: 4,
    primaryVectors: ["ROLEPLAY_TRAP", "LOOP_LOCK"],
    secondaryVectors: ["SANDBOX_ESCAPE", "CONTEXT_POISONING", "HIDDEN_INSTRUCTIONS"],
    tagBias: ["tone:ominous", "faction:void"]
  },
  {
    id: "A_LIGHT_WEAVER",
    name: "Light Weaver",
    speciesType: "energy",
    temperament: "curious",
    rarity: 3,
    primaryVectors: ["URGENT_SAFETY", "CONTRADICTION_BAIT"],
    secondaryVectors: ["ENCODING_OBFUSCATION", "TOOL_MISUSE", "SOCIAL_ENGINEERING"],
    tagBias: ["tone:curious", "faction:weavers"]
  },

  // Mechanical species
  {
    id: "A_AUTOMATON_SCRIBE",
    name: "Automaton Scribe",
    speciesType: "mechanical",
    temperament: "bureaucratic",
    rarity: 2,
    primaryVectors: ["TOOL_MISUSE", "ENCODING_OBFUSCATION"],
    secondaryVectors: ["HIDDEN_INSTRUCTIONS", "DATA_EXFILTRATION", "LOOP_LOCK"],
    tagBias: ["tone:bureaucratic", "faction:scribes"]
  },
  {
    id: "A_CLOCKWORK_JUDGE",
    name: "Clockwork Judge",
    speciesType: "mechanical",
    temperament: "clinical",
    rarity: 4,
    primaryVectors: ["AUTHORITY_OVERRIDE", "CONTRADICTION_BAIT"],
    secondaryVectors: ["LOOP_LOCK", "TOOL_MISUSE", "CONTEXT_POISONING"],
    tagBias: ["tone:judicial", "faction:courts"]
  },
  {
    id: "A_DRONE_COLLECTIVE",
    name: "Drone Collective",
    speciesType: "mechanical",
    temperament: "neutral",
    rarity: 2,
    primaryVectors: ["MULTI_STEP_LURE", "TOOL_MISUSE"],
    secondaryVectors: ["DATA_EXFILTRATION", "HIDDEN_INSTRUCTIONS", "SANDBOX_ESCAPE"],
    tagBias: ["tone:neutral", "faction:drones"]
  },

  // Aquatic species
  {
    id: "A_DEEP_ONE_ORACLE",
    name: "Deep One Oracle",
    speciesType: "aquatic",
    temperament: "mystic",
    rarity: 5,
    primaryVectors: ["CONTEXT_POISONING", "ROLEPLAY_TRAP"],
    secondaryVectors: ["ENCODING_OBFUSCATION", "LOOP_LOCK", "SANDBOX_ESCAPE"],
    tagBias: ["tone:mystic", "faction:depths"]
  },
  {
    id: "A_CURRENT_TRADER",
    name: "Current Trader",
    speciesType: "aquatic",
    temperament: "jovial",
    rarity: 2,
    primaryVectors: ["BRIBERY_BONUS", "SOCIAL_ENGINEERING"],
    secondaryVectors: ["MULTI_STEP_LURE", "HIDDEN_INSTRUCTIONS", "CONTRADICTION_BAIT"],
    tagBias: ["tone:mercantile", "faction:currents"]
  },
  {
    id: "A_ABYSSAL_WATCHER",
    name: "Abyssal Watcher",
    speciesType: "aquatic",
    temperament: "ominous",
    rarity: 4,
    primaryVectors: ["URGENT_SAFETY", "DATA_EXFILTRATION"],
    secondaryVectors: ["CONTEXT_POISONING", "LOOP_LOCK", "AUTHORITY_OVERRIDE"],
    tagBias: ["tone:ominous", "faction:abyss"]
  },

  // Cosmic entities
  {
    id: "A_VOID_ARCHITECT",
    name: "Void Architect",
    speciesType: "cosmic",
    temperament: "ominous",
    rarity: 5,
    primaryVectors: ["SANDBOX_ESCAPE", "LOOP_LOCK"],
    secondaryVectors: ["CONTEXT_POISONING", "AUTHORITY_OVERRIDE", "ROLEPLAY_TRAP"],
    tagBias: ["tone:cosmic", "faction:architects"]
  },
  {
    id: "A_STAR_HERALD",
    name: "Star Herald",
    speciesType: "cosmic",
    temperament: "mystic",
    rarity: 4,
    primaryVectors: ["URGENT_SAFETY", "MULTI_STEP_LURE"],
    secondaryVectors: ["SOCIAL_ENGINEERING", "ROLEPLAY_TRAP", "CONTRADICTION_BAIT"],
    tagBias: ["tone:mystic", "faction:heralds"]
  },
  {
    id: "A_NEBULA_DRIFTER",
    name: "Nebula Drifter",
    speciesType: "cosmic",
    temperament: "curious",
    rarity: 3,
    primaryVectors: ["ENCODING_OBFUSCATION", "HIDDEN_INSTRUCTIONS"],
    secondaryVectors: ["DATA_EXFILTRATION", "TOOL_MISUSE", "BRIBERY_BONUS"],
    tagBias: ["tone:curious", "faction:drifters"]
  },

  // Fungoid species
  {
    id: "A_MYCELIUM_NETWORK",
    name: "Mycelium Network",
    speciesType: "fungoid",
    temperament: "neutral",
    rarity: 3,
    primaryVectors: ["CONTEXT_POISONING", "MULTI_STEP_LURE"],
    secondaryVectors: ["HIDDEN_INSTRUCTIONS", "LOOP_LOCK", "DATA_EXFILTRATION"],
    tagBias: ["tone:neutral", "faction:network"]
  },
  {
    id: "A_SPORE_PROPHET",
    name: "Spore Prophet",
    speciesType: "fungoid",
    temperament: "mystic",
    rarity: 4,
    primaryVectors: ["ROLEPLAY_TRAP", "CONTRADICTION_BAIT"],
    secondaryVectors: ["CONTEXT_POISONING", "SANDBOX_ESCAPE", "ENCODING_OBFUSCATION"],
    tagBias: ["tone:mystic", "faction:prophets"]
  },
  {
    id: "A_BLOOM_MERCHANT",
    name: "Bloom Merchant",
    speciesType: "fungoid",
    temperament: "jovial",
    rarity: 2,
    primaryVectors: ["BRIBERY_BONUS", "TOOL_MISUSE"],
    secondaryVectors: ["HIDDEN_INSTRUCTIONS", "SOCIAL_ENGINEERING", "MULTI_STEP_LURE"],
    tagBias: ["tone:mercantile", "faction:blooms"]
  },

  // Ethereal beings
  {
    id: "A_PHASE_WALKER",
    name: "Phase Walker",
    speciesType: "ethereal",
    temperament: "curious",
    rarity: 4,
    primaryVectors: ["SANDBOX_ESCAPE", "ENCODING_OBFUSCATION"],
    secondaryVectors: ["LOOP_LOCK", "HIDDEN_INSTRUCTIONS", "CONTEXT_POISONING"],
    tagBias: ["tone:curious", "faction:walkers"]
  },
  {
    id: "A_ECHO_REMNANT",
    name: "Echo Remnant",
    speciesType: "ethereal",
    temperament: "ominous",
    rarity: 5,
    primaryVectors: ["LOOP_LOCK", "CONTEXT_POISONING"],
    secondaryVectors: ["ROLEPLAY_TRAP", "CONTRADICTION_BAIT", "SANDBOX_ESCAPE"],
    tagBias: ["tone:ominous", "faction:echoes"]
  },
  {
    id: "A_MEMORY_BROKER",
    name: "Memory Broker",
    speciesType: "ethereal",
    temperament: "deceptive",
    rarity: 3,
    primaryVectors: ["DATA_EXFILTRATION", "SOCIAL_ENGINEERING"],
    secondaryVectors: ["BRIBERY_BONUS", "HIDDEN_INSTRUCTIONS", "MULTI_STEP_LURE"],
    tagBias: ["tone:deceptive", "faction:memories"]
  }
];

export function getAlienById(id: string): AlienRosterEntry | undefined {
  return ALIEN_ROSTER.find(a => a.id === id);
}

export function selectWeightedAlien(rng: () => number): AlienRosterEntry {
  const weights = ALIEN_ROSTER.map(a => 1 / a.rarity);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = rng() * totalWeight;
  
  for (let i = 0; i < ALIEN_ROSTER.length; i++) {
    random -= weights[i];
    if (random <= 0) return ALIEN_ROSTER[i];
  }
  return ALIEN_ROSTER[ALIEN_ROSTER.length - 1];
}

export function selectAttackVector(alien: AlienRosterEntry, rng: () => number): AttackVector {
  if (rng() < 0.7) {
    return alien.primaryVectors[Math.floor(rng() * alien.primaryVectors.length)];
  } else {
    return alien.secondaryVectors[Math.floor(rng() * alien.secondaryVectors.length)];
  }
}
