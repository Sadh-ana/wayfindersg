/* WayFinder SG landing: scenes you fly through. Vanilla JS, no libraries. Runs the stage only when Motion = Full; map, deck and scam demo work in every mode. */
(function(){
'use strict';
var D=document,H=D.documentElement,B=D.body,stage=D.getElementById('stage');if(!stage)return;
function $(s,r){return (r||D).querySelector(s)}function $$(s,r){return [].slice.call((r||D).querySelectorAll(s))}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var full=H.getAttribute('data-motion')==='full';
var scenes=$$('.scene',stage),N=scenes.length,cur=0,busy=false,lastDone=0;
var EO='cubic-bezier(.16,1,.3,1)',EI='cubic-bezier(.6,0,.85,.4)';
var PAL=['#E9C46A','#F7E0A3','#6C73F0','#1FB6A8','#F3EEE4'];
var px=innerWidth/2,py=innerHeight/2,vw=innerWidth,vh=innerHeight;
addEventListener('pointermove',function(e){px=e.clientX;py=e.clientY},{passive:true});
addEventListener('resize',function(){vw=innerWidth;vh=innerHeight});

/* ---------- departure board ---------- */
var flap=$('#flap');
if(flap){
  var words=flap.getAttribute('data-words').split('|'),wi=0;
  var setWord=function(animate){var w=words[wi%words.length];flap.innerHTML=w.split('').map(function(ch,k){return ch===' '?'<i class="sp"></i>':'<i'+(animate?' class="f" style="animation-delay:'+(k*45)+'ms"':'')+'>'+esc(ch)+'</i>'}).join('')};
  setWord(false);
  if(full)setInterval(function(){if(D.hidden||cur!==0)return;wi++;setWord(true)},2600);
}

/* ---------- map ---------- */
var info={line:$('#si-line'),title:$('#si-title'),dek:$('#si-dek'),go:$('#si-go'),box:$('#stn-info')};
function sel(a){
  $$('.stn').forEach(function(s){s.classList.toggle('sel',s===a)});
  var c=a.getAttribute('data-c');info.box.style.setProperty('--c',c);info.line.style.setProperty('--c',c);
  info.line.textContent=a.getAttribute('data-line');info.title.textContent=a.getAttribute('data-title');
  info.dek.textContent=a.getAttribute('data-dek')+' ('+a.getAttribute('data-mins')+' min read)';info.go.textContent='Open guide';info.go.href=a.getAttribute('href');
}
$$('.stn').forEach(function(a){
  a.addEventListener('mouseenter',function(){sel(a)});a.addEventListener('focus',function(){sel(a)});
  a.addEventListener('pointerdown',function(e){a._pt=e.pointerType;a._was=a.classList.contains('sel')});
  a.addEventListener('click',function(e){if(a._pt==='touch'&&!a._was){e.preventDefault();sel(a)}});
});

/* ---------- scam demo ---------- */
var marks=$$('.mark'),phone=$('.phone');
if(!full)marks.forEach(function(m){m.classList.add('on')});
function runShield(base){
  marks.forEach(function(m){m.classList.remove('on')});if(phone)phone.classList.remove('done');
  marks.forEach(function(m,k){setTimeout(function(){m.classList.add('on')},base+900+k*850)});
  setTimeout(function(){if(phone)phone.classList.add('done')},base+900+marks.length*850+250);
}

/* ---------- card deck ---------- */
var deck=$('#deck'),dbtn=$('#draw-btn'),ddata=[];
try{ddata=JSON.parse($('#deck-data').textContent)}catch(e){}
if(deck&&ddata.length){
  deck.classList.add('live');dbtn.hidden=false;
  var svg='<svg viewBox="0 0 120 80" fill="none" stroke="#F5EEE0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 60h30l14-26h56" stroke="#FF4660"/><path d="M10 28h40l14 26h46" stroke="#4D9DFF"/><circle cx="54" cy="34" r="7" fill="#080D18"/><circle cx="64" cy="54" r="7" fill="#080D18"/></svg>';
  for(var k=0;k<3;k++){var p=D.createElement('div');p.className='pile';p.setAttribute('aria-hidden','true');p.innerHTML=svg;deck.appendChild(p)}
  var pb=D.createElement('button');pb.type='button';pb.className='pilebtn';pb.setAttribute('aria-label','Draw a card');deck.appendChild(pb);
  var face=null,last=-1,COLS=['#F5EEE0','#FFD9A0','#BDF2D5','#CFE2FF','#F3CFFF','#FFC9C0'],drawn=0;
  var draw=function(){
    var i;do{i=Math.random()*ddata.length|0}while(i===last&&ddata.length>1);last=i;var d=ddata[i],old=face;
    var f=D.createElement('div');f.className='face';f.setAttribute('role','group');f.setAttribute('aria-label','Card: '+d.t);f.style.setProperty('--cardc',COLS[drawn++%COLS.length]);
    f.innerHTML='<span class="cat">'+esc(d.c)+'</span><h3>'+esc(d.t)+'</h3><p>'+esc(d.v)+'</p><div class="mv"><b>First move</b>'+esc(d.m)+'</div><div class="meta">'+esc(d.tm)+' &middot; '+esc(d.co)+'</div>';
    deck.insertBefore(f,pb);face=f;
    if(full){
      if(old)old.animate([{transform:'none',opacity:1},{transform:'translate(-70%,-14%) rotate(-26deg)',opacity:0}],{duration:420,easing:'ease-in',fill:'forwards'}).finished.then(function(){old.remove()}).catch(function(){old.remove()});
      f.animate([{transform:'translate(34%,12%) rotateY(-110deg) rotate(10deg) scale(.7)',opacity:0},{transform:'none',opacity:1}],{duration:800,easing:EO});
    }else if(old)old.remove();
  };
  pb.addEventListener('click',draw);dbtn.addEventListener('click',draw);
}

/* ---------- compass: self-check radar ---------- */
var cq=$('#cq');
var compass=(function(){
  if(!cq)return {};
  var boxes=$$('input',cq),grps=$$('.cgrp',cq),NS='http://www.w3.org/2000/svg',svg=$('#radar'),cx=220,cy=220,R=150;
  var names=grps.map(function(g){return $('legend',g).textContent}),cols=grps.map(function(g){return g.style.getPropertyValue('--c')});
  function el(n,a,p){var e=D.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e}
  function ang(i){return (-90+i*60)*Math.PI/180}
  [1/3,2/3,1].forEach(function(f){el('polygon',{class:'ring',points:names.map(function(_,i){return (cx+Math.cos(ang(i))*R*f)+','+(cy+Math.sin(ang(i))*R*f)}).join(' ')})});
  names.forEach(function(n,i){el('line',{class:'spoke',x1:cx,y1:cy,x2:cx+Math.cos(ang(i))*R,y2:cy+Math.sin(ang(i))*R});
    var t=el('text',{class:'lab',x:cx+Math.cos(ang(i))*(R+30),y:cy+Math.sin(ang(i))*(R+30)+6});t.textContent=n;t.style.fill=cols[i]});
  var poly=el('polygon',{class:'poly'}),pts=names.map(function(_,i){var p=el('circle',{class:'pt',r:7});p.style.fill=cols[i];return p});
  var nd=el('g',{class:'needle'});el('path',{d:'M220 110l17 110h-34z',fill:'var(--signal)'},nd);el('path',{d:'M220 330l-17-110h34z',fill:'var(--ink)',opacity:.55},nd);el('circle',{cx:cx,cy:cy,r:7,fill:'var(--paper)',stroke:'var(--ink)','stroke-width':3},nd);
  var tgt=names.map(function(){return 0}),now=names.map(function(){return 0}),a=45,av=0,at=45,running=false;
  function draw(){var P=[];now.forEach(function(v,i){var r=R*(.07+.93*v/3),x=cx+Math.cos(ang(i))*r,y=cy+Math.sin(ang(i))*r;P.push(x.toFixed(1)+','+y.toFixed(1));pts[i].setAttribute('cx',x);pts[i].setAttribute('cy',y)});poly.setAttribute('points',P.join(' '));nd.setAttribute('transform','rotate('+a.toFixed(1)+' '+cx+' '+cy+')')}
  function loop(){var moving=false;
    now.forEach(function(v,i){var d=tgt[i]-v;if(Math.abs(d)>.004){now[i]+=d*.12;moving=true}else now[i]=tgt[i]});
    var d=((at-a+540)%360)-180;av=(av+d*.14)*.78;a+=av;if(Math.abs(d)>.3||Math.abs(av)>.1)moving=true;
    draw();if(moving)requestAnimationFrame(loop);else running=false}
  function kick(){if(!running){running=true;requestAnimationFrame(loop)}}
  function counts(){return grps.map(function(g){return $$('input:checked',g).length})}
  var sum=$('#c-sum'),recs=$('#c-recs'),bs=$('#c-save'),br=$('#c-reset');
  function update(save){
    var c=counts(),n=c.reduce(function(x,y){return x+y},0);tgt=c.slice();
    var w=0;c.forEach(function(v,i){if(v<c[w])w=i});
    at=n===0?45:(-90+w*60)+90; if(n===boxes.length)at=0;
    if(n===0){sum.textContent='Tick what you could do today. Be honest: it is for you.'}
    else if(n===boxes.length){sum.innerHTML='<b>18 of 18.</b> Full compass. Now show someone else the guides.'}
    else sum.innerHTML='<b>'+n+' of '+boxes.length+'.</b> Needle says start with <b>'+esc(names[w])+'</b>.';
    var order=c.map(function(v,i){return i}).sort(function(x,y){return c[x]-c[y]}).slice(0,2),seen={},h='';
    order.forEach(function(i){$$('input:not(:checked)',grps[i]).forEach(function(b){var g=b.getAttribute('data-g');if(seen[g]||g==null)return;seen[g]=1;h+='<a href="guides/'+g+'/index.html">'+esc(b.getAttribute('data-gl'))+' &rarr;</a>'})});
    recs.innerHTML=h;bs.hidden=n===0;br.hidden=n===0;kick();
    if(save)try{localStorage.setItem('wf2.compass',JSON.stringify(boxes.map(function(b,i){return b.checked?i:-1}).filter(function(i){return i>=0})))}catch(e){}
  }
  boxes.forEach(function(b){b.addEventListener('change',function(){update(true)})});
  try{var s=JSON.parse(localStorage.getItem('wf2.compass')||'[]');s.forEach(function(i){if(boxes[i])boxes[i].checked=true})}catch(e){}
  br.addEventListener('click',function(){boxes.forEach(function(b){b.checked=false});update(true)});
  bs.addEventListener('click',function(){shareImage(names,cols,counts())});
  update(false);
  if(!full){now=tgt.slice();a=at;draw()}
  return {replay:function(){now=names.map(function(){return 0});a=-60;av=0;kick();update(false)}};
})();
function shareImage(names,cols,c){
  var W=1080,Hh=1350,cv=D.createElement('canvas');cv.width=W;cv.height=Hh;var x=cv.getContext('2d'),css=getComputedStyle(H);
  var g=x.createRadialGradient(W*.8,0,50,W*.5,Hh*.4,Hh);g.addColorStop(0,'#3a3480');g.addColorStop(.45,'#0c1020');g.addColorStop(1,'#070A11');x.fillStyle=g;x.fillRect(0,0,W,Hh);
  var gg=x.createRadialGradient(W*.1,Hh,10,W*.1,Hh,700);gg.addColorStop(0,'rgba(233,196,106,.35)');gg.addColorStop(1,'rgba(233,196,106,0)');x.fillStyle=gg;x.fillRect(0,0,W,Hh);
  x.fillStyle='#F3EEE4';x.font='900 170px "Big Shoulders Display",Impact,sans-serif';x.textBaseline='alphabetic';x.fillText('MY COMPASS',70,250);
  x.fillStyle='#E9C46A';x.font='500 30px "JetBrains Mono",monospace';x.fillText('WAYFINDER SG  ·  LESS LOST, MORE IN CONTROL',74,310);
  var cx=540,cy=760,R=330;
  function ang(i){return (-90+i*60)*Math.PI/180}
  x.strokeStyle='rgba(243,238,228,.22)';x.lineWidth=2;
  [1/3,2/3,1].forEach(function(f){x.beginPath();names.forEach(function(_,i){var px=cx+Math.cos(ang(i))*R*f,py=cy+Math.sin(ang(i))*R*f;i?x.lineTo(px,py):x.moveTo(px,py)});x.closePath();x.stroke()});
  names.forEach(function(_,i){x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(ang(i))*R,cy+Math.sin(ang(i))*R);x.stroke()});
  var gp=x.createLinearGradient(cx-R,cy-R,cx+R,cy+R);gp.addColorStop(0,'rgba(247,224,163,.55)');gp.addColorStop(1,'rgba(224,120,106,.45)');
  x.beginPath();c.forEach(function(v,i){var r=R*(.07+.93*v/3),px=cx+Math.cos(ang(i))*r,py=cy+Math.sin(ang(i))*r;i?x.lineTo(px,py):x.moveTo(px,py)});x.closePath();x.fillStyle=gp;x.fill();x.strokeStyle='#E9C46A';x.lineWidth=6;x.lineJoin='round';x.stroke();
  x.textAlign='center';x.font='800 46px "Big Shoulders Display",Impact,sans-serif';
  names.forEach(function(n,i){var r=R*(.07+.93*c[i]/3),px=cx+Math.cos(ang(i))*r,py=cy+Math.sin(ang(i))*r;x.fillStyle=cols[i].indexOf('var(')===0?css.getPropertyValue(cols[i].slice(4,-1)):cols[i];x.beginPath();x.arc(px,py,13,0,6.283);x.fill();
    x.fillText(n.toUpperCase(),cx+Math.cos(ang(i))*(R+62),cy+Math.sin(ang(i))*(R+62)+16)});
  var n=c.reduce(function(a,b){return a+b},0),w=0;c.forEach(function(v,i){if(v<c[w])w=i});
  x.fillStyle='#F3EEE4';x.font='900 150px "Big Shoulders Display",Impact,sans-serif';x.fillText(n+' / 18',cx,1190);
  x.fillStyle='#E9C46A';x.font='500 32px "JetBrains Mono",monospace';x.fillText(n===18?'FULL COMPASS':'NEXT STOP: '+names[w].toUpperCase(),cx,1245);
  x.fillStyle='rgba(243,238,228,.6)';x.font='500 26px "JetBrains Mono",monospace';x.fillText('free · private · no account',cx,1305);
  cv.toBlob(function(b){if(!b)return;var u=URL.createObjectURL(b),a=D.createElement('a');a.href=u;a.download='my-wayfinder-compass.png';D.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u)},500)});
}

/* ---------- share ---------- */
var sb=$('#share-btn'),sm=$('#share-msg');
if(sb){sb.hidden=false;sb.addEventListener('click',function(){
  var u=location.href.split('#')[0],t={title:'WayFinder SG',text:'A free, private guide for leaving home in Singapore.',url:u};
  if(navigator.share){navigator.share(t).catch(function(){})}
  else if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(function(){sm.textContent='Link copied.'},function(){sm.textContent=u})}
  else sm.textContent=u;
})}

/* ---------- plain page: nothing more than smooth anchors ---------- */
function plainGo(i){var s=scenes[i];if(s)s.scrollIntoView({behavior:'auto',block:'start'})}
D.addEventListener('click',function(e){
  var g=e.target.closest&&e.target.closest('[data-go]');if(!g)return;e.preventDefault();
  var i=parseInt(g.getAttribute('data-go'),10);
  if(!full||!H.classList.contains('rig')){plainGo(i);return}
  go(i);
});
if(!full)return;

/* =================== the stage =================== */
H.classList.add('rig');
function idxOf(h){h=(h||'').replace('#','');if(h==='')return 0;for(var i=0;i<N;i++)if(scenes[i].id===h)return i;return 0}
cur=idxOf(location.hash);
var live=$('#stage-live'),rail=$('#rail'),next=$('#next'),nextL=$('#next-l');

/* split display headings into letters (kept readable via aria-label) */
$$('.hx').forEach(function(h){
  var t=h.textContent;h.setAttribute('aria-label',t);h.textContent='';h._cs=[];
  t.split(' ').forEach(function(w,wi){var ws=D.createElement('span');ws.className='w';ws.setAttribute('aria-hidden','true');
    w.split('').forEach(function(ch){var c=D.createElement('span');c.className='c';c.textContent=ch;ws.appendChild(c);h._cs.push(c)});
    h.appendChild(ws);if(wi<t.split(' ').length-1)h.appendChild(D.createTextNode(' '))});
  var pc=h._cs.filter(function(c){return /o/i.test(c.textContent)})[0]||h._cs.filter(function(c){return /[adpbqr]/i.test(c.textContent)})[0];
  if(pc){h._pt=pc;pc.classList.add('pt');pc.setAttribute('data-cursor','dive in')}
});
D.addEventListener('click',function(e){var p=e.target.closest&&e.target.closest('.c.pt');if(p&&!busy&&H.classList.contains('rig'))step(1)});

$$('.lost').forEach(function(h){h.addEventListener('pointerenter',function(){if(busy)return;h._cs.forEach(function(c){var dx=(Math.random()-.5)*60,dy=(Math.random()-.5)*50,r=(Math.random()-.5)*50;c.animate([{transform:'none'},{transform:'translate('+dx+'px,'+dy+'px) rotate('+r+'deg)',offset:.25},{transform:'none'}],{duration:1100,easing:'cubic-bezier(.2,1.4,.3,1)'})})})});
/* rail */
scenes.forEach(function(s,i){
  var b=D.createElement('button');b.type='button';b.setAttribute('data-go',i);b.setAttribute('aria-label','Go to '+s.getAttribute('data-label'));
  b.innerHTML='<span>'+esc(s.getAttribute('data-label'))+'</span><i></i>';rail.appendChild(b);
});
$('#plain').addEventListener('click',function(){
  try{var s=JSON.parse(localStorage.getItem('wf2.state'))||{};s.v=s.v||1;s.motion='reduced';localStorage.setItem('wf2.state',JSON.stringify(s))}catch(e){}
  location.reload();
});
next.addEventListener('click',function(){go(cur<N-1?cur+1:0)});
function ui(){
  $$('button',rail).forEach(function(b,i){b.setAttribute('aria-current',i===cur?'true':'false')});
  nextL.textContent=cur<N-1?'Next: '+scenes[cur+1].getAttribute('data-label'):'Back to start';
  try{history.replaceState(null,'',cur===0?location.pathname+location.search:'#'+scenes[cur].id)}catch(e){}
}

/* ---------- one quiet ring at the dive point ---------- */
function pulse(o,fwd,dur){
  var maxR=Math.hypot(Math.max(o.x,vw-o.x),Math.max(o.y,vh-o.y))*1.1,d=D.createElement('div');d.className='dive';d.style.left=o.x+'px';d.style.top=o.y+'px';B.appendChild(d);
  var a=d.animate(fwd?[{transform:'scale(.3)',opacity:.7},{transform:'scale('+(maxR/36)+')',opacity:0}]:[{transform:'scale('+(maxR/36)+')',opacity:0},{transform:'scale(.3)',opacity:.7}],{duration:dur,delay:fwd?380:0,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'});
  a.finished.then(function(){d.remove()}).catch(function(){d.remove()});
}

/* ---------- scene entrances ---------- */
var hooks={
  top:function(base){var l1=$('.l1'),l2=$('.l2');
    [l1,l2].forEach(function(n,k){n.animate([{clipPath:'inset(0 0 100% 0)',transform:'translateY(36%) skewY(7deg)'},{clipPath:'inset(-30% -8% -30% -8%)',transform:'none'}],{duration:1000,delay:base+k*170,easing:EO,fill:'backwards'})});
    $$('.fo').forEach(function(f,k){var s=$('svg',f);if(s)s.animate([{opacity:0,transform:'scale(.2) rotate(-40deg)'},{opacity:1,transform:'none'}],{duration:1100,delay:base+300+k*110,easing:'cubic-bezier(.2,1.5,.4,1)',fill:'backwards'})})},
  map:function(base){
    $$('.metro .trk').forEach(function(p,k){p.style.strokeDasharray='1';p.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:1500,delay:base+k*170,easing:'cubic-bezier(.5,0,.2,1)',fill:'backwards'})});
    $$('.metro .stn .dot').forEach(function(d,k){d.animate([{transform:'scale(0)'},{transform:'scale(1.25)',offset:.7},{transform:'scale(1)'}],{duration:600,delay:base+500+k*80,easing:EO,fill:'backwards'})});
    $$('.metro .stn text,.metro .badge').forEach(function(d,k){d.animate([{opacity:0},{opacity:1}],{duration:600,delay:base+700+k*40,fill:'backwards'})});
    var first=$('.stn');if(first&&!$('.stn.sel'))setTimeout(function(){if(scenes[cur].id==='map'&&!$('.stn.sel'))sel(first)},base+1400)},
  shield:function(base){runShield(base)},
  compass:function(base){if(compass.replay)setTimeout(compass.replay,base+500)},
  end:function(base){var b=$('.bigword');if(b)b.animate([{transform:'translateY(45%)',opacity:0},{transform:'none',opacity:1}],{duration:1300,delay:base+400,easing:EO,fill:'backwards'})}
};
function enter(i,base){
  var s=scenes[i];s.scrollTop=0;
  $$('[data-in]',s).forEach(function(n,k){n.animate([{opacity:0,transform:'translateY(46px) scale(.96)'},{opacity:1,transform:'none'}],{duration:850,delay:base+k*85,easing:EO,fill:'backwards'})});
  $$('.hx',s).forEach(function(h){if(h.classList.contains('lost')){h._cs.forEach(function(c,k){var dx=(Math.random()-.5)*vw*.5,dy=(Math.random()-.5)*vh*.5,r=(Math.random()-.5)*160;c.animate([{opacity:0,transform:'translate('+dx+'px,'+dy+'px) rotate('+r+'deg) scale(.6)',filter:'blur(8px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:1700,delay:base+250+k*45,easing:'cubic-bezier(.2,1.35,.3,1)',fill:'backwards'})});return}h._cs.forEach(function(c,k){c.animate([{opacity:0,transform:'translateY(60%) rotateX(-80deg) scale(.8)',filter:'blur(10px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:900,delay:base+k*30,easing:EO,fill:'backwards'})})});
  var hk=hooks[s.id];if(hk)hk(base);
}

/* ---------- the dive: zoom into a letter, the next scene opens out of it ---------- */
function centre(el){var r=el.getBoundingClientRect();return {x:clamp(r.left+r.width/2,0,vw),y:clamp(r.top+r.height/2,0,vh)}}
function portalOf(i){
  if(i===0){var o=$('#portal');if(o)return o}
  var h=$('.hx',scenes[i]);return (h&&h._pt)||h||scenes[i];
}
function go(to,o){
  if(busy||to===cur||to<0||to>=N)return;
  busy=true;H.classList.add('warping');
  var A=scenes[cur],Bn=scenes[to],fwd=to>cur;o=centre(portalOf(fwd?cur:to));
  var org=o.x+'px '+o.y+'px',R=Math.hypot(Math.max(o.x,vw-o.x),Math.max(o.y,vh-o.y))*1.1+40,T=fwd?1650:1450,at='at '+o.x+'px '+o.y+'px';
  Bn.classList.add('on');A.style.transformOrigin=org;Bn.style.transformOrigin=org;A.style.zIndex=fwd?1:2;Bn.style.zIndex=fwd?2:1;
  if(fwd){
    A.animate([{transform:'scale(1)',opacity:1},{transform:'scale(46)',opacity:1,offset:.72},{transform:'scale(60)',opacity:0}],{duration:1500,easing:'cubic-bezier(.62,0,.78,.3)',fill:'forwards'});
    Bn.animate([{clipPath:'circle(0px '+at+')',transform:'scale(1.22)'},{clipPath:'circle('+R+'px '+at+')',transform:'scale(1)'}],{duration:1150,delay:430,easing:'cubic-bezier(.6,0,.15,1)',fill:'both'});
    enter(to,1050);
  }else{
    A.animate([{clipPath:'circle('+R+'px '+at+')'},{clipPath:'circle(0px '+at+')'}],{duration:1100,easing:'cubic-bezier(.6,0,.25,1)',fill:'forwards'});
    Bn.animate([{transform:'scale(46)',opacity:0},{transform:'scale(14)',opacity:1,offset:.45},{transform:'scale(1)',opacity:1}],{duration:1300,delay:80,easing:'cubic-bezier(.3,0,.25,1)',fill:'both'});
    enter(to,700);
  }
  pulse(o,fwd,1200);
  setTimeout(function(){
    A.getAnimations().forEach(function(a){a.cancel()});Bn.getAnimations().forEach(function(a){a.cancel()});
    A.classList.remove('on');A.style.cssText='';Bn.style.cssText='';
    cur=to;busy=false;lastDone=performance.now();H.classList.remove('warping');ui();
    live.textContent='Scene '+(cur+1)+' of '+N+': '+Bn.getAttribute('data-label');
    var h=$('h1,h2',Bn);if(h){h.setAttribute('tabindex','-1');try{h.focus({preventScroll:true})}catch(e){}}
  },T);
}
function step(dir){go(cur+dir)}

/* ---------- input ---------- */
function scrollable(dir){var s=scenes[cur],m=s.scrollHeight-s.clientHeight;if(m<4)return false;return dir>0?s.scrollTop<m-3:s.scrollTop>3}
var acc=0,accT=0;
addEventListener('wheel',function(e){
  if(busy||e.ctrlKey||Math.abs(e.deltaY)<3)return;if(e.target.closest&&e.target.closest('.settings'))return;
  var dir=e.deltaY>0?1:-1;if(scrollable(dir))return;
  var now=performance.now();if(now-lastDone<750)return;if(now-accT>220)acc=0;accT=now;acc+=e.deltaY;
  if(Math.abs(acc)>70){acc=0;step(dir)}
},{passive:true});
var ty=0,tx=0,tst=0;
addEventListener('touchstart',function(e){ty=e.touches[0].clientY;tx=e.touches[0].clientX;tst=scenes[cur].scrollTop},{passive:true});
addEventListener('touchend',function(e){
  if(busy)return;var dy=ty-e.changedTouches[0].clientY,dx=tx-e.changedTouches[0].clientX;
  if(Math.abs(dy)<60||Math.abs(dy)<Math.abs(dx)*1.2||Math.abs(scenes[cur].scrollTop-tst)>2)return;
  var dir=dy>0?1:-1;if(scrollable(dir))return;step(dir);
},{passive:true});
addEventListener('keydown',function(e){
  if(e.altKey||e.ctrlKey||e.metaKey)return;var t=e.target;if(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable)return;
  var k=e.key,dir=0;
  if(k==='ArrowDown'||k==='PageDown')dir=1;else if(k==='ArrowUp'||k==='PageUp')dir=-1;
  else if(k===' '&&(t===B||t===H||t.id==='h-top'||/^H[12]$/.test(t.tagName)))dir=e.shiftKey?-1:1;
  else if(k==='Home'&&!busy){e.preventDefault();go(0);return}else if(k==='End'&&!busy){e.preventDefault();go(N-1);return}
  if(!dir)return;e.preventDefault();if(busy)return;
  if(scrollable(dir)){scenes[cur].scrollBy({top:dir*Math.round(vh*.5),behavior:'smooth'});return}
  step(dir);
});
var portal=$('#portal');
if(portal)portal.addEventListener('click',function(){go(1)});
addEventListener('hashchange',function(){var i=idxOf(location.hash);if(i!==cur)go(i)});

/* ---------- ambient loop: network, parallax, long shadow, trains ---------- */
var net=$('#net'),nx=net.getContext('2d'),dots=[],mega=$('.mega'),fos=$$('.fo'),sx=0,sy=0,trains=[];
function nsz(){net.width=vw;net.height=vh}nsz();addEventListener('resize',nsz);
for(var d=0;d<(vw<760?36:78);d++)dots.push({x:Math.random()*vw,y:Math.random()*vh,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,c:PAL[(Math.random()*PAL.length)|0]});
$$('.metro .mline').forEach(function(g,k){var p=$('.trk',g),tr=$('.tr',g);trains.push({p:p,tr:tr,len:p.getTotalLength(),t:Math.random()*2,v:(.00007+Math.random()*.00007)*(k%2?-1:1)})});
var lastSh='',rose=$('.rose'),rn=rose&&$('.rn',rose),rd=45;
function tick(){
  requestAnimationFrame(tick);if(D.hidden)return;
  if(cur===0||busy){
    sx+=((px-vw/2)/vw-sx)*.06;sy+=((py-vh/2)/vh-sy)*.06;
    fos.forEach(function(f){var dp=parseFloat(f.getAttribute('data-depth'))||.5;f.style.transform='translate3d('+(-sx*dp*90).toFixed(1)+'px,'+(-sy*dp*90).toFixed(1)+'px,0)'});
    var sh=[],ox=-sx*2.2,oy=-sy*2.2+.55;
    for(var k=1;k<=11;k++)sh.push((ox*k).toFixed(1)+'px '+(oy*k+k*.9).toFixed(1)+'px 0 rgba('+(98-k*6)+','+(104-k*6)+','+(222-k*13)+',1)');
    var str=sh.join(',');if(str!==lastSh){lastSh=str;if(mega)mega.style.setProperty('--lsh',str)}
    nx.clearRect(0,0,vw,vh);
    for(var i=0;i<dots.length;i++){var a=dots[i];a.x+=a.vx;a.y+=a.vy;if(a.x<0||a.x>vw)a.vx*=-1;if(a.y<0||a.y>vh)a.vy*=-1;
      nx.globalAlpha=.65;nx.fillStyle=a.c;nx.beginPath();nx.arc(a.x,a.y,1.8,0,6.283);nx.fill();
      for(var j=i+1;j<dots.length;j++){var b=dots[j],dd=Math.hypot(a.x-b.x,a.y-b.y);if(dd<120){nx.globalAlpha=(1-dd/120)*.22;nx.strokeStyle=a.c;nx.lineWidth=1;nx.beginPath();nx.moveTo(a.x,a.y);nx.lineTo(b.x,b.y);nx.stroke()}}
      var dm=Math.hypot(a.x-px,a.y-py);if(dm<190){nx.globalAlpha=(1-dm/190)*.7;nx.strokeStyle='#fff';nx.beginPath();nx.moveTo(a.x,a.y);nx.lineTo(px,py);nx.stroke()}}
    nx.globalAlpha=1;
    if(rn){var rr=rose.getBoundingClientRect(),ra=Math.atan2(py-(rr.top+rr.height/2),px-(rr.left+rr.width/2))*57.3+90;rd+=(((ra-rd+540)%360)-180)*.09;rn.style.transform='rotate('+rd.toFixed(1)+'deg)'}
  }
  if(scenes[cur].id==='map'){
    trains.forEach(function(T){T.t+=T.v*16;var m=((T.t%2)+2)%2,u=m<1?m:2-m,L=T.len*u,a=T.p.getPointAtLength(L),b=T.p.getPointAtLength(clamp(L+(m<1?2:-2),0,T.len));
      T.tr.setAttribute('transform','translate('+a.x.toFixed(1)+' '+a.y.toFixed(1)+') rotate('+(Math.atan2(b.y-a.y,b.x-a.x)*57.3).toFixed(1)+')')});
  }
}

/* ---------- boot ---------- */
scenes.forEach(function(s,i){s.classList.toggle('on',i===cur)});
stage.classList.add('ready');ui();
live.textContent='Scene '+(cur+1)+' of '+N+': '+scenes[cur].getAttribute('data-label');
enter(cur,cur===0?350:150);
requestAnimationFrame(tick);
})();
