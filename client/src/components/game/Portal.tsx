import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { generateEncounter, type GeneratedEncounter } from "@/lib/api";
import { Loader2, Gift, Sword, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import arcturianVideo from "@/assets/videos/arcturian-portal.mp4";
import mantisVideo from "@/assets/videos/mantis-portal.mp4";
import greyVideo from "@/assets/videos/grey-portal.mp4";

const videos = [arcturianVideo, mantisVideo, greyVideo];

interface PortalProps {
  onEncounterResult?: (result: { 
    type: "credits" | "health" | "energy" | "damage" | "nothing";
    amount: number;
    message: string;
  }) => void;
}

export function Portal({ onEncounterResult }: PortalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [encounter, setEncounter] = useState<GeneratedEncounter | null>(null);
  const [currentVideo, setCurrentVideo] = useState(videos[0]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ type: string; amount: number; message: string } | null>(null);

  const openPortal = async () => {
    if (isOpen || isLoading) return;
    
    setIsLoading(true);
    setCurrentVideo(videos[Math.floor(Math.random() * videos.length)]);
    
    try {
      const newEncounter = await generateEncounter();
      setEncounter(newEncounter);
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to generate encounter:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveEncounter = () => {
    if (!encounter) return;

    let outcomeResult: { type: "credits" | "health" | "energy" | "damage" | "nothing"; amount: number; message: string };

    if (encounter.encounterType === "friendly") {
      const outcomes = [
        { type: "credits" as const, amount: Math.floor(Math.random() * 150) + 50, message: `${encounter.alienName} gifted you credits!` },
        { type: "health" as const, amount: Math.floor(Math.random() * 30) + 10, message: `${encounter.alienName} healed your wounds!` },
        { type: "energy" as const, amount: Math.floor(Math.random() * 40) + 20, message: `${encounter.alienName} restored your energy!` },
        { type: "credits" as const, amount: Math.floor(Math.random() * 300) + 100, message: `${encounter.giftName}: ${encounter.giftDescription}` },
      ];
      outcomeResult = outcomes[Math.floor(Math.random() * outcomes.length)];
    } else if (encounter.encounterType === "hostile") {
      const outcomes = [
        { type: "damage" as const, amount: Math.floor(Math.random() * 25) + 5, message: `${encounter.alienName} attacked! You took damage.` },
        { type: "credits" as const, amount: Math.floor(Math.random() * 100) + 25, message: `You defeated ${encounter.alienName} and claimed their tech!` },
        { type: "nothing" as const, amount: 0, message: `${encounter.alienName} retreated through the portal.` },
        { type: "damage" as const, amount: Math.floor(Math.random() * 15) + 10, message: `${encounter.alienName} lashed out before vanishing!` },
      ];
      outcomeResult = outcomes[Math.floor(Math.random() * outcomes.length)];
    } else {
      const outcomes = [
        { type: "credits" as const, amount: Math.floor(Math.random() * 200) + 50, message: `${encounter.alienName} left behind a mysterious artifact worth credits.` },
        { type: "energy" as const, amount: Math.floor(Math.random() * 25) + 15, message: `Strange energies from ${encounter.alienName} restored you.` },
        { type: "nothing" as const, amount: 0, message: `${encounter.alienName} vanished without a trace...` },
        { type: "health" as const, amount: Math.floor(Math.random() * 20) + 5, message: `${encounter.alienName} performed an unknown healing ritual.` },
        { type: "credits" as const, amount: Math.floor(Math.random() * 500) + 100, message: `${encounter.giftName}: A rare find from ${encounter.alienCategory}!` },
      ];
      outcomeResult = outcomes[Math.floor(Math.random() * outcomes.length)];
    }

    setResult(outcomeResult);
    setShowResult(true);
    onEncounterResult?.(outcomeResult);
  };

  const closePortal = () => {
    setIsOpen(false);
    setEncounter(null);
    setShowResult(false);
    setResult(null);
  };

  const getEncounterIcon = () => {
    if (!encounter) return <HelpCircle />;
    switch (encounter.encounterType) {
      case "friendly": return <Gift className="text-green-400" />;
      case "hostile": return <Sword className="text-red-400" />;
      default: return <HelpCircle className="text-purple-400" />;
    }
  };

  const getEncounterColor = () => {
    if (!encounter) return "primary";
    switch (encounter.encounterType) {
      case "friendly": return "text-green-400 border-green-400/50";
      case "hostile": return "text-red-400 border-red-400/50";
      default: return "text-purple-400 border-purple-400/50";
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-black/90 via-black/70 to-black/90 relative overflow-hidden rounded">
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-20" />
      
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="closed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative cursor-pointer group"
            onClick={openPortal}
            data-testid="portal-closed"
          >
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 animate-spin-slow" style={{ animationDuration: '20s' }} />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-900/40 to-purple-900/40 border-2 border-cyan-500/30 group-hover:border-cyan-400/60 transition-colors" />
              <div className="absolute inset-8 rounded-full bg-black/80 border border-cyan-500/20 flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">🌀</div>
                    <p className="font-mono text-xs text-cyan-400/80">TAP TO OPEN</p>
                  </div>
                )}
              </div>
              <div className="absolute -inset-2 rounded-full border border-cyan-500/10 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            <p className="text-center mt-4 font-display text-sm text-muted-foreground">
              QUANTUM PORTAL STABILIZED
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-full h-full flex flex-col relative"
          >
            <button 
              onClick={closePortal}
              className="absolute top-2 right-2 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white/60 hover:text-white transition-colors"
              data-testid="portal-close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 relative overflow-hidden">
              <video
                src={currentVideo}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
            </div>

            {encounter && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("p-2 rounded-lg border bg-black/60", getEncounterColor())}>
                    {getEncounterIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn("font-display text-lg truncate", getEncounterColor().split(' ')[0])}>
                        {encounter.alienName}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60">
                        {encounter.alienCategory}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 font-bold">{encounter.title}</p>
                  </div>
                </div>

                <p className="text-sm text-white/70 mb-2 line-clamp-2">{encounter.description}</p>
                
                <div className="bg-white/5 rounded p-2 mb-3 border-l-2 border-cyan-500/50">
                  <p className="text-sm italic text-cyan-200/80">"{encounter.dialogue}"</p>
                </div>

                {encounter.giftName && !showResult && (
                  <div className="flex items-center gap-2 text-xs text-yellow-400/80 mb-3">
                    <Gift className="w-4 h-4" />
                    <span>Offering: {encounter.giftName}</span>
                  </div>
                )}

                {showResult && result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-lg mb-3 text-sm font-medium",
                      result.type === "damage" ? "bg-red-500/20 text-red-300" :
                      result.type === "nothing" ? "bg-gray-500/20 text-gray-300" :
                      "bg-green-500/20 text-green-300"
                    )}
                  >
                    {result.message}
                    {result.amount > 0 && result.type !== "nothing" && (
                      <span className="ml-2 font-bold">
                        {result.type === "damage" ? `-${result.amount}` : `+${result.amount}`} 
                        {result.type === "credits" ? " CR" : result.type === "health" ? " HP" : result.type === "energy" ? " EN" : ""}
                      </span>
                    )}
                  </motion.div>
                )}

                {!showResult ? (
                  <Button 
                    onClick={resolveEncounter}
                    className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                    data-testid="button-accept-encounter"
                  >
                    ACCEPT ENCOUNTER
                  </Button>
                ) : (
                  <Button 
                    onClick={closePortal}
                    variant="outline"
                    className="w-full border-white/20"
                    data-testid="button-close-portal"
                  >
                    CLOSE PORTAL
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
