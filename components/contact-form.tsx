'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Check, Copy, Loader2, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT_EMAIL, emailDraft, enquiryTypes, validateContact } from '@/lib/contact';

export default function ContactForm() {
  const [mode,setMode]=useState<'draft'|'direct'>('draft');
  const [busy,setBusy]=useState(false), [error,setError]=useState(''),[success,setSuccess]=useState(false),[copied,setCopied]=useState(false);
  const [draft,setDraft]=useState<ReturnType<typeof emailDraft>|null>(null);
  const [count,setCount]=useState(0);const reduced=useReducedMotion();
  useEffect(()=>{const controller=new AbortController();fetch('/api/contact',{signal:controller.signal}).then(r=>r.ok?r.json():null).then(d=>{if(d?.mode==='direct')setMode('direct');}).catch(()=>{});return()=>controller.abort();},[]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(busy)return;setError('');setSuccess(false);setCopied(false);
    const form=event.currentTarget;const values=Object.fromEntries(new FormData(form));const result=validateContact(values);
    if(!result.data){setError(result.error||'Please check the form.');return;}
    if(result.data.website){setError('Please leave the website field empty.');return;}
    const prepared=emailDraft(result.data);
    if(mode==='draft'){setDraft(prepared);return;}
    setBusy(true);
    try {
      const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(result.data),signal:AbortSignal.timeout(15000)});
      const json=await res.json();
      if(!res.ok){setError(json.error||'The message could not be sent. You can use the email draft instead.');setDraft(prepared);return;}
      setSuccess(true);setDraft(null);form.reset();setCount(0);
    }catch{setError('Sending could not be confirmed. Your message is preserved below as an email draft.');setDraft(prepared);}
    finally{setBusy(false);}
  }
  async function copy() {
    if(!draft)return;
    try{await navigator.clipboard.writeText(`To: ${CONTACT_EMAIL}\nSubject: ${draft.subject}\n\n${draft.body}`);setCopied(true);}
    catch{setError('Clipboard access isn’t available. You can select and copy the draft text below.');}
  }
  return <div className="contact-form-shell">
    <div className="form-heading"><span><Mail size={18}/> A GOOD CONVERSATION STARTS HERE</span><span>01 → ∞</span></div>
    <form onSubmit={submit} onChange={()=>{setDraft(null);setSuccess(false);setError('');setCopied(false);}}>
      <fieldset disabled={busy}>
        <div className="form-row"><label htmlFor="contact-name">Your name<input id="contact-name" name="name" autoComplete="name" placeholder="Alex Morgan" required minLength={2} maxLength={80}/></label><label htmlFor="contact-email">Email address<input id="contact-email" name="email" type="email" autoComplete="email" placeholder="alex@company.com" required maxLength={254}/></label></div>
        <label htmlFor="contact-topic">What brings you here?<select id="contact-topic" name="topic" defaultValue="" required><option value="" disabled>Select an enquiry type</option>{enquiryTypes.map(t=><option key={t}>{t}</option>)}</select></label>
        <label htmlFor="contact-message">Tell me a little about it<textarea id="contact-message" name="message" placeholder="The role, the idea, or the challenge you’re working on…" required minLength={20} maxLength={3000} rows={5} onChange={e=>setCount(e.target.value.length)} aria-describedby="message-hint"/></label>
        <div id="message-hint" className="message-hint"><span>A little context goes a long way.</span><span>{count.toLocaleString()} / 3,000</span></div>
        <div className="contact-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
        <div className="form-submit"><Button type="submit" disabled={busy}>{busy?<><Loader2 className="spin" size={17}/> Sending…</>:mode==='direct'?<>Send message <Send size={17}/></>:<>Create email draft <ArrowUpRight size={18}/></>}</Button><p>{mode==='direct'?'Your details are used only to reply to your enquiry.':'Review the draft, then send it from your email app.'}</p></div>
      </fieldset>
    </form>
    <div aria-live="polite" aria-atomic="true">{error&&<p className="form-error" role="alert">{error}</p>}{success&&<p className="form-success"><Check size={18}/> Thanks for reaching out! Your message is on its way.</p>}</div>
    <AnimatePresence>{draft&&<motion.div className="email-draft" initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
      <h3>Your draft is ready.</h3><p>Nothing has been sent yet. Open your email app to send it to Umesh.</p>
      <div className="draft-actions"><Button asChild><a href={draft.href}>Open email app <Mail size={17}/></a></Button><button type="button" className="copy-draft" onClick={copy}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy draft'}</button></div>
      <details><summary>View message</summary><pre>{draft.body}</pre></details>
    </motion.div>}</AnimatePresence>
  </div>;
}
