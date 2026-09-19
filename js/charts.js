/* ═══════════════════════════════════════════════════════════
   charts.js v2 — 手写 SVG 图表引擎（移动优先）
   所有渲染器按容器实际宽度取环境：W=容器宽，mobile=W<560
   手机专属变体：竖排墙图 / DOM 矩阵 / DOM 情景树 / DOM 时间线
   ═══════════════════════════════════════════════════════════ */
(function(){
"use strict";
const NS="http://www.w3.org/2000/svg";

if(!document.getElementById("cc-chart-style")){
  const st=document.createElement("style"); st.id="cc-chart-style";
  st.textContent=".drawline{stroke-dasharray:1;stroke-dashoffset:1;animation:ccdraw 1.4s ease forwards}.drawline.slow{animation-duration:2.2s}@keyframes ccdraw{to{stroke-dashoffset:0}}";
  document.head.appendChild(st);
}

/* ── 基础工具 ── */
function mk(tag,attrs,parent){
  const e=document.createElementNS(NS,tag);
  if(attrs) for(const k in attrs){ if(k==="text"){e.textContent=attrs[k];} else e.setAttribute(k,attrs[k]); }
  if(parent) parent.appendChild(e);
  return e;
}
function dv(cls,parent,html){ const d=document.createElement("div"); if(cls)d.className=cls; if(html!=null)d.innerHTML=html; if(parent)parent.appendChild(d); return d; }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fmtN(v){
  if(v==null) return "—";
  const a=Math.abs(v);
  if(a>=1000) return v.toLocaleString("en-US",{maximumFractionDigits:0});
  if(a>=100) return String(Math.round(v*10)/10);
  return String(Math.round(v*100)/100);
}
function fmtSci(v){
  if(v==0) return "0";
  const e=Math.floor(Math.log10(Math.abs(v)));
  return (v/Math.pow(10,e)).toFixed(1)+"×10<sup>"+e+"</sup>";
}
function niceTicks(min,max,n){
  if(min===max){max=min+1;}
  const span=max-min, step0=span/Math.max(2,n), mag=Math.pow(10,Math.floor(Math.log10(step0)));
  let step=mag; for(const m of [1,2,2.5,5,10]){ if(step0<=m*mag){step=m*mag;break;} }
  const out=[]; let t=Math.ceil(min/step)*step;
  for(;t<=max+step*1e-6;t+=step){ out.push(Math.round(t*1e6)/1e6); }
  return out;
}
function logTicks(min,max){
  const out=[]; const lo=Math.floor(Math.log10(min)), hi=Math.ceil(Math.log10(max));
  for(let k=lo;k<=hi;k++) for(const m of [1,2,5]){ const v=m*Math.pow(10,k); if(v>=min*0.999&&v<=max*1.001) out.push(v); }
  return out;
}
/* 环境探测：图表按容器实际像素宽 1:1 渲染 */
function envFor(el){
  const w=Math.max(300,Math.round(el.clientWidth||(el.parentNode&&el.parentNode.clientWidth)||920));
  return { W:w, mobile:w<560 };
}
function wrapCN(s,n){
  const out=[]; let cur="";
  for(const ch of String(s)){
    cur+=ch;
    if(cur.length>=n){
      let cut=cur.length;
      if(/[A-Za-z0-9]/.test(ch)){
        let i=cur.length-1;
        while(i>0&&/[A-Za-z0-9%×+~./-]/.test(cur[i-1])) i--;
        if(i>=Math.floor(n*0.4)) cut=i;
      }
      out.push(cur.slice(0,cut)); cur=cur.slice(cut);
    }
  }
  if(cur) out.push(cur);
  return out.length?out:[""];
}

/* ── 工具提示 ── */
const TT={ el:null,
  init(){ if(this.el) return; this.el=document.getElementById("tooltip");
    document.addEventListener("touchstart",function(e){ if(!e.target.closest("svg")) TT.hide(); },{passive:true}); },
  show(html,x,y){
    this.init();
    this.el.innerHTML=html; this.el.style.opacity=1;
    const w=this.el.offsetWidth||240, h=this.el.offsetHeight||80;
    let L=x+14, T=y-h-12;
    if(L+w>window.innerWidth-8) L=Math.max(6,x-w-14);
    if(T<8) T=y+18;
    this.el.style.left=L+"px"; this.el.style.top=T+"px";
  },
  hide(){ if(this.el) this.el.style.opacity=0; }
};

/* ── 通用骨架 ── */
function frame(el,W,H){
  el.innerHTML="";
  const svg=mk("svg",{viewBox:"0 0 "+W+" "+H,preserveAspectRatio:"xMidYMid meet"},el);
  return svg;
}
function annoText(svg,x,y,text,color,size,weight,anchor){
  const lines=String(text).split("\n");
  const t=mk("text",{x:x,y:y,"font-size":size||11,fill:color||"#57503D","text-anchor":anchor||"start",class:"anno"},svg);
  if(weight) t.setAttribute("font-weight",weight);
  lines.forEach((ln,i)=>{ mk("tspan",{x:x,dy:i===0?0:(size||11)*1.45},t).textContent=ln; });
  return t;
}
function drawLinePath(svg,pts,stroke,width,dash,cls){
  const d=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
  const path=mk("path",{d:d,fill:"none",stroke:stroke,"stroke-width":width||2,"stroke-linejoin":"round","stroke-linecap":"round"},svg);
  if(dash) path.setAttribute("stroke-dasharray",dash);
  if(cls){ path.setAttribute("pathLength","1"); path.classList.add("drawline"); if(cls==="slow")path.classList.add("slow"); }
  return path;
}

/* ═══════════ 多线图 ═══════════ */
function renderLines(el,spec){
  const env=envFor(el), W=env.W, mob=env.mobile;
  const H=mob?Math.max(300,Math.round(W*0.9)):430;
  const m={l:mob?46:66,r:mob?40:(spec.right?66:24),t:mob?30:30,b:mob?34:42};
  const pw=W-m.l-m.r, ph=H-m.t-m.b;
  const svg=frame(el,W,H);
  const yd=spec.ydomain, xl=spec.xdomain;
  const X=function(v){ return m.l+(v-xl[0])/(xl[1]-xl[0])*pw; };
  const isLog=spec.ylog;
  function Y(v){
    if(isLog){ const lo=Math.log10(yd[0]),hi=Math.log10(yd[1]); return m.t+ph-(Math.log10(Math.max(v,1e-9))-lo)/(hi-lo)*ph; }
    return m.t+ph-(v-yd[0])/(yd[1]-yd[0])*ph;
  }
  const yticks=isLog?logTicks(yd[0],yd[1]):niceTicks(yd[0],yd[1],mob?3:5);
  yticks.forEach(v=>{
    mk("line",{x1:m.l,x2:m.l+pw,y1:Y(v),y2:Y(v),class:"grid-line"},svg);
    mk("text",{x:m.l-6,y:Y(v)+3.5,"text-anchor":"end","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=fmtN(v);
  });
  const xt=niceTicks(xl[0],xl[1],mob?4:7).filter(v=>v>=xl[0]&&v<=xl[1]);
  xt.forEach(v=>{
    mk("line",{x1:X(v),x2:X(v),y1:m.t,y2:m.t+ph,class:"grid-line","stroke-dasharray":"1 4"},svg);
    mk("text",{x:X(v),y:m.t+ph+(mob?18:20),"text-anchor":"middle","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=Math.round(v);
  });
  mk("line",{x1:m.l,x2:m.l+pw,y1:m.t+ph,y2:m.t+ph,class:"axis-line"},svg);
  if(!mob) annoText(svg,m.l,m.t-14,"单位："+(spec.unit||""),"#8C8370",10.5);
  let YR=null;
  if(spec.right){
    const rd=spec.right.ydomain;
    YR=function(v){ return m.t+ph-(v-rd[0])/(rd[1]-rd[0])*ph; };
    niceTicks(rd[0],rd[1],mob?3:4).forEach(v=>{
      mk("text",{x:m.l+pw+6,y:YR(v)+3.5,"font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=(spec.right.fmt?spec.right.fmt(v):fmtN(v));
    });
    mk("line",{x1:m.l+pw,x2:m.l+pw,y1:m.t,y2:m.t+ph,class:"axis-line"},svg);
  }
  spec.series.forEach(s=>{
    if(s._off) return;
    const pts=s.pts.filter(p=>!s.rightAxis||YR).map(p=>[X(p[0]),s.rightAxis?YR(p[1]):Y(p[1])]);
    if(s.area){
      const d="M"+pts[0][0]+" "+(m.t+ph)+pts.map(p=>"L"+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ")+"L"+pts[pts.length-1][0]+" "+(m.t+ph)+"Z";
      mk("path",{d:d,fill:s.color,opacity:0.13,stroke:"none"},svg);
    }
    drawLinePath(svg,pts,s.color,s.dash?1.8:2.4,s.dash?"6 4":null);
    const last=s.pts[s.pts.length-1];
    mk("circle",{cx:X(last[0]),cy:(s.rightAxis?YR(last[1]):Y(last[1])),r:3.2,fill:s.color},svg);
  });
  (spec.annotations||[]).forEach(a=>{
    annoText(svg,X(a.x)+6,Y(a.y)-4,a.text,"#57503D",mob?10:11.5,"700");
  });
  const cross=mk("line",{x1:0,x2:0,y1:m.t,y2:m.t+ph,stroke:"#8C8370","stroke-width":1,"stroke-dasharray":"3 3",opacity:0},svg);
  const allX=new Set(); spec.series.forEach(s=>{ if(!s._off) s.pts.forEach(p=>allX.add(Math.round(p[0]*10))); });
  const xs=[...allX].sort((a,b)=>a-b);
  const hit=mk("rect",{x:m.l,y:m.t,width:pw,height:ph,fill:"transparent"},svg);
  hit.addEventListener("mousemove",ev=>{
    const r=svg.getBoundingClientRect();
    const vx=xl[0]+((ev.clientX-r.left)*(W/r.width)-m.l)/pw*(xl[1]-xl[0]);
    let best=xs[0],bd=1e9; xs.forEach(v=>{const d=Math.abs(v-vx*10); if(d<bd){bd=d;best=v;}});
    const bx=X(best/10);
    cross.setAttribute("x1",bx); cross.setAttribute("x2",bx); cross.style.opacity=1;
    let html='<div class="tt-t">'+Math.round(best/10)+" 年</div>";
    spec.series.forEach(s=>{ if(s._off)return;
      let bp=null,bdd=1e9; s.pts.forEach(p=>{const d=Math.abs(Math.round(p[0]*10)-best); if(d<bdd){bdd=d;bp=p;}});
      if(bp&&bdd<30) html+='<div><span style="color:'+s.color+'">●</span> '+esc(s.name)+': <b class="tt-mono">'+fmtN(bp[1])+"</b></div>";
    });
    TT.show(html,ev.clientX,ev.clientY);
  });
  hit.addEventListener("mouseleave",()=>{ cross.style.opacity=0; TT.hide(); });
  return svg;
}

/* ═══════════ 柱状图 ═══════════ */
function renderBars(el,spec){
  const env=envFor(el), W=env.W, mob=env.mobile;
  const H=mob?Math.max(300,Math.round(W*0.86)):430;
  const cats=spec.xCats,m={l:mob?46:66,r:mob?42:(spec.line?70:30),t:mob?30:34,b:mob?34:44};
  const pw=W-m.l-m.r, ph=H-m.t-m.b;
  const svg=frame(el,W,H);
  const maxV=spec.stacked?
    Math.max.apply(null,cats.map((c,i)=>spec.series.reduce((a,s)=>a+(s._off?0:s.vals[i]),0))):
    Math.max.apply(null,spec.series.filter(s=>!s._off).flatMap(s=>s.vals));
  const mag=Math.pow(10,Math.floor(Math.log10(Math.max(1,maxV*1.12))));
  const yd=[0,Math.ceil(maxV*1.12/mag)*mag||maxV*1.15];
  const Y=function(v){ return m.t+ph-(v-yd[0])/(yd[1]-yd[0])*ph; };
  const cw=pw/cats.length;
  niceTicks(yd[0],yd[1],mob?3:5).forEach(v=>{
    mk("line",{x1:m.l,x2:m.l+pw,y1:Y(v),y2:Y(v),class:"grid-line"},svg);
    mk("text",{x:m.l-6,y:Y(v)+3.5,"text-anchor":"end","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=fmtN(v);
  });
  cats.forEach((c,i)=>{
    mk("text",{x:m.l+cw*(i+0.5),y:m.t+ph+(mob?17:20),"text-anchor":"middle","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=c;
  });
  mk("line",{x1:m.l,x2:m.l+pw,y1:m.t+ph,y2:m.t+ph,class:"axis-line"},svg);
  if(!mob) annoText(svg,m.l,m.t-16,"单位："+(spec.unit||""),"#8C8370",10.5);
  const nvis=spec.series.filter(s=>!s._off).length;
  const bw=spec.grouped? cw/nvis*0.62 : Math.min(mob?46:64,cw*0.5);
  cats.forEach((c,i)=>{
    let acc=0, gi=0;
    spec.series.forEach(s=>{
      if(s._off) return;
      const v=s.vals[i];
      let x0;
      if(spec.grouped){ x0=m.l+cw*i+cw/2-bw*nvis/2+bw*gi; gi++; }
      else x0=m.l+cw*i+cw/2-bw/2;
      const h=(v-yd[0])/(yd[1]-yd[0])*ph;
      const y=m.t+ph-h-(spec.stacked?((acc)/(yd[1]-yd[0]))*ph:0);
      const rect=mk("rect",{x:x0,y:y,width:Math.max(2,bw),height:Math.max(0,h),fill:s.color,opacity:spec.stacked?0.92:0.88,rx:1.5},svg);
      if(/E$/.test(c)) rect.setAttribute("opacity",0.62);
      rect.addEventListener("mousemove",ev=>{
        let html='<div class="tt-t">'+c+"</div>";
        if(spec.stacked){ spec.series.forEach(s2=>{ if(!s2._off) html+='<div><span style="color:'+s2.color+'">●</span> '+esc(s2.name)+": <b class='tt-mono'>"+fmtN(s2.vals[i])+"</b></div>"; });
          html+='<div>合计: <b class="tt-mono">'+fmtN(spec.series.reduce((a,s2)=>a+(s2._off?0:s2.vals[i]),0))+"</b></div>"; }
        else html+='<div><span style="color:'+s.color+'">●</span> '+esc(s.name)+": <b class='tt-mono'>"+fmtN(v)+"</b></div>";
        TT.show(html,ev.clientX,ev.clientY);
      });
      rect.addEventListener("mouseleave",TT.hide);
      if(spec.stacked) acc+=v;
    });
  });
  let YR=null;
  if(spec.line){
    const ld=spec.line.ydomain||[Math.min.apply(null,spec.line.vals.filter(v=>v!=null))*1.2,Math.max.apply(null,spec.line.vals.filter(v=>v!=null))*1.15];
    YR=function(v){ return m.t+ph-(v-ld[0])/(ld[1]-ld[0])*ph; };
    niceTicks(ld[0],ld[1],mob?3:4).forEach(v=>{
      mk("text",{x:m.l+pw+6,y:YR(v)+3.5,"font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=fmtN(v)+"%";
    });
    mk("line",{x1:m.l+pw,x2:m.l+pw,y1:m.t,y2:m.t+ph,class:"axis-line"},svg);
    const pts=spec.line.vals.map((v,i)=>[m.l+cw*(i+0.5),YR(v)]).filter((p,i)=>spec.line.vals[i]!=null);
    drawLinePath(svg,pts,spec.line.color,2.2,null);
    pts.forEach(p=>mk("circle",{cx:p[0],cy:p[1],r:2.8,fill:spec.line.color},svg));
  }
  if(spec.ksY!=null&&YR){
    const ky=YR(spec.ksY);
    mk("line",{x1:m.l,x2:m.l+pw,y1:ky,y2:ky,class:"ks-line"},svg);
    annoText(svg,m.l+pw-2,ky-5,"Kill Switch +14%","#C2451E",mob?9.5:11,"700","end");
    mk("rect",{x:m.l,y:ky,width:pw,height:m.t+ph-ky,fill:"#C2451E",opacity:0.05},svg);
  }
  (spec.annotations||[]).forEach(a=>{
    const ax=m.l+cw*(a.xi+0.5);
    annoText(svg,ax,m.t+(spec.line?(mob?42:34):18),a.text,"#57503D",mob?10:11.5,"700","middle");
  });
  return svg;
}

/* ═══════════ 100% 堆叠柱 ═══════════ */
function renderShareBars(el,spec){
  const env=envFor(el), W=env.W, mob=env.mobile;
  const H=mob?Math.max(300,Math.round(W*0.86)):430;
  const cats=spec.xCats,m={l:mob?40:56,r:mob?16:30,t:mob?26:34,b:mob?34:44};
  const pw=W-m.l-m.r, ph=H-m.t-m.b;
  const svg=frame(el,W,H);
  const Y=function(v){ return m.t+ph-v/100*ph; };
  [0,25,50,75,100].forEach(v=>{
    mk("line",{x1:m.l,x2:m.l+pw,y1:Y(v),y2:Y(v),class:"grid-line"},svg);
    mk("text",{x:m.l-6,y:Y(v)+3.5,"text-anchor":"end","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=v+"%";
  });
  const cw=pw/cats.length, bw=Math.min(mob?58:120,cw*0.42);
  cats.forEach((c,i)=>{
    const bx=m.l+cw*i+cw/2-bw/2;
    let acc=0;
    spec.series.forEach(s=>{
      const v=s.vals[i], h=v/100*ph, y=Y(acc)-h;
      const rect=mk("rect",{x:bx,y:y,width:bw,height:h,fill:s.color,opacity:0.9,rx:1.5},svg);
      if(v>=7&&h>13) mk("text",{x:bx+bw/2,y:y+h/2+3.5,"text-anchor":"middle","font-size":mob?9.5:10.5,fill:"#FFFDF6","font-weight":700},svg).textContent=v+"%";
      rect.addEventListener("mousemove",ev=>TT.show('<div class="tt-t">'+c+"</div><div><span style='color:"+s.color+"'>●</span> "+esc(s.name)+": <b class='tt-mono'>"+v+"%</b></div>",ev.clientX,ev.clientY));
      rect.addEventListener("mouseleave",TT.hide);
      acc+=v;
    });
    mk("text",{x:bx+bw/2,y:m.t+ph+(mob?17:20),"text-anchor":"middle","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=c;
  });
  (spec.annotations||[]).forEach(a=>{
    const bx=m.l+cw*(a.xi+0.5);
    annoText(svg,bx,m.t+ph+(mob?32:38),a.text,"#57503D",mob?10:11.5,"700","middle");
  });
  mk("line",{x1:m.l,x2:m.l+pw,y1:m.t+ph,y2:m.t+ph,class:"axis-line"},svg);
  if(!mob) annoText(svg,m.l,m.t-16,"单位："+spec.unit,"#8C8370",10.5);
  return svg;
}

/* ═══════════ 100% 堆叠面积 ═══════════ */
function renderShareArea(el,spec){
  const env=envFor(el), W=env.W, mob=env.mobile;
  const H=mob?Math.max(300,Math.round(W*0.86)):430;
  const m={l:mob?40:56,r:mob?14:24,t:mob?26:30,b:mob?34:42};
  const pw=W-m.l-m.r, ph=H-m.t-m.b;
  const svg=frame(el,W,H);
  const Y=function(v){ return m.t+ph-v/100*ph; };
  const yrs=spec.xYears, xl=[yrs[0],yrs[yrs.length-1]];
  const X=function(v){ return m.l+(v-xl[0])/(xl[1]-xl[0])*pw; };
  [0,25,50,75,100].forEach(v=>{
    mk("line",{x1:m.l,x2:m.l+pw,y1:Y(v),y2:Y(v),class:"grid-line"},svg);
    mk("text",{x:m.l-6,y:Y(v)+3.5,"text-anchor":"end","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=v+"%";
  });
  const stepM=mob?5:3;
  yrs.filter((_,i)=>i%stepM===0||i===yrs.length-1).forEach(v=>{
    mk("text",{x:X(v),y:m.t+ph+(mob?17:20),"text-anchor":"middle","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=v;
  });
  let base=new Array(yrs.length).fill(0);
  spec.series.forEach(s=>{
    if(s._off) return;
    const top=base.map((b,i)=>b+s.vals[i]);
    const pts=top.map((v,i)=>[X(yrs[i]),Y(v)]);
    const bpts=base.map((b,i)=>[X(yrs[i]),Y(b)]).reverse();
    const d="M"+pts.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" L")+" L"+bpts.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" L")+"Z";
    mk("path",{d:d,fill:s.color,opacity:0.85,stroke:"#FFFDF6","stroke-width":1},svg);
    base=top;
  });
  mk("line",{x1:m.l,x2:m.l+pw,y1:m.t+ph,y2:m.t+ph,class:"axis-line"},svg);
  if(!mob) annoText(svg,m.l,m.t-16,"单位："+spec.unit,"#8C8370",10.5);
  return svg;
}

/* ═══════════ 堆叠面积 + 右轴折线（图23） ═══════════ */
function renderShareArea2(el,spec){
  const env=envFor(el), W=env.W, mob=env.mobile;
  const H=mob?Math.max(310,Math.round(W*0.92)):430;
  const m={l:mob?40:56,r:mob?40:70,t:mob?28:32,b:mob?36:42};
  const pw=W-m.l-m.r, ph=H-m.t-m.b;
  const svg=frame(el,W,H);
  const yrs=spec.xYears, xl=[yrs[0],yrs[yrs.length-1]];
  const X=function(v){ return m.l+(v-xl[0])/(xl[1]-xl[0])*pw; };
  const Y=function(v){ return m.t+ph-v/100*ph; };
  [0,25,50,75,100].forEach(v=>{
    mk("line",{x1:m.l,x2:m.l+pw,y1:Y(v),y2:Y(v),class:"grid-line"},svg);
    mk("text",{x:m.l-6,y:Y(v)+3.5,"text-anchor":"end","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=v+"%";
  });
  let base=new Array(yrs.length).fill(0);
  spec.series.forEach(s=>{
    if(s._off) return;
    const top=base.map((b,i)=>b+s.vals[i]);
    const pts=top.map((v,i)=>[X(yrs[i]),Y(v)]);
    const bpts=base.map((b,i)=>[X(yrs[i]),Y(b)]).reverse();
    const d="M"+pts.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" L")+" L"+bpts.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" L")+"Z";
    mk("path",{d:d,fill:s.color,opacity:0.82,stroke:"#FFFDF6","stroke-width":1},svg);
    base=top;
  });
  const rd=spec.right.ydomain;
  const YR=function(v){ return m.t+ph-(Math.log10(v)-Math.log10(rd[0]))/(Math.log10(rd[1])-Math.log10(rd[0]))*ph; };
  logTicks(rd[0],rd[1]).forEach(v=>{
    mk("text",{x:m.l+pw+6,y:YR(v)+3.5,"font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=(spec.right.fmt?spec.right.fmt(v):fmtN(v));
  });
  mk("line",{x1:m.l+pw,x2:m.l+pw,y1:m.t,y2:m.t+ph,class:"axis-line"},svg);
  const lp=spec.lineRight.pts.map(p=>[X(p[0]),YR(p[1])]);
  drawLinePath(svg,lp,spec.lineRight.color,2.4,null);
  lp.forEach((p,i)=>{
    mk("circle",{cx:p[0],cy:p[1],r:3.2,fill:spec.lineRight.color},svg);
    const c=mk("circle",{cx:p[0],cy:p[1],r:13,fill:"transparent"},svg);
    c.addEventListener("mousemove",ev=>TT.show('<div class="tt-t">'+spec.lineRight.pts[i][0]+"</div><div>"+esc(spec.lineRight.name)+": <b class='tt-mono'>"+spec.lineRight.pts[i][1]+"×</b></div>",ev.clientX,ev.clientY));
    c.addEventListener("mouseleave",TT.hide);
  });
  yrs.forEach(v=>{ if(v%2===0||v===2026) mk("text",{x:X(v),y:m.t+ph+(mob?17:20),"text-anchor":"middle","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=v+(v===2026?"E":""); });
  mk("line",{x1:m.l,x2:m.l+pw,y1:m.t+ph,y2:m.t+ph,class:"axis-line"},svg);
  if(!mob) annoText(svg,m.l,m.t-16,"单位："+spec.unit,"#8C8370",10.5);
  return svg;
}

/* ═══════════ 散点 ═══════════ */
function renderScatter(el,spec){
  const env=envFor(el), W=env.W, mob=env.mobile;
  const H=mob?Math.max(320,Math.round(W*1.02)):460;
  const m={l:mob?42:70,r:mob?14:30,t:mob?26:34,b:mob?30:44};
  const pw=W-m.l-m.r, ph=H-m.t-m.b;
  const svg=frame(el,W,H);
  const xl=spec.xdomain, yd=spec.ydomain;
  const X=function(v){ return m.l+(v-xl[0])/(xl[1]-xl[0])*pw; };
  const Y=function(v){ return m.t+ph-(Math.log10(v)-Math.log10(yd[0]))/(Math.log10(yd[1])-Math.log10(yd[0]))*ph; };
  logTicks(yd[0],yd[1]).forEach(v=>{
    mk("line",{x1:m.l,x2:m.l+pw,y1:Y(v),y2:Y(v),class:"grid-line"},svg);
    mk("text",{x:m.l-6,y:Y(v)+3.5,"text-anchor":"end","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=fmtN(v);
  });
  niceTicks(xl[0],xl[1],mob?4:7).forEach(v=>{
    mk("text",{x:X(v),y:m.t+ph+(mob?17:20),"text-anchor":"middle","font-size":mob?9.5:10.5,class:"tick-lab"},svg).textContent=Math.round(v);
  });
  mk("line",{x1:m.l,x2:m.l+pw,y1:m.t+ph,y2:m.t+ph,class:"axis-line"},svg);
  if(!mob) annoText(svg,m.l,m.t-16,"单位："+spec.unit,"#8C8370",10.5);
  if(spec.highlight){
    mk("rect",{x:X(spec.highlight[0]),y:m.t,width:X(spec.highlight[1])-X(spec.highlight[0]),height:ph,fill:"#A8770F",opacity:0.08},svg);
    annoText(svg,X(spec.highlight[0]+(spec.highlight[1]-spec.highlight[0])/2),m.t+(mob?26:16),mob?"并购潮":"并购超级周期","#A8770F",mob?10:11,"700","middle");
  }
  if(spec.divline){
    mk("line",{x1:X(spec.divline.x),x2:X(spec.divline.x),y1:m.t,y2:m.t+ph,class:"anno-line"},svg);
    annoText(svg,X(spec.divline.x)+5,m.t+(mob?42:30),spec.divline.label,"#8C8370",mob?9.5:11);
  }
  const maxL=Math.max.apply(null,spec.points.map(p=>p.y));
  spec.points.forEach(p=>{
    const r=spec.bubble? (mob?5+Math.sqrt(p.y/maxL)*13:6+Math.sqrt(p.y/maxL)*20) : (mob?4.5:5.5);
    const cx=X(p.x), cy=Y(p.y);
    if(p.status==="divest"){
      mk("path",{d:"M"+(cx-r)+" "+(cy-r/2)+"L"+(cx+r)+" "+(cy-r/2)+"L"+cx+" "+(cy+r*0.9)+"Z",fill:"#C2451E",opacity:0.85},svg);
    } else if(p.status==="dead"){
      mk("circle",{cx:cx,cy:cy,r:r,fill:"none",stroke:"#8C8370","stroke-width":2},svg);
      mk("line",{x1:cx-r*0.6,y1:cy-r*0.6,x2:cx+r*0.6,y2:cy+r*0.6,stroke:"#8C8370","stroke-width":1.6},svg);
      mk("line",{x1:cx-r*0.6,y1:cy+r*0.6,x2:cx+r*0.6,y2:cy-r*0.6,stroke:"#C4B795","stroke-width":1.6},svg);
    } else {
      mk("circle",{cx:cx,cy:cy,r:r,fill:spec.bubble?"#5750C8":"#C2451E",opacity:spec.bubble?0.75:0.9},svg);
      if(spec.bubble) mk("circle",{cx:cx,cy:cy,r:r,fill:"none",stroke:"#5750C8"},svg);
    }
    if(!mob||(spec.bubble&&r>10)){
      annoText(svg,cx+8,cy-7,p.label,"#57503D",mob?9.5:11);
    }
    const hit=mk("circle",{cx:cx,cy:cy,r:Math.max(r,12),fill:"transparent"},svg);
    hit.addEventListener("mousemove",ev=>{
      const st=p.status==="dead"?"（流产）":p.status==="divest"?"（剥离）":"";
      TT.show('<div class="tt-t">'+esc(p.label)+st+"</div><div class='tt-mono'>x="+Math.round(p.x)+" · y="+fmtSci(p.y)+"</div>",ev.clientX,ev.clientY);
    });
    hit.addEventListener("mouseleave",TT.hide);
  });
  (spec.trend||[]).forEach(t=>{
    const pts=t.pts.map(p=>[X(p[0]),Y(p[1])]);
    drawLinePath(svg,pts,"#8C8370",1.6,"5 5");
    annoText(svg,pts[0][0]+4,pts[0][1]-10,t.label,"#57503D",mob?9.5:11.5,"700");
  });
  return svg;
}

/* ═══════════ 泳道时间线：桌面 SVG / 手机 DOM ═══════════ */
function renderTimeline(el,spec){
  const env=envFor(el);
  if(env.mobile){
    el.innerHTML="";
    const box=dv("tl-m",el);
    spec.lanes.forEach(lane=>{
      const laneEl=dv("tl-lane",box); laneEl.style.setProperty("--lc",lane.color);
      dv("tl-name",laneEl).textContent=lane.name;
      lane.events.forEach(ev=>{
        const row=dv("tl-ev",laneEl);
        dv("i",row).textContent=Math.floor(ev[0]);
        dv("span",row).textContent=ev[1];
      });
    });
    return null;
  }
  const W=920,lh=76,H=spec.lanes.length*lh+64,m={l:110,r:24,t:30,b:30};
  const pw=W-m.l-m.r;
  const svg=frame(el,W,H);
  const xl=spec.xdomain;
  const X=function(v){ return m.l+(v-xl[0])/(xl[1]-xl[0])*pw; };
  niceTicks(xl[0],xl[1],8).forEach(v=>{
    mk("line",{x1:X(v),x2:X(v),y1:m.t-6,y2:H-34,class:"grid-line","stroke-dasharray":"1 4"},svg);
    mk("text",{x:X(v),y:H-14,"text-anchor":"middle",class:"tick-lab"},svg).textContent=Math.round(v);
  });
  spec.lanes.forEach((lane,i)=>{
    const y=m.t+lh*i+lh/2;
    mk("text",{x:m.l-12,y:y+4,"text-anchor":"end","font-size":12.5,fill:lane.color,"font-weight":700,class:"charttext"},svg).textContent=lane.name;
    mk("line",{x1:m.l,x2:m.l+pw,y1:y,y2:y,stroke:lane.color,"stroke-width":2,opacity:0.45},svg);
    lane.events.forEach((ev,j)=>{
      const cx=X(ev[0]);
      mk("circle",{cx:cx,cy:y,r:5,fill:lane.color},svg);
      const up=j%2===0;
      const lab=mk("text",{x:cx,y:up?y-14:y+20,"text-anchor":"middle","font-size":10.8,fill:"#57503D",class:"charttext"},svg);
      const words=ev[1].split("（");
      mk("tspan",{x:cx},lab).textContent=words[0];
      if(words[1]) mk("tspan",{x:cx,dy:13},lab).textContent="（"+words[1];
      const hit=mk("circle",{cx:cx,cy:y,r:13,fill:"transparent"},svg);
      hit.addEventListener("mousemove",ev2=>TT.show('<div class="tt-t">'+lane.name+"</div><div>"+Math.floor(ev[0])+" · "+esc(ev[1])+"</div>",ev2.clientX,ev2.clientY));
      hit.addEventListener("mouseleave",TT.hide);
    });
  });
  return svg;
}

/* ═══════════ 墙图：桌面横排 / 手机竖排 ═══════════ */
function renderWall(el){
  const env=envFor(el);
  if(env.mobile) return renderWallPan(el);
  return buildWallSvg(el);
}
const WALL_ERA_SHORT={w1:"FPGA",w2:"光通信",w3:"安静十年",w4:"TPU",w5:"短缺并购",w6:"AI 周期"};
const WALL_ERA_START={w1:1985,w2:1998,w3:2004,w4:2013,w5:2020,w6:2024};
function renderWallPan(el){
  el.innerHTML="";
  const wrap=dv("wall-pan",el);
  const holder=dv("wall-holder",wrap);
  const svg=buildWallSvg(holder);
  svg.style.width="1060px"; svg.style.minWidth="1060px";
  const nav=dv("wall-nav",el);
  const pw=1060-56-26;
  const chips=[];
  Object.keys(WALL_ERA_START).forEach(function(k){
    const era=CC.ERAS[k];
    const chip=dv("wall-chip",nav);
    chip.innerHTML='<i style="background:'+era.color+'"></i>'+WALL_ERA_SHORT[k];
    chip.addEventListener("click",function(){
      const x=Math.max(0,56+((WALL_ERA_START[k]-1985)/(2026.6-1985))*pw-44);
      wrap.scrollTo({left:x,behavior:"smooth"});
    });
    chips.push([k,chip]);
  });
  let ticking=false;
  wrap.addEventListener("scroll",function(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      const year=1985+((wrap.scrollLeft+wrap.clientWidth*0.4-56)/pw)*(2026.6-1985);
      let act="w1";
      Object.keys(WALL_ERA_START).forEach(function(k){ if(year>=WALL_ERA_START[k]) act=k; });
      chips.forEach(function(pr){ pr[1].classList.toggle("on",pr[0]===act); });
    });
  },{passive:true});
  return svg;
}
function buildWallSvg(el){
  const W=1060,H=660,m={l:56,r:26};
  const pw=W-m.l-m.r;
  const bandY=36, row1Y=82, row0Y=104, railY=120, curTop=140, curH=252;
  const curBot=curTop+curH, stripY=curBot+46, rowH=28;
  const svg=frame(el,W,H);
  const xl=[1985,2026.6];
  const X=function(v){ return m.l+(v-xl[0])/(xl[1]-xl[0])*pw; };
  const eraRanges=[["w1",1985,1998],["w2",1998,2004],["w3",2004,2013],["w4",2013,2020],["w5",2020,2024],["w6",2024,2026.6]];
  const yd=[0.3,4000];
  const Y=function(v){ return curTop+curH-(Math.log10(v)-Math.log10(yd[0]))/(Math.log10(yd[1])-Math.log10(yd[0]))*curH; };
  const eraShort={w1:"FPGA 创立",w2:"光通信繁荣与崩塌",w3:"安静的十年",w4:"TPU 点火",w5:"短缺与并购",w6:"当前 AI 周期"};
  const secId={w1:"s1",w2:"s2",w3:"s3",w4:"s4",w5:"s5",w6:"s6"};
  eraRanges.forEach(r=>{
    const era=CC.ERAS[r[0]];
    const rx=X(r[1]), rw=X(r[2])-X(r[1]);
    const band=mk("rect",{x:rx,y:bandY,width:rw,height:curBot-bandY+16,fill:era.color,opacity:0.07},svg);
    mk("rect",{x:rx,y:bandY,width:rw,height:24,fill:era.color,opacity:0.85},svg);
    mk("text",{x:rx+rw/2,y:bandY+17,"text-anchor":"middle","font-size":rw<86?9.5:11.5,fill:"#FFFDF6","font-weight":700,class:"charttext"},svg).textContent=eraShort[r[0]];
    band.style.cursor="pointer";
    band.addEventListener("click",()=>{ const sec=document.getElementById(secId[r[0]]); sec&&sec.scrollIntoView({behavior:"smooth"}); });
    band.addEventListener("mousemove",ev=>TT.show('<div class="tt-t">'+era.name+" · "+era.years+"</div><div>点击跳转章节</div>",ev.clientX,ev.clientY));
    band.addEventListener("mouseleave",TT.hide);
  });
  mk("line",{x1:m.l,x2:m.l+pw,y1:railY,y2:railY,stroke:"#D2C8AF","stroke-width":1},svg);
  const major={1985.2:1,1996.0:1,1999.5:1,2000.2:1,2002.5:1,2007.2:1,2012.5:1,2015.3:1,2018.9:1,2020.3:1,2022.9:1};
  const lastLbl=[-1e9,-1e9];
  CC.EVENTS.forEach((ev,i)=>{
    const cx=X(ev[0]), color=CC.ERAS[ev[2]].color;
    mk("line",{x1:cx,x2:cx,y1:railY,y2:railY+7,stroke:color,"stroke-width":1},svg);
    mk("circle",{cx:cx,cy:railY-6,r:3.2,fill:i%2? "#FFFDF6":color,stroke:color,"stroke-width":1.4},svg);
    if(major[ev[0]]!=null){
      const row=cx-lastLbl[0]>150?0:(cx-lastLbl[1]>150?1:-1);
      if(row>=0){
        lastLbl[row]=cx;
        const ly=row===0?row0Y:row1Y;
        mk("line",{x1:cx,x2:cx,y1:ly+4,y2:railY-11,stroke:color,"stroke-width":0.8,opacity:0.55},svg);
        annoText(svg,cx,ly,ev[1],color,10.5,"700","middle");
      }
    }
    const hit=mk("circle",{cx:cx,cy:railY-6,r:9,fill:"transparent"},svg);
    hit.addEventListener("mousemove",ev2=>TT.show('<div class="tt-t">'+Math.floor(ev[0])+" 年</div><div>"+esc(ev[1])+"</div>",ev2.clientX,ev2.clientY));
    hit.addEventListener("mouseleave",TT.hide);
  });
  const ends=[];
  CCDEFS.c03.series.forEach(function(s){
    const pts=s.pts.filter(p=>p[0]<=2026.6).map(p=>[X(p[0]),Y(p[1])]);
    drawLinePath(svg,pts,s.color,2.2,null,"slow");
    ends.push({s:s,p:pts[pts.length-1]});
  });
  ends.sort((a,b)=>a.p[1]-b.p[1]);
  let prevLy=-1e9;
  ends.forEach(e=>{
    let ly=Math.max(e.p[1]-8,curTop+16);
    if(ly-prevLy<20) ly=prevLy+20;
    prevLy=ly;
    mk("text",{x:e.p[0]-4,y:ly,"text-anchor":"end","font-size":11,fill:e.s.color,"font-weight":700,class:"charttext"},svg).textContent=e.s.name.split("（")[0];
  });
  [1,10,100,1000].forEach(v=>{
    mk("line",{x1:m.l,x2:m.l+pw,y1:Y(v),y2:Y(v),class:"grid-line"},svg);
    mk("text",{x:m.l-8,y:Y(v)+4,"text-anchor":"end",class:"tick-lab"},svg).textContent=fmtN(v);
  });
  [1985,1990,1995,2000,2005,2010,2015,2020,2026].forEach(v=>{
    mk("line",{x1:X(v),x2:X(v),y1:curBot,y2:curBot+6,class:"axis-line"},svg);
    mk("text",{x:X(v),y:curBot+20,"text-anchor":"middle",class:"tick-lab"},svg).textContent=v;
  });
  mk("line",{x1:m.l,x2:m.l+pw,y1:curBot,y2:curBot,class:"axis-line"},svg);
  const stageRanges={
    w1:[[1985,1990],[1990,1995],[1993,1997],[1996,1997]],
    w2:[[1996,1998],[1998,2000],[2000,2001],[2001,2003]],
    w3:null,
    w4:[[2012,2015],[2015,2018],[2017,2019],[2018,2019]],
    w5:[[2020,2021],[2020.5,2022],[2021,2023],[2022,2023]],
    w6:[[2022.9,2024],[2024,2026],[2025,2027],[2026.6,2027]]
  };
  eraRanges.forEach((r,ri)=>{
    const era=CC.ERAS[r[0]];
    const y=stripY+ri*rowH;
    mk("text",{x:m.l-8,y:y+rowH-9,"text-anchor":"end","font-size":10.5,fill:era.color,"font-weight":700,class:"charttext"},svg).textContent=r[0].toUpperCase();
    mk("text",{x:m.l+2,y:y+rowH-9,"font-size":10,fill:"#3A342A","font-weight":700,class:"charttext",stroke:"#F6F2E9","stroke-width":3.5,"paint-order":"stroke"},svg).textContent=era.name;
    const ranges=stageRanges[r[0]];
    if(!ranges){ CC.MECH_STAGES.forEach((st,si)=>{ mk("text",{x:X(2004.5+si*2.1),y:y+rowH-9,"font-size":9.5,fill:"#C4B795",class:"charttext"},svg).textContent="—"; }); return; }
    ranges.forEach((rg,si)=>{
      const st=CC.MECH_STAGES[si];
      const x0=Math.max(X(Math.max(rg[0],r[1])),m.l), x1=Math.min(X(Math.min(rg[1],r[2])),m.l+pw);
      if(x1<=x0) return;
      const cell=mk("rect",{x:x0,y:y+4,width:x1-x0,height:rowH-10,fill:st.color,opacity:0.82,rx:2},svg);
      cell.addEventListener("mousemove",ev2=>TT.show('<div class="tt-t">'+era.name+" · "+st.name+"</div><div>"+esc(era.mech[si][2])+"</div>",ev2.clientX,ev2.clientY));
      cell.addEventListener("mouseleave",TT.hide);
    });
  });
  CC.MECH_STAGES.forEach((st,si)=>{
    mk("text",{x:m.l+2+si*(pw/4),y:H-8,"font-size":10,fill:st.color,"font-weight":700,class:"charttext"},svg).textContent=(si+1)+" "+st.name;
  });
  return svg;
}

/* ═══════════ 生命线：手机定宽 680 横滑 ═══════════ */
function renderLifelines(el){
  const env=envFor(el);
  const W=env.mobile?680:940, rowH=40, m={l:env.mobile?116:150,r:110,t:26,b:34};
  const H=CC.COMPANIES.length*rowH+m.t+m.b;
  const svg=frame(el,W,H);
  if(env.mobile){ svg.style.minWidth=W+"px"; svg.style.width=W+"px"; }
  const xl=[1983,2026.6];
  const X=function(v){ return m.l+(v-xl[0])/(xl[1]-xl[0])*(W-m.l-m.r); };
  [1985,1995,2005,2015,2026].forEach(v=>{
    mk("line",{x1:X(v),x2:X(v),y1:m.t-4,y2:H-m.b+6,class:"grid-line","stroke-dasharray":"1 4"},svg);
    mk("text",{x:X(v),y:H-10,"text-anchor":"middle","font-size":env.mobile?9:10.5,class:"tick-lab"},svg).textContent=v;
  });
  CC.COMPANIES.forEach((c,i)=>{
    const y=m.t+i*rowH+rowH/2;
    const col=c.era&&CC.ERAS[c.era]?CC.ERAS[c.era].color:c.color;
    mk("text",{x:m.l-10,y:y-3,"text-anchor":"end","font-size":env.mobile?11:12.5,fill:"#1A1610","font-weight":700,class:"charttext"},svg).textContent=c.name;
    mk("text",{x:m.l-10,y:y+11,"text-anchor":"end","font-size":env.mobile?9:10,fill:"#8C8370",class:"charttext"},svg).textContent=c.cn+" · "+c.born+(c.died?"–"+c.died:"–");
    const x0=X(Math.max(c.born,xl[0])), x1=X(Math.min(c.died||2026.4,xl[1]));
    if(c.born<1983) mk("path",{d:"M"+(x0-2)+" "+y+"l6 -4v8Z",fill:col},svg);
    const band=mk("rect",{x:x0,y:y-7,width:x1-x0,height:14,fill:col,opacity:0.85,rx:7},svg);
    if(c.died) band.setAttribute("opacity",0.5);
    c.events.forEach(ev=>{
      const cx=X(Math.max(ev[0],xl[0]));
      mk("circle",{cx:cx,cy:y,r:3.2,fill:"#FFFDF6",stroke:col,"stroke-width":1.6},svg);
    });
    band.style.cursor="pointer";
    band.addEventListener("mousemove",ev=>{
      TT.show('<div class="tt-t">'+c.name+" "+c.cn+"</div><div>"+esc(c.events.map(e=>e[0]+" "+e[1]).join(" · "))+"</div><div class='tt-mono'>"+esc(c.fate)+"</div>",ev.clientX,ev.clientY);
    });
    band.addEventListener("mouseleave",TT.hide);
    band.addEventListener("click",()=>openCompanyModal(c));
    mk("text",{x:x1+7,y:y+4,"font-size":env.mobile?9:9.5,fill:c.died?"#C2451E":"#0E7C66",class:"charttext","font-weight":700},svg).textContent=c.died?(c.died<=2009?"破产/并入":"并入"): "在场";
  });
  return svg;
}
function openCompanyModal(c){
  const col=c.era&&CC.ERAS[c.era]?CC.ERAS[c.era].color:c.color;
  const md=document.getElementById("modal");
  md.style.setProperty("--mc",col);
  md.innerHTML='<h3>'+esc(c.name)+" <span style='font-size:14px;color:#57503D'>"+esc(c.cn)+"</span></h3>"
    +'<p class="m-en">'+c.born+" – "+(c.died||"至今")+"</p>"
    +'<p class="m-line">'+esc(c.line)+"</p>"
    +c.events.map(e=>'<div class="m-ev"><span class="y">'+e[0]+"</span><span>"+esc(e[1])+"</span></div>").join("")
    +'<p class="m-fate"><b>峰值 / 顶点：</b>'+esc(c.peak)+"<br><b>命运：</b>"+esc(c.fate)+"</p>";
  document.getElementById("modalMask").classList.add("open");
}

/* ═══════════ 机制矩阵：桌面 SVG / 手机 DOM ═══════════ */
function renderMatrix(el,spec){
  const env=envFor(el);
  if(env.mobile){
    el.innerHTML="";
    const box=dv("mx-m",el);
    spec.matrix.forEach(row=>{
      const rEl=dv("mx-row",box); rEl.style.setProperty("--mc",row.color);
      const head=dv("mx-era",rEl);
      const parts=row.era.split(" · ");
      dv("b",head).textContent=parts[0];
      dv("span",head).textContent=parts[1]||"";
      const cells=dv("mx-cells",rEl);
      row.cells.forEach((cell,ci)=>{
        const cEl=dv("mx-cell"+(cell[1]===0?" dim":""),cells);
        cEl.style.setProperty("--sc",CC.MECH_STAGES[ci].color);
        dv("i",cEl).textContent=CC.MECH_STAGES[ci].name;
        dv("em",cEl).textContent=cell[0].split("\n")[0];
        dv("p",cEl).textContent=cell[0].split("\n")[1]||"";
        cEl.addEventListener("click",()=>{ const sec=document.getElementById(row.id); sec&&sec.scrollIntoView({behavior:"smooth"}); });
      });
    });
    return null;
  }
  const W=960, colW=186, rowH=64, labW=176;
  const H=64+spec.matrix.length*rowH+20;
  const svg=frame(el,W,H);
  CC.MECH_STAGES.forEach((st,ci)=>{
    mk("rect",{x:labW+ci*colW+3,y:8,width:colW-6,height:34,fill:st.color,rx:2},svg);
    mk("text",{x:labW+ci*colW+colW/2,y:30,"text-anchor":"middle","font-size":12.5,fill:"#FFFDF6","font-weight":700,class:"charttext"},svg).textContent=st.name;
  });
  spec.matrix.forEach((row,ri)=>{
    const y=64+ri*rowH;
    mk("rect",{x:0,y:y,width:labW-8,height:rowH-6,fill:row.color,opacity:0.10,rx:2},svg);
    mk("rect",{x:0,y:y,width:4,height:rowH-6,fill:row.color},svg);
    const et=row.era.split(" · ");
    mk("text",{x:10,y:y+22,"font-size":11.5,fill:row.color,"font-weight":700,class:"charttext"},svg).textContent=et[0];
    mk("text",{x:10,y:y+40,"font-size":10,fill:"#8C8370",class:"charttext"},svg).textContent=et[1]||"";
    row.cells.forEach((cell,ci)=>{
      const inten=cell[1];
      const cx=labW+ci*colW+3, cy=y+2;
      if(inten===0){
        mk("rect",{x:cx,y:cy,width:colW-6,height:rowH-10,fill:"none",stroke:"#D2C8AF","stroke-dasharray":"3 3",rx:2},svg);
      } else {
        mk("rect",{x:cx,y:cy,width:colW-6,height:rowH-10,fill:CC.MECH_STAGES[ci].color,opacity:0.12+inten*0.2,rx:2},svg);
      }
      const lines=cell[0].split("\n");
      const t=mk("text",{x:cx+8,y:cy+16,"font-size":10.2,fill:inten===0?"#C4B795":"#3A342A",class:"charttext"},svg);
      lines.forEach((ln,i)=>{ const ts=mk("tspan",{x:cx+8,dy:i===0?0:12.5},t); ts.textContent=ln; ts.setAttribute("font-weight",i===0&&inten>0?"700":"400"); });
      const hit=mk("rect",{x:cx,y:cy,width:colW-6,height:rowH-10,fill:"transparent",style:"cursor:pointer"},svg);
      hit.addEventListener("click",()=>{ const sec=document.getElementById(row.id); sec&&sec.scrollIntoView({behavior:"smooth"}); });
      hit.addEventListener("mousemove",ev=>TT.show('<div class="tt-t">'+row.era+"</div><div>烈度 "+inten+"/3 · 点击进入章节</div>",ev.clientX,ev.clientY));
      hit.addEventListener("mouseleave",TT.hide);
    });
  });
  return svg;
}

/* ═══════════ 情景树：桌面 SVG / 手机 DOM 卡片 ═══════════ */
function renderTree(el,spec){
  const env=envFor(el);
  if(env.mobile){
    el.innerHTML="";
    const box=dv("tree-m",el);
    const root=dv("tree-root",box);
    dv("b",root).textContent=spec.root.line1;
    dv("span",root).textContent=spec.root.line2;
    CC.SCENARIOS.forEach((sc,i)=>{
      const card=dv("tc"+(i===0?" open":""),box); card.style.setProperty("--tc",sc.color);
      const head=dv("tc-head",card);
      head.innerHTML="<span>"+esc(sc.name)+"</span><span>P="+sc.prob+"%</span>";
      const pb=dv("tc-prob",card);
      dv("i",pb).style.width=sc.prob+"%";
      const body=dv("tc-body",card);
      dv("div.tc-mult",body).textContent=sc.mult;
      dv("div.tc-size",body).textContent=sc.size+"（2028E）";
      dv("div.tc-kv",body).textContent="资本开支："+sc.capex;
      dv("div.tc-kv",body).textContent="出清："+sc.clear;
      const btn=dv("button.tc-x",card); btn.textContent="▼ 假设与确认信号";
      const det=dv("div.tc-det",card);
      const h1=dv("h5",det); h1.textContent="关键假设";
      const u1=dv("ul",det);
      sc.assume.forEach(a=>{ const li=dv("li",u1); li.textContent="· "+a; });
      const h2=dv("h5",det); h2.textContent="确认信号（证伪台可核查）";
      const u2=dv("ul",det);
      sc.confirm.forEach(a=>{ const li=dv("li",u2); li.textContent="√ "+a; });
      btn.addEventListener("click",()=>{ card.classList.toggle("open"); btn.textContent=card.classList.contains("open")?"▲ 收起":"▼ 假设与确认信号"; });
    });
    return null;
  }
  const W=960,H=700;
  const svg=frame(el,W,H);
  const cols=[{cx:170},{cx:480},{cx:790}];
  const rootX=480, rootY=64;
  mk("rect",{x:rootX-190,y:rootY-38,width:380,height:76,fill:"#7A3E8F",rx:4},svg);
  mk("text",{x:rootX,y:rootY-8,"text-anchor":"middle","font-size":17,fill:"#FFFDF6","font-weight":700,class:"charttext"},svg).textContent=spec.root.line1;
  mk("text",{x:rootX,y:rootY+16,"text-anchor":"middle","font-size":11.5,fill:"#EBDFF2",class:"charttext"},svg).textContent=spec.root.line2;
  CC.SCENARIOS.forEach((sc,i)=>{
    const cx=cols[i].cx, ny=250;
    mk("path",{d:"M"+(rootX-40)+" "+(rootY+38)+" C "+(rootX-40)+" 140, "+cx+" 130, "+cx+" "+(ny-56),fill:"none",stroke:sc.color,"stroke-width":Math.max(3,sc.prob*1.15),opacity:0.3,"stroke-linecap":"round"},svg);
    mk("text",{x:(rootX+cx)/2+(cx>rootX?18:(cx<rootX?-18:0)),y:170,"text-anchor":"middle","font-size":12,fill:sc.color,"font-weight":700,class:"charttext"},svg).textContent=sc.prob+"%";
    const g=mk("g",{style:"cursor:pointer"},svg);
    const ct=ny-56;
    mk("rect",{x:cx-132,y:ct,width:264,height:206,fill:"#FFFDF6",stroke:sc.color,"stroke-width":2,rx:4},g);
    mk("rect",{x:cx-132,y:ct,width:264,height:30,fill:sc.color,rx:4},g);
    mk("text",{x:cx-118,y:ct+20,"font-size":13,fill:"#FFFDF6","font-weight":700,class:"charttext"},g).textContent=sc.name+" · P="+sc.prob+"%";
    mk("text",{x:cx-118,y:ct+50,"font-size":10.5,fill:"#8C8370",class:"charttext"},g).textContent="2028E 市场规模";
    mk("text",{x:cx-118,y:ct+74,"font-size":20,fill:sc.color,"font-weight":700,class:"charttext"},g).textContent=sc.mult;
    wrapCN(sc.size,17).slice(0,2).forEach((ln,k)=>{
      mk("text",{x:cx-118,y:ct+93+k*14,"font-size":11,fill:sc.color,"font-weight":700,class:"charttext"},g).textContent=ln;
    });
    wrapCN("资本开支："+sc.capex,24).slice(0,2).forEach((ln,k)=>{
      mk("text",{x:cx-118,y:ct+124+k*14,"font-size":10.5,fill:"#57503D",class:"charttext"},g).textContent=ln;
    });
    wrapCN("出清："+sc.clear,24).slice(0,2).forEach((ln,k)=>{
      mk("text",{x:cx-118,y:ct+156+k*14,"font-size":10.5,fill:"#57503D",class:"charttext"},g).textContent=ln;
    });
    mk("text",{x:cx-118,y:ct+192,"font-size":10,fill:"#8C8370",class:"charttext"},g).textContent="▼ 点击展开假设与确认信号";
    const det=mk("g",{opacity:0,style:"transition:opacity .3s"},svg);
    let dy=ny+168;
    mk("text",{x:cx-132,y:dy,"font-size":11,fill:sc.color,"font-weight":700,class:"charttext"},det).textContent="关键假设";
    dy+=16;
    sc.assume.forEach(a=>{ wrapCN(a,30).forEach((ln,k)=>{ mk("text",{x:cx-122,y:dy,"font-size":10,fill:"#57503D",class:"charttext"},det).textContent=(k===0?"· ":"  ")+ln; dy+=13.5; }); });
    dy+=8;
    mk("text",{x:cx-132,y:dy,"font-size":11,fill:sc.color,"font-weight":700,class:"charttext"},det).textContent="确认信号（证伪台可核查）";
    dy+=16;
    sc.confirm.forEach(a=>{ wrapCN(a,30).forEach((ln,k)=>{ mk("text",{x:cx-122,y:dy,"font-size":10,fill:"#57503D",class:"charttext"},det).textContent=(k===0?"√ ":"  ")+ln; dy+=13.5; }); });
    let open=i===0;
    function refresh(){ det.setAttribute("opacity",open?1:0); }
    refresh();
    g.addEventListener("click",()=>{ open=!open; refresh(); });
  });
  return svg;
}

/* ═══════════ Kill Switch 仪表（参数化双布局） ═══════════ */
function renderGauge(el){
  const env=envFor(el);
  const W=Math.min(Math.max(env.W,320),640);
  const mob=env.mobile;
  const H=mob?490:330;
  const svg=frame(el,W,H);
  let cx,cy,R,bx,bw2,by,bh;
  if(mob){
    cx=W/2; cy=170; R=104;
    bx=30; bw2=W-60; by=318; bh=104;
  } else {
    cx=250; cy=210; R=150;
    bx=430; bw2=150; by=200; bh=120;
  }
  const a0=Math.PI, a1=0, vmax=70;
  const A=function(v){ return a0+(v/vmax)*(a1-a0); };
  function zone(v0,v1,color,op){
    const p0x=cx+R*Math.cos(A(v0)),p0y=cy-R*Math.sin(A(v0));
    const p1x=cx+R*Math.cos(A(v1)),p1y=cy-R*Math.sin(A(v1));
    mk("path",{d:"M"+p0x.toFixed(1)+" "+p0y.toFixed(1)+" A"+R+" "+R+" 0 0 1 "+p1x.toFixed(1)+" "+p1y.toFixed(1),fill:"none",stroke:color,"stroke-width":mob?22:26,opacity:op},svg);
  }
  zone(0,14,"#C2451E",0.8); zone(14,25,"#A8770F",0.7); zone(25,70,"#0E7C66",0.75);
  [0,14,25,40,55,70].forEach(v=>{
    const px=cx+(R+20)*Math.cos(A(v)), py=cy-(R+20)*Math.sin(A(v));
    mk("text",{x:px,y:py+3.5,"text-anchor":"middle","font-size":mob?9:10.5,fill:"#8C8370",class:"charttext"},svg).textContent=v+"%";
  });
  annoText(svg,cx+R*Math.cos(A(7)),cy-R*Math.sin(A(7))-(mob?16:22),"KILL ZONE","#C2451E",mob?10:11,"700","middle");
  annoText(svg,cx+R*Math.cos(A(47)),cy-R*Math.sin(A(47))-(mob?18:24),"顺风区","#0E7C66",mob?10:11,"700","middle");
  const cur=CC.KILL.current.g;
  const na=A(Math.min(cur,vmax));
  mk("line",{x1:cx,y1:cy,x2:cx+(R-30)*Math.cos(na),y2:cy-(R-30)*Math.sin(na),stroke:"#1A1610","stroke-width":4,"stroke-linecap":"round"},svg);
  mk("circle",{cx:cx,cy:cy,r:7,fill:"#1A1610"},svg);
  mk("text",{x:cx,y:cy+(mob?32:34),"text-anchor":"middle","font-size":mob?22:26,fill:"#1A1610","font-weight":700,class:"charttext"},svg).textContent="+"+cur+"%";
  mk("text",{x:cx,y:cy+(mob?50:54),"text-anchor":"middle","font-size":mob?10.5:11.5,fill:"#8C8370",class:"charttext"},svg).textContent=CC.KILL.current.y+"E · 大四家 capex 同比";
  const hs=CC.KILL.hist, gmax=70;
  annoText(svg,bx,by-(mob?26:28),"增速历史（2021–2026E）","#8C8370",mob?10:10.5);
  hs.forEach((h,i)=>{
    const x=bx+i*(bw2/hs.length), w=bw2/hs.length-(mob?3:5);
    const val=h.g||0;
    const hh=Math.abs(val)/gmax*bh/2;
    const y=val>=0? by+bh/2-hh : by+bh/2;
    mk("rect",{x:x,y:y,width:w,height:Math.max(1,hh),fill:val==null?"#C4B795":(val<CC.KILL.threshold?"#C2451E":val<25?"#A8770F":"#0E7C66"),opacity:h.e?0.6:0.9},svg);
    mk("line",{x1:bx,x2:bx+bw2,y1:by+bh/2,y2:by+bh/2,stroke:"#D2C8AF","stroke-width":1},svg);
    mk("text",{x:x+w/2,y:(i%2? (val>=0? y-15 : y+hh+20) : (val>=0? y-4 : y+hh+11)),"text-anchor":"middle","font-size":8.5,fill:"#57503D",class:"charttext"},svg).textContent=h.g==null?"—":(val>=0?"+":"")+Math.round(val)+"%";
    mk("text",{x:x+w/2,y:by+bh/2+(mob?16:18),"text-anchor":"middle","font-size":8.5,fill:"#8C8370",class:"charttext"},svg).textContent=String(h.y).slice(2);
  });
  mk("text",{x:bx,y:mob?by+bh/2+66:330,"font-size":mob?9.5:10,fill:"#8C8370",class:"charttext"},svg).textContent="红 = 低于 +14% Kill 线";
  return svg;
}

/* ═══════════ 证伪台 ═══════════ */
function renderTriggers(el){
  el.innerHTML="";
  let state={};
  try{ state=JSON.parse(localStorage.getItem("cc_triggers")||"{}"); }catch(e){ state={}; }
  const badge=document.getElementById("triggerState");
  function refresh(){
    const codes=Object.keys(state).filter(k=>state[k]);
    const hasContr=codes.some(c=>CC.TRIGGERS.find(t=>t.code===c).pts==="contr");
    const n=codes.length;
    if(!badge) return;
    if(n===0){ badge.className="desk-state"; badge.innerHTML="0 / 8 触发 · <b>Base</b>"; }
    else if(hasContr){ badge.className="desk-state bad"; badge.innerHTML=n+" / 8 触发 · <b>Contraction 预警</b>"; }
    else if(n>=3){ badge.className="desk-state bad"; badge.innerHTML=n+" / 8 触发 · <b>情景切换：Conservative</b>"; }
    else { badge.className="desk-state warn"; badge.innerHTML=n+" / 8 触发 · <b>Conservative 偏移</b>"; }
  }
  CC.TRIGGERS.forEach(t=>{
    const row=dv("trig",el);
    row.innerHTML='<div class="tg-head"><span class="tg-code'+(t.pts==="contr"?" pts-contr":" pts-cons")+'">'+t.code+" → "+(t.pts==="contr"?"收缩":"保守")+"</span><span class='tg-txt'>"+esc(t.text)+"</span></div>"
      +'<div class="tg-meta">源：'+esc(t.src)+" · 频率："+t.freq+"</div>";
    const sw=document.createElement("button");
    sw.className="switch"+(state[t.code]?" on":"");
    sw.style.setProperty("--pts",t.pts==="contr"?"#C2451E":"#A8770F");
    sw.title="模拟触发 "+t.code;
    sw.onclick=function(){ state[t.code]=!state[t.code]; if(!state[t.code]) delete state[t.code]; sw.classList.toggle("on",!!state[t.code]); try{localStorage.setItem("cc_triggers",JSON.stringify(state));}catch(e){} refresh(); };
    row.appendChild(sw);
  });
  refresh();
}

/* ── 导出 ── */
window.CCR={
  TT,
  render(el,spec){
    switch(spec.type){
      case "lines": return renderLines(el,spec);
      case "bars": return renderBars(el,spec);
      case "shareBars": return renderShareBars(el,spec);
      case "shareArea": return renderShareArea(el,spec);
      case "shareArea2": return renderShareArea2(el,spec);
      case "scatter": return renderScatter(el,spec);
      case "timeline": return renderTimeline(el,spec);
      case "wall": return renderWall(el);
      case "lifelines": return renderLifelines(el);
      case "matrix": return renderMatrix(el,spec);
      case "tree": return renderTree(el,spec);
      case "capexGauge": return renderBars(el,spec);
      default: return frame(el,200,60);
    }
  },
  renderGauge, renderTriggers
};
})();
