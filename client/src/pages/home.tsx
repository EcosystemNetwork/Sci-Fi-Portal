import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { startGame } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Users, Trophy, Settings, CreditCard, Zap, Shield, Skull, Star } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const startGameMutation = useMutation({
    mutationFn: startGame,
    onSuccess: () => {
      setLocation("/game");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen w-full bg-background flex relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/portal-bg.png')] bg-cover bg-center opacity-10" />
      <div className="scanline-overlay z-50 opacity-20 pointer-events-none" />

      {/* Left Sidebar */}
      <div className="w-72 bg-black/80 border-r border-primary/30 flex flex-col z-10 backdrop-blur-sm">
        {/* Logo/Title */}
        <div className="p-6 border-b border-primary/20">
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            VOID<span className="text-primary">WALKER</span>
          </h1>
          <p className="text-xs text-primary/60 font-mono mt-1 tracking-widest">PROTOCOL V2.0</p>
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-4 space-y-2">
          <Button 
            className="w-full justify-start h-12 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 font-display tracking-wider"
            onClick={() => startGameMutation.mutate()}
            disabled={startGameMutation.isPending}
            data-testid="button-new-run"
          >
            <Zap className="w-5 h-5 mr-3" />
            {startGameMutation.isPending ? "INITIALIZING..." : "NEW RUN"}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start h-12 text-muted-foreground hover:text-primary hover:bg-primary/10 font-display tracking-wider"
            data-testid="button-my-runs"
          >
            <Gamepad2 className="w-5 h-5 mr-3" />
            MY RUNS
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start h-12 text-muted-foreground hover:text-primary hover:bg-primary/10 font-display tracking-wider"
            data-testid="button-practice"
          >
            <Shield className="w-5 h-5 mr-3" />
            PRACTICE MODE
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start h-12 text-muted-foreground hover:text-primary hover:bg-primary/10 font-display tracking-wider"
            data-testid="button-leaderboard"
          >
            <Trophy className="w-5 h-5 mr-3" />
            LEADERBOARD
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start h-12 text-muted-foreground hover:text-primary hover:bg-primary/10 font-display tracking-wider"
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5 mr-3" />
            SETTINGS
          </Button>

          <Separator className="my-4 bg-primary/20" />

          <div className="bg-black/40 border border-primary/20 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground">ENTRY FEE</span>
              <CreditCard className="w-4 h-4 text-primary/60" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display font-bold text-white">FREE</span>
              <span className="text-xs text-primary/60 font-mono">BETA</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-primary/20">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3">
            <Users className="w-4 h-4 text-primary" />
            <span><span className="text-primary font-bold">24</span> OPERATORS ONLINE</span>
          </div>
          <Button 
            variant="outline" 
            className="w-full border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs"
            data-testid="button-connect"
          >
            CONNECT WALLET
          </Button>
        </div>
      </div>

      {/* Center - Portal Visualization */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Animated Portal */}
        <div className="relative w-96 h-96">
          {/* Outer glow rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 animate-spin-slow blur-xl" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-b from-primary/30 to-secondary/30 animate-pulse blur-lg" />
          
          {/* Portal core */}
          <div className="absolute inset-8 rounded-full bg-black/80 border-2 border-primary/50 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/portal-bg.png')] bg-cover bg-center opacity-60 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-secondary/40" />
            
            {/* Inner swirl effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-primary/30 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute w-24 h-24 rounded-full border border-secondary/30 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
              <div className="absolute w-16 h-16 rounded-full bg-primary/20 animate-pulse" />
            </div>
          </div>

          {/* Orbital particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
            <div className="absolute bottom-0 right-1/4 w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_10px_rgba(255,0,255,0.8)]" />
          </div>
        </div>

        {/* Portal Label */}
        <div className="absolute bottom-20 text-center">
          <p className="font-mono text-sm text-primary/60 tracking-widest animate-pulse">QUANTUM RIFT STABLE</p>
          <p className="font-display text-xl text-white mt-2">READY FOR INSERTION</p>
        </div>
      </div>

      {/* Right Panel - Stats & Rewards */}
      <div className="w-80 bg-black/80 border-l border-primary/30 flex flex-col z-10 backdrop-blur-sm">
        {/* Header */}
        <div className="p-6 border-b border-primary/20">
          <h2 className="font-display text-lg font-bold text-white tracking-wider">VOID REWARDS</h2>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-auto">
          {/* Token Stats */}
          <div className="bg-black/40 border border-primary/20 p-4 rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-secondary" />
              <span className="font-display text-sm text-white tracking-wider">QUANTUM TOKENS</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-mono">EARNED</span>
                <span className="text-primary font-mono">1,250</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-mono">AVAILABLE</span>
                <span className="text-white font-mono">850</span>
              </div>
              <Separator className="bg-primary/20 my-2" />
              <div className="text-xs text-primary/60 font-mono">CLAIM REWARDS AFTER RUN</div>
            </div>
          </div>

          {/* Kill Stats */}
          <div className="bg-black/40 border border-primary/20 p-4 rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <Skull className="w-5 h-5 text-destructive" />
              <span className="font-display text-sm text-white tracking-wider">ENTITY ELIMINATIONS</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-mono text-sm">VOID STALKERS</span>
                <span className="text-destructive font-display text-lg">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-mono text-sm">DATA CACHES</span>
                <span className="text-secondary font-display text-lg">128</span>
              </div>
              <div className="w-full bg-muted/30 h-1.5 rounded-full mt-2">
                <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full" style={{ width: '65%' }} />
              </div>
              <div className="text-xs text-primary/60 font-mono text-center">65% TO NEXT RANK</div>
            </div>
          </div>

          {/* Active Bounties */}
          <div className="bg-black/40 border border-destructive/30 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-sm text-white tracking-wider">ACTIVE BOUNTIES</span>
              <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 font-mono">HOT</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center border border-destructive/30">
                  <Skull className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-display">PHANTOM CORE</p>
                  <p className="text-xs text-muted-foreground font-mono">500 CREDITS</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/30">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-display">NEXUS SHARD</p>
                  <p className="text-xs text-muted-foreground font-mono">250 CREDITS</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-primary/20">
          <div className="text-xs font-mono text-center text-muted-foreground mb-2">
            SEASON 1 ENDS IN <span className="text-primary">14D 06H</span>
          </div>
        </div>
      </div>
    </div>
  );
}
