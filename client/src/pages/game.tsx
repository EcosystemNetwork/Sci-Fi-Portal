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
import { InventoryPanel } from "@/components/game/InventoryPanel";
import { SkillTreePanel } from "@/components/game/SkillTreePanel";
import { RelationshipsPanel } from "@/components/game/RelationshipsPanel";
import { 
  getActiveGame, performAction, applyPortalResult, 
  getInventory, equipItem, unequipItem,
  getAllSkills, getPlayerSkills, unlockSkill,
  getRelationships, getEffectiveStats, seedRpgData, applyStarterKit,
  type PortalResult, type ResolveChoiceResponse, 
  type InventoryItem, type Skill, type PlayerSkill, type AlienRelationship,
  type EffectiveStats
} from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Game() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [rpgInitialized, setRpgInitialized] = useState(false);

  // Fetch active game state
  const { data: gameState, isLoading, error } = useQuery({
    queryKey: ["game"],
    queryFn: getActiveGame,
    refetchInterval: false,
    retry: false,
  });

  // RPG Queries
  const { data: inventory = [], refetch: refetchInventory } = useQuery({
    queryKey: ["inventory", gameState?.session?.id],
    queryFn: () => gameState?.session?.id ? getInventory(gameState.session.id) : Promise.resolve([]),
    enabled: !!gameState?.session?.id,
  });

  const { data: allSkills = [] } = useQuery({
    queryKey: ["allSkills"],
    queryFn: getAllSkills,
    staleTime: Infinity,
  });

  const { data: playerSkills = [], refetch: refetchPlayerSkills } = useQuery({
    queryKey: ["playerSkills", gameState?.session?.id],
    queryFn: () => gameState?.session?.id ? getPlayerSkills(gameState.session.id) : Promise.resolve([]),
    enabled: !!gameState?.session?.id,
  });

  const { data: relationships = [], refetch: refetchRelationships } = useQuery({
    queryKey: ["relationships", gameState?.session?.id],
    queryFn: () => gameState?.session?.id ? getRelationships(gameState.session.id) : Promise.resolve([]),
    enabled: !!gameState?.session?.id,
  });

  const { data: effectiveStats, refetch: refetchEffectiveStats } = useQuery({
    queryKey: ["effectiveStats", gameState?.session?.id],
    queryFn: () => gameState?.session?.id ? getEffectiveStats(gameState.session.id) : Promise.resolve(null),
    enabled: !!gameState?.session?.id && rpgInitialized,
  });

  // Initialize RPG data
  useEffect(() => {
    if (gameState?.session?.id && !rpgInitialized) {
      seedRpgData().then(() => {
        if (inventory.length === 0) {
          applyStarterKit(gameState.session.id).then(() => {
            refetchInventory();
            refetchRelationships();
            setRpgInitialized(true);
          }).catch(() => setRpgInitialized(true));
        } else {
          setRpgInitialized(true);
        }
      }).catch(() => setRpgInitialized(true));
    }
  }, [gameState?.session?.id, rpgInitialized, inventory.length]);

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

  // Equip mutation
  const equipMutation = useMutation({
    mutationFn: ({ gameId, itemId }: { gameId: string; itemId: string }) =>
      equipItem(gameId, itemId),
    onSuccess: () => {
      refetchInventory();
      refetchEffectiveStats();
    },
  });

  // Unequip mutation
  const unequipMutation = useMutation({
    mutationFn: ({ gameId, itemId }: { gameId: string; itemId: string }) =>
      unequipItem(gameId, itemId),
    onSuccess: () => {
      refetchInventory();
      refetchEffectiveStats();
    },
  });

  // Unlock skill mutation
  const unlockSkillMutation = useMutation({
    mutationFn: ({ gameId, skillId }: { gameId: string; skillId: string }) =>
      unlockSkill(gameId, skillId),
    onSuccess: (data) => {
      refetchPlayerSkills();
      refetchEffectiveStats();
      queryClient.setQueryData(["game"], (old: any) => ({
        ...old,
        session: data.session,
      }));
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
    refetchRelationships();
  };

  const handleEquip = (itemId: string) => {
    if (!gameState?.session) return;
    equipMutation.mutate({ gameId: gameState.session.id, itemId });
  };

  const handleUnequip = (itemId: string) => {
    if (!gameState?.session) return;
    unequipMutation.mutate({ gameId: gameState.session.id, itemId });
  };

  const handleUnlockSkill = (skillId: string) => {
    if (!gameState?.session) return;
    unlockSkillMutation.mutate({ gameId: gameState.session.id, skillId });
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

  // Build hero stats from effective stats when available
  const heroStats = effectiveStats?.effectiveStats ? {
    health: session.health,
    maxHealth: effectiveStats.effectiveStats.maxHealth ?? session.maxHealth,
    energy: session.energy,
    maxEnergy: effectiveStats.effectiveStats.maxEnergy ?? session.maxEnergy,
    ammunition: (session as any).ammunition ?? 100,
    maxAmmunition: effectiveStats.effectiveStats.maxAmmunition ?? (session as any).maxAmmunition ?? 100,
    armour: effectiveStats.effectiveStats.armour ?? (session as any).armour ?? 50,
    chargeBonus: effectiveStats.effectiveStats.chargeBonus ?? (session as any).chargeBonus ?? 10,
    leadership: effectiveStats.effectiveStats.leadership ?? (session as any).leadership ?? 75,
    meleeAttack: effectiveStats.effectiveStats.meleeAttack ?? (session as any).meleeAttack ?? 30,
    meleeDefence: effectiveStats.effectiveStats.meleeDefence ?? (session as any).meleeDefence ?? 25,
    missileStrength: effectiveStats.effectiveStats.missileStrength ?? (session as any).missileStrength ?? 20,
    range: effectiveStats.effectiveStats.range ?? (session as any).range ?? 150,
    speed: effectiveStats.effectiveStats.speed ?? (session as any).speed ?? 40,
    weaponStrength: effectiveStats.effectiveStats.weaponStrength ?? (session as any).weaponStrength ?? 35,
    accuracy: effectiveStats.effectiveStats.accuracy ?? (session as any).accuracy ?? 70,
    replenishmentRate: effectiveStats.effectiveStats.replenishmentRate ?? (session as any).replenishmentRate ?? 5,
    reloadTime: effectiveStats.effectiveStats.reloadTime ?? (session as any).reloadTime ?? 8,
    credits: session.credits,
    level: session.level,
    integrity: effectiveStats.effectiveStats.integrity ?? (session as any).integrity ?? 100,
    clarity: effectiveStats.effectiveStats.clarity ?? (session as any).clarity ?? 50,
    cacheCorruption: (session as any).cacheCorruption ?? 0,
  } : {
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
  };

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
              <TabsList className="grid w-full grid-cols-5 bg-black/40">
                <TabsTrigger value="combat" className="text-[10px] font-mono px-1" data-testid="tab-combat-stats">
                  STATS
                </TabsTrigger>
                <TabsTrigger value="inventory" className="text-[10px] font-mono px-1" data-testid="tab-inventory">
                  GEAR
                </TabsTrigger>
                <TabsTrigger value="skills" className="text-[10px] font-mono px-1" data-testid="tab-skills">
                  SKILLS
                </TabsTrigger>
                <TabsTrigger value="factions" className="text-[10px] font-mono px-1" data-testid="tab-factions">
                  FACTIONS
                </TabsTrigger>
                <TabsTrigger value="status" className="text-[10px] font-mono px-1" data-testid="tab-status">
                  LOG
                </TabsTrigger>
              </TabsList>
              <TabsContent value="combat" className="flex-1 mt-2 overflow-hidden">
                <HeroStatsPanel 
                  stats={heroStats}
                  showHiddenStats
                  bonuses={effectiveStats?.bonuses}
                />
              </TabsContent>
              <TabsContent value="inventory" className="flex-1 mt-2 overflow-hidden">
                <InventoryPanel 
                  inventory={inventory}
                  onEquip={handleEquip}
                  onUnequip={handleUnequip}
                  playerLevel={session.level}
                />
              </TabsContent>
              <TabsContent value="skills" className="flex-1 mt-2 overflow-hidden">
                <SkillTreePanel 
                  allSkills={allSkills}
                  playerSkills={playerSkills}
                  skillPoints={(session as any).skillPoints ?? 3}
                  onUnlock={handleUnlockSkill}
                />
              </TabsContent>
              <TabsContent value="factions" className="flex-1 mt-2 overflow-hidden">
                <RelationshipsPanel relationships={relationships} />
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
