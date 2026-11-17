import React, { useEffect, useRef, useState } from 'react';
import { answer, edit, emptyTrick, visible } from './trick';
import { composeFortune, pickDestination, type Destination, type Lang, type Mode, type PhotoSignals } from './fortunes';
import { compositeTrip } from './segment';
import { analyzePhoto, loadModels } from './photoAI';
import mascot from './mascot.png';
import './style.css';

// --- Monetization (confirmed by Yoshita on WhatsApp, 24 Oct 2026) ------------
// 3 free questions per day, renewed daily; each additional question costs INR 11.
const FREE_QUESTION_ALLOWANCE = 3;
const ALLOWANCE_MODE: 'once' | 'daily' = 'daily';
const PRICE_PER_QUESTION_INR = 11;
// No payment provider is integrated. The paywall below is a placeholder screen,
// NOT a working checkout. paidCredits stays 0 until a real provider (e.g.
// Razorpay) is connected and server-verified.
const paidCredits = 0;
// Demo-grade counter: localStorage in this browser only. Not an enforceable
// entitlement - clearing site data resets it. Real enforcement needs a backend
// (web) or store billing (native).
const STORAGE_KEY = 'raju-teller-questions-v1';

type Ledger = { count: number; day: string };
// Daily allowance renews at midnight in the visitor's own browser timezone.
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function loadLedger(): Ledger {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Ledger;
      if (typeof parsed.count === 'number') {
        if (ALLOWANCE_MODE === 'daily' && parsed.day !== today()) return { count: 0, day: today() };
        return { count: parsed.count, day: parsed.day || today() };
      }
    }
  } catch { /* ignore corrupt storage */ }
  return { count: 0, day: today() };
}
function saveLedger(l: Ledger) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); } catch { /* private mode */ }
}

// Language default is intentionally neutral until Yoshita confirms
// English vs Hinglish (voice-note transcripts disagreed on 16 Nov 2026).
const DEFAULT_LANG: Lang = 'en';

const UI = {
  en: {
    navMagic: 'Party Trick', navPhoto: 'Photo Kismat', navRaju: 'Raju', navStore: 'Dukaan',
    heroTag: 'Tota the parrot reads your photo\'s kismat.',
    heroSub: 'Photo in, kismat out. Friends get roasted. Couples get sent on their next trip.',
    heroCta: 'Get your Photo Kismat',
    heroCta2: 'The party trick',
    photoTitle: 'Photo Kismat',
    photoSub: 'Upload a photo - solo, friends, or couple. Tota does the rest.',
    tripTitle: 'Tota has packed your bags',
    tripWorking: 'Tota is cutting you out and flying you there...',
    tripNote: 'On-device AI cutout on an illustrated backdrop - a fun edit, not a real photo of your future. Still only on your device.',
    downloadTrip: 'Save the proof',
    modeSolo: 'Solo', modeFriends: 'Friends', modeCouple: 'Couple',
    pickPhoto: 'Choose or take a photo',
    changePhoto: 'Change photo',
    analyze: 'Tell my kismat, Tota!',
    analyzing: 'Tota is looking at your photo...',
    again: 'One more!',
    photoNoteTitle: 'Seedhi baat:',
    photoNote: 'Tota scans your photo only on your device (faces and smiles) and answers from his own joke collection - fun templates, not real AI prediction. Photos are never uploaded, stored, or shared.',
    rajuTitle: 'Raju - your favourite influencer (of his own lane)',
    rajuSub: 'Raju does not do brand deals. Raju does only one thing: hype people up. Tota handles the commentary.',
    storeTitle: 'Raju ki Dukaan',
    storeSub: 'Tota-approved goodies are being packed. The store opens soon - no fake products, no fake countdowns, promise.',
    storeBadge: 'Coming soon',
    footerTrick: 'Raju Teller is pure entertainment - magic, fortunes and jokes, all for fun.',
    footerPhoto: 'Photo Kismat scans photos only on your own device. Nothing is ever uploaded or stored.',
    footerMade: 'Made with masti by Raju and Tota.',
  },
  hi: {
    navMagic: 'Party Trick', navPhoto: 'Photo Kismat', navRaju: 'Raju', navStore: 'Dukaan',
    heroTag: 'Tota parrot tumhari photo ki kismet batata hai.',
    heroSub: 'Photo daalo, kismat pao. Dost roast honge. Couples agli trip pe jayenge.',
    heroCta: 'Photo Kismat suno',
    heroCta2: 'Party trick dekho',
    photoTitle: 'Photo Kismat',
    photoSub: 'Photo upload karo - solo, dost, ya couple. Baaki Tota sambhal lega.',
    tripTitle: 'Tota ne packing karwa di',
    tripWorking: 'Tota tumhe kaat ke wahan pahuncha raha hai...',
    tripNote: 'On-device AI cutout, illustrated backdrop ke saath - fun edit hai, future ki asli photo nahi. Photo phir bhi sirf tumhare device pe.',
    downloadTrip: 'Proof save karo',
    modeSolo: 'Solo', modeFriends: 'Dost', modeCouple: 'Couple',
    pickPhoto: 'Photo chuno ya kheencho',
    changePhoto: 'Photo badlo',
    analyze: 'Tota, meri kismet bata!',
    analyzing: 'Tota tumhari photo dekh raha hai...',
    again: 'Ek aur!',
    photoNoteTitle: 'Seedhi baat:',
    photoNote: 'Tota tumhari photo sirf tumhare device pe scan karta hai (chehre aur smiles) aur apni joke collection se jawab deta hai - fun templates, koi asli AI prediction nahi. Photo kabhi upload, save ya share nahi hoti.',
    rajuTitle: 'Raju - tumhara favourite influencer (apni lane ka)',
    rajuSub: 'Raju brand deals nahi karta. Raju sirf ek kaam karta hai: logon ko hype karna. Commentary Tota sambhalta hai.',
    storeTitle: 'Raju ki Dukaan',
    storeSub: 'Tota-approved cheezein pack ho rahi hain. Dukaan jald khulegi - na fake products, na fake countdown, pakka promise.',
    storeBadge: 'Jald aa raha hai',
    footerTrick: 'Raju Teller pure entertainment hai - jaadu, kismet aur jokes, sab fun ke liye.',
    footerPhoto: 'Photo Kismat photos sirf tumhare apne device pe scan karti hai. Kuch bhi upload ya save nahi hota.',
    footerMade: 'Raju aur Tota ki masti se bana.',
  },
} as const;

function Sparkles() {
  return <div className="sparkles" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ '--angle': `${i * 20}deg`, '--delay': `${(i % 4) * .06}s`, '--distance': `${65 + (i % 3) * 24}px` } as React.CSSProperties}>✦</span>)}</div>;
}

const MAGIC_UI = {
  en: {
    heading: 'Ask Raju', partyBadge: 'Party trick', callLabel: 'Call on Raju', questionLabel: 'Your question',
    questionPlaceholder: 'What would you like to know?', askButton: 'Ask Tota Parrot',
    resetButton: 'Reset', askAgain: 'Ask again',
    fillBoth: 'Fill in both fields first.', quiet: 'Raju is quiet today. Ask again.',
    freeLeft: (n: number) => `${n} of ${FREE_QUESTION_ALLOWANCE} free questions left`,
    paywallTitle: 'Tota is resting',
    paywallBody: `Tota the parrot has answered your ${FREE_QUESTION_ALLOWANCE} free questions.`,
    paywallPrice: `Every further question: \u20B9${PRICE_PER_QUESTION_INR}.`,
    paywallButton: `Pay \u20B9${PRICE_PER_QUESTION_INR} - coming soon`,
    paywallNote: 'Payments are not connected yet, so this button does nothing.',
  },
  hi: {
    heading: 'Raju se Poochho', partyBadge: 'Party trick', callLabel: 'Raju ko bulao', questionLabel: 'Tumhara sawaal',
    questionPlaceholder: 'Kya jaanna chahte ho?', askButton: 'Ask Tota Parrot',
    resetButton: 'Reset', askAgain: 'Phir poochho',
    fillBoth: 'Pehle dono fields bharo.', quiet: 'Raju aaj chup hain. Dobara poochho.',
    freeLeft: (n: number) => `${FREE_QUESTION_ALLOWANCE} mein se ${n} free sawaal baaki`,
    paywallTitle: 'Tota rest kar raha hai',
    paywallBody: `Tota parrot ne tumhare ${FREE_QUESTION_ALLOWANCE} free sawaalon ke jawab de diye.`,
    paywallPrice: `Har agla sawaal: \u20B9${PRICE_PER_QUESTION_INR}.`,
    paywallButton: `\u20B9${PRICE_PER_QUESTION_INR} do - coming soon`,
    paywallNote: 'Payments abhi connect nahi hain, isliye yeh button kuch nahi karta.',
  },
} as const;

function MagicSection({ lang }: { lang: Lang }) {
  const m = MAGIC_UI[lang];
  const [trick, setTrick] = useState(emptyTrick()), [question, setQuestion] = useState(''), [result, setResult] = useState(''), [error, setError] = useState('');
  const [ledger, setLedger] = useState<Ledger>(loadLedger);
  useEffect(() => { const refresh = () => setLedger(current => current.day !== today() ? { count: 0, day: today() } : current); const timer = window.setInterval(refresh, 1000); window.addEventListener('focus', refresh); return () => { clearInterval(timer); window.removeEventListener('focus', refresh); }; }, []);
  const freeLeft = Math.max(0, FREE_QUESTION_ALLOWANCE - ledger.count);
  const paywalled = !result && freeLeft === 0 && paidCredits === 0;
  const reset = () => { setTrick(emptyTrick()); setQuestion(''); setResult(''); setError(''); };
  const ask = () => { if (paywalled) return; if (!visible(trick).trim() || !question.trim()) { setError(m.fillBoth); return; } setError(''); setResult(answer(trick) || m.quiet); setTrick(emptyTrick()); const next = { count: ledger.count + 1, day: today() }; setLedger(next); saveLedger(next); };
  const enter = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); ask(); } };
  return <section id="magic" className="section">
    {paywalled ? <div className="paywall"><h2>{m.paywallTitle}</h2><p>{m.paywallBody}</p><p>{m.paywallPrice}</p><div className="actions"><button className="file-button" disabled>{m.paywallButton}</button></div><p className="caption">{m.paywallNote}</p></div> : <>
      <h2>{m.heading} <span className="badge">{m.partyBadge}</span></h2>
      {!result ? <form onSubmit={e => { e.preventDefault(); ask(); }}>
        <label className="field-label" htmlFor="petition">{m.callLabel}</label><input id="petition" aria-label={m.callLabel} value={visible(trick)} onChange={e => setTrick(edit(trick, e.target.value))} placeholder="Raju, please answer my question." autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} maxLength={400} onKeyDown={enter} />
        <label className="field-label" htmlFor="question">{m.questionLabel}</label><input id="question" aria-label={m.questionLabel} value={question} onChange={e => setQuestion(e.target.value)} placeholder={m.questionPlaceholder} maxLength={300} enterKeyHint="go" onKeyDown={enter} />
        {error && <p className="error" role="alert">{error}</p>}<div className="actions"><button type="submit" className="file-button">{m.askButton}</button><button type="button" data-variant="ghost" onClick={reset}>{m.resetButton}</button></div>
        <p className="caption free-left">{m.freeLeft(freeLeft)}</p>
      </form> : <div className="reveal"><p className="caption">{question}</p><div className="answer-stage"><Sparkles /><p className="answer" role="status" aria-live="polite">{result}</p></div><button className="file-button" onClick={reset}>{m.askAgain}</button></div>}
    </>}
  </section>;
}

function PhotoSection({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const [mode, setMode] = useState<Mode>('solo');
  const [photoURL, setPhotoURL] = useState('');
  const [phase, setPhase] = useState<'pick' | 'ready' | 'analyzing' | 'result'>('pick');
  const [fortune, setFortune] = useState<string[]>([]);
  const [tripDest, setTripDest] = useState<Destination | null>(null);
  const [tripImg, setTripImg] = useState<string | null>(null);
  const [tripBusy, setTripBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => () => { if (photoURL) URL.revokeObjectURL(photoURL); }, [photoURL]);
  useEffect(() => { loadModels(); }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (photoURL) URL.revokeObjectURL(photoURL);
    setPhotoURL(URL.createObjectURL(file));
    setFortune([]);
    setTripDest(null);
    setTripImg(null);
    setTripBusy(false);
    setPhase('ready');
  };

  const reveal = async () => {
    if (!imgRef.current) return;
    setPhase('analyzing');
    const img = imgRef.current;
    const sig: PhotoSignals | null = await analyzePhoto(img);
    setFortune(composeFortune(mode, lang, sig));
    setPhase('result');
    if (mode === 'couple') {
      const dest = pickDestination(sig);
      setTripDest(dest);
      setTripImg(null);
      setTripBusy(true);
      compositeTrip(img, dest.file)
        .then(url => setTripImg(url))
        .catch(err => { console.warn('[raju] trip composite failed:', err); setTripImg(null); setTripDest(null); })
        .finally(() => setTripBusy(false));
    } else {
      setTripDest(null);
      setTripImg(null);
    }
  };

  const modes: { key: Mode; label: string }[] = [
    { key: 'solo', label: t.modeSolo },
    { key: 'friends', label: t.modeFriends },
    { key: 'couple', label: t.modeCouple },
  ];

  return <section id="photo" className="section">
    <h2>{t.photoTitle}</h2>
    <p className="section-sub">{t.photoSub}</p>
    <div className="mode-row" role="group" aria-label="Photo mode">
      {modes.map(m => <button key={m.key} type="button" className={mode === m.key ? 'chip chip-active' : 'chip'} onClick={() => setMode(m.key)}>{m.label}</button>)}
    </div>
    {phase === 'pick' && <label className="dropzone">
      <input type="file" accept="image/*" onChange={onFile} className="visually-hidden" />
      <span className="dropzone-icon" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
      <span>{t.pickPhoto}</span>
    </label>}
    {phase !== 'pick' && photoURL && <div className="photo-stage">
      <img ref={imgRef} src={photoURL} alt="Your upload" className="photo-preview" crossOrigin="anonymous" />
    </div>}
    {phase === 'ready' && <div className="actions">
      <button className="file-button" onClick={reveal}>{t.analyze}</button>
      <label className="button-as-label" data-variant="ghost">{t.changePhoto}<input type="file" accept="image/*" onChange={onFile} className="visually-hidden" /></label>
    </div>}
    {phase === 'analyzing' && <p className="caption analyzing-line" role="status">{t.analyzing}</p>}
    {phase === 'result' && <div className="reveal">
      <div className="answer-stage"><Sparkles />
        <div className="fortune-lines" role="status" aria-live="polite">
          {fortune.map((line, i) => <p key={i} className={i === 0 ? 'fortune-line fortune-signal' : 'fortune-line'}>{line}</p>)}
        </div>
      </div>
      <div className="actions">
        <button className="file-button" onClick={reveal}>{t.again}</button>
        <label className="button-as-label" data-variant="ghost">{t.changePhoto}<input type="file" accept="image/*" onChange={onFile} className="visually-hidden" /></label>
      </div>
      {mode === 'couple' && (tripBusy || tripDest) && <div className="trip-stage">
        <h3 className="trip-title">{t.tripTitle}</h3>
        {tripBusy && <p className="caption analyzing-line" role="status">{t.tripWorking}</p>}
        {tripImg && tripDest && <>
          <img src={tripImg} alt={lang === 'hi' ? tripDest.nameHi : tripDest.nameEn} className="trip-photo" />
          <p className="fortune-line trip-caption">{lang === 'hi' ? tripDest.captionHi : tripDest.captionEn}</p>
          <div className="actions">
            <a className="file-button link-button" href={tripImg} download="raju-trip.png">{t.downloadTrip}</a>
          </div>
          <p className="caption trip-note">{t.tripNote}</p>
        </>}
      </div>}
    </div>}
    <p className="caption honesty"><strong>{t.photoNoteTitle}</strong> {t.photoNote}</p>
  </section>;
}

function RajuSection({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const posts = lang === 'hi' ? [
    { handle: '@raju.teller', text: 'Aaj ka gyaan: tum log sochte ho Tota cute hai. Sahi sochte ho. Main bhi cute hoon. Dono cute hain. Tum bhi cute ho. Sab cute. Good night.' },
    { handle: '@raju.teller', text: 'Kisi ne poocha Raju aapka secret kya hai? Maine kaha: subah utho, logon ki tareef karo, Tota ko khana do. Life sorted.' },
    { handle: '@raju.teller', text: 'Motivation Monday: Tum woh ho jo WiFi ke liye coffee shop hai - jahan aate ho, wahan log judte hain.' },
  ] : [
    { handle: '@raju.teller', text: 'Today\'s wisdom: you all think Tota is cute. Correct. I am also cute. We are both cute. You are cute too. Everyone cute. Good night.' },
    { handle: '@raju.teller', text: 'Someone asked: Raju, what is your secret? I said: wake up, compliment people, feed Tota. Life sorted.' },
    { handle: '@raju.teller', text: 'Motivation Monday: You are what a coffee shop is to WiFi - wherever you go, people connect.' },
  ];
  return <section id="raju" className="section">
    <h2>{t.rajuTitle}</h2>
    <p className="section-sub">{t.rajuSub}</p>
    <div className="posts">
      {posts.map((p, i) => <article key={i} className="post-card">
        <header className="post-head"><img src={mascot} alt="" className="post-avatar" /><span className="post-handle">{p.handle}</span></header>
        <p className="post-text">{p.text}</p>
      </article>)}
    </div>
  </section>;
}

function StoreSection({ lang }: { lang: Lang }) {
  const t = UI[lang];
  return <section id="store" className="section">
    <h2>{t.storeTitle} <span className="badge">{t.storeBadge}</span></h2>
    <p className="section-sub">{t.storeSub}</p>
  </section>;
}

export function App() {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const t = UI[lang];
  return <div className="night">
    <nav className="nav">
      <span className="nav-logo">RAJU TELLER</span>
      <div className="nav-links">
        <a href="#photo">{t.navPhoto}</a>
        <a href="#magic">{t.navMagic}</a>
        <a href="#raju">{t.navRaju}</a>
        <a href="#store">{t.navStore}</a>
      </div>
      <div className="lang-toggle" role="group" aria-label="Language">
        <button type="button" className={lang === 'en' ? 'chip chip-active' : 'chip'} onClick={() => setLang('en')}>EN</button>
        <button type="button" className={lang === 'hi' ? 'chip chip-active' : 'chip'} onClick={() => setLang('hi')}>हिंग्लिश</button>
      </div>
    </nav>
    <header className="hero">
      <div className="raju-head"><div className="halo" /><img className="mascot" src={mascot} alt="Raju with Tota, his fortune-telling parrot, on his shoulder" /></div>
      <h1>RAJU TELLER</h1>
      <p className="hero-tag">{t.heroTag}</p>
      <p className="hero-sub">{t.heroSub}</p>
      <div className="actions hero-actions">
        <a className="file-button link-button" href="#photo">{t.heroCta}</a>
        <a className="link-button ghost-link" href="#magic">{t.heroCta2}</a>
      </div>
    </header>
    <main className="app-card">
      <PhotoSection lang={lang} />
      <MagicSection lang={lang} />
      <RajuSection lang={lang} />
      <StoreSection lang={lang} />
    </main>
    <footer className="footer">
      <p className="caption">{t.footerTrick}</p>
      <p className="caption">{t.footerPhoto}</p>
      <p className="caption">{t.footerMade}</p>
    </footer>
  </div>;
}
