// Shared local storage wrapper to synchronize states across routes

export type Team = {
  id: string;
  name: string;
  captain: string;
  logo: string; // Will hold logo path keys ("shield", "crown", "target", etc.) instead of emojis
  points?: number; // Explicit team points from PDF
};

export type Transaction = {
  id: string;
  amount: number; // positive for credits/refunds, negative for debits/purchases
  description: string;
  date: string;
};

export type Player = {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string; // Optional password to handle API variations, defaults to standard string
  teamId: string | null;
  points: number;
  role: "player" | "captain" | "admin";
  walletId: string;
  cashWalletBalance: number;
  voucherWalletBalance: number;
  transactions?: Transaction[];
  avatar?: string;
};

export type Application = {
  id: string;
  playerName: string;
  playerId: string;
  targetTeamName: string;
  targetTeamId: string;
  status: "pending" | "approved" | "declined";
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  rentPrice?: number;
  image: string;
  category: "Board Games" | "Card Games" | "Puzzles";
  availability?: "rent" | "purchase" | "both";
  stock?: number;
  specs?: {
    players?: string;
    playTime?: string;
    age?: string;
    contents?: string[];
  };
};

export type TicketTier = {
  name: string;
  price: number;
};

export type EventSession = {
  date: string;
  time: string;
};

export type GameEvent = {
  id: string;
  title: string;
  date: string; // Fallback primary date
  time: string; // Fallback primary time
  location: string;
  price: number; // Fallback base price
  description: string;
  posterUrl?: string; // Custom poster image URL
  tiers?: TicketTier[];
  sessions?: EventSession[];
};

export type Ticket = {
  id: string;
  eventId: string;
  eventTitle: string;
  playerId: string | null;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  totalPaid: number;
  status: "purchased" | "checked_in";
  tierName?: string;
  sessionDate?: string;
  sessionTime?: string;
};

export interface AppNotification {
  id: string;
  userId: string; // "admin" or playerId
  title: string;
  message: string;
  type: "wallet" | "team" | "ticket" | "system" | "support" | "inventory";
  status: "unread" | "read";
  createdAt: string;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyHtml: string;
  sentAt: string;
}

export interface WithdrawalRequest {
  id: string;
  playerId: string;
  playerName: string;
  amount: number;
  paymentDetails: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
}

// Baselines
export const INITIAL_TEAMS: Team[] = [
  { id: "t1", name: "Team Orbit", captain: "Akinyemi Samuel", logo: "shield", points: 28 },
  { id: "t2", name: "Team Green Lantern", captain: "Ojie Imoloame", logo: "target", points: 24 },
  { id: "t3", name: "Team Sunflower", captain: "Demi Banwo", logo: "crown", points: 19 },
  { id: "t4", name: "Team Red Riot", captain: "Olufayo Hephzibah", logo: "sword", points: 0 }
];

export const INITIAL_PLAYERS: Player[] = [
  // MAPPED CAPTAINS (with test logins and wallet credits)
  { id: "p1", name: "Akinyemi Samuel", username: "samuel", email: "gbenga@company.com", password: "password123", teamId: "t1", points: 12, role: "captain", walletId: "GSH-1849-3829", cashWalletBalance: 5000, voucherWalletBalance: 10000, transactions: [{ id: "tx1", amount: 15000, description: "Welcome Roster Captain Bonus (Split)", date: "2026-07-01" }] },
  { id: "p4", name: "Ojie Imoloame", username: "imoloame", email: "sarah@company.com", password: "password123", teamId: "t2", points: 9, role: "captain", walletId: "GSH-4829-1049", cashWalletBalance: 2000, voucherWalletBalance: 3000, transactions: [{ id: "tx3", amount: 5000, description: "Roster Management Allowance (Split)", date: "2026-07-02" }] },
  { id: "p6", name: "Demi Banwo", username: "banwo", email: "michael@company.com", password: "password123", teamId: "t3", points: 8, role: "captain", walletId: "GSH-8392-4829", cashWalletBalance: 10000, voucherWalletBalance: 10000, transactions: [{ id: "tx4", amount: 20000, description: "Chess Tournament Winner Prize (Split)", date: "2026-07-03" }] },
  { id: "p2", name: "Olufayo Hephzibah", username: "hepzibah", email: "tunde@company.com", password: "password123", teamId: "t4", points: 0, role: "captain", walletId: "GSH-9402-1829", cashWalletBalance: 3000, voucherWalletBalance: 7000, transactions: [{ id: "tx2", amount: 10000, description: "Lagos Trivia Event Winner Credit (Split)", date: "2026-07-04" }] },
  
  // ADMIN ACCOUNT
  { id: "p9", name: "Admin User", username: "admin", email: "admin@gameshut.ng", password: "admin123", teamId: null, points: 0, role: "admin", walletId: "GSH-0000-0000", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] }
];

export const INITIAL_APPLICATIONS: Application[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_EMAIL_LOGS: EmailLog[] = [];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "g4",
    "name": "Police and Thief",
    "description": "After a successful heist, a group of robbers try to cheat themselves off the loot.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/police_n_tiff.jpg",
    "category": "Card Games",
    "availability": "purchase",
    "specs": {
      "players": "👥 2–6 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g1",
    "name": "Fetch Quest",
    "description": "A group of warriors race to reach a gold mine — they must overcome the terrain and each other.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/fetch_quest.jpg",
    "category": "Card Games",
    "availability": "rent",
    "specs": {
      "players": "👥 2–8 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g2",
    "name": "Your Village People",
    "description": "A battle to be the last player standing as you combat what your village people throw at you.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/your_village_people.jpg",
    "category": "Card Games",
    "availability": "rent",
    "specs": {
      "players": "👥 2–8 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g3",
    "name": "One Chance",
    "description": "Monopoly meets Lagos Survival. Players are given the slice of surviving in Lagos.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/one_chance.jpg",
    "category": "Card Games",
    "availability": "rent",
    "specs": {
      "players": "👥 2–12 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g5",
    "name": "Ludo",
    "description": "The classic dice rolling game with the battle of leading your group to a safe zone.",
    "price": 10000,
    "rentPrice": 2500,
    "image": "/images/games/ludo.jpg",
    "category": "Board Games",
    "availability": "purchase",
    "specs": {
      "players": "👥 2–4 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g6",
    "name": "Dicemo",
    "description": "A list of quests and 4 dice to roll to fulfil them.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/dicemo.jpg",
    "category": "Board Games",
    "availability": "rent",
    "specs": {
      "players": "👥 2–4 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g7",
    "name": "Durbar Festival Puzzle",
    "description": "A jigsaw puzzle (500 pieces) — a vivid scene from Nigeria's iconic Durbar festival.",
    "price": 15000,
    "rentPrice": 3000,
    "image": "/images/games/durbar_festival_puzzle.jpg",
    "category": "Puzzles",
    "availability": "both",
    "specs": {
      "players": "👥 1–8 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g8",
    "name": "New Yam Festival Puzzle",
    "description": "A jigsaw puzzle (500 pieces) celebrating the iconic New Yam Festival.",
    "price": 15000,
    "rentPrice": 3000,
    "image": "/images/games/new_yam_festival_puzzle.jpg",
    "category": "Puzzles",
    "availability": "both",
    "specs": {
      "players": "👥 1–8 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g9",
    "name": "Egungun Festival Puzzle",
    "description": "A jigsaw puzzle (500 pieces) depicting the mystical Egungun masquerade.",
    "price": 15000,
    "rentPrice": 3000,
    "image": "/images/games/egungun_festival_puzzle.jpg",
    "category": "Puzzles",
    "availability": "both",
    "specs": {
      "players": "👥 1–8 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g10",
    "name": "Map of Africa Puzzle",
    "description": "A jigsaw puzzle of the African continent — educational and challenging.",
    "price": 15000,
    "rentPrice": 3000,
    "image": "/images/games/map_of_africa_puzzle.jpg",
    "category": "Puzzles",
    "availability": "both",
    "specs": {
      "players": "👥 1–8 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g11",
    "name": "Na Lie",
    "description": "A card discarding bluffing game — can you spot who's lying?",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/na_lie.jpg",
    "category": "Card Games",
    "availability": "both",
    "specs": {
      "players": "👥 2–4 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g12",
    "name": "Insects",
    "description": "A fun card discarding game using insects as a primer.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/insects.jpg",
    "category": "Puzzles",
    "availability": "both",
    "specs": {
      "players": "👥 2–8 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g13",
    "name": "Vuum",
    "description": "A fast-paced card discarding game matching objects by colour, shape and pattern.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/vuum.jpg",
    "category": "Puzzles",
    "availability": "both",
    "specs": {
      "players": "👥 2–8 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g14",
    "name": "Fight in the Hive",
    "description": "A card discarding and race to destination game.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/fight_in_the_hive.jpg",
    "category": "Puzzles",
    "availability": "both",
    "specs": {
      "players": "👥 2–4 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g15",
    "name": "Balloon Headed Man",
    "description": "A tabletop fencing game — quick reflexes and sharp moves win the duel.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/balloon_headed_man.jpg",
    "category": "Puzzles",
    "availability": "rent",
    "specs": {
      "players": "👥 2 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g16",
    "name": "Chess",
    "description": "A classic strategy game of kings, queens, and tactical warfare.",
    "price": 10000,
    "rentPrice": 2500,
    "image": "/images/games/chess.jpg",
    "category": "Board Games",
    "availability": "purchase",
    "specs": {
      "players": "👥 2 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g17",
    "name": "Tic Tac Toe (Digital)",
    "description": "A digital version of the classic 'X' and 'O' game.",
    "price": 18000,
    "rentPrice": 3600,
    "image": "/images/games/tic_tac_toe_digital.jpg",
    "category": "Board Games",
    "availability": "rent",
    "specs": {
      "players": "👥 2 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g18",
    "name": "Ayo / Mancala",
    "description": "An ancient African seed picking strategy game — simple rules, deep strategy.",
    "price": 10000,
    "rentPrice": 2500,
    "image": "/images/games/ayo_mancala.jpg",
    "category": "Board Games",
    "availability": "purchase",
    "specs": {
      "players": "👥 2 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g19",
    "name": "How Nigerian Are You?",
    "description": "Charades with a Nigerian backdrop — a hilarious test of cultural knowledge.",
    "price": 18000,
    "rentPrice": 3600,
    "image": "/images/games/how_nigerian_are_you.jpg",
    "category": "Card Games",
    "availability": "purchase",
    "specs": {
      "players": "👥 2–12 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g20",
    "name": "No Gree",
    "description": "Charades with a Nigerian backdrop — no giving up allowed!",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/no_gree.jpg",
    "category": "Card Games",
    "availability": "both",
    "specs": {
      "players": "👥 2–8 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g21",
    "name": "ISANJA",
    "description": "A fast guessing board game about Nigeria — test your knowledge of the nation.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/isanja.jpg",
    "category": "Board Games",
    "availability": "purchase",
    "specs": {
      "players": "👥 2–10 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g22",
    "name": "Canta Ball",
    "description": "Classic Nigerian Tabletop Soccer — flick your way to victory on the pitch.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/canta_ball.jpg",
    "category": "Card Games",
    "availability": "rent",
    "specs": {
      "players": "👥 2 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g23",
    "name": "Village War",
    "description": "A card discarding game with a twist — wage war between villages.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/village_war.jpg",
    "category": "Board Games",
    "availability": "both",
    "specs": {
      "players": "👥 2–5 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g24",
    "name": "Ase",
    "description": "A card discarding game about Nigerian gods — invoke divine power to win.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/ase.jpg",
    "category": "Card Games",
    "availability": "rent",
    "specs": {
      "players": "👥 2–4 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g25",
    "name": "Whot",
    "description": "Classic card discard game where players match number to number or shapes.",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/whot.jpg",
    "category": "Card Games",
    "availability": "purchase",
    "specs": {
      "players": "👥 2–6 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  },
  {
    "id": "g26",
    "name": "Shut the Box",
    "description": "Dice rolling game where players compete to shut the box — press your luck!",
    "price": 12000,
    "rentPrice": 2500,
    "image": "/images/games/shut_the_box.jpg",
    "category": "Board Games",
    "availability": "both",
    "specs": {
      "players": "👥 2–4 Players",
      "playTime": "30 - 60 Mins",
      "age": "10+",
      "contents": [
        "Premium quality board and components",
        "Official rules sheet & manual",
        "Sturdy storage case"
      ]
    }
  }
];

export const INITIAL_EVENTS: GameEvent[] = [
  {
    id: "e1",
    title: "Lagos Tabletop Strategy Mixer",
    date: "June 27, 2026",
    time: "6:00 PM - 10:00 PM",
    location: "Immersia Lounge, Victoria Island, Lagos",
    price: 5000,
    description: "Our signature physical game night. Meet strategy game enthusiasts, enjoy good drinks, and participate in casual matches of Catan, Chess, and corporate icebreakers.",
    posterUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=600&auto=format&fit=crop",
    tiers: [
      { name: "Standard Entry", price: 5000 },
      { name: "Premium VIP", price: 15000 }
    ],
    sessions: [
      { date: "June 27, 2026", time: "6:00 PM - 10:00 PM" }
    ]
  },
  {
    id: "e2",
    title: "National Schools Trivia Championships",
    date: "July 04, 2026",
    time: "10:00 AM - 4:00 PM",
    location: "Unilag Main Auditorium, Yaba, Lagos",
    price: 2000,
    description: "Witness secondary schools from across the region battle in general-knowledge trivia. Entry tickets grant access to the spectator gallery and the interactive games zones.",
    posterUrl: "https://images.unsplash.com/photo-1518152006812-cdab29b069a8?q=80&w=600&auto=format&fit=crop",
    tiers: [
      { name: "Student Spectator", price: 1000 },
      { name: "General Audience", price: 2000 },
      { name: "VIP Gallery Pass", price: 5000 }
    ],
    sessions: [
      { date: "July 04, 2026", time: "10:00 AM - 4:00 PM" },
      { date: "July 05, 2026", time: "10:00 AM - 4:00 PM" }
    ]
  },
  {
    id: "e3",
    title: "Corporate Boardroom Battle",
    date: "July 18, 2026",
    time: "4:00 PM - 9:00 PM",
    location: "GamesHut Arena, Lekki, Lagos",
    price: 15000,
    description: "A specialized networking mixer designed for corporate teams. Form teams of 4 to compete in high-stakes strategy games, team puzzles, and physical communication tasks.",
    posterUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    tiers: [
      { name: "Single Player Entry", price: 15000 },
      { name: "Team Ticket (4 Players)", price: 50000 }
    ],
    sessions: [
      { date: "July 18, 2026", time: "4:00 PM - 9:00 PM" }
    ]
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "tk1",
    eventId: "e1",
    eventTitle: "Lagos Tabletop Strategy Mixer",
    playerId: "p8",
    buyerName: "Femi Cole",
    buyerEmail: "femi@company.com",
    quantity: 2,
    totalPaid: 10000,
    status: "purchased",
    tierName: "Standard Entry",
    sessionDate: "June 27, 2026",
    sessionTime: "6:00 PM - 10:00 PM"
  },
  {
    id: "tk2",
    eventId: "e2",
    eventTitle: "National Schools Trivia Championships",
    playerId: "p2",
    buyerName: "Tunde Alabi",
    buyerEmail: "tunde@company.com",
    quantity: 1,
    totalPaid: 2000,
    status: "checked_in",
    tierName: "General Audience",
    sessionDate: "July 04, 2026",
    sessionTime: "10:00 AM - 4:00 PM"
  }
];

const KEYS = {
  PLAYERS: "gh_players",
  TEAMS: "gh_teams",
  APPLICATIONS: "gh_applications",
  PRODUCTS: "gh_products_v2",
  EVENTS: "gh_events",
  TICKETS: "gh_tickets",
  NOTIFICATIONS: "gh_notifications",
  EMAIL_LOGS: "gh_email_logs",
  WITHDRAWALS: "gh_withdrawals"
};

const isBrowser = typeof window !== "undefined";

export const storage = {
  async syncServer(key: string, data: any) {
    if (!isBrowser) return;
    try {
      await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: data })
      });
    } catch (e) {
      console.error(`Failed to sync ${key} to server:`, e);
    }
  },

  async syncFromServer() {
    if (!isBrowser) return;
    try {
      const res = await fetch("/api/db");
      const json = await res.json();
      if (json.success) {
        if (json.data && Object.keys(json.data).length > 0) {
          const serverState = json.data;
          const keyMap: Record<string, string> = {
            players: KEYS.PLAYERS,
            teams: KEYS.TEAMS,
            applications: KEYS.APPLICATIONS,
            products: KEYS.PRODUCTS,
            events: KEYS.EVENTS,
            tickets: KEYS.TICKETS,
            notifications: KEYS.NOTIFICATIONS,
            email_logs: KEYS.EMAIL_LOGS,
            withdrawals: KEYS.WITHDRAWALS
          };

          Object.keys(keyMap).forEach(serverKey => {
            const clientKey = keyMap[serverKey];
            const serverData = serverState[serverKey];
            if (serverData !== undefined) {
              localStorage.setItem(clientKey, JSON.stringify(serverData));
            }
          });
        } else {
          // Seed the server database if empty
          this.getPlayers();
          this.getTeams();
          this.getApplications();
          this.getProducts();
          this.getEvents();
          this.getTickets();
          this.getNotifications();
          this.getEmailLogs();
          this.getWithdrawals();

          const initialState = {
            players: JSON.parse(localStorage.getItem(KEYS.PLAYERS) || "[]"),
            teams: JSON.parse(localStorage.getItem(KEYS.TEAMS) || "[]"),
            applications: JSON.parse(localStorage.getItem(KEYS.APPLICATIONS) || "[]"),
            products: JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || "[]"),
            events: JSON.parse(localStorage.getItem(KEYS.EVENTS) || "[]"),
            tickets: JSON.parse(localStorage.getItem(KEYS.TICKETS) || "[]"),
            notifications: JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || "[]"),
            email_logs: JSON.parse(localStorage.getItem(KEYS.EMAIL_LOGS) || "[]"),
            withdrawals: JSON.parse(localStorage.getItem(KEYS.WITHDRAWALS) || "[]")
          };

          await fetch("/api/db", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(initialState)
          });
        }
      }
    } catch (e) {
      console.error("Failed to sync database state from server:", e);
    }
  },
  getPlayers(): Player[] {
    if (!isBrowser) return INITIAL_PLAYERS;
    const data = localStorage.getItem(KEYS.PLAYERS);
    if (!data) {
      localStorage.setItem(KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
      return INITIAL_PLAYERS;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.some(p => p.name === "Gbenga Daniel")) {
        localStorage.setItem(KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
        localStorage.setItem(KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
        return INITIAL_PLAYERS;
      }
      return parsed;
    } catch {
      return INITIAL_PLAYERS;
    }
  },

  async setPlayers(players: Player[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.PLAYERS, JSON.stringify(players));
    await this.syncServer("players", players);
  },

  getTeams(): Team[] {
    if (!isBrowser) return INITIAL_TEAMS;
    const data = localStorage.getItem(KEYS.TEAMS);
    if (!data) {
      localStorage.setItem(KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
      return INITIAL_TEAMS;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.some(t => t.name === "Tactical Titans")) {
        localStorage.setItem(KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
        localStorage.setItem(KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
        return INITIAL_TEAMS;
      }
      return parsed;
    } catch {
      return INITIAL_TEAMS;
    }
  },

  async setTeams(teams: Team[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.TEAMS, JSON.stringify(teams));
    await this.syncServer("teams", teams);
  },

  getApplications(): Application[] {
    if (!isBrowser) return INITIAL_APPLICATIONS;
    const data = localStorage.getItem(KEYS.APPLICATIONS);
    if (!data) {
      localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_APPLICATIONS;
    }
  },

  async setApplications(apps: Application[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
    await this.syncServer("applications", apps);
  },

  getProducts(): Product[] {
    if (!isBrowser) return INITIAL_PRODUCTS.map(p => ({ ...p, stock: p.stock !== undefined ? p.stock : 10 }));
    const data = localStorage.getItem(KEYS.PRODUCTS);
    if (!data) {
      const seeded = INITIAL_PRODUCTS.map(p => ({ ...p, stock: p.stock !== undefined ? p.stock : 10 }));
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(seeded));
      return seeded;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.some(p => p.id.startsWith('p')) || parsed.length !== INITIAL_PRODUCTS.length) {
        const seeded = INITIAL_PRODUCTS.map(p => ({ ...p, stock: p.stock !== undefined ? p.stock : 10 }));
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(seeded));
        return seeded;
      }
      return parsed.map(p => ({ ...p, stock: p.stock !== undefined ? p.stock : 10 }));
    } catch {
      return INITIAL_PRODUCTS.map(p => ({ ...p, stock: 10 }));
    }
  },

  async setProducts(products: Product[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    await this.syncServer("products", products);
  },

  getEvents(): GameEvent[] {
    if (!isBrowser) return INITIAL_EVENTS;
    const data = localStorage.getItem(KEYS.EVENTS);
    if (!data) {
      localStorage.setItem(KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_EVENTS;
    }
  },

  async setEvents(events: GameEvent[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
    await this.syncServer("events", events);
  },

  getTickets(): Ticket[] {
    if (!isBrowser) return INITIAL_TICKETS;
    const data = localStorage.getItem(KEYS.TICKETS);
    if (!data) {
      localStorage.setItem(KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_TICKETS;
    }
  },

  async setTickets(tickets: Ticket[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
    await this.syncServer("tickets", tickets);
  },

  getNotifications(): AppNotification[] {
    if (!isBrowser) return INITIAL_NOTIFICATIONS;
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (!data) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  async setNotifications(notifications: AppNotification[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    await this.syncServer("notifications", notifications);
  },

  addNotification(userId: string, title: string, message: string, type: AppNotification["type"]) {
    if (!isBrowser) return;
    const current = this.getNotifications();
    const newNotif: AppNotification = {
      id: "n_" + Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      type,
      status: "unread",
      createdAt: new Date().toISOString()
    };
    this.setNotifications([newNotif, ...current]);
  },

  getEmailLogs(): EmailLog[] {
    if (!isBrowser) return INITIAL_EMAIL_LOGS;
    const data = localStorage.getItem(KEYS.EMAIL_LOGS);
    if (!data) {
      localStorage.setItem(KEYS.EMAIL_LOGS, JSON.stringify(INITIAL_EMAIL_LOGS));
      return INITIAL_EMAIL_LOGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_EMAIL_LOGS;
    }
  },

  async setEmailLogs(logs: EmailLog[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.EMAIL_LOGS, JSON.stringify(logs));
    await this.syncServer("email_logs", logs);
  },

  addEmailLog(recipientEmail: string, recipientName: string, subject: string, bodyHtml: string) {
    if (!isBrowser) return;
    const current = this.getEmailLogs();
    const newLog: EmailLog = {
      id: "em_" + Math.random().toString(36).substr(2, 9),
      recipientEmail,
      recipientName,
      subject,
      bodyHtml,
      sentAt: new Date().toISOString()
    };
    this.setEmailLogs([newLog, ...current]);

    // Dispatch background POST request to send real email if API is available
    fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: recipientEmail,
        name: recipientName,
        subject: subject,
        html: bodyHtml
      })
    }).then(res => res.json())
      .then(json => {
        if (!json.success && json.error && !json.error.includes("not configured")) {
          console.warn("Outbound email dispatch warning:", json.error);
        }
      })
      .catch(e => console.error("Failed to post outbound email dispatch:", e));
  },

  getWithdrawals(): WithdrawalRequest[] {
    if (!isBrowser) return INITIAL_WITHDRAWALS;
    const data = localStorage.getItem(KEYS.WITHDRAWALS);
    if (!data) {
      localStorage.setItem(KEYS.WITHDRAWALS, JSON.stringify(INITIAL_WITHDRAWALS));
      return INITIAL_WITHDRAWALS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_WITHDRAWALS;
    }
  },

  async setWithdrawals(withdrawals: WithdrawalRequest[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
    await this.syncServer("withdrawals", withdrawals);
  },

  addWithdrawal(playerId: string, playerName: string, amount: number, paymentDetails: string) {
    if (!isBrowser) return;
    const current = this.getWithdrawals();
    const newWd: WithdrawalRequest = {
      id: "wd_" + Math.random().toString(36).substr(2, 9),
      playerId,
      playerName,
      amount,
      paymentDetails,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    this.setWithdrawals([newWd, ...current]);
  },

  factoryReset() {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
    localStorage.setItem(KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(KEYS.EMAIL_LOGS, JSON.stringify(INITIAL_EMAIL_LOGS));
    localStorage.setItem(KEYS.WITHDRAWALS, JSON.stringify(INITIAL_WITHDRAWALS));

    const resetState = {
      players: INITIAL_PLAYERS,
      teams: INITIAL_TEAMS,
      applications: INITIAL_APPLICATIONS,
      products: INITIAL_PRODUCTS,
      events: INITIAL_EVENTS,
      tickets: INITIAL_TICKETS,
      notifications: INITIAL_NOTIFICATIONS,
      email_logs: INITIAL_EMAIL_LOGS,
      withdrawals: INITIAL_WITHDRAWALS
    };

    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resetState)
    }).catch(e => console.error("Failed to sync factory reset to server:", e));
  }
};
