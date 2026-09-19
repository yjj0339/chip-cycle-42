/* 确定性截图：node tools/shot.js
   自动滚动触发懒渲染，然后逐节截图到 shots/ */
const path=require("path"),fs=require("fs");
const puppeteer=require("puppeteer-core");
const ROOT=path.join(__dirname,"..");
const OUT=path.join(ROOT,"shots");
const EXE=path.join(process.env.LOCALAPPDATA,"ms-playwright","chromium-1243","chrome-win64","chrome.exe");
const URL="http://localhost:8342/";
const SECTIONS=["s0","s1","s2","s3","s4","s5","s6","s7","s8"];
const CLOSEUPS=[["f01","wall"],["f02","lifelines"],["c22","capex"],["c26","tree"],["killdial","desk"]];

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const browser=await puppeteer.launch({executablePath:EXE,headless:true,args:["--no-sandbox","--disable-gpu","--font-render-hinting=none"]});
  const page=await browser.newPage();
  await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
  await page.goto(URL,{waitUntil:"networkidle0",timeout:30000});
  /* 全页慢速滚动，触发全部懒渲染 */
  await page.evaluate(async()=>{
    const H=document.body.scrollHeight;
    for(let y=0;y<H;y+=600){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,90)); }
    window.scrollTo(0,0);
  });
  await new Promise(r=>setTimeout(r,1600));
  /* 逐节截图 */
  for(const id of SECTIONS){
    await page.evaluate((id)=>{
      const el=document.getElementById(id);
      window.scrollTo({top:el.offsetTop-70,behavior:"instant"});
    },id);
    await new Promise(r=>setTimeout(r,700));
    await page.screenshot({path:path.join(OUT,"d-"+id+".png")});
  }
  /* 近景 */
  for(const [id,name] of CLOSEUPS){
    await page.evaluate((id)=>{
      const el=document.getElementById(id);
      const r=el.getBoundingClientRect();
      window.scrollTo({top:window.scrollY+r.top-90,behavior:"instant"});
    },id);
    await new Promise(r=>setTimeout(r,600));
    await page.screenshot({path:path.join(OUT,"d-"+name+".png")});
  }
  /* 手机宽度 */
  await page.setViewport({width:390,height:844,deviceScaleFactor:2});
  await page.reload({waitUntil:"networkidle0"});
  await page.evaluate(async()=>{
    const H=document.body.scrollHeight;
    for(let y=0;y<H;y+=500){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,70)); }
  });
  await new Promise(r=>setTimeout(r,1200));
  for(const [id,name] of [["top","m-hero"],["f01","m-wall"],["s7","m-conclusion"]]){
    await page.evaluate((id)=>{
      const el=document.getElementById(id)||document.body;
      window.scrollTo({top:(el.offsetTop||0)-(id==="top"?0:60),behavior:"instant"});
    },id);
    await new Promise(r=>setTimeout(r,700));
    await page.screenshot({path:path.join(OUT,name+".png")});
  }
  await browser.close();
  console.log("done:",fs.readdirSync(OUT).join(", "));
})().catch(e=>{ console.error(e); process.exit(1); });
