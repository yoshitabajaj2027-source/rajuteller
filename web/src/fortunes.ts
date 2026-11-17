// Raju Teller fortune engine.
// Words are curated templates written for fun. On-device photo signals
// (face count, smile score, brightness) only steer which lines appear.
// No emotion, compatibility or character is ever stated as fact.
// Voice per Yoshita (17 Nov 2026): witty, snarky, deadpan, badass - never
// cringey, never hype. Max 2-3 short lines per fortune. Friend roasts stay
// affectionate and absurd - habits only, never looks, bodies, or anything
// sensitive.

export type Mode = 'solo' | 'friends' | 'couple';
export type Lang = 'en' | 'hi';
export type PhotoSignals = { faces: number; happiness: number; brightness: number };

const HI: Record<Mode, string[]> = {
  solo: [
    'Badhiya photo. Bar neeche tha. Tum paar kar gaye.',
    'Tota ne worse dekha hai. Better bhi. Aaj tumhara din hai.',
    'Main character energy. Side character timing.',
    'Future bright hai. Battery nahi. Priorities.',
    'Bade kaam aa rahe hain. Charger saath le jana.',
    'Tota approve karta hai. Tota bahut kam approve karta hai.',
    'Destiny ne call kiya. Tum DND pe the. Classic.',
    'Success paas hai. Unread count bhi. Ek-ek battle karo.',
    'Tota greatness predict karta hai. Pehle ek nap. Obviously.',
  ],
  friends: [
    'Yeh? Tumhara 2 baje ka emergency contact? Checks out.',
    'Tota dekhta hai 2032: tumhara dost Chief Toilet Inspector. Five star. Blazer included.',
    'Future: luxury handwash ke brand ambassador. Office: toilet. Sapne ajeeb hote hain.',
    "'On my way' - bed se. Sitaron ne believe karna chhod diya.",
    'Gym membership: active. Gym attendance: fictional.',
    'Advice: world-class. Follow-through: under review.',
    'Tota ne plans check kiye. 4% battery, 0% plan. Phir bhi pahunch jayenge.',
    'Jald famous. Folding chair. Shaadi. Chaudah desh. Bas itna Tota keh sakta hai.',
    'Reply dimaag mein karte hain. 214 pending. Count badh raha hai.',
    'Camera roll: 90% blurry khana, 10% screenshots jo kabhi nahi kharidenge.',
  ],
  couple: [
    'Rab ne bana di jodi. Tota ne approval file kar di.',
    'Last slice ki ladai. Likhi hui hai. Amar hai.',
    "'2 minute mein ready.' Tota ne measure kiya. Chaalis. Naam nahi liya jayega.",
    'Ek phone 5%, doosra charger dhundhta. Balance.',
    'Tota trip dekhta hai. Scroll karo. Packing ho gayi.',
    'Itne sweet ki Tota ko insulin chahiye. 10% kam karo.',
    'Pout mutual tha. Tota ne check kiya. Expected.',
    'Bada shared dream load ho raha hai. Celebration: double. Smugness: bhi double.',
  ],
};

const EN: Record<Mode, string[]> = {
  solo: [
    'Great photo. The bar was low. You cleared it.',
    'Tota has seen worse. Tota has also seen better. Today is your day.',
    'Main character energy. Supporting cast timing.',
    'Your future is bright. Your battery is not. Priorities.',
    'Big things coming. Bring a charger.',
    'Tota approves. Tota approves of very little.',
    'Destiny called. You were on do-not-disturb. Classic.',
    'Success is near. So is your unread count. One battle at a time.',
    'Tota predicts greatness. A nap first, obviously.',
  ],
  friends: [
    'This one? Your 2 AM emergency contact? Checks out.',
    'Tota sees your friend in 2032: Chief Toilet Inspector. Five stars. Blazer included.',
    'Future: brand ambassador of a luxury handwash. Office: a toilet. Dreams are weird.',
    "'On my way' - from bed. The stars have stopped believing.",
    'Gym membership: active. Gym attendance: fictional.',
    'Their advice: world-class. Their follow-through: under review.',
    "Tota checked their plans. 4% battery, 0% plan. They'll still make it.",
    'Famous soon. Folding chair. A wedding. Fourteen countries. That is all Tota can say.',
    'They reply in their head. 214 messages pending. The count grows.',
    "Camera roll: 90% blurry food, 10% screenshots of things they'll never buy.",
  ],
  couple: [
    'Rab ne bana di jodi. Tota has filed the approval.',
    'The last-slice fight is written. It is eternal.',
    "'Ready in 2 minutes.' Tota measured. Forty. No names taken.",
    'One phone at 5%, one hunting a charger. Balance.',
    'Tota sees a trip. Scroll down. Tota already packed you.',
    'So sweet Tota needs insulin. Dial it down 10%.',
    'The pout was mutual. Tota checked. Expected.',
    'Big shared dream loading. Celebration: double. Smugness: also double.',
  ],
};

const POOLS: Record<Lang, Record<Mode, string[]>> = { hi: HI, en: EN };

export type Destination = {
  id: string;
  file: string;
  nameEn: string;
  nameHi: string;
  captionEn: string;
  captionHi: string;
};

// Illustrated backdrops for the couple trip composite. Real on-device
// person cutout over a drawn destination - a fun edit, not a travel photo.
export const DESTINATIONS: Destination[] = [
  {
    id: 'goa',
    file: '/destinations/goa.webp',
    nameEn: 'Goa beach',
    nameHi: 'Goa ki beach',
    captionEn: 'Goa. Sunset argument loading. Verdict: you both look fine.',
    captionHi: 'Goa. Sunset pe bahas loading. Verdict: dono theek lagte ho.',
  },
  {
    id: 'paris',
    file: '/destinations/paris.webp',
    nameEn: 'Paris',
    nameHi: 'Paris',
    captionEn: "Paris. You'll pretend the croissant was 'just okay'. Proof attached.",
    captionHi: "Paris. Croissant ko 'theek tha' bologe. Proof attached.",
  },
  {
    id: 'manali',
    file: '/destinations/manali.webp',
    nameEn: 'Manali snow',
    nameHi: 'Manali ki barf',
    captionEn: "Manali. One of you shivers, one says 'thoda aur photo na'.",
    captionHi: "Manali. Ek kaanpega, doosra bolega 'thoda aur photo na'.",
  },
];

export function pickDestination(sig: PhotoSignals | null): Destination {
  // Steering, not insight: smile score nudges the pick, everything stays fun.
  if (sig && sig.faces > 0) {
    const i = Math.min(DESTINATIONS.length - 1, Math.floor(sig.happiness * DESTINATIONS.length * 1.7) % DESTINATIONS.length);
    return DESTINATIONS[i];
  }
  return DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
}

const lastPick: Record<string, number[]> = {};
function pickTwo(arr: string[], key: string): string[] {
  const used = lastPick[key] || [];
  const fresh = arr.map((_, i) => i).filter(i => !used.includes(i));
  const source = fresh.length >= 2 ? fresh : arr.map((_, i) => i);
  const a = source[Math.floor(Math.random() * source.length)];
  let b = source[Math.floor(Math.random() * source.length)];
  if (source.length > 1) while (b === a) b = source[Math.floor(Math.random() * source.length)];
  lastPick[key] = [a, b];
  return [arr[a], arr[b]];
}

// Short playful line for what the on-device scan actually found.
// Fictional fun, never a claim about who anyone is.
function signalLine(sig: PhotoSignals, mode: Mode, lang: Lang): string | null {
  if (sig.faces < 0) return null; // detection unavailable, stay silent
  const L = lang === 'hi';
  if (sig.faces === 0) {
    return L
      ? 'Tota ko chehra nahi mila - roshni? Doosri photo try karo. Tab tak, generic kismet.'
      : 'Tota found no face - lighting? Try another photo. A general fortune meanwhile.';
  }
  if (sig.brightness < 0.18) {
    return L ? 'Dark photo. Tota andhere mein dekh leta hai.' : 'Dark photo. Tota sees in the dark.';
  }
  if (mode === 'couple' && sig.faces === 1) {
    return L ? 'Ek hi chehra. Partner frame se bhaag gaya?' : 'One face. Did the partner escape?';
  }
  if (mode === 'couple' && sig.faces > 2) {
    return L ? `${sig.faces} chehre. Couple photo ya family function?` : `${sig.faces} faces. Couple photo or family function?`;
  }
  if (mode === 'friends' && sig.faces === 1) {
    return L ? 'Gang kahan hai? Chalo, yeh ek bhi roast hoga.' : "Where's the gang? Fine, this one still gets roasted.";
  }
  if (mode === 'solo' && sig.faces > 1) {
    return L ? `${sig.faces} chehre. Solo tha, par theek hai.` : `${sig.faces} faces. You said solo. Fine.`;
  }
  if (sig.happiness > 0.6) {
    return L ? 'Smile: full brightness. Tota approve.' : 'Smile: full brightness. Tota approves.';
  }
  if (sig.happiness < 0.25) {
    return L ? 'Serious pose. Bold choice.' : 'Serious pose. Bold choice.';
  }
  return null;
}

export function composeFortune(mode: Mode, lang: Lang, sig: PhotoSignals | null): string[] {
  const pool = POOLS[lang][mode];
  const lines: string[] = [];
  if (sig) {
    const s = signalLine(sig, mode, lang);
    if (s) lines.push(s);
  }
  lines.push(...pickTwo(pool, `${lang}-${mode}`));
  return lines.slice(0, 3);
}
