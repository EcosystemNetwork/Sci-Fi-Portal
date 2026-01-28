import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { startGame } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Users, Trophy, Settings, Zap, Shield, Skull, Star, ChevronRight, Play, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import portalVideo from "@/assets/videos/portal-aliens.mp4";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [portalOpen, setPortalOpen] = useState(false);

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

  const handleOpenPortal = () => {
    setPortalOpen(true);
  };

  const handleClosePortal = () => {
    setPortalOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden">
      <div className="scanline-overlay" />

      {/* Left Sidebar */}
      <aside className="w-64 bg-card/80 backdrop-blur-lg border-r border-primary/10 flex flex-col z-10">
        {/* Logo */}
        <div className="p-5 border-b border-primary/10">
          <h1 className="font-display text-xl font-bold tracking-tight">
            <span className="text-white">SPACE</span>
            <span className="text-primary text-glow">BASES</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-1 tracking-[0.3em]">COMMAND CENTER</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1">
          <Button 
            className="w-full justify-start h-12 bg-gradient-to-r from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 text-primary border border-primary/30 font-sans text-sm font-semibold tracking-wide btn-glow"
            onClick={() => startGameMutation.mutate()}
            disabled={startGameMutation.isPending}
            data-testid="button-new-run"
          >
            <Zap className="w-4 h-4 mr-3" />
            {startGameMutation.isPending ? "LOADING..." : "NEW RUN"}
            <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
          </Button>

          <Button variant="ghost" className="menu-item" data-testid="button-my-runs">
            <Gamepad2 className="w-4 h-4 mr-3 opacity-60" />
            My Runs
          </Button>

          <Button variant="ghost" className="menu-item" data-testid="button-practice">
            <Shield className="w-4 h-4 mr-3 opacity-60" />
            Practice
          </Button>

          <Button variant="ghost" className="menu-item" data-testid="button-leaderboard">
            <Trophy className="w-4 h-4 mr-3 opacity-60" />
            Leaderboard
          </Button>

          <Button variant="ghost" className="menu-item" data-testid="button-settings">
            <Settings className="w-4 h-4 mr-3 opacity-60" />
            Settings
          </Button>

          <Separator className="my-4 bg-primary/10" />

          <Link href="/wiki">
            <Button 
              variant="ghost" 
              className="w-full justify-start menu-item text-primary hover:bg-primary/10"
              data-testid="button-wiki"
            >
              <BookOpen className="w-4 h-4 mr-3" />
              Alien Races Wiki
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </Button>
          </Link>

          <Separator className="my-4 bg-primary/10" />

          <div className="stat-card rounded">
            <p className="text-[10px] font-mono text-muted-foreground mb-1">ENTRY FEE</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-display font-bold text-white">FREE</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary font-mono rounded">BETA</span>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary/10 bg-black/30">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span><span className="text-white font-medium">24</span> online</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full border-primary/20 text-primary/80 hover:text-primary hover:bg-primary/10 font-mono text-xs"
            data-testid="button-connect"
          >
            <Users className="w-3 h-3 mr-2" />
            Connect
          </Button>
        </div>
      </aside>

      {/* Center - Portal */}
      <main className="flex-1 flex items-center justify-center relative">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        
        {/* Portal Container */}
        <div className="relative">
          {/* Outer Glow - intensifies when open */}
          <motion.div 
            className="absolute -inset-20 rounded-full blur-3xl"
            animate={{
              background: portalOpen 
                ? "radial-gradient(circle, hsl(180 100% 50% / 0.3), hsl(280 100% 60% / 0.2), transparent)"
                : "radial-gradient(circle, hsl(180 100% 50% / 0.1), hsl(280 100% 60% / 0.05), transparent)",
              scale: portalOpen ? 1.2 : 1
            }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Portal Frame */}
          <motion.div 
            className="relative w-72 h-72 md:w-[400px] md:h-[400px] cursor-pointer"
            onClick={handleOpenPortal}
            whileHover={{ scale: portalOpen ? 1 : 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Spinning Rings */}
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-primary/20"
              animate={{ 
                rotate: 360,
                borderColor: portalOpen ? "hsl(180 100% 50% / 0.5)" : "hsl(180 100% 50% / 0.2)"
              }}
              transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, borderColor: { duration: 0.5 } }}
            />
            <motion.div 
              className="absolute inset-4 rounded-full border border-secondary/20"
              animate={{ 
                rotate: -360,
                borderColor: portalOpen ? "hsl(280 100% 60% / 0.5)" : "hsl(280 100% 60% / 0.2)"
              }}
              transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, borderColor: { duration: 0.5 } }}
            />
            <motion.div 
              className="absolute inset-8 rounded-full border border-primary/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Core / Video Container */}
            <motion.div 
              className="absolute inset-12 rounded-full overflow-hidden border-2 border-primary/30"
              animate={{
                boxShadow: portalOpen 
                  ? "0 0 60px hsl(180 100% 50% / 0.5), 0 0 120px hsl(280 100% 60% / 0.3), inset 0 0 60px hsl(180 100% 50% / 0.2)"
                  : "0 0 20px hsl(180 100% 50% / 0.2), inset 0 0 20px hsl(180 100% 50% / 0.1)"
              }}
              transition={{ duration: 0.8 }}
            >
              <AnimatePresence mode="wait">
                {portalOpen ? (
                  <motion.div
                    key="video"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="absolute inset-0"
                  >
                    <video 
                      src={portalVideo}
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="closed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-br from-black via-primary/10 to-black"
                  >
                    <div className="absolute inset-0 bg-[url('/portal-bg.png')] bg-cover bg-center opacity-40 mix-blend-screen" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-secondary/10" />
                    
                    {/* Play Button Hint */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Play className="w-6 h-6 text-primary ml-1" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Particles */}
            <motion.div 
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-4 left-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
            </motion.div>
            <motion.div 
              className="absolute inset-0"
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute bottom-8 right-1/4 w-1 h-1 bg-secondary rounded-full shadow-[0_0_6px_hsl(var(--secondary))]" />
            </motion.div>
          </motion.div>
        </div>

        {/* Status Text */}
        <div className="absolute bottom-16 text-center">
          <AnimatePresence mode="wait">
            {portalOpen ? (
              <motion.div
                key="open"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-xs font-mono text-secondary/80 tracking-[0.3em] mb-2">PORTAL ACTIVE</p>
                <p className="font-display text-lg text-white tracking-wide">VISITORS INCOMING</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 text-muted-foreground hover:text-primary"
                  onClick={handleClosePortal}
                >
                  Close Portal
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="closed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-xs font-mono text-primary/50 tracking-[0.3em] mb-2">QUANTUM RIFT</p>
                <p className="font-display text-lg text-white/80 tracking-wide">TAP TO OPEN PORTAL</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Right Panel */}
      <aside className="w-72 bg-card/80 backdrop-blur-lg border-l border-primary/10 flex flex-col z-10">
        {/* Header */}
        <div className="panel-header">
          <h2 className="font-display text-sm font-bold text-white/90 tracking-wider">VOID REWARDS</h2>
        </div>

        <div className="flex-1 p-3 space-y-3 overflow-auto">
          {/* Tokens */}
          <div className="stat-card rounded">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-secondary" />
              <span className="font-sans text-xs font-semibold text-white/80 tracking-wide">Quantum Tokens</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Earned</span>
                <span className="text-primary">1,250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available</span>
                <span className="text-white">850</span>
              </div>
            </div>
          </div>

          {/* Eliminations */}
          <div className="stat-card rounded">
            <div className="flex items-center gap-2 mb-3">
              <Skull className="w-4 h-4 text-destructive" />
              <span className="font-sans text-xs font-semibold text-white/80 tracking-wide">Eliminations</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-2xl font-display font-bold text-destructive">47</p>
                <p className="text-[10px] text-muted-foreground font-mono">HOSTILES</p>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-secondary">128</p>
                <p className="text-[10px] text-muted-foreground font-mono">CACHES</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="progress-bar">
                <div className="progress-bar-fill bg-gradient-to-r from-primary to-secondary" style={{ width: '65%' }} />
              </div>
              <p className="text-[10px] text-muted-foreground font-mono text-center mt-1">65% to next rank</p>
            </div>
          </div>

          {/* Bounties */}
          <div className="stat-card rounded border-destructive/20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-xs font-semibold text-white/80 tracking-wide">Active Bounties</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-destructive/20 text-destructive font-mono rounded">HOT</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                <div className="w-8 h-8 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <Skull className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">Phantom Core</p>
                  <p className="text-[10px] text-primary font-mono">500 CR</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                <div className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">Nexus Shard</p>
                  <p className="text-[10px] text-primary font-mono">250 CR</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Season Timer */}
        <div className="p-3 border-t border-primary/10 bg-black/30">
          <p className="text-[10px] font-mono text-center text-muted-foreground">
            Season 1 ends in <span className="text-primary font-medium">14D 06H</span>
          </p>
        </div>
      </aside>
    </div>
  );
}
