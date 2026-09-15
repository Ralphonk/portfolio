import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

// Execute the actual TypeScript helpers and handler with only the email provider mocked.
const compile = source => ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const asModule = source => 'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const helperURL=asModule(compile(await fs.readFile(new URL('../lib/contact.ts',import.meta.url),'utf8')));
const helpers=await import(helperURL);
const routeSource=(await fs.readFile(new URL('../app/api/contact/route.ts',import.meta.url),'utf8')).replace("'@/lib/contact'",JSON.stringify(helperURL));
const route=await import(asModule(compile(routeSource)));
const origin='https://portfolio.test';
const sample={name:'Test Visitor',email:'visitor@example.com',topic:'A collaboration',message:'I would like to discuss a new web application.'};
const request=(data,headers={})=>new Request(origin+'/api/contact',{method:'POST',headers:{origin,'Content-Type':'application/json',...headers},body:JSON.stringify(data)});

test('validation and encoded email draft preserve the visitor’s message',()=>{
  const result=helpers.validateContact({...sample,message:'Hello & welcome! This is a longer project brief.\nSecond line.'});
  assert.ok(result.data);
  const draft=helpers.emailDraft(result.data);
  assert.equal(new URL(draft.href).searchParams.get('body'),draft.body);
  assert.match(draft.href,/mailto:umeshjoshi.dev@gmail.com/);
  for(const input of [null,{}, {...sample,name:' '},{...sample,email:'bad@'},{...sample,email:'a@b.com\r\nbcc:other@b.com'},{...sample,topic:'injected'},{...sample,message:'short'},{...sample,message:'x'.repeat(3001)}])assert.ok(helpers.validateContact(input).error);
});

test('contact endpoint rejects invalid requests and never sends while unconfigured',async()=>{
  delete process.env.RESEND_API_KEY;delete process.env.CONTACT_FROM_EMAIL;process.env.CONTACT_ALLOWED_ORIGIN=origin;
  assert.deepEqual(await(await route.GET()).json(),{mode:'draft'});
  assert.equal((await route.POST(request(sample,{origin:'https://other.test'}))).status,403);
  assert.equal((await route.POST(request(sample,{'Content-Type':'text/plain'}))).status,415);
  assert.equal((await route.POST(request(sample,{'Content-Length':'19000'}))).status,413);
  assert.equal((await route.POST(request({...sample,message:'x'.repeat(19000)}))).status,413);
  assert.equal((await route.POST(request({...sample,message:'tiny'}))).status,400);
  assert.equal((await route.POST(request({...sample,website:'spam'}))).status,400);
  assert.equal((await route.POST(request(sample))).status,503);
});

test('configured delivery uses the fixed recipient, reports provider errors, and limits repeat sends',async()=>{
  process.env.RESEND_API_KEY='test-key-not-real';process.env.CONTACT_FROM_EMAIL='Test <onboarding@resend.dev>';process.env.CONTACT_ALLOWED_ORIGIN=origin;
  const originalFetch=globalThis.fetch;let calls=0;
  globalThis.fetch=async(url,options)=>{
    calls++;assert.equal(url,'https://api.resend.com/emails');
    const payload=JSON.parse(options.body);assert.deepEqual(payload.to,['umeshjoshi.dev@gmail.com']);assert.equal(payload.reply_to,sample.email);assert.equal(payload.text.includes(sample.message),true);
    return Response.json({id:'mock-email-id'});
  };
  try{
    assert.deepEqual(await(await route.GET()).json(),{mode:'direct'});
    const good=await route.POST(request(sample));assert.equal(good.status,200);assert.deepEqual(await good.json(),{ok:true});
    globalThis.fetch=async()=>Response.json({error:'private provider details'},{status:403});
    const bad=await route.POST(request(sample));assert.equal(bad.status,502);assert.equal((await bad.text()).includes('private provider details'),false);
    globalThis.fetch=async()=>{throw new Error('network unavailable');};
    assert.equal((await route.POST(request(sample))).status,502);
    assert.equal((await route.POST(request(sample))).status,429);
    assert.equal(calls,1);
  }finally{globalThis.fetch=originalFetch;}
});
