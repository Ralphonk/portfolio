import { CONTACT_EMAIL, validateContact } from '@/lib/contact';

export const runtime = 'nodejs';
const attempts = new Map<string,{count:number;until:number}>();
function configured() { return !!(process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL && process.env.CONTACT_ALLOWED_ORIGIN); }
export async function GET() { return Response.json({mode:configured()?'direct':'draft'},{headers:{'Cache-Control':'no-store'}}); }

export async function POST(request:Request) {
  const origin=request.headers.get('origin');
  const allowed=process.env.CONTACT_ALLOWED_ORIGIN || new URL(request.url).origin;
  if(!origin||origin!==allowed)return Response.json({error:'This request is not allowed.'},{status:403});
  if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'Expected a JSON submission.'},{status:415});
  if(Number(request.headers.get('content-length')||0)>18000)return Response.json({error:'The message is too large.'},{status:413});
  let input:unknown;
  try {
    const reader=request.body?.getReader(); if(!reader)return Response.json({error:'Missing form data.'},{status:400});
    const chunks:Uint8Array[]=[];let length=0;
    while(true){const chunk=await reader.read();if(chunk.done)break;length+=chunk.value.byteLength;if(length>18000){await reader.cancel();return Response.json({error:'The message is too large.'},{status:413});}chunks.push(chunk.value);}
    const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    input=JSON.parse(new TextDecoder().decode(bytes));
  }catch{return Response.json({error:'Invalid form data.'},{status:400});}
  const result=validateContact(input);
  if(!result.data)return Response.json({error:result.error},{status:400});
  if(result.data.website)return Response.json({error:'Invalid submission.'},{status:400});
  if(!configured())return Response.json({error:'Direct delivery is not connected yet. Please use the email draft.'},{status:503});
  // Bounded per-process guard; configure a shared edge rate limit before high-traffic use.
  const now=Date.now();for(const [key,value] of attempts)if(value.until<now)attempts.delete(key);
  if(attempts.size>2000)return Response.json({error:'Please try again later or use the email draft.'},{status:429});
  const email=result.data.email.toLowerCase();const attempt=attempts.get(email)||{count:0,until:now+600000};
  if(attempt.count>=3)return Response.json({error:'Please wait a few minutes before sending again.'},{status:429});
  attempt.count++;attempts.set(email,attempt);
  try{
    const {name,topic,message}=result.data;
    const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.CONTACT_FROM_EMAIL,to:[CONTACT_EMAIL],reply_to:email,subject:`Portfolio enquiry: ${topic}`,text:`From: ${name}\nReply to: ${email}\n\n${message}`}),signal:AbortSignal.timeout(10000)});
    const data=await res.json();
    if(!res.ok||!data.id)return Response.json({error:'Delivery could not be confirmed. Please use the email draft.'},{status:502});
    return Response.json({ok:true});
  }catch{return Response.json({error:'Delivery could not be confirmed. Please use the email draft.'},{status:502});}
}
