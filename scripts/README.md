# Scripts de migración — modelo de Cuentas

Se corren a mano, una sola vez, contra Firestore. No son Cloud Functions.

## Antes de empezar

```bash
gcloud auth application-default login
gcloud firestore export gs://<bucket>/backups/pre-accounts-migration-$(date +%F)
```

El backup es obligatorio: la migración reescribe los 825 documentos de `transactions` in place.

## Orden

```bash
# 1. Semilla de monedas y cuentas + resguardo de las categorías viejas
node scripts/seed.mjs            # dry run
node scripts/seed.mjs --commit

# 2. Migración de transacciones (idempotente)
node scripts/migrate-transactions.mjs            # dry run: conteos
node scripts/migrate-transactions.mjs --commit
```

Ambos aceptan `FIREBASE_PROJECT=<id>` para apuntar a otro proyecto (por defecto `mio-app-dev`).

## Qué hace cada uno

**`seed.mjs`** escribe las 6 monedas y las 9 cuentas de `seed-data.mjs`, copia los documentos
de `categories` a `legacyCategories` y los borra de `categories`. Eso libera el nombre de la
colección para las Categorías reales (motivo del gasto), que hoy no existen. El rollback de este
paso es copiar `legacyCategories` de vuelta a `categories`.

**`migrate-transactions.mjs`** por cada transacción sin `schemaVersion`:

- resuelve la Cuenta desde `category.id + subcategory.id` con `ACCOUNT_MAP`, y escribe el
  snapshot `account`;
- detecta pares de transferencia (mismo instante + misma descripción + signo opuesto) y los
  vincula con `linkedTransactionId` + `transfer: { direction, counterpartAccount }`;
- pasa `income: boolean` a `type: 'income' | 'expense' | 'transfer'`;
- borra `income` y el `category` viejo (que era la Cuenta disfrazada);
- deja `saving` como está — es un atributo del movimiento, no de la Cuenta;
- marca `schemaVersion: 2`.

Si aparece un par `category.id|subcategory.id` sin mapeo, aborta antes de escribir nada y lista
los documentos afectados.

## Probar todo local, antes de tocar producción

Requiere `brew install --cask temurin` (el emulador de Firestore corre sobre Java) y
`npm i -g firebase-tools`.

```bash
npm run snapshot:dump      # producción → scripts/.snapshot.json (sólo lectura)
npm run emulators          # en otra terminal, deja el emulador corriendo
npm run snapshot:load      # los datos reales, adentro del emulador
npm run seed:local -- --commit
npm run migrate:local      # dry run
npm run migrate:local -- --commit
npm run verify:local       # integridad de lo migrado
npm run start:local        # la webapp contra el emulador
```

`verify-migration.mjs` chequea que no quede `income` ni `category` viejo, que las dos
patas de cada transferencia se apunten mutuamente con direcciones opuestas, y compara
los movimientos por cuenta contra la tabla 4.2 del plan.

Auth sigue apuntando a Firebase real a propósito: entrás con tu cuenta de siempre y el
`uid` coincide con el de los movimientos copiados, que es por lo que filtra toda la app.
Un usuario del emulador de Auth tendría otro `uid` y no vería nada.

Para el bot, con el emulador corriendo:

```bash
curl -X POST http://127.0.0.1:5001/mio-app-dev/us-central1/telegramWebhook \
  -H 'Content-Type: application/json' \
  -d '{"message":{"chat":{"id":"<tu chat id>"},"text":"gasté 3800 de nafta en efectivo"}}'
```

Necesita `ANTHROPIC_API_KEY` en el entorno de las functions y responde por Telegram real,
así que el token también tiene que estar seteado.

## Después

Las reglas de Firestore están versionadas en `firestore.rules` (referenciado desde
`firebase.json`) y se despliegan con:

```bash
firebase deploy --only firestore:rules
```

`accounts` y `categories` son mixtas: los documentos sin `userId` son base, compartidos por
cualquier usuario autenticado (las 9 cuentas y las categorías que sembró este plan se quedan sin
`userId` a propósito) pero de sólo lectura — únicamente el script de seed (Admin SDK, no pasa por
reglas) los escribe. Los que se crean desde la app llevan el `userId` de quien los creó y sólo
esa persona puede editarlos o borrarlos. Esto coincide con el `isOwner` que ya chequea el
frontend en `AccountEditor`/`CategoryEditor`: las reglas son el mismo límite, no uno más laxo.
`transactions` sigue siendo enteramente privada por `userId`, sin excepción de docs compartidos.
