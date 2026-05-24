/**
 * Formatear fecha ISO a formato legible
 * Ej: "2026-05-23T22:29:03.217Z" → "23/05/2026 10:29 PM"
 */
export function formatDate(isoDate: string | null | undefined, includeTime = true): string {
  if (!isoDate) return "-";

  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "-";

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(includeTime && {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    return new Intl.DateTimeFormat("es-PE", options).format(date);
  } catch {
    return "-";
  }
}

/**
 * Formatear fecha relativa
 * Ej: Date de hace 5 minutos → "5m ago"
 */
export function formatRelativeTime(isoDate: string | null | undefined): string {
  if (!isoDate) return "-";

  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return "just now";
    if (diffMs < 60000) return "just now";
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
    if (diffMs < 604800000) return `${Math.floor(diffMs / 86400000)}d ago`;

    return formatDate(isoDate, false);
  } catch {
    return "-";
  }
}

/**
 * Enmascarar IP para mostrar parcialmente
 * Ej: "181.120.180.120" → "181.xxx.xxx.120"
 */
export function maskIP(ip: string): string {
  if (!ip) return "-";
  const parts = ip.split(".");
  if (parts.length !== 4) return ip; // No es IPv4 válido

  return `${parts[0]}.xxx.xxx.${parts[3]}`;
}

/**
 * Obtener emoji de bandera desde country code
 * Ej: "PE" → "🇵🇪"
 */
export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌍";

  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

/**
 * Obtener nombre del país desde country code
 */
export function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    PE: "Peru",
    US: "United States",
    MX: "Mexico",
    BR: "Brazil",
    ES: "Spain",
    FR: "France",
    DE: "Germany",
    GB: "United Kingdom",
    IT: "Italy",
    JP: "Japan",
    CN: "China",
    IN: "India",
    AU: "Australia",
    CA: "Canada",
    RU: "Russia",
    KR: "South Korea",
    XX: "Unknown",
  };

  return countryNames[countryCode] || countryCode;
}

/**
 * Obtener color para badge de rol
 */
export function getRoleBadgeColor(
  role: string
): "amber" | "violet" | "cyan" | "emerald" | "red" | "slate" {
  switch (role?.toLowerCase()) {
    case "admin":
    case "owner":
      return "red";
    case "ultra":
    case "moderator":
      return "violet";
    case "basic":
    case "plus":
      return "cyan";
    case "free":
      return "slate";
    default:
      return "slate";
  }
}

/**
 * Obtener label legible del rol
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    owner: "Owner",
    admin: "Admin",
    moderator: "Moderator",
    ultra: "Ultra",
    plus: "Plus",
    basic: "Basic",
    free: "Free",
  };

  return labels[role?.toLowerCase()] || role;
}

/**
 * Obtener etiqueta del plan
 */
export function getPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    ultra: "Ultra Premium",
    plus: "Plus",
    basic: "Basic",
    free: "Free",
  };

  return labels[plan?.toLowerCase()] || plan;
}

/**
 * Formatear número de usuarios
 * Ej: 1000 → "1K", 1000000 → "1M"
 */
export function formatUserCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

/**
 * Formatear moneda
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Obtener status label con color
 */
export function getStatusLabel(status: "online" | "offline" | "suspicious"): {
  label: string;
  color: string;
} {
  const statuses = {
    online: { label: "Online", color: "emerald" },
    offline: { label: "Offline", color: "slate" },
    suspicious: { label: "Suspicious", color: "amber" },
  };

  return statuses[status] || { label: "Unknown", color: "slate" };
}
