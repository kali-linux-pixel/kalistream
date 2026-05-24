# 🎬 KaliStream Advanced Login Tracking System

## 📋 Resumen

Sistema profesional de tracking de logins para KaliStream con:
- ✅ Captura de IP real, geolocalización, navegador y SO
- ✅ Detección de logins sospechosos y VPN
- ✅ Dashboard admin mejorado con diseño Netflix-like
- ✅ Componentes reutilizables y optimizados
- ✅ Firestore optimizado con caching
- ✅ Glassmorphism + Framer Motion animations
- ✅ Mobile responsive

## 🚀 Instalación

### 1. Instalar dependencias
```bash
npm install
npm install ua-parser-js @types/ua-parser-js
```

### 2. Build
```bash
npm run build
```

### 3. Desarrollo
```bash
npm run dev
```

## 📦 Archivos Creados

### Services (lib/)
- **tracking.ts**: Captura de IP, dispositivo, detección de anomalías
- **formatting.ts**: Utilities para formateo de datos
- **anti-spam.ts**: Rate limiting y debounce

### UI Components (components/ui/)
- **UserBadge.tsx**: Badges ADMIN/ULTRA/FREE
- **CountryFlag.tsx**: Banderas de países 🇵🇪
- **StatusIndicator.tsx**: Online/Offline/Suspicious
- **LoadingSkeleton.tsx**: Shimmer animations
- **IPMask.tsx**: IP enmascarada
- **EmptyState.tsx**: Estados vacíos
- **ErrorBoundary.tsx**: Error handling
- **AnalyticsCard.tsx**: Cards de métricas

### Admin Dashboard
- **admin-dashboard-v2.tsx**: Dashboard completo rediseñado

## 🎯 Características Principales

### Tracking de Logins
```typescript
// Automático en auth.ts
- IP pública real
- País + ciudad
- Navegador + versión
- SO + versión
- VPN/Proxy detection
- User-Agent
- Timestamp
```

### Data en Firestore
```javascript
users/{uid} {
  lastIP: "181.120.180.120"
  country: "Peru"
  countryCode: "PE"
  city: "Lima"
  browser: "Chrome"
  os: "Windows"
  isVPN: false
  lastLogin: timestamp
  loginHistory: [...] // Max 50
}
```

### Dashboard Admin
- **Filtros**: Rol, Plan, Status, VPN, País, Search
- **Metrics**: 4 analytics cards con trending
- **Tabla**: Usuarios con IP enmascarada, banderas, status
- **Charts**: Gráfico semanal de logins
- **Seguridad**: IP bloqueos, rate limiting
- **Auto-refresh**: Cada 30 segundos

## 🎨 Diseño

### Estilos
- Glassmorphism (blur + border)
- Framer Motion animations
- Dark mode toggle
- Responsive mobile

### Colores
- ADMIN/OWNER: Red
- ULTRA/MODERATOR: Violet
- BASIC/PLUS: Cyan
- FREE: Slate
- Online: Emerald
- Suspicious: Amber

## 🔒 Seguridad

- IP parcialmente enmascarada: `181.xxx.xxx.120`
- Nunca mostrar password o hash
- VPN detection automática
- Rate limiting: 5 logins/min por IP
- Detección de logins sospechosos
- Audit logs en Firestore

## 📊 Optimizaciones Firestore

- Queries con limit
- Pagination server-side
- Circular buffer para loginHistory (max 50)
- Debounce en filtros (300ms)
- Auto-refresh cada 30s
- Cache local

## 🛠️ Componentes Reutilizables

### UserBadge
```tsx
<UserBadge role="admin" size="md" />
// ADMIN badge con color rojo
```

### CountryFlag
```tsx
<CountryFlag countryCode="PE" showName={true} />
// 🇵🇪 Peru
```

### StatusIndicator
```tsx
<StatusIndicator status="online" showLabel={true} />
// 🟢 Online (pulsante)
```

### LoadingSkeleton
```tsx
<LoadingSkeleton count={5} />
// 5 líneas de shimmer animation
```

### IPMask
```tsx
<IPMask ip="181.120.180.120" />
// Muestra: 181.xxx.xxx.120
```

## 📝 Funciones Útiles

### Formatting
```typescript
formatDate(isoString)         // "23/05/2026 10:29 PM"
formatRelativeTime(isoString) // "5m ago"
maskIP(ip)                     // "181.xxx.xxx.120"
getFlagEmoji(countryCode)      // "🇵🇪"
getCountryName(countryCode)    // "Peru"
```

### Tracking
```typescript
getLoginData()               // Obtiene toda info del login
detectSuspiciousLogin()      // Detecta anomalías
checkRateLimitExceeded(ip)   // Verifica rate limit
```

## 🔧 Configuración

### Rate Limiting
```typescript
// En anti-spam.ts - máximo 5 logins/min por IP
const limiter = new RateLimiter(`key_${ip}`, 5, 60000);
```

### Auto-refresh Dashboard
```typescript
// En admin-dashboard-v2.tsx
const interval = setInterval(() => refreshAll(...), 30000); // 30s
```

### Debounce Búsqueda
```typescript
// En admin-dashboard-v2.tsx
debouncedSearch(value, role, status, vpn); // 300ms
```

## 📱 Mobile Responsive

- Tabla con scroll horizontal
- Filtros en grid 1-2 columnas
- Buttons compact en mobile
- Touch-friendly interactions
- Responsive analytics cards

## 🐛 Troubleshooting

### Build error: "Module not found ua-parser-js"
```bash
npm install ua-parser-js @types/ua-parser-js --save
npm run build
```

### Dashboard no actualiza
```typescript
// Verificar que refreshAll se ejecute en useEffect
// Verificar que auto-refresh interval esté activo
```

### IP no se captura
```typescript
// Verificar que getUserIP() se ejecute sin errores
// Check console para ver si ipapi.co retorna datos
```

## 📚 Documentación Técnica

Ver `TRACKING_IMPLEMENTATION.md` para:
- Arquitectura completa
- Estadísticas de código
- Cambios en Firestore schema
- Próximos pasos sugeridos

## 🎓 Ejemplo de Uso

### Agregar tracking a componente
```tsx
import { getLoginData } from "@/lib/tracking";
import { CountryFlag } from "@/components/ui/CountryFlag";

export function MyComponent() {
  const handleLogin = async () => {
    const loginData = await getLoginData();
    console.log(loginData);
    // {
    //   ip: "181.120.180.120",
    //   country: "Peru",
    //   countryCode: "PE",
    //   city: "Lima",
    //   browser: "Chrome",
    //   os: "Windows",
    //   ...
    // }
  };

  return (
    <div>
      <CountryFlag countryCode="PE" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

## 🚀 Próximos Pasos

1. **Cloud Functions**
   - Detección automática de anomalías
   - Analytics pre-computados

2. **Firestore Rules**
   - Proteger datos sensibles
   - Validación de writes

3. **Notifications**
   - Toast alerts para admin
   - Email de logins sospechosos

4. **Export**
   - CSV de usuarios
   - PDF reports

## 📞 Support

Para preguntas o issues, revisar:
- Logs del navegador (F12)
- Firestore rules
- Firebase Cloud Functions
- Network tab en DevTools

---

**KaliStream Advanced Login Tracking System v3.1**
Optimized for production use
Last updated: 2026-05-23
