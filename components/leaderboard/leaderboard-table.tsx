'use client';

import React, { useState } from 'react';
import { Player } from '@/lib/types';
import Sprite from '../sprite';
import Image from 'next/image';

interface LeaderboardTableProps {
  players: Player[];
}

export default function LeaderboardTable({ players }: LeaderboardTableProps) {
  // Use a Set to track multiple expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Toggle individual row
  const toggleRow = (ign: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(ign)) {
      newExpandedRows.delete(ign);
    } else {
      newExpandedRows.add(ign);
    }
    setExpandedRows(newExpandedRows);
  };

  // Global toggle logic
  const isAllExpanded = expandedRows.size === players.length && players.length > 0;

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set(players.map((p) => p.ign)));
    }
  };

  return (
    <div className="border-2 border-emerald-500 bg-black p-1 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]">
      <table className="w-full text-sm font-mono text-emerald-400 relative">
        <thead className="bg-emerald-950/50 border-b-2 border-emerald-800">
          <tr>
            <th className="py-1 px-2 text-left w-16 border-r border-emerald-900">RANK</th>
            <th className="py-1 px-2 text-left border-r border-emerald-900">
              <div className="flex items-center justify-between">
                <span>PLAYER</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAll();
                  }}
                  className="text-[10px] bg-emerald-900/50 hover:bg-emerald-500 hover:text-black px-1 border border-emerald-700 transition-colors"
                >
                  {isAllExpanded ? 'COLLAPSE ALL' : 'EXPAND ALL'}
                </button>
              </div>
            </th>
            <th className="py-1 px-2 text-right w-20 border-r border-emerald-900">QTY</th>

            <th className="py-1 px-2 text-right w-28 relative group cursor-help">
              <div className="flex items-center justify-end gap-1">
                <span>SCORE</span>
                <span className="text-emerald-600 text-xs animate-pulse">[?]</span>
              </div>

              <div className="hidden group-hover:block absolute top-full right-0 mt-2 w-40 bg-black border border-emerald-500 p-2 z-10 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.5)] cursor-default">
                <div className="text-emerald-400 text-xs mb-1.5 border-b border-emerald-900 pb-1 text-left">
                  SCORING TABLE
                </div>
                <div className="text-emerald-300 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span>BASE SHINY:</span>
                    <span>+10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fuchsia-400">SECRET:</span>
                    <span className="text-fuchsia-400">+50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">ALPHA:</span>
                    <span className="text-red-400">+100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">SAFARI:</span>
                    <span className="text-green-400">+25</span>
                  </div>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => {
            const isExpanded = expandedRows.has(player.ign);

            return (
              <React.Fragment key={player.ign}>
                <tr
                  onClick={() => toggleRow(player.ign)}
                  className={`
                    cursor-pointer transition-colors border-b border-emerald-900/50
                    hover:bg-emerald-900/30 
                    ${isExpanded ? 'bg-emerald-900/20' : ''}
                  `}
                >
                  <td className="py-1 px-2 border-r border-emerald-900/50 text-emerald-600">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="py-1 px-2 border-r border-emerald-900/50 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>{player.ign}</span>
                    <span className="text-xs text-emerald-600">
                      {isExpanded ? '[-]' : '[+]'}
                    </span>
                  </td>
                  <td className="py-1 px-2 text-right border-r border-emerald-900/50 text-emerald-500">
                    {String(player.shinies.length).padStart(3, '0')}
                  </td>
                  <td className="py-1 px-2 text-right text-emerald-300 font-bold">
                    {String(player.score).padStart(5, '0')}
                  </td>
                </tr>

                {isExpanded && (
                  <tr className="bg-black">
                    <td colSpan={4} className="p-2 border-b-2 border-emerald-800">
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {player.shinies.map((shiny, sIdx) => (
                          <div
                            key={sIdx}
                            className="border border-emerald-900 p-1 flex flex-col items-center justify-center bg-emerald-950/20 hover:border-emerald-500 transition-colors"
                          >
                            <div className="w-8 h-8 bg-emerald-900/50 mb-1 flex items-center justify-center text-[8px] text-emerald-500">
                              <Sprite
                                dexNo={shiny.mon.dexNo}
                                sprite={shiny.mon.spriteFront}
                                name={shiny.mon.name}
                              />
                            </div>
                            <span className="text-[10px] leading-tight truncate w-full text-center text-emerald-200 uppercase">
                              {shiny.mon.name}
                            </span>
                            <div className="flex gap-1 mt-1">
                              {shiny.modifiers.secret && <Image src={"/secret_shiny.png"} alt='ss' width={12} height={12} />}
                              {shiny.modifiers.alpha && <Image src={"/alpha.png"} alt='alpha' width={12} height={12} />}
                              {shiny.modifiers.safari && <Image src={"/safari.png"} alt='safari' width={12} height={12} />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
