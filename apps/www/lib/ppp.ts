/**
 * Dodo Payments' purchasing power parity table for Ballmac UI Pro: the share of the list price a buyer pays, by country. It is a copy of the table in the Dodo
 * dashboard (Settings, Business, Purchasing Power Parity), which the API does not expose, so when a percentage is changed there it must be changed here too.
 * Countries that are not listed pay the full price. Dodo reads the billing country at checkout; the site only guesses from the visitor's connection, so what
 * the pages show is a guide and the checkout page has the final price.
 */
export const PPP_PERCENT: Readonly<Record<string, number>> = {
  AF: 30, AL: 45, DZ: 35, AD: 65, AO: 30, AG: 70, AR: 45, AM: 35, AW: 75, AU: 90,
  AT: 75, AZ: 30, BS: 95, BH: 45, BD: 30, BY: 30, BE: 75, BZ: 55, BJ: 35, BT: 30,
  BO: 35, BA: 35, BW: 35, BR: 45, BN: 35, BG: 40, BF: 35, BI: 30, KH: 35, CM: 35,
  CA: 85, CV: 45, CF: 40, TD: 35, CL: 45, CN: 50, CO: 35, KM: 45, CG: 35, CD: 40,
  CR: 60, CI: 35, HR: 50, CW: 70, CY: 60, CZ: 55, DK: 90, DJ: 45, DM: 50, DO: 40,
  EC: 45, EG: 30, SV: 40, GQ: 40, EE: 60, ET: 35, FO: 90, FJ: 40, FI: 80, FR: 75,
  GA: 40, GM: 30, GE: 35, DE: 75, GH: 30, GR: 55, GL: 75, GD: 60, GT: 45, GN: 35,
  GW: 30, GY: 35, HT: 65, HN: 45, HK: 70, HU: 50, IN: 30, ID: 30, IR: 30, IQ: 40,
  IE: 80, IL: 95, IT: 65, JM: 60, JP: 60, JO: 45, KZ: 35, KE: 30, KI: 70, KR: 60,
  KW: 60, KG: 30, LA: 30, LV: 55, LB: 40, LS: 35, LR: 45, LY: 45, LT: 55, LU: 90,
  MO: 55, MK: 35, MG: 30, MW: 30, MY: 30, MV: 50, ML: 35, MT: 65, MH: 90, MR: 30,
  MU: 40, MX: 55, FM: 95, MD: 40, ME: 40, MA: 40, MZ: 40, MM: 30, NA: 40, NP: 30,
  NL: 80, NZ: 90, NI: 35, NE: 35, NG: 30, NO: 85, OM: 50, PK: 30, PW: 85, PS: 65,
  PA: 45, PG: 60, PY: 35, PE: 50, PH: 35, PL: 50, PT: 55, PR: 80, QA: 60, RO: 40,
  RU: 30, RW: 30, KN: 70, LC: 50, VC: 55, WS: 60, SM: 75, ST: 55, SA: 50, SN: 35,
  RS: 40, SC: 55, SL: 30, SG: 60, SX: 75, SK: 55, SI: 60, SB: 70, SO: 40, ZA: 40,
  ES: 60, LK: 30, SD: 45, SR: 30, SZ: 35, SE: 80, SY: 30, TJ: 30, TZ: 30, TH: 30,
  TL: 30, TG: 35, TO: 75, TT: 50, TN: 30, TR: 35, TM: 30, TV: 85, UG: 35, UA: 30,
  AE: 65, GB: 85, UY: 65, UZ: 30, VU: 90, VN: 30, VI: 90, ZM: 30, ZW: 40,
}

/** Whether this is a country code we can look up: two capital letters. */
const isCode = (code: unknown): code is string => typeof code === "string" && /^[A-Z]{2}$/.test(code)

/** The price for a country, in dollars and cents, or null when the country pays the full price (or is not known). */
export function pppPrice(listPrice: number, country: unknown): { price: number; percent: number } | null {
  if (!isCode(country) || !Number.isFinite(listPrice) || listPrice <= 0) return null
  const percent = PPP_PERCENT[country]
  if (percent === undefined || percent >= 100) return null
  return { price: Math.round(listPrice * percent) / 100, percent }
}
