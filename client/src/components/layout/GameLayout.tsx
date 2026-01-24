import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface GameLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function GameLayout({ children, className }: GameLayoutProps) {
  return (
    <div className="min-h-screen w-full text-foreground font-sans relative flex flex-col">
      {/* Scanlines */}
      <div className="scanline-overlay" />

      {/* Header */}
      <header className="h-12 border-b border-primary/10 bg-card/80 backdrop-blur-lg flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-mono hidden sm:inline">EXIT</span>
          </Link>
          <div className="h-4 w-px bg-primary/20" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-display font-bold text-sm tracking-wider text-white">
              VOID<span className="text-primary">WALKER</span>
            </span>
          </div>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground hidden sm:flex gap-4">
          <span>SYS <span className="text-primary">2.0.4</span></span>
          <span>NET <span className="text-green-400">ONLINE</span></span>
        </div>
      </header>

      {/* Content */}
      <main className={cn("flex-1 p-4 relative z-10", className)}>
        {children}
      </main>
    </div>
  );
}
