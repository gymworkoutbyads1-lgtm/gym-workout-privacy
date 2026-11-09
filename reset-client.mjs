export function parseAction(url, expectedKey, acceptedLinkKeys = [expectedKey]) {
  const p = new URL(url).searchParams;
  const mode = p.get('mode');
  const code = p.get('oobCode');
  if (p.getAll('mode').length !== 1 || p.getAll('oobCode').length !== 1 || !code || code.length > 2048 || /\s/.test(code)) return {kind:'invalid'};
  if (p.getAll('apiKey').length > 1 || (p.has('apiKey') && !acceptedLinkKeys.includes(p.get('apiKey')))) return {kind:'invalid'};
  if (mode === 'resetPassword') return {kind:'reset', code};
  // Firebase shares action-handler configuration across email templates.
  // Keep verification and recovery on its existing, trusted hosted handler.
  if (['verifyEmail','recoverEmail','verifyAndChangeEmail','revertSecondFactorAddition'].includes(mode)) {
    const safe = new URL('https://ads-evora-fitness.firebaseapp.com/__/auth/action');
    safe.searchParams.set('mode',mode); safe.searchParams.set('oobCode',code); safe.searchParams.set('apiKey',expectedKey); safe.searchParams.set('lang','en');
    return {kind:'fallback',url:safe.href};
  }
  return {kind:'invalid'};
}
export function validatePassword(password, confirmation) {
  if(password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) return 'Use at least 8 characters, an uppercase letter, a number and a symbol.';
  if(password.length > 4096) return 'Please use a shorter password.';
  if(password !== confirmation) return 'Your passwords do not match. Please enter the same password in both fields.';
  return '';
}
export function friendlyError(code) {
  if (/EXPIRED_OOB_CODE|INVALID_OOB_CODE/.test(code)) return {terminal:true,title:'This link has expired',message:'For your security, reset links can only be used once. Open the app, select Forgot password, and request a new link.'};
  if (/USER_DISABLED|EMAIL_NOT_FOUND|USER_NOT_FOUND/.test(code)) return {terminal:true,title:'We couldn’t reset this account',message:'Please contact support for help accessing your account.'};
  if (/WEAK_PASSWORD|PASSWORD_DOES_NOT_MEET_REQUIREMENTS/.test(code)) return {terminal:false,message:'Please choose a stronger password that meets the requirements below.'};
  if (/TOO_MANY_ATTEMPTS|TOO_MANY_REQUESTS|QUOTA_EXCEEDED/.test(code)) return {terminal:false,message:'Too many attempts. Please wait a few minutes and try again.'};
  return {terminal:false,message:'We couldn’t connect securely. Check your connection and try again. If this continues, contact support.'};
}
export function createResetClient(apiKey, fetcher = fetch, endpoint = 'https://identitytoolkit.googleapis.com/v1') {
  async function request(payload) {
    let response;
    try { response = await fetcher(`${endpoint}/accounts:resetPassword?key=${encodeURIComponent(apiKey)}`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit',cache:'no-store',referrerPolicy:'strict-origin',signal:AbortSignal.timeout(20000)}); }
    catch { throw new Error('NETWORK_ERROR'); }
    let result; try { result = await response.json(); } catch { throw new Error('INVALID_RESPONSE'); }
    if(!response.ok) throw new Error(result.error?.message || 'REQUEST_FAILED');
    if(result.requestType !== 'PASSWORD_RESET' || typeof result.email !== 'string') throw new Error('INVALID_RESPONSE');
    return result;
  }
  return {verify:code=>request({oobCode:code}),confirm:(code,password)=>request({oobCode:code,newPassword:password})};
}

