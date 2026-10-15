(()=>{
const $=s=>document.querySelector(s);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd=s=>{const x=Math.sin(s*999.13)*43758.5453;return x-Math.floor(x);};
const MOVE=['Staat stil','Beweegt langzaam','Stuitert wild rond'];
const NAVY='#1d2b4f',GOLD='#c9a063',D=Math.PI/180;let TOL=.07;
const GROUPS=[
 {id:0,from:4,to:5,label:'4 en 5 jaar',desc:'Alle monsters staan stil',time:1.5,grow:.5,tol:.1},
 {id:1,from:6,to:8,label:'6 t/m 8 jaar',desc:'Monsters bewegen een beetje',time:1.25,grow:.75,tol:.085},
 {id:2,from:9,to:10,label:'9 en 10 jaar',desc:'Monsters bewegen flink',time:1.1,grow:.9,tol:.075},
 {id:3,from:11,to:99,label:'11 jaar en ouder',desc:'Monsters bewegen wild',time:1,grow:1,tol:.07}];
let AGE=null,GRP=null;
function eff(m){const g=GRP?GRP.id:3;
 if(g===0||!m.move)return{move:0};
 if(g===1)return{move:1,amp:.45,fq:.6};
 if(g===2)return m.move===1?{move:1,amp:.8,fq:.85}:{move:2,speed:m.speed*.6,pause:m.pause+.8};
 return m.move===1?{move:1,amp:1,fq:1}:{move:2,speed:m.speed,pause:m.pause};}
const moveLabel=m=>{const e=eff(m);return e.move===0?'Staat stil':e.move===1?(e.amp<.6?'Wiebelt een beetje':'Beweegt langzaam'):(GRP&&GRP.id===2?'Stuitert rond':'Stuitert wild rond');};

const M=[
 {id:'vlamkop',no:'001',name:'Vlamkop',type:'Vuur',tc:'#ff8a3d',body:'#ff9248',belly:'#ffe0bf',ear:'#ff6b6b',hair:['#ffd23f','#ff9f1c','#ff5fa2'],
  style:'Hanenkam',n:19,grow:.022,time:40,seed:3,sway:2.2,curl:2.5,wig:.5,zig:0,lvl:1,move:0,
  target:u=>.16+.66*Math.exp(-Math.pow((u-.5)/.16,2)),
  beard:{style:'Sikje',n:13,grow:.02,time:30,target:u=>.18+.55*Math.exp(-Math.pow((u-.5)/.17,2))}},
 {id:'bliksem',no:'002',name:'Bliksemborstel',type:'Bliksem',tc:'#8a5cf6',body:'#a37dff',belly:'#e6dbff',ear:'#7a52e0',hair:['#ffe45c','#ffd23f','#fff3a8'],
  style:'Stekeltjes',n:20,grow:.03,time:40,seed:11,sway:5,curl:1,wig:.25,zig:1,lvl:2,move:1,
  target:(u,i)=>i%2?.34:.62,
  beard:{style:'Stoppelbaardje',n:15,grow:.026,time:30,target:()=>.24}},
 {id:'kraak',no:'003',name:'Kraak de Krulkraak',type:'Water',tc:'#22c3c3',body:'#3fd0c9',belly:'#cdf7f3',ear:'#22a8b8',hair:['#4fa8ff','#7fd3ff','#2f7cf0'],
  style:'Bloempot',n:22,grow:.038,time:45,seed:23,sway:1.6,curl:6,wig:1.1,zig:0,lvl:3,move:2,speed:.42,pause:1.4,
  target:()=>.38,
  beard:{style:'Volle baard',n:15,grow:.032,time:30,target:()=>.5}},
 {id:'draak',no:'004',name:'Capaldraak',type:'Legendarisch',tc:'#ff5fa2',body:'#ffd166',belly:'#fff1c9',ear:'#ff7ab8',hair:['#ff5fa2','#c86bff','#ff9fd0'],
  style:'Fade',n:23,grow:.045,time:45,seed:37,sway:2,curl:2,wig:.4,zig:0,lvl:4,legend:true,move:2,speed:.55,pause:1.1,
  target:u=>{const d=Math.abs(u-.5);return d>.34?.14:d>.2?.34:.6;},
  beard:{style:'Puntbaard',n:15,grow:.038,time:30,target:u=>.15+.62*Math.pow(1-Math.abs(u-.5)*2,1.5)}}
];

/* opslag: alleen op dit apparaat */
const KEY='capaldi-knipmonsters-v1';
let DB={dex:{},scores:[]};
try{const raw=localStorage.getItem(KEY);if(raw)DB=Object.assign(DB,JSON.parse(raw));}catch(e){}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){}};
const unlocked=m=>!m.legend||M.filter(x=>!x.legend).every(x=>(DB.dex[x.id]||0)>0);

/* geluid */
let AC=null,muted=false,lastSnip=0,hum=null;
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC;}
function tone(f,d,type='square',vol=.06,when=0){const a=ac();if(!a||muted)return;const t=a.currentTime+when,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.02);}
function snip(){const a=ac();if(!a||muted)return;const now=performance.now();if(now-lastSnip<55)return;lastSnip=now;
 const len=.055,buf=a.createBuffer(1,Math.floor(a.sampleRate*len),a.sampleRate),d=buf.getChannelData(0);
 for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
 const s=a.createBufferSource();s.buffer=buf;const f=a.createBiquadFilter();f.type='highpass';f.frequency.value=2800+Math.random()*1800;const g=a.createGain();g.gain.value=.35;s.connect(f).connect(g).connect(a.destination);s.start();}
function humOn(){const a=ac();if(!a||muted||hum)return;const o=a.createOscillator(),o2=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();
 o.type='sawtooth';o.frequency.value=118;o2.type='square';o2.frequency.value=59;f.type='lowpass';f.frequency.value=900;g.gain.value=.0001;g.gain.setTargetAtTime(.05,a.currentTime,.03);
 o.connect(f);o2.connect(f);f.connect(g).connect(a.destination);o.start();o2.start();hum={o,o2,g};}
function humOff(){if(!hum||!AC)return;const h=hum;hum=null;h.g.gain.setTargetAtTime(.0001,AC.currentTime,.03);setTimeout(()=>{try{h.o.stop();h.o2.stop();}catch(e){}},200);}
const oops=()=>{tone(392,.12,'triangle',.08);tone(262,.2,'triangle',.08,.1);};
const fanfare=()=>[523,659,784,1046].forEach((f,i)=>tone(f,.22,'square',.05,i*.12));
$('#mute').addEventListener('click',e=>{muted=!muted;if(muted){humOff();try{speechSynthesis.cancel();}catch(x){}}e.currentTarget.textContent='Geluid: '+(muted?'uit':'aan');e.currentTarget.setAttribute('aria-pressed',String(muted));});

/* geometrie */
function fitR(w,h,ph){if(ph){const top=62,R=Math.min(w*.235,(h-top)/4.05);return{R,cy:top+(h-top-3.85*R)/2+2.17*R};}const R=Math.min(w*.19,h/4.05);return{R,cy:(h-3.85*R)/2+2.17*R};}
function geomH(m,i,cx,cy,R){const u=i/(m.n-1);const a=(-158+136*u)*D+(rnd(m.seed+i)-.5)*.07;
 return{u,d:a,ax:cx+Math.cos(a)*R*.9,ay:cy+Math.sin(a)*R*.9,ml:R*1.25,t:m.target(u,i)};}
function geomB(m,i,cx,cy,R){const b=m.beard,u=i/(b.n-1);const a=(24+132*u)*D;const d=a*.4+Math.PI/2*.6+(rnd(m.seed*3+i)-.5)*.08;
 return{u,d,ax:cx+Math.cos(a)*R*.82,ay:cy+R*.14+Math.sin(a)*R*.68,ml:R*.78,t:b.target(u,i)};}
function strandPts(m,g,i,Lf,time,R,beard){const K=9,L=Lf*g.ml,dx=Math.cos(g.d),dy=Math.sin(g.d),px=-dy,py=dx,P=[];
 const sw=RM?.3:1,zig=beard?0:m.zig,wig=beard?.35:m.wig,curl=beard?3:m.curl,sway=beard?1.5:m.sway;
 for(let j=0;j<=K;j++){const s=j/K,d=L*s;
  let w=Math.sin(time*sway+i*1.7+s*curl)*wig*R*.06*s*(Lf+.2)*sw;
  if(zig&&j>0&&j<K)w+=(j%2?1:-1)*R*.035*Math.min(1,Lf*1.6);
  P.push([g.ax+dx*d+px*w,g.ay+dy*d+py*w]);}
 return P;}
function pathPts(c,P,smooth){c.beginPath();c.moveTo(P[0][0],P[0][1]);
 if(!smooth){for(let j=1;j<P.length;j++)c.lineTo(P[j][0],P[j][1]);return;}
 for(let j=1;j<P.length-1;j++){const mx=(P[j][0]+P[j+1][0])/2,my=(P[j][1]+P[j+1][1])/2;c.quadraticCurveTo(P[j][0],P[j][1],mx,my);}
 const l=P[P.length-1];c.lineTo(l[0],l[1]);}
function ell(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);}

/* strengen tekenen (haar of baard) */
function drawStrands(c,m,cx,cy,R,lens,time,beard,sil,guide){
 const n=beard?m.beard.n:m.n,G=[];
 for(let i=0;i<n;i++){const g=beard?geomB(m,i,cx,cy,R):geomH(m,i,cx,cy,R);const Lf=lens?lens[i]:1;G.push({g,Lf,P:strandPts(m,g,i,Lf,time,R,beard)});}
 const smooth=beard||!m.zig,lw=beard?R*.065:R*.075;
 c.lineCap='round';c.lineJoin='round';
 c.strokeStyle=sil?'#c7cde0':NAVY;c.lineWidth=lw+R*.045;for(const h of G){pathPts(c,h.P,smooth);c.stroke();}
 G.forEach((h,i)=>{c.strokeStyle=sil?'#c7cde0':m.hair[(i+(beard?1:0))%m.hair.length];c.lineWidth=lw;pathPts(c,h.P,smooth);c.stroke();});
 if(guide&&!sil){G.forEach(h=>{const{g}=h,dx=Math.cos(g.d),dy=Math.sin(g.d),tx=g.ax+dx*g.t*g.ml,ty=g.ay+dy*g.t*g.ml,hl=R*.075;
  const neat=h.Lf>=g.t-TOL&&h.Lf<=g.t+TOL,short=h.Lf<g.t-TOL;
  c.strokeStyle='#fff';c.lineWidth=R*.06;c.beginPath();c.moveTo(tx+dy*hl,ty-dx*hl);c.lineTo(tx-dy*hl,ty+dx*hl);c.stroke();
  c.strokeStyle=neat?'#2fb36b':NAVY;c.lineWidth=R*.03;c.beginPath();c.moveTo(tx+dy*hl,ty-dx*hl);c.lineTo(tx-dy*hl,ty+dx*hl);c.stroke();
  if(neat){c.fillStyle='#2fb36b';c.beginPath();c.arc(tx,ty,R*.028,0,Math.PI*2);c.fill();}
  if(short){const e=h.P[h.P.length-1];c.fillStyle='#ff4d6d';c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(e[0],e[1],R*.045,0,Math.PI*2);c.fill();c.stroke();}});}
 return G;}

const GOLDG='#d4b07a';
function capaldiMark(c,x,y,r){c.save();
 c.fillStyle='#fff';c.strokeStyle=NAVY;c.lineWidth=Math.max(1.2,r*.12);c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.stroke();
 c.strokeStyle=GOLDG;c.lineWidth=Math.max(1,r*.09);c.beginPath();c.arc(x,y,r*.74,Math.PI/2+.16,Math.PI/2-.16+Math.PI*2);c.stroke();
 c.fillStyle=GOLDG;c.font=`700 ${Math.max(6,Math.round(r*1.05))}px "Bodoni Moda", Didot, Georgia, serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('C',x,y+r*.05);c.restore();}
function wordmark(c,x,y,size,subCol,sub){c.save();c.textAlign='center';c.textBaseline='middle';
 c.font=`700 ${Math.round(size)}px "Bodoni Moda", Didot, Georgia, serif`;try{c.letterSpacing=`${size*.1}px`;}catch(e){}c.fillStyle=NAVY;c.fillText('CAPALDI',x,y);
 if(sub){c.font=`400 ${Math.round(size*.36)}px Rubik, sans-serif`;try{c.letterSpacing=`${size*.32}px`;}catch(e){}c.fillStyle=subCol;c.fillText('KAPPERS',x+size*.15,y+size*.82);}c.restore();}
function salonDecor(c,w,h,R,bx,fy,sign){
 // mat met Capaldi onder de stoel
 const fh=h-fy;if(fh>18){const mh=Math.min(R*.42,fh*.62),mw=Math.min(w*.8,R*2.7),my=fy+fh*.5;
  c.save();c.fillStyle='#ffffff';c.strokeStyle=NAVY;c.lineWidth=3;c.beginPath();c.roundRect(bx-mw/2,my-mh/2,mw,mh,mh*.3);c.fill();c.stroke();
  c.strokeStyle='#ffb3d1';c.lineWidth=2;c.setLineDash([5,4]);c.beginPath();c.roundRect(bx-mw/2+5,my-mh/2+5,mw-10,mh-10,mh*.22);c.stroke();c.restore();
  wordmark(c,bx,my+1,mh*.48,NAVY,false);capaldiMark(c,bx-mw*.39,my,mh*.3);capaldiMark(c,bx+mw*.39,my,mh*.3);}
 // bordje aan de muur
 if(sign){const sw=Math.min(170,w*.36),sh=sw*.36,sx=12,sy=12;c.save();c.fillStyle='rgba(255,255,255,.92)';c.strokeStyle=NAVY;c.lineWidth=2.5;c.beginPath();c.roundRect(sx,sy,sw,sh,12);c.fill();c.stroke();c.restore();
  capaldiMark(c,sx+sh*.5,sy+sh*.5,sh*.34);wordmark(c,sx+sh+(sw-sh)*.42,sy+sh*.38,sh*.3,NAVY,true);}}
function drawMonster(c,m,cx,cy,R,o){
 const sil=!!o.sil,F=x=>sil?'#dfe3ef':x,OUT=sil?'#c7cde0':NAVY,time=o.time||0,mood=o.mood||'smile';
 c.lineJoin='round';c.lineCap='round';
 c.fillStyle='rgba(29,43,79,.14)';ell(c,cx,cy+R*1.45,R*1.15,R*.14);c.fill();
 c.fillStyle=F(m.ear);c.strokeStyle=OUT;c.lineWidth=R*.045;
 for(const s of[-1,1]){c.beginPath();
  if(m.type==='Bliksem'){c.moveTo(cx+s*R*.8,cy-R*.45);c.lineTo(cx+s*R*1.35,cy-R*.62);c.lineTo(cx+s*R*1.08,cy-R*.25);c.lineTo(cx+s*R*1.42,cy-R*.06);c.lineTo(cx+s*R*.9,cy+R*.15);}
  else if(m.type==='Water'){c.moveTo(cx+s*R*.85,cy-R*.4);c.quadraticCurveTo(cx+s*R*1.5,cy-R*.4,cx+s*R*1.32,cy+R*.25);c.quadraticCurveTo(cx+s*R*1.12,cy+R*.02,cx+s*R*.9,cy+R*.2);}
  else if(m.legend){c.moveTo(cx+s*R*.8,cy-R*.3);c.lineTo(cx+s*R*1.55,cy-R*.95);c.lineTo(cx+s*R*1.42,cy-R*.4);c.lineTo(cx+s*R*1.62,cy-R*.22);c.lineTo(cx+s*R*1.3,cy+R*.06);c.lineTo(cx+s*R*.9,cy+R*.25);}
  else{c.moveTo(cx+s*R*.82,cy-R*.5);c.quadraticCurveTo(cx+s*R*1.18,cy-R*.6,cx+s*R*1.3,cy-R*.98);c.quadraticCurveTo(cx+s*R*1.48,cy-R*.3,cx+s*R*.95,cy+R*.1);}
  c.closePath();c.fill();c.stroke();}
 c.fillStyle=F(m.body);
 for(const s of[-1,1]){ell(c,cx+s*R*.42,cy+R*1.36,R*.22,R*.12);c.fill();c.stroke();}
 c.beginPath();c.arc(cx,cy,R,0,Math.PI*2);c.fill();c.stroke();
 if(!sil){c.fillStyle=m.belly;ell(c,cx,cy+R*.42,R*.58,R*.42);c.fill();}
 // kapperscape van Capaldi
 c.beginPath();c.moveTo(cx-R*.72,cy+R*.62);c.quadraticCurveTo(cx,cy+R*.8,cx+R*.72,cy+R*.62);c.lineTo(cx+R*1.12,cy+R*1.3);c.quadraticCurveTo(cx,cy+R*1.42,cx-R*1.12,cy+R*1.3);c.closePath();
 c.fillStyle=F('#ffffff');c.fill();c.strokeStyle=OUT;c.lineWidth=R*.045;c.stroke();
 if(!sil){c.save();c.clip();c.strokeStyle='#ffd6ea';c.lineWidth=R*.08;for(let k=-6;k<=6;k++){c.beginPath();c.moveTo(cx+k*R*.26,cy+R*.6);c.lineTo(cx+k*R*.26+R*.35,cy+R*1.45);c.stroke();}c.restore();
  capaldiMark(c,cx,cy+R*1.06,R*.17,true);}
 // gezicht
 if(!sil){
  const lk=o.look||{x:cx,y:cy+R};
  c.fillStyle='rgba(255,95,162,.35)';for(const s of[-1,1]){ell(c,cx+s*R*.58,cy+R*.16,R*.13,R*.08);c.fill();}
  for(const s of[-1,1]){const ex=cx+s*R*.33,ey=cy-R*.08;
   c.fillStyle='#fff';ell(c,ex,ey,R*.21,R*.24);c.fill();c.strokeStyle=NAVY;c.lineWidth=R*.035;c.stroke();
   let vx=lk.x-ex,vy=lk.y-ey;const vl=Math.hypot(vx,vy)||1;vx=vx/vl*R*.07;vy=vy/vl*R*.08;
   c.fillStyle=NAVY;
   if(mood==='shock'){c.beginPath();c.arc(ex,ey,R*.06,0,Math.PI*2);c.fill();}
   else{c.beginPath();c.arc(ex+vx,ey+vy,R*.12,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(ex+vx-R*.04,ey+vy-R*.045,R*.04,0,Math.PI*2);c.fill();c.beginPath();c.arc(ex+vx+R*.035,ey+vy+R*.04,R*.018,0,Math.PI*2);c.fill();}
   c.strokeStyle=NAVY;c.lineWidth=R*.06;c.beginPath();
   if(mood==='happy'||mood==='smile'){c.moveTo(cx+s*R*.52,cy-R*.4);c.quadraticCurveTo(cx+s*R*.35,cy-R*.53,cx+s*R*.18,cy-R*.43);}
   else{c.moveTo(cx+s*R*.52,cy-R*.53);c.lineTo(cx+s*R*.2,cy-R*.55);}
   c.stroke();}
  const my=cy+R*.3;
  if(mood==='shock'){c.fillStyle=NAVY;ell(c,cx,my+R*.04,R*.1,R*.12);c.fill();}
  else if(mood==='happy'){c.beginPath();c.moveTo(cx-R*.3,my-R*.02);c.quadraticCurveTo(cx,my+R*.42,cx+R*.3,my-R*.02);c.closePath();c.fillStyle=NAVY;c.fill();
   c.save();c.clip();c.fillStyle='#ff7aa8';ell(c,cx,my+R*.2,R*.15,R*.08);c.fill();c.fillStyle='#fff';c.fillRect(cx-R*.06,my-R*.03,R*.12,R*.08);c.restore();}
  else{c.strokeStyle=NAVY;c.lineWidth=R*.055;c.beginPath();c.moveTo(cx-R*.24,my-R*.02);c.quadraticCurveTo(cx,my+R*.2,cx+R*.24,my-R*.02);c.stroke();}
 }
 drawStrands(c,m,cx,cy,R,o.blens,time,true,sil,o.guide==='beard');
 drawStrands(c,m,cx,cy,R,o.lens,time,false,sil,o.guide==='hair');
}

/* Capaldi Crew */
const CREW={
 haarriet:{name:'Haarriët',role:'Weet alles van haar. Echt álles.',skin:'#f3cba9',hair:'#b79cff',need:0,perk:'5 seconden extra tijd',
  pk:{time:5},lines:{i1:'Ik ben Haarriët en ik weet precies hoe het moet. Trim de baard tot een {s}. Stoppen bij de streepjes, hè!',i2:'Nu de schaar! Een {s}, daar heb ik er al duizend van geknipt.',short:['Zie je wel, te kort! Ik zei het toch?','Oeps! Kijk goed naar de streepjes.'],half:'Kijk, je luistert naar mij. Heel goed!',still:'Nu! Hij staat even stil. Snel knippen!'}},
 scharlotte:{name:'Scharlotte',role:'Knipt sneller dan je kunt kijken',skin:'#8d5a3b',hair:'#ff5fa2',need:0,perk:'Combo’s gaan dubbel zo snel',
  pk:{combo:.4},lines:{i1:'Zoem zoem! Trim de baard tot een {s}. Snel, maar wel netjes!',i2:'Schaar erbij! Een {s}, hup hup hup!',short:['Oeps, te snel! Stop bij het streepje.','Ho ho, rem even af!'],half:'Wauw, jij bent bijna net zo snel als ik!',still:'Nu, nu, nu! Knippen!'}},
 fohnaldo:{name:'Föhnaldo',role:'Blaast elk kapsel tot leven',skin:'#e0a878',hair:'#4a2c1a',need:2,perk:'Haar groeit langzamer',
  pk:{grow:.8},lines:{i1:'Dames en heren... Föhnaldo! Trim die baard tot een {s}, dan föhn ik hem glanzend.',i2:'Showtime! Knip een {s} en ik blaas het tot leven.',short:['Oei! Daar kan zelfs mijn föhn niks meer aan doen.','Te kort! Het publiek schrikt ervan!'],half:'Ja! Het publiek gaat uit z’n dak!',still:'Pauze in de show! Nu knippen!'}},
 kardashian:{name:'Knip Kardashian',role:'Kent alle haartrends. Tikkeltje diva.',skin:'#e8b48e',hair:'#3a2418',need:4,perk:'Dubbele bonus bij Precies!',
  pk:{exact:30},lines:{i1:'Hoi schat! Een {s} is hélemaal trending. Trimmen maar!',i2:'Een {s}? Zóóó dit seizoen. Knip maar!',short:['Oh nee, dat is zó vorig jaar. Niet te kort!','Schat... dat is géén trend.'],half:'Dit wordt een selfie waard!',still:'Stil voor de foto! Snel knippen!'}},
 gelda:{name:'Professor Gelda',role:'Heeft voor elke coupe een formule',skin:'#6e4128',hair:'#5fe0b5',need:6,perk:'Meer ruimte bij de streepjes',
  pk:{tol:.012},lines:{i1:'Volgens mijn formule: baard + tondeuse = {s}. Aan de slag!',i2:'Hypothese: jij knipt een perfecte {s}. Bewijs het maar!',short:['Hmm, foutje in de berekening. Te kort!','Dat klopt niet met mijn formule!'],half:'Fascinerend! Je zit al op de helft.',still:'De variabele staat stil. Nu knippen!'}},
 wilma:{name:'Wilma Wortelwax',role:'Uitvinder van de gekste waxkapsels',skin:'#f6d2b8',hair:'#ff7a1a',need:9,perk:'Gouden lokken komen vaker',
  pk:{gold:true},lines:{i1:'Ik ben Wilma Wortelwax, uitvinder! Trim de baard tot een {s}, dan doe ik er wax in.',i2:'Knip een {s}, dan bouw ik er iets geks van!',short:['Te kort! Daar kan zelfs mijn superwax niks aan plakken.','Oeps! Terug naar de tekentafel.'],half:'Boing! Mijn uitvindersbrein zegt: bijna klaar!',still:'Stilstaan! Nu is je kans!'}},
 petra:{name:'Petra Puntkam',role:'Duldt geen haar verkeerd',skin:'#c98f63',hair:'#2a2438',tag:'Jury'},
 lokkie:{name:'Lokkie',role:'Vangt alle losse lokken',tag:'Mascotte'}};
const PICKABLE=['haarriet','scharlotte','fohnaldo','kardashian','gelda','wilma'];
const totalStars=()=>M.reduce((n,m)=>n+(DB.dex[m.id]||0),0)+(DB.mem||0);
const MAXST=()=>M.length*3+3;
const crewOpen=id=>totalStars()>=CREW[id].need;
const host=()=>{const id=DB.crew;return id&&CREW[id]&&CREW[id].lines&&crewOpen(id)?id:'haarriet';};
const PK=()=>Object.assign({time:0,grow:1,tol:0,combo:.2,exact:15,gold:false},CREW[host()].pk);
function star4(c,x,y,r){c.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,rr=k%2?r*.35:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fill();}
function drawCrew(c,id,x,y,s,mood,sil){c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=NAVY;c.lineWidth=Math.max(1.5,s*.08);
 const LW=Math.max(1.5,s*.08);
 if(id==='lokkie'){c.fillStyle='#ff9f1c';for(const k of[-1,1]){ell(c,x+k*s*.45,y+s*.95,s*.3,s*.16);c.fill();c.stroke();}
  c.beginPath();for(let a=0;a<=60;a++){const t=a/60*Math.PI*2,r=s*(1+.1*Math.sin(t*11));const px=x+Math.cos(t)*r,py=y+Math.sin(t)*r;a?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.fillStyle='#ffc928';c.fill();c.stroke();
  c.beginPath();c.moveTo(x,y-s*.95);c.quadraticCurveTo(x+s*.5,y-s*1.6,x+s*.15,y-s*1.5);c.stroke();
  for(const k of[-1,1]){c.fillStyle='#fff';ell(c,x+k*s*.36,y-s*.12,s*.27,s*.32);c.fill();c.stroke();c.fillStyle=NAVY;c.beginPath();c.arc(x+k*s*.33,y-s*.06,s*.15,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x+k*s*.28,y-s*.13,s*.06,0,Math.PI*2);c.fill();}
  c.fillStyle='rgba(255,95,162,.45)';for(const k of[-1,1]){ell(c,x+k*s*.62,y+s*.3,s*.14,s*.08);c.fill();}
  c.fillStyle='#ff5fa2';c.strokeStyle=NAVY;c.lineWidth=Math.max(1.5,s*.06);for(const k of[-1,1]){c.beginPath();c.moveTo(x+s*.55,y-s*.82);c.lineTo(x+s*.55+k*s*.32,y-s*.98);c.lineTo(x+s*.55+k*s*.32,y-s*.66);c.closePath();c.fill();c.stroke();}
  capaldiMark(c,x+s*.55,y-s*.82,s*.17,true);
  c.lineWidth=Math.max(1.5,s*.08);c.beginPath();c.moveTo(x-s*.22,y+s*.32);c.quadraticCurveTo(x,y+s*(mood==='happy'?.75:.55),x+s*.22,y+s*.32);c.closePath();c.fillStyle=NAVY;c.fill();
  if(sil){c.globalCompositeOperation='source-atop';c.fillStyle='#c7cde0';c.fillRect(x-s*2,y-s*2,s*4,s*4);}
  c.restore();return;}
 const P=CREW[id];
 // schouders met Capaldi-schort
 c.fillStyle='#2b2733';c.beginPath();c.moveTo(x-s*1.6,y+s*2.4);c.quadraticCurveTo(x-s*1.5,y+s*.95,x,y+s*.95);c.quadraticCurveTo(x+s*1.5,y+s*.95,x+s*1.6,y+s*2.4);c.closePath();c.fill();c.stroke();
 capaldiMark(c,x,y+s*1.6,s*.3,false);
 // haar achter
 c.fillStyle=P.hair;
 if(id==='haarriet'){c.beginPath();c.arc(x,y-s*1.12,s*.42,0,Math.PI*2);c.fill();c.stroke();for(const[a,r]of[[200,.5],[235,.5],[270,.5],[305,.5],[340,.5],[175,.42],[5,.42]]){c.beginPath();c.arc(x+Math.cos(a*D)*s*.88,y+Math.sin(a*D)*s*.88,s*r,0,Math.PI*2);c.fill();c.stroke();}}
 if(id==='scharlotte'){c.save();c.translate(x+s*1.05,y-s*.55);c.rotate(-.5);ell(c,0,0,s*.6,s*.32);c.fill();c.stroke();c.restore();c.beginPath();c.arc(x,y-s*.08,s*1.1,Math.PI,0);c.fill();c.stroke();}
 if(id==='petra'){c.beginPath();c.moveTo(x-s*1.12,y+s*.75);c.lineTo(x-s*1.12,y-s*.2);c.arc(x,y-s*.2,s*1.12,Math.PI,0);c.lineTo(x+s*1.12,y+s*.75);c.closePath();c.fill();c.stroke();}
 if(id==='kardashian'){c.beginPath();c.moveTo(x-s*1.18,y+s*1.35);c.lineTo(x-s*1.18,y-s*.1);c.arc(x,y-s*.1,s*1.18,Math.PI,0);c.lineTo(x+s*1.18,y+s*1.35);c.quadraticCurveTo(x+s*.8,y+s*1.5,x+s*.7,y+s*1.1);c.lineTo(x-s*.7,y+s*1.1);c.quadraticCurveTo(x-s*.8,y+s*1.5,x-s*1.18,y+s*1.35);c.closePath();c.fill();c.stroke();}
 if(id==='fohnaldo'||id==='gelda'){c.beginPath();c.arc(x,y-s*.1,s*1.06,Math.PI,0);c.fill();c.stroke();}
 if(id==='wilma'){for(const k of[-1,1]){c.beginPath();c.arc(x+k*s*.95,y-s*.05,s*.4,0,Math.PI*2);c.fill();c.stroke();}}
 // nek + hoofd
 c.fillStyle=P.skin;c.fillRect(x-s*.28,y+s*.6,s*.56,s*.45);c.beginPath();c.arc(x,y,s,0,Math.PI*2);c.fill();c.stroke();
 // haar voor
 c.fillStyle=P.hair;
 if(id==='haarriet'){for(const a of[215,250,290,325]){c.beginPath();c.arc(x+Math.cos(a*D)*s*.78,y+Math.sin(a*D)*s*.78,s*.36,0,Math.PI*2);c.fill();}}
 if(id==='scharlotte'){c.beginPath();c.moveTo(x-s*.98,y-s*.15);c.quadraticCurveTo(x-s*.6,y-s*1.25,x+s*.95,y-s*.35);c.quadraticCurveTo(x+s*.2,y-s*.55,x-s*.98,y-s*.15);c.fill();c.stroke();
  c.strokeStyle='#22c3c3';c.lineWidth=s*.16;c.beginPath();c.arc(x,y-s*.05,s*.98,Math.PI*1.12,Math.PI*1.9);c.stroke();c.strokeStyle=NAVY;c.lineWidth=LW;}
 if(id==='petra'){c.beginPath();c.moveTo(x-s*.98,y-s*.3);c.arc(x,y-s*.3,s*.98,Math.PI,0);c.lineTo(x+s*.98,y-s*.3);c.closePath();c.fill();c.stroke();
  c.fillStyle='#ff9fd0';c.save();c.translate(x+s*.95,y-s*.05);c.rotate(.3);c.fillRect(-s*.08,-s*.45,s*.16,s*.9);c.strokeRect(-s*.08,-s*.45,s*.16,s*.9);c.restore();}
 if(id==='fohnaldo'){c.beginPath();c.moveTo(x-s*.98,y-s*.2);c.quadraticCurveTo(x-s*.95,y-s*1.5,x-s*.1,y-s*1.85);c.quadraticCurveTo(x+s*.9,y-s*2.05,x+s*1.2,y-s*1.4);c.quadraticCurveTo(x+s*.75,y-s*1.5,x+s*.6,y-s*1.2);c.quadraticCurveTo(x+s*1.05,y-s*.9,x+s*.98,y-s*.25);c.quadraticCurveTo(x+s*.2,y-s*.75,x-s*.98,y-s*.2);c.closePath();c.fill();c.stroke();
  c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=s*.09;c.beginPath();c.moveTo(x-s*.5,y-s*1.25);c.quadraticCurveTo(x-s*.1,y-s*1.65,x+s*.45,y-s*1.65);c.stroke();c.strokeStyle=NAVY;c.lineWidth=LW;
  c.fillStyle='#ffc928';star4(c,x+s*1.4,y-s*1.75,s*.28);star4(c,x-s*1.25,y-s*1.25,s*.18);
  c.fillStyle=GOLD;c.beginPath();c.moveTo(x,y+s*1.08);c.lineTo(x-s*.35,y+s*.88);c.lineTo(x-s*.35,y+s*1.28);c.closePath();c.moveTo(x,y+s*1.08);c.lineTo(x+s*.35,y+s*.88);c.lineTo(x+s*.35,y+s*1.28);c.closePath();c.fill();c.stroke();
  c.save();c.translate(x+s*1.45,y+s*.55);c.rotate(-.35);c.fillStyle='#ff5fa2';c.beginPath();c.roundRect(-s*.32,-s*.2,s*.64,s*.4,s*.12);c.fill();c.stroke();c.fillStyle='#22c3c3';c.fillRect(-s*.58,-s*.12,s*.26,s*.24);c.strokeRect(-s*.58,-s*.12,s*.26,s*.24);c.fillStyle='#ff5fa2';c.fillRect(-s*.08,s*.18,s*.18,s*.42);c.strokeRect(-s*.08,s*.18,s*.18,s*.42);c.restore();}
 if(id==='kardashian'){c.beginPath();c.moveTo(x-s*.98,y+s*.15);c.quadraticCurveTo(x-s*.92,y-s*1.05,x-s*.2,y-s*1.0);c.quadraticCurveTo(x+s*.92,y-s*.95,x+s*.98,y+s*.35);c.quadraticCurveTo(x+s*.55,y-s*.5,x-s*.25,y-s*.68);c.quadraticCurveTo(x-s*.72,y-s*.42,x-s*.98,y+s*.15);c.closePath();c.fill();c.stroke();
  c.fillStyle='#ff5fa2';for(const k of[-1,1]){const hx=x+k*s*.32,hy=y-s*.95,r=s*.2;c.beginPath();c.moveTo(hx,hy+r*1.1);c.bezierCurveTo(hx-r*1.6,hy-r*.2,hx-r*.6,hy-r*1.3,hx,hy-r*.35);c.bezierCurveTo(hx+r*.6,hy-r*1.3,hx+r*1.6,hy-r*.2,hx,hy+r*1.1);c.fill();c.stroke();}
  c.beginPath();c.moveTo(x-s*.12,y-s*1.0);c.lineTo(x+s*.12,y-s*1.0);c.stroke();
  c.strokeStyle=GOLD;c.lineWidth=s*.07;for(const k of[-1,1]){c.beginPath();c.arc(x+k*s*1.0,y+s*.42,s*.15,0,Math.PI*2);c.stroke();}c.strokeStyle=NAVY;c.lineWidth=LW;}
 if(id==='gelda'){c.beginPath();c.moveTo(x-s*1.0,y-s*.15);const N=5;for(let k=0;k<N;k++){const a1=(200+k*28)*D,a2=(214+k*28)*D,a3=(228+k*28)*D;c.lineTo(x+Math.cos(a1)*s*.95,y+Math.sin(a1)*s*.95);c.lineTo(x+Math.cos(a2)*s*1.85,y+Math.sin(a2)*s*1.85);c.lineTo(x+Math.cos(a3)*s*.95,y+Math.sin(a3)*s*.95);}
  c.lineTo(x+s*1.0,y-s*.15);c.quadraticCurveTo(x,y-s*.75,x-s*1.0,y-s*.15);c.closePath();c.fill();c.stroke();
  c.strokeStyle='#ffc928';c.lineWidth=s*.12;c.beginPath();c.moveTo(x-s*1.1,y-s*.45);c.lineTo(x-s*.75,y+s*.15);c.stroke();c.strokeStyle=NAVY;c.lineWidth=LW;}
 if(id==='wilma'){for(const[yy,rx,ry]of[[-.82,1.0,.38],[-1.22,.78,.32],[-1.56,.52,.26],[-1.82,.28,.18]]){ell(c,x,y+s*yy,s*rx,s*ry);c.fill();c.stroke();}
  c.beginPath();c.moveTo(x,y-s*1.98);c.quadraticCurveTo(x+s*.35,y-s*2.25,x+s*.12,y-s*2.3);c.stroke();
  c.strokeStyle=NAVY;c.lineWidth=s*.1;c.beginPath();c.moveTo(x-s*.98,y-s*.5);c.lineTo(x+s*.98,y-s*.5);c.stroke();c.lineWidth=LW;
  c.fillStyle='#7fd3ff';for(const k of[-1,1]){c.beginPath();c.arc(x+k*s*.33,y-s*.52,s*.22,0,Math.PI*2);c.fill();c.stroke();}
  c.fillStyle='rgba(201,111,60,.55)';for(const k of[-1,1])for(const[dx,dy]of[[.5,.2],[.62,.32],[.42,.36]]){c.beginPath();c.arc(x+k*s*dx,y+s*dy,s*.035,0,Math.PI*2);c.fill();}}
 // gezicht
 const happy=mood!=='stern';
 c.fillStyle='rgba(255,95,162,.3)';for(const k of[-1,1]){ell(c,x+k*s*.55,y+s*.28,s*.16,s*.09);c.fill();}
 for(const k of[-1,1]){c.fillStyle=NAVY;c.beginPath();c.arc(x+k*s*.36,y+s*.02,s*.11,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x+k*s*.33,y-s*.02,s*.04,0,Math.PI*2);c.fill();
  if(id==='kardashian'){c.beginPath();c.moveTo(x+k*s*.44,y-s*.08);c.lineTo(x+k*s*.56,y-s*.16);c.moveTo(x+k*s*.36,y-s*.1);c.lineTo(x+k*s*.4,y-s*.22);c.stroke();continue;}
  c.beginPath();if(id==='petra'&&!happy){c.moveTo(x+k*s*.56,y-s*.24);c.lineTo(x+k*s*.18,y-s*.17);}else if(id==='haarriet'){c.moveTo(x+k*s*.55,y-s*.3);c.quadraticCurveTo(x+k*s*.36,y-s*.42,x+k*s*.17,y-s*.3);}else if(id==='fohnaldo'){c.lineWidth=s*.12;c.moveTo(x+k*s*.55,y-s*.25);c.quadraticCurveTo(x+k*s*.36,y-s*.38,x+k*s*.18,y-s*.26);}else{c.moveTo(x+k*s*.53,y-s*.22);c.quadraticCurveTo(x+k*s*.36,y-s*.33,x+k*s*.19,y-s*.24);}c.stroke();c.lineWidth=LW;}
 if(id==='haarriet'){c.lineWidth=Math.max(1.5,s*.06);for(const k of[-1,1]){c.beginPath();c.arc(x+k*s*.36,y+s*.02,s*.24,0,Math.PI*2);c.stroke();}c.beginPath();c.moveTo(x-s*.12,y);c.lineTo(x+s*.12,y);c.stroke();c.lineWidth=LW;}
 if(id==='gelda'){c.lineWidth=Math.max(1.5,s*.06);for(const k of[-1,1]){c.strokeRect(x+k*s*.36-s*.22,y-s*.17,s*.44,s*.36);}c.beginPath();c.moveTo(x-s*.14,y);c.lineTo(x+s*.14,y);c.stroke();c.lineWidth=LW;}
 if(id==='kardashian'){c.fillStyle=NAVY;c.beginPath();c.arc(x+s*.42,y+s*.48,s*.035,0,Math.PI*2);c.fill();}
 c.beginPath();
 if(id==='kardashian'){c.moveTo(x-s*.28,y+s*.4);c.quadraticCurveTo(x,y+s*.75,x+s*.28,y+s*.4);c.quadraticCurveTo(x,y+s*.5,x-s*.28,y+s*.4);c.fillStyle='#e8336f';c.fill();c.stroke();}
 else if(id==='scharlotte'||id==='fohnaldo'||mood==='happy'){c.moveTo(x-s*.3,y+s*.38);c.quadraticCurveTo(x,y+s*.85,x+s*.3,y+s*.38);c.closePath();c.fillStyle=NAVY;c.fill();if(id==='fohnaldo'){c.fillStyle='#fff';c.fillRect(x-s*.2,y+s*.38,s*.4,s*.1);}}
 else if(id==='petra'&&!happy){c.moveTo(x-s*.2,y+s*.5);c.lineTo(x+s*.2,y+s*.5);c.stroke();}
 else{c.moveTo(x-s*.25,y+s*.42);c.quadraticCurveTo(x+s*.02,y+s*.68,x+s*.28,y+s*.38);c.stroke();}
 if(sil){c.globalCompositeOperation='source-atop';c.fillStyle='#c7cde0';c.fillRect(x-s*3,y-s*3,s*6,s*6);}
 c.restore();}
function portrait(cv,id,mood){const c=fitCanvas(cv,68,68);c.clearRect(0,0,68,68);if(id==='lokkie')drawCrew(c,id,34,36,19,mood);else{const big=id==='fohnaldo'||id==='wilma'||id==='gelda';drawCrew(c,id,34,big?38:33,big?13:16,mood);}}
let sayAt=0;
let VOICES=[];const TTS='speechSynthesis' in window;
function loadVoices(){try{VOICES=speechSynthesis.getVoices().filter(v=>/^nl/i.test(v.lang));}catch(e){}}
if(TTS){loadVoices();try{speechSynthesis.onvoiceschanged=loadVoices;}catch(e){}}
const VOX={haarriet:[1.05,.95],scharlotte:[1.12,1.02],fohnaldo:[.95,.98,'m'],kardashian:[1.15,.96],gelda:[1,.94],wilma:[1.08,.98],petra:[.95,.9],lokkie:[1.45,1.03]};
const FEM=/claire|ellen|fleur|colette|fenna|lotte|laura|anna|sanne|nederlands|female|vrouw/i,MAN=/xander|maarten|frank|arnaud|daan|\bmale\b|\bman\b/i,GOOD=/natural|neural|premium|enhanced|verbeterd|online|google/i;
function pickVoice(g){let best=null,bs=-99;for(const v of VOICES){const n=v.name;let sc=0;if(/nl[-_]nl/i.test(v.lang))sc+=2;if(GOOD.test(n))sc+=3;
 const f=FEM.test(n)&&!/\bmale\b/i.test(n.replace(/female/ig,'')),m=MAN.test(n.replace(/female/ig,''));
 if(g==='m'){sc+=m?5:f?-4:0;}else{sc+=f?5:m?-6:0;}if(v.localService===false)sc+=1;if(sc>bs){bs=sc;best=v;}}return best;}
function speak(id,text){if(muted||!voiceOn||!TTS)return;try{speechSynthesis.cancel();const t=text.replace(/["“”]/g,'').replace(/!/g,'!').replace(/:/g,',');
 const u=new SpeechSynthesisUtterance(t);const[p,r,g]=VOX[id]||[1,1];const v=pickVoice(g);if(v)u.voice=v;u.lang=v?v.lang:'nl-NL';u.pitch=p;u.rate=r;u.volume=1;speechSynthesis.speak(u);}catch(e){}}
const SPK_ON='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const SPK_OFF='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
let voiceOn=DB.voice!==false;
function setVoice(on){voiceOn=on;DB.voice=on;persist();if(!on){try{speechSynthesis.cancel();}catch(e){}}
 document.querySelectorAll('.spk').forEach(b=>{b.innerHTML=on?SPK_ON:SPK_OFF;b.classList.toggle('off',!on);b.setAttribute('aria-pressed',String(!on));b.setAttribute('aria-label',on?'Stem uitzetten':'Stem aanzetten');b.title=on?'Stem uit':'Stem aan';});
 if(!on)document.querySelectorAll('.say.invite').forEach(e=>e.classList.remove('invite'));
 const hb=$('#voicebtn');if(hb){hb.textContent='Stem: '+(on?'aan':'uit');hb.setAttribute('aria-pressed',String(!on));}}
document.querySelectorAll('.say').forEach(el=>{const b=document.createElement('button');b.type='button';b.className='spk';
 b.addEventListener('click',()=>{ac();el.classList.remove('invite');setVoice(!voiceOn);if(voiceOn)speak(el.dataset.who,el.dataset.text||'');});el.append(b);});
$('#voicebtn').addEventListener('click',()=>{ac();setVoice(!voiceOn);});
setVoice(voiceOn);
function say(sel,id,text,mood,force){const now=performance.now();if(sel==='#say-play'&&!force&&now-sayAt<2200)return;if(sel==='#say-play')sayAt=now;
 const el=$(sel);portrait(el.querySelector('canvas'),id,mood||'happy');el.querySelector('b').textContent=CREW[id].name;el.querySelector('span').textContent=text;el.dataset.who=id;el.dataset.text=text;
 if(navigator.userActivation&&!navigator.userActivation.hasBeenActive){if(voiceOn)el.classList.add('invite');return;}el.classList.remove('invite');speak(id,text);}
function renderCrew(){const el=$('#crew');el.textContent='';const ts=totalStars();
 
 [...PICKABLE,'petra','lokkie'].forEach(id=>{const P=CREW[id],pickable=!!P.lines,open=!pickable||crewOpen(id),chosen=pickable&&host()===id;
  const d=document.createElement('div');d.className='mate'+(open?'':' soon')+(chosen?' chosen':'');const cv=document.createElement('canvas');cv.setAttribute('aria-hidden','true');d.append(cv);
  const c=fitCanvas(cv,160,150);const big=id==='fohnaldo'||id==='wilma'||id==='gelda';
  if(id==='lokkie')drawCrew(c,id,80,78,42,'happy',!open);else drawCrew(c,id,80,big?74:62,big?28:32,id==='petra'?'stern':'happy',!open);
  if(!open){c.fillStyle='#fff';c.strokeStyle=NAVY;c.lineWidth=4;c.font='46px Bungee, Impact, sans-serif';c.textAlign='center';c.textBaseline='middle';c.strokeText('?',80,64);c.fillText('?',80,64);}
  const h=document.createElement('h3');h.textContent=open?P.name:'???';d.append(h);
  const p=document.createElement('p');p.textContent=open?P.role:`Speel ${P.need} sterren bij elkaar`;d.append(p);
  if(P.tag){const t=document.createElement('span');t.className='tag';t.textContent=P.tag;d.append(t);}
  else if(open){const pk=document.createElement('p');pk.className='perk';pk.textContent='Extra: '+P.perk;d.append(pk);if(L3[id]){const l3=document.createElement('span');l3.className='tag l3tag';l3.textContent='Level 3: '+L3[id].name;d.append(l3);}
   const mb=document.createElement('button');mb.type='button';mb.className='meetbtn';mb.textContent='Stel je voor';mb.addEventListener('click',()=>{ac();openMeet(id,false);});d.append(mb);
   const b=document.createElement('button');b.type='button';b.className=chosen?'pickbtn on':'pickbtn';b.textContent=chosen?'Jouw kapper':'Kies';b.setAttribute('aria-pressed',String(chosen));
   b.addEventListener('click',()=>{DB.crew=id;persist();tone(784,.1,'square',.05);tone(1046,.15,'square',.05,.08);renderCrew();updateAgebar();if(!$('#s-intro').hidden&&STEPS[WI].k==='kapper'){WSUB=99;say('#say-start',id,`Hoi! Ik ben ${P.name} en ik ben nu jouw kapper. Tik op ${WSINGLE?'Klaar':'Verder'}.`,'happy');$('#w-next').textContent=WSINGLE?'Klaar':'Verder';updNext();}});d.append(b);}
  else{const bar=document.createElement('div');bar.className='need';bar.innerHTML=`<i style="width:${Math.min(100,ts/P.need*100)}%"></i>`;bar.setAttribute('aria-label',`${ts} van ${P.need} sterren`);d.append(bar);}
  el.append(d);});}
function updateAgebar(){const e=$('#a-crew');if(e)e.textContent=CREW[host()].name;}

/* Knipdex + Top 5 */
function fitCanvas(cv,w,h){const d=Math.min(2,devicePixelRatio||1);cv.width=w*d;cv.height=h*d;const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);return c;}
const styledLens=m=>Array.from({length:m.n},(_,i)=>m.target(i/(m.n-1),i));
const styledBeard=m=>Array.from({length:m.beard.n},(_,i)=>m.beard.target(i/(m.beard.n-1),i));
function preview(cv,m,w,h,styled,sil,mood,blens,lens){const c=fitCanvas(cv,w,h);c.clearRect(0,0,w,h);
 const{R,cy}=fitR(w,h);
 c.fillStyle=sil?'rgba(29,43,79,.05)':'rgba(255,255,255,.6)';c.beginPath();c.arc(w/2,cy-R*.4,R*1.9,0,Math.PI*2);c.fill();
 drawMonster(c,m,w/2,cy,R,{lens:lens||(styled?styledLens(m):null),blens:blens||(styled?styledBeard(m):null),sil,mood:mood||(styled?'happy':'smile'),time:1.3});}
function renderDex(){const el=$('#dex');el.textContent='';
 M.forEach(m=>{const best=DB.dex[m.id]||0,open=unlocked(m);
  const b=document.createElement('button');b.type='button';b.className='card';b.style.setProperty('--tc',m.tc);b.disabled=!open;
  b.setAttribute('aria-label',open?`Speel met ${m.name}`:'Geheim monster, nog op slot');
  const cv=document.createElement('canvas');b.append(cv);
  const no=document.createElement('span');no.className='no';no.textContent='#'+m.no;b.append(no);
  if(!open){const q=document.createElement('div');q.className='locked-q';q.textContent='?';b.append(q);}
  const h=document.createElement('h3');h.textContent=open?m.name:'???';b.append(h);
  const meta=document.createElement('div');meta.className='meta';
  meta.innerHTML=open?`<span class="chip">${m.type}</span><span class="pips" title="Moeilijkheid">${'●'.repeat(m.lvl)}${'○'.repeat(4-m.lvl)}</span><span>${moveLabel(m)}</span>`
   :`<span>Verdien bij alle drie monsters een ster</span>`;
  b.append(meta);
  if(open){const st=document.createElement('div');st.className='starline';st.innerHTML=[1,2,3].map(i=>`<span class="${i<=best?'on':''}">★</span>`).join('');st.setAttribute('aria-label',`${best} van 3 sterren`);b.append(st);}
  b.addEventListener('click',()=>{ac();start(m);});
  el.append(b);preview(cv,m,240,220,best>0,!open);
 });}
function renderBoard(){const el=$('#board');el.textContent='';
 const g=GRP?GRP.id:3;$('#b-grp').textContent=GRP?'· '+GRP.label:'';const top=[...DB.scores].filter(s=>(s.g??3)===g).sort((a,b)=>b.score-a.score).slice(0,5);
 if(!top.length){const li=document.createElement('li');li.className='empty';li.textContent='Nog geen scores in deze leeftijdsgroep. Wie wordt de eerste topkapper?';el.append(li);return;}
 top.forEach(s=>{const li=document.createElement('li');const nm=document.createElement('span');nm.className='nm';nm.textContent=s.nick;
  const sm=document.createElement('small');sm.textContent=s.monster+' · '+'★'.repeat(s.stars||0);nm.append(sm);
  const sc=document.createElement('span');sc.className='sc';sc.textContent=s.score;li.append(nm,sc);el.append(li);});}

/* spel */
const cv=$('#cv');let ctx,W=0,H=0,R=0,CX=0,CY=0,BX=0,BY=0;
const S={m:null,lvl:1,hair:[],beard:[],score:0,left:0,t:0,cd:0,run:false,combo:1,lastCut:-9,shock:0,shake:0,falls:[],floats:[],trail:[],ptr:{x:0,y:0,down:false,in:false},last:0,neat:0,shorts:0,res:[],banner:''};
const bubbles=Array.from({length:14},(_,i)=>({x:rnd(i+1),y:rnd(i+50),r:.02+rnd(i+90)*.05,v:.01+rnd(i+7)*.02}));
function layout(){const r=cv.getBoundingClientRect();W=r.width;H=r.height;ctx=fitCanvas(cv,W,H);const f=fitR(W,H,document.body.classList.contains('phone'));R=f.R;BY=f.cy;BX=W/2;CX=BX+(S.ox||0);CY=BY+(S.oy||0);}
function show(id){['#s-intro','#s-start','#s-play','#s-end','#s-mem','#s-color'].forEach(s=>$(s).hidden=s!==id);document.body.classList.toggle('playing',id==='#s-play');window.scrollTo({top:0});}
function placeSay(){const sp=$('#say-play'),st=$('.stage');if(document.body.classList.contains('phone'))st.append(sp);else st.after(sp);}
function setDevice(d,go){DB.device=d;persist();document.body.classList.toggle('phone',d==='phone');placeSay();
 const b=$('#devbtn');b.hidden=false;b.textContent='Scherm: '+(d==='phone'?'telefoon':'tablet');document.querySelectorAll('.dev').forEach(x=>x.classList.toggle('sel',x.dataset.dev===d));}
document.querySelectorAll('.dev').forEach(b=>b.addEventListener('click',()=>{ac();tone(784,.1,'square',.05);setDevice(b.dataset.dev);updNext();setTimeout(()=>{if(STEPS[WI].k==='scherm'&&!$('#s-intro').hidden){WSUB=99;nextStep();}},450);}));
$('#devbtn').addEventListener('click',()=>{if(S.run){S.run=false;humOff();}goStep(1,true);});
{const rec=matchMedia('(max-width:600px)').matches?'phone':'tablet';const b=document.querySelector(`.dev[data-dev="${rec}"]`);const t=document.createElement('span');t.className='rec';t.textContent='Past bij dit scherm';b.append(t);}
const L=()=>S.lvl===1?{n:S.m.beard.n,arr:S.beard,geom:geomB,grow:S.m.beard.grow*GRP.grow*PK().grow,time:Math.round(S.m.beard.time*GRP.time)+PK().time,tgt:(u,i)=>S.m.beard.target(u,i),style:S.m.beard.style}
                     :{n:S.m.n,arr:S.hair,geom:geomH,grow:S.m.grow*GRP.grow*PK().grow,time:Math.round(S.m.time*GRP.time)+PK().time,tgt:(u,i)=>S.m.target(u,i),style:S.m.style};
function start(m){if(!GRP)return;TOL=GRP.tol+PK().tol;S.m=m;
 S.hair=Array.from({length:m.n},(_,i)=>({Lf:.86+rnd(m.seed*7+i)*.14}));
 S.beard=Array.from({length:m.beard.n},(_,i)=>({Lf:.85+rnd(m.seed*5+i)*.15}));
 Object.assign(S,{lvl:1,score:0,res:[],run:true,mode:'knip'});
 $('#h-name').textContent=m.name;show('#s-play');layout();beginLevel();S.last=performance.now();requestAnimationFrame(frame);}
function beginLevel(){const l=L();
 Object.assign(S,{goldSaid:false,growSaid:false,growFloat:0,gold:null,nextGold:(S.t||0)+(PK().gold?5:9),lokJump:0,halfSaid:false,wasStill:false,ox:0,oy:0,vx:0,vy:0,mt:0,nextTurn:0,still:false,left:l.time,t:S.t||0,cd:3,combo:1,lastCut:-9,shock:0,shake:0,falls:[],floats:[],trail:[],neat:0,shorts:0});
 S.banner=S.lvl===1?'Level 1 · Tondeuse':'Level 2 · Schaar';$('#st-neat small').textContent='Netjes';
 $('#h-lvl').textContent=S.lvl===1?'Level 1 · Tondeuse':'Level 2 · Schaar';
 $('#h-hint').innerHTML=S.lvl===1?`Trim de baard tot een <b>${l.style}</b>. Houd ingedrukt en beweeg de tondeuse.`:`Knip het haar tot een <b>${l.style}</b>. Sleep door de haren.`;
 say('#say-play',host(),CREW[host()].lines[S.lvl===1?'i1':'i2'].replace('{s}',l.style),'happy',true);
 hud();[0,.75,1.5].forEach(w=>tone(660,.12,'square',.05,w));tone(990,.3,'square',.06,2.25);}
function hud(){const l=L();$('#h-score').textContent=Math.round(S.score);$('#h-neat').textContent=`${S.neat}/${l.n}`;
 const f=Math.max(0,S.left/l.time),tb=$('#h-time');tb.style.transform=`scaleX(${f})`;tb.classList.toggle('low',S.left<8);}
function segX(a,b,c,d){const r1=b[0]-a[0],r2=b[1]-a[1],s1=d[0]-c[0],s2=d[1]-c[1],den=r1*s2-r2*s1;if(Math.abs(den)<1e-9)return null;
 const t=((c[0]-a[0])*s2-(c[1]-a[1])*s1)/den,u=((c[0]-a[0])*r2-(c[1]-a[1])*r1)/den;return t>=0&&t<=1&&u>=0&&u<=1?{t,u}:null;}

function applyCut(s,i,g,P,j,u,tool){const m=S.m,l=L();
 const pos=(j+u)/(P.length-1),nL=Math.max(.04,s.Lf*pos);if(s.Lf-nL<.025)return false;
 const hp=[P[j][0]+(P[j+1][0]-P[j][0])*u,P[j][1]+(P[j+1][1]-P[j][1])*u];
 S.falls.push({pts:[hp,...P.slice(j+1)].map(p=>[p[0],p[1]]),vx:(Math.random()-.5)*120,vy:-50-Math.random()*60,vr:(Math.random()-.5)*4,life:1.3,col:m.hair[(i+(S.lvl===1?1:0))%m.hair.length],w:R*(S.lvl===1?.065:.075)});
 const tgt=g.t,old=s.Lf;s.Lf=nL;
 if(nL<tgt-TOL){S.score=Math.max(0,S.score-(tool==='clip'?20:30));S.shorts++;S.shock=.7;S.shake=.2;oops();S.floats.push({x:hp[0],y:hp[1],txt:'Te kort!',col:'#ff4d6d',life:1});say('#say-play',host(),CREW[host()].lines.short[S.shorts%2]);}
 else{const exact=Math.abs(nL-tgt)<TOL*.45,bonus=exact?PK().exact:0;
  if(tool==='cut'){S.combo=S.t-S.lastCut<.6?Math.min(3,S.combo+PK().combo):1;S.lastCut=S.t;snip();}else S.combo=1;
  const pts=Math.round((old-Math.max(nL,tgt))*100*S.combo)+bonus;S.score+=pts;
  if(exact||pts>=8)S.floats.push({x:hp[0],y:hp[1],txt:(exact?'Precies! ':'')+'+'+pts+(S.combo>1.3?' ×'+S.combo.toFixed(1):''),col:exact?'#2fb36b':'#8a5cf6',life:.9});}
 return true;}
function cutAlong(a,b){const m=S.m,l=L();
 l.arr.forEach((s,i)=>{const g=l.geom(m,i,CX,CY,R),P=strandPts(m,g,i,s.Lf,S.t,R,S.lvl===1);
  for(let j=0;j<P.length-1;j++){const h=segX(a,b,P[j],P[j+1]);if(h){applyCut(s,i,g,P,j,h.u,'cut');break;}}});}
function clipAt(x,y){const m=S.m,l=L(),rc=R*.17;
 l.arr.forEach((s,i)=>{const g=l.geom(m,i,CX,CY,R),P=strandPts(m,g,i,s.Lf,S.t,R,true);
  outer:for(let j=0;j<P.length-1;j++)for(let k=0;k<4;k++){const u=k/4,px=P[j][0]+(P[j+1][0]-P[j][0])*u,py=P[j][1]+(P[j+1][1]-P[j][1])*u;
   if(Math.hypot(px-x,py-y)<rc){applyCut(s,i,g,P,j,u,'clip');break outer;}}});}

function moveMonster(dt){const m=S.m,E=eff(m);if(!E.move)return;S.mt+=dt;
 const mxX=Math.max(0,W/2-1.7*R),mxY=R*.3;
 if(E.move===1){S.ox=Math.sin(S.mt*.55*E.fq)*Math.min(mxX,W*.2)*E.amp;S.oy=Math.sin(S.mt*.8*E.fq)*mxY*.6*E.amp;S.still=false;}
 else{const cyc=2.6+E.pause,ph=S.mt%cyc,e=ph<2.6?1:0;S.still=e===0;
  if(S.mt>=S.nextTurn){const a=Math.random()*Math.PI*2,sp=W*E.speed;S.vx=Math.cos(a)*sp;S.vy=Math.sin(a)*sp*.5;S.nextTurn=S.mt+.35+Math.random()*.35;}
  S.ox+=S.vx*e*dt;S.oy+=S.vy*e*dt;
  if(Math.abs(S.ox)>mxX){S.ox=Math.sign(S.ox)*mxX;S.vx*=-1;}if(Math.abs(S.oy)>mxY){S.oy=Math.sign(S.oy)*mxY;S.vy*=-1;}}
 CX=BX+S.ox;CY=BY+S.oy;}
function pos(e){const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
cv.addEventListener('pointerdown',e=>{ac();cv.setPointerCapture(e.pointerId);const p=pos(e);if(S.lvl===3){Object.assign(S.ptr,p,{down:true,in:true});if(S.run&&S.cd<=0){if(S.k3==='fohnaldo')humOn();tap3(p,false);}return;}if(S.gold&&S.run&&Math.hypot(p.x-(S.gold.drawX??S.gold.x),p.y-S.gold.y)<R*.48)catchGold();Object.assign(S.ptr,p,{down:true,in:true});S.trail=[{x:p.x,y:p.y,t:S.t}];if(S.lvl===1&&S.run)humOn();});
cv.addEventListener('pointermove',e=>{const p=pos(e),prev={x:S.ptr.x,y:S.ptr.y};Object.assign(S.ptr,p,{in:true});if(S.lvl===3){if(S.ptr.down&&S.run&&S.cd<=0&&S.k3==='wilma')tap3(p,true);return;}
 if(S.ptr.down&&S.run&&S.cd<=0){if(S.lvl===2){S.trail.push({x:p.x,y:p.y,t:S.t});cutAlong([prev.x,prev.y],[p.x,p.y]);}
  else{const st=Math.max(1,Math.ceil(Math.hypot(p.x-prev.x,p.y-prev.y)/(R*.1)));for(let k=1;k<=st;k++)clipAt(prev.x+(p.x-prev.x)*k/st,prev.y+(p.y-prev.y)*k/st);}}});
const up=()=>{S.ptr.down=false;humOff();};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('pointerleave',()=>{S.ptr.in=false;up();});

function catchGold(){const g=S.gold;S.gold=null;S.score+=50;S.lokJump=.6;S.floats.push({x:g.x,y:g.y,txt:'Gouden lok! +50',col:'#c9a063',life:1.1});
 [880,1175,1568].forEach((f,i)=>tone(f,.12,'triangle',.07,i*.07));say('#say-play','lokkie',['Hap! Gevangen! Gouden lokken zijn mijn lievelingseten.','Joepie, nog eentje voor mijn verzameling!','Mmm, goudglanzend! Dankjewel!'][Math.floor(Math.random()*3)],'happy',true);}
function goldTick(dt){if(S.cd>0)return;
 if(!S.gold&&S.t>S.nextGold){S.gold={x:W*(.18+Math.random()*.64),y:-R*.3,vy:H*.085,ph:Math.random()*6};if(!S.goldSaid){S.goldSaid=true;say('#say-play','lokkie','Kijk, een gouden lok! Tik er snel op, dan vang ik hem!','happy',true);}S.nextGold=S.t+(PK().gold?4+Math.random()*3:8+Math.random()*5);}
 if(S.gold){const g=S.gold;g.y+=g.vy*dt;g.ph+=dt;if(g.y>H+R*.3)S.gold=null;}
 S.lokJump=Math.max(0,S.lokJump-dt);
 if(S.still&&!S.wasStill)say('#say-play',host(),CREW[host()].lines.still,'happy',true);S.wasStill=S.still;
 if(!S.halfSaid&&S.neat/L().n>=.5){S.halfSaid=true;say('#say-play',host(),CREW[host()].lines.half,'happy',true);}}
function frame(ts){if(!S.run)return;const dt=Math.min(.05,(ts-S.last)/1000||0);S.last=ts;S.t+=dt;const l=L();
 goldTick(dt);if(S.cd>0){S.cd-=dt;}else{S.left-=dt;moveMonster(dt);l.arr.forEach(s=>{s.Lf=Math.min(1,s.Lf+l.grow*dt);});if(S.lvl===1&&S.ptr.down)clipAt(S.ptr.x,S.ptr.y);}
 S.shock=Math.max(0,S.shock-dt);S.shake=Math.max(0,S.shake-dt);
 S.falls=S.falls.filter(f=>{f.life-=dt;f.vy+=700*dt;f.pts.forEach(p=>{p[0]+=f.vx*dt;p[1]+=f.vy*dt;});return f.life>0;});
 S.floats=S.floats.filter(f=>{f.life-=dt;f.y-=40*dt;return f.life>0;});
 S.trail=S.trail.filter(p=>S.t-p.t<.16);
 S.neat=0;l.arr.forEach((s,i)=>{const t=l.tgt(i/(l.n-1),i),neat=s.Lf>=t-TOL&&s.Lf<=t+TOL;if(neat)S.neat++;
  if(S.cd<=0&&s.wasNeat&&!neat&&s.Lf>t+TOL){const g=l.geom(S.m,i,CX,CY,R),tx=g.ax+Math.cos(g.d)*s.Lf*g.ml,ty=g.ay+Math.sin(g.d)*s.Lf*g.ml;
   if(S.t-S.growFloat>.45){S.growFloat=S.t;S.floats.push({x:tx,y:ty-R*.06,txt:'Groeit aan!',col:'#e8701f',life:1.1});}
   if(!S.growSaid){S.growSaid=true;say('#say-play',host(),'Kijk, dat haartje groeit weer aan! Knip het bij voor extra punten.','happy',true);}}
  s.wasNeat=neat;});
 render();hud();
 if(S.cd<=0&&S.neat/l.n>=.9)return levelDone(true);
 if(S.left<=0)return levelDone(false);
 requestAnimationFrame(frame);}
function drawRoom(c,t){
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#bfeaff');g.addColorStop(1,'#eaf8ff');c.fillStyle=g;c.fillRect(-10,-10,W+20,H+20);
 bubbles.forEach(b=>{const y=((b.y-t*b.v*(RM?0:1))%1+1)%1;c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(b.x*W,y*H,b.r*Math.min(W,H),0,Math.PI*2);c.fill();});
 c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(BX,BY-R*.35,R*2.1,0,Math.PI*2);c.fill();for(const[col,lw]of[[NAVY,8],[GOLDG,4]]){c.strokeStyle=col;c.lineWidth=lw;c.lineCap='round';c.beginPath();c.arc(BX,BY-R*.35,R*2.1,Math.PI/2+.08,Math.PI/2-.08+Math.PI*2);c.stroke();}c.lineCap='butt';
 const fy=BY+R*1.45;c.fillStyle='#ffe3f0';c.fillRect(0,fy,W,H-fy);c.fillStyle='#ffc8e0';for(let x=0;x<W;x+=40)c.fillRect(x,fy,20,H-fy);salonDecor(c,W,H,R,BX,fy+R*.06,!document.body.classList.contains('phone'));
}
function render(){const c=ctx,t=S.t;c.save();c.clearRect(0,0,W,H);
 if(S.shake>0&&!RM)c.translate((Math.random()-.5)*6,(Math.random()-.5)*6);
 drawRoom(c,t);
 const l=L(),prog=S.neat/l.n,mood=S.shock>0?'shock':prog>.5||S.still?'happy':'smile';
 drawMonster(c,S.m,CX,CY,R,{lens:S.hair.map(s=>s.Lf),blens:S.beard.map(s=>s.Lf),time:t,look:S.ptr.in?S.ptr:null,mood,guide:S.cd>0&&S.lvl===1&&false?null:(S.lvl===1?'beard':'hair')});
 S.falls.forEach(f=>{c.globalAlpha=Math.min(1,f.life);c.strokeStyle=f.col;c.lineWidth=f.w;c.lineCap='round';pathPts(c,f.pts,true);c.stroke();});c.globalAlpha=1;
 if(S.trail.length>1){c.lineCap='round';for(let k=1;k<S.trail.length;k++){const a=S.trail[k-1],b=S.trail[k],al=1-(t-b.t)/.16;c.strokeStyle=`rgba(255,95,162,${al*.8})`;c.lineWidth=R*.06*al+1;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}}
 if(S.gold){const g=S.gold,gx=g.x+Math.sin(g.ph*3)*R*.12;g.drawX=gx;drawGold(c,gx,g.y,R,g.ph,true);}
 {const ls=R*.3,jy=Math.sin(Math.min(1,S.lokJump/.6)*Math.PI)*R*.4;drawCrew(c,'lokkie',W-ls*1.6,H-ls*1.2-jy,ls,'happy');}
 S.floats.forEach(f=>{c.globalAlpha=Math.min(1,f.life*1.5);c.font=`${Math.round(Math.max(14,R*.15))}px Bungee, Impact, sans-serif`;c.textAlign='center';c.lineWidth=5;c.strokeStyle='#fff';c.strokeText(f.txt,f.x,f.y);c.fillStyle=f.col;c.fillText(f.txt,f.x,f.y);});c.globalAlpha=1;
 if(S.still&&S.cd<=0){c.textAlign='center';c.font=`${Math.round(Math.max(16,R*.2))}px Bungee, Impact, sans-serif`;c.lineWidth=6;c.strokeStyle='#fff';c.strokeText('Stil! Nu knippen!',W/2,R*.35);c.fillStyle='#2fb36b';c.fillText('Stil! Nu knippen!',W/2,R*.35);}
 if(S.ptr.in){if(S.lvl===1)clipper(c,S.ptr.x,S.ptr.y,R,S.ptr.down,t);else scissors(c,S.ptr.x,S.ptr.y,R*.32,S.ptr.down);}
 if(S.cd>0){const el=3-S.cd,lbl=el<.75?'3':el<1.5?'2':el<2.25?'1':(S.lvl===1?'TRIM!':'KNIP!');
  c.fillStyle='rgba(234,246,255,.55)';c.fillRect(0,0,W,H);c.textAlign='center';c.textBaseline='middle';
  c.font=`${Math.round(Math.max(16,R*.2))}px Bungee, Impact, sans-serif`;c.lineWidth=6;c.strokeStyle='#fff';c.save();c.font=`italic 500 ${Math.round(Math.max(14,R*.17))}px "Bodoni Moda", Georgia, serif`;c.lineJoin='round';c.lineWidth=5;c.strokeStyle='#fff';c.strokeText('Welkom bij Capaldi Kappers',W/2,H*.24-R*.3);c.fillStyle=NAVY;c.fillText('Welkom bij Capaldi Kappers',W/2,H*.24-R*.3);c.restore();c.strokeText(S.banner,W/2,H*.24);c.fillStyle=NAVY;c.fillText(S.banner,W/2,H*.24);
  c.font=`${Math.round(R*.95)}px Bungee, Impact, sans-serif`;c.lineJoin='round';c.lineWidth=14;c.strokeStyle=NAVY;c.strokeText(lbl,W/2,H*.46);c.fillStyle='#ffc928';c.fillText(lbl,W/2,H*.46);
  c.font=`700 ${Math.round(Math.max(15,R*.15))}px Rubik, sans-serif`;c.lineWidth=5;c.strokeStyle='#fff';const sub=(S.lvl===1?'Baard: ':'Kapsel: ')+l.style;c.strokeText(sub,W/2,H*.46+R*.72);c.fillStyle=NAVY;c.fillText(sub,W/2,H*.46+R*.72);c.textBaseline='alphabetic';}
 c.restore();}
function drawGold(c,x,y,R,ph,label){c.save();
 const pulse=.5+.5*Math.sin(ph*6),hr=R*(.36+.06*pulse);
 const gr=c.createRadialGradient(x,y,R*.05,x,y,hr);gr.addColorStop(0,'rgba(255,224,102,.95)');gr.addColorStop(1,'rgba(255,224,102,0)');c.fillStyle=gr;c.beginPath();c.arc(x,y,hr,0,Math.PI*2);c.fill();
 c.strokeStyle=`rgba(255,201,40,${.4+.5*pulse})`;c.lineWidth=3;c.setLineDash([6,6]);c.beginPath();c.arc(x,y,R*.4,0,Math.PI*2);c.stroke();c.setLineDash([]);
 c.translate(x,y);c.rotate(Math.sin(ph*2)*.35);c.lineCap='round';
 c.strokeStyle=NAVY;c.lineWidth=R*.16;c.beginPath();c.moveTo(-R*.02,-R*.26);c.bezierCurveTo(R*.32,-R*.12,-R*.32,R*.06,R*.06,R*.27);c.stroke();
 c.strokeStyle='#ffc928';c.lineWidth=R*.1;c.stroke();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=R*.03;c.beginPath();c.moveTo(R*.02,-R*.2);c.bezierCurveTo(R*.2,-R*.12,-R*.1,-R*.02,-R*.06,R*.04);c.stroke();
 c.rotate(-Math.sin(ph*2)*.35);c.fillStyle='#fff';
 for(const[dx,dy,o]of[[.26,-.22,0],[-.28,.1,2],[.2,.24,4]]){c.globalAlpha=.4+.6*Math.abs(Math.sin(ph*5+o));star4(c,R*dx,R*dy,R*.07);}c.globalAlpha=1;
 if(label){c.font=`${Math.round(Math.max(15,R*.17))}px Bungee, Impact, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=6;c.strokeStyle='#fff';const ly=-R*.52-pulse*R*.04;c.strokeText('TIK!',0,ly);c.fillStyle='#ff5fa2';c.fillText('TIK!',0,ly);c.textBaseline='alphabetic';}
 c.restore();}
function scissors(c,x,y,s,closed){c.save();c.translate(x,y);c.rotate(-.6);const o=closed?.08:.38;c.lineCap='round';c.lineJoin='round';
 for(const sg of[-1,1]){c.save();c.rotate(sg*o);c.fillStyle='#f4f6fb';c.strokeStyle=NAVY;c.lineWidth=2.5;
  c.beginPath();c.moveTo(0,0);c.lineTo(-s*1.05,sg*s*.06);c.lineTo(-s*.05,sg*s*.15);c.closePath();c.fill();c.stroke();
  c.strokeStyle=NAVY;c.lineWidth=s*.2;c.beginPath();c.arc(s*.42,sg*s*.22,s*.17,0,Math.PI*2);c.stroke();
  c.strokeStyle=sg<0?'#ff5fa2':'#22c3c3';c.lineWidth=s*.12;c.stroke();c.restore();}
 c.fillStyle='#ffc928';c.strokeStyle=NAVY;c.lineWidth=2;c.beginPath();c.arc(0,0,s*.08,0,Math.PI*2);c.fill();c.stroke();c.restore();}
function clipper(c,x,y,R,on,t){const rc=R*.17;c.save();
 c.setLineDash([5,5]);c.strokeStyle='rgba(29,43,79,.45)';c.lineWidth=2;c.beginPath();c.arc(x,y,rc,0,Math.PI*2);c.stroke();c.setLineDash([]);
 const j=on&&!RM?Math.sin(t*90)*1.5:0;c.translate(x+j,y);c.rotate(.55);
 const bw=R*.36,bh=R*.1;
 c.fillStyle='#e9edf5';c.strokeStyle=NAVY;c.lineWidth=2.5;c.beginPath();c.roundRect(-bw/2,-bh/2,bw,bh,3);c.fill();c.stroke();
 c.strokeStyle=NAVY;c.lineWidth=1.5;for(let k=-bw/2+5;k<bw/2-2;k+=5){c.beginPath();c.moveTo(k,-bh/2);c.lineTo(k,-bh/2-R*.035);c.stroke();}
 c.fillStyle='#22c3c3';c.lineWidth=2.5;c.beginPath();c.moveTo(-bw*.48,bh/2);c.lineTo(bw*.48,bh/2);c.lineTo(bw*.34,bh/2+R*.75);c.quadraticCurveTo(0,bh/2+R*.86,-bw*.34,bh/2+R*.75);c.closePath();c.fill();c.stroke();
 c.fillStyle='#ffc928';c.beginPath();c.roundRect(-R*.05,bh/2+R*.18,R*.1,R*.18,R*.04);c.fill();c.stroke();
 c.fillStyle=on?'#2fb36b':'#ff5fa2';c.beginPath();c.arc(0,bh/2+R*.5,R*.035,0,Math.PI*2);c.fill();
 c.restore();}

function levelDone(win){humOff();const l=L(),prog=S.neat/l.n;
 const stars=win?3:prog>=.7?2:prog>=.4?1:0,bonus=win?Math.round(S.left*10):0;S.score+=bonus;
 S.res.push({stars,win,neat:S.neat,n:l.n,bonus});
 if(S.lvl===1){if(win)fanfare();else tone(440,.25,'triangle',.07);S.lvl=2;S.ptr.down=false;beginLevel();S.banner=win?'Baard klaar! Level 2 · Schaar':'Level 2 · Schaar';requestAnimationFrame(frame);return;}
 if(hasL3()){if(win)fanfare();else tone(440,.25,'triangle',.07);begin3();S.last=performance.now();requestAnimationFrame(frame3);return;}
 finish();}
let RES=null;
function finish(){S.run=false;S.ptr.down=false;humOff();const m=S.m,[a,b,c3]=S.res;
 const score=Math.round(S.score),both=a.win&&b.win,stars=both?3:Math.round((a.stars+b.stars)/2);
 const before=PICKABLE.filter(crewOpen);DB.dex[m.id]=Math.max(DB.dex[m.id]||0,stars);persist();
 const fresh=PICKABLE.filter(id=>crewOpen(id)&&!before.includes(id));const ue=$('#e-unlock');ue.hidden=!fresh.length;if(fresh.length){ue.textContent=`Nieuw in je Crew: ${fresh.map(id=>CREW[id].name).join(' en ')}!`;tone(1318,.25,'triangle',.07,.6);meetQ=fresh.slice();setTimeout(()=>{if(!$('#s-end').hidden&&meetQ.length)openMeet(meetQ.shift(),true);},1600);}
 RES={score,stars,monster:m.name,saved:false};
 $('#e-eyebrow').textContent=`Capaldi Kappers · ${m.type} #${m.no}`;
 $('#e-title').textContent=stars===3?`${m.name} is helemaal klaar!`:stars>0?'Bijna in model!':'Wat een bos haar!';
 const st=$('#e-stars');st.innerHTML=[1,2,3].map(i=>`<span class="${i<=stars?'on':''}">★</span>`).join('');st.setAttribute('aria-label',`${stars} van 3 sterren`);
 $('#e-score').textContent=score;
 $('#e-l1').textContent=`Baard (${m.beard.style}): ${'★'.repeat(a.stars)||'–'}`;
 $('#e-l2').textContent=`Haar (${m.style}): ${'★'.repeat(b.stars)||'–'}`;
 const e3=$('#e-l3');e3.hidden=!c3;if(c3)e3.textContent=`${L3[c3.l3].name}: ${'★'.repeat(c3.stars)||'–'}`;$('#back').textContent='Ander monster';
 $('#save').hidden=score<=0;$('#saved').hidden=true;
 say('#say-end','petra',['Hmpf. Dit noem ik geen kapsel. Nog een keer!','Mwah. Er zit een begin in. Meer oefenen!','Niet slecht... Bijna geen haar verkeerd.','Hm. Ik zie... geen enkel haar verkeerd. Knap hoor!'][stars],stars===3?'happy':'stern');
 if(!c3){if(b.win)fanfare();else tone(330,.3,'triangle',.07);}
 show('#s-end');preview($('#end-cv'),m,300,280,false,false,'happy',S.beard.map(s=>s.Lf),S.hair.map(s=>s.Lf));
 renderDex();renderBoard();}

/* level 3: het eigen spel van je kapper */
const L3={
 fohnaldo:{name:'Föhnen',banner:'Level 3 · Föhnen',go:'FÖHN!',time:25,label:'Droog',
  hint:'Houd de föhn op het natte haar tot het droog en pluizig is.',
  intro:'Level 3 bij mij! Het haar is nat. Houd de föhn erop tot alles droog is.',done:'Wauw, wat een volume! Het publiek is dol op je!'},
 wilma:{name:'Waxen',banner:'Level 3 · Waxen',go:'WAX!',time:22,label:'Pieken',
  hint:'Tik op de puntjes van het haar om er een waxpiek in te zetten.',
  intro:'Level 3 bij mij! Tik op de puntjes van het haar, dan zet ik er een stoere waxpiek in.',done:'Boing! Wat een uitvinding! Prachtige pieken!'},
 kardashian:{name:'Fotomoment',banner:'Level 3 · Fotomoment',go:'FOTO!',time:30,label:'Foto’s',
  hint:'Tik als het monster precies in het fotokader staat. Drie foto’s!',
  intro:'Level 3, schat! Tik als het monster precies in het kader staat. We maken drie foto’s!',done:'Oh my, wat een plaatjes! Helemaal trending!'},
 gelda:{name:'Gel-formule',banner:'Level 3 · Gel-formule',go:'KIJK!',time:50,label:'Rondes',
  hint:'Kijk welke gelpotjes oplichten. Tik ze daarna in dezelfde volgorde.',
  intro:'Level 3: mijn formule! Kijk welke potjes oplichten en tik ze daarna in dezelfde volgorde.',done:'Eureka! Jouw formule klopt helemaal!'}};
const GELC=['#ff5fa2','#22c3c3','#ffc928','#8a5cf6'],GELF=[523,659,784,988];
const hasL3=()=>!!L3[host()];
function begin3(){const k=host(),D3=L3[k];S.lvl=3;S.ptr.down=false;humOff();
 Object.assign(S,{k3:k,t3:Math.round(D3.time*GRP.time),cd:3,falls:[],floats:[],trail:[],gold:null,shock:0,shake:0,ox:0,oy:0,mt:0,still:false,p3:0,drips:[],sparks:[],flash:0,freeze:0,cool:0,photos:0,snaps:[],dryFloat:0});
 S.left=S.t3;CX=BX;CY=BY;
 const n=S.m.n;
 if(k==='fohnaldo')S.wet=Array(n).fill(1);
 if(k==='wilma'){S.waxed=Array(n).fill(false);S.waxA=Array(n).fill(0);}
 if(k==='gelda'){const r=GRP.id===0?[2,3,4]:GRP.id===3?[4,5,6]:[3,4,5];S.gel={rounds:r,round:0,seq:[],phase:'show',pt:-1,inp:0,lit:-1,tap:-1,tapT:0,said:false};newSeq();}
 S.banner=D3.banner;$('#h-lvl').textContent=D3.banner;$('#h-hint').textContent=D3.hint;$('#st-neat small').textContent=D3.label;
 say('#say-play',k,D3.intro,'happy',true);
 hud3();[0,.75,1.5].forEach(w=>tone(660,.12,'square',.05,w));tone(990,.3,'square',.06,2.25);}
function tot3(){const k=S.k3;return k==='kardashian'?3:k==='gelda'?S.gel.rounds.length:S.m.n;}
function cnt3(){const k=S.k3;if(k==='fohnaldo')return S.wet.filter(w=>w<=0).length;if(k==='wilma')return S.waxed.filter(Boolean).length;if(k==='kardashian')return S.photos;return S.gel.round;}
function hud3(){$('#h-score').textContent=Math.round(S.score);$('#h-neat').textContent=`${cnt3()}/${tot3()}`;
 const f=Math.max(0,S.left/S.t3),tb=$('#h-time');tb.style.transform=`scaleX(${f})`;tb.classList.toggle('low',S.left<8);}
const hairP=i=>strandPts(S.m,geomH(S.m,i,CX,CY,R),i,S.hair[i].Lf,S.t,R,false);
function spark(x,y,col,n){for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,v=60+Math.random()*120;S.sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,life:.6+Math.random()*.3,col});}}
/* gel-formule */
function newSeq(){const g=S.gel,len=g.rounds[g.round];g.seq=[];for(let k=0;k<len;k++){let j;do{j=Math.floor(Math.random()*4);}while(k&&j===g.seq[k-1]&&Math.random()<.7);g.seq.push(j);}g.phase='show';g.pt=-1.1;g.inp=0;g.lit=-1;}
function potPos(j){const sx=Math.min(R*2.0,W/2-R*.45),x=BX+(j<2?-1:1)*sx,y=BY+(j%2?R*.55:-R*.85);return{x,y,r:R*.34};}
function gelOn(){return GRP.id===0?.75:GRP.id===1?.6:.48;}
function tick3(dt){const k=S.k3,m=S.m,n=m.n;
 S.sparks=S.sparks.filter(p=>{p.life-=dt;p.vy+=300*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;return p.life>0;});
 S.drips=S.drips.filter(d=>{d.vy+=600*dt;d.y+=d.vy*dt;return d.y<H+10;});
 if(k==='fohnaldo'){
  for(let i=0;i<n;i++){if(S.wet[i]<=0)continue;if(Math.random()<dt*1.4*S.wet[i]){const P=hairP(i),e=P[P.length-1];S.drips.push({x:e[0],y:e[1],vy:20});}}
  if(S.ptr.down){const rate=1.3*GRP.time;for(let i=0;i<n;i++){if(S.wet[i]<=0)continue;const P=hairP(i);
    if(P.some(p=>Math.hypot(p[0]-S.ptr.x,p[1]-S.ptr.y)<R*.48)){S.wet[i]-=dt*rate;
     if(S.wet[i]<=0){S.wet[i]=0;S.score+=20;const e=P[P.length-1];spark(e[0],e[1],'#fff',6);tone(880+Math.random()*300,.06,'triangle',.04);
      if(S.t-S.dryFloat>.4){S.dryFloat=S.t;S.floats.push({x:e[0],y:e[1]-R*.05,txt:'Droog! +20',col:'#e8701f',life:.9});}}}}}
  S.p3=S.wet.filter(w=>w<=0).length/n;}
 if(k==='wilma'){for(let i=0;i<n;i++)if(S.waxed[i])S.waxA[i]=Math.min(1,S.waxA[i]+dt*4);S.p3=S.waxed.filter(Boolean).length/n;}
 if(k==='kardashian'){S.flash=Math.max(0,S.flash-dt*2.2);S.cool=Math.max(0,S.cool-dt);
  if(S.freeze>0)S.freeze-=dt;else{const sp=(.9+.38*GRP.id)*(1+S.photos*.28);S.mt+=dt*sp;
   const rg=Math.max(R*.9,Math.min(W/2-R*1.25,R*1.9));S.ox=Math.sin(S.mt)*rg;S.oy=GRP.id>=2?Math.sin(S.mt*1.7)*R*.12:0;}
  CX=BX+S.ox;CY=BY+S.oy;S.p3=S.photos/3;}
 if(k==='gelda'){const g=S.gel;g.tapT=Math.max(0,g.tapT-dt);
  if(g.phase==='show'){g.pt+=dt;const on=gelOn(),cyc=on+.28,idx=Math.floor(g.pt/cyc);let lit=-1;
   if(g.pt>=0&&idx<g.seq.length)lit=(g.pt%cyc)<on?g.seq[idx]:-1;
   if(lit!==g.lit&&lit>=0)tone(GELF[lit],on*.9,'triangle',.07);g.lit=lit;
   if(g.pt>=0&&idx>=g.seq.length){g.phase='input';g.lit=-1;if(!g.said){g.said=true;say('#say-play','gelda','Jouw beurt! Tik de potjes in dezelfde volgorde.','happy',true);}}}
  S.p3=g.round/g.rounds.length;}}
function tap3(p,drag){const k=S.k3;if(!S.run||S.cd>0)return;
 if(k==='wilma'){for(let i=0;i<S.m.n;i++){if(S.waxed[i])continue;const P=hairP(i),e=P[P.length-1];
   if(Math.hypot(e[0]-p.x,e[1]-p.y)<R*(drag?.26:.32)){S.waxed[i]=true;S.score+=25;tone(500+Math.random()*500,.08,'square',.05);spark(e[0],e[1],'#ff9f1c',7);S.floats.push({x:e[0],y:e[1]-R*.08,txt:'+25',col:'#e8701f',life:.7});if(!drag)break;}}}
 if(k==='kardashian'&&!drag){if(S.freeze>0||S.cool>0)return;const d=Math.hypot(S.ox,S.oy)/(R*.5);
  if(d<.4){const pts=Math.round(60+100*(1-d/.4));S.score+=pts;S.photos++;S.flash=1;S.freeze=1.1;S.snaps.push(1);snapSound();
   S.floats.push({x:BX,y:BY-R*1.6,txt:(d<.15?'Perfect! ':'Klik! ')+'+'+pts,col:'#ff5fa2',life:1.1});
   say('#say-play','kardashian',S.photos<3?['Klik! Prachtig, schat!','Wauw, die gaat online!'][S.photos-1]:'Drie foto’s! Wat een plaatjes!','happy',true);}
  else{S.cool=.7;S.shock=.4;S.score=Math.max(0,S.score-10);oops();S.floats.push({x:BX,y:BY-R*1.6,txt:'Wazig!',col:'#ff4d6d',life:.9});say('#say-play','kardashian','Wazig, schat! Wacht tot hij in het kader staat.','happy');}}
 if(k==='gelda'&&!drag){const g=S.gel;if(g.phase!=='input')return;let hit=-1;for(let j=0;j<4;j++){const q=potPos(j);if(Math.hypot(q.x-p.x,q.y-p.y)<q.r*1.35)hit=j;}if(hit<0)return;
  g.tap=hit;g.tapT=.3;tone(GELF[hit],.25,'triangle',.07);
  if(hit===g.seq[g.inp]){g.inp++;if(g.inp===g.seq.length){g.round++;S.score+=40*g.seq.length;const q=potPos(hit);S.floats.push({x:BX,y:BY-R*1.6,txt:'Formule klopt! +'+40*g.seq.length,col:'#2fb36b',life:1.2});
    if(g.round<g.rounds.length){say('#say-play','gelda','Correct! De volgende formule is een beetje langer.','happy',true);newSeq();g.pt=-1.4;}else S.p3=1;}}
  else{S.shock=.5;S.shake=.2;oops();S.score=Math.max(0,S.score-15);say('#say-play','gelda','Foutje in de formule! Kijk nog een keer goed.','happy',true);g.phase='show';g.pt=-1.2;g.inp=0;g.lit=-1;}}}
function snapSound(){const a=ac();if(!a||muted)return;const len=.08,buf=a.createBuffer(1,Math.floor(a.sampleRate*len),a.sampleRate),d=buf.getChannelData(0);
 for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);const s=a.createBufferSource();s.buffer=buf;const g=a.createGain();g.gain.value=.5;s.connect(g).connect(a.destination);s.start();tone(1568,.2,'triangle',.05,.06);}
function frame3(ts){if(!S.run||S.lvl!==3)return;const dt=Math.min(.05,(ts-S.last)/1000||0);S.last=ts;S.t+=dt;
 if(S.cd>0)S.cd-=dt;else{S.left-=dt;tick3(dt);}
 S.shock=Math.max(0,S.shock-dt);S.shake=Math.max(0,S.shake-dt);
 S.floats=S.floats.filter(f=>{f.life-=dt;f.y-=40*dt;return f.life>0;});
 render3();hud3();
 if(S.cd<=0&&S.p3>=1)return done3(true);
 if(S.left<=0)return done3(false);
 requestAnimationFrame(frame3);}
function done3(win){humOff();S.ptr.down=false;const p=S.p3,stars=win?3:p>=.7?2:p>=.4?1:0,bonus=win?Math.round(S.left*8):0;S.score+=bonus;
 S.res.push({stars,win,bonus,l3:S.k3});if(win)fanfare();finish();}
function hairdryer(c,x,y,s,on,t){const a=Math.atan2(CY-R*.4-y,CX-x);c.save();c.translate(x,y);c.rotate(a);if(Math.cos(a)<0)c.scale(1,-1);c.lineJoin='round';c.lineCap='round';
 if(on){c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=3;for(let k=0;k<3;k++){const o=((t*3+k/3)%1);c.globalAlpha=1-o;c.beginPath();c.moveTo(-s*.25+o*s*.9,(k-1)*s*.18);c.quadraticCurveTo(-s*.05+o*s*.9,(k-1)*s*.18-6,s*.15+o*s*.9,(k-1)*s*.18);c.stroke();}c.globalAlpha=1;}
 c.strokeStyle=NAVY;c.lineWidth=2.5;
 c.fillStyle='#ff5fa2';c.beginPath();c.roundRect(-s*1.2,s*.05,s*.26,s*.75,s*.1);c.fill();c.stroke();
 c.fillStyle='#22c3c3';c.beginPath();c.moveTo(-s*.62,-s*.16);c.lineTo(-s*.3,-s*.12);c.lineTo(-s*.3,s*.12);c.lineTo(-s*.62,s*.16);c.closePath();c.fill();c.stroke();
 c.fillStyle='#ff5fa2';c.beginPath();c.arc(-s*.95,0,s*.34,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle='#fff';c.beginPath();c.arc(-s*.95,0,s*.15,0,Math.PI*2);c.fill();c.stroke();
 c.restore();c.save();c.setLineDash([5,5]);c.strokeStyle='rgba(29,43,79,.4)';c.lineWidth=2;c.beginPath();c.arc(x,y,R*.48,0,Math.PI*2);c.stroke();c.restore();}
function waxPot(c,x,y,s){c.save();c.translate(x+s*.5,y+s*.5);c.strokeStyle=NAVY;c.lineWidth=2.5;c.fillStyle='#fff';c.beginPath();c.roundRect(-s*.45,-s*.2,s*.9,s*.6,s*.12);c.fill();c.stroke();
 c.fillStyle='#ff9f1c';ell(c,0,-s*.2,s*.45,s*.14);c.fill();c.stroke();capaldiMark(c,0,s*.12,s*.17);c.restore();}
function drawPot(c,j,lit,t){const q=potPos(j),r=q.r;c.save();
 if(lit){const gr=c.createRadialGradient(q.x,q.y,r*.2,q.x,q.y,r*1.8);gr.addColorStop(0,GELC[j]);gr.addColorStop(1,'rgba(255,255,255,0)');c.globalAlpha=.75;c.fillStyle=gr;c.beginPath();c.arc(q.x,q.y,r*1.8,0,Math.PI*2);c.fill();c.globalAlpha=1;}
 const s=lit?1.12:1;c.translate(q.x,q.y);c.scale(s,s);c.strokeStyle=NAVY;c.lineWidth=3;
 c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.roundRect(-r*.8,-r*.55,r*1.6,r*1.4,r*.3);c.fill();c.stroke();
 c.fillStyle=lit?GELC[j]:GELC[j]+'aa';c.beginPath();c.roundRect(-r*.68,-r*.2,r*1.36,r*.95,r*.22);c.fill();
 c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(-r*.35,r*.05,r*.1,0,Math.PI*2);c.fill();c.beginPath();c.arc(r*.25,r*.35,r*.07,0,Math.PI*2);c.fill();
 c.fillStyle=NAVY;c.beginPath();c.roundRect(-r*.9,-r*.85,r*1.8,r*.36,r*.12);c.fill();
 c.restore();}
function render3(){const c=ctx,t=S.t,k=S.k3,m=S.m;c.save();c.clearRect(0,0,W,H);
 if(S.shake>0&&!RM)c.translate((Math.random()-.5)*6,(Math.random()-.5)*6);
 drawRoom(c,t);
 const mood=S.shock>0?'shock':S.p3>.5||(k==='kardashian'&&S.freeze>0)?'happy':'smile';
 drawMonster(c,m,CX,CY,R,{lens:S.hair.map(s=>s.Lf),blens:S.beard.map(s=>s.Lf),time:t,look:k==='kardashian'?{x:BX,y:-50}:S.ptr.in?S.ptr:null,mood});
 if(k==='fohnaldo'){c.save();c.lineCap='round';for(let i=0;i<m.n;i++){const w=S.wet[i];if(w<=0)continue;const P=hairP(i);c.strokeStyle=`rgba(63,150,255,${.55*w})`;c.lineWidth=R*.085;pathPts(c,P,!m.zig);c.stroke();
   c.strokeStyle=`rgba(255,255,255,${.6*w})`;c.lineWidth=R*.02;pathPts(c,P,!m.zig);c.stroke();}
  c.fillStyle='#3f96ff';S.drips.forEach(d=>{c.beginPath();c.moveTo(d.x,d.y-6);c.quadraticCurveTo(d.x+4,d.y,d.x,d.y+3);c.quadraticCurveTo(d.x-4,d.y,d.x,d.y-6);c.fill();});c.restore();}
 if(k==='wilma'){c.save();c.lineJoin='round';for(let i=0;i<m.n;i++){const a=S.waxA[i];const P=hairP(i),e=P[P.length-1],p2=P[P.length-2];
   if(!S.waxed[i]){if(S.cd<=0){const pu=.5+.5*Math.sin(t*5+i);c.strokeStyle=`rgba(255,159,28,${.35+.4*pu})`;c.lineWidth=2.5;c.beginPath();c.arc(e[0],e[1],R*(.07+.02*pu),0,Math.PI*2);c.stroke();}continue;}
   const dx=e[0]-p2[0],dy=e[1]-p2[1],dl=Math.hypot(dx,dy)||1,ux=dx/dl,uy=dy/dl,ln=R*.24*(1-Math.pow(1-a,3)),bw=R*.075;
   c.fillStyle='#ff9f1c';c.strokeStyle=NAVY;c.lineWidth=2.5;c.beginPath();c.moveTo(e[0]-uy*bw,e[1]+ux*bw);c.lineTo(e[0]+ux*ln,e[1]+uy*ln);c.lineTo(e[0]+uy*bw,e[1]-ux*bw);c.closePath();c.fill();c.stroke();
   c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.arc(e[0]+ux*ln*.35-uy*bw*.3,e[1]+uy*ln*.35+ux*bw*.3,R*.018,0,Math.PI*2);c.fill();}c.restore();}
 if(k==='kardashian'){const fh=Math.min(R*3.4,H-R*.7),fw=Math.min(R*2.9,W-24),fx=BX,fy=Math.max(BY-R*.35,fh/2+10),ok=Math.hypot(S.ox,S.oy)<R*.5*.4,col=ok?'#2fb36b':'#ffffff',bl=R*.45;
  c.save();c.strokeStyle=NAVY;c.lineWidth=9;c.lineCap='round';const corners=[[-1,-1],[1,-1],[-1,1],[1,1]];
  for(const pass of[0,1]){if(pass){c.strokeStyle=col;c.lineWidth=5;}for(const[sx,sy]of corners){const x0=fx+sx*fw/2,y0=fy+sy*fh/2;c.beginPath();c.moveTo(x0-sx*bl,y0);c.lineTo(x0,y0);c.lineTo(x0,y0-sy*bl);c.stroke();}}
  c.fillStyle=ok?'#2fb36b':'rgba(255,255,255,.9)';c.strokeStyle=NAVY;c.lineWidth=2.5;c.beginPath();c.arc(fx,fy,R*.06,0,Math.PI*2);c.fill();c.stroke();
  for(let s=0;s<3;s++){const x=W-14-(3-s)*(R*.38+8)+8,y=document.body.classList.contains('phone')?84:14,w=R*.38,h=R*.46;c.fillStyle='#fff';c.strokeStyle=NAVY;c.lineWidth=2;c.beginPath();c.roundRect(x,y,w,h,4);c.fill();c.stroke();c.fillStyle=s<S.photos?'#ffd6ea':'#e7ecf5';c.fillRect(x+4,y+4,w-8,w-8);if(s<S.photos){c.fillStyle='#ff5fa2';star4(c,x+w/2,y+w/2,w*.28);}}
  c.restore();if(S.flash>0){c.fillStyle=`rgba(255,255,255,${S.flash})`;c.fillRect(0,0,W,H);}
  if(S.cd<=0)tag(c,ok?'NU TIKKEN!':'Wacht tot hij in het kader staat',W/2,H-R*.22,ok?'#2fb36b':NAVY,Math.round(Math.max(13,R*.13)),true);}
 if(k==='gelda'){const g=S.gel;for(let j=0;j<4;j++)drawPot(c,j,g.lit===j||(g.tap===j&&g.tapT>0),t);
  if(S.cd<=0){const txt=g.phase==='show'?'Kijk goed...':'Jouw beurt! '+(g.inp)+'/'+g.seq.length;tag(c,txt,W/2,R*.38,g.phase==='show'?NAVY:'#2fb36b',Math.round(Math.max(14,R*.15)),true);}}
 S.sparks.forEach(p=>{c.globalAlpha=Math.min(1,p.life*2);c.fillStyle=p.col;star4(c,p.x,p.y,5);});c.globalAlpha=1;
 S.floats.forEach(f=>{c.globalAlpha=Math.min(1,f.life*1.5);c.font=`${Math.round(Math.max(14,R*.15))}px Bungee, Impact, sans-serif`;c.textAlign='center';c.lineWidth=5;c.strokeStyle='#fff';c.strokeText(f.txt,f.x,f.y);c.fillStyle=f.col;c.fillText(f.txt,f.x,f.y);});c.globalAlpha=1;
 if(S.ptr.in&&S.cd<=0){if(k==='fohnaldo')hairdryer(c,S.ptr.x,S.ptr.y,R*.42,S.ptr.down,t);if(k==='wilma')waxPot(c,S.ptr.x,S.ptr.y,R*.3);}
 if(S.cd>0)countdown(c,L3[k].go,L3[k].name);
 c.restore();}
function countdown(c,go,sub){const el=3-S.cd,lbl=el<.75?'3':el<1.5?'2':el<2.25?'1':go;
 c.fillStyle='rgba(234,246,255,.55)';c.fillRect(0,0,W,H);c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 c.save();c.font=`italic 500 ${Math.round(Math.max(14,R*.17))}px "Bodoni Moda", Georgia, serif`;c.lineWidth=5;c.strokeStyle='#fff';c.strokeText('Welkom bij Capaldi Kappers',W/2,H*.24-R*.3);c.fillStyle=NAVY;c.fillText('Welkom bij Capaldi Kappers',W/2,H*.24-R*.3);c.restore();
 c.font=`${Math.round(Math.max(16,R*.2))}px Bungee, Impact, sans-serif`;c.lineWidth=6;c.strokeStyle='#fff';c.strokeText(S.banner,W/2,H*.24);c.fillStyle=NAVY;c.fillText(S.banner,W/2,H*.24);
 c.font=`${Math.round(R*.95)}px Bungee, Impact, sans-serif`;c.lineWidth=14;c.strokeStyle=NAVY;c.strokeText(lbl,W/2,H*.46);c.fillStyle='#ffc928';c.fillText(lbl,W/2,H*.46);
 c.font=`700 ${Math.round(Math.max(15,R*.15))}px Rubik, sans-serif`;c.lineWidth=5;c.strokeStyle='#fff';c.strokeText(sub,W/2,H*.46+R*.72);c.fillStyle=NAVY;c.fillText(sub,W/2,H*.46+R*.72);c.textBaseline='alphabetic';}

/* kennismaken met een kapper */
const MEET={
 haarriet:['Hoi! Ik ben Haarriët, kapster bij Capaldi.','Ik weet álles van haar. Echt álles!','Bij mij krijg je 5 seconden extra tijd.'],
 scharlotte:['Hoi! Ik ben Scharlotte.','Ik knip sneller dan je kunt kijken!','Bij mij gaan je combo’s dubbel zo snel.'],
 fohnaldo:['Dames en heren... ik ben Föhnaldo!','Met mijn föhn blaas ik elk kapsel tot leven.','Kies mij, dan mag je na het knippen föhnen in level 3!'],
 kardashian:['Hoi schat! Ik ben Knip Kardashian.','Ik ken alle nieuwste haartrends.','Kies mij, dan maken we na het knippen de mooiste foto’s in level 3!'],
 gelda:['Goedendag! Ik ben Professor Gelda.','Voor elk kapsel heb ik een formule.','Kies mij, dan los je na het knippen mijn gel-puzzel op in level 3!'],
 wilma:['Boing! Ik ben Wilma Wortelwax, uitvinder!','Met mijn wax maak ik de gekste pieken.','Kies mij, dan zet je na het knippen alles in de wax in level 3!']};
let meetQ=[],meetRaf=0,meetTimer=0,meetId=null;
function openMeet(id,fresh){meetId=id;const P=CREW[id];
 $('#meet-eyebrow').textContent=fresh?'Nieuw in de Capaldi Crew!':'De Capaldi Crew';
 $('#meet-name').textContent=P.name;$('#meet-role').textContent=P.role;$('#meet-perk').textContent='Extra: '+P.perk;
 const l3=L3[id],ml=$('#meet-l3');ml.hidden=!l3;if(l3)ml.textContent='Eigen level 3: '+l3.name;
 const chosen=host()===id,pb=$('#meet-pick');pb.textContent=chosen?'Dit is jouw kapper':'Kies als mijn kapper';pb.disabled=chosen;$('#meet-close').textContent=fresh?'Later':'Sluiten';
 $('#meet').hidden=false;
 const lines=MEET[id];let k=0;clearTimeout(meetTimer);
 const next=()=>{if($('#meet').hidden)return;say('#say-meet',id,lines[k],'happy');const dur=1500+lines[k].length*62;k++;if(k<lines.length)meetTimer=setTimeout(next,dur);};next();
 if(fresh)[784,988,1175,1568].forEach((f,i)=>tone(f,.18,'triangle',.06,i*.1));
 const c=fitCanvas($('#meet-cv'),300,240),t0=performance.now();
 const conf=Array.from({length:30},(_,i)=>({x:rnd(i+3)*300,y:-rnd(i+9)*260,v:50+rnd(i+5)*60,c:['#ff5fa2','#ffc928','#22c3c3','#8a5cf6','#8ad94a'][i%5],r:rnd(i)*6}));
 cancelAnimationFrame(meetRaf);
 const loop=now=>{if($('#meet').hidden)return;const t=(now-t0)/1000;c.clearRect(0,0,300,240);
  c.save();c.translate(150,120);c.rotate(RM?0:t*.3);for(let q=0;q<12;q++){c.rotate(Math.PI/6);c.fillStyle=q%2?'rgba(255,201,40,.25)':'rgba(255,95,162,.18)';c.beginPath();c.moveTo(0,0);c.lineTo(220,-34);c.lineTo(220,34);c.closePath();c.fill();}c.restore();
  if(fresh&&!RM)conf.forEach(p=>{const y=((p.y+p.v*t)%280+280)%280-20;c.save();c.translate(p.x,y);c.rotate(t*2+p.r);c.fillStyle=p.c;c.fillRect(-5,-2.5,10,5);c.restore();});
  const pop=Math.min(1,t/.45),sc=RM?1:(1-Math.pow(1-pop,3))*(1+.05*Math.sin(t*4)),big=id==='fohnaldo'||id==='wilma'||id==='gelda';
  c.save();c.translate(150,big?128:112);c.scale(sc,sc);drawCrew(c,id,0,0,big?38:44,'happy');c.restore();
  meetRaf=requestAnimationFrame(loop);};meetRaf=requestAnimationFrame(loop);}
function closeMeet(){$('#meet').hidden=true;clearTimeout(meetTimer);cancelAnimationFrame(meetRaf);try{speechSynthesis.cancel();}catch(e){}
 if(meetQ.length)setTimeout(()=>openMeet(meetQ.shift(),true),250);}
$('#meet-close').addEventListener('click',closeMeet);
$('#meet').addEventListener('click',e=>{if(e.target.id==='meet')closeMeet();});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#meet').hidden)closeMeet();});
$('#meet-pick').addEventListener('click',()=>{DB.crew=meetId;persist();tone(784,.1,'square',.05);tone(1046,.15,'square',.05,.08);renderCrew();updateAgebar();
 const pb=$('#meet-pick');pb.textContent='Dit is jouw kapper';pb.disabled=true;$('#meet-close').textContent='Verder';clearTimeout(meetTimer);say('#say-meet',meetId,'Top! Ik ben nu jouw kapper.','happy');});

$('#quit').addEventListener('click',()=>{S.run=false;humOff();show('#s-start');renderDex();renderCrew();});
/* Kapperskleurplaat */
const CP=600;
function plateBg(c){c.fillStyle='#fff';c.fillRect(0,0,CP,CP);c.strokeStyle=NAVY;c.lineWidth=5;c.lineJoin='round';
 c.beginPath();c.moveTo(0,505);c.lineTo(CP,505);c.stroke();for(let x=-20;x<CP;x+=60){c.beginPath();c.moveTo(x,505);c.lineTo(x+40,CP);c.stroke();}
 for(const[x,y,r]of[[70,80,34],[525,95,26],[60,300,20],[545,330,30],[480,40,14]]){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.beginPath();c.arc(x-r*.35,y-r*.35,r*.22,0,Math.PI*2);c.stroke();}}
function plateMonster(c,m){plateBg(c);const f=fitR(CP,560);drawMonster(c,m,CP/2,f.cy,f.R,{lens:styledLens(m),blens:styledBeard(m),time:1.3,mood:'happy'});}
const PLATES=[
 {id:'vlamkop',name:'Vlamkop',draw:c=>plateMonster(c,M[0])},
 {id:'bliksem',name:'Bliksemborstel',draw:c=>plateMonster(c,M[1])},
 {id:'kraak',name:'Kraak',draw:c=>plateMonster(c,M[2])},
 {id:'lokkie',name:'Lokkie',draw:c=>{plateBg(c);drawCrew(c,'lokkie',300,290,150,'happy');}},
 {id:'haarriet',name:'Haarriët',draw:c=>{plateBg(c);drawCrew(c,'haarriet',300,235,105,'happy');}},
 {id:'fohnaldo',name:'Föhnaldo',draw:c=>{plateBg(c);drawCrew(c,'fohnaldo',300,265,92,'happy');}},
 {id:'spullen',name:'Kappersspullen',draw:c=>{plateBg(c);[['schaar',160,150],['fohn',440,150],['kam',160,395],['spiegel',440,395]].forEach(([id,x,y])=>{c.save();c.fillStyle='#fff';c.strokeStyle=NAVY;c.lineWidth=5;c.beginPath();c.roundRect(x-112,y-105,224,210,26);c.fill();c.stroke();c.restore();drawTool(c,id,x,y,90);});}}];
const PAL=[['#ff5fa2','roze'],['#ff4d4d','rood'],['#ff8a3d','oranje'],['#ffc928','geel'],['#8ad94a','groen'],['#22c3c3','turquoise'],['#3fa9ff','blauw'],['#8a5cf6','paars'],['#a0673b','bruin'],['#f3cba9','huidkleur'],['#c9a063','Capaldi-goud'],['#1d2b4f','donkerblauw']];
const CK={plate:null,tool:'fill',color:PAL[0][0],paint:null,pctx:null,line:null,mask:null,lab:null,lists:null,undo:[],dctx:null,drawing:false,last:null,dirty:false};
const ARTKEY='capaldi-kleurplaten-v1';
function loadArt(){try{return JSON.parse(localStorage.getItem(ARTKEY)||'[]');}catch(e){return[];}}
function saveArt(a){try{localStorage.setItem(ARTKEY,JSON.stringify(a));return true;}catch(e){return false;}}
function buildPlate(p){
 const src=document.createElement('canvas');src.width=src.height=CP;const sc=src.getContext('2d');p.draw(sc);
 const d=sc.getImageData(0,0,CP,CP).data,N=CP*CP,mask=new Uint8Array(N);
 const line=document.createElement('canvas');line.width=line.height=CP;const lc=line.getContext('2d'),li=lc.createImageData(CP,CP),ld=li.data;
 const nr=29,ng=43,nb=79,vr=255-nr,vg=255-ng,vb=255-nb,vv=vr*vr+vg*vg+vb*vb;
 for(let i=0;i<N;i++){const r=d[i*4],g=d[i*4+1],b=d[i*4+2];let t=((r-nr)*vr+(g-ng)*vg+(b-nb)*vb)/vv;t=Math.max(0,Math.min(1,t));
  const pr=nr+vr*t,pg=ng+vg*t,pb=nb+vb*t,dist=Math.hypot(r-pr,g-pg,b-pb);let a=0;
  if(dist<34)a=1-t;else if(Math.hypot(r-nr,g-ng,b-nb)<60)a=1;
  if(a>.04){ld[i*4]=nr;ld[i*4+1]=ng;ld[i*4+2]=nb;ld[i*4+3]=Math.round(Math.min(1,a*1.15)*255);}
  if(a>.5)mask[i]=1;}
 lc.putImageData(li,0,0);
 // vlakken nummeren
 const lab=new Int32Array(N).fill(-1);let nl=0;const stack=new Int32Array(N);
 for(let s=0;s<N;s++){if(mask[s]||lab[s]>=0)continue;let sp=0;stack[sp++]=s;lab[s]=nl;
  while(sp){const i=stack[--sp],x=i%CP;
   if(x>0&&!mask[i-1]&&lab[i-1]<0){lab[i-1]=nl;stack[sp++]=i-1;}
   if(x<CP-1&&!mask[i+1]&&lab[i+1]<0){lab[i+1]=nl;stack[sp++]=i+1;}
   if(i>=CP&&!mask[i-CP]&&lab[i-CP]<0){lab[i-CP]=nl;stack[sp++]=i-CP;}
   if(i<N-CP&&!mask[i+CP]&&lab[i+CP]<0){lab[i+CP]=nl;stack[sp++]=i+CP;}}
  nl++;}
 // lijnpixels toewijzen aan een buurvlak (geen witte randjes)
 const own=new Int32Array(N).fill(-1);
 for(let i=0;i<N;i++){if(!mask[i])continue;const x=i%CP,y=(i/CP)|0;
  search:for(let r=1;r<=3;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=CP||yy>=CP)continue;const j=yy*CP+xx;if(lab[j]>=0){own[i]=lab[j];break search;}}}
 const cnt=new Int32Array(nl+1);for(let i=0;i<N;i++){const L=lab[i]>=0?lab[i]:own[i];if(L>=0)cnt[L]++;}
 const off=new Int32Array(nl+1);for(let k=1;k<=nl;k++)off[k]=off[k-1]+cnt[k-1];
 const pos2=off.slice(),flat=new Int32Array(off[nl]+cnt[nl]);
 for(let i=0;i<N;i++){const L=lab[i]>=0?lab[i]:own[i];if(L>=0)flat[pos2[L]++]=i;}
 return{line,mask,lab,off,flat,nl};}
function plateThumb(p,cv){const c=fitCanvas(cv,150,150);const tmp=document.createElement('canvas');tmp.width=tmp.height=CP;const tc=tmp.getContext('2d');
 if(!p._line){const b=buildPlate(p);p._line=b.line;}tc.fillStyle='#fff';tc.fillRect(0,0,CP,CP);tc.drawImage(p._line,0,0);c.drawImage(tmp,0,0,150,150);}
function renderPlates(){const el=$('#c-plates');el.textContent='';
 PLATES.forEach(p=>{const b=document.createElement('button');b.type='button';b.className='plate';b.setAttribute('aria-label','Kleurplaat '+p.name);
  const cv=document.createElement('canvas');cv.setAttribute('aria-hidden','true');b.append(cv);const s=document.createElement('span');s.textContent=p.name;b.append(s);
  b.addEventListener('click',()=>{ac();tone(784,.08,'triangle',.05);openPlate(p);});el.append(b);requestAnimationFrame(()=>plateThumb(p,cv));});
 const art=loadArt(),gw=$('#c-gal-wrap'),g=$('#c-gal');gw.hidden=!art.length;g.textContent='';
 art.slice().reverse().forEach(a=>{const im=document.createElement('img');im.src=a.img;im.alt='Jouw kleurplaat '+(PLATES.find(p=>p.id===a.plate)||{name:''}).name;g.append(im);});}
function startColor(){S.run=false;MS.run=false;S.mode='color';$('#c-pick').hidden=false;$('#c-edit').hidden=true;$('#c-done').hidden=true;show('#s-color');renderPlates();
 say('#say-color',host(),'Kies een kleurplaat. Daarna mag je hem helemaal zelf inkleuren!','happy');}
function openPlate(p){const b=buildPlate(p);p._line=b.line;Object.assign(CK,b,{plate:p,undo:[],dirty:false});
 const paint=document.createElement('canvas');paint.width=paint.height=CP;CK.paint=paint;CK.pctx=paint.getContext('2d',{willReadFrequently:true});CK.pctx.fillStyle='#fff';CK.pctx.fillRect(0,0,CP,CP);
 $('#c-pick').hidden=true;$('#c-edit').hidden=false;$('#c-done').hidden=true;$('#c-title').textContent=p.name;
 const cv=$('#c-cv'),sz=Math.round(cv.getBoundingClientRect().width)||500;CK.dctx=fitCanvas(cv,sz,sz);CK.sz=sz;setTool('fill');drawColor();updUndo();
 say('#say-color',host(),'Kies een kleur. Tik dan op een vlak om het in te kleuren.','happy');}
function drawColor(){const c=CK.dctx,s=CK.sz;if(!c)return;c.fillStyle='#fff';c.fillRect(0,0,s,s);c.imageSmoothingQuality='high';c.drawImage(CK.paint,0,0,s,s);c.drawImage(CK.line,0,0,s,s);}
function pushUndo(){CK.undo.push(CK.pctx.getImageData(0,0,CP,CP));if(CK.undo.length>15)CK.undo.shift();updUndo();}
function updUndo(){$('#c-undo').disabled=!CK.undo.length;}
function hex2rgb(h){const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255];}
function cpos(e){const r=$('#c-cv').getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*CP,y:(e.clientY-r.top)/r.height*CP};}
function fillAt(p){let x=Math.round(p.x),y=Math.round(p.y);if(x<0||y<0||x>=CP||y>=CP)return;let L=CK.lab[y*CP+x];
 if(L<0){search:for(let r=1;r<=8;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=CP||yy>=CP)continue;const l=CK.lab[yy*CP+xx];if(l>=0){L=l;break search;}}}
 if(L<0)return;pushUndo();const im=CK.pctx.getImageData(0,0,CP,CP),d=im.data,[r,g,b]=CK.tool==='erase'?[255,255,255]:hex2rgb(CK.color);
 for(let k=CK.off[L],e=CK.off[L+1]??CK.flat.length;k<e;k++){const i=CK.flat[k]*4;d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;}
 CK.pctx.putImageData(im,0,0);CK.dirty=true;drawColor();tone(520+Math.random()*400,.07,'triangle',.05);}
function brushLine(a,b){const c=CK.pctx;c.strokeStyle=CK.tool==='erase'?'#fff':CK.color;c.lineWidth=CK.tool==='erase'?34:20;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x+.01,b.y);c.stroke();CK.dirty=true;drawColor();}
function setTool(t){CK.tool=t;document.querySelectorAll('.ctool[data-tool]').forEach(b=>{const on=b.dataset.tool===t;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});
 $('#c-cv').dataset.tool=t;}
function setColor(col){CK.color=col;if(CK.tool==='erase')setTool('fill');document.querySelectorAll('.swatch').forEach(s=>{const on=s.dataset.c===col;s.classList.toggle('on',on);s.setAttribute('aria-pressed',String(on));});}
{const pal=$('#c-pal');PAL.forEach(([col,nm])=>{const b=document.createElement('button');b.type='button';b.className='swatch';b.dataset.c=col;b.style.setProperty('--sw',col);b.setAttribute('aria-label',nm);b.title=nm;b.addEventListener('click',()=>{ac();tone(660,.05,'triangle',.04);setColor(col);});pal.append(b);});setColor(PAL[0][0]);}
document.querySelectorAll('.ctool[data-tool]').forEach(b=>b.addEventListener('click',()=>{ac();setTool(b.dataset.tool);}));
$('#c-undo').addEventListener('click',()=>{const im=CK.undo.pop();if(im){CK.pctx.putImageData(im,0,0);drawColor();}updUndo();});
{const cv=$('#c-cv');
 cv.addEventListener('pointerdown',e=>{if(!CK.plate)return;ac();cv.setPointerCapture(e.pointerId);const p=cpos(e);
  if(CK.tool==='fill')fillAt(p);else{pushUndo();CK.drawing=true;CK.last=p;brushLine(p,p);}});
 cv.addEventListener('pointermove',e=>{if(!CK.drawing)return;const p=cpos(e);brushLine(CK.last,p);CK.last=p;});
 const end=()=>{CK.drawing=false;};cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);}
function finalImage(){const W2=CP,H2=CP+90,f=document.createElement('canvas');f.width=W2;f.height=H2;const c=f.getContext('2d');
 c.fillStyle='#fff';c.fillRect(0,0,W2,H2);c.drawImage(CK.paint,0,0);c.drawImage(CK.line,0,0);
 c.strokeStyle=NAVY;c.lineWidth=6;c.strokeRect(3,3,W2-6,H2-6);c.beginPath();c.moveTo(0,CP);c.lineTo(W2,CP);c.stroke();
 capaldiMark(c,52,CP+45,26);wordmark(c,190,CP+38,26,NAVY,true);
 c.fillStyle=NAVY;c.font='italic 500 20px "Bodoni Moda", Georgia, serif';c.textAlign='right';c.textBaseline='middle';c.fillText('Gekleurd bij Capaldi Kappers',W2-24,CP+45);return f;}
$('#c-done-btn').addEventListener('click',()=>{const f=finalImage();const art=loadArt();
 let small=document.createElement('canvas');small.width=300;small.height=345;small.getContext('2d').drawImage(f,0,0,300,345);
 art.push({plate:CK.plate.id,img:small.toDataURL('image/jpeg',.82),d:Date.now()});while(art.length>8)art.shift();let ok=saveArt(art);while(!ok&&art.length>1){art.shift();ok=saveArt(art);}
 CK.final=f;$('#c-final').src=f.toDataURL('image/png');$('#c-edit').hidden=true;$('#c-done').hidden=false;fanfare();
 say('#say-color',host(),'Wat een mooie kleurplaat! Laat hem zien bij de balie van Capaldi.','happy');});
$('#c-save').addEventListener('click',()=>{if(!CK.final)return;const a=document.createElement('a');a.href=CK.final.toDataURL('image/png');a.download=`capaldi-kleurplaat-${CK.plate.id}.png`;document.body.append(a);a.click();a.remove();});
function printImg(src){const pa=$('#print-area');pa.innerHTML=`<img alt="Kleurplaat" src="${src}">`;const im=pa.querySelector('img');const go=()=>{try{window.print();}catch(e){}};if(im.complete)setTimeout(go,50);else im.onload=go;}
$('#c-print').addEventListener('click',()=>{if(CK.final)printImg(CK.final.toDataURL('image/png'));});
$('#c-print-empty').addEventListener('click',()=>{if(!CK.plate)return;const keep=CK.paint;const blank=document.createElement('canvas');blank.width=blank.height=CP;const bc=blank.getContext('2d');bc.fillStyle='#fff';bc.fillRect(0,0,CP,CP);CK.paint=blank;const f=finalImage();CK.paint=keep;printImg(f.toDataURL('image/png'));});
$('#c-other').addEventListener('click',()=>{$('#c-edit').hidden=true;$('#c-done').hidden=true;$('#c-pick').hidden=false;renderPlates();say('#say-color',host(),'Kies een kleurplaat.','happy');});
$('#c-again').addEventListener('click',()=>$('#c-other').click());
$('#c-quit').addEventListener('click',()=>{show('#s-start');renderGames();});
$('#g-color').addEventListener('click',()=>{ac();startColor();});
addEventListener('resize',()=>{if(!$('#s-color').hidden&&!$('#c-edit').hidden&&CK.plate){const cv=$('#c-cv'),sz=Math.round(cv.getBoundingClientRect().width);if(sz&&sz!==CK.sz){CK.dctx=fitCanvas(cv,sz,sz);CK.sz=sz;drawColor();}}});

$('#again').addEventListener('click',()=>S.mode==='mem'?startMem():start(S.m));
$('#back').addEventListener('click',()=>{show('#s-start');renderDex();renderCrew();renderGames();updateAgebar();});
/* Kappersmemory */
const TOOLS=[
 {id:'schaar',name:'Schaar',say:'Een schaar! Daarmee knipt de kapper je haar, heel voorzichtig.'},
 {id:'kam',name:'Kam',say:'Een kam! Daarmee maakt de kapper je haar mooi glad.'},
 {id:'fohn',name:'Föhn',say:'Een föhn! Die blaast warme lucht. Zo wordt nat haar weer droog.'},
 {id:'tondeuse',name:'Tondeuse',say:'Een tondeuse! Die zoemt een beetje, maar het doet geen pijn.'},
 {id:'borstel',name:'Borstel',say:'Een borstel! Daarmee gaan de klitten uit je haar.'},
 {id:'spuit',name:'Waterspuit',say:'Een waterspuit! Zo maakt de kapper je haar een beetje nat.'},
 {id:'cape',name:'Kapperscape',say:'Een kapperscape! Die houdt de haartjes van je kleren af.'},
 {id:'spiegel',name:'Spiegel',say:'Een spiegel! Daarin zie je hoe mooi je wordt.'},
 {id:'krultang',name:'Krultang',say:'Een krultang! Daarmee maak je mooie krullen.'},
 {id:'wax',name:'Wax',say:'Een potje wax! Daarmee maak je stoere pieken.'},
 {id:'stoel',name:'Kappersstoel',say:'De kappersstoel! Die kan omhoog en omlaag, net een lift.'}];
function drawTool(c,id,x,y,s){c.save();c.translate(x,y);c.lineJoin='round';c.lineCap='round';c.strokeStyle=NAVY;c.lineWidth=Math.max(2,s*.06);
 const lw=c.lineWidth;
 if(id==='schaar'){c.restore();scissors(c,x+s*.15,y,s*.85,false);return;}
 if(id==='kam'){c.rotate(-.35);c.fillStyle='#ff5fa2';c.beginPath();c.roundRect(-s*.75,-s*.3,s*1.5,s*.26,s*.08);c.fill();c.stroke();
  for(let k=0;k<11;k++){const xx=-s*.66+k*s*.132;c.beginPath();c.moveTo(xx,-s*.04);c.lineTo(xx,s*.36);c.stroke();}}
 if(id==='fohn'){c.fillStyle='#ff5fa2';c.beginPath();c.roundRect(-s*.18,s*.05,s*.3,s*.75,s*.1);c.fill();c.stroke();
  c.fillStyle='#22c3c3';c.beginPath();c.moveTo(s*.2,-s*.22);c.lineTo(s*.72,-s*.16);c.lineTo(s*.72,s*.12);c.lineTo(s*.2,s*.18);c.closePath();c.fill();c.stroke();
  c.fillStyle='#ff5fa2';c.beginPath();c.arc(-s*.05,-s*.02,s*.4,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(-s*.05,-s*.02,s*.17,0,Math.PI*2);c.fill();c.stroke();}
 if(id==='tondeuse'){c.rotate(.2);c.fillStyle='#22c3c3';c.beginPath();c.moveTo(-s*.3,-s*.55);c.lineTo(s*.3,-s*.55);c.lineTo(s*.24,s*.75);c.quadraticCurveTo(0,s*.86,-s*.24,s*.75);c.closePath();c.fill();c.stroke();
  c.fillStyle='#e9edf5';c.beginPath();c.roundRect(-s*.36,-s*.75,s*.72,s*.22,4);c.fill();c.stroke();
  for(let k=-s*.3;k<s*.32;k+=s*.1){c.beginPath();c.moveTo(k,-s*.75);c.lineTo(k,-s*.85);c.stroke();}
  c.fillStyle='#ffc928';c.beginPath();c.roundRect(-s*.07,-s*.2,s*.14,s*.3,s*.06);c.fill();c.stroke();}
 if(id==='borstel'){c.rotate(-.6);c.fillStyle='#8a5cf6';c.beginPath();c.roundRect(-s*.1,s*.05,s*.2,s*.8,s*.08);c.fill();c.stroke();
  c.fillStyle='#ffc928';ell(c,0,-s*.35,s*.36,s*.48);c.fill();c.stroke();c.fillStyle=NAVY;for(let a=-2;a<=2;a++)for(let b=-3;b<=3;b++){if(a*a/5+b*b/11>1)continue;c.beginPath();c.arc(a*s*.12,-s*.35+b*s*.12,s*.03,0,Math.PI*2);c.fill();}}
 if(id==='spuit'){c.fillStyle='#7fd3ff';c.beginPath();c.roundRect(-s*.32,-s*.2,s*.64,s*.95,s*.16);c.fill();c.stroke();
  c.fillStyle='rgba(255,255,255,.6)';c.fillRect(-s*.2,-s*.05,s*.08,s*.6);
  c.fillStyle='#ff5fa2';c.beginPath();c.roundRect(-s*.18,-s*.5,s*.36,s*.32,6);c.fill();c.stroke();c.beginPath();c.roundRect(-s*.18,-s*.62,s*.62,s*.16,5);c.fill();c.stroke();
  c.beginPath();c.moveTo(s*.05,-s*.18);c.lineTo(s*.2,s*.05);c.stroke();
  c.fillStyle='#3f96ff';for(const[dx,dy]of[[.62,-.6],[.75,-.5],[.7,-.72]]){c.beginPath();c.arc(s*dx,s*dy,s*.04,0,Math.PI*2);c.fill();}}
 if(id==='cape'){c.fillStyle='#fff';c.beginPath();c.moveTo(-s*.35,-s*.55);c.quadraticCurveTo(0,-s*.4,s*.35,-s*.55);c.lineTo(s*.75,s*.7);c.quadraticCurveTo(0,s*.82,-s*.75,s*.7);c.closePath();c.fill();
  c.save();c.clip();c.strokeStyle='#ffd6ea';c.lineWidth=s*.1;for(let k=-6;k<=6;k++){c.beginPath();c.moveTo(k*s*.24,-s*.6);c.lineTo(k*s*.24+s*.4,s*.9);c.stroke();}c.restore();
  c.beginPath();c.moveTo(-s*.35,-s*.55);c.quadraticCurveTo(0,-s*.4,s*.35,-s*.55);c.lineTo(s*.75,s*.7);c.quadraticCurveTo(0,s*.82,-s*.75,s*.7);c.closePath();c.stroke();capaldiMark(c,0,s*.15,s*.2);}
 if(id==='spiegel'){c.rotate(.35);c.fillStyle='#ffc928';c.beginPath();c.roundRect(-s*.1,s*.2,s*.2,s*.65,s*.08);c.fill();c.stroke();
  c.fillStyle='#ffc928';c.beginPath();c.arc(0,-s*.2,s*.5,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#d4f2ff';c.beginPath();c.arc(0,-s*.2,s*.38,0,Math.PI*2);c.fill();c.stroke();
  c.strokeStyle='#fff';c.lineWidth=s*.07;c.beginPath();c.moveTo(-s*.2,-s*.32);c.lineTo(-s*.05,-s*.47);c.stroke();}
 if(id==='krultang'){c.rotate(-.5);c.fillStyle='#e9edf5';c.beginPath();c.roundRect(-s*.1,-s*.85,s*.2,s*1.0,s*.1);c.fill();c.stroke();
  c.fillStyle='#8a5cf6';c.beginPath();c.roundRect(-s*.13,s*.12,s*.26,s*.6,s*.08);c.fill();c.stroke();
  c.fillStyle='#ff5fa2';c.beginPath();c.roundRect(s*.1,-s*.75,s*.12,s*.7,s*.06);c.fill();c.stroke();
  c.strokeStyle=NAVY;c.beginPath();c.moveTo(0,s*.72);c.bezierCurveTo(s*.1,s*.95,s*.5,s*.8,s*.55,s*1.0);c.stroke();}
 if(id==='wax'){c.fillStyle='#fff';c.beginPath();c.roundRect(-s*.55,-s*.15,s*1.1,s*.7,s*.14);c.fill();c.stroke();
  c.fillStyle='#ff9f1c';ell(c,0,-s*.15,s*.55,s*.17);c.fill();c.stroke();c.fillStyle='#ffb84d';c.beginPath();c.moveTo(-s*.1,-s*.2);c.quadraticCurveTo(0,-s*.55,s*.12,-s*.22);c.fill();c.stroke();
  capaldiMark(c,0,s*.22,s*.18);}
 if(id==='stoel'){c.fillStyle='#ff5fa2';c.beginPath();c.roundRect(-s*.42,-s*.7,s*.84,s*.62,s*.16);c.fill();c.stroke();
  c.beginPath();c.roundRect(-s*.55,-s*.12,s*1.1,s*.24,s*.1);c.fill();c.stroke();
  c.fillStyle='#e9edf5';c.beginPath();c.roundRect(-s*.07,s*.12,s*.14,s*.5,3);c.fill();c.stroke();ell(c,0,s*.7,s*.45,s*.1);c.fill();c.stroke();
  c.lineWidth=lw;c.beginPath();c.moveTo(-s*.55,-s*.1);c.lineTo(-s*.62,-s*.35);c.moveTo(s*.55,-s*.1);c.lineTo(s*.62,-s*.35);c.stroke();}
 c.restore();}
const MS={cards:[],open:[],lock:false,pairs:0,moves:0,n:0,t0:0,run:false};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function startMem(){if(!GRP)return;S.run=false;S.mode='mem';const n=GRP.id===0?6:GRP.id===1?8:10;
 const pick=shuffle(TOOLS.slice()).slice(0,n),deck=shuffle([...pick,...pick].map(t=>({t})));
 Object.assign(MS,{cards:deck,open:[],lock:false,pairs:0,moves:0,n,t0:performance.now(),run:true});
 const g=$('#mgrid');g.textContent='';g.dataset.n=n;const badge=document.querySelector('.glogo svg').outerHTML;
 deck.forEach((card,i)=>{const b=document.createElement('button');b.type='button';b.className='mcard';b.setAttribute('aria-label','Kaartje '+(i+1)+', nog dicht');
  b.innerHTML=`<span class="in"><span class="b">${badge}</span><span class="f"><canvas aria-hidden="true"></canvas><small>${card.t.name}</small></span></span>`;
  const c=fitCanvas(b.querySelector('canvas'),120,120);drawTool(c,card.t.id,60,62,46);
  b.addEventListener('click',()=>{ac();flipMem(i);});card.el=b;g.append(b);});
 show('#s-mem');memHud();
 say('#say-mem',host(),'Zoek twee dezelfde kaartjes. Tik op een kaartje om het om te draaien.','happy');}
function memHud(){$('#m-pairs').textContent=`${MS.pairs}/${MS.n}`;$('#m-moves').textContent=MS.moves;}
function flipMem(i){if(MS.lock||!MS.run)return;const card=MS.cards[i];if(card.done||MS.open.includes(i))return;
 card.el.classList.add('open');card.el.setAttribute('aria-label',card.t.name);tone(700,.06,'triangle',.05);MS.open.push(i);
 if(MS.open.length<2)return;MS.moves++;const[a,b]=MS.open.map(j=>MS.cards[j]);
 if(a.t.id===b.t.id){MS.pairs++;a.done=b.done=true;MS.open=[];setTimeout(()=>{a.el.classList.add('done');b.el.classList.add('done');},350);
  [784,1046].forEach((f,k)=>tone(f,.12,'triangle',.06,k*.08));say('#say-mem',host(),a.t.say,'happy');
  if(MS.pairs===MS.n){MS.run=false;setTimeout(finishMem,1500+a.t.say.length*45);}}
 else{MS.lock=true;setTimeout(()=>{a.el.classList.remove('open');b.el.classList.remove('open');a.el.setAttribute('aria-label','Kaartje, nog dicht');b.el.setAttribute('aria-label','Kaartje, nog dicht');MS.open=[];MS.lock=false;},1050);
  if(MS.moves===3&&MS.pairs===0)say('#say-mem',host(),'Probeer te onthouden waar elk plaatje ligt!','happy');}
 memHud();}
function finishMem(){const n=MS.n,secs=(performance.now()-MS.t0)/1000;
 const stars=MS.moves<=Math.round(n*1.5)?3:MS.moves<=Math.round(n*2.2)?2:1;
 const score=n*100+Math.max(0,Math.round(n*2.5)-MS.moves)*30+Math.max(0,180-Math.round(secs))*2;
 const before=PICKABLE.filter(crewOpen);DB.mem=Math.max(DB.mem||0,stars);persist();
 const fresh=PICKABLE.filter(id=>crewOpen(id)&&!before.includes(id)),ue=$('#e-unlock');ue.hidden=!fresh.length;
 if(fresh.length){ue.textContent=`Nieuw in je Crew: ${fresh.map(id=>CREW[id].name).join(' en ')}!`;meetQ=fresh.slice();setTimeout(()=>{if(!$('#s-end').hidden&&meetQ.length)openMeet(meetQ.shift(),true);},1600);}
 RES={score,stars,monster:'Kappersmemory',saved:false};
 $('#e-eyebrow').textContent='Capaldi Kappers · Kappersmemory';
 $('#e-title').textContent=stars===3?'Echte memory-meester!':'Alle paren gevonden!';
 const st=$('#e-stars');st.innerHTML=[1,2,3].map(i=>`<span class="${i<=stars?'on':''}">★</span>`).join('');st.setAttribute('aria-label',`${stars} van 3 sterren`);
 $('#e-score').textContent=score;$('#e-l1').textContent=`${n} paren`;$('#e-l2').textContent=`${MS.moves} beurten`;$('#e-l3').hidden=true;$('#back').textContent='Ander spel';
 $('#save').hidden=false;$('#saved').hidden=true;
 say('#say-end','petra',['','Mwah. Veel beurten nodig, hè? Nog een keer!','Niet slecht... Je kent de spullen van de kapper al aardig.','Hm. Ik zie... een echte kapper in de dop!'][stars],stars===3?'happy':'stern');
 fanfare();show('#s-end');
 const c=fitCanvas($('#end-cv'),300,280);c.clearRect(0,0,300,280);const ids=MS.cards.slice(0,4).map(x=>x.t.id);
 ids.forEach((id,k)=>{const x=82+(k%2)*136,y=78+Math.floor(k/2)*128;c.save();c.translate(x,y);c.rotate((k%2?1:-1)*.08);c.fillStyle='#fff';c.strokeStyle=NAVY;c.lineWidth=3;c.beginPath();c.roundRect(-56,-60,112,120,14);c.fill();c.stroke();c.restore();drawTool(c,id,x,y,40);});
 renderBoard();renderCrew();}
$('#m-quit').addEventListener('click',()=>{MS.run=false;show('#s-start');renderCrew();});
$('#g-knip').addEventListener('click',()=>{ac();$('#dex').scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});});
$('#g-mem').addEventListener('click',()=>{ac();startMem();});
function renderGames(){const a=fitCanvas($('#g-knip canvas'),160,110);a.clearRect(0,0,160,110);drawMonster(a,M[0],80,64,22,{lens:null,time:1.2,mood:'smile'});
 const b=fitCanvas($('#g-mem canvas'),160,110);b.clearRect(0,0,160,110);[[50,'schaar',-.12],[110,'fohn',.12]].forEach(([x,id,r])=>{b.save();b.translate(x,55);b.rotate(r);b.fillStyle='#fff';b.strokeStyle=NAVY;b.lineWidth=2.5;b.beginPath();b.roundRect(-30,-40,60,80,10);b.fill();b.stroke();b.restore();drawTool(b,id,x,55,22);});
 {const k=fitCanvas($('#g-color canvas'),160,110);k.clearRect(0,0,160,110);k.fillStyle='#fff';k.strokeStyle=NAVY;k.lineWidth=2.5;k.beginPath();k.roundRect(20,12,78,86,8);k.fill();k.stroke();
  k.save();k.beginPath();k.roundRect(20,12,78,86,8);k.clip();drawCrew(k,'lokkie',59,52,24,'happy');k.restore();
  ['#ff5fa2','#ffc928','#22c3c3','#8a5cf6'].forEach((col,i)=>{k.fillStyle=col;k.beginPath();k.arc(120+(i%2)*22,30+Math.floor(i/2)*24,9,0,Math.PI*2);k.fill();k.stroke();});
  k.save();k.translate(128,86);k.rotate(-.7);k.fillStyle='#ffc928';k.beginPath();k.roundRect(-4,-24,8,30,3);k.fill();k.stroke();k.fillStyle='#ff5fa2';k.beginPath();k.moveTo(-6,6);k.lineTo(6,6);k.lineTo(0,18);k.closePath();k.fill();k.stroke();k.restore();}
 const ms=DB.mem||0;$('#g-mem-stars').innerHTML=[1,2,3].map(i=>`<span class="${i<=ms?'on':''}">★</span>`).join('');}

const A=['Snelle','Stoere','Gouden','Wilde','Turbo','Super','Mega','Flitsende'],N=['Schaar','Kam','Föhn','Knipper','Krul','Stekel','Kuif','Tondeuse'];
$('#dice').addEventListener('click',()=>{$('#nick').value=A[Math.floor(Math.random()*A.length)]+' '+N[Math.floor(Math.random()*N.length)];});
$('#save').addEventListener('submit',e=>{e.preventDefault();if(!RES||RES.saved)return;
 const nick=($('#nick').value||'').replace(/\s+/g,' ').trim().slice(0,16)||'Anonieme Kapper';
 const d=Date.now();DB.scores.push({nick,score:RES.score,monster:RES.monster,stars:RES.stars,d,g:GRP.id});
 DB.scores=DB.scores.sort((a,b)=>b.score-a.score).slice(0,200);persist();RES.saved=true;
 const top=DB.scores.filter(s=>(s.g??3)===GRP.id).slice(0,5).some(s=>s.d===d);
 $('#save').hidden=true;$('#saved').textContent=top?'Opgeslagen! Je staat in de Top 5.':'Opgeslagen! Nog even oefenen voor de Top 5.';$('#saved').hidden=false;renderBoard();});

addEventListener('resize',()=>{if(S.run)layout();});
/* uitleg stap voor stap */
function setAge(a){AGE=a;GRP=GROUPS.find(g=>a>=g.from&&a<=g.to);
 $('#a-age').textContent=a>=12?'12+ jaar':a+' jaar';$('#a-lvl').textContent=GRP.desc;
 document.querySelectorAll('.age').forEach(b=>b.classList.toggle('sel',+b.dataset.a===a));updateAgebar();renderBoard();}
const agesEl=$('#ages');
for(let a=4;a<=12;a++){const b=document.createElement('button');b.type='button';b.className='age';b.dataset.a=a;b.textContent=a===12?'12+':a;b.setAttribute('aria-label',a===12?'12 jaar of ouder':a+' jaar');
 b.addEventListener('click',()=>{ac();tone(523+a*30,.12,'square',.05);setAge(a);updNext();setTimeout(()=>{if(STEPS[WI].k==='leeftijd'&&!$('#s-intro').hidden){WSUB=99;nextStep();}},450);});agesEl.append(b);}

const STEPS=[
 {k:'welkom',who:'haarriet',say:['Hoi! Welkom bij Capaldi Kappers. Ik ben Haarriët.','Deze monsters hebben wild haar. Help jij ze weer netjes te worden?'],next:'Beginnen'},
 {k:'scherm',who:'haarriet',say:['Speel je op een telefoon of op een tablet? Tik erop.'],need:()=>!!DB.device},
 {k:'leeftijd',who:'haarriet',say:['Hoe oud ben je? Tik op je leeftijd.'],need:()=>!!GRP},
 {k:'kapper',who:'haarriet',say:()=>['Kies een kapper. Die helpt jou tijdens het spelen.',`Met sterren speel je nieuwe kappers vrij. Jij hebt ${totalStars()} van de ${MAXST()} sterren.`]},
 {k:'tondeuse',who:()=>host(),say:['Level 1: houd je vinger op de baard en schuif de tondeuse eroverheen.']},
 {k:'schaar',who:()=>host(),say:['Level 2: veeg met je vinger door het haar om te knippen.']},
 {k:'streepjes',who:'petra',say:['Ik ben Petra, de jury. Knip tot aan het streepje.','Groen is goed. Rood is te kort.']},
 {k:'groei',who:()=>host(),say:['Goed nieuws: het haar groeit steeds weer aan!','Zie je "Groeit aan!"? Knip het nog een keer bij, dan pak je weer extra punten.']},
 {k:'goud',who:'lokkie',say:['Ik ben Lokkie! Zie je een gouden lok? Tik er snel op voor 50 extra punten!']},
 {k:'klaar',who:()=>host(),say:['Super, je weet alles!','Kies nu wie er bij Capaldi in de stoel mag.'],next:'Naar de monsters'}];
let WSUB=0;
const parts=st=>{const v=typeof st.say==='function'?st.say():st.say;return Array.isArray(v)?v:[v];};
function talk(){const st=STEPS[WI],p=parts(st),k=Math.min(WSUB,p.length-1);
 say('#say-start',val(st.who),p[k],'happy');const nm=$('#say-start b');if(p.length>1)nm.textContent+=`  ${'●'.repeat(k+1)}${'○'.repeat(p.length-k-1)}`;
 const sp=$('#say-start span');sp.style.animation='none';void sp.offsetHeight;sp.style.animation='';
 const last=k>=p.length-1;$('#w-next').textContent=last?(WSINGLE?'Klaar':(st.next||'Verder')):'Verder';
 $('#w-back').hidden=!WSINGLE&&WI===0&&k===0;}
let WI=0,WSINGLE=false,demoRaf=0;
const val=v=>typeof v==='function'?v():v;
function goStep(i,single){WI=i;WSINGLE=!!single;const st=STEPS[i];
 document.querySelectorAll('.wstep').forEach(el=>{const on=el.dataset.k===st.k;el.hidden=!on;if(on){el.style.animation='none';void el.offsetHeight;el.style.animation='';}});
 if(st.k==='kapper')renderCrew();
 const d=$('#w-dots');d.hidden=WSINGLE;d.innerHTML=STEPS.map((_,j)=>`<i class="${j===i?'on':j<i?'done':''}"></i>`).join('');
 $('#w-skip').hidden=WSINGLE||i===STEPS.length-1;
 WSUB=0;talk();updNext();show('#s-intro');startDemo();}
function updNext(){const st=STEPS[WI],more=WSUB<parts(st).length-1;$('#w-next').disabled=!more&&!!(st.need&&!st.need());}
function nextStep(){if($('#w-next').disabled)return;if(WSUB<parts(STEPS[WI]).length-1){WSUB++;talk();updNext();tone(587,.06,'triangle',.04);return;}if(WSINGLE||WI>=STEPS.length-1){if(!WSINGLE){DB.introSeen=true;persist();}toStart();return;}tone(660,.08,'square',.04);goStep(WI+1);}
function prevStep(){if(WSUB>0){WSUB=Math.min(WSUB,parts(STEPS[WI]).length-1)-1;if(WSUB>=0){talk();updNext();return;}WSUB=0;}if(WSINGLE){toStart();return;}if(WI>0)goStep(WI-1);}
function toStart(){stopDemo();if(!GRP){goStep(2,true);say('#say-start','haarriet','Hoe oud ben je? Tik op je leeftijd, dan kun je meteen spelen.','happy');return;}updateAgebar();renderDex();renderBoard();show('#s-start');}
$('#w-next').addEventListener('click',nextStep);
$('#w-back').addEventListener('click',prevStep);
$('#w-skip').addEventListener('click',()=>{ac();if(!DB.device)setDevice(matchMedia('(max-width:600px)').matches?'phone':'tablet');DB.introSeen=true;persist();toStart();});
$('#a-change').addEventListener('click',()=>goStep(2,true));
$('#c-change').addEventListener('click',()=>goStep(3,true));
$('#w-again').addEventListener('click',()=>goStep(4,false));

/* uitleg-animaties */
function startDemo(){stopDemo();const cvd=document.querySelector(`.wstep[data-k="${STEPS[WI].k}"] canvas.demo`);if(!cvd)return;
 const c=fitCanvas(cvd,380,300),kind=cvd.dataset.demo,t0=performance.now();
 const loop=now=>{if($('#s-intro').hidden){demoRaf=0;return;}drawDemo(c,kind,(now-t0)/1000);demoRaf=requestAnimationFrame(loop);};demoRaf=requestAnimationFrame(loop);}
function stopDemo(){if(demoRaf)cancelAnimationFrame(demoRaf);demoRaf=0;}
function demoBg(c,w,h,R,cy){const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#bfeaff');g.addColorStop(1,'#eaf8ff');c.fillStyle=g;c.fillRect(0,0,w,h);
 const fy=cy+R*1.45;c.fillStyle='#ffe3f0';c.fillRect(0,fy,w,h-fy);c.fillStyle='#ffc8e0';for(let x=0;x<w;x+=30)c.fillRect(x,fy,15,h-fy);salonDecor(c,w,h,R,w/2,fy+R*.06,true);}
function tag(c,txt,x,y,col,size,pill){c.save();c.font=`${size}px Bungee, Impact, sans-serif`;c.textAlign='center';c.textBaseline='middle';if(pill){const tw=c.measureText(txt).width+28;c.fillStyle='rgba(255,255,255,.95)';c.strokeStyle=NAVY;c.lineWidth=3;c.beginPath();c.roundRect(x-tw/2,y-size*.85,tw,size*1.7,size);c.fill();c.stroke();}c.lineJoin='round';c.lineWidth=6;c.strokeStyle='#fff';c.strokeText(txt,x,y);c.fillStyle=col;c.fillText(txt,x,y);c.restore();}
function pointer(c,x1,y1,x2,y2,col){c.save();c.strokeStyle=col;c.lineWidth=3;c.lineCap='round';c.setLineDash([4,5]);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.setLineDash([]);c.fillStyle=col;c.beginPath();c.arc(x2,y2,4,0,Math.PI*2);c.fill();c.restore();}
function finger(c,x,y){c.save();c.fillStyle='#f3cba9';c.strokeStyle=NAVY;c.lineWidth=3;c.beginPath();c.roundRect(x-11,y-4,22,46,11);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.roundRect(x-6,y,12,10,5);c.fill();c.restore();}
function tipOf(geom,m,i,cx,cy,R,Lf){const g=geom(m,i,cx,cy,R),L=(Lf??g.t)*g.ml;return[g.ax+Math.cos(g.d)*L,g.ay+Math.sin(g.d)*L];}
function drawDemo(c,k,t){const w=380,h=300,m=M[0],f=fitR(w,h),R=f.R,cy=f.cy,cx=w/2;c.clearRect(0,0,w,h);
 const sb=styledBeard(m),sh=styledLens(m);
 if(k==='hello'){demoBg(c,w,h,R,cy);drawMonster(c,m,cx,cy,R,{time:t,mood:'smile',look:{x:cx+Math.sin(t*1.3)*160,y:cy+Math.cos(t)*40}});return;}
 if(k==='clip'||k==='cut'){const per=4.6,ph=t%per,p=Math.min(1,ph/3.3),clip=k==='clip';const R=clip?f.R*1.35:f.R,cy=clip?112:f.cy;
  const n=clip?m.beard.n:m.n,tg=(u,i)=>clip?m.beard.target(u,i):m.target(u,i);
  const lens=Array.from({length:n},(_,i)=>{const u=i/(n-1);return u<=p?tg(u,i):1;});
  demoBg(c,w,h,R,cy);
  drawMonster(c,m,cx,cy,R,{blens:clip?lens:sb,lens:clip?null:lens,time:t,mood:p>.55?'happy':'smile',guide:clip?'beard':'hair'});
  const at=q=>{const fi=Math.min(n-1,Math.max(0,q)*(n-1)),i0=Math.floor(fi),i1=Math.min(n-1,i0+1),fr=fi-i0,a=tipOf(clip?geomB:geomH,m,i0,cx,cy,R),b=tipOf(clip?geomB:geomH,m,i1,cx,cy,R);return[a[0]+(b[0]-a[0])*fr,a[1]+(b[1]-a[1])*fr];};
  if(ph<3.5){const[x,y]=at(p);
   if(!clip){c.save();c.strokeStyle='rgba(255,95,162,.75)';c.lineWidth=6;c.lineCap='round';c.beginPath();for(let q=Math.max(0,p-.18),j=0;q<=p;q+=.03,j++){const[px,py]=at(q);j?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();c.restore();scissors(c,x,y,R*.4,Math.sin(t*18)>0);}
   else clipper(c,x,y,R,true,t);
   tag(c,clip?'Houd vast en schuif':'Veeg door de haren',w/2,h-24,NAVY,17,true);}
  else tag(c,'Netjes!',w/2,h-24,'#2fb36b',24,true);
  return;}
 if(k==='lines'){const n=m.n;const lens=Array.from({length:n},(_,i)=>{const u=i/(n-1),tg=m.target(u,i);if(i>=3&&i<=6)return tg;if(i===10)return Math.max(.06,tg-.24);return 1;});
  demoBg(c,w,h,R,cy);drawMonster(c,m,cx,cy,R,{blens:sb,lens,time:t*.4,mood:'smile',guide:'hair'});
  const pulse=1+.08*Math.sin(t*5);
  const g1=tipOf(geomH,m,4,cx,cy,R),g2=tipOf(geomH,m,10,cx,cy,R,lens[10]),g3=tipOf(geomH,m,15,cx,cy,R);
  pointer(c,62,70,g1[0],g1[1],'#2fb36b');tag(c,'Goed!',58,58,'#2fb36b',Math.round(17*pulse));
  pointer(c,w-70,40,g2[0],g2[1],'#ff4d6d');tag(c,'Te kort!',w-70,28,'#ff4d6d',Math.round(17*pulse));
  c.save();c.strokeStyle=NAVY;c.lineWidth=3;c.globalAlpha=.5+.5*Math.sin(t*5);c.beginPath();c.arc(g3[0],g3[1],R*.17,0,Math.PI*2);c.stroke();c.restore();
  pointer(c,w-46,150,g3[0]+R*.12,g3[1],NAVY);tag(c,'Tot hier',w-46,166,NAVY,14);
  return;}
 if(k==='grow'){const per=6,ph=t%per,growing=ph<4.2,g=growing?Math.min(1,ph/4.2):0;
  const lens=sh.map(tg=>growing?Math.min(1,tg+g*.34):tg);
  demoBg(c,w,h,R,cy);drawMonster(c,m,cx,cy,R,{blens:sb,lens,time:t*.5,mood:growing&&g>.4?'smile':'happy',guide:'hair'});
  if(growing){c.save();c.strokeStyle='#e8701f';c.lineWidth=4;c.lineCap='round';c.lineJoin='round';
    for(const i of[3,8,13,17]){const[tx,ty]=tipOf(geomH,m,i,cx,cy,R,lens[i]),gg=geomH(m,i,cx,cy,R),dx=Math.cos(gg.d),dy=Math.sin(gg.d),bob=(t*20)%10;
     const ax=tx+dx*(8+bob),ay=ty+dy*(8+bob),px=-dy,py=dx;c.beginPath();c.moveTo(ax-dx*8+px*7,ay-dy*8+py*7);c.lineTo(ax,ay);c.lineTo(ax-dx*8-px*7,ay-dy*8-py*7);c.stroke();}
    c.restore();
    tag(c,g<.35?'Netjes geknipt...':'Het haar groeit aan!',w/2,h-24,g<.35?'#2fb36b':'#e8701f',18,true);
    if(g>.45){const[tx,ty]=tipOf(geomH,m,9,cx,cy,R,lens[9]);tag(c,'Groeit aan!',tx,ty-14-(g-.45)*20,'#e8701f',14);}}
  else{const q=(ph-4.2)/1.8;const[x,y]=tipOf(geomH,m,Math.round(2+q*14),cx,cy,R);scissors(c,x,y,R*.4,Math.sin(t*18)>0);tag(c,'Knip! Weer netjes.',w/2,h-24,'#2fb36b',18,true);}
  return;}
 if(k==='gold'){const g0=c.createLinearGradient(0,0,0,h);g0.addColorStop(0,'#bfeaff');g0.addColorStop(1,'#eaf8ff');c.fillStyle=g0;c.fillRect(0,0,w,h);
  c.fillStyle='#ffe3f0';c.fillRect(0,h-50,w,50);c.fillStyle='#ffc8e0';for(let x=0;x<w;x+=30)c.fillRect(x,h-50,15,50);
  const per=4,ph=t%per,tap=2.2,GR=120,gx=w*.4+Math.sin(ph*3)*14,gy=-30+Math.min(ph,tap)*82;
  const jump=ph>tap&&ph<tap+.6?Math.sin((ph-tap)/.6*Math.PI)*40:0;
  drawCrew(c,'lokkie',w-62,h-58-jump,34,'happy');
  if(ph<tap){drawGold(c,gx,gy,GR,t,true);
   if(ph>1.1){const q=Math.min(1,(ph-1.1)/(tap-1.1-.15)),fx=w*.15+(gx-w*.15)*q,fy=h+10+(gy+6-h-10)*q;finger(c,fx,fy);}}
  else{const q=(ph-tap);
   if(q<.5){c.save();c.strokeStyle='#ffc928';c.lineWidth=4;for(const r of[1,1.6])  {c.globalAlpha=1-q*2;c.beginPath();c.arc(gx,gy,20+q*90*r,0,Math.PI*2);c.stroke();}c.restore();}
   if(q<.6)finger(c,gx,gy+6);
   tag(c,'+50',gx,gy-20-q*30,'#c9a063',26);tag(c,'Gevangen!',w-70,h-120-jump,'#ff5fa2',16);}
  if(ph<tap)tag(c,'Tik op de gouden lok!',w*.4,h-24,NAVY,17,true);
  return;}
}

if(DB.device)setDevice(DB.device);
renderDex();renderBoard();renderCrew();renderGames();goStep(0);
if(/[?&]test\b/.test(location.search))window.__KM={S,MS,M,CK,PLATES,openPlate,startColor,fillAt,start,begin3,frame3,finish,startMem,openMeet,setAge,toStart,get GRP(){return GRP;}};
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{renderDex();renderCrew();renderGames();});
})();
