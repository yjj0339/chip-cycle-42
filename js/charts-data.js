/* ═══════════════════════════════════════════════════════════
   charts-data.js — 26 张图表的数据 / 口径 / 来源
   金额口径统一为亿美元（1B=10亿）；E = 作者估算
   ═══════════════════════════════════════════════════════════ */
window.CCDEFS = (function(){
const S_SEC = { t:"SEC EDGAR · 公司 10-K/10-Q 分部数据", p:"SEC", y:"逐年", u:"https://www.sec.gov" };
const S_TF  = { t:"TrendForce / DRAMeXchain 存储与封装产能追踪", p:"TrendForce", y:"2020–2026", u:"https://www.trendforce.com/presscenter/" };
const S_TSMC= { t:"台积电法说会纪要 + SemiAnalysis 供应链测算", p:"TSMC IR / SemiAnalysis", y:"2022–2026", u:"https://investor.tsmc.com" };
const S_EPOCH={ t:"Epoch AI · 模型训练算力数据库", p:"Epoch AI", y:"2012–2025", u:"https://epoch.ai/data" };

return {

/* ── 图01 墙图 ── */
c01:{ type:"wall", unit:"对数轴 · 亿美元 · 事件点可悬停", note:"墙图由四层构成：六轮窗口色带、行业接力曲线（对数轴，见口径）、36 个关键事件点、底部四拍机制条。点击窗口色带可跳转对应章节。",
 sources:[ S_SEC, S_EPOCH,
  { t:"行业规模拼接：Omdia 可编程逻辑 / LightCounting 光器件 / TrendForce HBM / 公司分部", p:"多来源整理（E）", y:"1985–2026", u:"https://www.omdia.com" } ] },

/* ── 图02 生命线 ── */
c02:{ type:"lifelines", unit:"1983–2026 · 点选公司查看生命卡", note:"横带为公司在场期（窗口色=其代表的年代），圆点为关键事件；北电为需求侧设备商（其起点早于 1983，截于此）。点击任意横带打开公司生命卡。",
 sources:[
  { t:"公司年报 / 招股书 / 破产与并购公告", p:"SEC EDGAR / 港交所 / 各公司", y:"1983–2026", u:"https://www.sec.gov" },
  { t:"寒武纪招股说明书与年报", p:"上交所科创板", y:"2020–2025", u:"https://www.cambricon.com" } ] },

/* ── 图03 接力棒 ── */
c03:{ type:"lines", ylog:true, xdomain:[1985,2026], ydomain:[0.3,4000],
 unit:"亿美元 · 对数轴 · E=估算",
 series:[
  { name:"可编程逻辑（FPGA/CPLD）", color:"#5750C8", pts:[[1985,0.5],[1990,5.5],[1995,16],[1997,26],[2000,42],[2002,22],[2005,33],[2008,37],[2010,38],[2012,43],[2015,52],[2018,62],[2020,64],[2022,85],[2023,72],[2024,78],[2025,85],[2026,92]] },
  { name:"光通信器件", color:"#C2451E", pts:[[1985,3],[1990,8],[1995,25],[1998,55],[2000,130],[2002,45],[2005,55],[2008,68],[2010,75],[2013,85],[2016,100],[2019,125],[2021,160],[2023,160],[2024,180],[2025,210],[2026,250]] },
  { name:"数据中心 GPU/加速器", color:"#0E7C66", pts:[[2013,3.4],[2014,6],[2015,10],[2016,20],[2017,40],[2018,60],[2019,75],[2020,110],[2021,160],[2022,220],[2023,430],[2024,1150],[2025,2050],[2026,2800]] },
  { name:"HBM（高带宽内存）", color:"#A8770F", pts:[[2013,1],[2016,3],[2019,7],[2020,15],[2021,22],[2022,34],[2023,44],[2024,160],[2025,280],[2026,400]] } ],
 annotations:[
  { x:1992,y:95,text:"第一棒：可编程逻辑" },
  { x:2000,y:340,text:"第二棒：光通信（峰值≈130亿）" },
  { x:2019,y:1250,text:"第三棒：数据中心加速器" },
  { x:2026,y:620,text:"第四棒：HBM\n（依附第三棒生长）" } ],
 note:"口径：厂商收入（不含设备与材料）。加速器线含 NVIDIA 数据中心、AMD Instinct、博通/Marvell 定制 ASIC、Intel 与中国厂商；自研 ASIC 的内部资本化不计入收入口径。",
 sources:[ S_SEC, S_TF,
  { t:"Omdia 可编程逻辑市场追踪 / LightCounting 光器件报告（转引）", p:"Omdia / LightCounting", y:"1985–2026", u:"https://www.omdia.com" } ] },

/* ── 图04 机制矩阵 ── */
c04:{ type:"matrix", unit:"点击单元格跳转对应章节",
 matrix:[
  { era:"窗口一 · FPGA 创立 1985–1997", color:"#5750C8", id:"s1", cells:[
    ["1985–1990\n军工+电信数字化",3],["1990–1995\n机型迭代·订阅式复购",3],["1993–1997\n租线扩产·克制",2],["1996–97 轻降温\n未出清→移交窗口二",1]] },
  { era:"窗口二 · 光通信 1998–2003", color:"#C2451E", id:"s2", cells:[
    ["1996–1998\n电信法+流量神话",3],["1998–2000\n双订·囤货·互证",3],["2000–2001\n新厂齐投产",3],["2001–2003\n−40% capex·−97%市值",3]] },
  { era:"窗口三 · 安静的十年 2004–2012", color:"#8C8470", id:"s3", cells:[
    ["—（缺位）\n没有新点火器",0],["存量更新\n年增 <10%",1],["克制\n过剩免除了扩产",1],["已在窗口二完成",1]] },
  { era:"窗口四 · TPU 点火 2013–2019", color:"#0E7C66", id:"s4", cells:[
    ["2012–2015\nAlexNet→TPU",3],["2015–2018\n算力变耗材",2],["2017–2019\nV100/TPU v3",2],["2018–19 局部\n加密出清预演",2]] },
  { era:"窗口五 · 短缺与并购 2020–2023", color:"#A8770F", id:"s5", cells:[
    ["2020–2021\n三重点火",3],["2020H2–2022\n双份订单",3],["2021–2023\nCoWoS/HBM 可量化",3],["2022–23 局部\n被 ChatGPT 接管",2]] },
  { era:"窗口六 · 当前 AI 周期 2024–2026", color:"#1D5FBF", id:"s6", cells:[
    ["2022.9–2024\nChatGPT 时刻",3],["2024–2026E\n长约·融资·透支",3],["2025–2027E\nHBM4/CoWoS-L",2],["未至\n三选一→见情景树",1]] } ],
 note:"单元格颜色深浅 = 该阶段在本窗口的烈度（0–3）。窗口三整行偏淡，正说明「缺位」本身就是一种周期状态。",
 sources:[
  { t:"本报告分析框架（作者综合）", p:"浪潮机器", y:"2026", u:"" },
  { t:"各窗口证据见对应章节图表的源与数据", p:"—", y:"", u:"" } ] },

/* ── 图05 四先驱收入 ── */
c05:{ type:"lines", xdomain:[1985,1998], ydomain:[0,72], unit:"百万美元 · 早年为估算 E",
 series:[
  { name:"Xilinx", color:"#5750C8", pts:[[1986,6],[1988,30],[1990,90],[1992,145],[1994,260],[1995,390],[1996,520],[1997,640]] },
  { name:"Altera", color:"#8C8470", pts:[[1986,12],[1988,45],[1990,80],[1992,136],[1994,246],[1995,369],[1996,456],[1997,654]] },
  { name:"Lattice", color:"#A8770F", pts:[[1986,3],[1988,16],[1990,45],[1992,75],[1994,140],[1995,188],[1996,230],[1997,320]] },
  { name:"Actel", color:"#0E7C66", pts:[[1986,1],[1988,10],[1990,35],[1992,62],[1994,110],[1995,150],[1996,175],[1997,210]] } ],
 annotations:[ { x:1995.2,y:610,text:"1995–97：电信扩容\n第一次交期紧张" } ],
 note:"口径：公司财年收入，早年依据招股书与 reported 值整理，存在 ±15% 估算误差（E）。",
 sources:[
  { t:"Xilinx / Altera / Lattice / Actel 早期年报与招股书", p:"SEC EDGAR", y:"1986–1997", u:"https://www.sec.gov" } ] },

/* ── 图06 设备商收入 ── */
c06:{ type:"lines", xdomain:[1990,2003], ydomain:[0,240], unit:"亿美元 · 财年口径",
 series:[
  { name:"Cisco（数据通信）", color:"#5750C8", pts:[[1990,1.8],[1991,3.3],[1992,4.6],[1993,6.5],[1994,13.3],[1995,19.8],[1996,40.9],[1997,64.4],[1998,84.6],[1999,121.5],[2000,189.2],[2001,222.9],[2002,189.2],[2003,188.8]] },
  { name:"Lucent（电信）", color:"#C2451E", pts:[[1996,87],[1997,264],[1998,301],[1999,383],[2000,338],[2001,214],[2002,123],[2003,85]] },
  { name:"Nortel 北电（电信）", color:"#A8770F", pts:[[1990,30],[1992,39],[1994,52],[1996,109],[1997,155],[1998,176],[1999,223],[2000,303],[2001,175],[2002,106],[2003,98]] } ],
 annotations:[ { x:2001.2,y:196,text:"2001：点火源熄火\n设备收入同步塌方" } ],
 note:"点火源读法：窗口一至窗口二的「需求点火→出清」在设备商收入曲线上先于芯片行业约 2 个季度显现。",
 sources:[ S_SEC,
  { t:"Cisco / Lucent / Nortel 年报（FY 口径，日历年近似）", p:"SEC EDGAR", y:"1990–2003", u:"https://www.sec.gov" } ] },

/* ── 图07 FPGA 终端结构 ── */
c07:{ type:"shareBars", xCats:["1990","1993","1996","1999","2002"], unit:"占 FPGA 收入 % · 估算 E",
 series:[
  { name:"军工/航天", color:"#3A342A", vals:[42,34,22,10,9] },
  { name:"电信+数据通信", color:"#C2451E", vals:[22,33,48,60,44] },
  { name:"工业控制", color:"#5750C8", vals:[18,17,15,14,17] },
  { name:"汽车/消费/其他", color:"#A8770F", vals:[18,16,15,16,30] } ],
 annotations:[ { xi:3, text:"1999：电信+数据 60%\n「重复下单」的燃料仓" } ],
 note:"口径：行业访谈与公司披露的结构估算（E）。2002 年「其他」占比跳升，反映电信塌方后的被动再平衡。",
 sources:[
  { t:"Omdia / In-Stat 可编程逻辑终端市场报告（转引）", p:"Omdia / In-Stat", y:"1990–2002", u:"https://www.omdia.com" },
  { t:"Xilinx / Altera 年报市场结构披露", p:"SEC EDGAR", y:"1995–2002", u:"https://www.sec.gov" } ] },

/* ── 图08 估值过山车 ── */
c08:{ type:"lines", ylog:true, xdomain:[1995,2003], ydomain:[80,3200], unit:"指数（1995=100）· 对数轴",
 series:[
  { name:"Xilinx 市值指数", color:"#5750C8", pts:[[1995,100],[1996,160],[1997,290],[1998,460],[1999,1300],[2000,2500],[2001,600],[2002,350],[2003,620]] },
  { name:"Altera 市值指数", color:"#8C8470", pts:[[1995,100],[1996,150],[1997,260],[1998,400],[1999,1050],[2000,1900],[2001,450],[2002,280],[2003,480]] },
  { name:"纳斯达克指数", color:"#C4B795", dash:true, pts:[[1995,100],[1996,123],[1997,156],[1998,221],[1999,386],[2000,571],[2001,331],[2002,228],[2003,315]] } ],
 annotations:[ { x:2000.1,y:2600,text:"×25（1995→2000.3）" } ],
 note:"口径：年末（2000 为 3 月峰值）市值，1995=100，对数轴。FPGA 双寡头跌幅（−76%/−85%）深于纳指（−60%），因电信在其终端结构中占比 48%。",
 sources:[
  { t:"历史市值与指数（月度）", p:"Macrotrends / Yahoo Finance 整理", y:"1995–2003", u:"https://www.macrotrends.net" } ] },

/* ── 图09 运营商 capex ── */
c09:{ type:"lines", xdomain:[1996,2005], ydomain:[0,2600], unit:"亿美元 · E=估算",
 series:[
  { name:"美国运营商", color:"#C2451E", pts:[[1996,400],[1997,450],[1998,550],[1999,700],[2000,900],[2001,650],[2002,400],[2003,320],[2004,330],[2005,360]] },
  { name:"全球主要运营商", color:"#5750C8", pts:[[1996,1200],[1997,1400],[1998,1700],[1999,2100],[2000,2400],[2001,1900],[2002,1300],[2003,1100],[2004,1150],[2005,1250]] } ],
 annotations:[ { x:2000.4,y:980,text:"峰值 → 两年 −55%\n「产能到达」的下游回声" } ],
 note:"口径：资本开支（含频谱之外的设施与设备），美国为 RBOC+长途运营商合计（E）；全球取主要 20 家（E）。",
 sources:[
  { t:"FCC 运营商投资统计 / 公司年报", p:"FCC / SEC", y:"1996–2005", u:"https://www.fcc.gov" },
  { t:"Ovum 全球运营商 capex 数据库（转引）", p:"Ovum", y:"1996–2005", u:"https://www.ovum.com" } ] },

/* ── 图10 蒸发市值 ── */
c10:{ type:"lines", ylog:true, xdomain:[1997,2003], ydomain:[30,5000], unit:"亿美元 · 对数轴 · E",
 series:[
  { name:"JDS Uniphase", color:"#C2451E", pts:[[1997,20],[1998,60],[1999,450],[2000.2,1250],[2001,180],[2002,45],[2003,55]] },
  { name:"Nortel 北电", color:"#A8770F", pts:[[1997,580],[1998,700],[1999,1500],[2000.5,3600],[2001,600],[2002,105],[2003,180]] } ],
 annotations:[ { x:2002.8,y:120,text:"合计蒸发 ≈4,600 亿美元\n（E，峰→谷）" } ],
 note:"口径：月末市值，峰值为月内高点（E，公开报道区间中值）。JDSU 2001 年商誉减记 448 亿美元，创当时纪录。",
 sources:[
  { t:"历史市值（月度）", p:"Macrotrends / 加拿大证券档案", y:"1997–2003", u:"https://www.macrotrends.net" },
  { t:"JDSU 2001 财年 10-K 商誉减记", p:"SEC EDGAR", y:"2001", u:"https://www.sec.gov" } ] },

/* ── 图11 暗光纤剪刀差 ── */
c11:{ type:"lines", xdomain:[1996,2004], ydomain:[0,1100], right:{ label:"点亮率 %", ydomain:[0,12], fmt:function(v){return v+"%";} }, unit:"左轴：铺设指数（1996=100）· 右轴：点亮率 % · E",
 series:[
  { name:"铺设光纤容量指数", color:"#C2451E", area:true, pts:[[1996,100],[1997,160],[1998,260],[1999,420],[2000,700],[2001,900],[2002,1000],[2003,1020],[2004,1040]] },
  { name:"点亮率（右轴）", color:"#1D5FBF", rightAxis:true, pts:[[1998,8],[1999,5],[2000,4],[2001,3],[2002,2.7],[2003,3.0],[2004,4.0]] } ],
 annotations:[ { x:2002.2,y:780,text:"2.7% 被点亮\n过剩用了十年才消化完" } ],
 note:"口径：美国长途光纤容量指数与点亮率，公开研究广泛引用（美林 2002 等转引，E）。「重复下单」的终极证据：铺下来的管子等了十年才有流量。",
 sources:[
  { t:"美国长途光纤铺设与点亮率（转引）", p:"美林 / TeleGeography", y:"1996–2004", u:"https://telegeography.com" } ] },

/* ── 图12 双寡头市占 ── */
c12:{ type:"shareArea", xdomain:[1998,2012], unit:"占可编程逻辑收入 % · E",
 series:[
  { name:"Xilinx", color:"#5750C8", vals:[45,46,47,48,49,50,49,47,45,44,46,49,51,50,50] },
  { name:"Altera", color:"#8C8470", vals:[40,40,41,42,42,41,40,41,42,42,41,40,41,42,42] },
  { name:"Lattice", color:"#A8770F", vals:[7,6,6,5,5,5,5,5,5,5,5,5,4,4,4] },
  { name:"Actel/Microsemi/其他", color:"#C4B795", vals:[8,8,6,5,4,4,6,7,8,9,8,6,4,4,4] } ],
 xYears:[1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012],
 note:"口径：可编程逻辑收入份额估算（E）。2010 年 Microsemi 吸收 Actel 后「其他」收敛。",
 sources:[
  { t:"Omdia 可编程逻辑份额追踪（转引）", p:"Omdia", y:"1998–2012", u:"https://www.omdia.com" },
  { t:"公司年报收入反推", p:"SEC EDGAR", y:"1998–2012", u:"https://www.sec.gov" } ] },

/* ── 图13 安静十年 ── */
c13:{ type:"bars", xCats:["1997","1998","1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013"], unit:"左轴：亿美元 · 右轴：%／年",
 series:[ { name:"可编程逻辑市场规模", color:"#8C8470", vals:[26,29,36,42,30,22,25,30,33,36,39,37,32,38,42,43,45] } ],
 line:{ name:"CPU 单核性能年增速（右轴）", color:"#C2451E", rightAxis:true, vals:[52,52,52,52,52,52,52,3.5,3.5,3.5,3.5,3.5,3.5,3.5,3.5,3.5,7] },
 annotations:[ { xi:7, text:"2003：免费午餐结束\n（Hennessy–Patterson）" } ],
 note:"右轴为单核性能年均提升率（1986–2003 ≈52%/年；2003–2011 ≈3.5%/年；2012 起随移动芯片回升）。该失速是窗口四的需求侧引信。",
 sources:[
  { t:"Omdia 可编程逻辑市场追踪（转引）", p:"Omdia", y:"1997–2013", u:"https://www.omdia.com" },
  { t:"Hennessy & Patterson, A New Golden Age for Computer Architecture", p:"ACM Turing Lecture", y:"2018", u:"https://doi.org/10.1145/3191731" } ] },

/* ── 图14 训练算力 ── */
c14:{ type:"scatter", ylog:true, xdomain:[2012,2026], ydomain:[1e17,1e27], unit:"FLOP · 对数轴",
 points:[
  { x:2012.5,y:4.7e17,label:"AlexNet" },{ x:2014.5,y:1.6e19,label:"GoogLeNet (E)" },
  { x:2015.9,y:1.1e19,label:"ResNet-50 (E)" },{ x:2016.3,y:1.9e23,label:"AlphaGo Lee" },
  { x:2017.6,y:7.4e21,label:"Transformer (E)" },{ x:2019.9,y:1.5e21,label:"GPT-2" },
  { x:2020.5,y:3.1e23,label:"GPT-3" },{ x:2023.2,y:2.1e25,label:"GPT-4" },{ x:2025.1,y:4.6e26,label:"Grok-3 (E)" } ],
 trend:[ { pts:[[2012.5,4.7e17],[2019.9,2e23]], label:"2012–2019：≈3.4 个月翻一番" },
         { pts:[[2020.5,3.1e23],[2025.1,4.6e26]], label:"2020–2025：≈6 个月翻一番" } ],
 divline:{ x:2020.2, label:"窗口四 | 窗口五·六" },
 note:"口径：模型训练总算力（FLOP），Epoch AI 数据库为主，部分为估算（E）。纵跨 9 个数量级——需求点火为什么必须先于产能，一目了然。",
 sources:[ S_EPOCH,
  { t:"OpenAI《AI and Compute》", p:"OpenAI", y:"2018", u:"https://openai.com/index/ai-and-compute/" } ] },

/* ── 图15 NVDA DC ── */
c15:{ type:"bars", xCats:["FY15","FY16","FY17","FY18","FY19","FY20"], unit:"左轴：亿美元 · 右轴：占公司收入 %",
 series:[ { name:"数据中心收入", color:"#0E7C66", vals:[2.4,3.4,19.3,29.3,29.3,29.8] } ],
 line:{ name:"占公司收入比（右轴）", color:"#C2451E", rightAxis:true, vals:[4.7,6.8,27.9,30.2,25.0,27.3] },
 annotations:[ { xi:2, text:"FY17：Volta + 云上架\n数据中心一年 5.7 倍" } ],
 note:"口径：NVIDIA 财年（约至 1 月末）数据中心分部收入。FY19 与 FY18 持平——加密出清预演正好吃掉了 AI 增量。",
 sources:[ S_SEC,
  { t:"NVIDIA 10-K FY2016–FY2020（CFO 评论分部表）", p:"NVIDIA IR", y:"2016–2020", u:"https://investor.nvidia.com" } ] },

/* ── 图16 加速器阵营时间线 ── */
c16:{ type:"timeline", xdomain:[2013,2020.2], unit:"点击事件查看说明",
 lanes:[
  { name:"公有云自研", color:"#1D5FBF", events:[[2015.3,"TPU v1 部署（95% 为推理）"],[2017.4,"TPU v2（训练入场）"],[2018.5,"TPU v3（液冷 Pod）"]] },
  { name:"NVIDIA", color:"#0E7C66", events:[[2016.5,"P100 / DGX-1 交付 OpenAI"],[2017.4,"V100·Volta"],[2018.6,"T4·推理专用"]] },
  { name:"FPGA 上云", color:"#5750C8", events:[[2016.8,"AWS F1 实例"],[2017.6,"Azure Catapult 规模化"],[2018.3,"Intel 收编 PSG 后云战略"]] },
  { name:"挑战者与中国", color:"#C2451E", events:[[2016.7,"Graphcore IPU"],[2018.4,"华为昇腾 310/910"],[2018.5,"寒武纪 MLU100"],[2019.8,"Habana Gaudi"]] },
  { name:"加密扰动", color:"#A8770F", events:[[2017.8,"挖矿混入 GPU 订单"],[2018.9,"现货崩塌·减记 1.38 亿"]] } ],
 note:"口径：公开发布时间线。窗口四的遗产是「阵营」：此后每一轮周期的玩家地图，都在这张图上延伸。",
 sources:[
  { t:"TPU 论文（arXiv:1704.04760）", p:"Google", y:"2017", u:"https://arxiv.org/abs/1704.04760" },
  { t:"各公司发布新闻稿", p:"NVIDIA / AWS / 华为 / 寒武纪", y:"2013–2019", u:"https://www.nvidia.com" } ] },

/* ── 图17 点火前夜 ── */
c17:{ type:"bars", xCats:["2013","2014","2015","2016","2017","2018","2019"], unit:"左轴：亿美元 · 右轴：AI 相关占比 % · E",
 series:[ { name:"大四家资本开支合计", color:"#8C8470", vals:[420,480,520,540,680,900,1000] } ],
 line:{ name:"其中 AI 相关占比（右轴，E）", color:"#0E7C66", rightAxis:true, vals:[1,1.5,2,3,5,7,8] },
 annotations:[ { xi:6, text:"点火前夜：AI 只占一成\n却将吃掉此后的一切" } ],
 note:"口径：微软/谷歌/亚马逊/Meta 资本开支日历年合计（财年折算，E）；AI 相关占比为购买 GPU/TPU 与 AI 基建占比估算（E）。",
 sources:[ S_SEC,
  { t:"四家公司 10-K 资本开支（财年折日历年）", p:"SEC EDGAR", y:"2013–2019", u:"https://www.sec.gov" } ] },

/* ── 图18 HBM ── */
c18:{ type:"bars", xCats:["2019","2020","2021","2022","2023","2024","2025E","2026E"], unit:"左轴：等效 12 吋晶圆 万片/月 · 右轴：亿美元 · E",
 series:[ { name:"行业 HBM 等效月产能", color:"#A8770F", vals:[3.5,4.5,6,9,13,21,30,39] } ],
 line:{ name:"行业 HBM 收入（右轴）", color:"#C2451E", rightAxis:true, vals:[7,15,22,34,44,160,280,400] },
 annotations:[ { xi:5, text:"2024：收入一年 3.6 倍\nSK hynix 售罄至次年" } ],
 note:"口径：等效 12 吋晶圆月产能（E，按 TSV 容量折算）；收入为 SK hynix/Samsung/Micron HBM 分部与报道整理（E）。HBM 是本轮「产能到达」最硬的计时器。",
 sources:[ S_TF,
  { t:"SK hynix / Samsung / Micron HBM 披露与法说会", p:"公司 IR", y:"2019–2026", u:"https://news.skhynix.com" } ] },

/* ── 图19 CoWoS ── */
c19:{ type:"bars", xCats:["2019","2020","2021","2022","2023","2024","2025E","2026E"], unit:"台积电 CoWoS 家族 · 千片/月（年末）· E",
 series:[ { name:"CoWoS 月产能（年末）", color:"#1D5FBF", vals:[5,8,11,13,15,35,70,100] } ],
 annotations:[ { xi:5, text:"2024：+133%\nNVIDIA 约占七成" }, { xi:7, text:"2026E：≈10 万片/月\nKill Switch 的分母" } ],
 note:"口径：台积电 CoWoS-S/R/L 合计月产能（年末，含 SoIC 之外的先进封装主口径，E）。数字上头条本身，就是「产能到达」被市场掐表的历史性标志。",
 sources:[ S_TSMC, S_TF ] },

/* ── 图20 并购超级周期 ── */
c20:{ type:"scatter", ylog:true, xdomain:[2005,2026], ydomain:[3,1200], bubble:true, unit:"交易金额 亿美元 · 对数轴 · 实心=交割 / 空心✕=流产 / ▽=剥离",
 points:[
  { x:2006.7,y:54,label:"AMD→ATI" },{ x:2010.9,y:4.3,label:"Microsemi→Actel" },
  { x:2015.4,y:167,label:"Intel→Altera" },{ x:2015.9,y:370,label:"Avago→Broadcom" },
  { x:2016.6,y:320,label:"软银→ARM" },{ x:2017.2,y:153,label:"Intel→Mobileye" },
  { x:2018.5,y:189,label:"博通→CA（软件）" },{ x:2018.4,y:4.3,label:"Xilinx→深维科技" },
  { x:2019.4,y:69,label:"NV→Mellanox" },{ x:2019.7,y:20,label:"Intel→Habana" },
  { x:2020.5,y:210,label:"ADI→Maxim" },{ x:2020.7,y:400,label:"NV→Arm（流产）",status:"dead" },
  { x:2020.9,y:104,label:"Marvell→Inphi" },{ x:2021.1,y:59,label:"瑞萨→Dialog" },
  { x:2022.1,y:493,label:"AMD→Xilinx（交割）" },{ x:2022.5,y:54,label:"Intel→Tower（流产）",status:"dead" },
  { x:2023.8,y:694,label:"博通→VMware（软件）" },{ x:2024.3,y:6,label:"软银→Graphcore" },
  { x:2024.0,y:350,label:"新思→Ansys（EDA）" },{ x:2025.3,y:87.5,label:"Intel 出售 Altera 51%",status:"divest" },
  { x:2025.2,y:65,label:"软银→Ampere" } ],
 highlight:[2020.5,2022.2],
 note:"口径：公开交易金额（交割或宣布口径，注明者除外）。阴影带 = 短缺与并购超级周期（2020.5–2022.2）。注意 2025 年的倒挂：Intel 以 2015 年一半的价格让出 Altera 控制权。",
 sources:[
  { t:"交易公告与新闻稿", p:"AMD / Intel / NVIDIA / 软银 / 博通", y:"2006–2025", u:"https://ir.amd.com" },
  { t:"Intel–Altera 2025 交易公告（51% → 银湖，估值 87.5 亿）", p:"Intel Newsroom", y:"2025", u:"https://www.intel.com" } ] },

/* ── 图21 短缺读数 ── */
c21:{ type:"lines", xdomain:[2019,2026], ydomain:[0,60], right:{ label:"现货/官方价比", ydomain:[0.5,2.2], fmt:function(v){return "×"+v;} }, unit:"左轴：周 · 右轴：官方价=1.0 · E",
 series:[
  { name:"FPGA 主力型号交期（周）", color:"#A8770F", pts:[[2019,12],[2020,20],[2021,38],[2022,52],[2023,26],[2024,20],[2025,18],[2026,17]] },
  { name:"GPU 现货溢价指数（右轴）", color:"#C2451E", rightAxis:true, pts:[[2020,1.0],[2021,1.8],[2022,1.3],[2023,1.55],[2024,1.1],[2025,0.95],[2026,0.9]] } ],
 annotations:[ { x:2022.2,y:47,text:"交期 52 周之巅\n= 「重复下单」的物理上限" } ],
 note:"口径：交期为 Xilinx/Altera 主力型号公开交期中值（E）；溢价指数取消费级与数据中心 GPU 现货成交价对官方定价之比（E）。2023 年溢价回升由 H100 缺货驱动，与 2021 年性质不同。",
 sources:[
  { t:"供应商公开交期与分销商数据（转引）", p:"Susquehanna / Digi-Key 追踪", y:"2019–2026", u:"https://www.susquehanna.net" },
  { t:"GPU 现货/租赁报价聚合", p:"eBay 成交 / Lambda / Vast.ai", y:"2020–2026", u:"https://lambda.ai" } ] },

/* ── 图22 Top-4 压力表 ── */
c22:{ type:"capexGauge", xCats:["2021","2022","2023","2024","2025","2026E"], unit:"左轴：亿美元 · 右轴：同比 % · 红虚线 = +14% Kill Switch",
 series:[
  { name:"微软", color:"#5750C8", vals:[230,250,320,640,880,1100] },
  { name:"谷歌", color:"#1D5FBF", vals:[246,315,323,525,910,1200] },
  { name:"亚马逊", color:"#A8770F", vals:[610,636,530,830,1250,1550] },
  { name:"Meta", color:"#0E7C66", vals:[190,320,280,392,700,1050] } ],
 stacked:true,
 line:{ name:"合计同比（右轴）", color:"#C2451E", rightAxis:true, vals:[null,19.2,-4.5,64.3,56.7,31.0] },
 ksY:14,
 note:"口径：日历年资本开支（含融资租赁，财年折算，2025–26E 为指引与 H1 实绩外推）。Kill Switch：合计增速跌破 +14% ⇒ Base 证伪（依据见结论章）。",
 sources:[ S_SEC,
  { t:"四家公司季报 capex 指引与实绩", p:"Microsoft / Alphabet / Amazon / Meta IR", y:"2021–2026", u:"https://www.microsoft.com/investor" } ] },

/* ── 图23 推理接管 ── */
c23:{ type:"shareArea2", xdomain:[2019,2026], right:{ label:"token 产量指数（2023=1，对数）", ydomain:[0.5,100], fmt:function(v){return v+"×";} }, unit:"左轴：算力用途结构 % · 右轴：产量指数 · E",
 series:[
  { name:"训练", color:"#8C8470", vals:[40,38,35,33,35,32,28,25] },
  { name:"推理", color:"#1D5FBF", vals:[60,62,65,67,65,68,72,75] } ],
 xYears:[2019,2020,2021,2022,2023,2024,2025,2026],
 lineRight:{ name:"头部平台月产 token 指数（右轴）", color:"#C2451E", pts:[[2023,1],[2024,6],[2025,25],[2026,60]] },
 note:"口径：训练/推理结构为行业访谈与云厂商披露估算（E）；token 指数以 2023 年头部平台月产量为 1 基准（E）。推理是「重复下单」的永动机：训练是基建，推理是电费。",
 sources:[ S_EPOCH,
  { t:"云厂商披露与行业访谈（E）", p:"Google Cloud Next / AWS re:Invent 纪要", y:"2023–2026", u:"https://artificialanalysis.ai" } ] },

/* ── 图24 竞争格局 ── */
c24:{ type:"shareBars", xCats:["2023","2024","2025E","2026E"], unit:"占加速芯片厂商收入 % · E",
 series:[
  { name:"NVIDIA", color:"#0E7C66", vals:[88,87,84,80] },
  { name:"自研 ASIC（经博通/Marvell）", color:"#1D5FBF", vals:[7,9,11,14] },
  { name:"AMD", color:"#5750C8", vals:[2,3,4,5] },
  { name:"其他（Intel/中国/初创）", color:"#C4B795", vals:[3,1,1,1] } ],
 annotations:[ { xi:3, text:"第二极成形：自研 ASIC →14%" } ],
 note:"口径：加速芯片厂商收入份额（GPU/ASIC/加速器，不含 CPU 与网络交换），E。博通 AI 半导体收入 FY2025 ≈200 亿美元为锚点。",
 sources:[ S_SEC,
  { t:"Broadcom / Marvell AI 分部披露；TrendForce 加速器追踪（E）", p:"公司 IR / TrendForce", y:"2023–2026", u:"https://www.broadcom.com" } ] },

/* ── 图25 定制 ASIC ── */
c25:{ type:"bars", grouped:true, xCats:["2023","2024","2025E","2026E"], unit:"亿美元 · E（除博通/Marvell 外为供应链估算）",
 series:[
  { name:"博通 AI ASIC", color:"#1D5FBF", vals:[40,88,130,180] },
  { name:"Google TPU（内部资本化）", color:"#5750C8", vals:[60,90,140,200] },
  { name:"AWS Trainium", color:"#A8770F", vals:[10,25,50,80] },
  { name:"Marvell AI", color:"#0E7C66", vals:[6,11,18,25] },
  { name:"其他（MTIA/昇腾/昆仑等）", color:"#C4B795", vals:[10,20,35,50] } ],
 note:"口径：厂商收入或内部资本化支出（E）。Google TPU 无公开口径，按 CoWoS/HBM 配额与供应链调研估算——读法看趋势而非绝对值。",
 sources:[
  { t:"Broadcom AI 半导体收入（FY24–25）", p:"Broadcom IR", y:"2023–2025", u:"https://www.broadcom.com" },
  { t:"供应链估算：CoWoS/HBM 配额反推", p:"SemiAnalysis / TrendForce（E）", y:"2023–2026", u:"https://semianalysis.com" } ] },

/* ── 图26 情景树 ── */
c26:{ type:"tree", unit:"点击分支展开假设与确认信号",
 root:{ line1:"2026 分水岭", line2:"产能到达（2026–27E，已签约）× 需求增速（回落速度）" },
 note:"口径：加速芯片厂商收入（图 24 同口径），2025 基数 ≈2,100 亿美元（E）。概率为主观赋值；每支分支的确认信号可在证伪台逐季核查。",
 sources:[
  { t:"本报告情景框架（作者）", p:"浪潮机器", y:"2026", u:"" },
  { t:"基数与敏感性：图 22/24/25 源与数据", p:"—", y:"", u:"" } ] }
};
})();
