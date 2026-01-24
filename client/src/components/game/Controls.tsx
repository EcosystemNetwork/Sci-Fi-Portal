import { Button } from "@/components/ui/button";
import { Sword, Footprints, Search, DoorOpen } from "lucide-react";

interface ControlsProps {
  onAction: (action: string) => void;
  gameState: 'idle' | 'combat' | 'loot';
}

export function Controls({ onAction, gameState }: ControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-card/60 backdrop-blur-sm border border-primary/10 rounded">
      {gameState === 'idle' && (
        <>
          <Button 
            className="h-12 bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 text-primary border border-primary/30 font-display tracking-wider text-sm btn-glow"
            onClick={() => onAction('explore')}
            data-testid="button-scan"
          >
            <Search className="mr-2 h-4 w-4" /> SCAN SECTOR
          </Button>
          <Button 
            variant="outline"
            className="h-12 border-primary/20 text-primary/80 hover:bg-primary/10 hover:text-primary font-display tracking-wider text-sm"
            onClick={() => onAction('move')}
            data-testid="button-move"
          >
            <Footprints className="mr-2 h-4 w-4" /> ADVANCE
          </Button>
        </>
      )}

      {gameState === 'combat' && (
        <>
          <Button 
            className="h-12 bg-gradient-to-r from-destructive/80 to-destructive/60 hover:from-destructive hover:to-destructive/80 text-white font-display tracking-wider text-sm shadow-[0_0_20px_hsl(var(--destructive)/0.3)]"
            onClick={() => onAction('attack')}
            data-testid="button-attack"
          >
            <Sword className="mr-2 h-4 w-4" /> ENGAGE
          </Button>
          <Button 
            variant="outline"
            className="h-12 border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 font-display tracking-wider text-sm"
            onClick={() => onAction('flee')}
            data-testid="button-flee"
          >
            <DoorOpen className="mr-2 h-4 w-4" /> WARP OUT
          </Button>
        </>
      )}

      {gameState === 'loot' && (
        <>
          <Button 
            className="h-12 bg-gradient-to-r from-secondary/80 to-secondary/60 hover:from-secondary hover:to-secondary/80 text-white font-display tracking-wider text-sm shadow-[0_0_20px_hsl(var(--secondary)/0.3)]"
            onClick={() => onAction('loot')}
            data-testid="button-harvest"
          >
            <Search className="mr-2 h-4 w-4" /> HARVEST
          </Button>
          <Button 
            variant="outline"
            className="h-12 border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 font-display tracking-wider text-sm"
            onClick={() => onAction('ignore')}
            data-testid="button-ignore"
          >
            IGNORE
          </Button>
        </>
      )}
    </div>
  );
}
