import React, { useState } from 'react';
import { answer, edit, emptyTrick, visible } from './trick';
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
const today = () => new Date().toISOString().slice(0, 10);
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

export function App() {
 const [trick,setTrick]=useState(emptyTrick()),[question,setQuestion]=useState(''),[result,setResult]=useState(''),[error,setError]=useState('');
 const [ledger,setLedger]=useState<Ledger>(loadLedger);
 const freeLeft=Math.max(0,FREE_QUESTION_ALLOWANCE-ledger.count);
 const paywalled=!result&&freeLeft===0&&paidCredits===0;
 const reset=()=>{setTrick(emptyTrick());setQuestion('');setResult('');setError('');};
 const ask=()=>{if(paywalled)return;if(!visible(trick).trim()||!question.trim()){setError('Fill in both fields first.');return;}setError('');setResult(answer(trick)||'Raju is quiet today. Ask again.');setTrick(emptyTrick());const next={count:ledger.count+1,day:today()};setLedger(next);saveLedger(next);};
 const enter=(e:React.KeyboardEvent<HTMLInputElement>)=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();ask();}};
 return <div className="night"><main className="app-card"><div className="raju-head"><div className="halo"/><img className="mascot" src={mascot} alt="Raju with Tota, his fortune-telling parrot, on his shoulder"/></div><h1>RAJU TELLER</h1>
 <section>{paywalled?<div className="paywall"><h2>Tota is resting</h2><p>Tota the parrot has answered your {FREE_QUESTION_ALLOWANCE} free questions.</p><p>Every further question: &#8377;{PRICE_PER_QUESTION_INR}.</p><div className="actions"><button className="file-button" disabled>Pay &#8377;{PRICE_PER_QUESTION_INR} - coming soon</button></div><p className="caption">Payments are not connected yet, so this button does nothing.</p></div>:<>
 <h2>Ask Raju</h2>
 {!result?<form onSubmit={e=>{e.preventDefault();ask();}}>
 <label className="field-label" htmlFor="petition">Call on Raju</label><input id="petition" aria-label="Call on Raju" value={visible(trick)} onChange={e=>setTrick(edit(trick,e.target.value))} placeholder="Raju, please answer my question." autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} maxLength={400} onKeyDown={enter}/>
 <label className="field-label" htmlFor="question">Your question</label><input id="question" aria-label="Your question" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="What would you like to know?" maxLength={300} enterKeyHint="go" onKeyDown={enter}/>
 {error&&<p className="error" role="alert">{error}</p>}<div className="actions"><button className="file-button" onClick={ask}>Ask Tota Parrot</button><button data-variant="ghost" onClick={reset}>Reset</button></div>
 <p className="caption free-left">{freeLeft} of {FREE_QUESTION_ALLOWANCE} free questions left</p>
 </form>:<div className="reveal"><p className="caption">{question}</p><div className="answer-stage"><div className="sparkles" aria-hidden="true">{Array.from({length:18},(_,i)=><span key={i} style={{'--angle':`${i*20}deg`,'--delay':`${(i%4)*.06}s`,'--distance':`${65+(i%3)*24}px`} as React.CSSProperties}>✦</span>)}</div><p className="answer" role="status" aria-live="polite">{result}</p></div><button className="file-button" onClick={reset}>Ask again</button></div>}
 </>}</section></main></div>;
}
