# Design System — Mio Webapp

## Overview

Material Design 3–influenced design system built on MUI v7. Semantically coded with **green = ingresos**, **red = egresos**, **blue = navegación/acción**. Mobile-first, responsive.

---

## Color Palette

Defined in [src/theme.ts](src/theme.ts).

### Primary (Azul)

| Token                  | Value     | Use                          |
|------------------------|-----------|------------------------------|
| `primary`              | `#003fb1` | Acciones principales, nav activo |
| `primaryContainer`     | `#1a56db` | Gradientes, botones           |
| `primaryFixed`         | `#dbe1ff` | Fondos con tinte azul         |
| `onPrimary`            | `#ffffff` | Texto sobre primary           |
| `onPrimaryFixed`       | `#00174d` | Texto oscuro sobre fondos azul claro |
| `inversePrimary`       | `#b5c4ff` | —                             |

### Secondary (Verde — Ingresos)

| Token                      | Value     | Use                      |
|----------------------------|-----------|--------------------------|
| `secondary`                | `#006c49` | Ingresos, estado positivo |
| `secondaryContainer`       | `#6cf8bb` | Cards de ingreso          |
| `secondaryFixed`           | `#bafde0` | Fondos con tinte verde    |
| `onSecondary`              | `#ffffff` | Texto sobre secondary     |
| `onSecondaryContainer`     | `#088a61` | —                         |

### Tertiary (Rojo — Egresos)

| Token                     | Value     | Use                       |
|---------------------------|-----------|---------------------------|
| `tertiary`                | `#980014` | Egresos, estado negativo  |
| `tertiaryContainer`       | `#be1e26` | Cards de egreso           |
| `tertiaryFixed`           | `#ffdad7` | Fondos con tinte rojo     |
| `onTertiary`              | `#ffffff` | Texto sobre tertiary      |
| `onTertiaryContainer`     | `#ffd3cf` | —                         |

### Error

| Token              | Value     |
|--------------------|-----------|
| `error`            | `#ba1a1a` |
| `errorContainer`   | `#ffdad6` |
| `onError`          | `#ffffff` |

### Surface

| Token                       | Value     | Use                        |
|-----------------------------|-----------|----------------------------|
| `surface`                   | `#f8f9ff` | Fondo principal (azul muy claro) |
| `surfaceLowest`             | `#ffffff` | Blanco puro                |
| `surfaceContainerLow`       | `#eff4ff` | Inputs, items no activos   |
| `surfaceContainer`          | `#e5eeff` | Cards secundarias          |
| `surfaceContainerHigh`      | `#dce9ff` | Botones deshabilitados     |
| `surfaceContainerHighest`   | `#d3e4fe` | —                          |
| `surfaceDim`                | `#cbdbf5` | —                          |
| `surfaceVariant`            | `#d3e4fe` | —                          |

### Text & Outline

| Token              | Value     | Use                        |
|--------------------|-----------|----------------------------|
| `onSurface`        | `#0b1c30` | Texto principal            |
| `onSurfaceVariant` | `#434654` | Texto secundario           |
| `outline`          | `#737686` | Bordes, separadores        |
| `outlineVariant`   | `#c3c5d7` | Bordes sutiles             |

---

## Typography

Fonts loaded from Google Fonts in [public/index.html](public/index.html).

### Fuentes

| Familia   | Pesos              | Uso                          |
|-----------|--------------------|------------------------------|
| **Manrope** | 600, 700, 800, 900 | Headings, números grandes, nav |
| **Inter**   | 400, 500, 600, 700 | Body, labels, texto general  |
| Material Symbols Outlined | — | Íconos                       |

### Escala tipográfica

| Elemento          | Familia   | Tamaño | Peso | Notas                         |
|-------------------|-----------|--------|------|-------------------------------|
| h1–h2             | Manrope   | —      | 800  | `letterSpacing: -0.5px`       |
| h3–h6             | Manrope   | —      | 700  | `lineHeight: 1.2`             |
| Números grandes   | Manrope   | 22px   | 800  | Totales en cards              |
| Nav labels        | Manrope   | 11px   | 600  | Uppercase, `letterSpacing: 0.1–0.2em` |
| Section labels    | Inter     | 11px   | 600  | Uppercase, `letterSpacing: 0.12–0.15em` |
| Card titles       | Inter     | 13px   | 700  | —                             |
| Body              | Inter     | 13–14px | 500–600 | —                          |

---

## Spacing

MUI base: **8px**. Se referencia como múltiplos: `spacing(1) = 8px`.

| MUI value | px  | Uso típico                   |
|-----------|-----|------------------------------|
| 0.25      | 2px | Gap mínimo                   |
| 0.5       | 4px | Gap icon-text                |
| 1         | 8px | Padding pequeño              |
| 1.5       | 12px | Padding vertical inputs      |
| 2         | 16px | Gap estándar, padding cards mobile |
| 2.5       | 20px | Padding cards                |
| 3         | 24px | Padding form mobile          |
| 4         | 32px | Padding secciones            |
| 5         | 40px | Padding form desktop         |

**Constantes:**
- `DRAWER_WIDTH = 256px`
- Dashboard max-width: `1280px`

---

## Border Radius

`shape.borderRadius = 4` (base MUI).

| MUI value | px  | Uso                          |
|-----------|-----|------------------------------|
| 1         | 4px | Elementos pequeños           |
| 1.5       | 6px | Elementos interactivos chicos |
| 2         | 8px | Inputs, subcategory items    |
| 2.5       | 10px | Botones de acción           |
| 3         | 12px | Cards, pills, category items |
| `50%`     | —   | Avatars, icon containers     |

---

## Shadows

Color base de todas las sombras: `rgba(11,28,48,…)` (azul oscuro).

| Nivel       | CSS value                                    | Uso                         |
|-------------|----------------------------------------------|-----------------------------|
| Sutil       | `0 1px 4px rgba(11,28,48,0.06)`             | User info box               |
| Leve        | `0 4px 12px rgba(11,28,48,0.04)`            | Cards, balance card         |
| Medio       | `0 12px 32px -4px rgba(11,28,48,0.06)`      | Transaction lists, panels   |
| Colored     | `0 4px 14px ${primary}33`                   | Botones gradiente, login form |
| Elevado     | `0 20px 50px rgba(11,28,48,0.05–0.08)`      | Form cards, login           |
| Hover       | `0 6px 20px ${primary}4d`                   | Botones en hover            |
| Charts      | `0 4px 20px rgba(11,28,48,0.12)`            | Bar charts                  |

> Todos los Paper/Card usan `elevation={0}` + `boxShadow` customizado.

---

## Gradients

| Uso                | CSS value                                         |
|--------------------|---------------------------------------------------|
| Botón primary      | `linear-gradient(135deg, #003fb1, #1a56db)`       |
| Botón secondary    | `linear-gradient(135deg, #006c49, #6cf8bb)`       |
| Card ingresos      | `linear-gradient(135deg, secondary, onSecondaryContainer)` |
| Login bar          | `linear-gradient(to right, primary, secondary)`   |

---

## Interactive States

### Buttons
- **Default:** gradiente + `fontWeight: 700` + shadow `33`
- **Hover:** `transform: scale(1.01)` + shadow `4d` + `transition: all 0.3s`
- **Disabled:** `bgcolor: surfaceContainerHigh`
- `textTransform: none`

### Inputs
- **Default:** `bgcolor: surfaceContainerLow`, sin borde
- **Focus:** `border: 2px solid ${primary}33`
- **Disabled:** opacidad reducida, `cursor: not-allowed`

### Category Pills
- **Unselected:** `border: 1.5px solid outlineVariant`, `bgcolor: surfaceContainerLow`
- **Selected:** `border: 1.5px solid {color}`, `bgcolor: alpha(color, 0.12)`, `fontWeight: 700`
- **Hover:** `bgcolor: alpha(color, 0.09)`, borde más marcado
- **Disabled:** `opacity: 0.45`, `cursor: not-allowed`

### Navigation Items
- **Active:** `bgcolor: surfaceContainerLow`, borde derecho `primaryContainer`
- **Inactive:** fondo transparente, `opacity: 0.7`
- **Hover:** `bgcolor: surfaceContainerLow`, `opacity: 1`

---

## Layout

### App Shell
- `display: flex`, `minHeight: 100vh`
- Sidebar fijo (`256px`) + main con `flex: 1`
- Drawer permanente en md+, temporal en xs

### Responsive Breakpoints (MUI)

| Nombre | Ancho mínimo | Uso                         |
|--------|--------------|-----------------------------|
| xs     | 0px          | Mobile (base)               |
| sm     | 600px        | —                           |
| md     | 960px        | Tablet / Desktop            |
| lg     | 1280px       | Large screens               |
| xl     | 1920px       | —                           |

### Patrones comunes

```
// Responsive padding
p: { xs: 2, md: 4 }

// Grid dashboard
gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }

// Ocultar en mobile
display: { xs: 'none', md: 'block' }

// Stack en mobile, fila en desktop
flexDirection: { xs: 'column', md: 'row' }
```

---

## Component Inventory

### Layout
- `AppLayout` — Shell con drawer + contenido principal
- `SideNav` — Navegación lateral (256px)
- `TopBar` — Barra superior responsive

### Forms
- `MovementForm` — Formulario completo ingreso/egreso
- `AmountInput` — Input decimal con separador coma
- `CategorySelector` — Pills de categorías y subcategorías
- `CategoryPill` — Pill con punto de color y label
- `SectionLabel` — Label uppercase para secciones

### Cards & Display
- `TotalCards` — Cards de totales con gradiente (ingresos / egresos / balance)
- `CurrencyTotals` — Totales por moneda
- `CategoryListItem` — Item clickeable con indicador de color
- `SubCategoryListItem` — Subcategoría indentada
- `TransactionItem` — Item de transacción en lista
- `CategoryChip` — Chip pequeño con color de categoría

### Dashboard
- `MonthlyTotalsBarChart` — Gráfico de barras (Recharts, lazy loaded)
- `CategoryTotals` — Lista de totales por categoría
- `MonthlyTotals` — Desglose mensual por categoría

### Utility
- `Icon` — Wrapper para Material Symbols Outlined
- `MonthNavigator` — Navegación prev/next de mes
- `MonthSelector` — Dropdown de año

---

## Key Files

| Archivo | Contenido |
|---------|-----------|
| [src/theme.ts](src/theme.ts) | Paleta completa, MUI theme config |
| [src/index.css](src/index.css) | Global styles base |
| [public/index.html](public/index.html) | Google Fonts imports |
| [src/utils/buttonStyles.ts](src/utils/buttonStyles.ts) | Estilos reutilizables de botones |
| [src/App.tsx](src/App.tsx) | ThemeProvider, setup global |
| [src/components/](src/components/) | Todos los componentes UI |

---

## Dependencies

| Paquete | Versión | Rol |
|---------|---------|-----|
| `@mui/material` | ^7.0.0 | UI library principal |
| `@mui/icons-material` | ^7.0.0 | Íconos adicionales |
| `@mui/x-date-pickers` | ^8.0.0 | Date pickers |
| `@emotion/react` / `styled` | — | CSS-in-JS (MUI engine) |
| `recharts` | 2.12.7 | Gráficos |
| `dayjs` | — | Manejo de fechas (locale ES) |
