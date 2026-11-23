/* WayFinder SG shared behaviour: icons, prefs, smooth scroll, cursor tags, tilt, scramble, passport, quick-help sheet. No network calls. */
(function(){
'use strict';
var root=document.documentElement;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var rm=window.matchMedia('(prefers-reduced-motion: reduce)');
var calm=false;try{calm=localStorage.getItem('wfl.calm')==='1'}catch(e){}
var theme='auto';try{theme=localStorage.getItem('wfl.theme')||'auto'}catch(e){}
function still(){return calm||rm.matches}
var hasG=!!(window.gsap&&window.ScrollTrigger);
if(hasG)gsap.registerPlugin(ScrollTrigger);
var themeCbs=[],calmCbs=[];

/* ---------- icon sprite (one stroke style) ---------- */
var P={
 phone:'<rect x="6.5" y="2.5" width="11" height="19"/><path d="M10 18.5h4"/>',
 wallet:'<rect x="3" y="6" width="18" height="14"/><path d="M3 10h18M16 15h2"/>',
 id:'<rect x="3" y="5" width="18" height="14"/><circle cx="9" cy="11" r="2"/><path d="M6 16.5c1-2.4 5-2.4 6 0M14 10h4M14 14h4"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.6 8-8 9-4.4-1-8-4-8-9V6z"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
 door:'<path d="M6 21V3h12v18M3 21h18"/><circle cx="15" cy="12" r=".8"/>',
 bell:'<path d="M6 17v-6a6 6 0 0112 0v6l2 2H4zM10 21h4"/>',
 alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
 mail:'<rect x="3" y="5" width="18" height="14"/><path d="M3 6l9 7 9-7"/>',
 link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M9 9h6M9 15h6M12 6.5v11"/>',
 home:'<path d="M3 11l9-8 9 8v10H3z"/><path d="M10 21v-6h4v6"/>',
 brief:'<rect x="3" y="7" width="18" height="13"/><path d="M9 7V4h6v3M3 13h18"/>',
 doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
 train:'<rect x="5" y="3" width="14" height="15"/><path d="M5 11h14M8 18l-2 3M16 18l2 3"/><circle cx="9" cy="14.5" r=".9"/><circle cx="15" cy="14.5" r=".9"/>',
 chat:'<path d="M4 4h16v12H10l-5 4v-4H4z"/>',
 search:'<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>',
 check:'<path d="M4 12l5 5L20 6"/>',
 x:'<path d="M5 5l14 14M19 5L5 19"/>',
 arrow:'<path d="M4 12h16M14 6l6 6-6 6"/>',
 star:'<path d="M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.2 6.4 20.3l1.2-6.3L3 9.6l6.3-.8z"/>',
 stamp:'<path d="M12 3a4 4 0 012 7.5V13h5a2 2 0 012 2v2H3v-2a2 2 0 012-2h5v-2.5A4 4 0 0112 3zM3 21h18"/>',
 share:'<path d="M12 3v12M7 8l5-5 5 5M5 13v8h14v-8"/>',
 download:'<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
 moon:'<path d="M20 14A8 8 0 1110 4a6 6 0 0010 10z"/>',
 lock:'<rect x="5" y="11" width="14" height="10"/><path d="M8 11V7a4 4 0 018 0v4"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 calc:'<rect x="5" y="3" width="14" height="18"/><path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h2M16 12v4"/>',
 heart:'<path d="M12 20S3 14.5 3 8.5A4.5 4.5 0 0112 6a4.5 4.5 0 019 2.5C21 14.5 12 20 12 20z"/>',
 flag:'<path d="M5 21V4M5 4h13l-3 4 3 4H5"/>',
 tag:'<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1"/>',
 plus:'<path d="M12 4v16M4 12h16"/>',
 back:'<path d="M20 12H4M10 6l-6 6 6 6"/>'
};
function icon(n,cls){return '<svg class="ico'+(cls?' '+cls:'')+'" aria-hidden="true" focusable="false"><use href="#i-'+n+'"/></svg>'}
(function sprite(){
 var h='<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>';
 Object.keys(P).forEach(function(k){h+='<symbol id="i-'+k+'" viewBox="0 0 24 24">'+P[k]+'</symbol>'});
 h+='</defs></svg>';
 document.body.insertAdjacentHTML('afterbegin',h);
 $$('[data-i]').forEach(function(el){el.insertAdjacentHTML('afterbegin',icon(el.getAttribute('data-i')))});
})();

/* ---------- display prefs ---------- */
function applyTheme(){
 if(theme==='auto')root.removeAttribute('data-theme');else root.setAttribute('data-theme',theme);
 $$('[data-theme-set]').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-theme-set')===theme))});
 themeCbs.forEach(function(f){f()});
}
function applyCalm(){
 root.classList.toggle('calm',calm);
 var b=$('#calm');if(b){b.setAttribute('aria-pressed',String(calm));b.textContent='Calm mode: '+(calm?'on':'off')}
 calmCbs.forEach(function(f){f()});
}
$$('[data-theme-set]').forEach(function(b){b.addEventListener('click',function(){theme=b.getAttribute('data-theme-set');try{localStorage.setItem('wfl.theme',theme)}catch(e){}applyTheme()})});
var calmBtn=$('#calm');
if(calmBtn)calmBtn.addEventListener('click',function(){calm=!calm;try{localStorage.setItem('wfl.calm',calm?'1':'0')}catch(e){}if(calm&&W.lenis){W.lenis.destroy();W.lenis=null}if(!calm&&!rm.matches)initLenis();applyCalm()});

/* ---------- smooth scroll ---------- */
function initLenis(){
 if(W.lenis||still()||!window.Lenis)return;
 try{
  var L=new Lenis({lerp:.1,smoothWheel:true});W.lenis=L;
  if(hasG){L.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){if(W.lenis)W.lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0)}
  else{(function raf(t){if(W.lenis){W.lenis.raf(t);requestAnimationFrame(raf)}})(performance.now())}
 }catch(e){W.lenis=null}
}
document.addEventListener('click',function(e){
 var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
 var id=a.getAttribute('href').slice(1);if(!id)return;var t=document.getElementById(id);if(!t)return;
 e.preventDefault();
 if(W.lenis)W.lenis.scrollTo(t,{offset:-70,duration:1.4});else t.scrollIntoView({behavior:still()?'auto':'smooth'});
 if(history.replaceState)try{history.replaceState(null,'','#'+id)}catch(x){}
});
var sk=$('#skip');if(sk)sk.addEventListener('click',function(){var m=$('#main');if(m){m.focus();m.scrollIntoView()}});

/* ---------- scroll line ---------- */
var pSegs=$$('.prog b'),pQ=false;
function progTick(){pQ=false;var h=document.documentElement.scrollHeight-window.innerHeight,p=h>0?window.scrollY/h:0;pSegs.forEach(function(s,i){s.style.transform='scaleX('+Math.max(0,Math.min(1,p*5-i))+')'})}
window.addEventListener('scroll',function(){if(!pQ){pQ=true;requestAnimationFrame(progTick)}},{passive:true});
progTick();

/* ---------- text scramble (split-flap) ---------- */
var CH='ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
function scramble(el,dur){
 var fin=el.getAttribute('data-scr')||el.textContent;if(still()){el.textContent=fin;return}
 el.setAttribute('data-scr',fin);
 var n=fin.length,start=performance.now();
 (function f(now){
  var p=Math.min(1,(now-start)/dur),k=Math.floor(p*n),out='';
  for(var i=0;i<n;i++){var c=fin[i];out+=(i<k||c===' '||/[^A-Za-z0-9]/.test(c))?c:CH[Math.floor(Math.random()*CH.length)]}
  el.textContent=out;if(p<1)requestAnimationFrame(f);else el.textContent=fin;
 })(start);
}

/* ---------- tilt + magnet ---------- */
function bindTilt(el,max){
 el.addEventListener('pointermove',function(e){
  if(still()||e.pointerType==='touch')return;
  var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  el.style.transform='perspective(900px) rotateX('+(-y*max)+'deg) rotateY('+(x*max)+'deg)';
 });
 el.addEventListener('pointerleave',function(){el.style.transition='transform .5s';el.style.transform='';setTimeout(function(){el.style.transition=''},520)});
}
function bindMag(el){
 el.addEventListener('pointermove',function(e){
  if(still()||e.pointerType==='touch')return;
  var r=el.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);
  el.style.transform='translate('+x*.18+'px,'+y*.28+'px)';
 });
 el.addEventListener('pointerleave',function(){el.style.transform=''});
}
function bindAll(scope){
 $$('.tilt',scope).forEach(function(t){if(!t._b){t._b=1;bindTilt(t,t.id==='phone'?7:8)}});
 $$('.mag',scope).forEach(function(t){if(!t._b){t._b=1;bindMag(t)}});
}

/* ---------- cursor label ---------- */
var cur=$('#cur'),cp={x:-200,y:-200,tx:-200,ty:-200};
if(cur){
 document.addEventListener('pointermove',function(e){
  if(e.pointerType!=='mouse')return;cp.tx=e.clientX;cp.ty=e.clientY;
  var t=e.target.closest&&e.target.closest('[data-cursor]');
  if(t&&!still()){cur.textContent=t.getAttribute('data-cursor');cur.classList.add('on')}else cur.classList.remove('on');
 },{passive:true});
 (function tick(){requestAnimationFrame(tick);cp.x+=(cp.tx-cp.x)*.22;cp.y+=(cp.ty-cp.y)*.22;cur.style.transform='translate3d('+(cp.x+16)+'px,'+(cp.y+16)+'px,0)'})();
}

/* ---------- quick help sheet (injected) ---------- */
var SHEET='<dialog id="sheet" aria-labelledby="sheet-h"><div class="sheet-in"><div class="sheet-top"><h2 id="sheet-h">Quick help</h2><button class="btn" type="button" id="sheet-x">Close</button></div>'+
'<p class="mute">Call first. Learn later. This site never dispatches help or listens to calls.</p><div class="nums">'+
'<a class="numc hot2" href="tel:999"><span class="n">999</span><span class="l">Police emergency</span><span class="s">Crime in progress or immediate danger</span></a>'+
'<a class="numc hot2" href="tel:995"><span class="n">995</span><span class="l">Ambulance or fire</span><span class="s">Life-threatening emergencies</span></a>'+
'<a class="numc" href="sms:70999"><span class="n">SMS 70999</span><span class="l">Police by text</span><span class="s">When talking is unsafe, or if you are deaf, mute or have a speech impairment</span></a>'+
'<a class="numc" href="tel:1799"><span class="n">1799</span><span class="l">ScamShield helpline</span><span class="s">Is this a scam? Open 24/7</span></a>'+
'<a class="numc" href="tel:1771"><span class="n">1771</span><span class="l">National mindline</span><span class="s">Someone to talk to. Or WhatsApp 6669-1771</span></a>'+
'<a class="numc" href="tel:62626262"><span class="n">6262 6262</span><span class="l">NurseFirst</span><span class="s">Medical advice when it is not life-threatening</span></a>'+
'</div><div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn red" href="toolkit.html#call"><span class="sq"></span>Who do I call?</a><a class="btn" href="toolkit.html#scammed">I think I got scammed</a></div>'+
'<p class="tiny mute">Phone and SMS links may not work in every browser. The numbers are the numbers. Checked against official pages on 7 Nov 2026.</p></div></dialog>';
document.body.insertAdjacentHTML('beforeend',SHEET);
var sheet=$('#sheet'),lastF=null;
function openSheet(){lastF=document.activeElement;if(sheet.showModal)sheet.showModal();else sheet.setAttribute('open','');if(W.lenis)W.lenis.stop();$('#sheet-x').focus()}
function closeSheet(){if(sheet.close)sheet.close();else sheet.removeAttribute('open');if(W.lenis)W.lenis.start();if(lastF&&lastF.focus)lastF.focus()}
$$('[data-help]').forEach(function(b){b.addEventListener('click',openSheet)});
$('#sheet-x').addEventListener('click',closeSheet);
sheet.addEventListener('click',function(e){if(e.target===sheet)closeSheet()});
sheet.addEventListener('close',function(){if(W.lenis)W.lenis.start()});

/* ---------- page wipe between pages ---------- */
document.addEventListener('click',function(e){
 var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
 var h=a.getAttribute('href')||'';if(!/^(app|privacy|terms|index|toolkit)\.html/.test(h))return;
 if(a.target==='_blank'||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0||still())return;
 var w=$('#wipe');if(!w)return;
 e.preventDefault();w.classList.add('go');setTimeout(function(){window.location.href=h},620);
});
window.addEventListener('pageshow',function(){var w=$('#wipe');if(w)w.classList.remove('go')});

/* ---------- passport (stamps, stays on this device) ---------- */
var PK='wfsg.passport';
var STAMPS=[
 {id:'inbox',t:'Scam Inbox',line:'safety',ic:'phone',where:'toolkit.html#inbox'},
 {id:'tells',t:'Message check',line:'safety',ic:'search',where:'toolkit.html#tells'},
 {id:'call',t:'Who to call',line:'safety',ic:'bell',where:'toolkit.html#call'},
 {id:'scammed',t:'If you got scammed',line:'safety',ic:'shield',where:'toolkit.html#scammed'},
 {id:'payslip',t:'Payslip decoder',line:'money',ic:'wallet',where:'toolkit.html#payslip'},
 {id:'budget',t:'Move-out budget',line:'housing',ic:'home',where:'toolkit.html#budget'},
 {id:'contract',t:'Contract reader',line:'work',ic:'doc',where:'toolkit.html#contract'},
 {id:'s-scams',t:'Lesson: Red flags',line:'safety',ic:'alert',where:'app.html#s-scams',app:'scams'},
 {id:'s-payslip',t:'Lesson: First salary',line:'money',ic:'coin',where:'app.html#s-payslip',app:'payslip'},
 {id:'s-contract',t:'Lesson: Contract',line:'work',ic:'brief',where:'app.html#s-contract',app:'contract'},
 {id:'s-rental',t:'Lesson: Room listing',line:'housing',ic:'key',where:'app.html#s-rental',app:'rental'},
 {id:'s-emergency',t:'Lesson: 999 or 995',line:'safety',ic:'bell',where:'app.html#s-emergency',app:'emergency'}
];
function pGet(){try{return JSON.parse(localStorage.getItem(PK)||'{}')||{}}catch(e){return {}}}
function pSet(o){try{localStorage.setItem(PK,JSON.stringify(o))}catch(e){}}
function appProg(){try{var s=JSON.parse(localStorage.getItem('wfsg.v1')||'{}');return s.progress||{}}catch(e){return {}}}
var W={
 $:$,$$:$$,esc:esc,icon:icon,still:still,hasG:hasG,rm:rm,lenis:null,scramble:scramble,bindAll:bindAll,bindTilt:bindTilt,bindMag:bindMag,openSheet:openSheet,STAMPS:STAMPS,
 onTheme:function(f){themeCbs.push(f)},onCalm:function(f){calmCbs.push(f)},
 stamp:function(id){var o=pGet();if(o[id])return false;o[id]=Date.now();pSet(o);try{document.dispatchEvent(new CustomEvent('wf:stamp',{detail:id}))}catch(e){}return true},
 stamps:function(){var o=pGet(),a=appProg(),out={};STAMPS.forEach(function(s){if(o[s.id]||(s.app&&a[s.app]))out[s.id]=o[s.id]||1});return out},
 clearStamps:function(){pSet({})}
};
window.WF=W;
rm.addEventListener&&rm.addEventListener('change',function(){if(rm.matches&&W.lenis){W.lenis.destroy();W.lenis=null}else initLenis();applyCalm()});
applyTheme();applyCalm();initLenis();bindAll(document);
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){window.addEventListener('load',function(){try{navigator.serviceWorker.register('sw.js').catch(function(){})}catch(e){}})}
})();
