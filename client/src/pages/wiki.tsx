import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { getAllAlienRaces, getWikiStats } from "@/lib/api";
import type { AlienRace } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Wiki() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRace, setSelectedRace] = useState<AlienRace | null>(null);

  const { data: races = [], isLoading } = useQuery({
    queryKey: ["alienRaces"],
    queryFn: getAllAlienRaces,
  });

  const { data: stats } = useQuery({
    queryKey: ["wikiStats"],
    queryFn: getWikiStats,
  });

  const categories = stats?.categoryList || [];

  const filteredRaces = races.filter(race =>
    race.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    race.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRacesByCategory = (category: string) =>
    filteredRaces.filter(r => r.category === category);

  return (
    <div className="min-h-screen bg-background text-foreground font-rajdhani">
      <header className="border-b border-primary/30 bg-black/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="link-back-game">
                &larr; Back to Game
              </Button>
            </Link>
            <h1 className="text-2xl font-orbitron text-primary tracking-wider">
              ALIEN RACES WIKI
            </h1>
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            {stats?.totalRaces || 0} races | {stats?.categories || 0} categories
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search alien races..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-black/40 border-primary/30 text-foreground placeholder:text-muted-foreground"
            data-testid="input-search"
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <Tabs defaultValue={categories[0] || "all"} className="w-full">
              <TabsList className="flex flex-wrap gap-1 h-auto bg-black/40 p-2 mb-4">
                {categories.map(category => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="text-xs px-3 py-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    data-testid={`tab-${category.toLowerCase().replace(/\//g, '-')}`}
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map(category => (
                <TabsContent key={category} value={category} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getRacesByCategory(category).map(race => (
                      <button
                        key={race.id}
                        onClick={() => setSelectedRace(race)}
                        className={`text-left p-4 border rounded-lg transition-all hover:bg-primary/10 ${
                          selectedRace?.id === race.id
                            ? "border-primary bg-primary/20"
                            : "border-primary/20 bg-black/40"
                        }`}
                        data-testid={`card-race-${race.id}`}
                      >
                        <h3 className="font-orbitron text-sm text-primary mb-1">{race.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{race.description}</p>
                      </button>
                    ))}
                  </div>
                  {getRacesByCategory(category).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No races found matching your search.
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 border border-primary/30 rounded-lg bg-black/60 p-6">
              {selectedRace ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-orbitron text-xl text-primary">{selectedRace.name}</h2>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {selectedRace.category}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs uppercase text-muted-foreground mb-1">Description</h4>
                      <p className="text-sm">{selectedRace.description || "No description available."}</p>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase text-muted-foreground mb-1">Traits</h4>
                      <p className="text-sm">{selectedRace.traits || "Unknown traits."}</p>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase text-muted-foreground mb-1">Video Prompt</h4>
                      <p className="text-xs font-mono bg-black/40 p-3 rounded border border-primary/20 break-words">
                        {selectedRace.videoPrompt || "No prompt available."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-4xl mb-4">👽</div>
                  <p>Select an alien race to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
