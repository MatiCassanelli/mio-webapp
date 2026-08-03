# Rediseño de mio: de "categorías que hacen de todo" a un modelo que muestra dónde vive la plata

**Brief de diseño — input para Claude Design**

Este documento resume cómo se usa mio hoy, dónde se vuelve engorrosa, el modelo de datos nuevo (Cuentas, Categorías, Monedas, Transferencias) y qué necesita resolver la interfaz para que la app invite a usarse en vez de caer en el abandono.

| | |
|---|---|
| **Producto** | mio — finanzas personales (webapp + bot de Telegram) |
| **Para** | Claude Design |
| **Motivo** | Hoy es útil pero engorrosa, y eso lleva al abandono. La premisa de este refactor es que la app invite a usarse. |
| **Alcance** | La webapp. El bot de Telegram no se rediseña acá, pero su lentitud (cold starts de Cloud Functions) es la razón por la que la web ya no puede tercerizarle la carga rápida. |
| **Estado del modelo** | Propuesto, aún no implementado — el diseño puede asumirlo como destino |
| **Fecha** | 24 de julio de 2026 |

---

## Para leer en 30 segundos

- **La premisa de este refactor es evitar el abandono:** mio solo es útil si se mantiene al día, y hoy la fricción de cargar datos juega en contra de eso.
- **El pedido central de este rediseño: saber cómo se mueve la plata, cuenta por cuenta.** No alcanza con un total global — hace falta ver, por cada Cuenta, el saldo actual, cuánto entró, cuánto salió y cuánto se transfirió, en el período que elija.
- **El bot de Telegram no resuelve la velocidad como se asumía.** Al ser una Cloud Function que se activa on-demand (estilo Lambda), sufre cold starts — cargar por chat se siente lento. La webapp no puede seguir dependiendo de que el bot cubra la carga rápida.
- **El problema también es de modelo:** hoy "Categoría" hace de categoría real y de cuenta/billetera al mismo tiempo, y eso arrastra confusión a cada pantalla.
- La propuesta separa tres cosas que hoy están mezcladas: **Cuenta** (dónde vive la plata), **Categoría** (por qué se movió) y **Moneda** (en qué unidad).
- La webapp tiene que ganar en dos frentes a la vez: **carga rápida y placentera** (para no depender del bot) y **lectura clara de los totales por cuenta**: saldos, movimiento del período y transferencias.
- "Ahorros" deja de ser una sección espejo. "Compra/Venta" se separa en **transferir** entre cuentas y **convertir** moneda.

---

## 01 · Contexto de uso y el riesgo real

mio es la herramienta financiera de un único hogar. Su valor depende por completo de un hábito frágil: cargar todo, seguido, sin saltearse días. Cualquier fricción en ese hábito no es un detalle de UX — es lo que decide si la app se mantiene viva o termina abandonada como una planilla más a medio llenar.

**Bot de Telegram — canal de captura, hoy lento**
Registra movimientos por lenguaje natural, foto de tickets o PDF. Resuelve ambigüedad con preguntas cortas y pide confirmación antes de guardar.
→ Corre sobre una Cloud Function que se activa on-demand (estilo Lambda): cada mensaje después de un rato de inactividad paga un cold start. Se siente lento y corta el impulso de "cargarlo ahora".

**Webapp — hoy solo lectura/gestión, tiene que sumar carga**
Mirar el estado real de la plata, revisar y corregir movimientos, entender categorías y tendencias, administrar cuentas.
→ No puede seguir asumiendo que el bot cubre la carga rápida. Tiene que poder cargar un movimiento en segundos, sin fricción, y sentirse bien al hacerlo.

**Corrección técnica — esto no requiere UI optimista simulada.** La app ya usa Firestore con listeners en tiempo real (`onSnapshot`) para las listas de Movimientos y Ahorros. Cuando un valor se escribe directo contra Firestore desde el cliente, el listener lo refleja al instante — el "optimismo" viene gratis del propio SDK. La condición: el camino de escritura tiene que ser un write directo del cliente Firestore, no un viaje de ida y vuelta por una Cloud Function `onRequest` — ahí reaparece el mismo cold start que tiene el bot. Hoy el Dashboard (`getAllTotals`, `getMonthlyTotalsByCategory`) funciona así; las pantallas nuevas de saldo por Cuenta deberían evitar ese patrón y apoyarse en lecturas/listeners directos.

La consecuencia de diseño: este rediseño no es solo "ordenar el modelo de datos" — es también hacer de la webapp un lugar donde cargar y mirar la plata sea **rápido, placentero y sin fricción**, apoyándose en lo que Firestore ya da gratis en vez de tercerizarlo al bot.

Y dentro de "mirar la plata", lo que más valor tiene no es un número único de patrimonio — es poder responder, **cuenta por cuenta**: ¿cuánto tengo ahora acá?, ¿cuánto entró y salió este mes?, ¿se movió algo hacia o desde otra cuenta? Ese es el eje de las secciones 04 y 05, y el criterio principal para evaluar cualquier propuesta de pantalla de inicio.

---

## 02 · Fricciones actuales

Relevadas revisando las pantallas y los flujos reales de la app, no son opiniones sueltas — cada una tiene un lugar concreto donde se manifiesta.

| Problema | Dónde se nota |
|---|---|
| No hay una vista de "cuánto tengo y dónde". El saldo por cuenta hay que inferirlo clickeando categorías una por una en el Dashboard. | Dashboard → Categorías, sin vista de saldos consolidada |
| El total del Dashboard es engañoso. Dice "(USD)" pero no convierte nada — cada moneda suma por separado. | Encabezado "Acumulado" del Dashboard |
| Categoría y Cuenta están mezcladas. A veces "Categoría" es un motivo de gasto ("Comida") y a veces es una billetera ("Banco Galicia"), sin ninguna distinción visual ni de dato. | Selector de categorías en cualquier formulario |
| "Ahorros" duplica toda la interfaz de "Movimientos" en vez de ser simplemente una cuenta más con su propio saldo. | Secciones Movimientos vs. Ahorros |
| "Compra/Venta" obliga a pensar en categorías-cuenta para algo que en la mitad de los casos es solo mover plata de un lado a otro, sin conversión real. | Pantalla Compra/Venta |
| No hay administración de Cuentas ni Categorías. Se editan directo en la base de datos. | No existe pantalla — es edición manual |
| El listado de movimientos no se puede buscar ni ordenar, solo filtrar por categoría y navegar mes a mes. | Pantalla Movimientos |
| Corregir un movimiento requiere salir a otra pantalla — no hay edición rápida desde la lista. | Lista de transacciones |
| La app registra pero no ayuda a decidir — no hay presupuestos, topes ni comparación contra un plan. | No existe la funcionalidad |

---

## 03 · Modelo de datos nuevo

Tres conceptos que hoy viven aplastados dentro de "Categoría" se separan en entidades propias. Esto es lo que la interfaz tiene que aprender a representar por separado — es la base de todo lo demás en este documento.

### Cuenta — dónde vive la plata
```
Account {
  id: string
  name: string          // "Efectivo", "Banco Galicia", "Wise"
  currencyCode: string   // "ARS", "USD", "BTC"
  type: cash | bank | wallet | broker | crypto | card
  isSavingsAccount: boolean
  openingBalance?: number
  archived: boolean
}
```

### Categoría — por qué se movió la plata
```
Category {
  id: string
  name: string            // "Comida", "Sueldo"
  kind: income | expense | both
  subcategories?: SubCategory[]

  // Ya NO tiene moneda ni cuenta propia.
  // Aplica igual sin importar con qué cuenta se pagó.
}
```

### Moneda — la unidad de valor
```
Currency {
  code: string    // "ARS"
  symbol: string  // "$"
  decimals: number
  isFiat: boolean
}

// Tabla chica de referencia. La Cuenta apunta acá —
// ya no hay símbolo y código duplicados sueltos.
```

### Transacción — el movimiento en sí
```
Transaction {
  id, userId, amount, description, date
  type: income | expense | transfer
  account: {id, name, currencyCode}
  category?: {id, name, subcategory?}
  linkedTransactionId?: string
  // une las 2 patas de una transferencia/conversión
}
```

**Relación:** Una **Transacción** referencia siempre **1 Cuenta**. Si es ingreso o egreso, además referencia **1 Categoría** (opcional en transferencias puras). Una **Cuenta** referencia **1 Moneda**. Una **Categoría** no referencia moneda ni cuenta — es agnóstica de ambas.

**Qué resuelve este cambio**

- *Antes:* "Compra/Venta" valida que no intercambies "contra vos mismo" comparando `category.id + subcategory.id` de las dos puntas — una cuenta disfrazada de categoría.
- *Ahora:* Una Transferencia compara directamente `accountFrom.id ≠ accountTo.id`. La categoría queda libre para describir el motivo real, si es que lo hay.

---

## 04 · Arquitectura de información propuesta

Navegación principal sugerida. Cada ítem indica qué pantalla actual reemplaza o de dónde sale.

- **Inicio** *(antes: Dashboard)* — Panorama consolidado: saldo por cuenta, agrupado por moneda, con totales de ingreso/egreso/transferencias del período y un total de referencia convertido. Responde "¿cuánto tengo y cómo se movió?" sin clickear nada.
- **Cuentas** *(nueva)* — Listado de cuentas con saldo actual, moneda y totales del período. Entrando a cada una: desglose de ingresos/egresos/transferencias, evolución del saldo, ajuste de saldo y estado (activa/archivada).
- **Movimientos** *(se mantiene)* — Ingresos y egresos. Suma filtro por Cuenta además del filtro por Categoría, y búsqueda por texto.
- **Transferencias** *(antes: Compra/Venta)* — Mover plata entre dos Cuentas, con o sin conversión de moneda. Reemplaza el uso forzado de "Compra/Venta" para transferencias simples.
- **Categorías** *(nueva)* — Alta, edición y archivado de categorías/subcategorías — hoy solo existe editando Firestore a mano.
- **Presupuestos** *(nueva · evaluar si entra en v1)* — Tope mensual por categoría y consumo actual contra ese tope.

**"Ahorros" deja de ser un ítem de navegación propio.** Pasa a ser una o más Cuentas con `isSavingsAccount: true`, visibles en "Cuentas" (con un segmento/filtro si hace falta distinguirlas visualmente del resto).

---

## 05 · Flujos clave a diseñar

Estos son los recorridos donde el modelo nuevo cambia la experiencia de verdad. Priorizarlos por sobre repintar pantallas que ya funcionan (login, formulario de movimiento simple).

**A. Captura rápida (quick-add)**
La pieza nueva más importante del brief: hoy no existe un atajo rápido en la web, y ya no podemos depender del bot para eso.
- Accesible desde cualquier pantalla, no solo desde "Movimientos" — un solo paso, sin pantalla intermedia de "¿qué querés registrar?"
- Defaults inteligentes: última cuenta usada, categoría más frecuente, fecha de hoy — nada de eso debería tipearse de nuevo cada vez
- Escritura directa a Firestore desde el cliente + `onSnapshot` en la pantalla que muestra el saldo: el cambio se refleja al instante porque así funciona el SDK, sin necesidad de simular optimismo
- Pensada primero para mobile — es donde más se abandona una carga a medio hacer

**B. Panorama de cuentas y totales (pantalla de Inicio)**
El pedido más importante de este brief: no alcanza con saber el saldo de cada cuenta — hace falta ver cómo se movió la plata en cada una.
- Por cada Cuenta: saldo actual, y en el período elegido (mes/año) — total de ingresos, total de egresos y neto
- Transferencias entrantes y salientes de cada cuenta, mostradas aparte de ingresos/egresos "reales" — mover plata entre tus propias cuentas no debería inflar el total de gasto ni de ingreso de ninguna
- Selector de período (como el `MonthSelector` actual) que recalcule los totales de todas las cuentas a la vez
- Mini-tendencia (sparkline) de evolución del saldo por cuenta, para ver de un vistazo si una cuenta viene creciendo o vaciándose
- Agrupado por Moneda, con un total de referencia consolidado (ver flujo G)
- Calculado con lecturas/listeners directos de Firestore, no con una Cloud Function `onRequest` como el Dashboard actual — así se actualiza solo, sin re-fetch ni cold start
- Acceso directo al detalle de cada cuenta (flujo C) para el desglose completo

**C. Detalle de Cuenta**
El desglose completo de cómo se movió la plata en esa cuenta puntual, no mezclado con las demás.
- Saldo actual, con fecha de último movimiento
- Totales por período desglosados: ingresos, egresos, transferencias entrantes, transferencias salientes y neto — no todo junto en un solo número
- Gráfico de evolución del saldo en el tiempo (mismo patrón que el bar chart mensual actual, pero por Cuenta en vez de por Categoría)
- Movimientos de esa cuenta, marcando con claridad cuáles son transferencias hacia/desde otra cuenta
- Ajuste de saldo / conciliación, para cuando el número calculado no coincide con la plata real
- Archivar cuenta (baja lógica, nunca borrado duro)

**D. Transferencia entre cuentas**
Reemplaza "Compra/Venta" separando dos casos que hoy están forzados a ser el mismo flujo.
- Caso simple: mover plata entre dos cuentas de la misma moneda (sin cotización)
- Caso con conversión: dos monedas distintas, con cotización y las dos patas vinculadas por `linkedTransactionId`
- El swap de puntas que ya existe hoy es un buen patrón — mantenerlo

**E. Administración de Categorías y Cuentas**
Hoy inexistente en la interfaz — es la pieza que más desbloquea autonomía.
- Alta/edición de categoría: nombre, color, ícono, tipo (ingreso/egreso/ambos), subcategorías
- Alta/edición de cuenta: nombre, moneda, tipo, saldo inicial
- Archivar en vez de borrar — debe quedar claro que no rompe el histórico

**F. Movimientos: filtro por Cuenta + búsqueda**
El listado actual solo filtra por categoría y navega por mes.
- Filtro combinable: Cuenta × Categoría × rango de fechas
- Búsqueda por texto en la descripción
- Edición rápida desde la fila (evitar el salto obligado a otra pantalla para correcciones chicas)

**G. Reporte consolidado multi-moneda**
Corrige el label engañoso del Dashboard actual.
- Conversión real usando una tasa de cambio (guardada por transacción o consultada al momento)
- Dejar siempre visible en qué moneda de referencia está expresado el total
- Mantener también la vista sin convertir, por moneda, para quien prefiera pensar así

---

## 06 · Principios para esta vuelta

1. **Cargar tiene que sentirse instantáneo, gratis por diseño de datos.** Escribir siempre directo a Firestore desde el cliente, nunca a través de una Cloud Function `onRequest` — el listener en tiempo real ya refleja el cambio apenas el valor se escribe. No hay que construir optimistic UI a mano; hay que no romper ese camino.
2. **Glanceability en los totales por cuenta.** Saldo, ingresos, egresos y transferencias del período de cada cuenta deben verse sin clickear ni filtrar nada — es el número que más se va a mirar en toda la app.
3. **Transferencia no es lo mismo que ingreso o egreso.** Mover plata entre tus propias cuentas tiene que verse y sumarse aparte — mezclarla rompe la lectura real de cuánto ganás o gastás.
4. **Cuenta y Categoría se ven distinto, siempre.** Nunca deberían compartir el mismo tipo de selector o chip — confundirlas fue el problema original.
5. **Cada carga da una recompensa chica.** Ver el saldo actualizarse al instante, una confirmación breve y clara — lo que sostiene el hábito es que cargar se sienta bien, no como una tarea pendiente.
6. **Mantener la semántica de color validada:** verde = ingreso, rojo = egreso, azul = navegación/acción. Es consistente entre la webapp y los mensajes del bot — no reinventarla.
7. **Mobile-first de punta a punta.** El celular tiene que cubrir carga y lectura por igual — ya no es solo para chequear saldos, porque no podemos depender del bot para lo rápido.
8. **Usar siempre los términos del glosario** (sección 09) en el copy de la interfaz — "Cuenta" y "Categoría" no son intercambiables ni en el diseño ni en el texto.

---

## 07 · Sistema visual existente

Lo que ya está validado y probablemente vale la pena mantener o evolucionar con cuidado, no descartar. Detalle completo en `design.md` del repo.

**Paleta semántica actual**
- Primary `#003fb1` — navegación / acción
- Secondary `#006c49` — ingresos
- Tertiary `#980014` — egresos
- Surface `#f8f9ff` — fondo base

**Tipografía actual**
Manrope (600–900) para títulos, números grandes y navegación. Inter (400–700) para texto de cuerpo y labels. Material Symbols Outlined para íconos.

**Otros lineamientos vigentes**
- MUI v7 como base de componentes, `elevation={0}` + `boxShadow` custom en vez de elevación nativa
- Mobile-first con drawer permanente en desktop (256px) y navegación temporal en mobile
- Border radius generoso (8–12px) en cards, pills e inputs

Claude Design tiene libertad para evolucionar esto si el modelo nuevo lo pide (por ejemplo, un color/badge propio para distinguir "Cuenta" de "Categoría" en los selectores) — pero la paleta semántica ingreso/egreso/acción está probada y no debería cambiar de significado.

---

## 08 · Fuera de alcance / decisiones abiertas

| Tema | Estado |
|---|---|
| Multi-usuario / hogar compartido | Hoy las categorías son globales de forma implícita. No se decidió si esto se formaliza como "Workspace" — diseñar para un solo usuario/hogar por ahora. |
| Tasas de cambio reales e históricas | Necesarias para el reporte consolidado (flujo G). Falta definir si se cargan a mano, se consultan a una API, o ambas — el diseño puede dejar el campo de tasa editable por si acaso. |
| Integraciones bancarias automáticas | No contemplado en esta vuelta. Toda carga sigue siendo manual (web) o vía bot. |
| Presupuestos | Deseable, pero recién a evaluar si entra en v1 o queda para después — no bloquea el resto del rediseño. |
| Arreglar el cold start del bot | Es un problema de infraestructura (backend), no de esta interfaz. Este brief lo toma como un hecho: la webapp evita ese mismo patrón (escritura directa a Firestore + listeners en tiempo real, en vez de Cloud Functions `onRequest`) para no heredar la misma lentitud, en vez de intentar arreglar el bot. |

---

## 09 · Glosario

| Término | Qué es | Nota |
|---|---|---|
| **Cuenta** | Dónde vive la plata: efectivo, banco, billetera, exchange | Antes escondida dentro de "Categoría" |
| **Categoría** | Por qué se movió la plata: Comida, Sueldo, Transporte | Se mantiene, pero ya no tiene moneda ni cuenta propia |
| **Subcategoría** | Detalle dentro de una categoría: Comida → Supermercado | Sin cambios respecto a hoy |
| **Moneda** | La unidad de valor de una Cuenta: ARS, USD, BTC | Antes duplicada en dos campos sueltos (`currency` / `currencyCode`) |
| **Movimiento** | Un ingreso o egreso con categoría, dentro de una cuenta | Sin cambios respecto a hoy |
| **Transferencia** | Traspaso entre dos Cuentas, con o sin conversión de moneda | Nueva — reemplaza el uso forzado de "Compra/Venta" para mover plata sin canje real |
| **Ahorro** | Ya no es una sección aparte: es una Cuenta con `isSavingsAccount: true` | Reemplaza el flag `saving` suelto de hoy |

---

*mio — brief de rediseño UX/UI · preparado por Claude Code a partir del código actual del repo*
