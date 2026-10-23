(()=>{const $=s=>document.querySelector(s),NA='<span class="na">n/a</span>';
const v=x=>x==null||x===''?NA:(typeof x==='boolean'?(x?'yes':'no'):(typeof x==='number'?(+x.toFixed(2)).toLocaleString():x));
// tabs
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x==b));
 document.querySelectorAll('.tab').forEach(t=>t.hidden=t.id!=='t-'+b.dataset.t);location.hash=b.dataset.t;window.dispatchEvent(new Event('resize'))});
const h=location.hash.slice(1);if(h)setTimeout(()=>document.querySelector(`.tabs [data-t="${h}"]`)?.click(),0);
// contest classification
const cls=e=>{const c=e.contest||'';const fmt=/Classic|Sunday Million|Hail Mary|Kickoff|Pooch|Reserve|Sun NFL Rush/i.test(c)&&!/@/.test(c.replace('Sun NFL',''))?'Classic':(e.slate==='Sunday'?'Classic':'Showdown');
 const field=e.field==null?'Unknown field':e.field>=50000?'Large GPP (50K+)':e.field>=10000?'Mid GPP (10–50K)':'Small field (<10K)';
 const brand=/mock/i.test(c)&&!/Free/i.test(c)?'Mock':/Free|Reserve/i.test(c)?'Free Play':(c.match(/Sunday Million|Hail Mary|Kickoff|Pooch Punt|Dive|Rush|Special|Gridiron|Primetime/i)||['Other'])[0];
 const fee=e.fee==null?'Fee unknown':e.fee===0?'Free':e.fee<2?'Micro (<$2)':e.fee<10?'Low ($2–9)':'$10+';
 return{fmt,fieldT:field,brand:brand.replace(/^./,m=>m.toUpperCase()),feeT:fee};};
let D,PL,SG;
Promise.all(['weeks.json','players.json','signals.json'].map(u=>fetch(u).then(r=>r.json()))).then(([d,p,s])=>{D=d;PL=p.rows;SG=s;init()});
function sortable(tb,rows,cols,render){let k=null,dir=1;const draw=()=>{const r=k?[...rows].sort((a,b)=>{const x=a[k],y=b[k];if(x==null)return 1;if(y==null)return -1;return(x>y?1:x<y?-1:0)*dir}):rows;
 tb.innerHTML='<tr>'+cols.map(c=>`<th data-k="${c[0]}">${c[1]}</th>`).join('')+'</tr>'+r.slice(0,600).map(render).join('');
 tb.querySelectorAll('th').forEach(th=>th.onclick=()=>{dir=k===th.dataset.k?-dir:-1;k=th.dataset.k;draw()});return r};return draw()}
function csv(name,rows,cols){const q=x=>x==null?'':/[",\n]/.test(x)?'"'+String(x).replace(/"/g,'""')+'"':x;
 const t=[cols.map(c=>c[0]).join(',')].concat(rows.map(r=>cols.map(c=>q(r[c[0]])).join(','))).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=name;a.click()}
function init(){
 const E=D.weeks.flatMap(w=>w.entries.map(e=>({week:w.week,...e,...cls(e)})));
 // tournament-type analytics
 const tt=()=>{const g=$('#ttGroup').value,G={};E.forEach(e=>{(G[e[g]]=G[e[g]]||[]).push(e)});
  const rows=Object.entries(G).map(([k,a])=>{const p=a.filter(e=>e.pct!=null),m=a.filter(e=>e.fee!=null&&e.score!=null),fees=m.reduce((s,e)=>s+e.fee,0),won=m.reduce((s,e)=>s+(e.winnings||0),0),gr=a.filter(e=>e.score!=null||e.pct!=null);
   return{k,n:a.reduce((s,e)=>s+(e.count||1),0),graded:gr.length,pct:p.length?p.reduce((s,e)=>s+e.pct,0)/p.length:null,b80:p.length?100*p.filter(e=>e.pct>=80).length/p.length:null,cash:m.length?100*m.filter(e=>e.winnings>0).length/m.length:null,roi:fees?100*(won-fees)/fees:null,fees,won}});
  $('#ttTable').innerHTML='<tr><th>Type</th><th class="n">Entries</th><th class="n">Graded</th><th class="n">Avg pct</th><th class="n">BEAT_80</th><th class="n">Cash</th><th class="n">ROI</th></tr>'+rows.map(r=>`<tr><td>${r.k}</td><td class="n">${r.n}</td><td class="n">${r.graded}</td><td class="n">${r.pct==null?NA:r.pct.toFixed(1)+'%'}</td><td class="n">${r.b80==null?NA:r.b80.toFixed(0)+'%'}</td><td class="n">${r.cash==null?NA:r.cash.toFixed(0)+'%'}</td><td class="n">${r.roi==null?NA:(r.roi>0?'+':'')+r.roi.toFixed(0)+'%'}</td></tr>`).join('');
  window._tt&&window._tt.destroy();window._tt=new Chart($('#ttChart'),{type:'bar',data:{labels:rows.map(r=>r.k),datasets:[{label:'Avg percentile',data:rows.map(r=>r.pct),backgroundColor:'#1493ff'},{label:'BEAT_80 rate %',data:rows.map(r=>r.b80),backgroundColor:'#22d39a'},{label:'Cash rate %',data:rows.map(r=>r.cash),backgroundColor:'#ffb547'}]},options:{scales:{y:{min:0,max:100}}}})};
 $('#ttGroup').onchange=tt;tt();
 // KPIs
 const games=[...new Set(PL.map(r=>r.game_id))];
 $('#aKpis').innerHTML=[['Player-game rows',PL.length.toLocaleString()],['NFL games covered',games.length],['Rows with FD salary',SG.coverage.salary],['Rows with Wikipedia views',SG.coverage.wiki_views_7d],['Rows with Google Trends',SG.coverage.trends_rel||'0 (n/a)']].map(([k,x])=>`<div class="kpi"><span>${k}</span><b>${x}</b></div>`).join('');
 // patterns
 const lab={log_wiki:'Wikipedia views (log), 7 days pre-game',wiki_views_7d:'Wikipedia views, 7 days pre-game',wiki_spike:'Wikipedia spike (day before ÷ prior avg)',trends_rel:'Google search interest vs "NFL"',own:'Ownership (model est.)',opp_def_rank:'Opponent defense rank (1 = toughest)',total_line:'Game total',spread:'Spread (− = favorite)',rest_days:'Days of rest',home:'Home',dome:'Dome',primetime:'Primetime',temp_f:'Temperature °F',kickoff_hour:'Kickoff hour ET',our_lineups:'Times in our lineups',salary:'FD salary',proj:'Our projection',x_mentions:'X mentions'};
 const L=s=>{const m=s.match(/^(\w+)(?: \((\w+)\))?$/);return m?(lab[m[1]]||m[1])+(m[2]?' · '+m[2]+'s':''):s};
 const tgL={fd_pts:'FD points',beat_proj:'beating projection',value:'pts per $1K'};
 $('#patterns').innerHTML=SG.top_patterns.map(p=>`<div class="pat ${p.rho<0?'neg':''}"><span>${L(p.signal)} → ${tgL[p.target]}</span><span><b>ρ ${p.rho>0?'+':''}${p.rho}</b> · n=${p.n}</span></div>`).join('')+'<ul class="note">'+SG.notes.map(n=>`<li>${n}</li>`).join('')+'</ul>';
 // heatmap
 const sigs=[...new Set(SG.correlations.map(c=>c.signal))],tg=['fd_pts','beat_proj','value'];
 const col=r=>r==null?'#0b1222':r>0?`rgba(34,211,154,${Math.min(1,Math.abs(r)*1.6)})`:`rgba(255,92,122,${Math.min(1,Math.abs(r)*1.6)})`;
 $('#heat').innerHTML='<table class="heat"><tr><th>Signal</th>'+tg.map(t=>`<th>${tgL[t]}</th>`).join('')+'</tr>'+sigs.map(s=>'<tr><td style="text-align:left">'+L(s)+'</td>'+tg.map(t=>{const c=SG.correlations.find(c=>c.signal==s&&c.target==t);return `<td style="background:${col(c&&c.rho)}">${c&&c.rho!=null?c.rho:'n/a'}<small>n=${c?c.n:0}</small></td>`}).join('')+'</tr>').join('')+'</table>';
 new Chart($('#bkChart'),{type:'bar',data:{labels:SG.buckets.map(b=>b.label.replace('Skill players: ','').replace('Salaried skill: ','$ ')),datasets:[{label:'Group A',data:SG.buckets.map(b=>b.mean_a),backgroundColor:'#22d39a'},{label:'Group B',data:SG.buckets.map(b=>b.mean_b),backgroundColor:'#ff5c7a'}]},options:{indexAxis:'y',plugins:{tooltip:{callbacks:{label:c=>{const b=SG.buckets[c.dataIndex];return c.datasetIndex?`${b.b}: ${b.mean_b} (n=${b.n_b})`:`${b.a}: ${b.mean_a} (n=${b.n_a})`}}}}}});
 $('#bkList').innerHTML=SG.buckets.map(b=>`${b.label}: ${b.a} ${b.mean_a} (n=${b.n_a}) vs ${b.b} ${b.mean_b} (n=${b.n_b})`).join('<br>');
 // per-game view
 const gi={};PL.forEach(r=>{(gi[r.game_id]=gi[r.game_id]||[]).push(r)});
 $('#gSel').innerHTML=games.map(g=>`<option>${g}</option>`).join('');
 const gv=()=>{const r=gi[$('#gSel').value],f=r[0],tm=[...new Set(r.map(x=>x.team))];
  const tot=t=>r.filter(x=>x.team==t).reduce((s,x)=>s+(x.fd_pts||0),0).toFixed(1);
  $('#gView').innerHTML=`<p>Week ${f.week} · ${f.slate.toUpperCase()} · ${f.gameday} ${f.kickoff_et} ET · total ${v(f.total_line)} · ${f.dome?'dome':'outdoor'}${f.temp_f!=null?' '+f.temp_f+'°F':''} · ${tm.map(t=>`${t} ${tot(t)} FD pts`).join(' / ')}</p>
  <div class="tw"><table><tr><th>Player</th><th>Team</th><th>Pos</th><th class="n">Salary</th><th class="n">Proj</th><th class="n">FD pts</th><th class="n">Wiki 7d</th><th>Box</th></tr>${r.slice(0,25).map(x=>`<tr><td>${x.player}</td><td>${x.team}</td><td>${x.pos}</td><td class="n">${v(x.salary)}</td><td class="n">${v(x.proj)}</td><td class="n"><b>${v(x.fd_pts)}</b></td><td class="n">${v(x.wiki_views_7d)}</td><td><small>${x.box||''}</small></td></tr>`).join('')}</table></div>`;};
 $('#gSel').onchange=()=>{gv();$('#pWeek').value='';fillG();$('#pGame').value=$('#gSel').value;pt()};$('#gSel').value=games.at(-1);
 // entries table
 const ec=[['week','Wk'],['slate','Slate'],['contest','Contest'],['fmt','Format'],['fieldT','Field'],['brand','Brand'],['fee','Fee'],['feeT','Fee tier'],['lineup','Lineup'],['score','Score'],['rank','Rank'],['field_n','Field size'],['pct','Pct'],['cash_line','Cash line'],['winnings','Won'],['estimated','Est.']];
 const ER=E.map(e=>({...e,field_n:e.field}));
 [...new Set(E.map(e=>e.week))].forEach(w=>{$('#eWeek').innerHTML+=`<option>${w}</option>`;$('#pWeek').innerHTML+=`<option>${w}</option>`});
 let ecur;const et=()=>{const w=$('#eWeek').value;ecur=sortable($('#eTable'),ER.filter(e=>!w||e.week==w),ec,e=>'<tr>'+ec.map(c=>`<td>${c[0]=='fee'?(e.fee==null?NA:'$'+e.fee):v(e[c[0]])}</td>`).join('')+'</tr>')};
 $('#eWeek').onchange=et;et();$('#eCsv').onclick=()=>csv('fanduel_entries.csv',ecur,ec);
 // players table
 const pc=[['week','Wk'],['game_id','Game'],['slate','Slate'],['player','Player'],['team','Team'],['opp','Opp'],['pos','Pos'],['salary','FD salary'],['salary_type','Salary type'],['mvp','MVP'],['proj','Proj'],['fd_pts','FD pts'],['value','Pts/$1K'],['beat_proj','vs proj'],['own','Own % (model)'],['injury','Inj'],['total_line','Total'],['spread','Spread'],['home','Home'],['kickoff_et','Kick ET'],['primetime','Prime'],['dome','Dome'],['temp_f','Temp °F'],['rest_days','Rest'],['opp_def_rank','Opp D rank'],['wiki_views_7d','Wiki 7d'],['wiki_spike','Wiki spike'],['trends_rel','G-Trends'],['x_mentions','X mentions'],['our_lineups','Our lineups'],['box','Box line']];
 [...new Set(PL.map(r=>r.pos))].forEach(p=>$('#pPos').innerHTML+=`<option>${p}</option>`);
 const fillG=()=>{const w=$('#pWeek').value,k=$('#pGame').value;$('#pGame').innerHTML='<option value="">All games</option>'+games.filter(g=>!w||gi[g][0].week==w).map(g=>`<option>${g}</option>`).join('');$('#pGame').value=k};
 let pcur;const pt=()=>{const w=$('#pWeek').value,g=$('#pGame').value,p=$('#pPos').value,q=$('#pQ').value.toLowerCase(),sal=$('#pSal').checked,ours=$('#pOurs').checked;
  const R=PL.filter(r=>(!w||r.week==w)&&(!g||r.game_id==g)&&(!p||r.pos==p)&&(!sal||r.salary)&&(!ours||r.our_lineups)&&(!q||(r.player+' '+r.team).toLowerCase().includes(q)));
  $('#pCount').textContent=`${R.length.toLocaleString()} rows${R.length>600?' (showing the first 600; CSV has all)':''}`;
  pcur=sortable($('#pTable'),R,pc,r=>'<tr>'+pc.map(c=>`<td>${c[0]=='box'?'<small>'+(r.box||'')+'</small>':v(r[c[0]])}</td>`).join('')+'</tr>')};
 $('#pWeek').onchange=()=>{fillG();pt()};['#pGame','#pPos','#pSal','#pOurs'].forEach(s=>$(s).onchange=pt);$('#pQ').oninput=pt;
 $('#pCsv').onclick=()=>csv('fanduel_players.csv',pcur,pc);fillG();gv();pt();
 $('#cov').innerHTML='<div class="tw"><table><tr><th>Field</th><th class="n">Rows filled</th><th class="n">of</th></tr>'+Object.entries(SG.coverage).map(([k,n])=>`<tr><td>${k}</td><td class="n">${n}</td><td class="n">${SG.rows_scored}</td></tr>`).join('')+'</table></div>';
}})();
