import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    <div className="h-full flex flex-col gap-6 p-4 border-r border-primary/20 bg-black/20 backdrop-blur-sm">
      {/* Character Profile */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16 border-2 border-primary shadow-[0_0_15px_rgba(0,255,255,0.5)]">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>OP</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-black border border-primary px-1.5 py-0.5 text-[10px] font-mono text-primary">
            LVL.{level}
          </div>
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-white">OPERATOR</h3>
          <p className="text-xs text-primary/70 font-mono tracking-wider">CLASS: DRIFTER</p>
        </div>
      </div>

      <Separator className="bg-primary/20" />

      {/* Vitals */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-mono text-muted-foreground uppercase">
            <span className="flex items-center gap-2"><Heart className="w-3 h-3 text-destructive" /> Integrity</span>
            <span>{health}/{maxHealth}</span>
          </div>
          <Progress value={healthPercent} className="h-2 bg-muted/50 [&>div]:bg-destructive" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-mono text-muted-foreground uppercase">
            <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-secondary" /> Energy</span>
            <span>{energy}/{maxEnergy}</span>
          </div>
          <Progress value={energyPercent} className="h-2 bg-muted/50 [&>div]:bg-secondary" />
        </div>
      </div>

      <Separator className="bg-primary/20" />

      {/* Stats / Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary/5 border border-primary/20 p-3 rounded-sm">
          <div className="text-xs text-primary/60 font-mono uppercase mb-1 flex items-center gap-1">
            <Coins className="w-3 h-3" /> Credits
          </div>
          <div className="text-xl font-display font-bold text-white tracking-wider">
            {credits}
          </div>
        </div>
        <div className="bg-primary/5 border border-primary/20 p-3 rounded-sm">
          <div className="text-xs text-primary/60 font-mono uppercase mb-1 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Defense
          </div>
          <div className="text-xl font-display font-bold text-white tracking-wider">
            12
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="border border-primary/30 bg-primary/5 p-2 font-mono text-[10px] text-primary/70 leading-relaxed">
          &gt; BIO-MONITOR: STABLE<br/>
          &gt; SUIT INTEGRITY: 98%<br/>
          &gt; OXYGEN RESERVES: OPTIMAL
        </div>
      </div>
    </div>
  );
}
