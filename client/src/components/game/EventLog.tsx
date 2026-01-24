import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'combat' | 'loot' | 'alert';
  timestamp: string;
}

interface EventLogProps {
  logs: LogEntry[];
}

export function EventLog({ logs }: EventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col bg-card/60 backdrop-blur-sm border border-primary/10 rounded overflow-hidden">
      <div className="panel-header flex justify-between items-center">
        <span className="font-mono text-[10px] text-primary/80 tracking-[0.2em]">MISSION LOG</span>
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </div>
      
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="p-3 space-y-1.5">
          {logs.map((log, index) => (
            <div 
              key={log.id} 
              className={cn(
                "text-xs font-mono leading-relaxed animate-in fade-in slide-in-from-left-1 duration-200",
                log.type === 'alert' && "text-destructive",
                log.type === 'combat' && "text-orange-400",
                log.type === 'loot' && "text-secondary",
                log.type === 'info' && "text-muted-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="opacity-40 mr-1.5">[{log.timestamp}]</span>
              <span>{log.text}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-muted-foreground/50 italic text-xs text-center py-8">
              Awaiting transmission...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
