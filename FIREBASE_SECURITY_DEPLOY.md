# KaliStream Firebase Security Deploy

## 1) Archivos incluidos

- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`

## 2) Configurar Firebase CLI

```bash
npm i -g firebase-tools
firebase login
firebase use kalistream-52448
```

## 3) (Si falta) inicializar archivos de rules/indexes

```bash
firebase init firestore
firebase init storage
```

Cuando pregunte, usar:

- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Storage rules: `storage.rules`

## 4) Deploy de seguridad

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

## 5) Verificación recomendada

1. Usuario `free`:
   - puede actualizar su propio perfil (sin tocar `role` ni `subscriptionPlan`)
   - puede subir avatar/pago/subtítulo en su carpeta
   - no puede leer pagos de otros usuarios
2. Usuario `admin` o `moderator`:
   - puede crear/editar anuncios
   - puede aprobar/rechazar pagos
   - puede administrar suscripciones
   - puede ver capturas de pago
3. Intento de escalación:
   - usuario normal intentando cambiar `role=admin` debe fallar por rules.

## 6) Nota de producción

Para máxima seguridad, mover también privilegios administrativos críticos (aprobación de pagos, activación de suscripciones) a Cloud Functions con Admin SDK y validar custom claims.
