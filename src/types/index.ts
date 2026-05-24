export type PlanType = "free" | "basic" | "plus" | "ultra" | "admin" | "moderator" | "owner";
export type UserRole = "owner" | "admin" | "moderator" | "ultra" | "plus" | "basic" | "free";

export type MediaItem = {
  id: number;
  title: string;
  overview: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: number;
  tags: string[];
  kind: "movie" | "series" | "anime";
  tmdbType?: "movie" | "tv";
};

export type Genre = {
  id: number;
  name: string;
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile: string | null;
};

export type Trailer = {
  id: string;
  name: string;
  key: string;
  site: string;
  type: string;
};

export type MediaDetails = {
  id: number;
  title: string;
  overview: string;
  poster: string;
  backdrop: string;
  rating: number;
  releaseDate: string;
  runtime: number;
  genres: Genre[];
  type: "movie" | "tv";
  seasons?: number;
  trailers: Trailer[];
  cast: CastMember[];
};

export type PaymentStatus = "pending" | "approved" | "rejected" | "expired";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: PlanType;
  planExpiresAt?: string;
  isBanned?: boolean;
};

export type LoginRecord = {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  browser: string;
  os: string;
  osVersion: string;
  browserVersion: string;
  isVPN: boolean;
  isProxy: boolean;
  userAgent: string;
  timestamp: string;
  deviceType: string;
  isSuspicious?: boolean;
  suspiciousReasons?: string[];
};

export type SessionRecord = {
  id: string;
  ip: string;
  country: string;
  browser: string;
  os: string;
  startedAt: string;
  lastActivityAt: string;
  expiresAt: string;
  active: boolean;
};

export type UserProfile = {
  uid: string;
  username: string;
  email: string;
  avatar: string;
  role: UserRole;
  subscriptionPlan: "free" | "basic" | "plus" | "ultra";
  subscriptionExpire: string | null;
  createdAt: string;
  favorites: number[];
  continueWatching: Array<{ id: number; type: "movie" | "tv"; progress: number; updatedAt: string }>;
  watchHistory: Array<{ id: number; type: "movie" | "tv"; watchedAt: string; progress: number }>;
  lastLogin?: string;
  lastIP?: string;
  lastActivity?: string;
  ip?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  osVersion?: string;
  browserVersion?: string;
  userAgent?: string;
  isBanned?: boolean;
  isVPN?: boolean;
  onlineStatus?: "online" | "offline";
  loginHistory?: LoginRecord[];
  sessionHistory?: SessionRecord[];
  suspiciousLogins?: LoginRecord[];
};

export type PaymentRecord = {
  id?: string;
  uid: string;
  email: string;
  username?: string;
  method: "Yape" | "Plin" | "Transferencia";
  plan: "basic" | "plus" | "ultra";
  duration: string;
  price?: string;
  screenshotUrl: string;
  status: PaymentStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  ipAddress?: string;
  userAgent?: string;
};

export type AnnouncementRecord = {
  id?: string;
  message: string;
  active: boolean;
  type: "popup" | "toast" | "banner" | "maintenance";
  createdAt: string;
  createdBy: string;
};
