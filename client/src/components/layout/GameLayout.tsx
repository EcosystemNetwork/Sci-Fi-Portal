import React from "react";
import { cn } from "@/lib/utils";

interface GameLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function GameLayout({ children, className }: GameLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Scanline Overlay */}
      <div className="scanline-overlay z-50 pointer-events-none opacity-50" />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/portal-bg.png')] bg-cover bg-center opacity-20 pointer-events-none" />

      {/* Main Console Container */}
      <div className={cn(
        "relative w-full max-w-6xl h-[90vh] glass-panel flex flex-col clip-corner shadow-2xl shadow-primary/20",
        className
      )}>
        {/* Header Bar */}
        <div className="h-12 border-b border-primary/30 flex items-center justify-between px-6 bg-black/40">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary animate-pulse rounded-full" />
            <span className="font-display font-bold tracking-widest text-primary text-glow uppercase">
              VOID WALKER // PROTOCOL
            </span>
          </div>
          <div className="font-mono text-xs text-muted-foreground flex gap-4">
            <span>SYS.VER.2.0.4</span>
            <span>NET: ONLINE</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-6 relative z-10">
          {children}
        </div>

        {/* Decorative Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary" />
      </div>
    </div>
  );
}
