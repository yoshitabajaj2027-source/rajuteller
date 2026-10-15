import React, { useState } from 'react';
import { answer, edit, emptyTrick, visible } from './trick';
import mascot from './mascot.png';
import './style.css';
export function App() {
 const [trick,setTrick]=useState(emptyTrick),[question,setQuestion]=useState(''),[result,setResult]=useState(''),[error,setError]=useState('');
 const reset=()=>{setTrick(emptyTrick());setQuestion('');setResult('');setError('');};
 const ask=()=>{if(!visible(trick).trim()||!question.trim()){setError('Fill in both fields first.');return;}setError('');setResult(answer(trick)||'Raju is quiet today. Ask again.');setTrick(emptyTrick());};
 const enter=(e:React.KeyboardEvent<HTMLInputElement>)=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();ask();}};
 return <div className="night"><main className="app-card"><div className="raju-head"><div className="halo"/><img className="mascot" src={mascot} alt="Raju with a parrot on his shoulder"/></div><h1>RAJU TELLER</h1>
 <section><h2>Ask Raju</h2>
 {!result?<form onSubmit={e=>{e.preventDefault();ask();}}>
 <label className="field-label" htmlFor="petition">Call on Raju</label><input id="petition" aria-label="Call on Raju" value={visible(trick)} onChange={e=>setTrick(edit(trick,e.target.value))} placeholder="Raju, please answer my question." autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} maxLength={400} onKeyDown={enter}/>
 <label className="field-label" htmlFor="question">Your question</label><input id="question" aria-label="Your question" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="What would you like to know?" maxLength={300} enterKeyHint="go" onKeyDown={enter}/>
 {error&&<p className="error" role="alert">{error}</p>}<div className="actions"><button className="file-button" onClick={ask}>Tell me, Raju</button><button data-variant="ghost" onClick={reset}>Reset</button></div>
 </form>:<div className="reveal"><p className="caption">{question}</p><div className="answer-stage"><div className="sparkles" aria-hidden="true">{Array.from({length:18},(_,i)=><span key={i} style={{'--angle':`${i*20}deg`,'--delay':`${(i%4)*.06}s`,'--distance':`${65+(i%3)*24}px`} as React.CSSProperties}>✦</span>)}</div><p className="answer" role="status" aria-live="polite">{result}</p></div><button className="file-button" onClick={reset}>Ask again</button></div>}
 </section></main></div>;
}
