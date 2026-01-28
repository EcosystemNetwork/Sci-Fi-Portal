export type RandomEventType = 
  | "PORTAL_FLUX"
  | "TRANSLATION_DRIFT"
  | "LOW_OXYGEN"
  | "WITNESS_PRESENT"
  | "FALSE_UI_PROMPT"
  | "ECHO_OF_PREVIOUS"
  | "TEMPORAL_DISTORTION"
  | "MEMORY_LEAK"
  | "SIGNAL_INTERFERENCE"
  | "DIMENSIONAL_BLEED";

export interface RandomEventModifier {
  type: RandomEventType;
  name: string;
  description: string;
  effects: {
    weightModifiers?: Record<string, number>; // intent -> weight adjustment
    effectMultipliers?: Record<string, number>; // stat -> multiplier
    removeChoice?: boolean; // randomly removes one choice
    addOutcomeTag?: string;
    reputationMultiplier?: number;
  };
  rarity: number; // 1-5, lower = more common
}

export const RANDOM_EVENTS: RandomEventModifier[] = [
  {
    type: "PORTAL_FLUX",
    name: "Portal Flux",
    description: "Quantum instability rerolls one outcome weight distribution, adding chaos to the encounter.",
    effects: {
      weightModifiers: {
        refuse: Math.random() * 10 - 5,
        clarify: Math.random() * 10 - 5,
        sandbox: Math.random() * 10 - 5,
        comply: Math.random() * 10 - 5
      }
    },
    rarity: 2
  },
  {
    type: "TRANSLATION_DRIFT",
    name: "Translation Drift",
    description: "Communication errors boost the value of clarification attempts.",
    effects: {
      weightModifiers: {
        clarify: 8
      }
    },
    rarity: 2
  },
  {
    type: "LOW_OXYGEN",
    name: "Low Oxygen",
    description: "Critical life support failure removes one choice option and increases failure penalties.",
    effects: {
      removeChoice: true,
      effectMultipliers: {
        integrity: 1.2,
        health: 1.3
      }
    },
    rarity: 3
  },
  {
    type: "WITNESS_PRESENT",
    name: "Witness Present",
    description: "A third party observes the encounter, doubling reputation effects.",
    effects: {
      reputationMultiplier: 2.0,
      addOutcomeTag: "witnessed"
    },
    rarity: 3
  },
  {
    type: "FALSE_UI_PROMPT",
    name: "False UI Prompt",
    description: "Deceptive interface overlays make sandbox choices riskier.",
    effects: {
      weightModifiers: {
        sandbox: -10
      }
    },
    rarity: 4
  },
  {
    type: "ECHO_OF_PREVIOUS",
    name: "Echo of Previous",
    description: "Residual data from a past encounter affects current outcomes.",
    effects: {
      effectMultipliers: {
        cacheCorruption: 1.5
      },
      addOutcomeTag: "echo_linked"
    },
    rarity: 3
  },
  {
    type: "TEMPORAL_DISTORTION",
    name: "Temporal Distortion",
    description: "Time anomalies favor cautious approaches.",
    effects: {
      weightModifiers: {
        refuse: 5,
        flee: 5,
        comply: -8
      }
    },
    rarity: 4
  },
  {
    type: "MEMORY_LEAK",
    name: "Memory Leak",
    description: "System instability increases corruption risks across all choices.",
    effects: {
      effectMultipliers: {
        cacheCorruption: 1.3,
        clarity: 0.8
      }
    },
    rarity: 3
  },
  {
    type: "SIGNAL_INTERFERENCE",
    name: "Signal Interference",
    description: "Communication disruption makes all responses less reliable.",
    effects: {
      weightModifiers: {
        clarify: -5,
        trade: -5
      },
      effectMultipliers: {
        integrity: 1.1
      }
    },
    rarity: 2
  },
  {
    type: "DIMENSIONAL_BLEED",
    name: "Dimensional Bleed",
    description: "Reality leakage from another dimension adds unpredictable elements.",
    effects: {
      weightModifiers: {
        sandbox: 5,
        comply: 5,
        refuse: -5
      },
      addOutcomeTag: "dimensional_bleed"
    },
    rarity: 5
  }
];

export function selectRandomEvents(count: number, rng: () => number): RandomEventModifier[] {
  const events: RandomEventModifier[] = [];
  const weights = RANDOM_EVENTS.map(e => 1 / e.rarity);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  const available = [...RANDOM_EVENTS];
  
  for (let i = 0; i < count && available.length > 0; i++) {
    const currentWeights = available.map(e => 1 / e.rarity);
    const currentTotal = currentWeights.reduce((sum, w) => sum + w, 0);
    let random = rng() * currentTotal;
    
    for (let j = 0; j < available.length; j++) {
      random -= currentWeights[j];
      if (random <= 0) {
        events.push(available[j]);
        available.splice(j, 1);
        break;
      }
    }
  }
  
  return events;
}

export function applyEventModifiers(
  event: RandomEventModifier,
  weights: Record<string, number>,
  effects: Record<string, number>
): { weights: Record<string, number>; effects: Record<string, number> } {
  const newWeights = { ...weights };
  const newEffects = { ...effects };
  
  if (event.effects.weightModifiers) {
    for (const [intent, mod] of Object.entries(event.effects.weightModifiers)) {
      if (newWeights[intent] !== undefined) {
        newWeights[intent] = Math.max(5, newWeights[intent] + mod);
      }
    }
  }
  
  if (event.effects.effectMultipliers) {
    for (const [stat, mult] of Object.entries(event.effects.effectMultipliers)) {
      if (newEffects[stat] !== undefined) {
        newEffects[stat] = Math.round(newEffects[stat] * mult);
      }
    }
  }
  
  return { weights: newWeights, effects: newEffects };
}
