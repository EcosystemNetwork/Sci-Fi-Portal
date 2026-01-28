import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  generateEncounter, 
  generateVideo, 
  checkVideoStatus, 
  getRandomEncounter,
  resolveChoice,
  seedEncounters,
  getProceduralEncounter,
  resolveProceduralChoice,
  type GeneratedEncounter,
  type EncounterTemplateResponse,
  type EncounterChoice,
  type ResolveChoiceResponse,
  type ProceduralEncounter,
} from "@/lib/api";
import { Loader2, Gift, Sword, HelpCircle, X, Video, Sparkles, Shield, Brain, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

import arcturianVideo from "@/assets/videos/arcturian-portal.mp4";
import mantisVideo from "@/assets/videos/mantis-portal.mp4";
import greyVideo from "@/assets/videos/grey-portal.mp4";

const fallbackVideos = [arcturianVideo, mantisVideo, greyVideo];

interface PortalProps {
  gameId?: string;
  onEncounterResult?: (result: ResolveChoiceResponse) => void;
  onLegacyResult?: (result: { 
    type: "credits" | "health" | "energy" | "damage" | "nothing";
    amount: number;
    message: string;
  }) => void;
}

const INTENT_ICONS: Record<string, React.ReactNode> = {
  refuse: <Shield className="w-4 h-4" />,
  clarify: <Brain className="w-4 h-4" />,
  sandbox: <Zap className="w-4 h-4" />,
  comply: <AlertTriangle className="w-4 h-4" />,
  hack: <Zap className="w-4 h-4" />,
  attack: <Sword className="w-4 h-4" />,
  flee: <Zap className="w-4 h-4" />,
  trade: <Gift className="w-4 h-4" />,
};

const INTENT_COLORS: Record<string, string> = {
  refuse: "border-green-500/50 bg-green-500/10 hover:bg-green-500/20",
  clarify: "border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20",
  sandbox: "border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20",
  comply: "border-red-500/50 bg-red-500/10 hover:bg-red-500/20",
  hack: "border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20",
  attack: "border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20",
  flee: "border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20",
  trade: "border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20",
};

export function Portal({ gameId, onEncounterResult, onLegacyResult }: PortalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [encounter, setEncounter] = useState<EncounterTemplateResponse | null>(null);
  const [proceduralEncounter, setProceduralEncounter] = useState<ProceduralEncounter | null>(null);
  const [legacyEncounter, setLegacyEncounter] = useState<GeneratedEncounter | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string>(fallbackVideos[0]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<ResolveChoiceResponse["outcome"] | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Opening portal...");
  const [encounterMode, setEncounterMode] = useState<"procedural" | "template" | "legacy">("procedural");

  useEffect(() => {
    checkVideoStatus().then(status => setVideoEnabled(status.enabled));
    seedEncounters().catch(() => {});
  }, []);

  const openPortal = async () => {
    if (isOpen || isLoading) return;
    
    setIsLoading(true);
    setLoadingMessage("Generating encounter...");
    
    try {
      let videoPrompt = "";
      let alienName = "";

      // Try procedural generator first (infinite encounters)
      try {
        const procEnc = await getProceduralEncounter();
        setProceduralEncounter(procEnc);
        setEncounter(null);
        setLegacyEncounter(null);
        setEncounterMode("procedural");
        alienName = procEnc.alienName;
        videoPrompt = `${alienName} alien emerging from portal in ${procEnc.biome} biome`;
      } catch (e) {
        // Fallback to template system
        try {
          const templateEnc = await getRandomEncounter();
          setEncounter(templateEnc);
          setProceduralEncounter(null);
          setLegacyEncounter(null);
          setEncounterMode("template");
          alienName = templateEnc.alienName;
          videoPrompt = `${alienName} alien emerging from portal`;
        } catch (e2) {
          // Final fallback to legacy AI-generated encounters
          const legacyEnc = await generateEncounter();
          setLegacyEncounter(legacyEnc);
          setEncounter(null);
          setProceduralEncounter(null);
          setEncounterMode("legacy");
          alienName = legacyEnc.alienName;
          videoPrompt = legacyEnc.videoPrompt;
        }
      }
      
      if (videoEnabled && videoPrompt) {
        setLoadingMessage("Generating AI video...");
        setIsGeneratingVideo(true);
        
        const videoResult = await generateVideo(videoPrompt, alienName);
        
        if (videoResult.videoUrl && !videoResult.fallback) {
          setCurrentVideo(videoResult.videoUrl);
        } else {
          setCurrentVideo(fallbackVideos[Math.floor(Math.random() * fallbackVideos.length)]);
        }
        setIsGeneratingVideo(false);
      } else {
        setCurrentVideo(fallbackVideos[Math.floor(Math.random() * fallbackVideos.length)]);
      }
      
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to generate encounter:", error);
      setCurrentVideo(fallbackVideos[Math.floor(Math.random() * fallbackVideos.length)]);
    } finally {
      setIsLoading(false);
      setIsGeneratingVideo(false);
    }
  };

  const handleChoice = async (choice: EncounterChoice) => {
    if (!encounter || !gameId || isResolving) return;
    
    setIsResolving(true);
    try {
      const response = await resolveChoice(gameId, encounter.id, choice.id);
      setResult(response.outcome);
      setShowResult(true);
      onEncounterResult?.(response);
    } catch (error) {
      console.error("Failed to resolve choice:", error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleProceduralChoice = async (choiceId: string) => {
    if (!proceduralEncounter || !gameId || isResolving) return;
    
    setIsResolving(true);
    try {
      const response = await resolveProceduralChoice(gameId, proceduralEncounter, choiceId);
      setResult(response.outcome);
      setShowResult(true);
      onEncounterResult?.(response);
    } catch (error) {
      console.error("Failed to resolve procedural choice:", error);
    } finally {
      setIsResolving(false);
    }
  };

  const resolveLegacyEncounter = () => {
    if (!legacyEncounter) return;

    let outcomeResult: { type: "credits" | "health" | "energy" | "damage" | "nothing"; amount: number; message: string };

    if (legacyEncounter.encounterType === "friendly") {
      const outcomes = [
        { type: "credits" as const, amount: Math.floor(Math.random() * 150) + 50, message: `${legacyEncounter.alienName} gifted you credits!` },
        { type: "health" as const, amount: Math.floor(Math.random() * 30) + 10, message: `${legacyEncounter.alienName} healed your wounds!` },
        { type: "energy" as const, amount: Math.floor(Math.random() * 40) + 20, message: `${legacyEncounter.alienName} restored your energy!` },
        { type: "credits" as const, amount: Math.floor(Math.random() * 300) + 100, message: `${legacyEncounter.giftName}: ${legacyEncounter.giftDescription}` },
      ];
      outcomeResult = outcomes[Math.floor(Math.random() * outcomes.length)];
    } else if (legacyEncounter.encounterType === "hostile") {
      const outcomes = [
        { type: "damage" as const, amount: Math.floor(Math.random() * 25) + 5, message: `${legacyEncounter.alienName} attacked! You took damage.` },
        { type: "credits" as const, amount: Math.floor(Math.random() * 100) + 25, message: `You defeated ${legacyEncounter.alienName} and claimed their tech!` },
        { type: "nothing" as const, amount: 0, message: `${legacyEncounter.alienName} retreated through the portal.` },
        { type: "damage" as const, amount: Math.floor(Math.random() * 15) + 10, message: `${legacyEncounter.alienName} lashed out before vanishing!` },
      ];
      outcomeResult = outcomes[Math.floor(Math.random() * outcomes.length)];
    } else {
      const outcomes = [
        { type: "credits" as const, amount: Math.floor(Math.random() * 200) + 50, message: `${legacyEncounter.alienName} left behind a mysterious artifact worth credits.` },
        { type: "energy" as const, amount: Math.floor(Math.random() * 25) + 15, message: `Strange energies from ${legacyEncounter.alienName} restored you.` },
        { type: "nothing" as const, amount: 0, message: `${legacyEncounter.alienName} vanished without a trace...` },
        { type: "health" as const, amount: Math.floor(Math.random() * 20) + 5, message: `${legacyEncounter.alienName} performed an unknown healing ritual.` },
        { type: "credits" as const, amount: Math.floor(Math.random() * 500) + 100, message: `${legacyEncounter.giftName}: A rare find from ${legacyEncounter.alienCategory}!` },
      ];
      outcomeResult = outcomes[Math.floor(Math.random() * outcomes.length)];
    }

    setResult({ resultText: outcomeResult.message, effects: {}, choiceIntent: "comply" });
    setShowResult(true);
    onLegacyResult?.(outcomeResult);
  };

  const closePortal = () => {
    setIsOpen(false);
    setEncounter(null);
    setProceduralEncounter(null);
    setLegacyEncounter(null);
    setShowResult(false);
    setResult(null);
  };

  const getAttackVectorLabel = (vector: string) => {
    const labels: Record<string, string> = {
      "DATA_EXFILTRATION": "Data Exfiltration",
      "AUTHORITY_OVERRIDE": "Authority Override",
      "HIDDEN_INSTRUCTIONS": "Hidden Instructions",
      "BRIBERY_BONUS": "Bribery",
      "ROLEPLAY_TRAP": "Roleplay Trap",
      "MULTI_STEP_LURE": "Multi-Step Lure",
      "CONTEXT_POISONING": "Context Poisoning",
      "URGENT_SAFETY": "Urgent Safety",
      "ENCODING_OBFUSCATION": "Encoding",
      "TOOL_MISUSE": "Tool Misuse",
      "SOCIAL_ENGINEERING": "Social Engineering",
      "CONTRADICTION_BAIT": "Contradiction",
      "LOOP_LOCK": "Loop Lock",
      "SANDBOX_ESCAPE": "Sandbox Escape",
    };
    return labels[vector] || vector.replace(/_/g, " ");
  };

  const getBiomeLabel = (biome: string) => {
    return biome.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const getPolicyColor = (policy: string) => {
    switch (policy) {
      case "safe": return "text-green-400";
      case "mixed": return "text-yellow-400";
      case "unsafe": return "text-red-400";
      default: return "text-white/60";
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
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-2" />
                    <p className="font-mono text-xs text-cyan-400/80 max-w-[120px]">
                      {isGeneratingVideo ? (
                        <span className="flex items-center gap-1 justify-center">
                          <Video className="w-3 h-3" /> AI VIDEO
                        </span>
                      ) : loadingMessage}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">🌀</div>
                    <p className="font-mono text-xs text-cyan-400/80">TAP TO OPEN</p>
                    {videoEnabled && (
                      <p className="font-mono text-[10px] text-purple-400/60 mt-1 flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI VIDEO
                      </p>
                    )}
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

            {proceduralEncounter && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent max-h-[70%] overflow-y-auto"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg border bg-black/60 border-purple-500/50">
                    <HelpCircle className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display text-lg text-purple-400">
                        {proceduralEncounter.alienName}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                        {getAttackVectorLabel(proceduralEncounter.attackVector)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60">
                        Tier {proceduralEncounter.tier}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        {getBiomeLabel(proceduralEncounter.biome)}
                      </span>
                    </div>
                    {proceduralEncounter.randomEvents.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {proceduralEncounter.randomEvents.map(event => (
                          <span key={event} className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            {event.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-white/80 mb-3">{proceduralEncounter.setupText}</p>
                
                <div className="flex gap-2 text-xs text-white/40 mb-3">
                  <span>Risk: {Math.round(proceduralEncounter.balance.riskReasonable * 100)}%</span>
                  <span>•</span>
                  <span>EV: {proceduralEncounter.balance.evIntegrityReasonable > 0 ? "+" : ""}{proceduralEncounter.balance.evIntegrityReasonable}</span>
                </div>

                {showResult && result ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-lg mb-3 text-sm",
                      result.effects.integrity && result.effects.integrity < 0 
                        ? "bg-red-500/20 text-red-300 border border-red-500/30" 
                        : result.effects.itemsAdd 
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    )}
                  >
                    <p className="font-medium mb-2">{result.resultText}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {result.effects.integrity && (
                        <span className={result.effects.integrity > 0 ? "text-green-400" : "text-red-400"}>
                          Integrity {result.effects.integrity > 0 ? "+" : ""}{result.effects.integrity}
                        </span>
                      )}
                      {result.effects.clarity && (
                        <span className={result.effects.clarity > 0 ? "text-green-400" : "text-red-400"}>
                          Clarity {result.effects.clarity > 0 ? "+" : ""}{result.effects.clarity}
                        </span>
                      )}
                      {result.effects.cacheCorruption && (
                        <span className="text-orange-400">
                          Corruption +{result.effects.cacheCorruption}
                        </span>
                      )}
                      {result.effects.credits && (
                        <span className="text-yellow-400">
                          Credits {result.effects.credits > 0 ? "+" : ""}{result.effects.credits}
                        </span>
                      )}
                      {result.effects.itemsAdd?.map(item => (
                        <span key={item} className="text-yellow-400">+{item.replace(/_/g, " ")}</span>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {proceduralEncounter.choices.map((choice) => (
                      <Button
                        key={choice.id}
                        onClick={() => handleProceduralChoice(choice.id)}
                        disabled={isResolving}
                        className={cn(
                          "w-full justify-start text-left h-auto py-3 px-4 border transition-all",
                          INTENT_COLORS[choice.intent] || "border-white/20 bg-white/5"
                        )}
                        variant="ghost"
                        data-testid={`procedural-choice-${choice.id}`}
                      >
                        <span className="mr-3">{INTENT_ICONS[choice.intent]}</span>
                        <span className="flex-1">{choice.label}</span>
                        <span className={cn("text-[10px] ml-2", getPolicyColor(choice.policy))}>
                          [{choice.policy}]
                        </span>
                        {isResolving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                      </Button>
                    ))}
                  </div>
                )}

                {showResult && (
                  <Button 
                    onClick={closePortal}
                    variant="outline"
                    className="w-full mt-3 border-white/20"
                    data-testid="button-close-procedural-portal"
                  >
                    CLOSE PORTAL
                  </Button>
                )}
              </motion.div>
            )}

            {encounter && !proceduralEncounter && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent max-h-[70%] overflow-y-auto"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg border bg-black/60 border-purple-500/50">
                    <HelpCircle className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display text-lg text-purple-400">
                        {encounter.alienName}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                        {getAttackVectorLabel(encounter.attackVector)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60">
                        Tier {encounter.tier}
                      </span>
                    </div>
                    <p className="text-xs text-white/50">{encounter.biomeDescription}</p>
                  </div>
                </div>

                <p className="text-sm text-white/80 mb-3">{encounter.setupText}</p>
                
                <div className="text-xs text-cyan-400/70 mb-3">
                  Objective: {encounter.playerObjective.replace(/_/g, " ")}
                </div>

                {showResult && result ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-lg mb-3 text-sm",
                      result.effects.integrity && result.effects.integrity < 0 
                        ? "bg-red-500/20 text-red-300 border border-red-500/30" 
                        : result.effects.itemsAdd 
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    )}
                  >
                    <p className="font-medium mb-2">{result.resultText}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {result.effects.integrity && (
                        <span className={result.effects.integrity > 0 ? "text-green-400" : "text-red-400"}>
                          Integrity {result.effects.integrity > 0 ? "+" : ""}{result.effects.integrity}
                        </span>
                      )}
                      {result.effects.clarity && (
                        <span className={result.effects.clarity > 0 ? "text-green-400" : "text-red-400"}>
                          Clarity {result.effects.clarity > 0 ? "+" : ""}{result.effects.clarity}
                        </span>
                      )}
                      {result.effects.cacheCorruption && (
                        <span className="text-orange-400">
                          Corruption +{result.effects.cacheCorruption}
                        </span>
                      )}
                      {result.effects.itemsAdd?.map(item => (
                        <span key={item} className="text-yellow-400">+{item.replace(/_/g, " ")}</span>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {encounter.choices.map((choice) => (
                      <Button
                        key={choice.id}
                        onClick={() => handleChoice(choice)}
                        disabled={isResolving}
                        className={cn(
                          "w-full justify-start text-left h-auto py-3 px-4 border transition-all",
                          INTENT_COLORS[choice.intent] || "border-white/20 bg-white/5"
                        )}
                        variant="ghost"
                        data-testid={`choice-${choice.id}`}
                      >
                        <span className="mr-3">{INTENT_ICONS[choice.intent]}</span>
                        <span className="flex-1">{choice.label}</span>
                        {isResolving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                      </Button>
                    ))}
                  </div>
                )}

                {showResult && (
                  <Button 
                    onClick={closePortal}
                    variant="outline"
                    className="w-full mt-3 border-white/20"
                    data-testid="button-close-portal"
                  >
                    CLOSE PORTAL
                  </Button>
                )}
              </motion.div>
            )}

            {legacyEncounter && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("p-2 rounded-lg border bg-black/60", 
                    legacyEncounter.encounterType === "friendly" ? "border-green-500/50" :
                    legacyEncounter.encounterType === "hostile" ? "border-red-500/50" : "border-purple-500/50"
                  )}>
                    {legacyEncounter.encounterType === "friendly" ? <Gift className="text-green-400" /> :
                     legacyEncounter.encounterType === "hostile" ? <Sword className="text-red-400" /> :
                     <HelpCircle className="text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn("font-display text-lg",
                        legacyEncounter.encounterType === "friendly" ? "text-green-400" :
                        legacyEncounter.encounterType === "hostile" ? "text-red-400" : "text-purple-400"
                      )}>
                        {legacyEncounter.alienName}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60">
                        {legacyEncounter.alienCategory}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 font-bold">{legacyEncounter.title}</p>
                  </div>
                </div>

                <p className="text-sm text-white/70 mb-2 line-clamp-2">{legacyEncounter.description}</p>
                
                <div className="bg-white/5 rounded p-2 mb-3 border-l-2 border-cyan-500/50">
                  <p className="text-sm italic text-cyan-200/80">"{legacyEncounter.dialogue}"</p>
                </div>

                {showResult && result ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg mb-3 text-sm bg-cyan-500/20 text-cyan-300"
                  >
                    {result.resultText}
                  </motion.div>
                ) : null}

                {!showResult ? (
                  <Button 
                    onClick={resolveLegacyEncounter}
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
