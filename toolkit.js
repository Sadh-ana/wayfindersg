/* WayFinder SG toolkit. Everything runs in the browser. Nothing is sent anywhere. */
(function(){
'use strict';
var W=window.WF,$=W.$,$$=W.$$,esc=W.esc,icon=W.icon,still=W.still,hasG=W.hasG;
var stage=$('#stage'),rail=$('#rail'),toastEl=$('#toast'),toastT=0;
function toast(m){toastEl.innerHTML=icon('stamp')+'<span>'+esc(m)+'</span>';toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},3200)}
function earn(id,label){if(W.stamp(id))toast('Stamp earned: '+label)}
function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem('wfsg.tk.'+k)||'null');localStorage.setItem('wfsg.tk.'+k,JSON.stringify(v))}catch(e){return null}}
function money(n){return '$'+Math.round(n).toLocaleString('en-SG')}
function copyText(txt,btn){
 function sel(){var ta=document.createElement('textarea');ta.value=txt;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:-999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(ta)}
 try{navigator.clipboard.writeText(txt).then(function(){btn.textContent='Copied'},function(){sel();btn.textContent='Copied'})}catch(e){sel();btn.textContent='Copied'}
}
function head(t,tool,d){
 return '<button class="back" type="button" data-go="all">'+icon('back')+'All tools</button><div class="ph-head"><h2>'+esc(t)+'</h2><div class="meta"><span class="chip" style="background:var(--l-'+tool.line+');color:var(--on-'+tool.line+')">'+esc({safety:'Safety',money:'Money',housing:'Housing',work:'Work',docs:'Documents'}[tool.line])+'</span><span class="mono mute">'+esc(tool.m)+'</span><a class="mono mute" href="app.html#corrections">Report a problem</a></div></div>'+(d?'<p style="max-width:56ch;margin:-8px 0 24px;font-size:1.12rem">'+esc(d)+'</p>':'');
}

/* ---------- scam inbox ---------- */
var MSGS=[
 {
  "f": "Chloe | Talent Team",
  "t": "Mon 11:20",
  "x": "Hi! We saw your profile. Remote tasks, 15 minutes a day, $120 to $300 daily. No experience, no fees. Want to see how it works?",
  "s": 1,
  "pat": "Unsolicited job, big pay",
  "why": "You did not apply anywhere. Police describe unsolicited messages as how the task-job scams start, and the pay is far above what 15 minutes of tapping is worth.",
  "act": "Do not reply. Check the number on the ScamShield app or on 1799, then block it."
 },
 {
  "f": "Singpass",
  "t": "Mon 14:02",
  "x": "(You just tapped Log in on a government site.) Your OTP is 482913. Do not share it with anyone.",
  "s": 0,
  "why": "You started the login yourself a minute ago, it asks you to do nothing except use the code on the page you opened, and it tells you not to share it. A code you did not ask for is the dangerous one.",
  "act": "Use it on the page you opened. If it arrives when you did not log in, do not use it and check your account through the official app."
 },
 {
  "f": "@lena.tix",
  "t": "Tue 00:41",
  "x": "Selling 2 x Cat 2, $380 each (face $298). Can't go anymore :( PayNow only, can't meet, I'm in JB. I'll transfer to ur Ticketmaster after.",
  "s": 1,
  "pat": "Resale from a stranger",
  "why": "Police warned in June 2026 about fake concert ticket listings on X, Instagram and Carousell paid by PayNow. For that event the organiser's terms said tickets cannot be transferred or resold, so even an honest seller could not give you a usable one.",
  "act": "Read the organiser's terms. Buy only from authorised sellers. If you already paid, call your bank first, then 1799."
 },
 {
  "f": "Ryan",
  "t": "Tue 13:15",
  "x": "bro can u PayNow me $14 for lunch yesterday, forgot to ask",
  "s": 0,
  "why": "It is from a saved contact, about something that really happened, for a small amount, and it asks for nothing else. If your friend's number had changed and the message came from a stranger, it would be a different message.",
  "act": "Pay it, or ask him to remind you what you ordered."
 },
 {
  "f": "DBS Alert",
  "t": "Wed 08:30",
  "x": "Unusual login on your account. Call 6xxx xxxx now to verify or it will be locked within 24h.",
  "s": 1,
  "pat": "Same trick, no link",
  "why": "No link this time, so it feels safer. It still invents a deadline and wants you to call a number it chose. Look for the pressure, not only for the link.",
  "act": "Do not call that number. Open the bank's official app or call the number on the back of your card."
 },
 {
  "f": "Agent (room)",
  "t": "Wed 19:15",
  "x": "5 months ok no problem!! $620 room near campus. 3 others interested. PayNow $620 now to hold, viewing after.",
  "s": 1,
  "pat": "Pay before viewing",
  "why": "Pay-first, view-after, plus other people to rush you. Also check the rules: CEA says an HDB bedroom rental has a 6-month minimum, so a 5-month room is already suspicious.",
  "act": "Do not pay. Ask what kind of property it is, and insist on a viewing and the tenancy agreement first."
 },
 {
  "f": "HR Portal",
  "t": "Thu 09:00",
  "x": "Your October payslip is ready. Log in to the HR portal to view it.",
  "s": 0,
  "why": "You expected it, it names a system you actually use, and it asks for no money or code. It is real. Even so, the safest habit is to open the portal yourself instead of using any link in a message.",
  "act": "Open the portal from your own bookmark, not from the message."
 },
 {
  "f": "Zhi Hao",
  "t": "Thu 22:30",
  "x": "bro can PayNow $2,800 to ur account? u just transfer to my supplier. u keep $200 for ur trouble",
  "s": 1,
  "pat": "Money mule request",
  "why": "A friend is asking you to receive money and send it on for a cut. Police have charged people for letting others use their bank accounts, and one named offence carries up to 3 years' jail. It does not matter that he is a friend.",
  "act": "Say no. Suggest he asks his own bank to raise his limit. Keep the messages."
 },
 {
  "f": "+65 9xxx xxxx",
  "t": "Fri 20:48",
  "x": "Hey, I think we matched on Hinge but I'm travelling so I moved to WhatsApp. Honestly I've been making $4k a week trading crypto, I can show you.",
  "s": 1,
  "pat": "Friendly stranger plus money",
  "why": "General orientation: a new person who is warm, quickly moves you to another app and brings up easy money is a familiar pattern. You do not need to be sure it is a scam to stop.",
  "act": "Do not send money or install anything they suggest. Check with 1799 if unsure."
 },
 {
  "f": "Mum",
  "t": "Sat 08:10",
  "x": "Eat first before you go out. Did you take your keys?",
  "s": 0,
  "why": "Someone you know asks a normal question. No link, no money, no code. Not everything is a scam, and the skill is spotting the pattern, not distrusting everyone.",
  "act": "Reply as normal."
 }
];
function buildInbox(el,tool){
 var i=0,res=[],busy=false;
 el.innerHTML=head('Scam Inbox',tool,'Ten messages land over one week. Some are real. Swipe the card left for scam or right for real, or use the buttons. Then see why.')+'<div class="cols"><div><div class="dots" id="ib-d" aria-hidden="true"></div><div class="deck" id="ib-deck"></div><div class="ctl"><button class="btn red" type="button" id="ib-s">'+icon('alert')+'Scam</button><button class="btn" type="button" id="ib-r" style="background:var(--l-docs);color:var(--on-docs)">'+icon('check')+'Real</button></div><p class="warn" style="margin-top:12px">Fictional messages. Drag the card, or focus it and press the left or right arrow key.</p></div><div id="ib-x" class="stack" aria-live="polite"><div class="box"><strong>How this works</strong><span>Decide in a few seconds, like you would on your phone. Nothing is graded. At the end you see which pattern got through.</span></div></div></div>';
 function dots(){$('#ib-d').innerHTML=MSGS.map(function(m,k){return '<i class="'+(res[k]===undefined?(k===i?'on':''):(res[k].ok?'ok':'no'))+'"></i>'}).join('')}
 function card(){
  var m=MSGS[i];$('#ib-deck').innerHTML='<div class="card" id="ib-c" tabindex="0" role="group" aria-label="Message '+(i+1)+' of '+MSGS.length+' from '+esc(m.f)+'" data-cursor="Drag"><span class="lbl l">SCAM</span><span class="lbl r">REAL</span><div class="who"><span class="chip" style="background:var(--ink);color:var(--bg)">'+esc(m.f)+'</span><span class="mono mute">'+esc(m.t)+'</span></div><p class="body">'+esc(m.x)+'</p></div>';
  bind($('#ib-c'));dots();busy=false;$('#ib-s').disabled=$('#ib-r').disabled=false;
  if(hasG&&!still())gsap.from('#ib-c',{y:30,rotate:3,opacity:0,duration:.45,ease:'power3.out'});
 }
 function verdict(sayScam,fling){
  if(busy)return;busy=true;var m=MSGS[i],ok=!!m.s===!!sayScam;res[i]={ok:ok,m:m,said:sayScam};
  $('#ib-s').disabled=$('#ib-r').disabled=true;
  var c=$('#ib-c');if(c)c.style.pointerEvents='none';if(c&&fling&&!still()){c.style.transition='transform .3s,opacity .3s';c.style.transform='translate('+(sayScam?-520:520)+'px,30px) rotate('+(sayScam?-18:18)+'deg)';c.style.opacity='0'}
  else if(c){c.style.opacity='.35'}
  var last=i===MSGS.length-1;
  $('#ib-x').innerHTML='<div class="box '+(ok?'good':'alert')+'"><strong>'+(ok?'Right call.':'Not quite.')+' This one is '+(m.s?'a scam.':'real.')+'</strong><span>'+esc(m.why)+'</span><span><b>What to do:</b> '+esc(m.act)+'</span></div><button class="btn red" type="button" id="ib-n">'+(last?'See my week':'Next message')+icon('arrow')+'</button>';
  dots();$('#ib-n').focus({preventScroll:true});
  if(innerWidth<=860)setTimeout(function(){$('#ib-x').scrollIntoView({block:'start',behavior:still()?'auto':'smooth'})},60);
  $('#ib-n').addEventListener('click',function(){if(last)done();else{i++;$('#ib-x').innerHTML='<div class="box"><strong>Next</strong><span>Check who sent it, what it wants, and how fast.</span></div>';card();if(innerWidth<=860)$('#ib-d').scrollIntoView({block:'start',behavior:still()?'auto':'smooth'})}});
 }
 function bind(c){
  var sx=0,dx=0,on=false;
  c.addEventListener('pointerdown',function(e){if(busy||(e.pointerType==='mouse'&&e.button!==0))return;on=true;sx=e.clientX;dx=0;c.style.transition='none';try{c.setPointerCapture(e.pointerId)}catch(x){}});
  c.addEventListener('pointermove',function(e){if(!on)return;dx=e.clientX-sx;c.style.transform='translate('+dx+'px,0) rotate('+dx/22+'deg)';$('.lbl.l',c).style.opacity=Math.min(1,Math.max(0,-dx/90));$('.lbl.r',c).style.opacity=Math.min(1,Math.max(0,dx/90))});
  function end(){if(!on)return;on=false;if(Math.abs(dx)>100)verdict(dx<0,true);else{c.style.transition=still()?'none':'transform .3s var(--ease)';c.style.transform='';$('.lbl.l',c).style.opacity=0;$('.lbl.r',c).style.opacity=0}}
  c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
  c.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();verdict(true,true)}else if(e.key==='ArrowRight'){e.preventDefault();verdict(false,true)}});
 }
 function done(){
  var good=res.filter(function(r){return r.ok}).length,missed=res.filter(function(r){return !r.ok&&r.m.s}),fa=res.filter(function(r){return !r.ok&&!r.m.s}).length,t={};
  missed.forEach(function(r){t[r.m.pat]=(t[r.m.pat]||0)+1});var keys=Object.keys(t);
  el.innerHTML=head('Your week',tool)+'<div class="cols"><div class="stack"><p class="big">'+good+' of '+MSGS.length+' right.</p>'+
  (keys.length?'<div class="box"><strong>The pattern that got through</strong><div class="tally">'+keys.map(function(k){return '<div><b>'+esc(k)+'</b><i style="width:'+(t[k]*60)+'px"></i><span>'+t[k]+'</span></div>'}).join('')+'</div></div>':'<div class="box good"><strong>Nothing got past you.</strong><span>Keep checking through a channel you found yourself. It still works when the scam looks perfect.</span></div>')+
  (fa?'<div class="box"><strong>'+fa+' false alarm'+(fa>1?'s':'')+'</strong><span>Doubting a real message is not a failure. The habit is checking through an official channel, not assuming the worst.</span></div>':'')+
  '<div class="box"><strong>Not sure about a real one?</strong><span>The ScamShield helpline 1799 is open 24/7. <a class="src" href="https://www.scamshield.gov.sg" target="_blank" rel="noopener noreferrer">ScamShield</a></span></div></div><div class="stack">'+
  res.map(function(r){return '<div class="box '+(r.ok?'good':'alert')+'"><span class="mono mute">'+esc(r.m.t)+' · '+esc(r.m.f)+' · '+(r.m.s?'scam':'real')+'</span><span>'+esc(r.m.x)+'</span></div>'}).join('')+'<button class="btn red" type="button" id="ib-again">Play again</button></div></div>';
  $('#ib-again').addEventListener('click',function(){buildInbox(el,tool)});
  earn('inbox','Scam Inbox');
 }
 $('#ib-s').addEventListener('click',function(){verdict(true,true)});$('#ib-r').addEventListener('click',function(){verdict(false,true)});
 card();
}

/* ---------- message check ---------- */
var RULES=[
 {k:'urgency',l:'Pressure to hurry',re:/\b(urgent(ly)?|immediately|right away|asap|within \d+\s?(h|hrs?|hours?|mins?|minutes?|days?)|last chance|final notice|expires?( today| soon)?|today only|act now|(pay|verify|confirm|click|transfer|reply|respond) now|before it'?s too late|or your account will be (locked|suspended|closed))/gi,why:'Scams rush you so you act before you think. A real organisation gives you time to check.'},
 {k:'link',l:'A link to tap',re:/(https?:\/\/\S+|www\.\S+|\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|wa\.me|t\.me)\/?\S*|\b[a-z0-9-]+\.(xyz|top|click|link|info|icu|cc|vip)\b\S*)/gi,why:'Banks and agencies do not send links asking for personal or banking details. Go to the official app or site yourself instead.'},
 {k:'credential',l:'Asks for a code or login',re:/\b(otp|one[- ]time (pin|password)|password|passcode|cvv|card number|singpass|corppass|login details|verify your (account|identity)|nric|account number|pin number)\b/gi,why:'Agencies and banks do not ask for codes, passwords or Singpass details by SMS, phone or email.'},
 {k:'money',l:'Asks for money',re:/(\$\s?\d[\d,]*(\.\d+)?|\bpay(ment)?\b|\btransfer\b|\bfee\b|\bdeposit\b|\bgift ?cards?\b|\bcrypto\w*|\bpaynow\b|\btop ?up\b)/gi,why:'Be careful when a message wants money fast, especially before you have seen or received anything.'},
 {k:'authority',l:'Claims to be an authority',re:/\b(police|officer|court|customs|iras|ica|mas|warrant|arrest|summons|investigation|legal action|account (frozen|suspended)|bank)\b/gi,why:'Scammers borrow the names of banks and agencies. Check by calling the organisation on a number you found yourself.'},
 {k:'toogood',l:'Too good to be true',re:/(earn \$?\d+[^.]{0,30}(per|a|\/)\s?(day|hour)|guaranteed|you('| ha)ve won|winner|prize|free (iphone|gift|money)|no experience (needed|required)|easy money|work from home|like videos|rebate|cashback|refund)/gi,why:'Easy money for little effort is the hook. A real job does not ask you to pay to start (general orientation).'},
 {k:'secrecy',l:'Asks you to keep quiet',re:/\b(do not|don'?t) (tell|share this|inform)|keep (this )?(confidential|secret)|between us/gi,why:'Secrecy stops other people from spotting it. Tell someone you trust.'},
 {k:'impersonation',l:'Pretends to be someone you know',re:/\b(hi (mum|mom|dad)|new number|lost my phone|it'?s me\b|this is your (son|daughter|cousin|friend))/gi,why:'Call the real person on the number you already have before you send anything.'}
];
var EXAMPLES=['Hi, it\'s your cousin. New number. Can you top up $200 for me? Will pay you back tonight.','URGENT: Your parcel is held at customs. Pay a $2.10 fee now at www.parcel-sg.xyz or face legal action.','Your appointment is tomorrow at 3pm. To change it, call the clinic on your booking confirmation.'];
function analyse(text){
 var hits=[];RULES.forEach(function(r){var re=new RegExp(r.re.source,r.re.flags),m;while((m=re.exec(text))){if(m[0].length===0){re.lastIndex++;continue}hits.push({s:m.index,e:m.index+m[0].length,k:r.k})}});
 hits.sort(function(a,b){return a.s-b.s||b.e-a.e});
 var out=[],end=-1;hits.forEach(function(h){if(h.s>=end){out.push(h);end=h.e}});
 var html='',p=0;out.forEach(function(h){html+=esc(text.slice(p,h.s))+'<mark data-k="'+h.k+'">'+esc(text.slice(h.s,h.e))+'</mark>';p=h.e});html+=esc(text.slice(p));
 var kinds={};hits.forEach(function(h){kinds[h.k]=(kinds[h.k]||0)+1});
 return {html:html,kinds:kinds};
}
function buildTells(el,tool){
 el.innerHTML=head('Message check',tool,'Paste a message you are unsure about. This spots common pressure tricks. It does not know whether a message is genuine.')+'<div class="cols"><div class="stack"><div class="field"><label for="tl-in">Paste the message</label><textarea id="tl-in" placeholder="Paste here. It stays on your device."></textarea></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn red" type="button" id="tl-go">'+icon('search')+'Find the tells</button><button class="btn flat" type="button" id="tl-clr">Clear</button></div><div><p class="mono mute" style="margin-bottom:8px">Try an example</p><div style="display:flex;gap:8px;flex-wrap:wrap" id="tl-ex">'+EXAMPLES.map(function(x,k){return '<button class="btn flat" type="button" data-ex="'+k+'" style="min-height:42px;padding:6px 12px;font-size:.9rem">Example '+(k+1)+'</button>'}).join('')+'</div></div><div class="box"><strong>Pattern hints, not a verdict.</strong><span>No tells found never means safe. If a message asks you to pay, share a code, tap a link or hurry, check through an official channel.</span></div></div><div class="stack" id="tl-out" aria-live="polite"><div class="box"><span>Your result appears here.</span></div></div></div>';
 function run(){
  var t=$('#tl-in').value.trim();if(!t){$('#tl-out').innerHTML='<div class="box"><span>Paste a message first.</span></div>';return}
  var r=analyse(t),ks=Object.keys(r.kinds),h='<div class="box"><span class="mono mute">Your message</span><p style="line-height:1.7;overflow-wrap:anywhere">'+r.html+'</p></div>';
  if(ks.length){h+='<div class="box alert"><strong>'+ks.length+' kind'+(ks.length>1?'s':'')+' of tell found</strong></div>';RULES.forEach(function(ru){if(r.kinds[ru.k])h+='<div class="box"><span><mark data-k="'+ru.k+'">'+esc(ru.l)+'</mark> <span class="mono mute">× '+r.kinds[ru.k]+'</span></span><span>'+esc(ru.why)+'</span></div>'})}
  else h+='<div class="box"><strong>No obvious tells found.</strong><span>A scam can still look clean. Check who sent it and whether you expected it.</span></div>';
  h+='<div class="box good"><strong>If unsure, ask</strong><span>ScamShield helpline <b>1799</b>, open 24/7. <a class="src" href="https://www.scamshield.gov.sg" target="_blank" rel="noopener noreferrer">ScamShield</a></span></div>';
  $('#tl-out').innerHTML=h;earn('tells','Message check');
 }
 $('#tl-go').addEventListener('click',run);
 $('#tl-clr').addEventListener('click',function(){$('#tl-in').value='';$('#tl-out').innerHTML='<div class="box"><span>Your result appears here.</span></div>'});
 $('#tl-ex').addEventListener('click',function(e){var b=e.target.closest('[data-ex]');if(b){$('#tl-in').value=EXAMPLES[+b.getAttribute('data-ex')];run()}});
}

/* ---------- who do I call ---------- */
var TREE={
 q:'What is happening?',o:[
  ['Someone is hurt or very ill',{q:'Are they awake and breathing normally?',o:[['No: collapsed, not breathing, chest pain or heavy bleeding',{leaf:'995'}],['Yes, but I want medical advice',{leaf:'nurse'}],['I am not sure',{leaf:'995u'}]]}],
  ['There is a fire',{leaf:'995f'}],
  ['A crime or attack is happening',{q:'Can you safely talk?',o:[['Yes',{leaf:'999'}],['No, talking is not safe',{leaf:'sms'}]]}],
  ['I think I have been scammed',{leaf:'scam'}],
  ['I am not okay, or I feel overwhelmed',{q:'Are you in immediate danger, or thinking of hurting yourself right now?',o:[['Yes',{leaf:'danger'}],['No, I just need someone to talk to',{leaf:'talk'}]]}],
  ['I have a question about an official service',{leaf:'info'}]
 ]};
var LEAF={
 '995':{red:1,t:'Call 995 now.',n:[['995','Ambulance or fire','Life-threatening emergencies','995',1]],x:'Tell them where you are and what has happened.'},
 '995u':{red:1,t:'If it could be life-threatening, call 995 first.',n:[['995','Ambulance or fire','Life-threatening emergencies','995',1]],x:'You can sort out the details afterwards.'},
 '995f':{red:1,t:'Call 995 now.',n:[['995','Ambulance or fire','Fire and life-threatening emergencies','995',1]],x:'Get yourself to a safe place.'},
 '999':{red:1,t:'Call 999 now.',n:[['999','Police emergency','Crime in progress or immediate danger','999',1]],x:'Say where you are and what is happening.'},
 'sms':{red:1,t:'Text the police on 70999.',n:[['SMS 70999','Police by text','For emergencies where talking is unsafe, and for people who are deaf, mute or have a speech impairment','sms:70999',1]],x:'Say where you are and what is happening.',src:['Singapore Police Force','https://www.police.gov.sg/Media-Room/News/20240927_change_of_police_emergency_sms_sender_id_from_71999_to_70999']},
 'nurse':{t:'Call NurseFirst for medical advice.',n:[['6262 6262','NurseFirst','Medical advice when it is not life-threatening','tel:62626262']],x:'The 1777 non-emergency ambulance hotline ends on 1 January 2027. If it becomes life-threatening, call 995.',src:['Ministry of Home Affairs','https://www.mha.gov.sg/media-room/newsroom/1777-non-emergency-ambulance-hotline-to-cease-from-1-january-2027/']},
 'scam':{t:'Call 1799, and your bank if you sent money.',n:[['1799','ScamShield helpline','Open 24/7. Check if it is a scam and get connected to your bank','tel:1799']],x:'Then follow the first-hour steps. This happens to careful people.',go:['scammed','Open the first-hour steps'],src:['ScamShield','https://www.scamshield.gov.sg/check-for-scams/scamshield-helpline/']},
 'danger':{red:1,t:'Call 995 now.',n:[['995','Ambulance or fire','If you are in immediate danger','995',1],['1771','National mindline','You can also talk to someone any time','tel:1771']],x:'You matter more than whatever is happening. If you can, tell someone near you.'},
 'talk':{t:'Call or message mindline, 1771.',n:[['1771','National mindline','Call, or WhatsApp 6669-1771, or webchat at mindline.sg/fsmh','tel:1771']],x:'You do not need to be in crisis to reach out.',src:['mindline.sg','https://mindline.sg/fsmh']},
 'info':{t:'Start with SupportGoWhere.',n:[],x:'It points to government help for many situations. You can also search the source library in the app.',src:['SupportGoWhere','https://supportgowhere.life.gov.sg/']}
};
function buildCall(el,tool){
 var path=[];
 function node(){var n=TREE;path.forEach(function(k){n=n.o[k][1]});return n}
 function draw(){
  var n=node();
  if(n.leaf){var L=LEAF[n.leaf];
   el.innerHTML=head('Who do I call?',tool)+'<div class="stack" style="max-width:760px"><div class="crumbs"><button class="back" type="button" id="cl-re">'+icon('back')+'Start again</button></div><div class="box '+(L.red?'alert':'good')+'"><span class="big" style="font-size:clamp(1.8rem,4.5vw,3rem)">'+esc(L.t)+'</span><span>'+esc(L.x)+'</span></div>'+(L.n.length?'<div class="tel">'+L.n.map(function(x){return '<a class="bignum'+(x[4]?' red':'')+'" href="'+x[3]+'"><span class="n">'+esc(x[0])+'</span><span class="l">'+esc(x[1])+'</span><span class="s">'+esc(x[2])+'</span></a>'}).join('')+'</div><p class="warn">Phone and SMS links may not work in every browser. The numbers are the numbers.</p>':'')+(L.go?'<button class="btn red" type="button" data-go="'+L.go[0]+'">'+esc(L.go[1])+icon('arrow')+'</button>':'')+(L.src?'<p class="warn">Source: <a class="src" href="'+L.src[1]+'" target="_blank" rel="noopener noreferrer">'+esc(L.src[0])+'</a></p>':'')+'<p class="warn">Pilot build: awaiting review by a qualified adult. This site never dispatches help.</p></div>';
   $('#cl-re').addEventListener('click',function(){path=[];draw()});earn('call','Who to call');return;
  }
  el.innerHTML=head('Who do I call?',tool,'Three taps or fewer. If someone is in danger right now, call 995 or 999 first and come back later.')+'<div class="stack" style="max-width:760px"><div class="crumbs">'+(path.length?'<button class="back" type="button" id="cl-b">'+icon('back')+'Back</button>':'')+'</div><h3 style="font-size:clamp(1.7rem,4vw,2.6rem)">'+esc(n.q)+'</h3><div class="opts2">'+n.o.map(function(o,k){return '<button class="opt" type="button" data-k="'+k+'">'+esc(o[0])+'</button>'}).join('')+'</div><div class="tel"><a class="bignum red" href="tel:995"><span class="n">995</span><span class="l">Ambulance or fire</span></a><a class="bignum red" href="tel:999"><span class="n">999</span><span class="l">Police</span></a></div></div>';
  $$('.opt',el).forEach(function(b){b.addEventListener('click',function(){path.push(+b.getAttribute('data-k'));draw();if(hasG&&!still())gsap.from('#stage .stack > *',{y:16,opacity:0,duration:.35,stagger:.05})})});
  var bb=$('#cl-b');if(bb)bb.addEventListener('click',function(){path.pop();draw()});
 }
 draw();
}

/* ---------- if you got scammed ---------- */
var STEPS=[
 ['Stop. Do not click, reply or send more money.','Scammers often follow up fast. Pausing protects you.'],
 ['If you paid or shared bank details, call your bank now and ask about its kill-switch.','Your bank can use a kill-switch to suspend your account. Use the number on your card or in its official app.'],
 ['Call the ScamShield helpline, 1799 (24/7).','Get advice and be connected to your bank if you were scammed.'],
 ['File a police report on the police e-services portal.','You can file online. Keep your reference number.'],
 ['Save the evidence: screenshots, phone numbers, account details, receipts.','General orientation. Do not delete the chat.'],
 ['If you shared a password or code, change it, starting with banking and email.','General orientation. Do it from the official app or site, not a link.'],
 ['Tell someone you trust.','You do not have to carry this alone. Scams are built to work on careful people too.']
];
function buildScammed(el,tool){
 var ticks=store('scammed')||{};
 el.innerHTML=head('I think I got scammed',tool,'Take a breath. Here is what to do in the first hour, in order. No blame, just steps.')+'<div class="cols"><div class="stack" id="sc-l"></div><div class="stack"><div class="tel"><a class="bignum red" href="tel:1799"><span class="n">1799</span><span class="l">ScamShield helpline</span><span class="s">Open 24/7</span></a></div><div class="box"><strong>Your bank</strong><span>Call the number on your card or in its official app. Ask about the kill-switch.</span></div><div class="box"><strong>Police report</strong><span><a class="src" href="https://eservices1.police.gov.sg/phub/eservices/homepage" target="_blank" rel="noopener noreferrer">Police e-services portal</a></span></div><div class="ring"><div class="bar"><i id="sc-bar"></i></div><b id="sc-n" class="mono"></b></div><button class="btn" type="button" id="sc-copy">Copy my steps</button><p class="warn">Source: <a class="src" href="https://www.scamshield.gov.sg/check-for-scams/scamshield-helpline/" target="_blank" rel="noopener noreferrer">ScamShield helpline</a>. Steps marked general are common sense, not an official script.</p></div></div>';
 function draw(){var n=0;$('#sc-l').innerHTML=STEPS.map(function(s,k){var on=!!ticks[k];if(on)n++;return '<label class="check"><input type="checkbox" data-k="'+k+'"'+(on?' checked':'')+'><span><strong>'+(k+1)+'. '+esc(s[0])+'</strong><span class="warn">'+esc(s[1])+'</span></span></label>'}).join('');$('#sc-bar').style.transform='scaleX('+n/STEPS.length+')';$('#sc-n').textContent=n+' / '+STEPS.length;if(n===STEPS.length)earn('scammed','If you got scammed')}
 draw();
 $('#sc-l').addEventListener('change',function(e){var k=e.target.getAttribute('data-k');if(k===null)return;if(e.target.checked)ticks[k]=1;else delete ticks[k];store('scammed',ticks);var n=Object.keys(ticks).length;$('#sc-bar').style.transform='scaleX('+n/STEPS.length+')';$('#sc-n').textContent=n+' / '+STEPS.length;if(n===STEPS.length)earn('scammed','If you got scammed')});
 $('#sc-copy').addEventListener('click',function(){copyText('My first-hour steps (WayFinder SG)\n'+STEPS.map(function(s,k){return (ticks[k]?'[x] ':'[ ] ')+(k+1)+'. '+s[0]}).join('\n')+'\nScamShield helpline: 1799 (24/7)',$('#sc-copy'))});
}

/* ---------- payslip decoder ---------- */
var SLIP=['Employer\'s full name','Employee\'s full name','Date of payment','Basic salary (and rate and hours, days or pieces worked, if hourly, daily or piece-rated)','Start and end dates of the salary period','Allowances, fixed and ad-hoc','Other additional payments (bonuses, rest day pay, public holiday pay)','Deductions, fixed and ad-hoc','Overtime hours worked','Overtime pay','Overtime period dates (if different from salary period)','Total net salary paid'];
function buildPayslip(el,tool){
 var moves=0,ticked=0;
 el.innerHTML=head('Payslip decoder',tool,'Slide the example salary and watch where the money goes. Then check a real payslip against the 12 items it must show.')+'<div class="cols"><div class="stack"><div class="field"><label for="ps-g">Example monthly wage: <b id="ps-gv">$2,500</b></label><input type="range" id="ps-g" min="800" max="8000" step="50" value="2500"></div><div class="field"><label for="ps-o">Other deductions you know about ($)</label><input type="number" id="ps-o" inputmode="decimal" min="0" step="10" value="0"></div><div class="field"><label for="ps-a">Age</label><select id="ps-a"><option value="u55">55 or below</option><option value="o55">Above 55</option></select></div><div id="ps-out" class="stack" aria-live="polite"></div></div><div class="stack"><h3 style="font-size:1.7rem">Does your payslip show these 12?</h3><p class="warn">Tick what you can find on your real or imagined payslip. Nothing is saved.</p>'+SLIP.map(function(s,k){return '<label class="check"><input type="checkbox" data-k="'+k+'"><span>'+esc(s)+'</span></label>'}).join('')+'<p class="warn">Source: <a class="src" href="https://www.mom.gov.sg" target="_blank" rel="noopener noreferrer">Ministry of Manpower (directory link; open Employment practices, itemised payslips)</a></p></div></div>';
 function calc(){
  var g=+$('#ps-g').value,o=Math.max(0,+$('#ps-o').value||0),old=$('#ps-a').value==='o55';$('#ps-gv').textContent=money(g);
  var h;
  if(old)h='<div class="box"><strong>Different rates apply above age 55.</strong><span>Check the CPF Board rate table. This example only covers 55 and below.</span></div>';
  else if(g<=750)h='<div class="box"><strong>At or below $750 a month, different rates apply.</strong><span>See the CPF Board rate table.</span></div>';
  else{var e=g*.2,r=g*.17,net=g-e-o,tot=g;
   h='<div class="stackbar" role="img" aria-label="Wage split: employee CPF '+money(e)+', other deductions '+money(o)+', take-home '+money(net)+'"><div style="flex:'+e+' 1 0;background:var(--red);color:var(--on-red)">CPF</div>'+(o?'<div style="flex:'+o+' 1 0;background:var(--l-safety);color:var(--on-safety)">OTHER</div>':'')+'<div style="flex:'+Math.max(net,1)+' 1 0;background:var(--l-docs);color:var(--on-docs)">TAKE-HOME</div></div><table class="tbl"><tbody><tr><th scope="row">Gross wage (example)</th><td>'+money(g)+'</td></tr><tr><th scope="row">Employee CPF, 20%</th><td>− '+money(e)+'</td></tr>'+(o?'<tr><th scope="row">Other deductions</th><td>− '+money(o)+'</td></tr>':'')+'<tr><th scope="row"><b>Take-home</b></th><td><b>'+money(net)+'</b></td></tr><tr><th scope="row">Employer CPF, 17%, paid on top</th><td>'+money(r)+'</td></tr><tr><th scope="row">Total going into CPF, 37%</th><td>'+money(e+r)+'</td></tr></tbody></table><p class="warn">Assumes age 55 and below. Real payslips can differ by cents, and the wages CPF counts have a monthly ceiling. Check the <a class="src" href="https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay" target="_blank" rel="noopener noreferrer">CPF Board</a>. Fictional numbers.</p>';
  }
  $('#ps-out').innerHTML=h;
 }
 calc();
 el.addEventListener('input',function(e){if(e.target.id==='ps-g'||e.target.id==='ps-o'||e.target.id==='ps-a'){if(e.target.id==='ps-g')moves++;calc();chk()}});
 el.addEventListener('change',function(e){if(e.target.type==='checkbox'){ticked=$$('input[type=checkbox]:checked',el).length;chk()}});
 function chk(){if(moves>=3&&ticked>=1)earn('payslip','Payslip decoder')}
}

/* ---------- move-out budget (drag) ---------- */
var BI=[['rent','Rent',900],['util','Utilities',60],['food','Food',350],['trans','Transport',100],['phone','Phone and internet',40],['other','Other regular costs',100],['buf','Buffer for surprises',100]];
function buildBudget(el,tool){
 var st=store('budget')||{take:2000,dep:1500,amt:{},inn:{}};
 BI.forEach(function(b){if(st.amt[b[0]]==null)st.amt[b[0]]=b[2]});
 el.innerHTML=head('Move-out budget',tool,'Drag the cost blocks into your month, or tap them. Watch the bar. All numbers are fictional examples. Change them to yours.')+'<div class="cols"><div class="stack"><p class="mono mute">Cost blocks</p><div class="blocks" id="bd-b"></div><p class="mono mute">Your month</p><div class="bz" id="bz" role="group" aria-label="Your month. Blocks you add appear here."></div><div class="fill" id="bd-f" role="img" aria-label="Share of take-home used"><i></i></div><div class="nums2" id="bd-n" aria-live="polite"></div></div><div class="stack"><div class="field"><label for="bd-t">Monthly take-home pay ($)</label><input type="number" id="bd-t" inputmode="decimal" min="0" step="50"></div><div class="field"><label for="bd-d">One-time deposit and move-in items ($)</label><input type="number" id="bd-d" inputmode="decimal" min="0" step="50"></div><details class="box"><summary><b>Adjust each cost</b></summary><div class="stack" style="margin-top:12px" id="bd-i"></div></details><button class="btn" type="button" id="bd-copy">Copy my plan</button><p class="warn">Arithmetic only. This does not say whether you can afford a place. Compare with <a class="src" href="https://www.moneysense.gov.sg" target="_blank" rel="noopener noreferrer">MoneySense</a> guidance.</p></div></div>';
 $('#bd-t').value=st.take;$('#bd-d').value=st.dep;
 $('#bd-i').innerHTML=BI.map(function(b){return '<div class="field"><label for="bi-'+b[0]+'">'+esc(b[1])+' ($ a month)</label><input type="number" id="bi-'+b[0]+'" data-k="'+b[0]+'" inputmode="decimal" min="0" step="10" value="'+st.amt[b[0]]+'"></div>'}).join('');
 function total(){var t=0;BI.forEach(function(b){if(st.inn[b[0]])t+=Math.max(0,+st.amt[b[0]]||0)});return t}
 function draw(){
  $('#bd-b').innerHTML=BI.map(function(b){return '<button type="button" class="blk'+(st.inn[b[0]]?' added':'')+'" data-k="'+b[0]+'" aria-pressed="'+!!st.inn[b[0]]+'">'+esc(b[1])+'<small>'+money(st.amt[b[0]])+(st.inn[b[0]]?' · added':'')+'</small></button>'}).join('');
  var inn=BI.filter(function(b){return st.inn[b[0]]});
  $('#bz').innerHTML=inn.length?inn.map(function(b){return '<button class="seg" type="button" data-rm="'+b[0]+'" aria-label="Remove '+esc(b[1])+'">'+esc(b[1])+' '+money(st.amt[b[0]])+' ×</button>'}).join(''):'<span class="warn">Drop blocks here</span>';
  var mo=total(),take=Math.max(0,+st.take||0),dep=Math.max(0,+st.dep||0),pct=take>0?mo/take*100:0,left=take-mo;
  $('#bd-f').classList.toggle('over',left<0);$('#bd-f i').style.width=Math.min(100,pct)+'%';
  $('#bd-n').innerHTML='<div class="box"><span class="mono mute">Monthly costs</span><b class="big" style="font-size:2rem">'+money(mo)+'</b></div><div class="box"><span class="mono mute">Share of take-home</span><b class="big" style="font-size:2rem">'+(take>0?Math.round(pct)+'%':'n/a')+'</b></div><div class="box '+(left<0?'alert':'good')+'"><span class="mono mute">'+(left<0?'Over by':'Left over')+'</span><b class="big" style="font-size:2rem">'+money(Math.abs(left))+'</b></div><div class="box"><span class="mono mute">First month, with deposit</span><b class="big" style="font-size:2rem">'+money(mo+dep)+'</b></div>';
  store('budget',st);
  if(inn.length>=3)earn('budget','Move-out budget');
 }
 draw();
 $('#bd-t').addEventListener('input',function(e){st.take=+e.target.value||0;draw()});
 $('#bd-d').addEventListener('input',function(e){st.dep=+e.target.value||0;draw()});
 $('#bd-i').addEventListener('input',function(e){var k=e.target.getAttribute('data-k');if(k){st.amt[k]=+e.target.value||0;draw()}});
 $('#bz').addEventListener('click',function(e){var b=e.target.closest('[data-rm]');if(b){delete st.inn[b.getAttribute('data-rm')];draw()}});
 $('#bd-copy').addEventListener('click',function(){var mo=total();copyText('My move-out budget (WayFinder SG, example numbers)\n'+BI.filter(function(b){return st.inn[b[0]]}).map(function(b){return b[1]+': '+money(st.amt[b[0]])}).join('\n')+'\nMonthly costs: '+money(mo)+'\nTake-home: '+money(st.take)+'\nDeposit and move-in: '+money(st.dep)+'\nFirst month: '+money(mo+(+st.dep||0)),$('#bd-copy'))});
 // pointer drag with tap fallback
 var d=null,swallow=false,bb=$('#bd-b'),zone=$('#bz');
 bb.addEventListener('pointerdown',function(e){var b=e.target.closest('.blk');if(!b||(e.pointerType==='mouse'&&e.button!==0))return;d={b:b,x:e.clientX,y:e.clientY,g:null};try{b.setPointerCapture(e.pointerId)}catch(x){}});
 bb.addEventListener('pointermove',function(e){
  if(!d)return;if(!d.g&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>7){var r=d.b.getBoundingClientRect(),g=d.b.cloneNode(true);g.classList.add('ghost');g.style.width=r.width+'px';document.body.appendChild(g);d.g=g}
  if(d.g){d.g.style.left=(e.clientX-30)+'px';d.g.style.top=(e.clientY-24)+'px';var zr=zone.getBoundingClientRect();zone.classList.toggle('over',e.clientX>zr.left&&e.clientX<zr.right&&e.clientY>zr.top&&e.clientY<zr.bottom)}
 });
 function drop(e){
  if(!d)return;var k=d.b.getAttribute('data-k');
  if(d.g){var zr=zone.getBoundingClientRect(),inz=e.clientX>zr.left&&e.clientX<zr.right&&e.clientY>zr.top&&e.clientY<zr.bottom;document.body.removeChild(d.g);zone.classList.remove('over');swallow=true;setTimeout(function(){swallow=false},60);if(inz)st.inn[k]=1;else if(e.type==='pointerup'){delete st.inn[k]}d=null;draw()}
  else d=null;
 }
 bb.addEventListener('pointerup',drop);bb.addEventListener('pointercancel',drop);
 bb.addEventListener('click',function(e){var b=e.target.closest('.blk');if(!b||swallow)return;var k=b.getAttribute('data-k');if(st.inn[k])delete st.inn[k];else st.inn[k]=1;draw()});
}

/* ---------- contract reader ---------- */
var KETS_SRC=['MOM: Key employment terms (KETs)','https://www.mom.gov.sg/employment-practices/contract-of-service/key-employment-terms'];
var KETS14=['MOM FAQ: KETs within 14 days of the first day','https://www.mom.gov.sg/faq/key-employment-terms/why-must-i-issue-written-kets-within-14-days-of-my-employees-first-day-of-work-instead-of-before-their-first-day-of-work'];
var CLAUSES=[
 {x:'1. Position: Part-time Service Crew. Start date: 3 December. Place of work: Brew & Co Cafe, Outlet 2.',flag:0,fine:'Job title, start date and place of work are normal to see in writing.'},
 {x:'2. Basic salary: to be discussed.',flag:1,q:'What is my basic salary, and how is it worked out (per hour, per month)? Basic salary is one of the items KETs must include.',s:KETS_SRC},
 {x:'3. Working hours: as required by the manager.',flag:1,q:'Ask for daily hours, working days per week and your rest day in writing. Those are KETs items.',s:KETS_SRC},
 {x:'4. Probation: 3 months. Notice period: 1 month on either side.',flag:0,fine:'Good: probation and notice period are both listed KETs items, and here they are written down.'},
 {x:'5. Overtime: not paid.',flag:1,q:'Ask what the overtime rate is and where it is written. KETs include an overtime rate. Whether overtime pay applies can depend on your coverage, so confirm with MOM.',s:KETS_SRC},
 {x:'6. The employee must pay a $200 "training deposit" on the first day.',flag:1,q:'General orientation: a real job does not ask you to pay to start. Ask who the money goes to and why, and check with MOM before paying anything.',s:['Ministry of Manpower (directory link)','https://www.mom.gov.sg']},
 {x:'7. Annual leave and sick leave: per company policy.',flag:1,q:'Ask for the types of leave in writing. KETs list the types of leave (annual, sick, hospitalisation and more).',s:KETS_SRC},
 {x:'8. Written key employment terms will be provided on request.',flag:1,q:'Written KETs are due within 14 days of your first day of work, not only on request. Ask for the date.',s:KETS14},
 {x:'9. Fixed monthly allowance for transport: $60, paid with salary.',flag:0,fine:'Fixed allowances are a KETs item, and this one is clear and written down.'}
];
function buildContract(el,tool){
 var seen={};var total=CLAUSES.filter(function(c){return c.flag}).length;
 el.innerHTML=head('Contract reader',tool,'A fictional offer letter. Tap each line. Some deserve a question, some are fine. Find all '+total+' red flags.')+'<div class="cols"><div class="letter" id="ct-l"><h4>Offer of part-time employment</h4><span class="mono" style="opacity:.6">Brew & Co Cafe (fictional)</span>'+CLAUSES.map(function(c,k){return '<button type="button" class="cl" data-k="'+k+'">'+esc(c.x)+'</button>'}).join('')+'</div><div class="stack" id="ct-r" aria-live="polite"><div class="box"><strong>Flags found: <span id="ct-n">0</span> of '+total+'</strong><div class="bar"><i id="ct-b" style="transform:scaleX(0)"></i></div></div><div class="box"><span>Tap a line in the letter. You will see whether it deserves a question, and what to ask.</span></div></div></div>';
 $('#ct-l').addEventListener('click',function(e){
  var b=e.target.closest('.cl');if(!b)return;var k=+b.getAttribute('data-k'),c=CLAUSES[k];seen[k]=1;
  $$('.cl',el).forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');b.classList.add(c.flag?'flag':'fine');
  if(!$('.tag',b))b.insertAdjacentHTML('beforeend','<span class="tag">'+(c.flag?'ask':'ok')+'</span>');
  var n=Object.keys(seen).filter(function(x){return CLAUSES[x].flag}).length;
  $('#ct-r').innerHTML='<div class="box"><strong>Flags found: '+n+' of '+total+'</strong><div class="bar"><i style="transform:scaleX('+n/total+')"></i></div></div>'+(c.flag?'<div class="box alert"><strong>Worth a question</strong><span>'+esc(c.q)+'</span><a class="src" href="'+c.s[1]+'" target="_blank" rel="noopener noreferrer">'+esc(c.s[0])+'</a></div>':'<div class="box good"><strong>Looks fine</strong><span>'+esc(c.fine)+'</span></div>')+'<p class="warn">Missing or unclear items are a question to ask, not a reason to panic. Coverage can depend on your situation: confirm with MOM.</p>';
  if(n===total)earn('contract','Contract reader');
 });
}

/* ---------- passport + share card ---------- */
var LC={money:'#D6112F',docs:'#00873C',safety:'#F26B21',work:'#0B5CAD',housing:'#F2B600'},LO={money:'#fff',docs:'#fff',safety:'#14110F',work:'#fff',housing:'#14110F'};
function buildPassport(el,tool){
 var got=W.stamps(),n=Object.keys(got).length;
 el.innerHTML=head('My passport',tool,'Stamps you have earned from tools and lessons. They live on this device only.')+'<div class="cols"><div class="stack"><p class="big">'+n+' of '+W.STAMPS.length+'</p><div class="pp-grid">'+W.STAMPS.map(function(s){var h=!!got[s.id];return '<a class="pst'+(h?' got':'')+'" href="'+s.where+'" style="--c:var(--l-'+s.line+');--on-c:var(--on-'+s.line+')">'+icon(s.ic)+'<span>'+esc(s.t)+'</span></a>'}).join('')+'</div><button class="btn flat" type="button" id="pp-clear">Clear my stamps</button></div><div class="stack"><canvas id="pp-cv" class="sharec" width="720" height="900" role="img" aria-label="Share card showing your stamp count"></canvas><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn red" type="button" id="pp-save">'+icon('download')+'Save as image</button><button class="btn" type="button" id="pp-share">'+icon('share')+'Share</button></div><p class="warn" id="pp-msg" aria-live="polite">The card shows only your stamp count and names of the tools. Nothing personal.</p></div></div>';
 function draw(){
  var cv=$('#pp-cv'),c=cv.getContext('2d'),dark=false;
  c.fillStyle='#F3EFE6';c.fillRect(0,0,720,900);c.strokeStyle='#14110F';c.lineWidth=10;c.strokeRect(5,5,710,890);
  c.fillStyle='#14110F';c.font='800 66px "Bricolage Grotesque",Arial,sans-serif';c.fillText('WayFinder SG',44,110);
  c.font='500 26px "Martian Mono",monospace';c.fillText('PASSPORT',44,160);
  c.font='italic 52px "Instrument Serif",Georgia,serif';c.fillText(n+' of '+W.STAMPS.length+' stamps',44,236);
  W.STAMPS.forEach(function(s,k){var col=k%4,row=Math.floor(k/4),x=44+col*166,y=290+row*190,has=!!got[s.id];
   if(has){c.fillStyle=LC[s.line];c.fillRect(x,y,150,150);c.strokeStyle='#14110F';c.lineWidth=5;c.strokeRect(x,y,150,150);c.fillStyle=LO[s.line]}
   else{c.setLineDash([10,8]);c.strokeStyle='#5E574F';c.lineWidth=3;c.strokeRect(x,y,150,150);c.setLineDash([]);c.fillStyle='#5E574F'}
   c.font='700 16px "Bricolage Grotesque",Arial,sans-serif';var w=s.t.replace('Lesson: ','').split(' '),line='',ly=y+62;
   w.forEach(function(wd){var t=line?line+' '+wd:wd;if(c.measureText(t).width>130&&line){c.fillText(line,x+10,ly);ly+=22;line=wd}else line=t});c.fillText(line,x+10,ly);
   if(has){c.font='700 14px "Martian Mono",monospace';c.fillText('STAMPED',x+10,y+138)}
  });
  c.fillStyle='#14110F';c.font='500 20px "Martian Mono",monospace';c.fillText('Practise adulthood before it counts.',44,850);
 }
 draw();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);
 $('#pp-clear').addEventListener('click',function(){W.clearStamps();buildPassport(el,tool)});
 $('#pp-save').addEventListener('click',function(){try{$('#pp-cv').toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='wayfinder-passport.png';document.body.appendChild(a);a.click();document.body.removeChild(a);$('#pp-msg').textContent='Saved. If nothing downloaded, long-press the card and save the image.'})}catch(e){$('#pp-msg').textContent='Long-press the card to save the image.'}});
 $('#pp-share').addEventListener('click',function(){
  var m=$('#pp-msg');
  try{$('#pp-cv').toBlob(function(b){var f=new File([b],'wayfinder-passport.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'WayFinder SG passport'}).catch(function(){})}else{m.textContent='Sharing is not available here. Use Save as image instead.'}})}catch(e){m.textContent='Sharing is not available here. Use Save as image instead.'}
 });
}

/* ---------- router, overview, rail ---------- */
var TOOLS=[
 {id:'inbox',t:'Scam Inbox',d:'Swipe through a week of messages and see which pattern fooled you.',line:'safety',ic:'phone',m:'4 min',b:buildInbox},
 {id:'tells',t:'Message check',d:'Paste a suspicious message and see the pressure tricks highlighted.',line:'safety',ic:'search',m:'1 min',b:buildTells},
 {id:'call',t:'Who do I call?',d:'Three taps from "something happened" to the right number.',line:'safety',ic:'bell',m:'30 sec',b:buildCall},
 {id:'scammed',t:'I think I got scammed',d:'Calm, step-by-step, no blame. What to do in the first hour.',line:'safety',ic:'shield',m:'2 min',b:buildScammed},
 {id:'payslip',t:'Payslip decoder',d:'Slide the numbers and watch gross become take-home.',line:'money',ic:'wallet',m:'2 min',b:buildPayslip},
 {id:'budget',t:'Move-out budget',d:'Drag costs into a month and watch the bar fill.',line:'housing',ic:'home',m:'3 min',b:buildBudget},
 {id:'contract',t:'Contract reader',d:'A fake offer letter. Tap the lines that deserve a question.',line:'work',ic:'doc',m:'3 min',b:buildContract},
 {id:'passport',t:'My passport',d:'Your stamps, and a card you can save or share.',line:'work',ic:'stamp',m:'1 min',b:buildPassport}
];
var TM={};TOOLS.forEach(function(t){TM[t.id]=t});
rail.innerHTML='<button type="button" role="tab" data-go="all" aria-current="true">'+icon('tag')+'All</button>'+TOOLS.map(function(t){return '<button type="button" role="tab" data-go="'+t.id+'" aria-current="false">'+icon(t.ic)+esc(t.t)+'</button>'}).join('');
function overview(){
 var di=Math.floor(Date.now()/864e5)%MSGS.length,m=MSGS[di];
 stage.innerHTML='<div class="tools">'+TOOLS.map(function(t){return '<button class="tool enamel gloss tilt" type="button" data-go="'+t.id+'" data-cursor="Open"><span class="bd" style="background:var(--l-'+t.line+');color:var(--on-'+t.line+')">'+icon(t.ic)+'</span><h3>'+esc(t.t)+'</h3><p>'+esc(t.d)+'</p><span class="mono mute">'+esc(t.m)+'</span></button>'}).join('')+'</div><div class="daily enamel" style="margin-top:34px"><div><p class="mono mute kicker">Today\'s heads-up</p><h3 style="font-size:2.2rem;margin-top:10px">Scam or real?</h3><p class="warn" style="margin-top:8px">One message a day, picked from the nine in the Scam Inbox. No streaks, no shame.</p></div><div class="stack"><div class="ph"><span class="mono mute">'+esc(m.t)+' · '+esc(m.f)+'</span><p style="font-size:1.2rem;margin-top:6px;overflow-wrap:anywhere">'+esc(m.x)+'</p></div><div class="ctl" style="margin:0"><button class="btn red" type="button" data-say="1">'+icon('alert')+'Scam</button><button class="btn" type="button" data-say="0" style="background:var(--l-docs);color:var(--on-docs)">'+icon('check')+'Real</button></div><div id="dly" aria-live="polite"></div></div></div>';
 $$('[data-say]',stage).forEach(function(b){b.addEventListener('click',function(){var ok=(+b.getAttribute('data-say')===1)===!!m.s;$('#dly').innerHTML='<div class="box '+(ok?'good':'alert')+'"><strong>'+(ok?'Right call.':'Not quite.')+' This one is '+(m.s?'a scam.':'real.')+'</strong><span>'+esc(m.why)+'</span><span><b>What to do:</b> '+esc(m.act)+'</span></div>'})});
 W.bindAll(stage);
}
function show(){
 var id=(location.hash||'').slice(1),t=TM[id];
 $$('[data-go]',rail).forEach(function(b){b.setAttribute('aria-current',String((t&&b.getAttribute('data-go')===id)||(!t&&b.getAttribute('data-go')==='all')))});
 document.title=(t?t.t+' | ':'')+'Toolkit | WayFinder SG';
 if(!t){overview();return}
 stage.innerHTML='';var wrap=document.createElement('div');stage.appendChild(wrap);t.b(wrap,t);
 if(hasG&&!still())gsap.from(wrap,{y:22,opacity:0,duration:.5,ease:'power3.out'});
 var cur=$('[aria-current="true"]',rail);if(cur&&cur.scrollIntoView)try{cur.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}
}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-go]');if(!b)return;
 e.preventDefault();var id=b.getAttribute('data-go');
 if(('#'+id)===location.hash){show()}else{location.hash=id}
 var r=$('.rail').getBoundingClientRect();if(W.lenis)W.lenis.scrollTo(0,{duration:.8});else window.scrollTo(0,0);
});
window.addEventListener('hashchange',show);
show();
})();
