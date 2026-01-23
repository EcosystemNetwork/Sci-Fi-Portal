import { useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { StatusPanel } from "@/components/game/StatusPanel";
import { EventLog } from "@/components/game/EventLog";
import { Controls } from "@/components/game/Controls";
import { ActionDisplay } from "@/components/game/ActionDisplay";

// Types
interface Log {
  id: string;
  text: string;
  type: 'info' | 'combat' | 'loot' | 'alert';
  timestamp: string;
}

interface Encounter {
  type: 'enemy' | 'loot' | 'empty';
  name: string;
  description: string;
}

export default function Game() {
  // Game State
  const [health, setHealth] = useState(100);
  const [maxHealth] = useState(100);
  const [energy, setEnergy] = useState(85);
  const [maxEnergy] = useState(100);
  const [credits, setCredits] = useState(250);
  const [level, setLevel] = useState(1);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'combat' | 'loot'>('idle');
  const [logs, setLogs] = useState<Log[]>([
    { id: '1', text: 'System initialized. Neural link established.', type: 'info', timestamp: '00:00:01' },
    { id: '2', text: 'Portal coordinates locked. Awaiting input.', type: 'info', timestamp: '00:00:02' }
  ]);

  // Helper to add logs
  const addLog = (text: string, type: Log['type'] = 'info') => {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs(prev => [...prev, { id: Math.random().toString(), text, type, timestamp }]);
  };

  // Actions
  const handleAction = (action: string) => {
    switch (action) {
      case 'explore':
        const rand = Math.random();
        if (rand > 0.6) {
          setEncounter({
            type: 'enemy',
            name: 'Void Stalker',
            description: 'A shifting shadow entity composed of dark matter. It seems to be feeding on the local energy grid.'
          });
          setGameState('combat');
          addLog('Hostile signature detected! Void Stalker engaging.', 'alert');
        } else if (rand > 0.3) {
           setEncounter({
            type: 'loot',
            name: 'Data Cache',
            description: 'An encrypted fragment of an old probe. Could contain valuable credits or schematics.'
          });
          setGameState('loot');
          addLog('Encrypted signal found.', 'loot');
        } else {
          setEncounter(null);
          setGameState('idle');
          addLog('Sector clear. No significant signatures.', 'info');
        }
        break;
      
      case 'move':
        setEncounter(null);
        setGameState('idle');
        setEnergy(prev => Math.max(0, prev - 5));
        addLog('Moving to next sector sector. Energy consumed: 5', 'info');
        break;

      case 'attack':
        // Combat Logic Mock
        const damage = Math.floor(Math.random() * 20) + 10;
        const enemyDmg = Math.floor(Math.random() * 15) + 5;
        
        addLog(`You fire a plasma burst dealing ${damage} damage.`, 'combat');
        addLog(`Void Stalker retaliates causing ${enemyDmg} damage to hull.`, 'alert');
        
        setHealth(prev => Math.max(0, prev - enemyDmg));
        
        if (Math.random() > 0.5) {
          setEncounter(null);
          setGameState('idle');
          setCredits(prev => prev + 50);
          addLog('Target eliminated. +50 Credits harvested.', 'loot');
        }
        break;

      case 'flee':
        setEncounter(null);
        setGameState('idle');
        setEnergy(prev => Math.max(0, prev - 20));
        addLog('Emergency warp initiated. Escaped successfully.', 'info');
        break;

      case 'loot':
        setEncounter(null);
        setGameState('idle');
        setCredits(prev => prev + 100);
        addLog('Decryption successful. +100 Credits added to account.', 'loot');
        break;

      case 'ignore':
        setEncounter(null);
        setGameState('idle');
        addLog('Signal ignored.', 'info');
        break;
    }
  };

  return (
    <GameLayout>
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Left Panel: Status & Logs */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-6 h-full">
          <div className="flex-none h-auto">
            <StatusPanel 
              health={health} 
              maxHealth={maxHealth} 
              energy={energy} 
              maxEnergy={maxEnergy} 
              credits={credits} 
              level={level} 
            />
          </div>
          <div className="flex-1 min-h-0">
             <EventLog logs={logs} />
          </div>
        </div>

        {/* Center/Right Panel: Action & Controls */}
        <div className="col-span-12 md:col-span-9 flex flex-col h-full gap-4">
          <div className="flex-1 bg-black/40 border border-primary/20 p-1 relative">
             <ActionDisplay encounter={encounter} />
          </div>
          <div className="flex-none">
            <Controls onAction={handleAction} gameState={gameState} />
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
