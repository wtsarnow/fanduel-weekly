const $=s=>document.querySelector(s),fmt=n=>n==null?'<span class="pend">pending</span>':n.toLocaleString(),money=n=>n==null?'<span class="pend">pending</span>':'$'+(+n).toFixed(2);
fetch('weeks.json').then(r=>r.json()).then(D=>{
 const W=D.weeks,all=W.flatMap(w=>w.entries.map(e=>({...e,week:w.week})));
 $('#upd').textContent='Updated '+D.updated;const cur=D.autotune_history.at(-1);$('#status').className='pill '+cur.status;$('#status').textContent='Auto-tune: '+cur.status;
 const graded=W.filter(w=>w.beat80!==null&&w.beat80!==undefined),hits=graded.filter(w=>w.beat80).length;
 const fees=all.reduce((a,e)=>a+(e.fee!=null&&e.score!=null?e.fee:0),0),wins=all.reduce((a,e)=>a+(e.fee!=null&&e.winnings?e.winnings:0),0);
 const best=all.filter(e=>e.pct!=null&&!e.estimated).sort((a,b)=>b.pct-a.pct)[0];
 $('#kpis').innerHTML=[['BEAT_80 week hit rate',`${hits}/${graded.length} (${Math.round(hits/graded.length*100)}%)`],['Graded entries',all.filter(e=>e.score!=null).length],['Best finish',`${best.pct}% · Wk${best.week}`],['Known fees',money(fees)],['Known winnings',money(wins)],['Net (known)',`<span style="color:${wins-fees>=0?'#22d39a':'#ff5c7a'}">${money(wins-fees)}</span>`]].map(([k,v])=>`<div class="kpi"><span>${k}</span><b>${v}</b></div>`).join('');
 const P=all.filter(e=>e.pct!=null);Chart.defaults.color='#8a98bd';Chart.defaults.borderColor='#22304f';
 new Chart($('#pctChart'),{type:'line',data:{labels:P.map(e=>`W${e.week} ${e.slate}`),datasets:[{label:'Percentile',data:P.map(e=>e.pct),borderColor:'#1493ff',backgroundColor:P.map(e=>e.pct>=80?'#22d39a':'#ff5c7a'),pointRadius:6,pointStyle:P.map(e=>e.estimated?'rectRot':'circle'),tension:.3},{label:'BEAT_80',data:P.map(()=>80),borderColor:'#ffb547',borderDash:[6,6],pointRadius:0}]},options:{scales:{y:{min:0,max:100}},plugins:{tooltip:{callbacks:{afterLabel:c=>c.datasetIndex?'':P[c.dataIndex].contest+(P[c.dataIndex].estimated?' (est.)':'')}}}}});
 let f=0,w=0;const M=all.filter(e=>e.fee!=null&&e.score!=null);
 new Chart($('#moneyChart'),{type:'line',data:{labels:M.map(e=>`W${e.week} ${e.slate}`),datasets:[{label:'Fees',data:M.map(e=>f+=e.fee),borderColor:'#ff5c7a',fill:false},{label:'Winnings',data:M.map(e=>w+=(e.winnings||0)),borderColor:'#22d39a',backgroundColor:'#22d39a22',fill:true}]}});
 $('#timeline').innerHTML=D.autotune_history.map(t=>`<div class="tl ${t.status}"><small>${t.date}</small><b>${t.status}</b><small>${t.why}</small></div>`).join('');
 $('#weeks').innerHTML=W.map(w=>`<div class="wk" data-w="${w.week}"><h3>Week ${w.week}</h3><p>${w.dates}</p><span class="tag ${w.beat80?'yes':w.beat80===false?'no':'pend'}">${w.beat80?'BEAT_80 YES':w.beat80===false?'BEAT_80 NO':'PENDING'}</span></div>`).join('');
 const show=n=>{const w=W.find(x=>x.week==n);document.querySelectorAll('.wk').forEach(x=>x.classList.toggle('sel',x.dataset.w==n));
  const li=a=>a&&a.length?'<ul>'+a.map(x=>`<li>${x}</li>`).join('')+'</ul>':'<span class="pend">pending</span>';
  $('#detail').innerHTML=`<h2>Week ${w.week} · ${w.dates} <span class="pill ${w.autotune}" style="margin-left:8px">${w.autotune}</span></h2><p>${w.summary}</p>
  <div class="tw"><table><tr><th>Slate</th><th>Contest</th><th>Fee</th><th>Lineup</th><th class="n">Score</th><th class="n">Rank / Field</th><th>Pct</th><th class="n">Cash line</th><th class="n">Won</th></tr>
  ${w.entries.map(e=>`<tr><td>${e.slate}</td><td>${e.contest}${e.note?`<br><small class="note">${e.note}</small>`:''}</td><td>${e.fee==null?'<span class="pend">?</span>':e.fee?money(e.fee):'Free'}</td><td>${e.lineup||'<span class="pend">pending</span>'}</td><td class="n">${fmt(e.score)}</td><td class="n">${e.rank?fmt(e.rank)+' / '+fmt(e.field):'<span class="pend">pending</span>'}</td>
  <td>${e.pct!=null?`<div class="bar"><i style="width:${e.pct}%;background:${e.pct>=80?'#22d39a':'#1493ff'}"></i></div>${e.pct}%${e.estimated?' <span class="est">est.</span>':''}${e.pct_note?' <span class="est">≤</span>':''}`:'<span class="pend">pending</span>'}</td><td class="n">${e.cash_line??'—'}</td><td class="n">${e.score==null?'<span class="pend">pending</span>':money(e.winnings)}</td></tr>`).join('')}</table></div>
  <div class="cols"><div class="box"><h4>Key data points</h4>${w.data_points.length?'<ul>'+w.data_points.map(d=>`<li><b>${d.k}:</b> ${d.v}</li>`).join('')+'</ul>':'<span class="pend">pending</span>'}</div>
  <div class="box"><h4>What worked</h4>${li(w.worked)}</div><div class="box"><h4>What didn't</h4>${li(w.didnt)}</div><div class="box"><h4>Patches applied</h4>${li(w.patches)}</div></div>`};
 document.querySelectorAll('.wk').forEach(x=>x.onclick=()=>{show(x.dataset.w);$('#detail').scrollIntoView({behavior:'smooth'})});
 show(W.filter(w=>!w.pending).at(-1).week);
});
