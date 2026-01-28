import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords, MessageCircle, Cpu, Heart, Brain,
  Shield, Flame, ShieldPlus, Target, Crown,
  BookOpen, Award, Zap, Battery, Crosshair,
  Activity, PlusCircle, ShieldCheck, Eye, Sparkles, Sun,
  Lock, Star, Package
} from "lucide-react";
import type { Skill, PlayerSkill } from "@/lib/api";

interface SkillTreePanelProps {
  allSkills: Skill[];
  playerSkills: PlayerSkill[];
  skillPoints: number;
  onUnlock: (skillId: string) => void;
}

const CATEGORY_CONFIG: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  combat: { 
    color: "text-red-400", 
    bgColor: "bg-red-900/30 border-red-700", 
    icon: <Swords className="w-4 h-4" />,
    label: "Combat"
  },
  diplomacy: { 
    color: "text-blue-400", 
    bgColor: "bg-blue-900/30 border-blue-700", 
    icon: <MessageCircle className="w-4 h-4" />,
    label: "Diplomacy"
  },
  technology: { 
    color: "text-yellow-400", 
    bgColor: "bg-yellow-900/30 border-yellow-700", 
    icon: <Cpu className="w-4 h-4" />,
    label: "Technology"
  },
  survival: { 
    color: "text-green-400", 
    bgColor: "bg-green-900/30 border-green-700", 
    icon: <Heart className="w-4 h-4" />,
    label: "Survival"
  },
  psionic: { 
    color: "text-purple-400", 
    bgColor: "bg-purple-900/30 border-purple-700", 
    icon: <Brain className="w-4 h-4" />,
    label: "Psionic"
  },
};

function getIcon(iconName: string) {
  const icons: Record<string, React.ReactNode> = {
    swords: <Swords className="w-5 h-5" />,
    shield: <Shield className="w-5 h-5" />,
    flame: <Flame className="w-5 h-5" />,
    "shield-plus": <ShieldPlus className="w-5 h-5" />,
    target: <Target className="w-5 h-5" />,
    brain: <Brain className="w-5 h-5" />,
    "message-circle": <MessageCircle className="w-5 h-5" />,
    "book-open": <BookOpen className="w-5 h-5" />,
    handshake: <Award className="w-5 h-5" />,
    award: <Award className="w-5 h-5" />,
    crown: <Crown className="w-5 h-5" />,
    cpu: <Cpu className="w-5 h-5" />,
    battery: <Battery className="w-5 h-5" />,
    crosshair: <Crosshair className="w-5 h-5" />,
    zap: <Zap className="w-5 h-5" />,
    atom: <Sparkles className="w-5 h-5" />,
    heart: <Heart className="w-5 h-5" />,
    package: <Package className="w-5 h-5" />,
    activity: <Activity className="w-5 h-5" />,
    "plus-circle": <PlusCircle className="w-5 h-5" />,
    "shield-check": <ShieldCheck className="w-5 h-5" />,
    eye: <Eye className="w-5 h-5" />,
    sparkles: <Sparkles className="w-5 h-5" />,
    sun: <Sun className="w-5 h-5" />,
    star: <Star className="w-5 h-5" />,
  };
  return icons[iconName] || <Star className="w-5 h-5" />;
}

export function SkillTreePanel({ allSkills, playerSkills, skillPoints, onUnlock }: SkillTreePanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("combat");
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);

  const categories = ["combat", "diplomacy", "technology", "survival", "psionic"];
  
  const unlockedSkillIds = new Set(playerSkills.map(ps => ps.skillId));
  const playerSkillMap = new Map(playerSkills.map(ps => [ps.skillId, ps]));

  const categorySkills = allSkills
    .filter(s => s.category === selectedCategory)
    .sort((a, b) => a.tier - b.tier);

  const canUnlock = (skill: Skill): boolean => {
    if (unlockedSkillIds.has(skill.id)) return false;
    if (skill.cost > skillPoints) return false;
    
    const prereqs = skill.prerequisites as string[];
    return prereqs.every(prereqId => unlockedSkillIds.has(prereqId));
  };

  const getSkillStatus = (skill: Skill): "locked" | "available" | "unlocked" | "maxed" => {
    const playerSkill = playerSkillMap.get(skill.id);
    if (playerSkill) {
      return playerSkill.rank >= skill.maxRank ? "maxed" : "unlocked";
    }
    return canUnlock(skill) ? "available" : "locked";
  };

  const tierGroups = categorySkills.reduce((acc, skill) => {
    if (!acc[skill.tier]) acc[skill.tier] = [];
    acc[skill.tier].push(skill);
    return acc;
  }, {} as Record<number, Skill[]>);

  const config = CATEGORY_CONFIG[selectedCategory];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-orbitron text-cyan-400 text-sm uppercase tracking-wider">Skill Tree</h3>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className={`text-sm font-rajdhani ${skillPoints > 0 ? "text-yellow-400" : "text-gray-500"}`}>
            {skillPoints} points
          </span>
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        {categories.map(cat => {
          const catConfig = CATEGORY_CONFIG[cat];
          const unlockedCount = playerSkills.filter(ps => {
            const skill = allSkills.find(s => s.id === ps.skillId);
            return skill?.category === cat;
          }).length;
          
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              data-testid={`category-${cat}`}
              className={`flex-1 p-2 rounded border transition-all ${
                selectedCategory === cat 
                  ? `${catConfig.bgColor} ${catConfig.color}` 
                  : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                {catConfig.icon}
                <span className="text-[10px] uppercase tracking-wider hidden sm:block">
                  {catConfig.label}
                </span>
                {unlockedCount > 0 && (
                  <span className="text-[9px] opacity-60">{unlockedCount}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {Object.entries(tierGroups).map(([tier, skills]) => (
          <div key={tier}>
            <div className={`text-xs ${config.color} opacity-60 mb-2 font-rajdhani uppercase`}>
              Tier {tier}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <AnimatePresence>
                {skills.map(skill => {
                  const status = getSkillStatus(skill);
                  const playerSkill = playerSkillMap.get(skill.id);
                  
                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      data-testid={`skill-${skill.id}`}
                      className={`p-2 rounded border transition-all relative ${
                        status === "maxed" 
                          ? `${config.bgColor} ring-1 ring-${config.color.split('-')[1]}-400` 
                          : status === "unlocked"
                            ? config.bgColor
                            : status === "available"
                              ? "bg-gray-800/50 border-gray-600 hover:border-gray-500"
                              : "bg-gray-900/50 border-gray-800 opacity-50"
                      }`}
                      onMouseEnter={() => setHoveredSkill(skill)}
                      onMouseLeave={() => setHoveredSkill(null)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 rounded ${
                          status === "locked" ? "bg-gray-800" : config.bgColor
                        } ${config.color}`}>
                          {status === "locked" ? <Lock className="w-4 h-4" /> : getIcon(skill.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-rajdhani text-sm font-semibold truncate ${
                            status === "locked" ? "text-gray-500" : config.color
                          }`}>
                            {skill.name}
                          </div>
                          {playerSkill && (
                            <div className="flex gap-0.5 mt-1">
                              {Array.from({ length: skill.maxRank }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < playerSkill.rank 
                                      ? config.color.replace("text-", "bg-")
                                      : "bg-gray-700"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {status === "available" && (
                        <button
                          onClick={() => onUnlock(skill.id)}
                          data-testid={`unlock-${skill.id}`}
                          className={`mt-2 w-full py-1 text-xs rounded font-rajdhani ${config.bgColor} ${config.color} hover:brightness-125 transition-all`}
                        >
                          Unlock ({skill.cost} pts)
                        </button>
                      )}

                      {hoveredSkill?.id === skill.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute z-10 left-0 right-0 top-full mt-1 p-2 rounded border border-gray-700 bg-gray-900/95 shadow-lg"
                        >
                          <p className="text-xs text-gray-400 mb-2">{skill.description}</p>
                          
                          {Object.keys(skill.statModifiers).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {Object.entries(skill.statModifiers).map(([stat, value]) => (
                                <span
                                  key={stat}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/30 text-green-400"
                                >
                                  +{value} {stat}
                                </span>
                              ))}
                            </div>
                          )}

                          {(skill.prerequisites as string[]).length > 0 && (
                            <div className="text-[10px] text-gray-500">
                              Requires: {(skill.prerequisites as string[]).map(p => 
                                allSkills.find(s => s.id === p)?.name || p
                              ).join(", ")}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {categorySkills.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No skills available</p>
          </div>
        )}
      </div>
    </div>
  );
}
