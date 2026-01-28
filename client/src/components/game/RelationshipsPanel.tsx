import { motion } from "framer-motion";
import {
  Users, Skull, AlertTriangle, Eye, Handshake, 
  Heart, Star, Crown, Building, Bug, Globe, 
  Atom, Shield, Compass, Moon, Sparkles
} from "lucide-react";
import type { AlienRelationship } from "@/lib/api";

interface RelationshipsPanelProps {
  relationships: AlienRelationship[];
}

const FACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; description: string }> = {
  council: { 
    icon: <Building className="w-5 h-5" />, 
    color: "text-blue-400",
    description: "Galactic governing body" 
  },
  hive: { 
    icon: <Bug className="w-5 h-5" />, 
    color: "text-green-400",
    description: "Insectoid collective mind" 
  },
  syndicate: { 
    icon: <Skull className="w-5 h-5" />, 
    color: "text-red-400",
    description: "Criminal underworld network" 
  },
  collective: { 
    icon: <Atom className="w-5 h-5" />, 
    color: "text-cyan-400",
    description: "Cybernetic consciousness" 
  },
  empire: { 
    icon: <Crown className="w-5 h-5" />, 
    color: "text-yellow-400",
    description: "Expansionist monarchy" 
  },
  federation: { 
    icon: <Shield className="w-5 h-5" />, 
    color: "text-purple-400",
    description: "Democratic alliance" 
  },
  alliance: { 
    icon: <Handshake className="w-5 h-5" />, 
    color: "text-orange-400",
    description: "Trade coalition" 
  },
  nomads: { 
    icon: <Compass className="w-5 h-5" />, 
    color: "text-amber-400",
    description: "Wandering traders" 
  },
  ancients: { 
    icon: <Moon className="w-5 h-5" />, 
    color: "text-indigo-400",
    description: "Precursor remnants" 
  },
  void: { 
    icon: <Sparkles className="w-5 h-5" />, 
    color: "text-pink-400",
    description: "Interdimensional entities" 
  },
};

const STANDING_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  Hostile: { icon: <Skull className="w-4 h-4" />, color: "text-red-500", bgColor: "bg-red-900/30" },
  Unfriendly: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-orange-500", bgColor: "bg-orange-900/30" },
  Suspicious: { icon: <Eye className="w-4 h-4" />, color: "text-yellow-500", bgColor: "bg-yellow-900/30" },
  Neutral: { icon: <Users className="w-4 h-4" />, color: "text-gray-400", bgColor: "bg-gray-800/50" },
  Friendly: { icon: <Handshake className="w-4 h-4" />, color: "text-green-400", bgColor: "bg-green-900/30" },
  Allied: { icon: <Heart className="w-4 h-4" />, color: "text-cyan-400", bgColor: "bg-cyan-900/30" },
  Exalted: { icon: <Star className="w-4 h-4" />, color: "text-yellow-400", bgColor: "bg-yellow-900/30" },
};

function getStandingPercent(standing: number): number {
  return ((standing + 100) / 200) * 100;
}

function getStandingColor(standing: number): string {
  if (standing <= -50) return "bg-red-500";
  if (standing <= -25) return "bg-orange-500";
  if (standing < 25) return "bg-gray-500";
  if (standing < 50) return "bg-green-500";
  if (standing < 75) return "bg-cyan-500";
  return "bg-yellow-500";
}

export function RelationshipsPanel({ relationships }: RelationshipsPanelProps) {
  const sortedRelationships = [...relationships].sort((a, b) => b.standing - a.standing);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-orbitron text-cyan-400 text-sm uppercase tracking-wider">Alien Factions</h3>
        <span className="text-xs text-gray-500">{relationships.length} factions</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {sortedRelationships.map((rel, index) => {
          const factionConfig = FACTION_CONFIG[rel.faction] || {
            icon: <Users className="w-5 h-5" />,
            color: "text-gray-400",
            description: "Unknown faction"
          };
          const standingConfig = STANDING_CONFIG[rel.title] || STANDING_CONFIG.Neutral;
          
          return (
            <motion.div
              key={rel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              data-testid={`faction-${rel.faction}`}
              className={`p-3 rounded border border-gray-700 ${standingConfig.bgColor}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded bg-gray-900/50 ${factionConfig.color}`}>
                    {factionConfig.icon}
                  </div>
                  <div>
                    <div className={`font-rajdhani font-semibold capitalize ${factionConfig.color}`}>
                      {rel.faction}
                    </div>
                    <div className="text-[10px] text-gray-500">{factionConfig.description}</div>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${standingConfig.color}`}>
                  {standingConfig.icon}
                  <span>{rel.title}</span>
                </div>
              </div>

              <div className="relative h-2 bg-gray-900 rounded overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 border-r border-gray-700" />
                  <div className="w-1/2" />
                </div>
                <motion.div
                  className={`absolute top-0 bottom-0 left-0 ${getStandingColor(rel.standing)} rounded`}
                  initial={{ width: 0 }}
                  animate={{ width: `${getStandingPercent(rel.standing)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-white rounded"
                  style={{ left: `${getStandingPercent(rel.standing)}%` }}
                />
              </div>

              <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                <span>-100 Hostile</span>
                <span className={`${standingConfig.color} font-semibold`}>{rel.standing}</span>
                <span>+100 Exalted</span>
              </div>

              {rel.encounterCount > 0 && (
                <div className="mt-2 flex justify-between text-[10px] text-gray-500">
                  <span>{rel.encounterCount} encounter{rel.encounterCount !== 1 ? "s" : ""}</span>
                  {rel.lastEncounter && (
                    <span>Last: {new Date(rel.lastEncounter).toLocaleDateString()}</span>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}

        {relationships.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No faction relationships yet</p>
            <p className="text-xs mt-1">Encounter aliens to build relationships</p>
          </div>
        )}
      </div>
    </div>
  );
}
