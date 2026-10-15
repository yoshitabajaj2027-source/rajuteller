export const ENTITLEMENT = 'raju_pro';
export function isPro(info: {entitlements:{active:Record<string,unknown>}}): boolean {
  return Boolean(info.entitlements.active[ENTITLEMENT]);
}
export function canShowBanner(s:{consent:boolean;customerKnown:boolean;pro:boolean;onboarded:boolean}):boolean {
  return s.consent && s.customerKnown && !s.pro && s.onboarded;
}
export function usableRevenueCatKey(key:string|undefined,production:boolean):boolean {
  return !!key && !/placeholder|your_|xxxx/i.test(key) && (!production || !key.startsWith('test_'));
}
