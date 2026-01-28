import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { GameLayout } from "@/components/layout/GameLayout";
import { StatusPanel } from "@/components/game/StatusPanel";
import { HeroStatsPanel, type HeroStats } from "@/components/game/HeroStatsPanel";
import { EventLog } from "@/components/game/EventLog";
import { Controls } from "@/components/game/Controls";
import { ActionDisplay } from "@/components/game/ActionDisplay";
import { Portal } from "@/components/game/Portal";
import { getActiveGame, performAction, applyPortalResult, type PortalResult, type ResolveChoiceResponse } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Game() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch active game state
  const { data: gameState, isLoading, error } = useQuery({
    queryKey: ["game"],
    queryFn: getActiveGame,
    refetchInterval: false,
    retry: false,
  });

  // Action mutation
  const actionMutation = useMutation({
    mutationFn: ({ gameId, action }: { gameId: string; action: string }) =>
      performAction(gameId, action),
    onSuccess: (data) => {
      queryClient.setQueryData(["game"], data);
    },
  });

  // Portal result mutation
  const portalMutation = useMutation({
    mutationFn: ({ gameId, result }: { gameId: string; result: PortalResult }) =>
      applyPortalResult(gameId, result),
    onSuccess: (data) => {
      queryClient.setQueryData(["game"], data);
    },
  });

  // Redirect to home if no active game
  useEffect(() => {
    if (error) {
      setLocation("/");
    }
  }, [error, setLocation]);

  const handleAction = (action: string) => {
    if (!gameState?.session) return;
    actionMutation.mutate({ gameId: gameState.session.id, action });
  };

  const handlePortalResult = (result: PortalResult) => {
    if (!gameState?.session) return;
    portalMutation.mutate({ gameId: gameState.session.id, result });
  };

  const handleNewEncounterResult = (response: ResolveChoiceResponse) => {
    queryClient.setQueryData(["game"], {
      session: response.session,
      logs: response.logs,
      encounter: null,
    });
  };

  if (isLoading) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center h-full">
          <div className="space-y-4 text-center">
            <Skeleton className="h-12 w-64 mx-auto bg-primary/20" />
            <Skeleton className="h-8 w-96 mx-auto bg-primary/10" />
            <div className="font-mono text-primary animate-pulse">
              INITIALIZING QUANTUM INTERFACE...
            </div>
          </div>
        </div>
      </GameLayout>
    );
  }

  if (!gameState) {
    return null;
  }

  const { session, logs, encounter } = gameState;

  // Transform encounter for display
  const displayEncounter = encounter ? {
    type: encounter.type,
    name: encounter.name,
    description: encounter.description,
  } : null;

  // Transform logs for EventLog component
  const displayLogs = logs.map(log => ({
    id: log.id,
    text: log.text,
    type: log.type as 'info' | 'combat' | 'loot' | 'alert',
    timestamp: log.timestamp,
  }));

  return (
    <GameLayout>
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Left Panel: Status & Logs */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-4 h-full">
          <div className="flex-none">
            <Link href="/wiki">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-primary/30 hover:bg-primary/20 text-primary font-mono text-xs"
                data-testid="link-wiki"
              >
                ALIEN RACES WIKI
              </Button>
            </Link>
          </div>
          <div className="flex-1 min-h-0">
            <Tabs defaultValue="combat" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 bg-black/40">
                <TabsTrigger value="combat" className="text-xs font-mono" data-testid="tab-combat-stats">
                  COMBAT
                </TabsTrigger>
                <TabsTrigger value="status" className="text-xs font-mono" data-testid="tab-status">
                  STATUS
                </TabsTrigger>
              </TabsList>
              <TabsContent value="combat" className="flex-1 mt-2 overflow-hidden">
                <HeroStatsPanel 
                  stats={{
                    health: session.health,
                    maxHealth: session.maxHealth,
                    energy: session.energy,
                    maxEnergy: session.maxEnergy,
                    ammunition: (session as any).ammunition ?? 100,
                    maxAmmunition: (session as any).maxAmmunition ?? 100,
                    armour: (session as any).armour ?? 50,
                    chargeBonus: (session as any).chargeBonus ?? 10,
                    leadership: (session as any).leadership ?? 75,
                    meleeAttack: (session as any).meleeAttack ?? 30,
                    meleeDefence: (session as any).meleeDefence ?? 25,
                    missileStrength: (session as any).missileStrength ?? 20,
                    range: (session as any).range ?? 150,
                    speed: (session as any).speed ?? 40,
                    weaponStrength: (session as any).weaponStrength ?? 35,
                    accuracy: (session as any).accuracy ?? 70,
                    replenishmentRate: (session as any).replenishmentRate ?? 5,
                    reloadTime: (session as any).reloadTime ?? 8,
                    credits: session.credits,
                    level: session.level,
                    integrity: (session as any).integrity ?? 100,
                    clarity: (session as any).clarity ?? 50,
                    cacheCorruption: (session as any).cacheCorruption ?? 0,
                  }}
                  showHiddenStats
                />
              </TabsContent>
              <TabsContent value="status" className="flex-1 mt-2 overflow-hidden">
                <StatusPanel 
                  health={session.health} 
                  maxHealth={session.maxHealth} 
                  energy={session.energy} 
                  maxEnergy={session.maxEnergy} 
                  credits={session.credits} 
                  level={session.level}
                  integrity={(session as any).integrity}
                  clarity={(session as any).clarity}
                  cacheCorruption={(session as any).cacheCorruption}
                  inventory={(session as any).inventory as string[] || []}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex-none max-h-[200px]">
            <EventLog logs={displayLogs} />
          </div>
        </div>

        {/* Center/Right Panel: Portal & Controls */}
        <div className="col-span-12 md:col-span-9 flex flex-col h-full gap-4">
          <div className="flex-1 bg-black/40 border border-primary/20 p-1 relative min-h-[400px]">
            {displayEncounter ? (
              <ActionDisplay encounter={displayEncounter} />
            ) : (
              <Portal 
                gameId={session.id}
                onEncounterResult={handleNewEncounterResult} 
                onLegacyResult={handlePortalResult}
              />
            )}
          </div>
          <div className="flex-none">
            <Controls 
              onAction={handleAction} 
              gameState={session.gameState as 'idle' | 'combat' | 'loot'} 
            />
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
