import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Heart, Zap, Coins, Shield } from "lucide-react";

interface StatusPanelProps {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  credits: number;
  level: number;
}

export function StatusPanel({ health, maxHealth, energy, maxEnergy, credits, level }: StatusPanelProps) {
  const healthPercent = (health / maxHealth) * 100;
  const energyPercent = (energy / maxEnergy) * 100;

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-card/60 backdrop-blur-sm border border-primary/10 rounded">
      {/* Character Profile */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12 border border-primary/30">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback className="bg-primary/10 text-primary font-display text-sm">OP</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-card border border-primary/30 px-1 py-0.5 text-[9px] font-mono text-primary rounded">
            {level}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-sm text-white truncate">OPERATOR</h3>
          <p className="text-[10px] text-muted-foreground font-mono">DRIFTER CLASS</p>
        </div>
      </div>

      <Separator className="bg-primary/10" />

      {/* Vitals */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground font-mono">
              <Heart className="w-3 h-3 text-destructive" /> HULL
            </span>
            <span className="font-mono text-white">{health}<span className="text-muted-foreground">/{maxHealth}</span></span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill bg-gradient-to-r from-destructive to-red-400" 
              style={{ width: `${healthPercent}%` }} 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground font-mono">
              <Zap className="w-3 h-3 text-secondary" /> POWER
            </span>
            <span className="font-mono text-white">{energy}<span className="text-muted-foreground">/{maxEnergy}</span></span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill bg-gradient-to-r from-secondary to-purple-400" 
              style={{ width: `${energyPercent}%` }} 
            />
          </div>
        </div>
      </div>

      <Separator className="bg-primary/10" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="stat-card rounded p-2.5">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Coins className="w-3 h-3" />
            <span className="text-[10px] font-mono">CREDITS</span>
          </div>
          <p className="text-lg font-display font-bold text-primary">{credits}</p>
        </div>
        <div className="stat-card rounded p-2.5">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Shield className="w-3 h-3" />
            <span className="text-[10px] font-mono">ARMOR</span>
          </div>
          <p className="text-lg font-display font-bold text-white">12</p>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-auto">
        <div className="bg-black/40 border border-primary/10 p-2 rounded font-mono text-[9px] text-muted-foreground leading-relaxed">
          &gt; STATUS: <span className="text-green-400">NOMINAL</span><br/>
          &gt; SUIT: <span className="text-primary">98%</span><br/>
          &gt; O2: <span className="text-primary">OPTIMAL</span>
        </div>
      </div>
    </div>
  );
}
