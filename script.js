
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let S={cards:[{id:1,t:'Design landing page',p:'high',c:0},{id:2,t:'Write launch email',p:'mid',c:1},{id:3,t:'Set up analytics',p:'low',c:2}],
tx:[{id:1,t:'Salary',a:90000,c:'Income'},{id:2,t:'Groceries',a:12000,c:'Food'},{id:3,t:'Electricity',a:9500,c:'Bills'}],
hb:[{n:'Read 20 pages',d:[1,1,0,1,0,0,0]},{n:'Walk 30 minutes',d:[1,1,1,1,0,0,0]}]};
try{const r=localStorage.getItem('nuvo2');if(r)S=JSON.parse(r)}catch(e){}
const save=()=>{try{localStorage.setItem('nuvo2',JSON.stringify(S))}catch(e){}};
const uid=()=>Date.now()+Math.random();
/* tabs */
function pill(){const b=$('#tabs .on'),p=$('#pill');p.style.width=b.offsetWidth+'px';p.style.transform='translateX('+(b.offsetLeft-5)+'px)'}
$$('#tabs button').forEach(b=>b.onclick=()=>{$$('#tabs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');$$('.view').forEach(v=>v.classList.remove('on'));$('#'+b.dataset.v).classList.add('on');pill();if(b.dataset.v==='money')renderMoney();if(b.dataset.v==='habits')renderHabits()});
addEventListener('resize',pill);
/* board */
const names=['To do','In progress','Done'];let dragId=null;
function renderBoard(){
 const w=$('#cols');w.innerHTML='';
 names.forEach((n,ci)=>{
  const col=document.createElement('div');col.className='col';
  const cs=S.cards.filter(c=>c.c===ci);
  col.innerHTML='<h3>'+n+'<span>'+cs.length+'</span></h3>';
  col.ondragover=e=>{e.preventDefault();col.classList.add('over')};
  col.ondragleave=()=>col.classList.remove('over');
  col.ondrop=e=>{e.preventDefault();const c=S.cards.find(x=>x.id===dragId);if(c){c.c=ci;save();renderBoard()}};
  cs.forEach(c=>{
   const d=document.createElement('div');d.className='card p-'+c.p;d.draggable=true;
   d.innerHTML='<div></div><div class="row"><button aria-label="Move left">←</button><button aria-label="Move right">→</button><button aria-label="Delete">×</button></div>';
   d.firstChild.textContent=c.t;
   d.ondragstart=()=>{dragId=c.id;setTimeout(()=>d.classList.add('drag'),0)};d.ondragend=()=>d.classList.remove('drag');
   const [l,r,x]=d.querySelectorAll('button');
   l.onclick=()=>{if(c.c>0){c.c--;save();renderBoard()}};r.onclick=()=>{if(c.c<2){c.c++;save();renderBoard()}};
   x.onclick=()=>{S.cards=S.cards.filter(z=>z!==c);save();renderBoard()};
   col.appendChild(d);
  });
  w.appendChild(col);
 });
}
$('#cf').onsubmit=e=>{e.preventDefault();const t=$('#ct').value.trim();if(!t)return;S.cards.push({id:uid(),t,p:$('#cp').value,c:0});$('#ct').value='';save();renderBoard()};
/* money */
const colors={Food:'#ffb56b',Bills:'#7cc4ff',Travel:'#c4a6ff',Fun:'#ff6b5b'};
const fmt=n=>'Rs '+Math.round(n).toLocaleString('en-US');let shown=0;
function renderMoney(){
 const inc=S.tx.filter(t=>t.c==='Income').reduce((a,t)=>a+t.a,0),out=S.tx.filter(t=>t.c!=='Income').reduce((a,t)=>a+t.a,0),bal=inc-out;
 const from=shown,t0=performance.now();
 (function step(t){const k=Math.min(1,(t-t0)/800),v=from+(bal-from)*(1-Math.pow(1-k,3));$('#bal').textContent=fmt(v);if(k<1)requestAnimationFrame(step);else shown=bal})(t0);
 $('#kin').textContent='In '+fmt(inc);$('#kout').textContent='Out '+fmt(out);
 const cats=Object.keys(colors),C=2*Math.PI*47;let off=0,svg='<circle cx="60" cy="60" r="47" stroke="#0c1424"/>',leg='';
 cats.forEach(c=>{const v=S.tx.filter(t=>t.c===c).reduce((a,t)=>a+t.a,0);if(!v)return;const len=C*v/out;
  svg+='<circle cx="60" cy="60" r="47" stroke="'+colors[c]+'" stroke-dasharray="'+len+' '+(C-len)+'" stroke-dashoffset="'+(-off)+'"/>';off+=len;
  leg+='<div><i style="background:'+colors[c]+'"></i>'+c+' '+Math.round(100*v/out)+'%</div>'});
 $('#donut').innerHTML=svg;$('#leg').innerHTML=leg||'<div style="color:var(--mute)">No spending yet</div>';
 const l=$('#txs');l.innerHTML='';
 [...S.tx].reverse().slice(0,7).forEach(t=>{const d=document.createElement('div');d.className='tx';
  d.innerHTML='<div><span></span><small>'+t.c+'</small></div><div><b class="'+(t.c==='Income'?'in':'out')+'">'+(t.c==='Income'?'+':'−')+fmt(t.a)+'</b><button aria-label="Delete entry">×</button></div>';
  d.querySelector('span').textContent=t.t;d.querySelector('button').onclick=()=>{S.tx=S.tx.filter(z=>z!==t);save();renderMoney()};l.appendChild(d)});
}
$('#mf').onsubmit=e=>{e.preventDefault();const a=+$('#ma').value,t=$('#mt').value.trim();if(!a||!t)return;S.tx.push({id:uid(),t,a,c:$('#mc').value});$('#mt').value=$('#ma').value='';save();renderMoney()};
/* habits */
function renderHabits(){
 const days=['M','T','W','T','F','S','S'],l=$('#hl');
 l.innerHTML='<div class="h"><span></span>'+days.map(d=>'<span class="hd">'+d+'</span>').join('')+'<span class="hd">Streak</span></div>';
 let done=0,all=S.hb.length*7;
 S.hb.forEach(h=>{
  const r=document.createElement('div');r.className='h';const n=document.createElement('span');n.textContent=h.n;r.appendChild(n);
  h.d.forEach((v,i)=>{done+=v?1:0;const b=document.createElement('button');b.className='d'+(v?' on':'');b.setAttribute('aria-label',h.n+' day '+(i+1));b.onclick=()=>{h.d[i]=v?0:1;save();renderHabits()};r.appendChild(b)});
  let s=0,m=0;h.d.forEach(v=>{s=v?s+1:0;m=Math.max(m,s)});
  const st=document.createElement('span');st.className='streak';st.textContent=m+'d';r.appendChild(st);l.appendChild(r)});
 const p=all?Math.round(100*done/all):0;$('#hp').textContent=p+'%';$('#hbar').style.width=p+'%';
}
$('#hf').onsubmit=e=>{e.preventDefault();const n=$('#hn').value.trim();if(!n)return;S.hb.push({n,d:[0,0,0,0,0,0,0]});$('#hn').value='';save();renderHabits()};
renderBoard();renderMoney();renderHabits();
document.fonts&&document.fonts.ready.then(pill);pill();
