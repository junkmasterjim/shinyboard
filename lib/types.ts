export interface Shiny {
  mon: Mon
  modifiers: {
    secret: boolean;
    alpha: boolean;
    safari: boolean;
  };
}

export interface Mon {
  dexNo: number;
  name: string;
  spriteFront: string;
  spriteBack: string;
}

export interface Player {
  ign: string;
  shinies: Shiny[];
  score: number
}

export interface Leaderboard {
  metadata: {
    teamName: string;
    lastUpdated: string;
    totalTeamShinies: number;
  }
  players: Player[];
}
