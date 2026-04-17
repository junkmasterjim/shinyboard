"use client"

import { useState, useMemo, useEffect } from 'react';
import { mons } from "@/lib/mons";
import { Player, Shiny, Leaderboard } from "@/lib/types";
import initialData from "@/lib/leaderboard.json";
import Image from 'next/image';

export default function LeaderboardAdmin() {
  const [players, setPlayers] = useState<Player[]>(initialData.players || []);
  const [teamName, setTeamName] = useState(initialData.metadata?.teamName || "Team Name");
  const [importText, setImportText] = useState("");
  const [mounted, setMounted] = useState(false);

  // Combobox State
  const [search, setSearch] = useState("");
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Collapse State (Tracks which players are collapsed by IGN)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(Object.fromEntries((initialData.players || []).map(p => [p.ign, true])));

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePlayerScore = (shinies: Shiny[]): number => {
    return shinies.reduce((total, s) => {
      let base = 10;
      if (s.modifiers.secret) base += 50;
      if (s.modifiers.alpha) base += 100;
      if (s.modifiers.safari) base += 25;
      return total + base;
    }, 0);
  };

  const addPlayer = (ign: string) => {
    if (!ign || players.find(p => p.ign.toLowerCase() === ign.toLowerCase())) return;
    setPlayers([...players, { ign, shinies: [], score: 0 }]);
    // Ensure new players are expanded by default
    setCollapsed(prev => ({ ...prev, [ign]: false }));
  };

  const removePlayer = (ign: string) => {
    if (confirm(`Delete ${ign} from database?`)) {
      setPlayers(players.filter(p => p.ign !== ign));
    }
  };

  const toggleCollapse = (ign: string) => {
    setCollapsed(prev => ({ ...prev, [ign]: !prev[ign] }));
  };

  const addShinyToPlayer = (playerIgn: string, monDexNo: number) => {
    const mon = mons.find(m => m.dexNo === monDexNo);
    if (!mon) return;
    const newShiny: Shiny = {
      mon,
      modifiers: { secret: false, alpha: false, safari: false }
    };
    setPlayers(players.map(p => p.ign === playerIgn ? { ...p, shinies: [...p.shinies, newShiny] } : p));
    setSearch("");
    setActivePlayer(null);
    setSelectedIndex(-1);
  };

  const toggleModifier = (playerIgn: string, shinyIndex: number, mod: keyof Shiny['modifiers']) => {
    setPlayers(players.map(p => {
      if (p.ign === playerIgn) {
        const newShinies = [...p.shinies];
        const currentMods = { ...newShinies[shinyIndex].modifiers };
        currentMods[mod] = !currentMods[mod];
        if (mod === 'alpha' && currentMods.alpha) currentMods.safari = false;
        if (mod === 'safari' && currentMods.safari) currentMods.alpha = false;
        newShinies[shinyIndex] = { ...newShinies[shinyIndex], modifiers: currentMods };
        return { ...p, shinies: newShinies };
      }
      return p;
    }));
  };

  const removeShiny = (playerIgn: string, shinyIndex: number) => {
    setPlayers(players.map(p => p.ign === playerIgn ? { ...p, shinies: p.shinies.filter((_, i) => i !== shinyIndex) } : p));
  };

  const filteredMons = useMemo(() => {
    if (!search) return [];
    return mons.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.dexNo.toString() === search
    ).slice(0, 8);
  }, [search]);

  // Handle Keyboard Navigation for Combobox
  const handleKeyDown = (e: React.KeyboardEvent, playerIgn: string) => {
    if (filteredMons.length === 0) return;

    if (e.key === "ArrowDown") {
      setSelectedIndex(prev => (prev < filteredMons.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      addShinyToPlayer(playerIgn, filteredMons[selectedIndex].dexNo);
    } else if (e.key === "Escape") {
      setSearch("");
      setActivePlayer(null);
    }
  };

  const leaderboardData: Leaderboard = useMemo(() => {
    const processedPlayers = players.map(p => ({
      ...p,
      score: calculatePlayerScore(p.shinies)
    })).sort((a, b) => b.score - a.score);

    return {
      metadata: {
        teamName,
        lastUpdated: mounted ? new Date().toISOString() : initialData.metadata.lastUpdated,
        totalTeamShinies: processedPlayers.reduce((acc, p) => acc + p.shinies.length, 0),
      },
      players: processedPlayers,
    };
  }, [players, teamName, mounted]);

  return (
    <div className="min-h-screen bg-black text-[#00ff41] font-mono p-6 selection:bg-[#00ff41] selection:text-black">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <header className="border-2 border-[#00ff41] p-6 bg-[#00ff41]/5 shadow-[0_0_20px_rgba(0,255,65,0.15)]">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-2">
              <input
                className="bg-transparent text-4xl font-black outline-none border-b-2 border-dashed border-[#00ff41]/30 focus:border-[#00ff41] transition-all tracking-tighter"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <p className="text-xs opacity-70 tracking-[0.3em]">
                ADMIN INTERFACE // {mounted ? leaderboardData.metadata.lastUpdated : "INITIALIZING..."}
              </p>
            </div>
            <div className="flex gap-3">
              <textarea
                placeholder="Paste JSON..."
                className="bg-black border border-[#00ff41]/40 p-2 text-[10px] w-32 h-12 outline-none focus:border-[#00ff41] text-[#00ff41]"
                onChange={(e) => setImportText(e.target.value)}
              />
              <button
                onClick={() => { try { setPlayers(JSON.parse(importText).players); } catch (e) { alert("Parse Error"); } }}
                className="border-2 border-[#00ff41] px-6 py-2 hover:bg-[#00ff41] hover:text-black transition-all font-bold text-sm"
              >
                SYNC DATA
              </button>
            </div>
          </div>
        </header>

        {/* Add Player */}
        <div className="border border-[#00ff41]/30 bg-black p-4 flex items-center gap-4 shadow-[inset_0_0_10px_rgba(0,255,65,0.05)]">
          <span className="text-xl font-bold animate-pulse">{">"}</span>
          <input
            placeholder="REGISTER NEW PLAYER IGN..."
            className="flex-1 bg-transparent border-none outline-none text-[#00ff41] placeholder:text-[#00ff41]/20 font-bold tracking-widest"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addPlayer(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </div>

        {/* Players List */}
        <div className="space-y-6">
          {leaderboardData.players.map((player) => (
            <div key={player.ign} className="border border-[#00ff41]/60 bg-black shadow-[5px_5px_0px_rgba(0,255,65,0.1)] transition-all">

              {/* Player Header - Now Clickable to Toggle */}
              <div
                className="border-b border-[#00ff41]/60 p-4 flex justify-between items-center bg-[#00ff41]/5 cursor-pointer hover:bg-[#00ff41]/10 transition-colors"
                onClick={() => toggleCollapse(player.ign)}
              >
                <div className="flex items-center gap-6 sm:gap-10">
                  <span className="text-xl font-bold w-6 text-center select-none">
                    {collapsed[player.ign] ? '[+]' : '[-]'}
                  </span>
                  <h3 className="text-2xl font-black tracking-tighter truncate max-w-[150px] sm:max-w-none">{player.ign}</h3>
                  <div className="flex flex-col text-center">
                    <span className="text-[10px] opacity-50 font-bold uppercase tracking-widest leading-none mb-1">SHINIES</span>
                    <span className="text-2xl font-black text-emerald-500">{player.shinies.length}</span>
                  </div>
                  <div className="flex flex-col text-center">
                    <span className="text-[10px] opacity-50 font-bold uppercase tracking-widest leading-none mb-1">Score</span>
                    <span className="text-2xl font-black text-emerald-500">{player.score}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removePlayer(player.ign); }}
                  className="text-[10px] text-[#00ff41]/40 hover:text-red-500 hover:border-red-500 border border-[#00ff41]/20 px-3 py-1 font-bold transition-colors"
                >
                  DELETE PLAYER
                </button>
              </div>

              {/* Player Body - Conditionally Rendered */}
              {!collapsed[player.ign] && (
                <div className="p-4 space-y-4">
                  {/* Searchable Combobox */}
                  <div className="relative">
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder={`+ SEARCH POKEMON FOR ${player.ign.toUpperCase()}...`}
                      className="w-full bg-black border border-[#00ff41]/30 p-3 text-xs text-[#00ff41] outline-none focus:border-[#00ff41] uppercase tracking-widest"
                      value={activePlayer === player.ign ? search : ""}
                      onKeyDown={(e) => handleKeyDown(e, player.ign)}
                      onChange={(e) => {
                        setActivePlayer(player.ign);
                        setSearch(e.target.value);
                        setSelectedIndex(-1);
                      }}
                    />
                    {activePlayer === player.ign && filteredMons.length > 0 && (
                      <div className="absolute z-50 w-full bg-black border-x border-b border-[#00ff41] shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
                        {filteredMons.map((m, i) => (
                          <div
                            key={m.dexNo}
                            role="button"
                            tabIndex={0}
                            className={`p-2 cursor-pointer flex justify-between items-center text-xs border-b border-[#00ff41]/10 last:border-0 outline-none
                              ${selectedIndex === i ? 'bg-[#00ff41] text-black' : 'hover:bg-[#00ff41]/20'}
                            `}
                            onClick={() => addShinyToPlayer(player.ign, m.dexNo)}
                            onMouseEnter={() => setSelectedIndex(i)}
                          >
                            <span>#{String(m.dexNo).padStart(3, '0')} {m.name.toUpperCase()}</span>
                            {selectedIndex === i && <span className="text-[10px] font-black tracking-tighter">[ PRESS ENTER ]</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Shinies Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
                    {player.shinies.map((s, idx) => (
                      <div key={idx} className="border border-[#00ff41]/20 p-2 relative group hover:border-[#00ff41] bg-black transition-all">
                        <button onClick={() => removeShiny(player.ign, idx)} className="absolute -top-1 -right-1 bg-[#00ff41] text-black text-[10px] w-4 h-4 flex items-center justify-center font-bold z-10 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                        <img src={s.mon.spriteFront} alt={s.mon.name} className="w-12 h-12 mx-auto pixelated drop-shadow-[0_0_5px_rgba(0,255,65,0.4)]" loading="lazy" />
                        <p className="text-[8px] text-center mt-2 opacity-40 uppercase truncate tracking-tighter">{s.mon.name}</p>
                        <div className="flex justify-center gap-1 mt-2">
                          {(['secret', 'alpha', 'safari'] as const).map(mod => (
                            <button
                              key={mod}
                              onClick={() => toggleModifier(player.ign, idx, mod)}
                              className={`text-[8px] w-5 h-5 border ${s.modifiers[mod] ? 'bg-[#00ff41] text-black border-[#00ff41]' : 'border-[#00ff41]/20 text-[#00ff41]/20'} font-bold transition-all relative`}
                            >
                              {mod == 'secret' && <Image src={"/secret_shiny.png"} alt='ss' fill />}
                              {mod == 'alpha' && <Image src={"/alpha.png"} alt='alpha' fill />}
                              {mod == 'safari' && <Image src={"/safari.png"} alt='safari' fill />}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data Output */}
        <footer className="border-2 border-[#00ff41] bg-black p-8 shadow-[0_0_40px_rgba(0,255,65,0.1)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black tracking-[0.4em] uppercase">Export Buffer</h2>
            <button
              onClick={() => { navigator.clipboard.writeText(JSON.stringify(leaderboardData, null, 2)); alert("Buffer Copied!"); }}
              className="bg-[#00ff41] text-black px-10 py-3 font-black text-xs hover:bg-white transition-all shadow-[6px_6px_0px_rgba(0,255,65,0.2)]"
            >
              COPY JSON
            </button>
          </div>
          <div className="relative border border-[#00ff41]/30 p-6 bg-[#00ff41]/5 group">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,255,65,0.03),rgba(0,255,65,0.01),rgba(0,255,65,0.03))] opacity-50 bg-[length:100%_4px,4px_100%]"></div>
            <pre className="text-[11px] font-mono text-[#00ff41]/80 overflow-auto max-h-80 scrollbar-thin scrollbar-thumb-[#00ff41]">
              {mounted ? JSON.stringify(leaderboardData, null, 2) : "GENERATING..."}
            </pre>
          </div>
        </footer>
      </div>
    </div>
  );
}
