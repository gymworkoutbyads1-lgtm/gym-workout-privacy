import {parseAction,validatePassword,friendlyError,createResetClient} from './reset-client.mjs';
import {apiKey,actionLinkKeys} from './reset-config.mjs';
const $ = id => document.getElementById(id);
const action = parseAction(location.href,apiKey,actionLinkKeys);
// Keep action codes out of subsequent navigation, referrers, and screenshots.
history.replaceState(null,'',location.pathname);
const client = createResetClient(apiKey);
let ready=false, busy=false, code=action.code;
function message(title,text){$('heading').textContent=title;$('description').textContent=text;}
function terminal(title,text){ready=false;code=null;$('reset-form').reset();$('reset-form').hidden=true;$('retry').hidden=true;message(title,text);$('heading').focus();}
async function verify(){
  if(busy)return;busy=true;$('retry').hidden=true;message('Checking your link…','Just a moment while we check your password-reset link.');
  try{await client.verify(code);ready=true;message('Reset your password','Choose a new password to get back to your training.');$('reset-form').hidden=false;}
  catch(e){const info=friendlyError(e.message);if(info.terminal)terminal(info.title,info.message);else{message('Let’s try that again',info.message);$('retry').hidden=false;}}
  finally{busy=false;}
}
$('retry').addEventListener('click',verify);
document.querySelectorAll('.reveal').forEach(button=>button.addEventListener('click',()=>{const field=$(button.dataset.for);const show=field.type==='password';field.type=show?'text':'password';button.textContent=show?'Hide':'Show';button.setAttribute('aria-pressed',String(show));button.setAttribute('aria-label',`${show?'Hide':'Show'} ${button.dataset.for==='new-password'?'new':'confirmation'} password`);}));
$('reset-form').addEventListener('submit',async event=>{
  event.preventDefault();if(!ready||busy)return;
  const problem=validatePassword($('new-password').value,$('confirm-password').value);$('form-error').textContent=problem;
  if(problem){$(problem.includes('match')?'confirm-password':'new-password').focus();return;}
  busy=true;$('submit').disabled=true;$('submit').textContent='Saving securely…';
  try{await client.confirm(code,$('new-password').value);terminal('You’re all set.','Your password has been updated. Your next session is waiting.');$('next-steps').hidden=false;}
  catch(e){const info=friendlyError(e.message);if(info.terminal)terminal(info.title,info.message);else $('form-error').textContent=info.message;}
  finally{busy=false;$('submit').disabled=false;$('submit').textContent='Save new password →';}
});
if(action.kind==='fallback')location.replace(action.url);
else if(action.kind==='reset')verify();
else terminal('Let’s get you back in.','To reset your password, open Gym & Workout by ADS, select Forgot password, and follow the link in your latest reset email.');

