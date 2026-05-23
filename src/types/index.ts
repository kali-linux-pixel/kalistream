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
  ip?: string;
  country?: string;
  device?: string;
  browser?: string;
  userAgent?: string;
  isBanned?: boolean;
};

export type PaymentRecord = {
  id?: string;
  uid: string;
  email: string;
  method: "Yape" | "Plin" | "PayPal";
  plan: "basic" | "plus" | "ultra";
  duration: string;
  screenshotUrl: string;
  status: PaymentStatus;
  createdAt: string;
};

export type AnnouncementRecord = {
  id?: string;
  message: string;
  active: boolean;
  type: "popup" | "toast" | "banner" | "maintenance";
  createdAt: string;
  createdBy: string;
};
