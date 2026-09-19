/* ═══════════════════════════════════════════════════════════
   data.js — 年代配置 / 公司生命线 / 墙图事件 / 情景 / 触发器
   金额口径：亿美元（1B = 10 亿）；标注 E 为作者估算
   ═══════════════════════════════════════════════════════════ */
window.CC = {};

/* ───────── 六个窗口：右侧面板与机制条共用的配置 ───────── */
CC.ERAS = {
  overview: { badge:"总览", name:"浪潮的形状", years:"1985–2026", thesis:"四十二年换过四次主引擎，韵脚始终是那四拍。",
    mech:[["需求点火","反复发生","每一次都由一种「新的、被相信会永远增长的需求」引爆"],
          ["重复下单","层层放大","双订、囤货、长约、供应商融资——订单互相印证"],
          ["产能到达","姗姗来迟","建设周期决定它总在需求的顶点之后抵达"],
          ["行业出清","或深或浅","以过剩的方式抵达，把周期交给下一棒"]],
    facts:[["跨年","42 年"],["主引擎更替","4 次"],["窗口","6 个"],["图表","26 张"]],
    events:[["1985","第一颗 FPGA 出货"],["2000","光通信市值之巅"],["2015","TPU 上线"],["2022","ChatGPT 点火"]],
    foot:"本页数据为公开资料整理与作者估算（E），非投资建议。点击图表右下角「源与数据」查看口径。" },

  w1: { badge:"窗口一", name:"FPGA 创立", years:"1985–1997", color:"#5750C8",
    thesis:"把 ASIC 变成软件：NRE 归零，电信与军工成了第一批会「返场复购」的客户。",
    mech:[["需求点火","1985–1990","军工电子与电信数字化：设备商厌倦为每款机型开一套 ASIC 模"],
          ["重复下单","1990–1995","机型每季翻新 + 军工小批量常改版，FPGA 生意天然是订阅制"],
          ["产能到达","1993–1997","租用 IDM 产线 0.8→0.35μm，扩产跟着设计 win 走，克制"],
          ["行业出清","1996–1997（轻）","亚洲金融危机短暂降温；真正的出清由窗口二加倍偿还"]],
    facts:[["1997 四先驱收入","≈180 亿美元"],["行业毛利","60%+"],["供给模式","无晶圆厂 + 租线"],["扩产纪律","不预建"]],
    events:[["1985","Xilinx XC2064 出货"],["1988","Altera 上市"],["1992","0.8μm 世代"],["1996","0.35μm·百万门世代"],["1997","电信扩容首现交期紧张"]],
    foot:"早年收入为年报整理与估算（E）。" },

  w2: { badge:"窗口二", name:"光通信：繁荣与崩塌", years:"1998–2003", color:"#C2451E",
    thesis:"「流量每百天翻一番」的信念 + 双份订单 = 四十二年里唯一一次教科书式出清。",
    mech:[["需求点火","1996–1998","互联网流量神话 + 1996 电信法 + DWDM 容量军备赛"],
          ["重复下单","1998–2000","运营商双订、渠道囤货、设备商按神话排产——三层互证"],
          ["产能到达","2000–2001","新厂与光纤同一时间投产；真实增速已回落"],
          ["行业出清","2001–2003","运营商 capex −40%，JDSU 市值 −97%，北电裁员 6 万"]],
    facts:[["美国长途光纤点亮率","2.7%（2002, E）"],["运营商 capex 峰谷","−40%+"],["北电市值蒸发","≈ −97%"],["裁员合计","数十万"]],
    events:[["1996","美国《电信法》"],["1999","JDS Uniphase 合并成型"],["2000.03","纳指见顶"],["2001","运营商全面砍单"],["2002","WorldCom 破产"]],
    foot:"点亮率、市值峰值取公开报道区间中值（E）。" },

  w3: { badge:"窗口三", name:"安静的十年", years:"2004–2012", color:"#8C8470",
    thesis:"没人接棒，也没人犯错：过剩被慢慢消化，火种在通用计算的内部积攒。",
    mech:[["需求点火","—（缺位）","没有新的、被相信会永远增长的需求"],
          ["重复下单","存量更新","双寡头 90% 份额，年增速 <10%"],
          ["产能到达","克制","上一轮过剩反而免除了扩产的必要"],
          ["行业出清","已在窗口二完成","利用率缓慢修复"]],
    facts:[["可编程逻辑 CAGR","≈5%"],["Xilinx+Altera 份额","≈90%"],["单核性能增速","52%→3.5%/年"],["暗光纤","逐年点亮消化过剩"]],
    events:[["2006","Virtex-5 / 65nm"],["2007","CUDA 发布"],["2010","Actel 并入 Microsemi"],["2012.06","AlexNet 点火前夜"]],
    foot:"单核性能增速引自 Hennessy & Patterson（2018）。" },

  w4: { badge:"窗口四", name:"TPU 点火", years:"2013–2019", color:"#0E7C66",
    thesis:"训练算力每 3.4 个月翻一番；TPU 论文里 95% 的负载是推理——「推理芯片」从此得名。",
    mech:[["需求点火","2012–2015","AlexNet → Google Brain → TPU 上线，算力成为研究产出的一阶变量"],
          ["重复下单","2015–2018","云厂商竞相上架 GPU/TPU；模型实验室按月扩容，算力变耗材"],
          ["产能到达","2017–2019","V100/TPU v3 量产；挖矿需求混入订单"],
          ["行业出清","2018–2019（局部）","币价崩、GPU 现货腰斩，NVIDIA 计提 1.38 亿美元——四拍完整的预演"]],
    facts:[["训练算力增速","×2 / 3.4 个月"],["NVDA DC 收入","5 年 10 倍"],["TPU 负载中推理","95%"],["第一次出清预演","2018Q4"]],
    events:[["2012","AlexNet"],["2015","TPU v1 部署"],["2016","AlphaGo / P100"],["2017","TPU v2 / V100"],["2018Q4","加密出清预演"]],
    foot:"训练算力增速引自 OpenAI《AI and Compute》（2018）。" },

  w5: { badge:"窗口五", name:"短缺与并购超级周期", years:"2020–2023", color:"#A8770F",
    thesis:"三重点火把交期拉到 52 周；产能焦虑被资本化成并购潮；出清被 ChatGPT「接管」。",
    mech:[["需求点火","2020–2021","疫情 + 加密 + AI 三重点火"],
          ["重复下单","2020H2–2022","系统商双份订单：一份给自己，一份给恐惧"],
          ["产能到达","2021–2023","CoWoS/HBM 扩产落地，瓶颈第一次可量化"],
          ["行业出清","2022–2023（局部）","现货溢价归零、库存减记；2022.11 ChatGPT 接管出清"]],
    facts:[["FPGA 交期峰值","≈52 周"],["AMD 收购 Xilinx","493 亿美元"],["CoWoS 月产能","1.5万→3.5万片/月"],["HBM 收入 2023→24","44→160 亿美元（E）"]],
    events:[["2020","A100 / AMD 宣布收购 Xilinx"],["2021","全球缺芯 / H100 发布"],["2022","AMD-Xilinx 交割"],["2022.11","ChatGPT"],["2023","GPT-4 / MI300"]],
    foot:"并购金额以交割口径为准；流产交易单独标注。" },

  w6: { badge:"窗口六", name:"当前 AI 周期", years:"2024–2026", color:"#1D5FBF",
    thesis:"推理接管算力，第二极（自研 ASIC）成形；产能到达排在 2026–27E，问题只是出清深度。",
    mech:[["需求点火","2022.9–2024","ChatGPT 时刻：token 产量两年两个数量级"],
          ["重复下单","2024–2026E","算力长约、供应商融资、集群转售——需求向未来透支"],
          ["产能到达","2025–2027E","HBM4 / CoWoS-L 扩产，可逐季掐表"],
          ["行业出清","未至","见结论三种情景与证伪台"]],
    facts:[["Top-4 capex 2025E","≈3,740 亿（+57%）"],["Top-4 capex 2026E","≈4,900 亿（+31%, E）"],["加速芯片 2025E","≈2,100 亿（E）"],["Kill Switch","+14%"]],
    events:[["2024","Blackwell / capex +65%"],["2025","Ironwood / HBM4 采样"],["2026","Rubin 世代 / 推理占比≈75%（E）"]],
    foot:"2026 为年内估算（H1 实绩 + 指引外推）。" },

  end: { badge:"结论", name:"三种未来", years:"2025 → 2028E", color:"#7A3E8F",
    thesis:"Base（55%）：2028E ≈ 2.5×；Conservative（30%）：1.6×；Contraction（15%）：0.9×。附 +14% Kill Switch 与八个可证伪触发器。",
    mech:[["需求点火","已发生","2022.11 ChatGPT 时刻"],
          ["重复下单","进行中","长约与融资结构是主要透支通道"],
          ["产能到达","2026–27E","CoWoS/HBM 已签约扩产"],
          ["行业出清","三选一","Base：无硬出清 / Cons：两年消化 / Contr：2027 出清"]],
    facts:[["Base 2028E","≈5,300 亿（2.5×）"],["Conservative","≈3,400 亿（1.6×）"],["Contraction","≈1,900 亿（0.9×）"],["Kill Switch","capex 增速 < +14%"]],
    events:[["监测","每季财报季核查触发器"]],
    foot:"主观概率与估算，不构成投资建议。" }
};
CC.MECH_STAGES = [
  { key:"ignite",  name:"需求点火", color:"#C2451E" },
  { key:"repeat",  name:"重复下单", color:"#A8770F" },
  { key:"arrive",  name:"产能到达", color:"#1D5FBF" },
  { key:"clear",   name:"行业出清", color:"#3A342A" }
];

/* ───────── 十四家公司生命线（1983–2026 主窗口） ───────── */
CC.COMPANIES = [
  { id:"altera",  name:"Altera", cn:"阿尔特拉", color:"#5750C8", born:1983, died:null, era:"w1",
    fate:"2015 被 Intel 以 167 亿收购；2025 年 51% 股权以 87.5 亿估值出售给银湖——十年一个来回。",
    events:[[1984,"首款 CPLD/逻辑器件"],[1988,"上市"],[2015,"被 Intel 收购"],[2025,"银湖入主·独立"]],
    line:"1985 年后的 FPGA 双寡头之一，毛利长期 60%+。", peak:"2015 年被收购时 167 亿美元" },
  { id:"xilinx",  name:"Xilinx", cn:"赛灵思", color:"#5750C8", born:1984, died:2022, era:"w1",
    fate:"2022 年并入 AMD，交易约 493 亿美元——FPGA 时代的句号由 AI 周期写下。",
    events:[[1985,"XC2064 出货"],[1998,"Virtex 世代"],[2018,"收购深维科技"],[2022,"并入 AMD"]],
    line:"FPGA 发明者，双寡头之首。", peak:"2000 年市值 ≈ 500 亿美元（E）" },
  { id:"lattice", name:"Lattice", cn:"莱迪思", color:"#8C8470", born:1983, died:null, era:"w1",
    fate:"幸存者：退守低功耗利基市场，安静地活过了所有周期。",
    events:[[1989,"上市"],[2018,"转型低功耗 iCE40 线"]],
    line:"四先驱中最小也最韧。", peak:"市值长期 <100 亿美元" },
  { id:"jdsu",    name:"JDS Uniphase", cn:"JDSU", color:"#C2451E", born:1989, died:2015, era:"w2",
    fate:"泡沫之巅 1,250 亿美元市值（E）→ 2015 年更名 VIAVI，光通信废墟的活化石。",
    events:[[1999,"与 Uniphase 合并"],[2000,"市值之巅"],[2001,"商誉减记 448 亿美元"]],
    line:"光器件之王，出清的代名词。", peak:"2000.03 ≈ 1,250 亿美元（E）" },
  { id:"nortel",  name:"Nortel", cn:"北电网络", color:"#C2451E", born:1895, died:2009, era:"w2",
    fate:"设备商（需求侧）：2009 年破产——本图起点截于 1983 年。",
    events:[[2000,"市值之巅 ≈3,600 亿（E）"],[2001,"裁员 6 万"],[2009,"破产清算"]],
    line:"北美电信设备霸主。", peak:"占多伦多交易所指数约 1/3" },
  { id:"broadcom",name:"Broadcom", cn:"博通", color:"#A8770F", born:1991, died:null, era:"w5",
    fate:"从 Avago 回购 Broadcom 之名，终成定制 ASIC 时代的军火商。",
    events:[[2016,"Avago 收购 Broadcom"],[2019,"收购 CA/赛普拉斯系"],[2023,"收购 VMware 694 亿"],[2025,"AI 半导体收入 ≈200 亿"]],
    line:"Google TPU 背后的设计之手。", peak:"AI 周期的第二极受益者" },
  { id:"nvidia",  name:"NVIDIA", cn:"英伟达", color:"#0E7C66", born:1993, died:null, era:"w4",
    fate:"1999 发明 GPU，2007 埋下 CUDA 之种，2025 财年数据中心收入 1,152 亿美元。",
    events:[[1999,"GeForce 256"],[2007,"CUDA"],[2016,"P100 / DGX-1 交付 OpenAI"],[2020,"A100"],[2024,"Blackwell"]],
    line:"加速器时代的定义者。", peak:"2025 年数据中心收入 1,152 亿美元" },
  { id:"amd",     name:"AMD", cn:"超威", color:"#5750C8", born:1969, died:null, era:"w5",
    fate:"1969 年创立；2006 收 ATI，2022 收 Xilinx——用两笔并购把自己买成了加速器第二供应商。",
    events:[[2006,"收购 ATI 54 亿"],[2020,"宣布收购 Xilinx"],[2023,"MI300"],[2025,"MI355"]],
    line:"两次跨越周期的高杠杆赌注。", peak:"2025 年数据中心业务 ≈250 亿美元" },
  { id:"intel",   name:"Intel", cn:"英特尔", color:"#8C8470", born:1968, died:null, era:"w3",
    fate:"CPU 时代之王：2015 收 Altera、2025 年放手——两次都踩在周期的换挡点上。",
    events:[[2005,"CPU 性能失速前夜"],[2015,"收购 Altera 167 亿"],[2019,"收购 Habana 20 亿"],[2023,"Gaudi 夭折"],[2025,"出售 Altera 控制权"]],
    line:"错过了自己资助的变革。", peak:"2025 年加速器份额 <2%" },
  { id:"tpu",     name:"Google TPU", cn:"谷歌 TPU", color:"#1D5FBF", born:2015, died:null, era:"w4",
    fate:"内部项目到 2025 年第七代 Ironwood：单 Pod 9,216 芯片——推理芯片的原始范本。",
    events:[[2015,"TPU v1 部署"],[2017,"v2 + 论文发表"],[2018,"v3"],[2024,"Trillium/v6e"],[2025,"Ironwood/v7"]],
    line:"从自用到外租：云上第三个选择。", peak:"供应链估算年投入数百亿美元级" },
  { id:"trainium",name:"AWS Annapurna", cn:"亚马逊自研", color:"#A8770F", born:2015, died:null, era:"w4",
    fate:"2015 收购 Annapurna 起家：Graviton 打底，Trainium 扛 AI——买方变成造方。",
    events:[[2015,"收购 Annapurna"],[2020,"Trainium v1"],[2024,"Trainium2"],[2025,"Trainium3"]],
    line:"「买 NVIDIA 的」阵营里的最大变量。", peak:"Trainium2 40 万卡级集群（E）" },
  { id:"hynix",   name:"SK hynix", cn:"SK 海力士", color:"#A8770F", born:1983, died:null, era:"w5",
    fate:"2013 年与 AMD 一起定义 HBM；AI 周期让这家DRAM老三短暂登顶内存之王。",
    events:[[2013,"HBM1 量产"],[2022,"HBM3"],[2024,"HBM3E 供不应求"],[2026,"HBM4 量产（E）"]],
    line:"HBM 就是 AI 时代的口粮。", peak:"2024 年 HBM 售罄至 2025" },
  { id:"tsmc",    name:"TSMC", cn:"台积电", color:"#1D5FBF", born:1987, died:null, era:"w5",
    fate:"1987 年发明代工模式；CoWoS 让「产能」第一次以「每月多少片」出现在头条。",
    events:[[2012,"CoWoS 首用"],[2020,"5nm"],[2024,"CoWoS-L / 3.5万片月"],[2026,"CoWoS ≈10万片/月（E）"]],
    line:"每一轮周期的沉默赢家。", peak:"先进封装成为新瓶颈" },
  { id:"cambricon",name:"Cambricon", cn:"寒武纪", color:"#C2451E", born:2016, died:null, era:"w6",
    fate:"2016 年从中科院孵化；2022 年列入实体清单；2025 年成为国产 AI 芯片旗手。",
    events:[[2016,"DianNao 系列落地"],[2020,"科创板上市"],[2022,"实体清单"],[2025,"营收爆发（E）"]],
    line:"中国路线的生命线样本。", peak:"2025 年市值一度破 5,000 亿元" }
];

/* ───────── 墙图事件（x=年份小数） ───────── */
CC.EVENTS = [
  [1985.2,"XC2064 出货","w1"],[1988.3,"Altera 上市","w1"],[1990.6,"电信数字化提速","w1"],
  [1993.5,"0.8μm→0.6μm 世代","w1"],[1996.0,"美国《电信法》","w2"],[1996.9,"DWDM 容量军备赛","w2"],
  [1998.2,"「百天翻番」叙事极盛","w2"],[1999.5,"JDS Uniphase 合并成型","w2"],[2000.2,"纳指见顶 · 北电市值之巅","w2"],
  [2001.3,"运营商全面砍单","w2"],[2002.5,"WorldCom 破产 · 点亮率 2.7%","w2"],[2003.6,"光通信出清尾声","w2"],
  [2006.4,"FPGA 65nm 世代","w3"],[2007.2,"CUDA 发布","w3"],[2010.8,"Actel 并入 Microsemi","w3"],
  [2012.5,"AlexNet · 点火前夜","w3"],[2013.6,"HBM1 量产","w4"],[2015.3,"TPU v1 部署","w4"],
  [2016.3,"AlphaGo · P100","w4"],[2017.5,"TPU v2 / V100","w4"],[2018.9,"加密出清预演 · 减记 1.38 亿","w4"],
  [2019.5,"NV 收购 Mellanox 69 亿","w4"],[2020.3,"疫情点火 · A100","w5"],[2020.8,"AMD 宣布收购 Xilinx","w5"],
  [2021.5,"全球缺芯 · 交期 52 周","w5"],[2022.1,"AMD-Xilinx 交割 493 亿","w5"],[2022.9,"ChatGPT · 新一轮点火","w6"],
  [2023.3,"GPT-4 · CoWoS 之渴","w6"],[2023.9,"MI300 / H200","w6"],[2024.3,"Blackwell · capex +65%","w6"],
  [2024.9,"HBM3E 售罄至 2025","w6"],[2025.4,"TPU v7 Ironwood · HBM4 采样","w6"],[2026.5,"Rubin 世代 · 推理占比≈75%（E）","w6"]
];

/* ───────── 情景树 ───────── */
CC.SCENARIOS = [
  { id:"base", name:"Base 基准", prob:55, color:"#0E7C66", mult:"2.5×", size:"≈5,300 亿美元",
    capex:"2026–28 大四家 capex CAGR ≈ +18%", clear:"无硬出清：利用率高位缓降，HBM4 定价温和",
    assume:["推理需求按 token 产量指数外推，单位成本年降 ≈55% 抵消效率红利","自研 ASIC 接住 30%+ 增量，NVIDIA 份额缓降至 ~75%","CoWoS/HBM 按已签约节奏 2026–27 分批到达","买方资产负债表足以承受折旧，无单一买方收缩"],
    confirm:["Top-4 capex 增速持续 >14%","CoWoS 2026 年末 ≥9 万片/月","GPU 租赁价格年降幅 <20%"] },
  { id:"cons", name:"Conservative 保守", prob:30, color:"#A8770F", mult:"1.6×", size:"≈3,400 亿美元",
    capex:"2027 增速跌破 +14%，2028 低个位数", clear:"软出清：2027–28 两年消化，部分产能递延",
    assume:["2027 capex 指引失速（<+14%）触发 Kill Switch","企业级与主权需求不足以对冲云厂商减速","HBM4 定价环比转负，二线存储被迫减产","自研 ASIC 分流加速，NVIDIA 增速转个位数"],
    confirm:["T1/T5/T8 中的两项以上触发","法说会首次出现「削减/递延」措辞","租赁价格同比转负"] },
  { id:"contr", name:"Contraction 收缩", prob:15, color:"#C2451E", mult:"0.9×", size:"≈1,900 亿美元（低于 2025）",
    capex:"2027 同比 −15%~−25%", clear:"硬出清：2027 订单级崩塌，重演 2001/2019",
    assume:["某头部买方（云或主权基金）公开收缩 AI 投资","模型效率革命使算力需求弹性失效（Jevons 反噬）","供应商融资/循环交易断裂，长约重谈","加速器现货与租赁价格崩塌，库存减记重现"],
    confirm:["T3/T4/T6 中的任意一项触发","连续两季 NVDA DC 环比负增长","出现 2000 亿级减记或长约重谈新闻"] }
];

/* ───────── 八个可证伪触发器 ───────── */
CC.TRIGGERS = [
  { code:"T1", pts:"cons", text:"大四家下一自然年合并 capex 指引中值同比 < +14%", src:"四家季报指引（微软 FY、谷歌/亚马逊/Meta 日历年）", freq:"每季财报季" },
  { code:"T2", pts:"cons", text:"台积电 CoWoS 2026 年末月产能 < 9 万片，或 2027 指引零增长", src:"台积电法说会 + 供应链核验", freq:"每季" },
  { code:"T3", pts:"contr", text:"HBM4 合约价环比连续两季下跌 > 5%", src:"TrendForce / DRAMeXchange 合约价跟踪", freq:"每月" },
  { code:"T4", pts:"contr", text:"NVIDIA 数据中心收入连续两个季度环比负增长", src:"NVIDIA 10-Q 分部披露", freq:"每季" },
  { code:"T5", pts:"cons", text:"头部云厂商 AI/云收入增速连续两季放缓 ≥ 5 个百分点", src:"Azure/GCP/AWS 分部与增量披露", freq:"每季" },
  { code:"T6", pts:"contr", text:"H100 级 GPU 公开租赁价 < 1.0 美元/卡时 且同比 < 0", src:"公开 GPU 云报价聚合（Lambda/Vast 等）", freq:"每月" },
  { code:"T7", pts:"cons", text:"任一超大规模买家新增算力中自研 ASIC 占比 > 40%", src:"公司披露 + 供应链装机估算", freq:"每半年" },
  { code:"T8", pts:"cons", text:"旗舰模型单位推理成本（$/百万 token）12 个月降幅 < 40%——效率红利停滞", src:"Artificial Analysis / Epoch AI 成本曲线", freq:"每半年" }
];

/* ───────── Kill Switch 数据（大四家 capex，亿美元） ───────── */
CC.KILL = {
  hist:[ {y:2021,v:1276,g:null},{y:2022,v:1521,g:19.2},{y:2023,v:1453,g:-4.5},{y:2024,v:2387,g:64.3},{y:2025,v:3740,g:56.7},{y:2026,v:4900,g:31.0,e:true} ],
  threshold:14, current:{y:2026,g:31.0},
  why:"+14% ≈ 消化 2026–27E 已签约 CoWoS/HBM 扩产的最低需求增速（作者估算）：低于此增速，新增产能的固定成本无法被增量收入摊销，砍单将从二线开始向一线传导。"
};

/* ───────── 术语与全局来源（附录用） ───────── */
CC.GLOBAL_SOURCES = [
  { t:"Trends in CMOS & GPU / TPU 体系论文", p:"Google（arXiv:1704.04760）", y:"2017", u:"https://arxiv.org/abs/1704.04760" },
  { t:"AI and Compute（3.4 个月翻番测算）", p:"OpenAI", y:"2018", u:"https://openai.com/index/ai-and-compute/" },
  { t:"Epoch AI · 训练算力数据库", p:"Epoch AI", y:"2019–2026", u:"https://epoch.ai/data" },
  { t:"NVIDIA Form 10-K（FY2016–FY2026 分部收入）", p:"SEC EDGAR", y:"逐年", u:"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001045810" },
  { t:"AMD / Intel / Broadcom / Marvell 分部披露与新闻稿", p:"公司 IR", y:"逐年", u:"https://ir.amd.com" },
  { t:"TrendForce / DRAMeXchange · HBM 与存储价格", p:"TrendForce", y:"2020–2026", u:"https://www.trendforce.com/presscenter/" },
  { t:"TSMC 法说会纪要与 CoWoS 产能（供应链整理）", p:"TSMC IR / SemiAnalysis", y:"2022–2026", u:"https://investor.tsmc.com" },
  { t:"可编程逻辑市场追踪（Omdia 转引）", p:"Omdia", y:"1998–2024", u:"https://www.omdia.com" },
  { t:"美国电信资本开支与光纤点亮率", p:"FCC / TeleGeography / 美林研究转引", y:"1996–2005", u:"https://telegeography.com" },
  { t:"设备商历史收入（Cisco / Lucent / Nortel 年报）", p:"SEC EDGAR", y:"1990–2003", u:"https://www.sec.gov" },
  { t:"Artificial Analysis · 推理成本曲线", p:"Artificial Analysis", y:"2024–2026", u:"https://artificialanalysis.ai" },
  { t:"Hennessy & Patterson《A New Golden Age for Computer Architecture》", p:"ACM Turing Lecture", y:"2018", u:"https://doi.org/10.1145/3191731" },
  { t:"GPU 租赁公开报价", p:"Lambda / Vast.ai / SFCompute", y:"2023–2026", u:"https://lambda.ai" },
  { t:"寒武纪招股书与年报；华为昇腾公开资料", p:"公司公告", y:"2020–2025", u:"https://www.cambricon.com" }
];
