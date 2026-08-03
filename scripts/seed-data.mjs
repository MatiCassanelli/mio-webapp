/**
 * Single source of truth for the Accounts / Currencies seed and for the mapping
 * that turns the old `categories` + `subcategories` pairs into Accounts.
 *
 * Derived 1:1 from the real data in `mio-app-dev` (see migration-refactor-plan.md §4).
 */

/** @type {Array<{code:string,name:string,symbol:string,decimals:number,isFiat:boolean,usdRate:number,order:number}>} */
export const CURRENCIES = [
  { code: 'ARS', name: 'Pesos', symbol: '$', decimals: 2, isFiat: true, usdRate: 1310, order: 0 },
  { code: 'USD', name: 'Dólares', symbol: 'U$S', decimals: 2, isFiat: true, usdRate: 1, order: 1 },
  { code: 'USDT', name: 'Tether', symbol: '₮', decimals: 2, isFiat: false, usdRate: 1, order: 2 },
  { code: 'EUR', name: 'Euros', symbol: '€', decimals: 2, isFiat: true, usdRate: 0.92, order: 3 },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', decimals: 8, isFiat: false, usdRate: 0.00001, order: 4 },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', decimals: 8, isFiat: false, usdRate: 0.0003, order: 5 },
];

/**
 * `usdRate` is "how many units of this currency you get for 1 USD".
 * They are seed values only — the app lets you edit them from "Cómo se calcula".
 */

/** @type {Array<{id:string,name:string,currencyCode:string,type:string,color:string,order:number}>} */
export const ACCOUNTS = [
  { id: 'ars-efectivo', name: 'Efectivo ARS', currencyCode: 'ARS', type: 'cash', color: '#ce93d8', order: 0 },
  { id: 'ars-transferencia', name: 'ARS en cuenta', currencyCode: 'ARS', type: 'bank', color: '#CC0099', order: 1 },
  { id: 'usd-efectivo', name: 'Efectivo USD', currencyCode: 'USD', type: 'cash', color: '#50CD48', order: 2 },
  { id: 'usd-wise', name: 'Wise', currencyCode: 'USD', type: 'wallet', color: '#A73A3A', order: 3 },
  { id: 'usdt-wallet', name: 'USDT', currencyCode: 'USDT', type: 'crypto', color: '#EDAC8F', order: 4 },
  { id: 'eur-efectivo', name: 'Efectivo EUR', currencyCode: 'EUR', type: 'cash', color: '#ff66cc', order: 5 },
  { id: 'eur-tarjeta', name: 'Tarjeta EUR', currencyCode: 'EUR', type: 'card', color: '#ff0080', order: 6 },
  { id: 'btc-wallet', name: 'Bitcoins', currencyCode: 'BTC', type: 'crypto', color: '#FCC303', order: 7 },
  { id: 'eth-wallet', name: 'Ethereum', currencyCode: 'ETH', type: 'crypto', color: '#57E5F9', order: 8 },
];

/** `${category.id}|${category.subcategory?.id ?? ''}` → account id */
export const ACCOUNT_MAP = {
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

/** The snapshot embedded into every transaction. Must match `accountRef` in the webapp. */
export const accountRef = (account) => ({
  id: account.id,
  name: account.name,
  currencyCode: account.currencyCode,
  color: account.color,
  type: account.type,
});

export const ACCOUNTS_BY_ID = Object.fromEntries(ACCOUNTS.map((a) => [a.id, a]));
