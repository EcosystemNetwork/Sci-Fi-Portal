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

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col border border-primary/20 bg-black/40 rounded-sm overflow-hidden">
      <div className="bg-primary/10 px-3 py-1 border-b border-primary/20 flex justify-between items-center">
        <span className="font-mono text-xs text-primary uppercase tracking-widest">&gt;&gt; MISSION_LOG</span>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>
      
      <ScrollArea ref={scrollRef} className="flex-1 p-4 font-mono text-sm">
        <div className="space-y-2">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={cn(
                "mb-2 animate-in slide-in-from-left-2 fade-in duration-300",
                log.type === 'alert' && "text-destructive",
                log.type === 'combat' && "text-orange-400",
                log.type === 'loot' && "text-secondary",
                log.type === 'info' && "text-primary/80"
              )}
            >
              <span className="opacity-50 text-[10px] mr-2">[{log.timestamp}]</span>
              <span>{log.text}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-muted-foreground italic text-xs text-center mt-10">
              Awaiting system input...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
