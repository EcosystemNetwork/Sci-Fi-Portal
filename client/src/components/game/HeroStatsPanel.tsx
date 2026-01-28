import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Heart, 
  Zap, 
  Shield, 
  Swords, 
  Target, 
  Wind, 
  Crosshair,
  ShieldPlus,
  Gauge,
  Crown,
  Flame,
  Radar,
  RefreshCw,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  ammunition: number;
  maxAmmunition: number;
  armour: number;
  chargeBonus: number;
  leadership: number;
  meleeAttack: number;
  meleeDefence: number;
  missileStrength: number;
  range: number;
  speed: number;
  weaponStrength: number;
  accuracy: number;
  replenishmentRate: number;
  reloadTime: number;
  credits: number;
  level: number;
  integrity: number;
  clarity: number;
  cacheCorruption: number;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  maxValue?: number;
  color: string;
  showBar?: boolean;
  tooltip?: string;
}

function StatItem({ icon, label, value, maxValue, color, showBar = false, tooltip }: StatItemProps) {
  const percent = maxValue ? (value / maxValue) * 100 : 0;
  
  const content = (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={cn("flex items-center gap-1.5 font-mono", color)}>
          {icon}
          <span className="text-muted-foreground">{label}</span>
        </span>
        <span className="font-mono text-white">
          {value}
          {maxValue && <span className="text-muted-foreground">/{maxValue}</span>}
        </span>
      </div>
      {showBar && maxValue && (
        <div className="progress-bar">
          <div 
            className={cn("progress-bar-fill", color.includes("red") ? "bg-gradient-to-r from-red-500 to-red-400" :
              color.includes("cyan") ? "bg-gradient-to-r from-cyan-500 to-cyan-400" :
              color.includes("yellow") ? "bg-gradient-to-r from-yellow-500 to-amber-400" :
              color.includes("green") ? "bg-gradient-to-r from-green-500 to-emerald-400" :
              color.includes("blue") ? "bg-gradient-to-r from-blue-500 to-blue-400" :
              color.includes("purple") ? "bg-gradient-to-r from-purple-500 to-purple-400" :
              "bg-gradient-to-r from-gray-500 to-gray-400"
            )}
            style={{ width: `${Math.min(percent, 100)}%` }} 
          />
        </div>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[200px]">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

interface CompactStatProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  tooltip?: string;
  bonus?: number;
}

function CompactStat({ icon, label, value, color, tooltip, bonus }: CompactStatProps) {
  const content = (
    <div className="flex items-center gap-2 p-2 bg-black/30 rounded border border-white/5 hover:border-white/10 transition-colors">
      <div className={cn("p-1.5 rounded bg-black/40", color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-mono text-muted-foreground truncate">{label}</p>
        <div className="flex items-center gap-1">
          <p className="text-sm font-display font-bold text-white">{value}</p>
          {bonus && bonus !== 0 && (
            <span className={cn("text-[10px] font-mono", bonus > 0 ? "text-green-400" : "text-red-400")}>
              ({bonus > 0 ? "+" : ""}{bonus})
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

interface HeroStatsPanelProps {
  stats: HeroStats;
  showHiddenStats?: boolean;
  bonuses?: Record<string, number>;
}

export function HeroStatsPanel({ stats, showHiddenStats = false, bonuses = {} }: HeroStatsPanelProps) {
  const hasBonus = (stat: string) => bonuses[stat] && bonuses[stat] !== 0;
  const formatBonus = (stat: string) => {
    const bonus = bonuses[stat];
    if (!bonus || bonus === 0) return null;
    return bonus > 0 ? `+${bonus}` : `${bonus}`;
  };
  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full flex flex-col gap-3 p-4 bg-card/60 backdrop-blur-sm border border-primary/10 rounded overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm text-primary tracking-wider">COMBAT STATS</h3>
          <span className="text-[10px] font-mono text-muted-foreground">LVL {stats.level}</span>
        </div>

        <Separator className="bg-primary/10" />

        <div className="space-y-3">
          <StatItem
            icon={<Heart className="w-3 h-3" />}
            label="HIT POINTS"
            value={stats.health}
            maxValue={stats.maxHealth}
            color="text-red-400"
            showBar
            tooltip="Your vessel's structural integrity. Reach 0 and the void claims you."
          />
          
          <StatItem
            icon={<Zap className="w-3 h-3" />}
            label="ENERGY"
            value={stats.energy}
            maxValue={stats.maxEnergy}
            color="text-purple-400"
            showBar
            tooltip="Power reserves for special abilities and portal operations."
          />

          <StatItem
            icon={<Target className="w-3 h-3" />}
            label="AMMO"
            value={stats.ammunition}
            maxValue={stats.maxAmmunition}
            color="text-yellow-400"
            showBar
            tooltip="Ammunition for ranged weapons. Replenishes at stations."
          />
        </div>

        <Separator className="bg-primary/10" />

        <div className="grid grid-cols-2 gap-2">
          <CompactStat
            icon={<ShieldPlus className="w-3.5 h-3.5" />}
            label="ARMOUR"
            value={stats.armour}
            color="text-slate-400"
            tooltip="Damage reduction from incoming attacks. Higher means more protection."
            bonus={bonuses.armour}
          />
          <CompactStat
            icon={<Flame className="w-3.5 h-3.5" />}
            label="CHARGE"
            value={stats.chargeBonus}
            color="text-orange-400"
            tooltip="Bonus damage when charging into melee combat."
            bonus={bonuses.chargeBonus}
          />
          <CompactStat
            icon={<Crown className="w-3.5 h-3.5" />}
            label="LEADERSHIP"
            value={stats.leadership}
            color="text-yellow-400"
            tooltip="Morale and command presence. Affects crew and ally effectiveness."
            bonus={bonuses.leadership}
          />
          <CompactStat
            icon={<Swords className="w-3.5 h-3.5" />}
            label="MELEE ATK"
            value={stats.meleeAttack}
            color="text-red-400"
            tooltip="Offensive capability in close-quarters combat."
            bonus={bonuses.meleeAttack}
          />
          <CompactStat
            icon={<Shield className="w-3.5 h-3.5" />}
            label="MELEE DEF"
            value={stats.meleeDefence}
            color="text-cyan-400"
            tooltip="Ability to block and parry melee attacks."
            bonus={bonuses.meleeDefence}
          />
          <CompactStat
            icon={<Crosshair className="w-3.5 h-3.5" />}
            label="MISSILE"
            value={stats.missileStrength}
            color="text-emerald-400"
            tooltip="Damage dealt by ranged and missile weapons."
            bonus={bonuses.missileStrength}
          />
          <CompactStat
            icon={<Radar className="w-3.5 h-3.5" />}
            label="RANGE"
            value={stats.range}
            color="text-blue-400"
            tooltip="Maximum effective distance for ranged attacks."
            bonus={bonuses.range}
          />
          <CompactStat
            icon={<Wind className="w-3.5 h-3.5" />}
            label="SPEED"
            value={stats.speed}
            color="text-teal-400"
            tooltip="Movement and reaction speed in combat."
            bonus={bonuses.speed}
          />
          <CompactStat
            icon={<Gauge className="w-3.5 h-3.5" />}
            label="WEAPON STR"
            value={stats.weaponStrength}
            color="text-pink-400"
            tooltip="Raw damage output from primary weapons."
            bonus={bonuses.weaponStrength}
          />
        </div>

        {showHiddenStats && (
          <>
            <Separator className="bg-primary/10" />
            
            <div className="space-y-1">
              <h4 className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                <Eye className="w-3 h-3" /> HIDDEN STATS
              </h4>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                <div className="p-1.5 bg-black/20 rounded text-center">
                  <p className="text-muted-foreground">ACC</p>
                  <div className="flex items-center justify-center gap-0.5">
                    <p className="font-mono text-white">{stats.accuracy}%</p>
                    {bonuses.accuracy && bonuses.accuracy !== 0 && (
                      <span className={cn("text-[9px]", bonuses.accuracy > 0 ? "text-green-400" : "text-red-400")}>
                        ({bonuses.accuracy > 0 ? "+" : ""}{bonuses.accuracy})
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-1.5 bg-black/20 rounded text-center">
                  <p className="text-muted-foreground">REPLEN</p>
                  <div className="flex items-center justify-center gap-0.5">
                    <p className="font-mono text-white">{stats.replenishmentRate}/s</p>
                    {bonuses.replenishmentRate && bonuses.replenishmentRate !== 0 && (
                      <span className={cn("text-[9px]", bonuses.replenishmentRate > 0 ? "text-green-400" : "text-red-400")}>
                        ({bonuses.replenishmentRate > 0 ? "+" : ""}{bonuses.replenishmentRate})
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-1.5 bg-black/20 rounded text-center">
                  <p className="text-muted-foreground">RELOAD</p>
                  <div className="flex items-center justify-center gap-0.5">
                    <p className="font-mono text-white">{stats.reloadTime}s</p>
                    {bonuses.reloadTime && bonuses.reloadTime !== 0 && (
                      <span className={cn("text-[9px]", bonuses.reloadTime < 0 ? "text-green-400" : "text-red-400")}>
                        ({bonuses.reloadTime > 0 ? "+" : ""}{bonuses.reloadTime})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator className="bg-primary/10" />

        <div className="space-y-2">
          <h4 className="text-[10px] font-mono text-muted-foreground">SYSTEM STATUS</h4>
          <StatItem
            icon={<Shield className="w-3 h-3" />}
            label="INTEGRITY"
            value={stats.integrity}
            maxValue={100}
            color="text-green-400"
            showBar
            tooltip="Core system integrity. Decreases when compromised by alien influences."
          />
          <StatItem
            icon={<Zap className="w-3 h-3" />}
            label="CLARITY"
            value={stats.clarity}
            maxValue={100}
            color="text-blue-400"
            showBar
            tooltip="Mental clarity and focus. Affects decision-making in encounters."
          />
          <StatItem
            icon={<RefreshCw className="w-3 h-3" />}
            label="CORRUPTION"
            value={stats.cacheCorruption}
            maxValue={100}
            color="text-orange-400"
            showBar
            tooltip="Cache corruption level. High corruption may cause unpredictable behavior."
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

export default HeroStatsPanel;
