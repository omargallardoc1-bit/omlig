(()=>{
  'use strict';
  const STORAGE_KEY='omlig:referral-attribution';
  const REF_PATTERN=/^[0-9a-f]{20}$/i;
  const TTL_MS=30*24*60*60*1000;

  const readStored=()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!saved?.ref||!REF_PATTERN.test(saved.ref)||Number(saved.expiresAt)<=Date.now()){
        localStorage.removeItem(STORAGE_KEY);
        return '';
      }
      return String(saved.ref).toLowerCase();
    }catch{return ''}
  };

  const incoming=String(new URLSearchParams(location.search).get('ref')||'').trim().toLowerCase();
  let ref=REF_PATTERN.test(incoming)?incoming:readStored();
  if(REF_PATTERN.test(incoming)){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({ref:incoming,firstSeenAt:new Date().toISOString(),expiresAt:Date.now()+TTL_MS}))}catch{}
    ref=incoming;
  }
  if(!ref)return;

  document.documentElement.dataset.referralCode=ref;

  document.querySelectorAll('a[href^="mailto:contacto@omlig.com"]').forEach(link=>{
    try{
      const raw=link.getAttribute('href')||'';
      const [base,query='']=raw.split('?');
      const params=new URLSearchParams(query);
      const existingBody=params.get('body')||'';
      const marker=`Referencia MX Business Card: ${ref}`;
      params.set('body',existingBody?`${existingBody}\n\n${marker}`:marker);
      link.setAttribute('href',`${base}?${params.toString()}`);
    }catch{}
  });
})();
