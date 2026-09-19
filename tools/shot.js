/* 确定性截图 v2：node tools/shot.js
   手机(390) + 平板(820) + 桌面(1440) 三档全检 */
const path=require("path"),fs=require("fs");
const puppeteer=require("puppeteer-core");
const ROOT=path.join(__dirname,"..");
const OUT=path.join(ROOT,"shots");
const EXE=path.join(process.env.LOCALAPPDATA,"ms-playwright","chromium-1243","chrome-win64","chrome.exe");
const URL="http://localhost:8342/";
const SECTIONS=["s0","s1","s2","s3","s4","s5","s6","s7","s8"];

async function sweep(page){
  for(let r=0;r<3;r++){
    await page.evaluate(async()=>{
      const H=document.body.scrollHeight;
      for(let y=0;y<H;y+=450){ window.scrollTo(0,y); await new Promise(res=>setTimeout(res,55)); }
      window.scrollTo(0,0);
    });
    await new Promise(r=>setTimeout(r,600));
  }
}
async function goSection(page,id,off){
  await page.evaluate((id,off)=>{
    const el=document.getElementById(id);
    const y=el.getBoundingClientRect().top+window.scrollY-(off||64);
    window.scrollTo({top:y,behavior:"instant"});
  },id,off);
  await new Promise(r=>setTimeout(r,650));
}

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const browser=await puppeteer.launch({executablePath:EXE,headless:true,args:["--no-sandbox","--disable-gpu","--font-render-hinting=none"]});

  /* ── 手机 390 ── */
  const mob=await browser.newPage();
  await mob.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await mob.goto(URL,{waitUntil:"networkidle0",timeout:30000});
  await new Promise(r=>setTimeout(r,1600));
  await sweep(mob);
  for(const id of SECTIONS){
    await goSection(mob,id);
    await mob.screenshot({path:path.join(OUT,"m2-"+id+".png")});
  }
  /* 手机近景 */
  for(const [id,name] of [["f01","m2-wall"],["f02","m2-lifelines"],["f04","m2-matrix"],["c22","m2-capex"],["f26","m2-tree"],["killdial","m2-desk"]]){
    await goSection(mob,id,90);
    await mob.screenshot({path:path.join(OUT,name+".png")});
  }
  /* 面板抽屉打开 */
  await mob.evaluate(()=>document.getElementById("panelFab").click());
  await new Promise(r=>setTimeout(r,600));
  await mob.screenshot({path:path.join(OUT,"m2-panel.png")});
  await mob.evaluate(()=>document.getElementById("panelClose").click());
  /* 底部导航区 */
  await goSection(mob,"s7");
  await mob.screenshot({path:path.join(OUT,"m2-tabbar.png")});
  await mob.close();

  /* ── 平板 820 ── */
  const pad=await browser.newPage();
  await pad.setViewport({width:820,height:1180,deviceScaleFactor:1});
  await pad.goto(URL,{waitUntil:"networkidle0",timeout:30000});
  await new Promise(r=>setTimeout(r,1200));
  await sweep(pad);
  await goSection(pad,"s0");
  await pad.screenshot({path:path.join(OUT,"p2-s0.png")});
  await goSection(pad,"s7");
  await pad.screenshot({path:path.join(OUT,"p2-s7.png")});
  await pad.close();

  /* ── 桌面 1440 ── */
  const desk=await browser.newPage();
  await desk.setViewport({width:1440,height:900,deviceScaleFactor:1});
  await desk.goto(URL,{waitUntil:"networkidle0",timeout:30000});
  await new Promise(r=>setTimeout(r,1200));
  await sweep(desk);
  for(const [id,name] of [["s0","d2-s0"],["f01","d2-wall"],["s7","d2-s7"],["killdial","d2-desk"]]){
    await goSection(desk,id,70);
    await desk.screenshot({path:path.join(OUT,name+".png")});
  }
  await desk.close();

  await browser.close();
  console.log("done:",fs.readdirSync(OUT).filter(f=>f.startsWith("m2-")||f.startsWith("p2-")||f.startsWith("d2-")).join(", "));
})().catch(e=>{ console.error(e); process.exit(1); });
