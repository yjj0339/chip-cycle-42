/* ═══════════════════════════════════════════════════════════
   main.js v2 — 导航（顶部+底部）/ 联动面板 / 全量渲染 / 钻取抽屉
   ═══════════════════════════════════════════════════════════ */
(function(){
"use strict";
const R=window.CCR, TT=R.TT, ERAS=window.CC.ERAS;
const SECTIONS=[
  ["s0","总览","overview"],["s1","一","w1"],["s2","二","w2"],["s3","三","w3"],["s4","四","w4"],
  ["s5","五","w5"],["s6","六","w6"],["s7","结论","end"],["s8","附录","appendix"]
];

/* ── 顶部导航（桌面）与底部导航（手机） ── */
const navLinks=document.getElementById("navLinks");
const tabItems=document.getElementById("tabItems");
SECTIONS.forEach(function(s){
  const a=document.createElement("a");
  a.href="#"+s[0]; a.textContent=s[1]; a.dataset.for=s[0];
  navLinks.appendChild(a);
  const t=document.createElement("a");
  t.href="#"+s[0]; t.textContent=s[1]; t.dataset.for=s[0];
  const era=ERAS[s[2]];
  if(era&&era.color) t.style.setProperty("--tabera",era.color);
  tabItems.appendChild(t);
});

/* 进度条（顶部+底部同步） */
const prog1=document.getElementById("navProgress"), prog2=document.getElementById("tabProgress");
function onScroll(){
  const h=document.documentElement;
  const p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);
  const w=(p*100).toFixed(2)+"%";
  if(prog1) prog1.style.width=w;
  if(prog2) prog2.style.width=w;
}
window.addEventListener("scroll",onScroll,{passive:true});

/* ── 右侧联动面板 ── */
const panelBody=document.getElementById("panelBody");
const panelBadge=document.getElementById("panelBadge");
const panelFoot=document.getElementById("panelFoot");
const panelMech=document.getElementById("panelMech");
let currentEra="";
function renderPanel(eraKey){
  const e=ERAS[eraKey]; if(!e) return;
  if(currentEra===eraKey) return;
  currentEra=eraKey;
  panelBadge.textContent=e.badge+(e.name?" · "+e.name:"");
  panelBadge.style.color=e.color||"";
  panelMech.innerHTML=window.CC.MECH_STAGES.map(function(st,i){
    const on=e.mech&&e.mech[i]&&e.mech[i][1]!=="—";
    return '<i class="'+(on?"on":"")+'" style="'+(on?"background:"+window.CC.MECH_STAGES[i].color:"")+'" title="'+st.name+'"></i>';
  }).join("");
  let html='<div class="panel-fade">';
  html+='<div class="pb-title">'+e.name+'</div>';
  html+='<div class="pb-thesis">'+e.thesis+'</div>';
  html+='<div class="pb-kicker">关键数字</div><table>';
  e.facts.forEach(function(f){ html+='<tr><td>'+f[0]+'</td><td class="v">'+f[1]+'</td></tr>'; });
  html+='</table>';
  html+='<div class="pb-kicker">本窗口大事</div>';
  e.events.forEach(function(ev){ html+='<div class="pb-ev"><span class="y">'+ev[0]+'</span><span>'+ev[1]+'</span></div>'; });
  html+='</div>';
  panelBody.innerHTML=html;
  panelFoot.textContent=e.foot;
}

/* ── 章节机制条 ── */
document.querySelectorAll(".mech-strip").forEach(function(strip){
  const era=ERAS[strip.dataset.era]; if(!era) return;
  strip.innerHTML=window.CC.MECH_STAGES.map(function(st,i){
    const m=era.mech[i];
    return '<div class="mech-cell" style="--sc:'+st.color+'">'
      +'<div class="st" style="color:'+st.color+'">'+st.name+'<span class="yr">'+m[1]+'</span></div>'
      +'<div class="tx">'+m[2]+'</div></div>';
  }).join("");
  const cap=document.createElement("p");
  cap.className="mech-cap";
  cap.textContent="「"+era.badge+"」的四拍机制 —— 与 1985 年以来每一轮相同";
  strip.after(cap);
});

/* ── 图表：加载后全量渲染（按容器宽度取环境） ── */
const rendered={};
function renderChartById(id){
  if(rendered[id]) return;
  rendered[id]=true;
  const el=document.getElementById(id); if(!el) return;
  if(id==="killdial"){ R.renderGauge(el); el.classList.add("in"); return; }
  if(id==="triggers"){ R.renderTriggers(el); el.classList.add("in"); return; }
  const spec=window.CCDEFS[id]; if(!spec) return;
  try{ R.render(el,spec); }catch(e){ /* 单图失败不拖垮页面 */ }
  if(spec.series&&["lines","bars","shareBars","shareArea","shareArea2","scatter"].indexOf(spec.type)>=0){
    const leg=document.createElement("div"); leg.className="legend";
    spec.series.forEach(function(s){
      const lg=document.createElement("span");
      lg.className="lg"+(s._off?" off":"");
      lg.innerHTML='<i class="sw" style="background:'+s.color+'"></i>'+s.name;
      lg.onclick=function(){ s._off=!s._off; lg.classList.toggle("off",!!s._off); try{ R.render(el,spec); }catch(e){} };
      leg.appendChild(lg);
    });
    el.insertBefore(leg,el.firstChild);
  }
  el.classList.add("in");
}
function renderAllCharts(){
  Object.keys(window.CCDEFS).forEach(renderChartById);
  renderChartById("killdial");
  renderChartById("triggers");
}
if("requestIdleCallback" in window) requestIdleCallback(renderAllCharts,{timeout:900});
else setTimeout(renderAllCharts,350);

/* 窗口尺寸跨档变化 → 重绘全部图表 */
let lastW=window.innerWidth;
let rzTimer=null;
window.addEventListener("resize",function(){
  clearTimeout(rzTimer);
  rzTimer=setTimeout(function(){
    const w=window.innerWidth;
    const crossed=(lastW<560)!==(w<560)||(lastW<1024)!==(w<1024);
    if(!crossed&&Math.abs(w-lastW)<40) return;
    lastW=w;
    Object.keys(rendered).forEach(function(k){ delete rendered[k]; });
    document.querySelectorAll(".fig-body").forEach(function(f){ f.classList.remove("in"); f.innerHTML=""; });
    renderAllCharts();
  },300);
});

/* 单位标注 */
document.querySelectorAll(".fig-unit").forEach(function(sp){
  const spec=window.CCDEFS[sp.dataset.for];
  if(spec&&spec.unit) sp.textContent=spec.unit;
});

/* ── 滚动 spy：双导航 + 面板 ── */
function setActive(id,eraKey){
  document.querySelectorAll("#navLinks a").forEach(function(a){ a.classList.toggle("on",a.dataset.for===id); });
  document.querySelectorAll("#tabItems a").forEach(function(a){ a.classList.toggle("on",a.dataset.for===id); });
  document.body.dataset.era=eraKey||"overview";
  renderPanel(eraKey==="appendix"?"overview":eraKey);
}
const spy=new IntersectionObserver(function(ents){
  ents.forEach(function(en){
    if(en.isIntersecting){
      setActive(en.target.id,en.target.dataset.era);
    }
  });
},{rootMargin:"-25% 0px -60% 0px"});
SECTIONS.forEach(function(s){ const el=document.getElementById(s[0]); el&&spy.observe(el); });
renderPanel("overview"); setActive("s0","overview");

/* 键盘翻章（桌面） */
document.addEventListener("keydown",function(ev){
  if(ev.target.tagName==="INPUT"||ev.target.tagName==="TEXTAREA") return;
  if(ev.key!=="ArrowRight"&&ev.key!=="ArrowLeft") return;
  const h=document.documentElement;
  const cur=h.scrollTop;
  let idx=0,best=1e9;
  SECTIONS.forEach(function(s,i){ const el=document.getElementById(s[0]); const d=Math.abs(el.offsetTop-140-cur); if(d<best){best=d;idx=i;} });
  const nxt=Math.min(SECTIONS.length-1,Math.max(0,idx+(ev.key==="ArrowRight"?1:-1)));
  document.getElementById(SECTIONS[nxt][0]).scrollIntoView({behavior:"smooth"});
});

/* ── 面板：手机底部抽屉 ── */
const fab=document.getElementById("panelFab");
const panelClose=document.getElementById("panelClose");
if(fab) fab.addEventListener("click",function(){ document.body.classList.toggle("panel-open"); });
if(panelClose) panelClose.addEventListener("click",function(){ document.body.classList.remove("panel-open"); });

/* ── 钻取抽屉 ── */
const drawer=document.getElementById("drawer"), mask=document.getElementById("drawerMask");
function openDrawer(){ drawer.classList.add("open"); mask.classList.add("open"); }
function closeDrawer(){ drawer.classList.remove("open"); mask.classList.remove("open"); document.body.classList.remove("drawer-open"); }
document.getElementById("drClose").onclick=closeDrawer;
mask.onclick=closeDrawer;
document.addEventListener("keydown",function(ev){ if(ev.key==="Escape"){ closeDrawer(); document.getElementById("modalMask").classList.remove("open"); document.body.classList.remove("panel-open"); } });

function tableFor(spec){
  if(!spec||!spec.series) return null;
  const cols=spec.series.map(function(s){ return s.name; });
  const rows=[];
  if(spec.xCats){
    spec.xCats.forEach(function(c,i){
      const r=[c]; spec.series.forEach(function(s){ r.push(s.vals[i]); });
      if(spec.line) r.push(spec.line.vals[i]);
      rows.push(r);
    });
    if(spec.line) cols.push(spec.line.name);
  } else {
    const map={};
    spec.series.forEach(function(s,si){
      (s.pts||[]).forEach(function(p){ const k=String(p[0]); (map[k]=map[k]||new Array(spec.series.length+(spec.lineRight?1:0)).fill(null))[si]=p[1]; });
    });
    Object.keys(map).sort(function(a,b){ return a-b; }).forEach(function(k){
      rows.push([k].concat(map[k]));
    });
  }
  return {cols:cols,rows:rows,head:["年份"].concat(cols)};
}
function csvFor(spec){
  const t=tableFor(spec); if(!t) return "";
  const esc2=function(v){ v=String(v==null?"":v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; };
  return [t.head.join(",")].concat(t.rows.map(function(r){ return r.map(esc2).join(","); })).join("\n");
}
function download(name,text){
  const blob=new Blob(["\ufeff"+text],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=name;
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },400);
}
function fillDrawer(id,figNo,figTitle){
  const spec=window.CCDEFS[id];
  const body=document.getElementById("drBody");
  document.getElementById("drKicker").textContent=figNo;
  document.getElementById("drTitle").textContent=figTitle;
  let html="";
  if(spec){
    html+='<div class="dr-note">'+(spec.note||"")+'</div>';
    const t=tableFor(spec);
    if(t&&t.rows.length){
      html+='<div class="dr-sec">底层数据（前 20 行）</div><table class="dr-table"><tr><th>'+t.head.map(function(h){return esc(h);}).join("</th><th>")+"</th></tr>";
      t.rows.slice(0,20).forEach(function(r){ html+="<tr>"+r.map(function(v){return "<td>"+(v==null?"—":v)+"</td>";}).join("")+"</tr>"; });
      html+='</table>';
      html+='<button class="dr-dl" id="drCsv">↓ 下载本图数据 CSV</button>';
    }
    html+='<div class="dr-sec">来源与口径</div>';
    (spec.sources||[]).forEach(function(s,i){
      html+='<div class="dr-src"><span class="n">'+String(i+1).padStart(2,"0")+'</span><div><div>'+esc(s.t)+'</div><div class="p">'+esc(s.p)+(s.y?" · "+s.y:"")+(s.u?' · <a href="'+s.u+'" target="_blank" rel="noopener">'+s.u+"</a>":"")+"</div></div></div>";
    });
  } else {
    html='<div class="dr-sec">全部来源清单</div>';
    window.CC.GLOBAL_SOURCES.forEach(function(s,i){
      html+='<div class="dr-src"><span class="n">'+String(i+1).padStart(2,"0")+'</span><div><div>'+esc(s.t)+'</div><div class="p">'+esc(s.p)+(s.y?" · "+s.y:"")+(s.u?' · <a href="'+s.u+'" target="_blank" rel="noopener">'+s.u+"</a>":"")+"</div></div></div>";
    });
  }
  body.innerHTML=html;
  const btn=document.getElementById("drCsv");
  if(btn) btn.onclick=function(){ download(id+"-data.csv",csvFor(spec)); };
  openDrawer();
}
document.querySelectorAll(".src-btn").forEach(function(btn){
  btn.addEventListener("click",function(){
    const id=btn.dataset.drill;
    const fig=document.getElementById("f"+id.slice(1));
    const no=fig?fig.querySelector(".fig-no").textContent:"图";
    const title=fig?fig.querySelector(".fig-title").textContent:"";
    fillDrawer(id,no,title);
  });
});
document.getElementById("allSourcesBtn").addEventListener("click",function(){
  document.getElementById("drKicker").textContent="附录";
  document.getElementById("drTitle").textContent="全部来源清单（约 90 条去重后 14 组）";
  const body=document.getElementById("drBody");
  let html="";
  window.CC.GLOBAL_SOURCES.forEach(function(s,i){
    html+='<div class="dr-src"><span class="n">'+String(i+1).padStart(2,"0")+'</span><div><div>'+esc(s.t)+'</div><div class="p">'+esc(s.p)+(s.y?" · "+s.y:"")+(s.u?' · <a href="'+s.u+'" target="_blank" rel="noopener">'+s.u+"</a>":"")+"</div></div></div>";
  });
  body.innerHTML=html;
  openDrawer();
});
document.getElementById("downloadAllBtn").addEventListener("click",function(){
  let all="";
  Object.keys(window.CCDEFS).forEach(function(id){
    const spec=window.CCDEFS[id];
    const c=csvFor(spec);
    if(c) all+=(all?"\n":"")+"# "+id+"\n"+c+"\n";
  });
  download("chip-cycle-42-all-data.csv",all);
});

/* 公司模态关闭 */
document.getElementById("modalMask").addEventListener("click",function(ev){
  if(ev.target===this) this.classList.remove("open");
});

/* 平滑锚点（固定导航偏移） */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener("click",function(ev){
    const t=document.getElementById(a.getAttribute("href").slice(1));
    if(t){ ev.preventDefault(); window.scrollTo({top:t.offsetTop-64,behavior:"smooth"}); }
  });
});
onScroll();
})();
