import { Button } from "@/components/ui/button";
import { Sword, Footprints, Search, DoorOpen, Skull } from "lucide-react";

interface ControlsProps {
  onAction: (action: string) => void;
  gameState: 'idle' | 'combat' | 'loot';
}

export function Controls({ onAction, gameState }: ControlsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-t border-primary/20 bg-black/20">
      {gameState === 'idle' && (
        <>
          <Button 
            variant="outline" 
            className="h-14 border-primary/50 hover:bg-primary/20 hover:text-primary font-display tracking-widest uppercase text-lg"
            onClick={() => onAction('explore')}
          >
            <Search className="mr-2 h-5 w-5" /> Scan Sector
          </Button>
          <Button 
            variant="outline" 
            className="h-14 border-primary/50 hover:bg-primary/20 hover:text-primary font-display tracking-widest uppercase text-lg"
            onClick={() => onAction('move')}
          >
            <Footprints className="mr-2 h-5 w-5" /> Move Forward
          </Button>
        </>
      )}

      {gameState === 'combat' && (
        <>
          <Button 
            variant="default" 
            className="h-14 bg-destructive hover:bg-destructive/80 text-destructive-foreground font-display tracking-widest uppercase text-lg border-none shadow-[0_0_15px_rgba(255,0,0,0.5)]"
            onClick={() => onAction('attack')}
          >
            <Sword className="mr-2 h-5 w-5" /> Engage Hostile
          </Button>
          <Button 
            variant="secondary" 
            className="h-14 bg-primary/20 hover:bg-primary/30 text-primary font-display tracking-widest uppercase text-lg border border-primary/50"
            onClick={() => onAction('flee')}
          >
            <DoorOpen className="mr-2 h-5 w-5" /> Emergency Warp
          </Button>
        </>
      )}

      {gameState === 'loot' && (
        <>
          <Button 
            variant="default" 
            className="h-14 bg-secondary hover:bg-secondary/80 text-white font-display tracking-widest uppercase text-lg border-none shadow-[0_0_15px_rgba(255,0,255,0.5)]"
            onClick={() => onAction('loot')}
          >
            <Search className="mr-2 h-5 w-5" /> Harvest Data
          </Button>
          <Button 
            variant="outline" 
            className="h-14 border-primary/50 hover:bg-primary/20 hover:text-primary font-display tracking-widest uppercase text-lg"
            onClick={() => onAction('ignore')}
          >
            Ignore Signal
          </Button>
        </>
      )}
    </div>
  );
}
