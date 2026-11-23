/* WayFinder SG fx layer: magic cursor, sparkles, magnetic buttons, tilt, split text, page wipes, landing choreography. Vanilla JS + optional Lenis. */
(function(){
'use strict';
var D=document,H=D.documentElement,B=D.body;
function $(s,r){return (r||D).querySelector(s)} function $$(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))}
function el(t,c,p){var e=D.createElement(t);if(c)e.className=c;(p||B).appendChild(e);return e}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
$$('input[name="motion"]').forEach(function(i){i.addEventListener('change',function(){setTimeout(function(){location.reload()},220)})});
if(H.getAttribute('data-motion')!=='full'){H.classList.remove('wipe-in');try{sessionStorage.removeItem('wf.nav')}catch(e){}return}
var fine=matchMedia('(pointer:fine)').matches&&matchMedia('(hover:hover)').matches;
var PAL=['#FF4660','#FFA928','#2BD67B','#4D9DFF','#F5EEE0'];
var mx=-200,my=-200,vw=innerWidth,vh=innerHeight;
addEventListener('resize',function(){vw=innerWidth;vh=innerHeight});

/* ---------- scroll progress ---------- */
var sp=el('div','sp');sp.setAttribute('aria-hidden','true');

/* ---------- page wipe ---------- */
var wipe=el('div','wipe');wipe.setAttribute('aria-hidden','true');for(var i=0;i<6;i++)el('i','',wipe);
var bars=$$('i',wipe);
function wipeOut(){
  bars.forEach(function(b,k){var a=b.animate([{transform:'scaleX(1)',transformOrigin:'100% 50%'},{transform:'scaleX(0)',transformOrigin:'100% 50%'}],{duration:650,delay:k*70,easing:'cubic-bezier(.7,0,.2,1)',fill:'both'});if(k===5)a.finished.then(function(){bars.forEach(function(x){x.getAnimations().forEach(function(an){an.cancel()})})}).catch(function(){})});
  H.classList.remove('wipe-in');
}
if(H.classList.contains('wipe-in'))wipeOut();
try{sessionStorage.removeItem('wf.nav')}catch(e){}
addEventListener('pageshow',function(e){if(e.persisted){bars.forEach(function(b){b.getAnimations().forEach(function(a){a.cancel()})});H.classList.remove('wipe-in')}});
D.addEventListener('click',function(e){
  if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target||a.hasAttribute('download'))return;
  var u;try{u=new URL(a.href,location.href)}catch(x){return}
  if(u.origin!==location.origin||(u.pathname===location.pathname&&u.search===location.search))return;
  e.preventDefault();try{sessionStorage.setItem('wf.nav','1')}catch(x){}
  var go=function(){location.href=u.href};
  bars.forEach(function(b,k){var an=b.animate([{transform:'scaleX(0)',transformOrigin:'0 50%'},{transform:'scaleX(1)',transformOrigin:'0 50%'}],{duration:420,delay:k*55,easing:'cubic-bezier(.7,0,.2,1)',fill:'both'});if(k===5)an.finished.then(go).catch(go)});
  setTimeout(go,1100);
});

/* ---------- magic cursor + sparkles ---------- */
var parts=[],cv,cx;
if(fine){
  H.classList.add('fx-cur');
  var dot=el('div','cur-dot'),ring=el('div','cur-ring'),lbl=el('div','cur-lbl');
  [dot,ring,lbl].forEach(function(n){n.setAttribute('aria-hidden','true')});
  cv=el('canvas');cv.id='sparkle';cv.setAttribute('aria-hidden','true');cx=cv.getContext('2d');
  var sz=function(){cv.width=vw;cv.height=vh};sz();addEventListener('resize',sz);
  var rx=-200,ry=-200,vis=false;
  function emit(){}
  addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;mx=e.clientX;my=e.clientY;if(!vis){vis=true;rx=mx;ry=my;H.classList.add('fx-cur-on')}var sp2=Math.hypot(e.movementX||0,e.movementY||0);emit(Math.min(3,1+(sp2/16|0)),mx,my,6,.9)},{passive:true});
  H.addEventListener('mouseleave',function(){vis=false;H.classList.remove('fx-cur-on')});
  H.addEventListener('mouseenter',function(){vis=true;H.classList.add('fx-cur-on')});
  addEventListener('pointerdown',function(){ring.classList.add('down');emit(22,mx,my,4,3.2)});
  addEventListener('pointerup',function(){ring.classList.remove('down')});
  D.addEventListener('pointerover',function(e){
    var t=e.target;if(!t.closest)return;var c=t.closest('[data-cursor]');
    if(t.closest('input[type=text],input[type=search],input[type=number],input[type=date],textarea')){ring.classList.remove('hot');ring.classList.add('txt');lbl.textContent='';return}
    ring.classList.remove('txt');
    var h=t.closest('a,button,summary,select,label,[role=button],.panel,.chip,[data-cursor],.stn');
    if(h){ring.classList.add('hot');lbl.textContent=(c&&c.getAttribute('data-cursor'))||(h.matches('a.panel,.panel')?'open':h.matches('a')?'go':'')}
    else{ring.classList.remove('hot');lbl.textContent=''}
  });
}
function drawSparks(){
  if(!cx)return;cx.clearRect(0,0,cv.width,cv.height);if(!parts.length)return;
  cx.globalCompositeOperation='lighter';
  for(var i=parts.length-1;i>=0;i--){var p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.035;p.vx*=.985;p.l-=p.d;if(p.l<=0){parts.splice(i,1);continue}
    cx.globalAlpha=Math.max(0,p.l);cx.fillStyle=p.c;cx.shadowColor=p.c;cx.shadowBlur=12;
    if(p.star){var r=p.r*2.2;cx.beginPath();cx.moveTo(p.x,p.y-r);cx.lineTo(p.x+r*.28,p.y-r*.28);cx.lineTo(p.x+r,p.y);cx.lineTo(p.x+r*.28,p.y+r*.28);cx.lineTo(p.x,p.y+r);cx.lineTo(p.x-r*.28,p.y+r*.28);cx.lineTo(p.x-r,p.y);cx.lineTo(p.x-r*.28,p.y-r*.28);cx.closePath();cx.fill()}
    else{cx.beginPath();cx.arc(p.x,p.y,p.r*p.l+.3,0,6.283);cx.fill()}}
  cx.globalAlpha=1;cx.shadowBlur=0;
}

/* ---------- magnetic, tilt, spotlight (delegated) ---------- */
var MSEL='.btn,.nav a,.ibtn,[data-magnetic]',magEl=null,tiltEl=null;
function resetMag(m){m.style.transition='transform .55s cubic-bezier(.2,1.7,.4,1)';m.style.transform='';setTimeout(function(){m.style.transition=''},560)}
D.addEventListener('pointermove',function(e){
  if(e.pointerType==='touch')return;var t=e.target;if(!t.closest)return;
  var m=t.closest(MSEL);if(m!==magEl){if(magEl)resetMag(magEl);magEl=m}
  if(m){var r=m.getBoundingClientRect();m.style.transform='translate('+((e.clientX-r.left-r.width/2)*.26).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.38).toFixed(1)+'px)'}
  var c=t.closest('.card,.panel,.step3,.stat');
  if(c!==tiltEl){if(tiltEl&&tiltEl.style.transform){tiltEl.style.transition='transform .5s';tiltEl.style.transform='';var o=tiltEl;setTimeout(function(){o.style.transition=''},520)}tiltEl=c}
  if(c){var b=c.getBoundingClientRect(),px=(e.clientX-b.left)/b.width,py=(e.clientY-b.top)/b.height;c.style.setProperty('--mx',(px*100)+'%');c.style.setProperty('--my',(py*100)+'%');
    if(c.matches('.card.link,.panel,.step3')){c.style.transform='perspective(900px) rotateX('+((.5-py)*9).toFixed(2)+'deg) rotateY('+((px-.5)*11).toFixed(2)+'deg) translateZ(0)'}}
},{passive:true});

/* ---------- text scramble ---------- */
var GL='ABCDEFGHJKLMNPRSTUVWXYZ0123456789<>/\\[]{}=+*?#',scr=new WeakSet();
D.addEventListener('pointerover',function(e){
  var t=e.target.closest&&e.target.closest('.nav a,[data-scramble],.panel .go');if(!t||t.children.length||scr.has(t))return;
  var o=t.textContent;if(!o.trim())return;scr.add(t);t.style.minWidth=t.offsetWidth+'px';var f=0,n=10;
  var iv=setInterval(function(){f++;var s='';for(var i=0;i<o.length;i++)s+=(o[i]===' '||i<o.length*f/n)?o[i]:GL[(Math.random()*GL.length)|0];t.textContent=s;if(f>=n){clearInterval(iv);t.textContent=o;t.style.minWidth='';scr.delete(t)}},34);
});

/* ---------- split headings ---------- */
var EASE='cubic-bezier(.2,.9,.2,1)';
var io=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;io.unobserve(en.target);var f=en.target._fx;if(f)f()})},{threshold:.15});
$$('.g-head h1,.sec-h h1,.section-h2').forEach(function(h){
  if(h.children.length)return;var words=h.textContent.trim().split(/\s+/);h.setAttribute('aria-label',h.textContent.trim());h.classList.add('split');
  h.innerHTML=words.map(function(w){return '<span class="sw" aria-hidden="true"><span>'+w.replace(/&/g,'&amp;')+'</span></span>'}).join(' ');
  var inner=$$('.sw>span',h);inner.forEach(function(s){s.style.transform='translateY(115%)'});
  h._fx=function(){inner.forEach(function(s,k){s.animate([{transform:'translateY(115%) rotate(6deg)'},{transform:'none'}],{duration:850,delay:k*70,easing:EASE,fill:'backwards'});s.style.transform=''})};
  io.observe(h);
});
/* grid / card reveals */
$$('.grid>*,.dlist>a,.steps>*,.stats>*,.result>*').forEach(function(c,k){
  var b=c.parentElement,idx=Array.prototype.indexOf.call(b.children,c);c.style.opacity='0';
  c._fx=function(){c.style.opacity='';c.animate([{opacity:0,transform:'translateY(46px) scale(.97)'},{opacity:1,transform:'none'}],{duration:800,delay:Math.min(idx,6)*90,easing:EASE,fill:'backwards'})};io.observe(c);
});

/* ---------- landing ---------- */
var home=B.getAttribute('data-page')==='home',lenis=null,heroVis=true;
var loops=[];
function loop(t){requestAnimationFrame(loop);if(D.hidden)return;
  if(cx){rx+=(mx-rx)*.17;ry+=(my-ry)*.17;if(dot){dot.style.transform='translate3d('+mx+'px,'+my+'px,0)';ring.style.transform='translate3d('+rx+'px,'+ry+'px,0)';lbl.style.transform='translate3d('+rx+'px,'+(ry+(ring.classList.contains('hot')?0:0))+'px,0)'}drawSparks()}
  var h=D.documentElement,max=h.scrollHeight-vh;sp.style.transform='scaleX('+(max>0?clamp(scrollY/max,0,1):0)+')';
  for(var i=0;i<loops.length;i++)loops[i](t)}
requestAnimationFrame(loop);

if(home&&!$('#stage')){
  if(window.Lenis){try{lenis=new Lenis({duration:1.15,smoothWheel:true,wheelMultiplier:.95});loops.push(function(t){lenis.raf(t)})}catch(e){lenis=null}}
  $$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var t=$(a.getAttribute('href'));if(!t)return;e.preventDefault();if(lenis)lenis.scrollTo(t,{offset:-70,duration:1.4});else t.scrollIntoView({behavior:'smooth'})})});

  /* hero entrance */
  var hero=$('.hero2');
  var chars=[];
  $$('.mega .ln:not(.serif) .w').forEach(function(w){var t=w.textContent;w.textContent='';w.setAttribute('aria-hidden','true');for(var i=0;i<t.length;i++){var s=el('span','ch',w);s.textContent=t[i];chars.push(s)}});
  chars.forEach(function(c,k){var a=c.animate([{opacity:0,transform:'translateY(70%) rotateX(-90deg) scale(.7)',filter:'blur(14px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:1000,delay:250+k*34,easing:EASE,fill:'backwards'})});
  var serif=$('.mega .ln.serif');if(serif)serif.animate([{opacity:0,transform:'translateY(40px) skewX(-8deg)',filter:'blur(18px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:1300,delay:250+chars.length*34,easing:EASE,fill:'backwards'});
  $$('.hero2 .eyebrow,.hero2 .lead,.hero2 .ctas,.hero2 .fine').forEach(function(n,k){n.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:900,delay:900+k*140,easing:EASE,fill:'backwards'})});
  var fos=$$('.fo');
  fos.forEach(function(f,k){var s=$('svg',f);if(s)s.animate([{opacity:0,transform:'scale(.2) rotate(-40deg)'},{opacity:1,transform:'none'}],{duration:1200,delay:600+k*120,easing:'cubic-bezier(.2,1.5,.4,1)',fill:'backwards'})});
  setTimeout(function(){chars.forEach(function(c){c.getAnimations().forEach(function(a){a.cancel()})})},2600);

  /* hero loop: parallax, char proximity, network canvas */
  var net=$('#net'),nx=net&&net.getContext('2d'),dots=[];
  function nsz(){if(!net)return;var r=hero.getBoundingClientRect();net.width=r.width;net.height=r.height}
  if(net){nsz();addEventListener('resize',nsz);var n=vw<760?34:72;for(var i=0;i<n;i++)dots.push({x:Math.random()*net.width,y:Math.random()*net.height,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,c:PAL[(Math.random()*4)|0]})}
  new IntersectionObserver(function(es){heroVis=es[0].isIntersecting},{threshold:0}).observe(hero);
  var sx=0,sy=0;
  loops.push(function(){
    if(!heroVis)return;var hr=hero.getBoundingClientRect(),nxp=(mx-vw/2)/vw,nyp=(my-vh/2)/vh;sx+=(nxp-sx)*.06;sy+=(nyp-sy)*.06;var sc=-hr.top;
    fos.forEach(function(f){var d=parseFloat(f.getAttribute('data-depth'))||.5;f.style.transform='translate3d('+(-sx*d*90).toFixed(1)+'px,'+(-sy*d*90+sc*d*.18).toFixed(1)+'px,0)'});
    if(fine)chars.forEach(function(c){var r=c.getBoundingClientRect(),dx=r.left+r.width/2-mx,dy=r.top+r.height/2-my,k=Math.max(0,1-Math.hypot(dx,dy)/230);c.style.transform=k>.01?'translateY('+(-k*16).toFixed(1)+'px) scale('+(1+k*.14).toFixed(3)+') rotate('+(dx*k*.02).toFixed(2)+'deg)':''});
    if(nx){var W=net.width,Hh=net.height,mxx=mx-hr.left,myy=my-hr.top;nx.clearRect(0,0,W,Hh);
      for(var i=0;i<dots.length;i++){var a=dots[i];a.x+=a.vx;a.y+=a.vy;if(a.x<0||a.x>W)a.vx*=-1;if(a.y<0||a.y>Hh)a.vy*=-1;
        nx.globalAlpha=.7;nx.fillStyle=a.c;nx.beginPath();nx.arc(a.x,a.y,1.8,0,6.283);nx.fill();
        for(var j=i+1;j<dots.length;j++){var b=dots[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<120){nx.globalAlpha=(1-d/120)*.26;nx.strokeStyle=a.c;nx.lineWidth=1;nx.beginPath();nx.moveTo(a.x,a.y);nx.lineTo(b.x,b.y);nx.stroke()}}
        var dm=Math.hypot(a.x-mxx,a.y-myy);if(dm<190){nx.globalAlpha=(1-dm/190)*.7;nx.strokeStyle='#fff';nx.beginPath();nx.moveTo(a.x,a.y);nx.lineTo(mxx,myy);nx.stroke();a.x+=(a.x-mxx)*.002;a.y+=(a.y-myy)*.002}}
      nx.globalAlpha=1}
  });

  /* marquees: speed reacts to scroll velocity */
  var mqs=$$('.mq').map(function(m){var row=$('.row',m);row.innerHTML+=row.innerHTML;return {row:row,dir:parseFloat(m.getAttribute('data-dir'))||-1,x:0,w:0}});
  function mw(){mqs.forEach(function(m){m.w=m.row.scrollWidth/2})}mw();addEventListener('resize',mw);addEventListener('load',mw);
  var lastY=scrollY,vel=0;
  loops.push(function(){var y=scrollY;vel+=((y-lastY)-vel)*.12;lastY=y;mqs.forEach(function(m){m.x+=m.dir*(1.1+Math.abs(vel)*.5)*(vel<0?-1:1)*(m.dir<0?1:1);if(m.w){if(m.x<=-m.w)m.x+=m.w;if(m.x>0)m.x-=m.w}m.row.style.transform='translate3d('+m.x+'px,0,0)'});
    var sk=clamp(vel*.05,-6,6);$$('.mq').forEach(function(q,k){q.style.setProperty('--sk',sk)})});

  /* manifesto word scrub */
  var man=$('#manifesto');
  if(man){var wd=man.innerHTML.replace(/<em>(.*?)<\/em>/g,function(m,x){return x.split(' ').map(function(w){return '<em class="mw">'+w+'</em>'}).join(' ')});man.innerHTML=wd;
    var txt=[];function walk(n){n.childNodes.forEach(function(c){if(c.nodeType===3){var f=D.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){f.appendChild(D.createTextNode(p))}else{var s=D.createElement('span');s.className='mw';s.textContent=p;f.appendChild(s)}});c.replaceWith(f)}else if(c.nodeType===1&&!c.classList.contains('mw'))walk(c)})}walk(man);
    var mws=$$('.mw',man);
    loops.push(function(){var r=man.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;var p=clamp((vh*.85-r.top)/(r.height+vh*.35),0,1),n=p*mws.length;for(var i=0;i<mws.length;i++){var o=clamp(n-i+.6,0,1);mws[i].style.opacity=(.4+.6*o).toFixed(2)}})}

  /* horizontal district gallery (sticky technique) */
  var hz=$('.hz'),hzt=$('.hz-track'),hzTop=0,dist=0;
  function layout(){if(!hz)return;if(vw<=860){hz.classList.remove('on');hz.style.height='';hzt.style.transform='';return}
    hz.classList.add('on');hzt.style.transform='';dist=Math.max(0,hzt.scrollWidth-vw);hz.style.height=(dist+vh)+'px';hzTop=hz.getBoundingClientRect().top+scrollY}
  layout();addEventListener('resize',layout);addEventListener('load',function(){layout();mw()});if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){layout();mw()});
  loops.push(function(){if(!hz||!hz.classList.contains('on'))return;var p=clamp((scrollY-hzTop)/Math.max(1,dist),0,1);hzt.style.transform='translate3d('+(-p*dist).toFixed(1)+'px,0,0)'});
  $$('.panel').forEach(function(p){p.addEventListener('focus',function(){if(!hz||!hz.classList.contains('on'))return;var target=hzTop+clamp((p.offsetLeft-parseFloat(getComputedStyle(hzt).paddingLeft))/Math.max(1,dist),0,1)*dist;if(lenis)lenis.scrollTo(target,{immediate:true});else scrollTo(0,target)})});

  /* counters */
  $$('[data-count]').forEach(function(c){var to=+c.getAttribute('data-count');c.textContent='0';c._fx=function(){var t0=performance.now();(function s(t){var k=clamp((t-t0)/1500,0,1),e=1-Math.pow(1-k,4);c.textContent=Math.round(to*e);if(k<1)requestAnimationFrame(s)})(t0)};io.observe(c)});

  /* big word reveal */
  var bw=$('.bigword');if(bw){bw.style.opacity='0';bw._fx=function(){bw.style.opacity='';bw.animate([{opacity:0,transform:'translateY(60%)',letterSpacing:'.1em'},{opacity:.95,transform:'none',letterSpacing:'-.07em'}],{duration:1600,easing:EASE,fill:'backwards'})};io.observe(bw)}
}
})();
