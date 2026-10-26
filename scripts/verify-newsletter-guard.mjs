import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
const calls={verify:0,send:0,headers:0};
globalThis.newsletterGuardProbe=calls;
const stubNewsletter=`export async function requestNewsletterConfirmation(){globalThis.newsletterGuardProbe.send++} export async function confirmNewsletterSubscription(){throw new Error('not used')}`;
const stubHeaders=`export async function headers(){globalThis.newsletterGuardProbe.headers++;return new Headers({'x-vercel-forwarded-for':'test-address'})}`;
registerHooks({resolve(specifier,context,next){
 if(specifier==='server-only')return {url:'data:text/javascript,export{}',shortCircuit:true};
 if(specifier==='@/lib/newsletter')return {url:'data:text/javascript,'+encodeURIComponent(stubNewsletter),shortCircuit:true};
 if(specifier==='next/navigation')return {url:'data:text/javascript,export function redirect(){throw new Error("unexpected redirect")}',shortCircuit:true};
 if(specifier==='next/headers')return {url:'data:text/javascript,'+encodeURIComponent(stubHeaders),shortCircuit:true};
 if(specifier.startsWith('@/'))return next(new URL(`../src/${specifier.slice(2)}.ts`,import.meta.url).href,context);
 try{return next(specifier,context)}catch(error){if(specifier.startsWith('.')&&!/\.[a-z]+$/.test(specifier))return next(`${specifier}.ts`,context);throw error;}
}});
Object.assign(process.env,{NODE_ENV:'production',NEXT_PUBLIC_TURNSTILE_SITE_KEY:'production-shaped-sitekey',TURNSTILE_SECRET_KEY:'probe-secret'});
let payload={success:true,hostname:'www.eloviz.hu',action:'newsletter_signup'};
let failNetwork=false;
globalThis.fetch=async(url,options)=>{
 assert.equal(url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');calls.verify++;
 assert.equal(new URLSearchParams(options.body).get('secret'),'probe-secret');
 if(failNetwork)throw new Error('offline');
 return Response.json(payload);
};
const {subscribeToNewsletterAction}=await import('../src/app/(site)/newsletter-actions.ts');
const state={status:'idle',message:''};
function form(token){const data=new FormData();data.set('email','guard@example.invalid');data.set('consent','on');if(token!==undefined)data.set('cf-turnstile-response',token);return data;}
const noToken=await subscribeToNewsletterAction(state,form());assert.equal(noToken.status,'error');assert.equal(calls.send,0);assert.equal(calls.verify,0);
for(const invalid of [{success:false,'error-codes':['timeout-or-duplicate']},{...payload,hostname:'attacker.invalid'},{...payload,action:'login'}]){
 payload=invalid;assert.equal((await subscribeToNewsletterAction(state,form('bad-token'))).status,'error');assert.equal(calls.send,0);assert.equal(calls.headers,0);
}
failNetwork=true;assert.equal((await subscribeToNewsletterAction(state,form('offline-token'))).status,'error');assert.equal(calls.send,0);failNetwork=false;
payload={success:true,hostname:'www.eloviz.hu',action:'newsletter_signup'};
const invalidEmail=form('unused-token');invalidEmail.set('email','bad');const verifyBefore=calls.verify;assert.equal((await subscribeToNewsletterAction(state,invalidEmail)).status,'error');assert.equal(calls.verify,verifyBefore);
const honeypot=form('unused-token');honeypot.set('website','bot');assert.equal((await subscribeToNewsletterAction(state,honeypot)).status,'success');assert.equal(calls.verify,verifyBefore);assert.equal(calls.send,0);
assert.equal((await subscribeToNewsletterAction(state,form('verified-token'))).status,'success');assert.equal(calls.send,1);assert.equal(calls.headers,1);
payload={success:false,'error-codes':['timeout-or-duplicate']};assert.equal((await subscribeToNewsletterAction(state,form('verified-token'))).status,'error');assert.equal(calls.send,1);
delete process.env.TURNSTILE_SECRET_KEY;const before=calls.verify;assert.equal((await subscribeToNewsletterAction(state,form('token'))).status,'error');assert.equal(calls.verify,before);assert.equal(calls.send,1);
console.log('PASS real signup action: missing/expired/replayed/wrong-host/wrong-action/outage/missing-config rejected before subscriber persistence/email; consent/validation/honeypot retained; verified token alone reaches stubbed confirmation service. No DB or Resend requests made.');
