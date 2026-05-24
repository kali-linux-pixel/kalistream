/**
 * Rate Limiter usando localStorage para cliente
 * Útil para prevenir múltiples requests de tracking en corto tiempo
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private key: string;
  private maxRequests: number;
  private windowMs: number;

  constructor(key: string, maxRequests: number = 5, windowMs: number = 60000) {
    this.key = key;
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Verificar si está permitido hacer la acción
   * @returns true si está permitido, false si está rate limitado
   */
  isAllowed(): boolean {
    if (typeof window === "undefined") return true;

    try {
      const data = localStorage.getItem(this.key);
      const now = Date.now();

      let entry: RateLimitEntry = {
        count: 0,
        resetTime: now + this.windowMs,
      };

      if (data) {
        try {
          entry = JSON.parse(data);
        } catch {
          // Invalid JSON, use default
        }
      }

      // Si ya expiró la ventana, resetear
      if (now > entry.resetTime) {
        entry.count = 1;
        entry.resetTime = now + this.windowMs;
        localStorage.setItem(this.key, JSON.stringify(entry));
        return true;
      }

      // Si aún hay intentos disponibles
      if (entry.count < this.maxRequests) {
        entry.count += 1;
        localStorage.setItem(this.key, JSON.stringify(entry));
        return true;
      }

      // Rate limited
      return false;
    } catch {
      // Error en localStorage, permitir
      return true;
    }
  }

  /**
   * Resetear el rate limiter
   */
  reset(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(this.key);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Obtener tiempo restante en milisegundos
   */
  getTimeRemaining(): number {
    if (typeof window === "undefined") return 0;

    try {
      const data = localStorage.getItem(this.key);
      if (!data) return 0;

      const entry: RateLimitEntry = JSON.parse(data);
      const remaining = Math.max(0, entry.resetTime - Date.now());
      return remaining;
    } catch {
      return 0;
    }
  }
}

/**
 * Debounce para funciones
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle para funciones
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Verificar si la IP está bloqueada (via Firestore)
 * Se ejecutaría en el backend normalmente
 */
export const isIPBanned = async (ip: string): Promise<boolean> => {
  // Esto debería verificarse en el backend
  // Por ahora retorna false
  return false;
};

/**
 * Verificar si el login está permitido (rate limiting + IP ban)
 */
export async function isLoginAllowed(ip: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  // Verificar rate limiting
  const rateLimiter = new RateLimiter(`_kalistream_login_${ip}`, 5, 60000);
  if (!rateLimiter.isAllowed()) {
    return {
      allowed: false,
      reason: "Too many login attempts. Try again in a few minutes.",
    };
  }

  // Verificar IP banned
  const isBanned = await isIPBanned(ip);
  if (isBanned) {
    return {
      allowed: false,
      reason: "Your IP has been temporarily blocked.",
    };
  }

  return { allowed: true };
}
