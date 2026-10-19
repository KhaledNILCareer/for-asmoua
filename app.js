const $ = id => document.getElementById(id);
const decode = s => Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let payload;
$('toggle').onclick=()=>{const showing=$('password').type==='password';$('password').type=showing?'text':'password';$('toggle').textContent=showing?'إخفاء':'إظهار';$('toggle').setAttribute('aria-label',showing?'إخفاء كلمة السر':'إظهار كلمة السر');};
$('unlock').onsubmit=async event=>{
 event.preventDefault();$('error').textContent='';$('submit').disabled=true;$('submit').textContent='بنفتح رسالتك…';
 try{
  if(!crypto.subtle)throw new Error('unsupported');
  if(!payload){const response=await fetch('payload.json',{cache:'no-store'});if(!response.ok)throw new Error('network');payload=await response.json();}
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode($('password').value),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:decode(payload.salt),iterations:payload.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
  let plain;try{plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(payload.iv)},key,decode(payload.data));}catch{throw new Error('password');}
  const content=JSON.parse(new TextDecoder().decode(plain));
  $('opening').textContent=content.opening;$('signature').textContent=content.signature;
  const paragraph=(text,bold=false)=>{const p=document.createElement('p');if(bold){const strong=document.createElement('strong');strong.textContent=text;p.append(strong);}else p.textContent=text;return p;};
  $('paragraphs').replaceChildren(...content.letter.map((text,i)=>paragraph(text,i===7)));
  $('closing').replaceChildren(...content.closing.map((text,i)=>paragraph(text,i===3)));
  $('gallery').replaceChildren(...content.captions.map((caption,i)=>{
   const row=document.createElement('section');row.className='memory reveal';
   const photo=document.createElement('div');photo.className='photo';const img=document.createElement('img');img.src=content.images[i];img.alt=['شخصان مضيئان يمسكان بأيدي بعضهما','نوران يلتقيان وسط النجوم','شخصان يجلسان معًا وسط غابة زرقاء','شخصان مضيئان بلون دافئ يسيران معًا'][i];img.loading='lazy';photo.append(img);
   const text=document.createElement('div');text.className='caption';const number=document.createElement('span');number.className='caption-number';number.textContent=String(i+1).padStart(2,'0');const title=document.createElement('h3');title.textContent=caption.title;const p=document.createElement('p');p.textContent=caption.text;text.append(number,title,p);row.append(photo,text);return row;
  }));
  $('gate').classList.add('opening');await new Promise(r=>setTimeout(r,matchMedia('(prefers-reduced-motion: reduce)').matches?0:650));
  $('password').value='';$('gate').hidden=true;$('letter').hidden=false;window.scrollTo(0,0);$('letter').setAttribute('tabindex','-1');$('letter').focus({preventScroll:true});
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
 }catch(error){$('error').textContent=error.message==='password'?'لأ مش هي دي يا أسموءه 😂❤️ جرّبي تاني يا شاطرة.':error.message==='unsupported'?'افتحي الصفحة من رابط HTTPS أو localhost.':'الرسالة موصلتش دلوقتي. اتأكدي من الاتصال وجرّبي تاني.';if(error.message==='password')$('password').focus();}
 finally{$('submit').disabled=false;$('submit').textContent='افتحي رسالتك يا سكر ←';}
};
$('lock').onclick=()=>location.reload();$('top').onclick=()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
