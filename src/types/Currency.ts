/** The unit of value for an Account. Small reference table. */
export interface Currency {
  /** ISO code — also the document id. */
  code: string;
  /** Long name, for the group header: "Pesos · ARS". */
  name: string;
  symbol: string;
  decimals: number;
  isFiat: boolean;
  /** How many units of this currency equal 1 USD. Set by the user. */
  usdRate: number;
  order: number;
}

export const USD_CODE = 'USD';
