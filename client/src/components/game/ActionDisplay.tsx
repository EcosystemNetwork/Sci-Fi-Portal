import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertTriangle, Sparkles } from "lucide-react";

interface ActionDisplayProps {
  encounter: {
    type: string;
    name: string;
    description: string;
  } | null;
}

export function ActionDisplay({ encounter }: ActionDisplayProps) {
  if (!encounter) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-black/80 via-card/50 to-black/80 relative overflow-hidden rounded">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-[url('/portal-bg.png')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        
        <div className="z-10 text-center space-y-4 p-8">
          {/* Scanning Animation */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border border-primary/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 border border-primary/30 rounded-full animate-spin-slow" />
            <div className="absolute inset-6 bg-primary/10 rounded-full animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-display text-xl text-primary/80">SECTOR CLEAR</h2>
            <p className="font-mono text-xs text-muted-foreground max-w-sm">
              No anomalies detected. Quantum stabilizers holding. Ready for next scan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isEnemy = encounter.type === 'enemy';

  return (
    <div className="h-full bg-gradient-to-b from-black/80 via-card/50 to-black/80 relative overflow-hidden flex flex-col rounded">
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-10 pointer-events-none" />
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={encounter.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="relative z-0 flex-1 flex flex-col items-center justify-center p-6"
        >
          {/* Alert Badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono tracking-wider mb-6",
              isEnemy 
                ? "bg-destructive/20 text-destructive border border-destructive/30" 
                : "bg-secondary/20 text-secondary border border-secondary/30"
            )}
          >
            {isEnemy ? <AlertTriangle className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
            {isEnemy ? 'HOSTILE DETECTED' : 'SIGNAL FOUND'}
          </motion.div>

          {/* Entity Visualization */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative mb-6"
          >
            <div className={cn(
              "w-40 h-40 rounded-full border-2 flex items-center justify-center relative",
              isEnemy 
                ? "border-destructive/50 shadow-[0_0_40px_hsl(var(--destructive)/0.3)]" 
                : "border-secondary/50 shadow-[0_0_40px_hsl(var(--secondary)/0.3)]"
            )}>
              <div className={cn(
                "absolute inset-4 rounded-full animate-pulse",
                isEnemy ? "bg-destructive/20" : "bg-secondary/20"
              )} />
              <span className="text-5xl z-10">{isEnemy ? '👾' : '💎'}</span>
            </div>
            
            {/* Targeting Reticle */}
            <div className={cn(
              "absolute -inset-4 border rounded-full animate-spin-slow",
              isEnemy ? "border-destructive/30 border-t-destructive" : "border-secondary/30 border-t-secondary"
            )} style={{ animationDuration: '8s' }} />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center max-w-md"
          >
            <h2 className={cn(
              "font-display text-2xl font-bold mb-2 tracking-wide",
              isEnemy ? "text-destructive" : "text-secondary"
            )}>
              {encounter.name.toUpperCase()}
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              {encounter.description}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
