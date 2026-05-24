import { UAParser } from "ua-parser-js";

export interface GeoLocation {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isVPN: boolean;
  isProxy: boolean;
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: string;
  userAgent: string;
}

export interface LoginData {
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
}

/**
 * Obtener información de geolocalización de la IP pública
 * Usa ipapi.co que proporciona datos sin API key requerida
 */
export async function getUserIP(): Promise<GeoLocation> {
  if (typeof window === "undefined") {
    throw new Error("getUserIP only works in browser");
  }

  // Cache en sessionStorage para evitar múltiples requests
  const cached = sessionStorage.getItem("_kalistream_geoip");
  if (cached) {
    try {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 3600000) {
        // Cache válido por 1 hora
        return data.geo;
      }
    } catch {
      // Invalid cache
    }
  }

  try {
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`IP API error: ${response.statusText}`);
    }

    const data = await response.json();

    const geoLocation: GeoLocation = {
      ip: data.ip || "",
      country: data.country_name || "Unknown",
      countryCode: data.country_code || "XX",
      city: data.city || "Unknown",
      latitude: data.latitude,
      longitude: data.longitude,
      isVPN: data.is_vpn || false,
      isProxy: data.is_proxy || false,
    };

    // Cache en sessionStorage
    sessionStorage.setItem(
      "_kalistream_geoip",
      JSON.stringify({
        geo: geoLocation,
        timestamp: Date.now(),
      })
    );

    return geoLocation;
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    // Fallback si falla el API
    return {
      ip: "0.0.0.0",
      country: "Unknown",
      countryCode: "XX",
      city: "Unknown",
      isVPN: false,
      isProxy: false,
    };
  }
}

/**
 * Obtener información del navegador y SO del usuario
 * Usa ua-parser-js para parsear el User-Agent
 */
export function getDeviceInfo(): DeviceInfo {
  const parser = new UAParser();
  const result = parser.getResult();

  return {
    browser: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "0",
    os: result.os.name || "Unknown",
    osVersion: result.os.version || "0",
    deviceType: result.device.type || "desktop",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };
}

/**
 * Obtener todos los datos de login del usuario
 * Combina geolocalización + dispositivo
 */
export async function getLoginData(): Promise<LoginData> {
  const [geoLocation, deviceInfo] = await Promise.all([
    getUserIP(),
    Promise.resolve(getDeviceInfo()),
  ]);

  return {
    ip: geoLocation.ip,
    country: geoLocation.country,
    countryCode: geoLocation.countryCode,
    city: geoLocation.city,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    osVersion: deviceInfo.osVersion,
    browserVersion: deviceInfo.browserVersion,
    isVPN: geoLocation.isVPN,
    isProxy: geoLocation.isProxy,
    userAgent: deviceInfo.userAgent,
    timestamp: new Date().toISOString(),
    deviceType: deviceInfo.deviceType,
  };
}

/**
 * Detectar si un login es sospechoso
 */
export function detectSuspiciousLogin(
  currentLogin: LoginData,
  lastLogin: LoginData | null,
  loginHistory: LoginData[]
): { isSuspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (!lastLogin) {
    return { isSuspicious: false, reasons: [] };
  }

  // Verificar si el país cambió
  if (currentLogin.countryCode !== lastLogin.countryCode) {
    reasons.push("Country changed");
  }

  // Verificar si el dispositivo cambió
  if (
    currentLogin.os !== lastLogin.os ||
    currentLogin.browser !== lastLogin.browser
  ) {
    reasons.push("Device changed");
  }

  // Verificar si el IP cambió
  if (currentLogin.ip !== lastLogin.ip) {
    reasons.push("IP changed");
  }

  // Verificar múltiples países en corto tiempo
  const last10Logins = loginHistory.slice(0, 10);
  const lastHourLogins = last10Logins.filter((login) => {
    const diff = new Date(currentLogin.timestamp).getTime() - new Date(login.timestamp).getTime();
    return diff < 3600000; // 1 hora
  });

  const countriesInLastHour = new Set(lastHourLogins.map((l) => l.countryCode));
  if (countriesInLastHour.size > 1) {
    reasons.push("Multiple countries in 1 hour");
  }

  // Si es VPN, flag como sospechoso
  if (currentLogin.isVPN) {
    reasons.push("VPN detected");
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * Validar si existe rate limiting
 */
export function checkRateLimitExceeded(
  ip: string,
  maxLoginsPerMinute: number = 5
): boolean {
  const key = `_kalistream_ratelimit_${ip}`;
  const data = sessionStorage.getItem(key);

  let timestamps: number[] = [];
  if (data) {
    try {
      timestamps = JSON.parse(data);
    } catch {
      // Invalid data
    }
  }

  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Filtrar timestamps dentro del último minuto
  timestamps = timestamps.filter((ts) => ts > oneMinuteAgo);
  timestamps.push(now);

  // Guardar de vuelta
  sessionStorage.setItem(key, JSON.stringify(timestamps));

  // Retornar si excede límite
  return timestamps.length > maxLoginsPerMinute;
}
