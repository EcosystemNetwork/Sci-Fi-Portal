import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActionDisplayProps {
  encounter: {
    type: string;
    name: string;
    description: string;
    image?: string;
  } | null;
}

export function ActionDisplay({ encounter }: ActionDisplayProps) {
  if (!encounter) {
    return (
      <div className="h-full flex flex-col items-center justify-center border border-primary/20 bg-black/60 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('/portal-bg.png')] bg-cover bg-center opacity-40 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        <div className="z-10 text-center space-y-4 p-8">
          <div className="w-24 h-24 mx-auto border-2 border-primary/30 rounded-full flex items-center justify-center animate-spin-slow">
            <div className="w-16 h-16 border border-primary/50 rounded-full" />
          </div>
          <h2 className="font-display text-2xl text-primary animate-pulse">SECTOR CLEAR</h2>
          <p className="font-mono text-muted-foreground max-w-md">
            Sensors indicate no immediate threats. Quantum stabilizers are holding. Ready for next jump coordinates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full border border-primary/20 bg-black/60 relative overflow-hidden flex flex-col">
      {/* Viewport Overlay Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_2px,3px_100%]" />
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={encounter.name}
          className="mb-8 relative"
        >
          <div className="w-64 h-64 bg-black/50 border border-primary/50 rounded-full flex items-center justify-center overflow-hidden relative shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            {/* Placeholder for dynamic encounter image */}
            <div className={cn(
              "w-48 h-48 rounded-full animate-pulse",
              encounter.type === 'enemy' ? "bg-destructive/20 shadow-[0_0_50px_rgba(255,0,0,0.5)]" : "bg-secondary/20 shadow-[0_0_50px_rgba(255,0,255,0.5)]"
            )} />
            <div className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold opacity-50">
               {encounter.type === 'enemy' ? '⚠️' : '💠'}
            </div>
          </div>
          
          {/* Target Reticle */}
          <div className="absolute -inset-4 border border-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute -inset-4 border-t-2 border-primary rounded-full w-full h-full rotate-45" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/30 text-primary font-mono text-xs mb-4 uppercase tracking-widest">
            {encounter.type === 'enemy' ? 'Hostile Entity Detected' : 'Resource Signal Found'}
          </div>
          <h2 className={cn(
            "font-display text-4xl font-bold mb-4 tracking-wide",
            encounter.type === 'enemy' ? "text-destructive text-shadow-red" : "text-secondary text-shadow-purple"
          )}>
            {encounter.name}
          </h2>
          <p className="font-mono text-lg text-muted-foreground max-w-lg leading-relaxed">
            {encounter.description}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
