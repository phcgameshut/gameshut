// Shared local storage wrapper to synchronize states across routes
import { showToast } from "./toast";
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
  hasSignedUp?: boolean;
  status?: "active" | "restricted" | "blocked";
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
  capacity?: number;
  soldOut?: boolean;
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
  isThirdParty?: boolean;
  thirdPartyUrl?: string;
  rawSessions?: any[]; // Raw form session array for edit hydration
  showRemainingCount?: boolean; // Toggle displaying remaining ticket count to users
  revenue?: number;
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
  paymentReference?: string;
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

export interface PatreonTransaction {
  id: string;
  userId: string;
  email: string;
  amount: number;
  type: "donation" | "subscription";
  tier: string;
  interval: string;
  status: "active" | "cancelled" | "completed";
  createdAt: string;
}

// --- DAILY GAMES MODELS ---

export type GameTypeSlug = "trivia" | "word-hunt" | "match-up" | "who-am-i" | "mystery";
export type ChallengeStatus = "GENERATING" | "VALIDATING" | "APPROVED" | "REJECTED" | "SCHEDULED" | "LIVE" | "ARCHIVED";

export interface DailyChallenge {
  id: string;
  gameTypeId: GameTypeSlug;
  challengeNumber: number;
  challengeDate: string; // YYYY-MM-DD
  content: any; // The game specific payload
  solution: any; // The correct answer/solution
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
  generationMetadata?: { provider: string; model: string; generatorVersion: string };
  validationMetadata?: { isValid: boolean; warnings?: string[] };
  status: ChallengeStatus;
  publishedAt?: string;
  createdAt: string;
}

export interface GameAttempt {
  id: string;
  userId: string; // Guest sessionId or Player id
  challengeId: string;
  startedAt: string;
  completedAt?: string;
  score: number;
  normalizedScore: number;
  attemptCount: number;
  hintsUsed: number;
  won: boolean;
  resultData?: any; // Game specific attempt details
}

export interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate?: string;
  updatedAt: string;
}

export interface GameStreak {
  userId: string;
  gameTypeId: GameTypeSlug;
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate?: string;
}

export interface UserGameStats {
  userId: string;
  gameTypeId: GameTypeSlug;
  gamesPlayed: number;
  gamesWon: number;
  perfectGames: number;
  totalScore: number;
  averageScore: number;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  sourceId?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  criteria: any;
  xpReward: number;
  icon: string;
  active: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
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
  { id: "p9", name: "Admin User", username: "admin", email: "admin@gameshut.ng", password: "admin123", teamId: null, points: 0, role: "admin", walletId: "GSH-0000-0000", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },

  // TEAM ORBIT PLAYERS
  { id: "p10", name: "Delegun Sumaiyyah", username: "dsumaiyyah", email: "dsumaiyyah@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1002", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p11", name: "Ajayi Olufisayo", username: "aolufisayo", email: "aolufisayo@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1003", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p12", name: "Oyinkansola Priscilla", username: "opriscilla", email: "opriscilla@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1004", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p13", name: "Junaid Hikmah", username: "jhikmah", email: "jhikmah@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1005", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p14", name: "Abdulateef Abdullahi", username: "aabdullahi", email: "aabdullahi@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1006", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p15", name: "Oluwadamilola Precious", username: "oprecious", email: "oprecious@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1007", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p16", name: "Akintomiwa Edun", username: "aedun", email: "aedun@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1008", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p17", name: "Isolaye Oshodi-Nayakan", username: "ioshodi", email: "ioshodi@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1009", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p18", name: "Omotomi Arowomo", username: "oarowomo", email: "oarowomo@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1010", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p19", name: "Nwegbu Chisom", username: "nchisom", email: "nchisom@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1011", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p20", name: "Akinola Abiodun", username: "aabiodun", email: "aabiodun@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1012", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p21", name: "Okonkwo Promise", username: "opromise", email: "opromise@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1013", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p22", name: "Oladotun Olayemi", username: "oolayemi", email: "oolayemi@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1014", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p23", name: "Abraham Friday", username: "afriday", email: "afriday@gameshut.ng", password: "password123", teamId: "t1", points: 10, role: "player", walletId: "GSH-7402-1015", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },

  // TEAM GREEN LANTERN PLAYERS
  { id: "p24", name: "Adedeji Adedoyinsola", username: "aadedoyinsola", email: "aadedoyinsola@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1016", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p25", name: "Bamiteko Eunice", username: "beunice", email: "beunice@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1017", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p26", name: "Egubere Dennis", username: "edennis", email: "edennis@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1018", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p27", name: "Adeoti Gloria", username: "agloria", email: "agloria@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1019", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p28", name: "Farinde Oluwaloseyi", username: "foluwaloseyi", email: "foluwaloseyi@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1020", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p29", name: "Oluwotola Ayomide", username: "oayomide", email: "oayomide@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1021", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p30", name: "Bakare Damilola", username: "bdamilola", email: "bdamilola@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1022", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p31", name: "Henry Anyiam", username: "hanyiam", email: "hanyiam@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1023", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p32", name: "Omeh Rhema", username: "orhema", email: "orhema@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1024", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p33", name: "Oluwapelumi Thomas", username: "othomas", email: "othomas@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1025", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p34", name: "Aseoluwa Moronfolu", username: "amoronfolu", email: "amoronfolu@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1026", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p35", name: "Ayomide Omolola", username: "aomolola", email: "aomolola@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1027", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p36", name: "Oyetoro Abdullah", username: "oabdullah", email: "oabdullah@gameshut.ng", password: "password123", teamId: "t2", points: 7, role: "player", walletId: "GSH-7402-1028", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },

  // TEAM SUNFLOWER PLAYERS
  { id: "p37", name: "Godson Merit", username: "gmerit", email: "gmerit@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1029", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p38", name: "Owoseni Bukola", username: "obukola", email: "obukola@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1030", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p39", name: "Mubaraq Adeyemi", username: "madeyemi", email: "madeyemi@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1031", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p40", name: "Tolulope Popoola", username: "tpopoola", email: "tpopoola@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1032", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p41", name: "Daniel Mojolajesu", username: "dmojolajesu", email: "dmojolajesu@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1033", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p42", name: "Clement Testimony i", username: "ctestimony", email: "ctestimony@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1034", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p43", name: "Alausa Ann", username: "aann", email: "aann@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1035", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p44", name: "Ifeanyi", username: "ifeanyi", email: "ifeanyi@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1036", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p45", name: "Shana", username: "shana", email: "shana@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1037", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p46", name: "Oghenetega Ginibo", username: "oginibo", email: "oginibo@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1038", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p47", name: "Temilade Alap", username: "talap", email: "talap@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1039", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p48", name: "Olayiwola Oluwa", username: "ooluwa", email: "ooluwa@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1040", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p49", name: "Edidiong Asang", username: "easang", email: "easang@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1041", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p50", name: "Temi James", username: "tjames", email: "tjames@gameshut.ng", password: "password123", teamId: "t3", points: 6, role: "player", walletId: "GSH-7402-1042", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },

  // TEAM RED RIOT PLAYERS
  { id: "p51", name: "Asibo Victory", username: "asibo", email: "asibo@gameshut.ng", password: "password123", teamId: "t4", points: 0, role: "player", walletId: "GSH-7402-1043", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p52", name: "Adegoke Peace", username: "padegoke", email: "padegoke@gameshut.ng", password: "password123", teamId: "t4", points: 0, role: "player", walletId: "GSH-7402-1044", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p53", name: "Bashiru Farouk", username: "bfarouk", email: "bfarouk@gameshut.ng", password: "password123", teamId: "t4", points: 0, role: "player", walletId: "GSH-7402-1045", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p54", name: "Excel Joy", username: "ejoy", email: "ejoy@gameshut.ng", password: "password123", teamId: "t4", points: 0, role: "player", walletId: "GSH-7402-1046", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p55", name: "Loveth Aderinmola", username: "laderinmola", email: "laderinmola@gameshut.ng", password: "password123", teamId: "t4", points: 0, role: "player", walletId: "GSH-7402-1047", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p56", name: "Ibrahim Ayo", username: "iayo", email: "iayo@gameshut.ng", password: "password123", teamId: "t4", points: 0, role: "player", walletId: "GSH-7402-1048", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p57", name: "Ibrahim Taqwa", username: "itaqwa", email: "itaqwa@gameshut.ng", password: "password123", teamId: "t4", points: 0, role: "player", walletId: "GSH-7402-1049", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p58", name: "Luiten Francis", username: "lfrancis", email: "lfrancis@gameshut.ng", password: "password123", teamId: "t4", points: 0, role: "player", walletId: "GSH-7402-1050", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p59", name: "Ananwuna Paul", username: "pananwuna", email: "pananwuna@gameshut.ng", password: "password123", teamId: "t4", points: 0, role: "player", walletId: "GSH-7402-1051", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] },
  { id: "p60", name: "Nah Hugh", username: "nhugh", email: "nhugh@gameshut.ng", password: "password123", teamId: "t4", points: 0, role: "player", walletId: "GSH-7402-1052", cashWalletBalance: 0, voucherWalletBalance: 0, transactions: [] }
];

export const INITIAL_APPLICATIONS: Application[] = [
  { id: "a1", playerName: "Femi Cole", playerId: "p8", targetTeamName: "Tactical Titans", targetTeamId: "t1", status: "pending" }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_EMAIL_LOGS: EmailLog[] = [
  {
    id: "em1",
    recipientEmail: "gbenga@company.com",
    recipientName: "Akinyemi Samuel",
    subject: "Welcome to GamesHut!",
    bodyHtml: "<p>Hello <strong>Akinyemi Samuel</strong>,</p><p>Welcome to GamesHut! Your team captain account has been successfully set up and linked to your activity standing. Enjoy your gaming journey!</p>",
    sentAt: new Date().toISOString()
  },
  {
    id: "em2",
    recipientEmail: "gbenga@company.com",
    recipientName: "Akinyemi Samuel",
    subject: "Verification OTP Code",
    bodyHtml: "<p>Hello,</p><p>Your single-use registration validation code is: <strong>581932</strong>.</p>",
    sentAt: new Date().toISOString()
  }
];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: "wd1",
    playerId: "p1", // Akinyemi Samuel
    playerName: "Akinyemi Samuel",
    amount: 5000,
    paymentDetails: "Access Bank - 0123456789 (Akinyemi Samuel)",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "wd2",
    playerId: "p1",
    playerName: "Akinyemi Samuel",
    amount: 2000,
    paymentDetails: "Access Bank - 0123456789 (Akinyemi Samuel)",
    status: "approved",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

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
      "players": "2–6 Players",
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
      "players": "2–8 Players",
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
      "players": "2–8 Players",
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
      "players": "2–12 Players",
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
      "players": "2–4 Players",
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
      "players": "2–4 Players",
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
      "players": "1–8 Players",
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
      "players": "1–8 Players",
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
      "players": "1–8 Players",
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
      "players": "1–8 Players",
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
      "players": "2–4 Players",
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
      "players": "2–8 Players",
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
      "players": "2–8 Players",
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
      "players": "2–4 Players",
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
      "players": "2 Players",
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
      "players": "2 Players",
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
      "players": "2 Players",
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
      "players": "2 Players",
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
      "players": "2–12 Players",
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
      "players": "2–8 Players",
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
      "players": "2–10 Players",
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
      "players": "2 Players",
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
      "players": "2–5 Players",
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
      "players": "2–4 Players",
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
      "players": "2–6 Players",
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
      "players": "2–4 Players",
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
    id: "ttwdot1",
    title: "The Things We Do On Tables",
    date: "August 10, 2024",
    time: "4:00 PM - 10:00 PM",
    location: "Lagos, Nigeria",
    price: 5000,
    description: "Our premier tabletop gaming meetup. A night of Catan, Jenga, Chess, and unmatched vibes.",
    posterUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=600&auto=format&fit=crop",
    revenue: 250000,
    tiers: [
      { name: "General Entry", price: 5000 }
    ],
    sessions: [
      { date: "August 10, 2024", time: "4:00 PM - 10:00 PM" }
    ]
  }
];

export const INITIAL_TICKETS: Ticket[] = [];

// Daily Games Baselines
export const INITIAL_DAILY_CHALLENGES: DailyChallenge[] = [];
export const INITIAL_GAME_ATTEMPTS: GameAttempt[] = [];
export const INITIAL_USER_STREAKS: UserStreak[] = [];
export const INITIAL_GAME_STREAKS: GameStreak[] = [];
export const INITIAL_USER_GAME_STATS: UserGameStats[] = [];
export const INITIAL_XP_TRANSACTIONS: XPTransaction[] = [];
export const INITIAL_USER_ACHIEVEMENTS: UserAchievement[] = [];
export const INITIAL_PATREON_TRANSACTIONS: PatreonTransaction[] = [];

const KEYS = {
  PLAYERS: "gh_players",
  TEAMS: "gh_teams",
  APPLICATIONS: "gh_applications",
  PRODUCTS: "gh_products_v2",
  EVENTS: "gh_events",
  TICKETS: "gh_tickets",
  NOTIFICATIONS: "gh_notifications",
  EMAIL_LOGS: "gh_email_logs",
  WITHDRAWALS: "gh_withdrawals",
  DAILY_CHALLENGES: "gh_daily_challenges",
  GAME_ATTEMPTS: "gh_game_attempts",
  USER_STREAKS: "gh_user_streaks",
  GAME_STREAKS: "gh_game_streaks",
  USER_GAME_STATS: "gh_user_game_stats",
  XP_TRANSACTIONS: "gh_xp_transactions",
  USER_ACHIEVEMENTS: "gh_user_achievements",
  PATREON_TRANSACTIONS: "gh_patreon_transactions"
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

  async syncFromServer(providedState?: any) {
    if (!isBrowser) return;
    try {
      let serverState = providedState;
      if (!serverState) {
        const res = await fetch("/api/db", { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data && Object.keys(json.data).length > 0) {
          serverState = json.data;
        }
      }

      if (serverState && Object.keys(serverState).length > 0) {
          const keyMap: Record<string, string> = {
            players: KEYS.PLAYERS,
            teams: KEYS.TEAMS,
            applications: KEYS.APPLICATIONS,
            products: KEYS.PRODUCTS,
            events: KEYS.EVENTS,
            tickets: KEYS.TICKETS,
            notifications: KEYS.NOTIFICATIONS,
            email_logs: KEYS.EMAIL_LOGS,
            withdrawals: KEYS.WITHDRAWALS,
            daily_challenges: KEYS.DAILY_CHALLENGES,
            game_attempts: KEYS.GAME_ATTEMPTS,
            user_streaks: KEYS.USER_STREAKS,
            game_streaks: KEYS.GAME_STREAKS,
            user_game_stats: KEYS.USER_GAME_STATS,
            xp_transactions: KEYS.XP_TRANSACTIONS,
            user_achievements: KEYS.USER_ACHIEVEMENTS,
            patreon_transactions: KEYS.PATREON_TRANSACTIONS
          };

          Object.keys(keyMap).forEach(serverKey => {
            const clientKey = keyMap[serverKey];
            let serverData = serverState[serverKey];
            
            if (serverData !== undefined) {
              // PRESERVE LOCAL GUEST ATTEMPTS: Never overwrite local guest attempts with server data
              if (clientKey === KEYS.GAME_ATTEMPTS) {
                try {
                  const localData = JSON.parse(localStorage.getItem(clientKey) || "[]");
                  const localGuestAttempts = localData.filter((a: any) => a.userId === "guest");
                  // Ensure we don't duplicate if for some reason the server had them
                  serverData = serverData.filter((a: any) => a.userId !== "guest");
                  serverData = [...localGuestAttempts, ...serverData];
                } catch (e) {
                  console.error("Error preserving guest attempts", e);
                }
              }
              localStorage.setItem(clientKey, JSON.stringify(serverData));
            }
          });
        }
    } catch (e) {
      console.error("Failed to sync database state from server:", e);
    }
  },
  getPlayers(): Player[] {
    if (!isBrowser) return [];
    const data = localStorage.getItem(KEYS.PLAYERS);
    if (!data) {
      localStorage.setItem(KEYS.PLAYERS, "[]");
      return [];
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.some(p => p.name === "Gbenga Daniel")) {
        localStorage.setItem(KEYS.PLAYERS, "[]");
        localStorage.setItem(KEYS.TEAMS, "[]");
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  },

  async setPlayers(players: Player[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.PLAYERS, JSON.stringify(players));
    await this.syncServer("players", players);
  },

  getTeams(): Team[] {
    if (!isBrowser) return [];
    const data = localStorage.getItem(KEYS.TEAMS);
    if (!data) {
      localStorage.setItem(KEYS.TEAMS, "[]");
      return [];
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.some(t => t.name === "Tactical Titans")) {
        localStorage.setItem(KEYS.PLAYERS, "[]");
        localStorage.setItem(KEYS.TEAMS, "[]");
        return [];
      }
      return parsed;
    } catch {
      return [];
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
      if (!Array.isArray(parsed) || parsed.length === 0) {
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
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
        return INITIAL_EVENTS;
      }
      return parsed;
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
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
        return INITIAL_NOTIFICATIONS;
      }
      return parsed;
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
    
    // Also trigger native browser push notification if permitted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body: message,
          icon: "/gameshut_favicon_1784316297649.png"
        });
      } catch (e) {
        console.warn("Browser push failed (may require service worker on mobile):", e);
      }
    }

    // Trigger an in-app Toast notification for immediate visibility
    if (typeof window !== "undefined") {
      // Map notification types to toast types (success, info, warning)
      const toastType = type === "system" || type === "wallet" ? "success" : 
                        type === "support" || type === "inventory" ? "warning" : "info";
      showToast(`${title} - ${message}`, toastType);
    }
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

  addEmailLog(recipientEmail: string, recipientName: string, subject: string, bodyHtml: string, from?: string) {
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
        html: bodyHtml,
        from: from
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

  async setWithdrawalRequests(withdrawals: WithdrawalRequest[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
    await this.syncServer("withdrawals", withdrawals);
  },

  getPatreonTransactions(): PatreonTransaction[] {
    if (!isBrowser) return INITIAL_PATREON_TRANSACTIONS;
    const data = localStorage.getItem(KEYS.PATREON_TRANSACTIONS);
    if (!data) return INITIAL_PATREON_TRANSACTIONS;
    try { return JSON.parse(data); } catch { return INITIAL_PATREON_TRANSACTIONS; }
  },

  async setPatreonTransactions(transactions: PatreonTransaction[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.PATREON_TRANSACTIONS, JSON.stringify(transactions));
    await this.syncServer("patreon_transactions", transactions);
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
    this.setWithdrawalRequests([newWd, ...current]);
  },

  // --- Daily Games Accessors ---

  getDailyChallenges(): DailyChallenge[] {
    if (!isBrowser) return INITIAL_DAILY_CHALLENGES;
    const data = localStorage.getItem(KEYS.DAILY_CHALLENGES);
    if (!data) {
      localStorage.setItem(KEYS.DAILY_CHALLENGES, JSON.stringify(INITIAL_DAILY_CHALLENGES));
      return INITIAL_DAILY_CHALLENGES;
    }
    try { 
      const parsed = JSON.parse(data); 
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(KEYS.DAILY_CHALLENGES, JSON.stringify(INITIAL_DAILY_CHALLENGES));
        return INITIAL_DAILY_CHALLENGES;
      }
      return parsed;
    } catch { return INITIAL_DAILY_CHALLENGES; }
  },
  async setDailyChallenges(challenges: DailyChallenge[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.DAILY_CHALLENGES, JSON.stringify(challenges));
    await this.syncServer("daily_challenges", challenges);
  },

  getGameAttempts(): GameAttempt[] {
    if (!isBrowser) return INITIAL_GAME_ATTEMPTS;
    const data = localStorage.getItem(KEYS.GAME_ATTEMPTS);
    if (!data) {
      localStorage.setItem(KEYS.GAME_ATTEMPTS, JSON.stringify(INITIAL_GAME_ATTEMPTS));
      return INITIAL_GAME_ATTEMPTS;
    }
    try { return JSON.parse(data); } catch { return INITIAL_GAME_ATTEMPTS; }
  },
  async setGameAttempts(attempts: GameAttempt[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.GAME_ATTEMPTS, JSON.stringify(attempts));
    // Never sync guest attempts to the global server db
    await this.syncServer("game_attempts", attempts.filter(a => a.userId !== "guest"));
  },

  getUserStreaks(): UserStreak[] {
    if (!isBrowser) return INITIAL_USER_STREAKS;
    const data = localStorage.getItem(KEYS.USER_STREAKS);
    if (!data) {
      localStorage.setItem(KEYS.USER_STREAKS, JSON.stringify(INITIAL_USER_STREAKS));
      return INITIAL_USER_STREAKS;
    }
    try { return JSON.parse(data); } catch { return INITIAL_USER_STREAKS; }
  },
  async setUserStreaks(streaks: UserStreak[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.USER_STREAKS, JSON.stringify(streaks));
    await this.syncServer("user_streaks", streaks);
  },

  getGameStreaks(): GameStreak[] {
    if (!isBrowser) return INITIAL_GAME_STREAKS;
    const data = localStorage.getItem(KEYS.GAME_STREAKS);
    if (!data) {
      localStorage.setItem(KEYS.GAME_STREAKS, JSON.stringify(INITIAL_GAME_STREAKS));
      return INITIAL_GAME_STREAKS;
    }
    try { return JSON.parse(data); } catch { return INITIAL_GAME_STREAKS; }
  },
  async setGameStreaks(streaks: GameStreak[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.GAME_STREAKS, JSON.stringify(streaks));
    await this.syncServer("game_streaks", streaks);
  },

  getUserGameStats(): UserGameStats[] {
    if (!isBrowser) return INITIAL_USER_GAME_STATS;
    const data = localStorage.getItem(KEYS.USER_GAME_STATS);
    if (!data) {
      localStorage.setItem(KEYS.USER_GAME_STATS, JSON.stringify(INITIAL_USER_GAME_STATS));
      return INITIAL_USER_GAME_STATS;
    }
    try { return JSON.parse(data); } catch { return INITIAL_USER_GAME_STATS; }
  },
  async setUserGameStats(stats: UserGameStats[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.USER_GAME_STATS, JSON.stringify(stats));
    await this.syncServer("user_game_stats", stats);
  },

  getXpTransactions(): XPTransaction[] {
    if (!isBrowser) return INITIAL_XP_TRANSACTIONS;
    const data = localStorage.getItem(KEYS.XP_TRANSACTIONS);
    if (!data) {
      localStorage.setItem(KEYS.XP_TRANSACTIONS, JSON.stringify(INITIAL_XP_TRANSACTIONS));
      return INITIAL_XP_TRANSACTIONS;
    }
    try { return JSON.parse(data); } catch { return INITIAL_XP_TRANSACTIONS; }
  },
  async setXpTransactions(transactions: XPTransaction[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.XP_TRANSACTIONS, JSON.stringify(transactions));
    await this.syncServer("xp_transactions", transactions);
  },

  getUserAchievements(): UserAchievement[] {
    if (!isBrowser) return INITIAL_USER_ACHIEVEMENTS;
    const data = localStorage.getItem(KEYS.USER_ACHIEVEMENTS);
    if (!data) {
      localStorage.setItem(KEYS.USER_ACHIEVEMENTS, JSON.stringify(INITIAL_USER_ACHIEVEMENTS));
      return INITIAL_USER_ACHIEVEMENTS;
    }
    try { return JSON.parse(data); } catch { return INITIAL_USER_ACHIEVEMENTS; }
  },
  async setUserAchievements(achievements: UserAchievement[]) {
    if (!isBrowser) return;
    localStorage.setItem(KEYS.USER_ACHIEVEMENTS, JSON.stringify(achievements));
    await this.syncServer("user_achievements", achievements);
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
    localStorage.setItem(KEYS.DAILY_CHALLENGES, JSON.stringify(INITIAL_DAILY_CHALLENGES));
    localStorage.setItem(KEYS.GAME_ATTEMPTS, JSON.stringify(INITIAL_GAME_ATTEMPTS));
    localStorage.setItem(KEYS.USER_STREAKS, JSON.stringify(INITIAL_USER_STREAKS));
    localStorage.setItem(KEYS.GAME_STREAKS, JSON.stringify(INITIAL_GAME_STREAKS));
    localStorage.setItem(KEYS.USER_GAME_STATS, JSON.stringify(INITIAL_USER_GAME_STATS));
    localStorage.setItem(KEYS.XP_TRANSACTIONS, JSON.stringify(INITIAL_XP_TRANSACTIONS));
    localStorage.setItem(KEYS.USER_ACHIEVEMENTS, JSON.stringify(INITIAL_USER_ACHIEVEMENTS));

    const resetState = {
      players: INITIAL_PLAYERS,
      teams: INITIAL_TEAMS,
      applications: INITIAL_APPLICATIONS,
      products: INITIAL_PRODUCTS,
      events: INITIAL_EVENTS,
      tickets: INITIAL_TICKETS,
      notifications: INITIAL_NOTIFICATIONS,
      email_logs: INITIAL_EMAIL_LOGS,
      withdrawals: INITIAL_WITHDRAWALS,
      daily_challenges: INITIAL_DAILY_CHALLENGES,
      game_attempts: INITIAL_GAME_ATTEMPTS,
      user_streaks: INITIAL_USER_STREAKS,
      game_streaks: INITIAL_GAME_STREAKS,
      user_game_stats: INITIAL_USER_GAME_STATS,
      xp_transactions: INITIAL_XP_TRANSACTIONS,
      user_achievements: INITIAL_USER_ACHIEVEMENTS
    };

    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resetState)
    }).catch(e => console.error("Failed to sync factory reset to server:", e));
  }
};

export function getEmailTemplateHtml(title: string, greeting: string, bodyContent: string, ctaHtml?: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #1e293b;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 35px 30px; text-align: center; border-bottom: 4px solid #6366f1;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; font-family: 'Outfit', sans-serif;">GamesHut</h1>
              <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Strategy, Tabletop & Corporate Play</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 30px; line-height: 1.6;">
              <h2 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px; font-weight: 700; font-family: 'Outfit', sans-serif;">${greeting}</h2>
              <div style="font-size: 15px; color: #334155; margin-bottom: 20px;">
                ${bodyContent}
              </div>
              ${ctaHtml ? `<div style="margin: 25px 0 10px 0; text-align: center;">${ctaHtml}</div>` : ""}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #0f172a; font-family: 'Outfit', sans-serif;">GamesHut Arena</p>
              <p style="margin: 0 0 15px 0;">Suite 12, Waterfront Avenue, Lekki Phase 1, Lagos, Nigeria.</p>
              <p style="margin: 0; font-size: 11px;">You received this transactional message as part of your account activity on gameshut.ng. If you have any inquiries, please contact <a href="mailto:support@gameshut.ng" style="color: #6366f1; text-decoration: none; font-weight: 600;">support@gameshut.ng</a>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
