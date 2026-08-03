# Plan de migración y refactor — mio (Cuentas / Categorías / Monedas)

**Input para otro modelo/sesión de Claude que va a ejecutar la implementación.**
Este documento es un plan, no un registro de trabajo hecho — nada de lo que describe se ejecutó todavía (sin escrituras en Firestore, sin branch creada, sin código modificado). Se apoya en dos documentos previos del repo:

- `redesign-brief.md` — el porqué del rediseño, el modelo de datos target, los flujos de UX y los principios de diseño.
- Este documento — el cómo: migración de datos real, cambios de código, orden de ejecución.

Los datos reales de Firestore (proyecto `mio-app-dev`) se consultaron en modo lectura para construir este plan: 6 documentos en `categories`, 825 en `transactions` (788 movimientos + 37 marcados `saving`).

---

## 0. Corrección al brief: "ahorro" no es una propiedad de Cuenta

El brief (`redesign-brief.md`, sección 03) proponía `isSavingsAccount: boolean` como campo de `Account`. Los datos reales lo contradicen: cuentas como `usd/usdCash` (Efectivo USD) tienen transacciones con `saving:true` **y** `saving:false` mezcladas — la misma cuenta física se usa para movimientos comunes y para ahorro.

**Corrección:** `saving` se mantiene como atributo de la **Transacción**, no de la Cuenta. Ninguna cuenta es "de ahorro" en sí misma — lo que se ahorra es un movimiento puntual, en cualquier cuenta.

**Impacto en el brief:** la sección 04 (arquitectura de información) decía que "Ahorros deja de ser un ítem de navegación... pasa a ser una Cuenta con `isSavingsAccount: true`". Eso queda invalidado. La forma correcta es que "Ahorros" siga siendo una **vista filtrada transversal** (todas las transacciones con `saving: true`, de cualquier cuenta), no una lista de cuentas distintas. Si se quiere, esto se puede resolver como un filtro/segmento dentro de "Movimientos" en vez de una sección aparte — es una decisión de UX que vale la pena confirmar con Claude Design antes de construir la pantalla (ver sección 9.6).

---

## 1. Alcance de este plan

**Incluye:** migración de Firestore (`accounts`, `currencies`, `transactions`), refactor de tipos/servicios/contexto en la webapp, actualización del bot de Telegram para el nuevo esquema, implementación de las pantallas de `redesign-brief.md` (secciones 04-05), e integración del resultado de Claude Design vía el MCP correspondiente.

**No incluye** (igual que la sección 08 del brief): multi-usuario, tasas de cambio reales/automáticas, presupuestos, arreglar el cold start del bot. Tampoco incluye resolver todavía la UX de "Ahorros" corregida en la sección 0 — queda marcada como decisión pendiente antes de construir esa pantalla puntual.

---

## 2. Estrategia de rama

Una sola branch de recorrido largo: **`refactor/accounts-model`**, creada desde `develop` (mismo patrón que el resto del repo: `feature/dashboard`, `improve-ui`, `telegram-agentic-chatbot`, todas mergeadas a `develop` vía PR).

No dividir en múltiples PRs chicos mergeados por separado — el bot y la webapp leen las mismas colecciones (`categories`/`accounts`, `transactions`), así que un merge parcial deja el sistema en un estado roto. En cambio, commitear en fases dentro de la misma branch:

1. `feat(data): seed de accounts/currencies + script de migración de transactions`
2. `refactor(types,services): Account/Category/Currency, servicios y contexto`
3. `refactor(functions/bot): esquema nuevo en parser, tools y transactions`
4. `feat(ui): pantallas nuevas y actualizadas`
5. `feat(design): integración del sistema visual desde Claude Design`
6. `chore(cleanup): remover campos y colecciones deprecadas`

Mergear a `develop` solo cuando el corte completo (datos + servicios + bot + UI) funcione de punta a punta contra Firestore real (o contra el emulador). `main` no se toca hasta validar `develop` en uso real por un tiempo.

---

## 3. Modelo de datos final (ajustado)

```ts
// types/Currency.ts
interface Currency {
  code: string;       // "ARS", "USD", "EUR", "BTC", "ETH", "USDT"
  symbol: string;      // "$", "US$", "€", "₿", "Ξ", "₮"
  decimals: number;    // 2 para fiat; definir cripto (ver 5.1)
  isFiat: boolean;
}

// types/Account.ts
interface Account {
  id: string;
  name: string;             // "Efectivo", "Wise", "Transferencia", "Bitcoins"...
  currencyCode: string;     // FK a Currency.code
  color: string;
  type: 'cash' | 'bank' | 'card' | 'wallet' | 'crypto';
  archived: boolean;
  openingBalance?: number;  // opcional, no hay dato histórico de esto hoy
}

// types/Category.ts (sin cambios respecto al brief — sigue vacío hoy)
interface Category {
  id: string;
  name: string;
  kind: 'income' | 'expense' | 'both';
  subcategories?: SubCategory[];
}

// types/Transaction.ts
interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: Timestamp;
  type: 'income' | 'expense' | 'transfer';
  saving: boolean;               // se mantiene, a nivel Transacción (ver sección 0)
  account: {                     // snapshot, como hoy con category
    id: string;
    name: string;
    currencyCode: string;
    color: string;
  };
  category?: {                   // opcional — no hay datos históricos, es forward-only
    id: string;
    name: string;
    subcategory?: { id: string; name: string };
  };
  linkedTransactionId?: string;  // une las 2 patas de una transferencia/conversión
}
```

Colecciones Firestore nuevas: `currencies`, `accounts`. `categories` (la actual) se **deja de leer** desde código nuevo pero no se borra hasta el paso de limpieza final (sección 10). `transactions` se reescribe in-place.

---

## 4. Semilla de datos: `currencies` y `accounts`

### 4.1 `currencies` (6 documentos)

| code | symbol | decimals | isFiat |
|---|---|---|---|
| ARS | $ | 2 | true |
| USD | US$ | 2 | true |
| EUR | € | 2 | true |
| BTC | ₿ | 8 | false |
| ETH | Ξ | 18 | false |
| USDT | ₮ | 2 | false |

*(decimals de BTC/ETH son estándar de la industria — no hay dato previo en Firestore para esto, es una decisión nueva. USDT se trata como stablecoin, 2 decimales alcanza para el uso que le da la app hoy.)*

### 4.2 `accounts` (9 documentos, derivados 1:1 de `categories` + `subcategories` reales)

| id propuesto | name | currencyCode | type | color | movimientos históricos |
|---|---|---|---|---|---|
| `ars-efectivo` | Efectivo | ARS | cash | `#ce93d8` | 48 |
| `ars-transferencia` | Transferencia | ARS | bank | `#CC0099` | 183 |
| `usd-efectivo` | Efectivo | USD | cash | `#50CD48` | 188 |
| `usd-wise` | Wise | USD | wallet | `#A73A3A` | 176 |
| `eur-efectivo` | Efectivo | EUR | cash | `#ff66cc` | 14 |
| `eur-tarjeta` | Tarjeta | EUR | card | `#ff0080` | 56 |
| `btc-wallet` | Bitcoins | BTC | crypto | `#FCC303` | 3 |
| `eth-wallet` | Etherum | ETH | crypto | `#57E5F9` | 1 |
| `usdt-wallet` | USDT | USDT | crypto | `#EDAC8F` | 156 |

*(mantengo el nombre "Etherum" tal como está hoy en el dato real — es un typo de origen ("Ethereum"), corregirlo es cosmético y no bloquea nada; se puede arreglar en el mismo paso si se quiere.)*

Estos 9 documentos se escriben una sola vez, a mano o con un script trivial — no hace falta generarlos desde `categories`, ya están completamente definidos en esta tabla.

---

## 5. Script de migración de `transactions`

Lógica (para implementar como script Node con `firebase-admin`, corrido manualmente, no como Cloud Function):

```js
// Mapeo estático category.id + subcategory.id -> accountId (de la tabla 4.2)
const ACCOUNT_MAP = {
  'ars|arsCash': 'ars-efectivo',
  'ars|arsTransf': 'ars-transferencia',
  'usd|usdCash': 'usd-efectivo',
  'usd|wise': 'usd-wise',
  'eur|eurCash': 'eur-efectivo',
  'eur|eurCard': 'eur-tarjeta',
  'btc|': 'btc-wallet',
  'eth|': 'eth-wallet',
  'usdt|': 'usdt-wallet',
};

async function migrate({ dryRun = true }) {
  const snapshot = await db.collection('transactions').get();
  const docs = snapshot.docs.filter(d => !d.data().schemaVersion); // idempotente: salta ya migrados

  // 1. Resolver account por doc, dejar `type` provisorio income/expense
  const resolved = docs.map(d => {
    const t = d.data();
    const key = `${t.category.id}|${t.category.subcategory?.id ?? ''}`;
    const accountId = ACCOUNT_MAP[key];
    if (!accountId) throw new Error(`Sin mapeo para ${d.id}: ${key}`);
    return { id: d.id, ...t, accountId, provisionalType: t.income ? 'income' : 'expense' };
  });

  // 2. Detectar pares de transferencia/conversión: mismo date (ms) + misma description,
  //    income opuesto -> son las 2 patas de un mismo Compra/Venta histórico
  const byKey = groupBy(resolved, t => `${t.date.toMillis()}|${t.description}`);
  const linked = new Map(); // docId -> linkedDocId
  for (const group of Object.values(byKey)) {
    if (group.length === 2 && group[0].income !== group[1].income) {
      linked.set(group[0].id, group[1].id);
      linked.set(group[1].id, group[0].id);
    }
  }

  // 3. Armar el batch de escritura (accounts[accountId] = seed de la sección 4.2)
  const batch = db.batch();
  resolved.forEach(t => {
    const account = ACCOUNTS_SEED[t.accountId]; // {id, name, currencyCode, color}
    const isTransfer = linked.has(t.id);
    batch.update(db.collection('transactions').doc(t.id), {
      account,
      type: isTransfer ? 'transfer' : t.provisionalType,
      linkedTransactionId: linked.get(t.id) ?? null,
      schemaVersion: 2,
      // category: no se toca — no hay dato histórico, queda ausente
    });
  });

  if (dryRun) {
    console.log(`Dry run: ${resolved.length} documentos, ${linked.size / 2} pares de transferencia detectados`);
    return;
  }
  await batch.commit();
}
```

Notas de implementación:
- **Idempotente**: el filtro `!d.data().schemaVersion` permite correrlo de nuevo sin duplicar trabajo si se corta a mitad de camino.
- **825 documentos** entran cómodos en un solo `batch()` de Firestore (límite 500 operaciones — hay que partirlo en 2 batches, o usar `BulkWriter`). Mencionarlo explícitamente para quien implemente: **el límite de 500 por batch se supera con 825 docs, usar `BulkWriter` o 2 batches.**
- Correr primero con `dryRun: true` y revisar el conteo antes de escribir.
- **Backup obligatorio antes de correr en modo real**: `gcloud firestore export gs://<bucket>/backups/pre-accounts-migration-$(date +%F)`.
- El campo `category` de las transacciones migradas queda sin escribir (no `null` explícito, directamente ausente) — es correcto, no hay categorías reales que asignar retroactivamente.

---

## 6. Cambios en servicios y lógica (webapp)

| Actual | Nuevo | Cambio |
|---|---|---|
| `types/Transaction.ts` (`Category`, `SubCategory`) | `types/Account.ts`, `types/Currency.ts`, `types/Category.ts`, `types/Transaction.ts` actualizado | split de tipos, según sección 3 |
| `services/categories.ts` (`getAllCategories`) | `services/accounts.ts` (`getAllAccounts`) | lee `accounts` en vez de `categories`, mismo patrón de client SDK directo |
| `services/dashboard.ts` + `functions/index.js` (`getAllTotals`, `getMonthlyTotalsByCategory`) | **eliminar** — reemplazar por hook `useAccountTotals(period)` | eran Cloud Functions `onRequest`; el brief (principio 01) pide evitar ese patrón por el cold start. El cálculo de totales por cuenta pasa a hacerse client-side sobre un listener `onSnapshot` de `transactions` filtrado por `userId` + rango de fecha, agregado con `useMemo` |
| `context/CategoryContext.tsx` | `context/AccountContext.tsx` | mismo shape (loading, seleccionado, click handlers), fuente de datos `accounts` |
| — | `context/CategoryContext.tsx` nuevo, liviano | placeholder para cuando existan categorías reales; no bloquea nada si queda vacío |
| `services/transactions.ts` (`createTransaction`, `editTransaction`, `buySellTransaction`, `getTransactionsSnapshot`) | mismo archivo, actualizado | reemplazar `category`/`subcategory` por `accountId` en los parámetros; `buySellTransaction` se renombra conceptualmente a `createTransfer` y escribe `linkedTransactionId` cruzado en las dos patas dentro de un mismo `writeBatch` |
| — | `services/accounts.ts`: `createAccount`, `updateAccount`, `archiveAccount` | nuevo — soporta el flujo E (administración) |
| — | `services/categories.ts`: `createCategory`, `updateCategory`, `archiveCategory` | nuevo — mismo flujo E, para cuando se empiecen a crear categorías reales |

Revisar también: no hay `firestore.rules` en el repo (se administran fuera del repo). Falta agregar reglas para `accounts` y `currencies` en la consola de Firebase — no lo puede hacer este plan por sí solo, marcarlo como tarea manual.

---

## 7. Cambios en el bot (`functions/bot/`)

| Archivo | Cambio |
|---|---|
| `transactions.js` | `getCategoriesMap`/`getCategoriesList` → `getAccountsMap`/`getAccountsList`, apuntando a la colección `accounts`. `writeTransactions` escribe `account` en vez de `category`+`subcategory`. `buildBalanceSummary`/`getSubcategoryBalance` pasan a calcular balance por `accountId` (ya no hay dos niveles categoría/subcategoría que resolver, es un solo nivel plano) |
| `tools.js` (`PARSE_TOOL`) | `categoryId`/`subcategoryId` → un único `accountId` en el schema — se simplifica, ya no hay jerarquía de dos niveles que el modelo tenga que resolver |
| `prompts/parser.md` | Actualizar las referencias a "categorías/subcategorías" por "cuentas". La lógica de negocio (comisiones, cotizaciones, exchange = dos transacciones vinculadas) no cambia — solo el vocabulario y que ahora hay un solo nivel de resolución en vez de dos |
| `webhook.js` (`formatTransaction`, `buildConfirmationMessage`) | Mostrar `account.name` en vez de `categoría (subcategoría)` |

El bot **no gana categorización real** en este refactor — sigue resolviendo únicamente la cuenta, igual que hoy resuelve categoría+subcategoría. Es un cambio de vocabulario y de forma de dato, no de funcionalidad conversacional.

---

## 8. Pantallas — plan de implementación

Referencia: flujos A-G de `redesign-brief.md` sección 05. Mapeo a archivos concretos:

| Flujo | Archivos | Notas |
|---|---|---|
| A. Captura rápida | `components/quickadd/QuickAddSheet.tsx` (nuevo) + trigger en `AppLayout.tsx` | accesible desde cualquier ruta; usa `createTransaction` directo (ya es client SDK, cumple principio 01 del brief sin cambios adicionales) |
| B. Panorama de cuentas | `pages/Dashboard.tsx` reescrito como "Inicio", usa `useAccountTotals` | reemplaza el `getAllTotals` actual |
| C. Detalle de Cuenta | `pages/AccountDetail.tsx` (nuevo) + ruta `ROUTES.ACCOUNT_DETAIL` | reutiliza `TransactionList` filtrado por `accountId` |
| D. Transferencia | `pages/CurrencyExchange.tsx` → `pages/Transfer.tsx` | `isSameAccount` se simplifica a `accountFrom.id !== accountTo.id`; los campos de cotización quedan condicionales a que las monedas difieran |
| E. Administración de Cuentas/Categorías | `pages/AccountsAdmin.tsx`, `pages/CategoriesAdmin.tsx` (nuevos) | CRUD sobre `services/accounts.ts` / `services/categories.ts` |
| F. Movimientos: filtro + búsqueda | `pages/Transactions.tsx` extendido | sumar filtro por `accountId` y búsqueda de texto (client-side sobre lo ya cargado — Firestore no tiene full-text search nativo, no vale la pena una solución de búsqueda server-side para este volumen de datos) |
| G. Reporte consolidado multi-moneda | depende de tasas de cambio reales (fuera de alcance, brief sección 08) | fase 2, no bloquea el resto |

Cambios de ruteo: nuevas constantes en `lib`/`ROUTES` (`ACCOUNT_DETAIL`, `ACCOUNTS`, `ACCOUNTS_ADMIN`, `CATEGORIES_ADMIN`, `TRANSFER` reemplazando `TRANSACTIONS_EXCHANGE`), actualizar `Routes.tsx`.

**"Ahorros" queda pendiente de decisión de diseño** (ver sección 0) — no construir esa pantalla hasta resolver si es un filtro transversal en Movimientos o algo distinto. No es parte de los flujos A-G del brief original.

---

## 9. Integración del diseño de Claude Design

Cuando el diseño esté listo en un proyecto de `claude.ai/design`, usar el skill `/design-sync` junto con la tool `DesignSync` (MCP) para traer los componentes al repo — **de forma incremental, componente por componente, nunca como reemplazo total**, que es como la propia herramienta está pensada para usarse.

Secuencia (a ejecutar cuando corresponda, no ahora):
1. `DesignSync list_projects` → identificar el proyecto de diseño de mio.
2. `DesignSync get_project` → confirmar que es `type: PROJECT_TYPE_DESIGN_SYSTEM`.
3. `DesignSync list_files` → diff estructural contra los componentes locales existentes (`src/components/`).
4. Para cada componente a traer: `get_file` solo si hace falta comparar contenido puntual.
5. `finalize_plan` con los paths exactos a escribir — requiere revisión y aprobación explícita antes de este paso.
6. `write_files` con el `planId` de la aprobación.

Este paso va **después** de que las capas de datos y servicios (secciones 3-7) estén funcionando — así los componentes nuevos ya tienen de dónde leer datos reales cuando se integran, en vez de quedar con mocks.

---

## 10. Orden de despliegue y limpieza final

1. Backup de Firestore.
2. Correr migración en modo real (`dryRun: false`) contra `accounts`/`currencies`/`transactions`.
3. Deployar `functions` (bot) y la webapp **juntos**, en el mismo momento — el bot viejo no puede seguir corriendo contra datos ya migrados (esperaría `category`, ya no existe), así que no hay margen para un cutover gradual.
4. Dejar la colección `categories` (la vieja) sin tocar por un tiempo como red de rollback — no borrarla en este paso.
5. Recién cuando el modelo nuevo esté validado en uso real: eliminar `categories` (la vieja) y los campos deprecados que puedan haber quedado (`isUsdValue`, `currency` duplicado del lado de `Currency`).

---

## 11. Checklist de validación antes de mergear a `develop`

- [ ] Backup de Firestore tomado y verificado como restaurable
- [ ] Migración corrida en dry-run, conteo de 825 documentos y de pares de transferencia detectados revisado manualmente
- [ ] Migración corrida en real, `schemaVersion: 2` presente en los 825 documentos
- [ ] Reglas de Firestore actualizadas para `accounts` y `currencies` (fuera del repo, en consola)
- [ ] Bot: mensaje de prueba end-to-end (vincular cuenta → registrar movimiento → confirmar → ver balance de cuenta actualizado)
- [ ] Webapp: login → Inicio muestra saldos correctos por cuenta → captura rápida refleja el cambio al instante sin refresh
- [ ] `getAllTotals`/`getMonthlyTotalsByCategory` (Cloud Functions viejas) removidas y sin referencias colgantes en el código
- [ ] Decisión de UX de "Ahorros" tomada e implementada (o explícitamente pospuesta con nota en el PR)

---

## 12. Fuera de alcance / decisiones abiertas

Heredadas de `redesign-brief.md` sección 08 (multi-usuario, FX real, presupuestos, cold start del bot) más las nuevas de este plan:

| Tema | Estado |
|---|---|
| UX de "Ahorros" tras la corrección de la sección 0 | Pendiente — no bloquea el resto de la migración, sí bloquea construir esa pantalla puntual |
| Decimales de monedas cripto (BTC/ETH/USDT) | Definidos con valores estándar de industria en este plan (sección 4.1) — no había dato previo, se puede ajustar |
| Typo "Etherum" → "Ethereum" | Cosmético, se puede corregir en el mismo paso de seed sin impacto |
| Reglas de Firestore para colecciones nuevas | No versionadas en el repo — hay que actualizarlas manualmente en consola, no es parte de este plan poder hacerlo |

---
