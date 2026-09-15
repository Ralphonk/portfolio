export const CONTACT_EMAIL = 'umeshjoshi.dev@gmail.com';
export const enquiryTypes = ['A full-time role', 'A freelance project', 'A collaboration', 'Just saying hello'] as const;
export type ContactFields = { name: string; email: string; topic: string; message: string; website?: string };
export function validateContact(input: unknown): { data?: ContactFields; error?: string } {
  if (!input || typeof input !== 'object') return {error:'Please complete the contact form.'};
  const v=input as Record<string,unknown>;
  if (!['name','email','topic','message'].every(k=>typeof v[k]==='string')) return {error:'Please complete all required fields.'};
  const name=(v.name as string).trim(), email=(v.email as string).trim(), topic=(v.topic as string).trim(), message=(v.message as string).trim();
  if(name.length<2||name.length>80||/[\r\n]/.test(name))return {error:'Please enter a name between 2 and 80 characters.'};
  if(email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))return {error:'Please enter a valid email address.'};
  if(!(enquiryTypes as readonly string[]).includes(topic))return {error:'Please choose an enquiry type.'};
  if(message.length<20||message.length>3000)return {error:'Your message should be between 20 and 3,000 characters.'};
  if(v.website!==undefined&&typeof v.website!=='string')return {error:'Invalid form submission.'};
  return {data:{name,email,topic,message,website:(v.website as string|undefined)||''}};
}
export function emailDraft(data: ContactFields) {
  const subject=`Portfolio enquiry: ${data.topic}`;
  const body=`Hi Umesh,\n\n${data.message}\n\n${data.name}\n${data.email}`;
  return {body,subject,href:`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`};
}
