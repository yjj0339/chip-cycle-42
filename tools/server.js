/* 极简静态服务器：node tools/server.js [端口] */
const http=require("http"),fs=require("fs"),path=require("path"),os=require("os");
const root=path.join(__dirname,"..");
const port=Number(process.argv[2]||8342);
const MIME={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"application/javascript; charset=utf-8",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".ico":"image/x-icon",".csv":"text/csv; charset=utf-8"};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split("?")[0]);
  if(p==="/") p="/index.html";
  const f=path.join(root,path.normalize(p));
  if(!f.startsWith(root)){ res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(f,(err,data)=>{
    if(err){ res.writeHead(404); return res.end("not found"); }
    res.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream"});
    res.end(data);
  });
}).listen(port,()=>{
  const nets=os.networkInterfaces();
  const lan=Object.values(nets).flat().filter(n=>n&&n.family==="IPv4"&&!n.internal).map(n=>n.address)[0];
  console.log("Local:   http://localhost:"+port);
  if(lan) console.log("LAN:     http://"+lan+":"+port);
});
