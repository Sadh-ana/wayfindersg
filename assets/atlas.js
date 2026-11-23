/* WayFinder SG v5 behaviour. Plain JS. Everything stays on this device. */
(function(){
'use strict';
var D=document, H=D.documentElement, B=D.body, ROOT=B.getAttribute('data-root')||'', WF=window.WF||{districts:[],guides:[],ideas:[],sources:[]};
var KEY='wf2.state', canStore=true;
function blank(){return {v:1,saved:[],tries:[],checks:{},route:null,motion:null,theme:'auto'}}
function load(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&s.v===1){var b=Object.assign(blank(),s);if(!Array.isArray(b.saved))b.saved=[];b.saved=b.saved.filter(function(x){return typeof x==='string'});if(!Array.isArray(b.tries))b.tries=[];b.tries=b.tries.filter(function(t){return t&&typeof t==='object'&&typeof t.title==='string'});return b}}catch(e){}return blank()}
var S=load();
try{localStorage.setItem('wf2.t','1');localStorage.removeItem('wf2.t')}catch(e){canStore=false}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){canStore=false}}
function $(s,r){return (r||D).querySelector(s)} function $$(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))}
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(m){var t=D.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=m;B.appendChild(t);setTimeout(function(){t.remove()},2200)}
function uid(){return 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function copy(text,fallbackEl){
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){toast('Copied')},function(){sel()})}else sel();
  function sel(){if(fallbackEl){var r=D.createRange();r.selectNodeContents(fallbackEl);var g=getSelection();g.removeAllRanges();g.addRange(r);toast('Selected. Press copy on your keyboard.')}}
}

/* motion + theme */
function applyPrefs(){
  var m=S.motion||(matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full');
  H.setAttribute('data-motion',m);
  if(S.theme==='auto')H.removeAttribute('data-theme');else H.setAttribute('data-theme',S.theme);
  $$('input[name="motion"]').forEach(function(i){i.checked=(i.value===m)});
  $$('input[name="theme"]').forEach(function(i){i.checked=(i.value===S.theme)});
}
applyPrefs();
$$('input[name="motion"]').forEach(function(i){i.addEventListener('change',function(){S.motion=i.value;save();applyPrefs()})});
$$('input[name="theme"]').forEach(function(i){i.addEventListener('change',function(){S.theme=i.value;save();applyPrefs()})});

/* theme toggle: dark (default) or light */
var tb=$('#theme-btn');
function paintTheme(){if(!tb)return;var light=S.theme==='light';tb.setAttribute('aria-label',light?'Switch to dark theme':'Switch to light theme');tb.setAttribute('data-mode',light?'light':'dark');var t=$('.tb-t',tb);if(t)t.textContent=light?'Dark':'Light';var m=$('meta[name="theme-color"]');if(m)m.setAttribute('content',light?'#F6F0E3':'#070A11')}
if(tb){paintTheme();tb.addEventListener('click',function(){H.classList.add('theme-fade');S.theme=S.theme==='light'?'dark':'light';save();applyPrefs();paintTheme();setTimeout(function(){H.classList.remove('theme-fade')},450)})}
/* nav + settings */
var mb=$('.menu-btn'),nav=$('.nav'),sb=$('#settings-btn'),sp=$('#settings');
if(mb&&nav)mb.addEventListener('click',function(){var o=nav.getAttribute('data-open')!=='true';nav.setAttribute('data-open',o);mb.setAttribute('aria-expanded',o)});
if(sb&&sp)sb.addEventListener('click',function(){var o=sp.getAttribute('data-open')!=='true';sp.setAttribute('data-open',o);sb.setAttribute('aria-expanded',o)});
D.addEventListener('keydown',function(e){if(e.key==='Escape'){if(sp&&sp.getAttribute('data-open')==='true'){sp.setAttribute('data-open','false');sb.setAttribute('aria-expanded','false');sb.focus()}if(nav&&nav.getAttribute('data-open')==='true'){nav.setAttribute('data-open','false');mb.setAttribute('aria-expanded','false');mb.focus()}}});

/* reveal */
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});$$('.reveal').forEach(function(el){io.observe(el)})}else $$('.reveal').forEach(function(el){el.classList.add('in')});

/* saved guides / try list buttons */
function guide(slug){return WF.guides.filter(function(g){return g.slug===slug})[0]}
function idea(id){return WF.ideas.filter(function(g){return g.id===id})[0]}
function syncSave(){
  $$('[data-save-guide]').forEach(function(b){var on=S.saved.indexOf(b.getAttribute('data-save-guide'))>-1;b.setAttribute('aria-pressed',on);b.textContent=on?'Saved to My Wayfinder':(b.getAttribute('data-label')||'Save guide')});
  $$('[data-try-add]').forEach(function(b){var id=b.getAttribute('data-try-add');var on=S.tries.some(function(t){return t.id===id});b.setAttribute('aria-pressed',on);b.textContent=on?'In my list':'Add to my list'});
}
D.addEventListener('click',function(e){
  var b=e.target.closest('[data-save-guide]');
  if(b){var s=b.getAttribute('data-save-guide'),i=S.saved.indexOf(s);if(i>-1){S.saved.splice(i,1);toast('Removed from My Wayfinder')}else{S.saved.push(s);toast(canStore?'Saved on this device':'Saved for this visit only')}save();syncSave();return}
  b=e.target.closest('[data-try-add]');
  if(b){var id=b.getAttribute('data-try-add'),j=-1;S.tries.forEach(function(t,k){if(t.id===id)j=k});if(j>-1){S.tries.splice(j,1);toast('Removed from your list')}else{var it=idea(id);S.tries.push({id:id,title:it?it.title:id,status:'curious',added:Date.now()});toast('Added to your list')}save();syncSave();return}
});
window.addEventListener('storage',function(e){if(e.key===KEY){S=load();applyPrefs();syncSave();if(B.dataset.page==='my')renderMy()}});
syncSave();

/* checklists (saved locally, no personal data) */
function initChecklists(){
  $$('[data-ck]').forEach(function(box){
    var id=box.getAttribute('data-ck'),items=$$('input[data-item]',box),have=S.checks[id]||[];
    items.forEach(function(i){i.checked=have.indexOf(i.getAttribute('data-item'))>-1;i.addEventListener('change',function(){var arr=items.filter(function(x){return x.checked}).map(function(x){return x.getAttribute('data-item')});S.checks[id]=arr;save();prog()})});
    function prog(){var n=items.filter(function(x){return x.checked}).length,p=$('.prog i',box),t=$('.ptxt',box);if(p)p.style.width=(items.length?n/items.length*100:0)+'%';if(t)t.textContent=n+' of '+items.length+' done'+(canStore?'':' (not saved in this browser)')}
    prog();
    var r=$('[data-reset]',box);if(r)r.addEventListener('click',function(){items.forEach(function(x){x.checked=false});S.checks[id]=[];save();prog()});
  });
}
initChecklists();

/* cheque lab */
(function(){
  var f=$('#cheque-lab');if(!f)return;
  var ones='zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' '),tens=',,twenty,thirty,forty,fifty,sixty,seventy,eighty,ninety'.split(',');
  function w(n){if(n<20)return ones[n];if(n<100)return tens[Math.floor(n/10)]+(n%10?'-'+ones[n%10]:'');if(n<1000)return ones[Math.floor(n/100)]+' hundred'+(n%100?' '+w(n%100):'');return w(Math.floor(n/1000))+' thousand'+(n%1000?' '+w(n%1000):'')}
  var M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var pay=$('#ch-payee'),amt=$('#ch-amt'),dt=$('#ch-date'),cr=$('#ch-cross'),err=$('#ch-err');
  function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
  if(!dt.value)dt.value=today();
  function run(){
    var raw=amt.value.trim(),c=Math.round(parseFloat(raw)*100),ok=raw!==''&&isFinite(c)&&c>0&&c<=99999999,words='',fig='';
    err.textContent=raw!==''&&!ok?'Enter an amount between 0.01 and 999,999.99.':'';
    if(ok){var d=Math.floor(c/100),ce=c%100,a=[];if(d>0)a.push(w(d)+(d===1?' dollar':' dollars'));if(ce>0)a.push(w(ce)+(ce===1?' cent':' cents'));words=a.join(' and ')+' only';words=words.charAt(0).toUpperCase()+words.slice(1);fig='$'+(c/100).toLocaleString('en-SG',{minimumFractionDigits:2,maximumFractionDigits:2})}
    var p=dt.value?dt.value.split('-'):null,ds=p?(+p[2])+' '+M[+p[1]-1]+' '+p[0]:'';
    $('#ch-o-date').textContent=ds;$('#ch-o-pay').textContent=pay.value.trim()||'';$('#ch-o-words').textContent=words;$('#ch-o-fig').textContent=fig;
    var cx=cr.value==='1';$('.cross',f).hidden=!cx;$('#ch-o-bearer').classList.toggle('bearer',cx);
    var post=dt.value&&dt.value>today();
    var L=[[pay.value.trim().length>1,'Payee filled in with the full name as it appears in the recipient’s bank records.'],[ok,'Amount written in words and figures, and they match.'],[!!dt.value,'Dated.'],[true,'Crossing is your choice: crossed means payable into an account, not cash over the counter.'+(cx?' (Crossed.)':'')],[false,'Sign the way your signature appears in your bank’s records. (Not drawn here on purpose.)']];
    $('#ch-checks').innerHTML=L.map(function(x){return '<li class="'+(x[0]?'ok':'')+'">'+esc(x[1])+'</li>'}).join('');
    $('#ch-note').textContent=post?'This date is in the future, so it is post-dated. POSB says a post-dated cheque is deposited on or after the date written on it.':'';
  }
  ['input','change'].forEach(function(ev){f.addEventListener(ev,run)});run();
})();

/* budget (never saved) */
(function(){
  var f=$('#budget-lab');if(!f)return;
  var cols=['#C8573A','#A67A00','#2F7A5A','#7A4B8C','#2B5F9E','#B5541C','#6b6b6b','#b0446a'];
  function num(i){var v=parseFloat(i.value);return isFinite(v)&&v>0?v:0}
  function run(){
    var inc=0,exp=0,parts=[];
    $$('.bi',f).forEach(function(i){inc+=num(i)});
    $$('.be',f).forEach(function(i,k){var v=num(i);exp+=v;parts.push([i.getAttribute('data-name'),v,cols[k%cols.length]])});
    var gap=inc-exp,fmt=function(x){return '$'+Math.abs(x).toLocaleString('en-SG',{minimumFractionDigits:0,maximumFractionDigits:2})};
    var out=$('#bud-out'),msg;
    if(inc===0&&exp===0)msg='Add what comes in and what goes out. Nothing here is saved or sent anywhere.';
    else if(inc===0)msg='You have entered spending of '+fmt(exp)+' but no income yet.';
    else if(gap<0)msg='Spending is '+fmt(gap)+' above income. Look at your biggest line first, and check whether it is a one-off or monthly.';
    else{var pc=Math.round(gap/inc*100);msg='About '+fmt(gap)+' is left each month, roughly '+pc+'% of income. MoneySense’s checklist suggests saving at least 20%. If you are below that, treat it as a target to work towards.'}
    out.textContent=msg;
    var base=Math.max(inc,exp)||1;
    $('#bud-bar').innerHTML=parts.filter(function(p){return p[1]>0}).map(function(p){return '<i style="width:'+(p[1]/base*100)+'%;background:'+p[2]+'" title="'+esc(p[0])+'"></i>'}).join('');
    $('#bud-list').innerHTML=parts.filter(function(p){return p[1]>0}).sort(function(a,b){return b[1]-a[1]}).map(function(p){return '<li><span class="dot" style="--c:'+p[2]+'"></span> '+esc(p[0])+': '+fmt(p[1])+(inc?' ('+Math.round(p[1]/inc*100)+'% of income)':'')+'</li>'}).join('');
  }
  f.addEventListener('input',run);run();
})();

/* payslip decoder */
(function(){
  var box=$('#pay-lab');if(!box)return;
  var defs=JSON.parse(box.getAttribute('data-defs')||'{}'),out=$('#pay-def',box),btns=$$('button[data-d]',box);
  btns.forEach(function(b){b.addEventListener('click',function(){btns.forEach(function(x){x.setAttribute('aria-pressed','false')});b.setAttribute('aria-pressed','true');out.textContent=defs[b.getAttribute('data-d')]||''})});
})();

/* agreement builder (never saved) */
(function(){
  var f=$('#agree-lab');if(!f)return;
  var out=$('#agree-out'),go=$('#agree-go'),cp=$('#agree-copy');
  go.addEventListener('click',function(){
    var d=new Date().toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'}),L=['Our room agreement (draft, '+d+')',''];
    $$('textarea[data-topic]',f).forEach(function(t){if(t.value.trim())L.push(t.getAttribute('data-topic')+': '+t.value.trim())});
    L.push('','We will review this after two weeks, and any time something is not working.');
    out.textContent=L.join('\n');cp.hidden=false;
  });
  cp.addEventListener('click',function(){copy(out.textContent,out)});
})();

/* search normalisation */
var SYN={check:'cheque',checks:'cheque',hostel:'dorm',hall:'dorm',college:'dorm',university:'dorm',doctor:'gp',doctors:'gp',clinic:'polyclinic',taxes:'tax',scammed:'scam',scams:'scam',roommates:'roommate',flatmate:'roommate',flatmates:'roommate',lonely:'friends',sad:'mental',anxious:'anxiety',job:'payslip',salary:'payslip',freelancing:'freelance',stocks:'invest',investing:'invest',savings:'save',docs:'documents',paperwork:'documents',ic:'id',nric:'id'};
function norm(s){return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ')}
function toks(q){return norm(q).split(/\s+/).filter(Boolean).map(function(t){return SYN[t]||t})}
function lev1(a,b){if(Math.abs(a.length-b.length)>1)return false;var i=0,j=0,e=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++}else{if(++e>1)return false;if(a.length>b.length)i++;else if(a.length<b.length)j++;else{i++;j++}}}return e+(a.length-i)+(b.length-j)<=1}
function score(doc,ts){var total=0;for(var k=0;k<ts.length;k++){var t=ts[k],s=0;
  if(doc.title.indexOf(t)>-1)s+=5;if(doc.tags.indexOf(t)>-1)s+=4;if(doc.dek.indexOf(t)>-1)s+=2;if(doc.text.indexOf(t)>-1)s+=1;
  if(!s&&t.length>=4){var ws=(doc.title+' '+doc.tags).split(' ');for(var m=0;m<ws.length;m++)if(ws[m].length>=3&&lev1(t,ws[m])){s+=3;break}}
  if(!s)return 0;total+=s}return total}

/* guides page */
(function(){
  if(B.dataset.page!=='guides')return;
  var q=$('#q'),cards=$$('[data-guide]'),chips=$$('[data-district-chip]'),count=$('#count'),side=$('#side'),dist='all';
  var gdocs=WF.guides.map(function(g){return {g:g,title:norm(g.title),tags:norm(g.tags.join(' ')),dek:norm(g.dek),text:norm(g.text)}});
  var idocs=WF.ideas.map(function(g){return {g:g,title:norm(g.title),tags:norm(g.cat),dek:norm(g.invitation),text:norm(g.firstMove)}});
  function run(){
    var ts=toks(q.value),shown=0,order={};
    if(ts.length)gdocs.forEach(function(d){order[d.g.slug]=score(d,ts)});
    cards.forEach(function(c){var slug=c.getAttribute('data-guide'),dd=c.getAttribute('data-district');var ok=(dist==='all'||dd===dist)&&(!ts.length||order[slug]>0);c.hidden=!ok;if(ok)shown++;c.style.order=ts.length?(1000-(order[slug]||0)):0});
    count.textContent=shown+(shown===1?' guide':' guides')+(ts.length?' match':'');
    $('#none').hidden=shown>0;
    var html='';
    if(ts.length){
      var ir=idocs.map(function(d){return [score(d,ts),d.g]}).filter(function(x){return x[0]>0}).sort(function(a,b){return b[0]-a[0]}).slice(0,4);
      var sr=WF.sources.filter(function(s){var t=norm(s.title+' '+s.publisher);return ts.some(function(x){return t.indexOf(x)>-1})}).slice(0,4);
      if(ir.length)html+='<h2>Things to try</h2><ul>'+ir.map(function(x){return '<li><a href="'+ROOT+'try/index.html#'+x[1].id+'">'+esc(x[1].title)+'</a> <span class="muted">'+esc(x[1].cat)+'</span></li>'}).join('')+'</ul>';
      if(sr.length)html+='<h2>Official pages</h2><ul>'+sr.map(function(s){return '<li><a href="'+esc(s.url)+'" rel="noopener" target="_blank">'+esc(s.title)+'</a> <span class="muted">'+esc(s.publisher)+'</span></li>'}).join('')+'</ul>';
    }
    side.innerHTML=html;
  }
  q.addEventListener('input',run);
  chips.forEach(function(c){c.addEventListener('click',function(){dist=c.getAttribute('data-district-chip');chips.forEach(function(x){x.setAttribute('aria-pressed',x===c)});run()})});
  var p=new URLSearchParams(location.search);if(p.get('q')){q.value=p.get('q')}
  if(p.get('d')){var c=chips.filter(function(x){return x.getAttribute('data-district-chip')===p.get('d')})[0];if(c)c.click()}
  run();
})();

/* try page */
(function(){
  if(B.dataset.page!=='try')return;
  var chips=$$('[data-cat-chip]'),cards=$$('[data-idea]'),cat='all',cnt=$('#tcount');
  function run(){var n=0;cards.forEach(function(c){var ok=cat==='all'||c.getAttribute('data-cat')===cat;c.hidden=!ok;if(ok)n++});cnt.textContent=n+' ideas'}
  chips.forEach(function(c){c.addEventListener('click',function(){cat=c.getAttribute('data-cat-chip');chips.forEach(function(x){x.setAttribute('aria-pressed',x===c)});run()})});
  $('#surprise').addEventListener('click',function(){var vis=cards.filter(function(c){return !c.hidden});var c=vis[Math.floor(Math.random()*vis.length)];c.scrollIntoView({behavior:H.getAttribute('data-motion')==='full'?'smooth':'auto',block:'center'});c.style.outline='3px solid var(--signal)';c.setAttribute('tabindex','-1');c.focus({preventScroll:true});setTimeout(function(){c.style.outline=''},2400)});
  run();
})();

/* home: route picker */
(function(){
  var host=$('#picker');if(!host)return;
  var Q=[
   {k:'stage',t:'Where are you in the move?',o:[['packing','Packing soon','Before the move'],['arrived','Just arrived','First week in a new place'],['settling','Settling in','A few weeks in, sorting things out'],['other','Not moving, just adulting','Money, forms, health, people']]},
   {k:'need',t:'What would help most right now?',o:[['do','Know what to do next',''],['paper','Sort the paperwork',''],['money','Understand money',''],['people','Feel less on my own',''],['try','Something to try','']]},
   {k:'time',t:'How much time have you got?',o:[['2','Two minutes',''],['10','Ten minutes',''],['long','A proper sit-down','']]}];
  var A={},step=0,skip=0;
  function mins(it){var m=/(\d+)/.exec(it.timeLabel);if(!m)return 99;var n=+m[1];return /hour/.test(it.timeLabel)?n*60:n}
  function pickIdea(){
    var catMap={do:['Care','Move'],paper:['Learn'],money:['Learn'],people:['Connect'],try:['Create','Move']},cats=catMap[A.need]||['Care'],lim=A.time==='2'?5:A.time==='10'?15:9999;
    var pool=WF.ideas.filter(function(i){return cats.indexOf(i.cat)>-1&&mins(i)<=lim});if(!pool.length)pool=WF.ideas.filter(function(i){return cats.indexOf(i.cat)>-1});
    return pool[skip%pool.length]}
  function pickGuide(){
    var n=A.need,s=A.stage;
    if(n==='paper')return guide(s==='other'?'tax-find-out':'keep-your-papers');
    if(n==='money')return guide(s==='other'?'payslip-words':'student-budget');
    if(n==='people')return guide('first-move-social');
    if(n==='try')return guide('keep-an-activity');
    return guide({packing:'dorm-move-in',arrived:'first-week-reset',settling:'shared-room-agreements',other:'keep-your-papers'}[s]||'keep-your-papers')}
  function draw(){
    if(step<Q.length){var q=Q[step];
      host.innerHTML='<div class="step">'+(step+1)+' of '+Q.length+'</div><h3 id="pq" tabindex="-1">'+esc(q.t)+'</h3><div class="opts">'+q.o.map(function(o){return '<button class="opt" data-v="'+o[0]+'">'+esc(o[1])+(o[2]?'<small>'+esc(o[2])+'</small>':'')+'</button>'}).join('')+'</div>'+(step?'<p style="margin-top:14px"><button class="btn ghost sm" data-back>Back</button></p>':'');
      $$('.opt',host).forEach(function(b){b.addEventListener('click',function(){A[q.k]=b.getAttribute('data-v');step++;skip=0;draw();$('#pq')&&$('#pq').focus({preventScroll:true})})});
      var bk=$('[data-back]',host);if(bk)bk.addEventListener('click',function(){step--;draw()});
    }else{
      S.route={stage:A.stage,need:A.need};save();
      var g=pickGuide(),it=pickIdea(),d=WF.districts.filter(function(x){return x.id===g.district})[0];
      host.innerHTML='<div class="step">Your starting point</div><h3 id="pq" tabindex="-1">Three small steps, in this order.</h3><div class="result">'+
       '<div class="card edge" style="--c:'+d.accent+'"><span class="k">1 · Do first</span><p style="color:var(--ink)">'+esc(g.action)+'</p><div class="actions"><button class="btn sm ghost" data-save-guide="'+g.slug+'" data-label="Save this guide">Save this guide</button></div></div>'+
       '<div class="card edge" style="--c:'+d.accent+'"><span class="k">2 · Read this</span><h3><a href="'+ROOT+'guides/'+g.slug+'/index.html">'+esc(g.title)+'</a></h3><p>'+esc(g.dek)+'</p></div>'+
       '<div class="card edge" style="--c:var(--signal)"><span class="k">3 · Try this</span><h3>'+esc(it.title)+'</h3><p>'+esc(it.invitation)+'</p><p><b>First move:</b> '+esc(it.firstMove)+'</p><div class="actions"><button class="btn sm ghost" data-try-add="'+it.id+'">Add to my list</button><button class="btn sm ghost" data-another>Another idea</button></div></div></div>'+
       (A.need==='people'?'<p class="small muted" style="margin-top:16px">If it feels heavier than loneliness, <a href="'+ROOT+'guides/mind-support-pathways/index.html">this guide lists who to talk to</a>.</p>':'')+
       '<p style="margin-top:18px"><button class="btn ghost sm" data-restart>Start again</button></p>';
      syncSave();
      $('[data-restart]',host).addEventListener('click',function(){A={};step=0;draw()});
      $('[data-another]',host).addEventListener('click',function(){skip++;draw()});
      var h=$('#pq');if(h)h.focus({preventScroll:true});
    }}
  draw();
  $$('[data-open-picker]').forEach(function(a){a.addEventListener('click',function(){setTimeout(function(){var h=$('#pq');if(h)h.focus()},50)})});
  $$('.route .stop').forEach(function(s){function show(){var c=$('#route-cap');if(c)c.textContent=s.getAttribute('data-cap')}s.addEventListener('click',show);s.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}});s.addEventListener('mouseenter',show)});
})();

/* my wayfinder */
function renderMy(){
  var root=$('#my');if(!root)return;
  var sv=S.saved.map(guide).filter(Boolean);
  $('#my-saved').innerHTML=sv.length?sv.map(function(g){return '<li class="card edge" style="--c:'+(WF.districts.filter(function(d){return d.id===g.district})[0]||{}).accent+'"><h3><a href="'+ROOT+'guides/'+g.slug+'/index.html">'+esc(g.title)+'</a></h3><p>'+esc(g.dek)+'</p><div class="actions"><button class="btn sm ghost" data-save-guide="'+g.slug+'">Remove</button></div></li>'}).join(''):'<li class="empty" style="list-style:none">Nothing saved yet. Save a guide and it will show up here. <a href="'+ROOT+'guides/index.html">Browse guides</a></li>';
  var st={curious:'Curious',trying:'Trying',paused:'Paused',done:'Done for now',no:'Not for me'};
  $('#my-tries').innerHTML=S.tries.length?S.tries.map(function(t,i){var it=idea(t.id);return '<li class="card"><h3>'+esc(t.title)+'</h3>'+(it?'<p>'+esc(it.firstMove)+'</p>':'<p class="muted">Your own idea</p>')+'<div class="actions"><label class="vh" for="s'+i+'">Status for '+esc(t.title)+'</label><select id="s'+i+'" data-i="'+i+'" style="width:auto">'+Object.keys(st).map(function(k){return '<option value="'+k+'"'+(t.status===k?' selected':'')+'>'+st[k]+'</option>'}).join('')+'</select><button class="btn sm ghost" data-rm="'+i+'">Remove</button></div></li>'}).join(''):'<li class="empty" style="list-style:none">Your list is empty. <a href="'+ROOT+'try/index.html">Find something to try</a>, or add your own below.</li>';
  $$('#my-tries select').forEach(function(s){s.addEventListener('change',function(){S.tries[+s.getAttribute('data-i')].status=s.value;save()})});
  $$('#my-tries [data-rm]').forEach(function(b){b.addEventListener('click',function(){S.tries.splice(+b.getAttribute('data-rm'),1);save();renderMy();syncSave()})});
  syncSave();
  var r=$('#my-route');if(r)r.textContent=S.route?'Last starting point: stage “'+S.route.stage+'”, need “'+S.route.need+'”.':'No starting point chosen yet.';
  var w=$('#store-warn');if(w)w.hidden=canStore;
}
if(B.dataset.page==='my'){
  var af=$('#add-try');if(af)af.addEventListener('submit',function(e){e.preventDefault();var i=$('#add-title'),v=i.value.trim().slice(0,120);if(!v)return;S.tries.push({id:uid(),title:v,status:'curious',added:Date.now(),custom:true});save();i.value='';renderMy();toast('Added')});
  var ex=$('#export');if(ex)ex.addEventListener('click',function(){var o=$('#export-out');o.hidden=false;o.value=JSON.stringify(S,null,2);o.focus();o.select()});
  var c1=$('#clear'),c2=$('#clear-yes'),c3=$('#clear-no'),cb=$('#clear-box');
  if(c1){c1.addEventListener('click',function(){cb.hidden=false;c1.hidden=true;c3.focus()});c3.addEventListener('click',function(){cb.hidden=true;c1.hidden=false;c1.focus()});
    c2.addEventListener('click',function(){var m=S.motion,t=S.theme;S=blank();S.motion=m;S.theme=t;save();cb.hidden=true;c1.hidden=false;renderMy();$$('[data-ck]').forEach(function(){});toast('Everything saved here has been cleared')})}
  renderMy();
}
})();
