import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background with Overlay */}
      <div className="absolute inset-0 bg-[url('/portal-bg.png')] bg-cover bg-center opacity-30" />
      <div className="scanline-overlay z-10 opacity-30" />
      
      {/* Content */}
      <div className="z-20 flex flex-col items-center gap-8 max-w-2xl text-center p-8 bg-black/60 backdrop-blur-sm border border-primary/30 clip-corner shadow-[0_0_50px_rgba(0,255,255,0.1)]">
        <div className="space-y-2">
          <div className="text-primary font-mono tracking-[0.5em] text-sm animate-pulse">SYSTEM READY</div>
          <h1 className="font-display text-6xl md:text-8xl font-bold text-white text-glow tracking-tighter">
            VOID<span className="text-primary">WALKER</span>
          </h1>
          <p className="font-sans text-xl text-muted-foreground mt-4 max-w-lg mx-auto">
            Protocol initialized. Enter the quantum stream and survive the anomalies.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href="/game">
            <Button className="w-full h-16 text-xl font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 clip-corner shadow-[0_0_20px_rgba(0,255,255,0.4)]">
              Initialize Run
            </Button>
          </Link>
          
          <div className="flex gap-4">
             <Button variant="outline" className="flex-1 border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs uppercase">
               Load Data
             </Button>
             <Button variant="outline" className="flex-1 border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs uppercase">
               Settings
             </Button>
          </div>
        </div>

        <div className="mt-8 text-[10px] font-mono text-muted-foreground/50">
          SECURE CONNECTION ESTABLISHED // V.2.0.4
        </div>
      </div>
    </div>
  );
}
