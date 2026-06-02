const state = {
  data: null,
  filters: {
    query: "",
    siteQuery: "",
    industry: "全部",
    tier: "全部",
    heatWindow: "today",
    companyHeat: "all",
    focusOnly: false,
  },
  ai: {
    query: "",
    layer: "全部层级",
    segment: "全部",
    includeAll: true,
    selectedNode: "gpu",
  },
  semi: {
    query: "",
    layer: "全部层级",
    segment: "全部",
    includeAll: true,
    selectedNode: "semi-equipment",
  },
  selectedSymbol: null,
  selectedHotSymbol: null,
  selectedSemiSymbol: null,
  selectedGlossary: "芯片",
  selectedSemiGlossary: "设备",
};

const elements = {
  page: document.body.dataset.page || "home",
  updated: document.querySelector("#last-updated"),
  freshnessDot: document.querySelector("#freshness-dot"),
  sourceStatus: document.querySelector("#source-status"),
  portalUpdated: document.querySelector("#portal-updated"),
  portalStage: document.querySelector("#portal-stage"),
  portalHotCount: document.querySelector("#portal-hot-count"),
  portalHotSummary: document.querySelector("#portal-hot-summary"),
  portalCycleSummary: document.querySelector("#portal-cycle-summary"),
  portalAiSummary: document.querySelector("#portal-ai-summary"),
  portalSemiSummary: document.querySelector("#portal-semi-summary"),
  portalSocialSource: document.querySelector("#portal-social-source"),
  portalLeaders: document.querySelector("#portal-leaders"),
  portalMacroBadge: document.querySelector("#portal-macro-badge"),
  portalCyclePoints: document.querySelector("#portal-cycle-points"),
  marketSummary: document.querySelector("#market-summary"),
  macroBadge: document.querySelector("#macro-badge"),
  thesisPoints: document.querySelector("#thesis-points"),
  kWaveTag: document.querySelector("#k-wave-tag"),
  kWaveSummary: document.querySelector("#k-wave-summary"),
  kWaveSignals: document.querySelector("#k-wave-signals"),
  macroTable: document.querySelector("#macro-table"),
  assetMoves: document.querySelector("#asset-moves"),
  assetCount: document.querySelector("#asset-count"),
  confirmations: document.querySelector("#confirmations"),
  triggers: document.querySelector("#triggers"),
  qualityCount: document.querySelector("#quality-count"),
  aiBrief: document.querySelector("#ai-brief"),
  aiConfidence: document.querySelector("#ai-confidence"),
  eventFeed: document.querySelector("#event-feed"),
  reportFeed: document.querySelector("#report-feed"),
  watchTags: document.querySelector("#watch-tags"),
  watchRules: document.querySelector("#watch-rules"),
  siteSearchForm: document.querySelector("#site-search-form"),
  siteSearch: document.querySelector("#site-search"),
  themeToggle: document.querySelector("#theme-toggle"),
  navLinks: document.querySelectorAll("[data-page-nav]"),
  navDisclosure: document.querySelectorAll(".nav-disclosure"),
  searchableBlocks: document.querySelectorAll("[data-search-block]"),
  industry: document.querySelector("#industry-filter"),
  tier: document.querySelector("#tier-filter"),
  heatFilter: document.querySelector("#heat-filter"),
  heatTabs: document.querySelectorAll(".heat-tab"),
  hotDetail: document.querySelector("#hot-detail"),
  socialSource: document.querySelector("#social-source"),
  socialLeaders: document.querySelector("#social-leaders"),
  socialNote: document.querySelector("#social-note"),
  kWavePosition: document.querySelector("#k-wave-position"),
  merrillStage: document.querySelector("#merrill-stage"),
  merrillPosition: document.querySelector("#merrill-position"),
  merrillClock: document.querySelector("#merrill-clock"),
  clockMarker: document.querySelector("#clock-marker"),
  clockCurrentCard: document.querySelector("#clock-current-card"),
  aiStatGrid: document.querySelector("#ai-stat-grid"),
  aiTabs: document.querySelectorAll("[data-ai-scroll]"),
  aiSearch: document.querySelector("#ai-chain-search"),
  aiLayer: document.querySelector("#ai-layer-filter"),
  aiReset: document.querySelector("#ai-reset-view"),
  aiIncludeAll: document.querySelector("#ai-include-all"),
  aiSegments: document.querySelector("#ai-segments"),
  aiMapCanvas: document.querySelector("#ai-map-canvas"),
  aiNodeTitle: document.querySelector("#ai-node-title"),
  aiNodeSummary: document.querySelector("#ai-node-summary"),
  aiSummaryStats: document.querySelector("#ai-summary-stats"),
  aiNodeCompanies: document.querySelector("#ai-node-companies"),
  aiSemiView: document.querySelector("#ai-semi-view"),
  aiModelView: document.querySelector("#ai-model-view"),
  aiAppView: document.querySelector("#ai-app-view"),
  semiStatGrid: document.querySelector("#semi-stat-grid"),
  semiTabs: document.querySelectorAll("[data-semi-scroll]"),
  semiSearch: document.querySelector("#semi-chain-search"),
  semiLayer: document.querySelector("#semi-layer-filter"),
  semiReset: document.querySelector("#semi-reset-view"),
  semiIncludeAll: document.querySelector("#semi-include-all"),
  semiSegments: document.querySelector("#semi-segments"),
  semiMapCanvas: document.querySelector("#semi-map-canvas"),
  semiNodeTitle: document.querySelector("#semi-node-title"),
  semiNodeSummary: document.querySelector("#semi-node-summary"),
  semiSummaryStats: document.querySelector("#semi-summary-stats"),
  semiNodeCompanies: document.querySelector("#semi-node-companies"),
  semiFrontView: document.querySelector("#semi-front-view"),
  semiManufacturingView: document.querySelector("#semi-manufacturing-view"),
  semiMarketView: document.querySelector("#semi-market-view"),
  stockSearch: document.querySelector("#search-input"),
  focus: document.querySelector("#focus-toggle"),
  count: document.querySelector("#visible-count"),
  table: document.querySelector("#company-table"),
  detailTitle: document.querySelector("#detail-title"),
  detailSymbol: document.querySelector("#detail-symbol"),
  detailBody: document.querySelector("#detail-body"),
  glossaryList: document.querySelector("#glossary-list"),
  semiDetailTitle: document.querySelector("#semi-detail-title"),
  semiDetailSymbol: document.querySelector("#semi-detail-symbol"),
  semiDetailBody: document.querySelector("#semi-detail-body"),
  semiGlossaryList: document.querySelector("#semi-glossary-list"),
};

const formatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const glossaryGroups = {
  能源: [
    ["PPA", "长期购电协议。AI 数据中心需要锁定电价、电量和可再生能源属性。"],
    ["容量市场", "电网为可用发电容量付费的机制，负荷上行时电力资产弹性更明显。"],
    ["变压器", "输配电扩容核心设备，交期和产能会影响数据中心接电速度。"],
    ["UPS", "不间断电源，保证高价值算力集群在电力波动时持续运行。"],
    ["液冷", "高功率机柜散热方案，AI 数据中心功率密度提升后渗透率上升。"],
    ["PUE", "数据中心能源效率指标，越接近 1 越省电，影响运营成本和选址。"],
    ["SMR", "小型模块化反应堆，长期对应数据中心稳定电力需求，但商业化和监管周期较长。"],
    ["稀土磁材", "高性能电机、国防和电气化设备会用到稀土磁材，和 AI 电力/机器人外延相关。"],
  ],
  芯片: [
    ["GPU", "并行计算芯片，训练和推理仍以高端 GPU 为主要算力载体。"],
    ["AI ASIC", "云厂商或大客户定制 AI 加速芯片，主要用于降低推理成本。"],
    ["HBM", "高带宽内存，决定高端 GPU 训练吞吐和封装供给弹性。"],
    ["CoWoS", "先进封装能力，连接 GPU 与 HBM，是高端 AI 芯片交付瓶颈之一。"],
    ["Chiplet", "把多个芯粒封装成一个系统，提升设计弹性并改善良率和成本。"],
    ["EUV", "极紫外光刻，高端逻辑制程的关键设备能力。"],
  ],
  存储: [
    ["HBM", "训练集群的高带宽内存，影响 GPU 利用率和高端显存供给。"],
    ["DRAM", "服务器和推理集群的通用内存，周期弹性和 AI 需求相关。"],
    ["NAND", "非易失存储，数据湖、缓存和企业数据管线都会消耗容量。"],
    ["企业级 SSD", "高性能存储设备，支撑模型训练数据、检索和低延迟访问。"],
    ["向量数据库", "把文本、图片等转为向量后检索，是 RAG 应用的常见底座。"],
    ["数据湖", "集中存放结构化和非结构化数据，决定企业模型能否吃到自己的数据。"],
  ],
  基础设施: [
    ["InfiniBand", "高性能集群网络，强调低延迟和高吞吐，常用于训练集群。"],
    ["Ethernet", "以太网方案，成本、生态和可运维性推动 AI 数据中心采用。"],
    ["CPO", "共封装光学，把光互联更靠近交换芯片，用来降低高带宽网络功耗。"],
    ["光模块", "数据中心高速互联器件，训练集群扩张会推高 800G/1.6T 需求。"],
    ["800G / 1.6T", "数据中心高速光模块速率代际，云厂商 AI 集群扩张时需求弹性更明显。"],
    ["GPU 云", "专门出租 GPU 算力或提供 AI/HPC 托管的平台，重点看利用率和长期客户合同。"],
    ["AEC", "有源电缆，用于短距高速互联，是机柜内和机柜间网络升级的组件。"],
    ["交换芯片", "网络交换设备核心，影响集群东西向流量和吞吐。"],
    ["可观测性", "对应用、模型、数据和基础设施运行状态做监控和诊断。"],
  ],
  模型: [
    ["训练", "用大规模数据更新模型参数，资本开支集中但频率低于推理。"],
    ["推理", "模型被真实调用和部署的环节，比训练更接近应用收入兑现。"],
    ["RAG", "检索增强生成，让模型调用企业知识库，减少幻觉并提升可用性。"],
    ["Fine-tuning", "在通用模型上用特定数据微调，适合垂直场景。"],
    ["Token", "模型处理文本的基本计量单位，直接影响调用成本。"],
    ["Agent", "能规划、调用工具和执行多步骤任务的 AI 工作流。"],
  ],
  应用: [
    ["Copilot", "嵌入办公、开发、设计或客服流程的辅助型 AI 功能。"],
    ["工作流自动化", "让 AI 进入审批、销售、客服、ITSM 等企业流程。"],
    ["AIOps", "用 AI 做系统监控、故障定位和自动化运维。"],
    ["AI 安全", "围绕身份、数据、模型输入输出和新攻击面建立防护。"],
    ["垂直模型", "针对医疗、金融、工业等行业训练或适配的模型。"],
    ["边缘 AI", "在终端、汽车、机器人或工厂设备上本地推理。"],
    ["自主系统", "无人机、机器人、卫星和自动驾驶把模型能力带入物理世界。"],
    ["遥感 AI", "把卫星影像、地理数据和模型结合，用于国防、农业、能源和灾害监测。"],
  ],
};

const cyclePlaybook = {
  复苏: {
    text: "美林时钟偏复苏时，股票胜率通常高于商品和现金；结合康波第五轮信息技术后段，优先看云平台、AI 软件、半导体制造和算力弹性。",
    industries: ["云平台与 AI 软件", "AI 算力与芯片", "半导体设备与制造", "网络安全"],
  },
  过热: {
    text: "当前模型指向过热：增长仍有动能，通胀也偏强。结论不是追所有成长股，而是优先选择盈利兑现强、受益 AI 资本开支和实物约束的行业。",
    industries: ["数据中心电力与冷却", "低碳电力与电网", "半导体设备与制造", "AI 算力与芯片", "资源品"],
  },
  滞胀: {
    text: "滞胀阶段要降低纯估值扩张依赖，优先看资源品、防御现金流、医疗创新，以及 AI 基建里订单更硬的电力和冷却环节。",
    industries: ["资源品", "医疗创新", "数据中心电力与冷却", "低碳电力与电网"],
  },
  衰退: {
    text: "衰退阶段先保护仓位，偏向现金流稳定、资产负债表强和需求韧性高的公司；高弹性 AI 芯片更适合作为右侧观察。",
    industries: ["医疗创新", "云平台与 AI 软件", "网络安全", "低碳电力与电网"],
  },
};

const companyDirectory = Object.fromEntries(
  [
    candidate("CEG", "Constellation Energy", "低碳电力与电网", "核心龙头", "核电和稳定电力供给，是 AI 数据中心长协电力的重要候选。", 80),
    candidate("VST", "Vistra", "低碳电力与电网", "周期弹性", "电力负荷上行和容量市场受益，适合跟踪数据中心用电需求。", 76),
    candidate("NEE", "NextEra Energy", "低碳电力与电网", "防御配置", "可再生能源、储能和电网资产组合，偏长期电力基础设施。", 74),
    candidate("PWR", "Quanta Services", "低碳电力与电网", "产业链配套", "输配电、变电站和电网工程建设直接受益于电网升级。", 78),
    candidate("HUBB", "Hubbell", "数据中心电力与冷却", "产业链配套", "电气连接、配电和电网部件，受益电气化和数据中心建设。", 76),
    candidate("TT", "Trane Technologies", "数据中心电力与冷却", "核心龙头", "热管理和暖通系统龙头，液冷和高效制冷需求提升。", 77),
    candidate("CARR", "Carrier", "数据中心电力与冷却", "产业链配套", "制冷和楼宇系统供应商，数据中心热管理是新增看点。", 73),
    candidate("JCI", "Johnson Controls", "数据中心电力与冷却", "产业链配套", "楼宇自控和冷却系统，受益高能耗设施效率升级。", 72),
    candidate("LRCX", "Lam Research", "半导体设备与制造", "核心龙头", "刻蚀和薄膜设备龙头，先进逻辑、HBM 和存储扩产受益。", 79),
    candidate("KLAC", "KLA", "半导体设备与制造", "核心龙头", "量测检测设备龙头，先进制程良率爬坡越难越重要。", 80),
    candidate("MU", "Micron", "AI 算力与芯片", "周期弹性", "HBM、DRAM 和数据中心存储周期弹性高。", 76),
    candidate("MRVL", "Marvell", "AI 算力与芯片", "二线弹性", "高速互联、定制 ASIC 和数据中心芯片具备 AI 弹性。", 75),
    candidate("ARM", "Arm Holdings", "AI 算力与芯片", "平台型资产", "CPU IP 进入云、边缘和终端 AI，长期生态位置重要。", 74),
    candidate("META", "Meta Platforms", "云平台与 AI 软件", "核心龙头", "自研模型、推荐系统和广告 AI 变现能力强。", 82),
    candidate("ORCL", "Oracle", "云平台与 AI 软件", "产业链配套", "云基础设施和数据库客户基础支撑企业 AI 迁移。", 75),
    candidate("SNOW", "Snowflake", "云平台与 AI 软件", "二线弹性", "数据云和企业数据治理是模型落地的底座。", 72),
    candidate("DDOG", "Datadog", "云平台与 AI 软件", "二线弹性", "云观测和 AI 运维需求跟随复杂系统扩张。", 73),
    candidate("NOW", "ServiceNow", "云平台与 AI 软件", "核心龙头", "企业工作流平台，AI Agent 更容易进入预算和流程。", 78),
    candidate("CRM", "Salesforce", "云平台与 AI 软件", "核心龙头", "企业 CRM 数据和 Agent 应用，是 AI 软件变现观察点。", 75),
    candidate("ADBE", "Adobe", "云平台与 AI 软件", "核心龙头", "生成式 AI 进入创意工作流，重点看提价和留存。", 74),
    candidate("PLTR", "Palantir", "云平台与 AI 软件", "二线弹性", "企业和政府 AI 工作流平台，订单兑现决定估值支撑。", 73),
    candidate("SCCO", "Southern Copper", "资源品", "周期弹性", "铜供给偏紧，电网、数据中心和电气化提升长期需求。", 72),
    candidate("GOLD", "Barrick Gold", "资源品", "防御对冲", "黄金矿企，对冲滞胀、地缘和实际利率下行。", 68),
    candidate("CCJ", "Cameco", "资源品", "周期弹性", "铀和核燃料链，AI 数据中心电力需求强化核电叙事。", 74),
    candidate("XOM", "Exxon Mobil", "资源品", "防御现金流", "油气现金流和能源安全属性，适合高通胀环境观察。", 70),
    candidate("TSLA", "Tesla", "AI 应用", "高波动弹性", "自动驾驶、机器人和能源业务具备 AI 应用想象力。", 67),
    candidate("SYM", "Symbotic", "AI 应用", "高波动弹性", "仓储自动化和机器人系统，是实体 AI 应用观察点。", 66),
    candidate("PATH", "UiPath", "AI 应用", "高波动弹性", "RPA 和 Agent 工作流结合，适合观察企业自动化预算。", 64),
    candidate("P", "Pinterest", "AI 应用", "消费者 AI", "推荐、搜索和广告投放受益于生成式 AI 与个性化模型，但仍要回到广告变现验证。", 65),
    candidate("QCOM", "Qualcomm", "AI 算力与芯片", "终端 AI", "端侧 AI、手机芯片和边缘推理生态是应用层算力观察点。", 70),
    candidate("CRWV", "CoreWeave", "AI 算力云与数据中心", "高弹性龙头", "GPU 云和 AI 基础设施平台，直接承接大模型训练与推理算力外包需求。", 78),
    candidate("NBIS", "Nebius", "AI 算力云与数据中心", "高弹性", "AI 云基础设施平台，弹性来自 GPU 集群交付、客户利用率和融资能力。", 72),
    candidate("IREN", "IREN", "AI 算力云与数据中心", "电力资产转型", "从低成本电力和数据中心资产切入 AI 云，关键看 GPU 采购、客户合同和机房交付。", 69),
    candidate("CORZ", "Core Scientific", "AI 算力云与数据中心", "转型弹性", "比特币矿场和电力基础设施转向 HPC/AI 托管，合同质量和改造进度是核心。", 68),
    candidate("WULF", "TeraWulf", "AI 算力云与数据中心", "电力资产转型", "低成本电力和数据中心选址是优势，AI 收入兑现仍需看客户合同。", 67),
    candidate("CIFR", "Cipher Mining", "AI 算力云与数据中心", "转型弹性", "挖矿资产转 AI/HPC 逻辑成立但波动高，重点看电力、改造资本开支和客户能见度。", 64),
    candidate("LITE", "Lumentum", "光模块与网络", "光通信组件", "光通信器件和激光器供应商，AI 数据中心高速互联升级带来弹性。", 70),
    candidate("COHR", "Coherent", "光模块与网络", "光电器件龙头", "光电材料、激光器和数据中心光模块链条受益于 800G/1.6T 升级。", 72),
    candidate("AAOI", "Applied Optoelectronics", "光模块与网络", "高波动弹性", "数据中心光模块弹性标的，重点看 800G/1.6T 订单兑现和客户集中度。", 66),
    candidate("GLW", "Corning", "光模块与网络", "光纤材料", "光纤、玻璃和光通信材料受益于数据中心互联和网络升级。", 68),
    candidate("CIEN", "Ciena", "光模块与网络", "网络系统", "光网络和数据中心互联设备供应商，AI 流量增长带来中期需求。", 70),
    candidate("CSCO", "Cisco", "光模块与网络", "网络设备", "企业和数据中心网络设备龙头，AI 纯度低于 Arista 但受益网络升级。", 68),
    candidate("NOK", "Nokia", "光模块与网络", "通信设备", "通信设备与光网络供应商，AI 数据中心相关度低于纯数据中心网络标的。", 64),
    candidate("WDC", "Western Digital", "AI 存储与数据层", "周期弹性", "NAND、SSD 和 HDD 数据存储供应商，受益企业数据增长和存储价格周期。", 70),
    candidate("STX", "Seagate", "AI 存储与数据层", "周期弹性", "HDD 龙头，云数据中心冷数据、训练数据归档和容量需求带来周期弹性。", 69),
    candidate("SNDK", "SanDisk", "AI 存储与数据层", "NAND 弹性", "从 Western Digital 拆分后的 NAND/闪存平台，受益 NAND 价格和数据中心存储需求。", 68),
    candidate("MP", "MP Materials", "资源品", "稀土龙头", "美国稀土矿和磁材链代表，受益电气化、国防和高性能电机需求。", 66),
    candidate("USAR", "USA Rare Earth", "资源品", "稀土弹性", "美国稀土和磁材链弹性标的，产业政策和项目推进是核心变量。", 62),
    candidate("UUUU", "Energy Fuels", "资源品", "铀/稀土弹性", "铀和稀土双线题材，受益核电和关键矿产政策但波动较高。", 65),
    candidate("AA", "Alcoa", "资源品", "铝周期", "铝价、电力成本和工业需求相关，AI 相关性弱于铜、铀和稀土。", 62),
    candidate("SMR", "NuScale Power", "低碳电力与电网", "核电期权", "小型模块化反应堆题材，长期对应数据中心电力需求但商业化不确定性高。", 63),
    candidate("OKLO", "Oklo", "低碳电力与电网", "核电期权", "先进核电和数据中心供电叙事强，短期更偏许可、融资和项目里程碑。", 63),
    candidate("ASTS", "AST SpaceMobile", "空天与国防 AI", "卫星通信", "低轨卫星直连手机通信，属于 AI/通信外延而非算力主链。", 64),
    candidate("RKLB", "Rocket Lab", "空天与国防 AI", "商业航天", "发射和空间系统公司，受益国防、遥感和卫星网络建设。", 66),
    candidate("LUNR", "Intuitive Machines", "空天与国防 AI", "月球任务", "月球着陆器和 NASA 任务驱动，事件弹性高、订单节奏重要。", 60),
    candidate("PL", "Planet Labs", "空天与国防 AI", "遥感数据", "遥感卫星数据平台，AI 可提升地理数据分析和国防/商业应用。", 61),
    candidate("KTOS", "Kratos Defense", "空天与国防 AI", "无人系统/国防", "无人靶机、卫星通信和国防技术平台，AI 国防应用外延。", 66),
    candidate("AVAV", "AeroVironment", "空天与国防 AI", "无人机/国防", "无人机、巡飞弹和防务自动化平台，订单与国防预算驱动。", 68),
    candidate("ONDS", "Ondas", "空天与国防 AI", "无人机系统", "无人机和工业无线系统弹性标的，规模小、波动高。", 58),
    candidate("LMT", "Lockheed Martin", "空天与国防 AI", "军工龙头", "国防主承包商，AI、无人系统和导弹防御是长期技术升级方向。", 70),
    candidate("SERV", "Serve Robotics", "AI 应用", "配送机器人", "最后一公里配送机器人题材，商业化、现金消耗和规模化能力是核心。", 56),
  ].map((company) => [company.symbol, company]),
);

const companyProfiles = {
  GOOGL: {
    business: "Alphabet 以搜索广告、YouTube、Google Cloud、Android/Chrome 生态和 AI 模型为核心。AI 价值主要体现在搜索体验、广告投放效率、云端模型服务和企业生产力工具。",
    chainRole: "基础设施 / 模型 / 应用：自研 TPU、Gemini、Google Cloud 和广告分发共同形成闭环。",
    revenueMix: ["搜索广告仍是现金流核心", "YouTube 广告与订阅提供内容入口", "Google Cloud 承接企业 AI 与数据平台需求", "Other Bets 保留自动驾驶和前沿技术期权"],
    expenseMix: ["TAC 流量获取成本", "AI 芯片、数据中心和折旧", "研发人员与模型训练", "销售管理和监管合规"],
    financials: "重点看广告增速、Google Cloud 利润率、资本开支强度和 AI 搜索对商业化的影响。",
    watch: "跟踪 Gemini/Vertex AI 客户、Cloud backlog、搜索广告份额和 CapEx 指引。",
  },
  MSFT: {
    business: "Microsoft 以 Azure、Office、Windows、GitHub、LinkedIn 和企业安全为底座，AI 通过 Copilot、Azure AI 和开发者工具进入企业预算。",
    chainRole: "基础设施 / 模型 / 应用：云算力、OpenAI 生态和企业软件入口绑定紧密。",
    revenueMix: ["Azure 和服务器产品", "Office / Dynamics 企业订阅", "Windows 与设备生态", "LinkedIn、广告和游戏"],
    expenseMix: ["数据中心资本开支与折旧", "云基础设施运营", "AI 研发和模型合作成本", "销售渠道与并购摊销"],
    financials: "重点看 Azure 增速中 AI 贡献、Copilot 渗透率、毛利率变化和自由现金流。",
    watch: "跟踪 Azure AI 使用量、M365 Copilot 席位、GitHub Copilot 留存和 CapEx 回报。",
  },
  NVDA: {
    business: "NVIDIA 是 AI 加速计算龙头，核心来自数据中心 GPU、网络、系统、CUDA 软件生态，并向推理、机器人和自动驾驶扩展。",
    chainRole: "芯片 / 基础设施：GPU、网络、系统级机柜和软件生态定义算力供给。",
    revenueMix: ["数据中心 GPU 和系统", "网络与交换互联", "游戏 GPU", "专业可视化、汽车和机器人"],
    expenseMix: ["晶圆与先进封装采购", "HBM 和供应链锁产能", "研发与软件生态", "渠道、库存和质量保障"],
    financials: "重点看数据中心收入、毛利率、Blackwell/后续平台爬坡、网络收入和客户集中度。",
    watch: "跟踪云厂商 CapEx、供给交付、推理占比、HBM/CoWoS 约束和竞争芯片价格。",
  },
  AMZN: {
    business: "Amazon 的 AI 逻辑来自 AWS、Bedrock、Trainium/Inferentia、自营零售效率和广告业务。",
    chainRole: "基础设施 / 模型 / 应用：AWS 是企业 AI 上云和推理部署的重要平台。",
    revenueMix: ["AWS 云服务", "北美和国际电商", "广告服务", "Prime 订阅和第三方卖家服务"],
    expenseMix: ["履约和物流网络", "AWS 数据中心 CapEx", "内容与设备投入", "研发和销售管理"],
    financials: "重点看 AWS 增速和利润率、电商经营杠杆、广告增速和资本开支回收。",
    watch: "跟踪 Bedrock 客户、Trainium 采用、AWS backlog、广告货币化和物流成本率。",
  },
  META: {
    business: "Meta 以社交广告现金流支持推荐系统、生成式 AI、开源模型和元宇宙长期投入。",
    chainRole: "模型 / 应用：Llama、推荐广告和社交入口让模型快速接触海量用户。",
    revenueMix: ["Facebook / Instagram 广告", "Reels 和推荐流变现", "WhatsApp 商业化", "Reality Labs 长期期权"],
    expenseMix: ["AI 服务器和数据中心", "内容安全和研发人员", "Reality Labs 投入", "销售管理和监管合规"],
    financials: "重点看广告单价、展示量、AI 推荐带来的转化率、CapEx 和 Reality Labs 亏损。",
    watch: "跟踪 Llama 生态、AI 广告工具采用、Reels 货币化和资本开支节奏。",
  },
  TSM: {
    business: "台积电是先进制程和先进封装核心制造平台，高端 GPU、ASIC、CPU 和移动芯片都依赖其产能。",
    chainRole: "芯片：先进制程、CoWoS 和客户工艺迁移决定 AI 芯片交付。",
    revenueMix: ["先进逻辑制程", "高性能计算客户", "智能手机和消费电子", "先进封装服务"],
    expenseMix: ["晶圆厂折旧和设备采购", "EUV/先进设备投入", "能源和材料成本", "研发与工艺良率爬坡"],
    financials: "重点看 HPC 收入占比、毛利率、资本开支、CoWoS 产能和先进节点利用率。",
    watch: "跟踪 N2/N3 迁移、AI 客户订单、封装扩产和地缘风险。",
  },
  MU: {
    business: "Micron 提供 DRAM、NAND 和 HBM，是 AI 训练、推理和数据中心存储周期弹性最高的环节之一。",
    chainRole: "芯片 / 存储：HBM、服务器 DRAM 和企业级存储决定 AI 集群吞吐和缓存能力。",
    revenueMix: ["DRAM", "NAND", "HBM 和数据中心内存", "移动、PC、汽车和工业存储"],
    expenseMix: ["晶圆制造和折旧", "研发与工艺升级", "库存周期成本", "封装测试和材料"],
    financials: "重点看 HBM 订单、bit 出货、ASP、毛利率和库存周期位置。",
    watch: "跟踪 HBM 份额、云客户需求、DRAM/NAND 价格和资本开支纪律。",
  },
  VRT: {
    business: "Vertiv 提供数据中心电力、热管理、机柜和服务，是 AI 数据中心高功率密度建设的直接受益者。",
    chainRole: "能源 / 基础设施：配电、UPS、液冷和热管理把电力转成可运营算力。",
    revenueMix: ["热管理", "电力管理和 UPS", "机柜与集成方案", "服务和备件"],
    expenseMix: ["原材料和供应链", "制造人工与外包", "研发和定制项目", "销售渠道和安装服务"],
    financials: "重点看订单、backlog、毛利率、液冷占比和数据中心客户交付节奏。",
    watch: "跟踪 hyperscaler 订单、液冷渗透、交付周期和原材料成本。",
  },
  ANET: {
    business: "Arista 提供云数据中心交换机和网络操作系统，训练集群扩大后东西向流量会带动高速网络需求。",
    chainRole: "基础设施：以太网 AI 网络、交换机和网络软件支撑算力集群互联。",
    revenueMix: ["云客户交换机", "企业和园区网络", "网络软件和服务", "AI 集群网络升级"],
    expenseMix: ["芯片与光模块采购", "研发和网络操作系统", "销售渠道", "库存和供应链"],
    financials: "重点看云客户集中度、AI 网络收入、毛利率和 800G/1.6T 迁移节奏。",
    watch: "跟踪以太网 AI 网络渗透、云厂商订单和交换芯片供应。",
  },
};

function candidate(symbol, name, industry, tier, logic, baseScore = 72) {
  return {
    symbol,
    name,
    industry,
    tier,
    description: logic,
    logic,
    risk: "扩展候选池标的，需结合估值、财报、订单和价格趋势二次确认。",
    nextCheck: "下一步看财报指引、订单/收入增速、估值分位和行业资本开支变化。",
    valuationPercentile: 66,
    earningsDelivery: Math.max(62, Math.min(90, baseScore + 3)),
    baseScore,
  };
}

const officialSites = {
  AA: "https://www.alcoa.com/",
  AAOI: "https://www.ao-inc.com/",
  AAPL: "https://www.apple.com/",
  ADBE: "https://www.adobe.com/",
  ADI: "https://www.analog.com/",
  ALAB: "https://www.asteralabs.com/",
  AMAT: "https://www.appliedmaterials.com/",
  AMD: "https://www.amd.com/",
  AMKR: "https://www.amkor.com/",
  AMZN: "https://www.aboutamazon.com/",
  ANSS: "https://www.ansys.com/",
  ARM: "https://www.arm.com/",
  ASML: "https://www.asml.com/",
  ASTS: "https://ast-science.com/",
  ASX: "https://www.aseglobal.com/",
  ATEYY: "https://www.advantest.com/",
  AVAV: "https://www.avinc.com/",
  AVGO: "https://www.broadcom.com/",
  CARR: "https://www.corporate.carrier.com/",
  CCJ: "https://www.cameco.com/",
  CDNS: "https://www.cadence.com/",
  CEG: "https://www.constellationenergy.com/",
  CIEN: "https://www.ciena.com/",
  CIFR: "https://www.ciphermining.com/",
  COHR: "https://www.coherent.com/",
  CORZ: "https://corescientific.com/",
  CRM: "https://www.salesforce.com/",
  CRDO: "https://www.credosemi.com/",
  CRWV: "https://www.coreweave.com/",
  CSCO: "https://www.cisco.com/",
  DD: "https://www.dupont.com/",
  DDOG: "https://www.datadoghq.com/",
  ENTG: "https://www.entegris.com/",
  FN: "https://www.fabrinet.com/",
  GFS: "https://gf.com/",
  GLW: "https://www.corning.com/",
  GOLD: "https://www.barrick.com/",
  GOOGL: "https://abc.xyz/",
  HXSCF: "https://www.skhynix.com/",
  HUBB: "https://www.hubbell.com/",
  IBIDY: "https://www.ibiden.com/",
  INTC: "https://www.intel.com/",
  IREN: "https://iren.com/",
  ISRG: "https://www.intuitive.com/",
  JCI: "https://www.johnsoncontrols.com/",
  KLAC: "https://www.kla.com/",
  KTOS: "https://www.kratosdefense.com/",
  LIN: "https://www.linde.com/",
  LITE: "https://www.lumentum.com/",
  LLY: "https://www.lilly.com/",
  LMT: "https://www.lockheedmartin.com/",
  LRCX: "https://www.lamresearch.com/",
  LUNR: "https://www.intuitivemachines.com/",
  META: "https://about.meta.com/",
  MP: "https://mpmaterials.com/",
  MRVL: "https://www.marvell.com/",
  MSFT: "https://www.microsoft.com/",
  MU: "https://www.micron.com/",
  NBIS: "https://nebius.com/",
  NEE: "https://www.nexteraenergy.com/",
  NOK: "https://www.nokia.com/",
  NOW: "https://www.servicenow.com/",
  NVDA: "https://www.nvidia.com/",
  NXPI: "https://www.nxp.com/",
  OKLO: "https://oklo.com/",
  ON: "https://www.onsemi.com/",
  ONDS: "https://ondas.com/",
  ORCL: "https://www.oracle.com/",
  P: "https://www.pinterest.com/",
  PATH: "https://www.uipath.com/",
  PL: "https://www.planet.com/",
  PLTR: "https://www.palantir.com/",
  PWR: "https://www.quantaservices.com/",
  QCOM: "https://www.qualcomm.com/",
  RKLB: "https://www.rocketlabusa.com/",
  SCCO: "https://southerncoppercorp.com/",
  SERV: "https://www.serverobotics.com/",
  SIMO: "https://www.siliconmotion.com/",
  SMR: "https://www.nuscalepower.com/",
  SNDK: "https://www.sandisk.com/",
  SNOW: "https://www.snowflake.com/",
  SNPS: "https://www.synopsys.com/",
  SSNLF: "https://www.samsung.com/",
  STX: "https://www.seagate.com/",
  SYM: "https://www.symbotic.com/",
  TER: "https://www.teradyne.com/",
  TOELY: "https://www.tel.com/",
  TSLA: "https://www.tesla.com/",
  TSM: "https://www.tsmc.com/",
  TT: "https://www.tranetechnologies.com/",
  TXN: "https://www.ti.com/",
  UMC: "https://www.umc.com/",
  USAR: "https://www.usare.com/",
  UUUU: "https://www.energyfuels.com/",
  VST: "https://www.vistracorp.com/",
  VRT: "https://www.vertiv.com/",
  WDC: "https://www.westerndigital.com/",
  WULF: "https://www.terawulf.com/",
  XOM: "https://corporate.exxonmobil.com/",
};

function officialSiteFor(company) {
  return officialSites[company?.symbol] || "";
}

function renderOfficialLink(company, className = "official-link") {
  const url = officialSiteFor(company);
  if (!url) return "";
  return `<a class="${className}" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${company.name} 官网">官网</a>`;
}

function profileFor(company) {
  const fallbackByIndustry = {
    "低碳电力与电网": {
      business: "围绕发电资产、输配电、变电设备和电网工程提供供给能力，受益于 AI 数据中心、电气化和电网升级。",
      chainRole: "能源：决定 AI 工厂能否拿到足够、稳定、可持续的电力。",
      revenueMix: ["发电或电网资产收入", "电力设备和工程交付", "长协或服务收入", "项目型订单"],
      expenseMix: ["燃料、材料或设备采购", "工程施工和维护", "折旧与资本开支", "融资成本和监管成本"],
      financials: "重点看订单、容量价格、电价合同、资本开支和资产负债表。",
      watch: "跟踪数据中心用电合同、并网进度、设备交期和监管审批。",
    },
    "数据中心电力与冷却": {
      business: "提供数据中心供配电、UPS、热管理、液冷、楼宇控制或工程服务，是 AI 机柜功率提升后的硬约束环节。",
      chainRole: "能源 / 基础设施：把电力、散热和可靠性转化为可运营算力。",
      revenueMix: ["设备销售", "项目交付", "服务和备件", "数据中心客户订单"],
      expenseMix: ["原材料和制造", "研发和定制设计", "安装服务", "销售渠道和保修"],
      financials: "重点看 backlog、订单增速、毛利率、液冷占比和交付周期。",
      watch: "跟踪 hyperscaler 资本开支、AI 机柜密度、液冷渗透和供应链交期。",
    },
    "半导体设备与制造": {
      business: "为先进逻辑、存储和封装提供制造、设备、检测或工艺能力，订单来自晶圆厂资本开支。",
      chainRole: "芯片：决定先进制程、良率、HBM 和封装扩产速度。",
      revenueMix: ["设备或制造服务", "服务合约和备件", "先进节点相关收入", "存储或封装客户需求"],
      expenseMix: ["研发和工程人员", "高精密零部件", "制造与服务交付", "库存和供应链"],
      financials: "重点看订单、出货、毛利率、客户 CapEx 和先进制程渗透。",
      watch: "跟踪晶圆厂扩产、出口限制、良率爬坡和存储周期。",
    },
    "AI 算力与芯片": {
      business: "提供 AI 加速器、定制芯片、CPU/IP、内存或高速互联芯片，直接决定训练和推理成本曲线。",
      chainRole: "芯片：连接模型能力、算力供给和数据中心资本开支。",
      revenueMix: ["数据中心芯片", "定制 ASIC 或互联", "存储/CPU/IP 授权", "消费和边缘设备"],
      expenseMix: ["晶圆、封装和 HBM", "研发和软件生态", "库存与供应保障", "销售和客户支持"],
      financials: "重点看数据中心收入、毛利率、新平台爬坡、客户集中度和供应约束。",
      watch: "跟踪云厂商 CapEx、推理需求、竞品定价和先进封装产能。",
    },
    芯片设计: {
      business: "设计 GPU、CPU、ASIC、SoC、网络、模拟和功率芯片，AI 需求通过云厂商、服务器、汽车和终端设备传导。",
      chainRole: "芯片：定义算力、互联、端侧 AI 和系统能力，是半导体需求的前端发起者。",
      revenueMix: ["数据中心芯片", "网络/互联芯片", "移动和汽车芯片", "模拟、功率和工业芯片"],
      expenseMix: ["研发和软件生态", "晶圆与封装采购", "测试和供应保障", "销售和客户支持"],
      financials: "重点看数据中心收入、新平台爬坡、毛利率、客户集中度和库存周期。",
      watch: "跟踪云厂商 CapEx、自研 ASIC、端侧 AI 渗透、先进封装和竞争定价。",
    },
    存储: {
      business: "提供 HBM、DRAM、NAND、SSD 或 HDD，AI 训练、推理、数据湖和归档都会提升存储层需求。",
      chainRole: "芯片 / 基础设施：HBM 决定 GPU 吞吐，NAND/SSD/HDD 支撑数据中心容量和数据管线。",
      revenueMix: ["HBM/DRAM", "NAND/SSD", "HDD 或大容量存储", "数据中心与企业客户"],
      expenseMix: ["晶圆制造或盘片制造", "封装测试和材料", "研发与控制器", "库存周期成本"],
      financials: "重点看 ASP、bit 出货、HBM 份额、企业存储需求和库存周期。",
      watch: "跟踪 HBM 认证、NAND/HDD 价格、云客户采购和资本开支纪律。",
    },
    设备: {
      business: "提供光刻、刻蚀、沉积、量测检测和测试设备，AI 芯片扩产通过晶圆厂资本开支传导到设备链。",
      chainRole: "芯片：决定先进制程、良率、HBM 和封装扩产速度。",
      revenueMix: ["新设备销售", "服务和备件", "先进逻辑客户", "存储和封装客户"],
      expenseMix: ["研发和工程人员", "高精密零部件", "制造与服务交付", "库存和供应链"],
      financials: "重点看订单、backlog、毛利率、服务收入和区域限制。",
      watch: "跟踪晶圆厂 CapEx、EUV/刻蚀/量测需求、存储复苏和出口管制。",
    },
    晶圆制造: {
      business: "把芯片设计转化为晶圆，包括先进逻辑、成熟制程和 IDM，AI GPU、ASIC、CPU 和手机芯片都依赖其产能。",
      chainRole: "芯片：先进制程、良率、产能利用率和先进封装决定 AI 芯片交付。",
      revenueMix: ["先进逻辑代工", "成熟制程/特色工艺", "IDM 产品或代工服务", "先进封装协同"],
      expenseMix: ["设备折旧和资本开支", "材料与能源", "工艺研发和良率爬坡", "人工与厂务运维"],
      financials: "重点看 HPC/AI 占比、毛利率、CapEx、先进节点迁移和客户集中度。",
      watch: "跟踪 N2/N3/GAA、CoWoS 扩产、AI 客户订单和地缘风险。",
    },
    "云平台与 AI 软件": {
      business: "提供云基础设施、企业软件、数据平台或工作流系统，AI 价值来自算力调用、订阅提价和流程自动化。",
      chainRole: "基础设施 / 模型 / 应用：把模型能力导入企业数据和工作流。",
      revenueMix: ["云或订阅收入", "数据/平台服务", "企业软件席位", "专业服务和广告/生态收入"],
      expenseMix: ["数据中心和折旧", "研发与模型集成", "销售获客", "云运营和客户支持"],
      financials: "重点看收入增速、净留存、AI 产品渗透、毛利率和自由现金流。",
      watch: "跟踪 AI SKU 采用、客户扩容、续费率、CapEx 和竞争价格。",
    },
    "AI 算力云与数据中心": {
      business: "提供 GPU 云、HPC 托管、数据中心机房或电力资产转型服务，是 AI 基建资本开支从云巨头向专门平台外溢的环节。",
      chainRole: "基础设施：把电力、机房、GPU、网络和客户合同组合成可销售的 AI 算力。",
      revenueMix: ["GPU 云或 AI/HPC 托管", "数据中心租赁和服务", "长期客户合同", "电力和机房资产利用"],
      expenseMix: ["GPU 和服务器采购", "数据中心改造和折旧", "电力成本", "融资成本和运维人员"],
      financials: "重点看客户合同期限、利用率、融资成本、机房交付、GPU 供应和现金流。",
      watch: "跟踪 hyperscaler 合同、GPU 上线节奏、电力容量、债务/股权融资和挖矿资产转型进度。",
    },
    "光模块与网络": {
      business: "提供数据中心交换机、光模块、光电器件、光纤和光网络系统，训练集群扩张后互联瓶颈从芯片内部延伸到机柜和园区网络。",
      chainRole: "基础设施：支撑 GPU 集群东西向流量、低延迟互联和 800G/1.6T 光网络升级。",
      revenueMix: ["数据中心交换机或路由", "光模块和光电器件", "光纤/光网络系统", "服务和软件"],
      expenseMix: ["芯片和光电材料采购", "研发与客户认证", "制造和供应链", "销售与服务支持"],
      financials: "重点看 800G/1.6T 出货、云客户订单、毛利率、客户集中度和库存。",
      watch: "跟踪以太网 AI 网络、CPO/硅光、云厂商网络 CapEx 和大客户认证节奏。",
    },
    "AI 存储与数据层": {
      business: "提供 NAND、HDD、SSD、企业存储和数据平台，训练数据、检索增强、数据湖和归档需求会随着 AI 使用量扩大。",
      chainRole: "基础设施 / 数据层：承接训练数据、推理缓存、企业数据湖和冷数据归档。",
      revenueMix: ["HDD 或 NAND/SSD", "企业级存储", "数据平台或存储控制器", "云和数据中心客户"],
      expenseMix: ["晶圆或盘片制造", "封装测试和材料", "研发与控制器", "库存周期成本"],
      financials: "重点看 ASP、bit 出货、云客户需求、库存和价格周期。",
      watch: "跟踪 NAND/HDD 价格、AI 数据中心容量需求、企业级 SSD 和云厂商采购。",
    },
    "网络安全": {
      business: "提供云安全、终端安全、身份、威胁检测和安全运营平台，AI 扩散会增加攻击面和防护需求。",
      chainRole: "基础设施 / 应用：企业部署 AI 前需要安全边界、数据保护和运行监控。",
      revenueMix: ["订阅和平台收入", "云安全模块", "终端或身份安全", "专业服务"],
      expenseMix: ["研发和威胁情报", "销售获客", "云基础设施", "客户成功和支持"],
      financials: "重点看 ARR、净留存、平台化收入、经营利润率和现金流。",
      watch: "跟踪大型企业合并采购、AI 安全产品采用和竞争性折扣。",
    },
    "医疗创新": {
      business: "围绕药物研发、医疗设备、手术机器人或临床流程创新，AI 主要提升发现效率、自动化和决策辅助。",
      chainRole: "应用：AI 落地到高价值、强监管、长周期的垂直行业。",
      revenueMix: ["核心药品或设备", "耗材和服务", "新适应症或系统升级", "国际市场"],
      expenseMix: ["研发和临床试验", "销售和医生教育", "制造和质量体系", "监管合规"],
      financials: "重点看收入增长、管线进展、毛利率、研发费用率和监管里程碑。",
      watch: "跟踪临床数据、获批节奏、医保/支付和新产品放量。",
    },
    "AI 应用": {
      business: "把模型能力嵌入自动驾驶、机器人、自动化或企业流程，弹性大但兑现路径差异很大。",
      chainRole: "应用：验证 AI 是否能从演示进入真实收入和生产率提升。",
      revenueMix: ["核心产品或订阅", "服务和部署", "硬件/系统收入", "长期期权业务"],
      expenseMix: ["研发和工程", "硬件供应链", "销售部署", "数据、训练和运营"],
      financials: "重点看收入兑现、毛利率、订单、现金消耗和单位经济模型。",
      watch: "跟踪商业化节奏、客户留存、监管许可和竞争壁垒。",
    },
    "空天与国防 AI": {
      business: "围绕卫星通信、遥感、发射、无人机、国防系统和军工平台，AI 主要用于自主系统、目标识别、任务规划和数据分析。",
      chainRole: "应用外延：不是 AI 算力主链，而是 AI 进入国防、太空和自主系统后的高弹性应用层。",
      revenueMix: ["政府和国防合同", "卫星/发射/空间系统", "无人机或自主系统", "数据服务和通信服务"],
      expenseMix: ["研发和工程", "制造与供应链", "发射或测试成本", "项目履约和监管合规"],
      financials: "重点看 backlog、合同转收入、现金消耗、毛利率和关键任务里程碑。",
      watch: "跟踪国防预算、NASA/政府合同、发射或任务成功率、订单转化和融资需求。",
    },
    资源品: {
      business: "提供铜、铀、黄金、油气等实物资源，受益于电气化、AI 电力需求或通胀环境。",
      chainRole: "能源 / 上游材料：为电网、数据中心和宏观对冲提供实物约束。",
      revenueMix: ["核心资源销售", "副产品", "长协或现货价格", "区域资产组合"],
      expenseMix: ["采掘和加工成本", "能源和运输", "维持性资本开支", "税费和环保成本"],
      financials: "重点看商品价格、产量、现金成本、自由现金流和资产负债表。",
      watch: "跟踪库存、供给扰动、实际利率、地缘风险和扩产项目。",
    },
  };

  const fallback = fallbackByIndustry[company.industry] || fallbackByIndustry["云平台与 AI 软件"];
  return {
    ...fallback,
    ...companyProfiles[company.symbol],
  };
}

const aiLayers = ["能源", "芯片", "基础设施", "模型", "应用"];

const aiLayerX = [8, 28, 48, 68, 96];
const aiLeafY = [10, 22, 34, 46, 62, 74, 86];

const aiLayerConfig = [
  {
    id: "energy",
    title: "能源",
    segment: "能源",
    summary: "黄仁勋五层蛋糕的底层是能源。AI 工厂首先是电力工程，约束来自发电、输配电、冷却、电网和关键资源。",
    symbols: ["GEV", "CEG", "VST", "ETN", "VRT", "PWR", "SMR", "OKLO", "FCX", "MP"],
    leaves: [
      ["power-generation", "电力供给", "核电、燃机和可再生能源共同决定 AI 数据中心能否拿到稳定电。", ["CEG", "VST", "NEE", "GEV"]],
      ["grid-buildout", "电网与输配", "变压器、开关、输配电工程和并网能力是扩容瓶颈。", ["ETN", "HUBB", "PWR", "GEV"]],
      ["cooling", "冷却与热管理", "高功率机柜推动液冷、高效制冷和楼宇控制升级。", ["VRT", "TT", "CARR", "JCI"]],
      ["backup-power", "备用电源", "AI 工厂对可靠性要求高，燃机、UPS 和电力管理需求上升。", ["GEV", "ETN", "VRT"]],
      ["nuclear-smr", "核电 / SMR", "AI 数据中心长周期用电需求强化核电、SMR 和铀链叙事。", ["CEG", "CCJ", "SMR", "OKLO", "UUUU"]],
      ["energy-materials", "能源材料", "铜、铀、稀土、铝和天然气共同支撑电力基础设施。", ["FCX", "SCCO", "CCJ", "MP", "USAR", "UUUU", "AA", "XOM"]],
    ],
  },
  {
    id: "chips",
    title: "芯片",
    segment: "芯片",
    summary: "第二层是芯片和加速计算。GPU、ASIC、CPU/IP、HBM、先进制程和封装决定 AI 算力供给。",
    symbols: ["NVDA", "AVGO", "AMD", "ARM", "INTC", "TSM", "ASML", "AMAT", "MU", "MRVL"],
    leaves: [
      ["gpu", "GPU / 加速器", "训练和推理的核心算力载体，短期仍是 AI 基建中心。", ["NVDA", "AMD"]],
      ["cpu-ip", "CPU / IP 架构", "CPU、IP 授权和异构计算底座决定服务器、端侧和自研芯片生态。", ["ARM", "AMD", "INTC", "QCOM"]],
      ["ai-asic", "AI ASIC", "云厂商定制芯片降低推理成本，也带动高速互联和先进封装。", ["AVGO", "MRVL", "GOOGL", "AMZN"]],
      ["foundry", "先进制程", "先进逻辑制程决定高端 GPU、CPU、ASIC 的供给弹性。", ["TSM", "ASML", "AMAT", "LRCX", "KLAC"]],
      ["hbm-memory", "HBM / 存储", "HBM、DRAM 和企业级 SSD 决定训练吞吐、缓存和数据管线。", ["MU", "HXSCF", "SSNLF", "NVDA", "AMD", "TSM"]],
      ["advanced-packaging", "先进封装", "CoWoS、Chiplet 和 2.5D/3D 封装把芯片、HBM 与互联集成。", ["TSM", "AMAT", "NVDA", "AMD"]],
    ],
  },
  {
    id: "infrastructure",
    title: "基础设施",
    segment: "基础设施",
    summary: "第三层是基础设施，把芯片变成可运营的 AI 工厂：数据中心、算力云、网络、光模块、存储和安全。",
    symbols: ["MSFT", "AMZN", "GOOGL", "CRWV", "NBIS", "ANET", "VRT", "PANW", "CRWD", "COHR", "AAOI"],
    leaves: [
      ["ai-datacenter", "AI 数据中心", "机柜、供电、散热、调度和运营能力决定算力能否交付。", ["VRT", "ETN", "GEV", "MSFT", "AMZN", "GOOGL"]],
      ["cloud-platform", "云平台", "云厂商把算力、模型、数据和企业客户整合成平台。", ["MSFT", "AMZN", "GOOGL", "ORCL"]],
      ["ai-cloud", "AI 算力云", "GPU 云、HPC 托管和矿场转 AI 承接外溢算力需求，但融资和利用率风险更高。", ["CRWV", "NBIS", "IREN", "CORZ", "WULF", "CIFR"]],
      ["networking", "网络与互联", "训练集群瓶颈从单卡转向东西向流量和低延迟网络。", ["ANET", "AVGO", "NVDA", "MRVL", "CSCO", "CIEN"]],
      ["optical-communication", "光模块 / 光通信", "800G、1.6T、硅光和光电器件是 AI 集群互联扩容的关键。", ["LITE", "COHR", "AAOI", "GLW", "CIEN", "NOK"]],
      ["storage-data", "存储与数据层", "数据湖、向量库、企业存储和冷数据归档支撑模型落地。", ["SNOW", "WDC", "STX", "SNDK", "AMZN", "MSFT", "GOOGL"]],
      ["security-ops", "安全与运维", "身份、云安全、终端安全和可观测性成为企业 AI 上线前提。", ["PANW", "CRWD", "DDOG", "MSFT"]],
    ],
  },
  {
    id: "models",
    title: "模型",
    segment: "模型",
    summary: "第四层是模型。通用大模型、垂直模型、推理优化和数据平台决定 AI 能力如何转成服务。",
    symbols: ["MSFT", "GOOGL", "AMZN", "META", "NOW", "SNOW"],
    leaves: [
      ["foundation-model", "通用大模型", "模型能力、成本曲线和生态入口决定应用扩散速度。", ["MSFT", "GOOGL", "META", "AMZN"]],
      ["inference", "推理服务", "推理成本下降会放大应用调用量和云平台收入。", ["NVDA", "AVGO", "MSFT", "GOOGL", "AMZN"]],
      ["data-model", "企业数据模型", "企业私有数据、治理和检索增强决定模型是否能进入工作流。", ["SNOW", "ORCL", "MSFT", "NOW"]],
      ["ai-agent-platform", "Agent 平台", "从聊天机器人转向能执行任务的流程代理。", ["MSFT", "NOW", "CRM", "PLTR"]],
      ["model-tooling", "模型工具链", "观测、评测、安全和部署工具是企业级 AI 的中间层。", ["DDOG", "PANW", "CRWD", "GOOGL"]],
    ],
  },
  {
    id: "applications",
    title: "应用",
    segment: "应用",
    summary: "第五层是应用。真正的经济价值来自企业工作流、医疗、机器人、自动驾驶、空天和国防等行业落地。",
    symbols: ["MSFT", "CRM", "ADBE", "PANW", "CRWD", "LLY", "ISRG", "TSLA", "AVAV", "RKLB"],
    leaves: [
      ["enterprise-app", "企业应用", "AI Copilot 和 Agent 进入 CRM、办公、ITSM、数据分析和创意流程。", ["MSFT", "CRM", "NOW", "ADBE", "PATH"]],
      ["consumer-ai", "消费者 AI 应用", "推荐、广告、搜索、创意和社交场景是 AI 应用变现的早期落点。", ["META", "GOOGL", "ADBE", "P"]],
      ["cybersecurity-app", "安全应用", "AI 带来新攻击面，也提升检测、响应和身份安全预算。", ["PANW", "CRWD", "MSFT", "DDOG"]],
      ["healthcare-ai", "医疗与生命科学", "药物研发、手术机器人和诊疗流程自动化是长期落点。", ["LLY", "ISRG", "GOOGL", "MSFT"]],
      ["robotics-industrial", "机器人与工业", "实体 AI、仓储自动化、配送机器人和工业软件把模型带进物理世界。", ["TSLA", "SYM", "SERV", "PATH", "ISRG", "GEV"]],
      ["auto-edge", "自动驾驶与边缘", "自动驾驶、端侧 AI 和边缘推理决定应用层新增算力需求。", ["TSLA", "NVDA", "ARM", "QCOM"]],
      ["space-defense", "空天 / 国防 AI", "卫星通信、遥感、发射、无人机和国防系统是 AI 应用外延，不属于算力主链。", ["ASTS", "RKLB", "LUNR", "PL", "KTOS", "AVAV", "ONDS", "LMT"]],
    ],
  },
];

const aiNodes = aiLayerConfig.flatMap((layer, layerIndex) => {
  const x = aiLayerX[layerIndex];
  return [
    {
      id: layer.id,
      title: layer.title,
      layer: layer.title,
      segment: layer.segment,
      kind: "hub",
      x,
      y: 55,
      summary: layer.summary,
      symbols: layer.symbols,
    },
    ...layer.leaves.map(([id, title, summary, symbols], leafIndex) => ({
      id,
      title,
      layer: layer.title,
      segment: layer.segment,
      kind: "leaf",
      x,
      y: aiLeafY[leafIndex],
      summary,
      symbols,
    })),
  ];
});

const aiNodeById = new Map(aiNodes.map((node) => [node.id, node]));
const aiHubByLayer = new Map(aiLayerConfig.map((layer) => [layer.title, layer.id]));
const aiLinks = [
  ...aiLayerConfig.slice(0, -1).map((layer, index) => [layer.id, aiLayerConfig[index + 1].id]),
  ...aiNodes.filter((node) => node.kind === "leaf").map((node) => [aiHubByLayer.get(node.layer), node.id]),
  ["power-generation", "ai-datacenter"],
  ["grid-buildout", "ai-datacenter"],
  ["cooling", "ai-datacenter"],
  ["gpu", "ai-datacenter"],
  ["cpu-ip", "ai-datacenter"],
  ["ai-asic", "inference"],
  ["foundry", "gpu"],
  ["foundry", "cpu-ip"],
  ["hbm-memory", "gpu"],
  ["advanced-packaging", "gpu"],
  ["ai-datacenter", "cloud-platform"],
  ["ai-cloud", "cloud-platform"],
  ["ai-cloud", "ai-datacenter"],
  ["cloud-platform", "foundation-model"],
  ["networking", "ai-datacenter"],
  ["optical-communication", "networking"],
  ["optical-communication", "ai-datacenter"],
  ["storage-data", "data-model"],
  ["storage-data", "ai-datacenter"],
  ["security-ops", "model-tooling"],
  ["foundation-model", "enterprise-app"],
  ["inference", "enterprise-app"],
  ["foundation-model", "consumer-ai"],
  ["ai-agent-platform", "enterprise-app"],
  ["data-model", "enterprise-app"],
  ["model-tooling", "cybersecurity-app"],
  ["enterprise-app", "robotics-industrial"],
  ["inference", "auto-edge"],
  ["inference", "robotics-industrial"],
  ["inference", "space-defense"],
];

const aiDeepViews = {
  semi: [
    ["能源底座", "GEV / CEG / VST / ETN / VRT / PWR 是更硬的电力与冷却底座；SMR / OKLO / CCJ / UUUU 是核电和铀链期权，弹性大但兑现慢。"],
    ["芯片供给", "NVDA / AVGO / AMD / ARM / INTC / TSM / ASML / AMAT / LRCX / KLAC / MU 是芯片层观察池，重点看 GPU、ASIC、CPU/IP、先进制程、HBM 和封装。"],
    ["基础设施", "MSFT / AMZN / GOOGL / CRWV / NBIS / IREN / CORZ / ANET / COHR / AAOI 把芯片转成云、算力租赁、网络、光模块和可运营 AI 工厂。"],
  ],
  models: [
    ["通用模型", "MSFT / GOOGL / META / AMZN 的模型能力和推理成本曲线决定应用扩散速度。"],
    ["Agent 平台", "NOW / CRM / MSFT / PLTR 代表模型进入企业流程，关键看续费、席位和工作流渗透。"],
    ["数据模型", "SNOW / ORCL / MSFT 解决企业数据治理、检索增强和私有化落地。"],
  ],
  apps: [
    ["企业与消费者应用", "MSFT / CRM / NOW / ADBE / PATH / P / META 观察 AI Copilot、Agent、推荐和创意工具是否真正进入预算与广告变现。"],
    ["安全应用", "PANW / CRWD / DDOG / MSFT 受益于 AI 带来的新攻击面、身份安全和可观测性需求。"],
    ["实体与国防 AI", "LLY / ISRG / TSLA / SYM / SERV / AVAV / KTOS / RKLB 是医疗、机器人、自动驾驶、无人机、空天和国防方向的应用层候选。"],
  ],
};

const semiCompanyDirectory = Object.fromEntries(
  [
    candidate("SNPS", "Synopsys", "EDA/IP", "全球龙头", "EDA 软件、IP 和验证工具龙头，先进制程设计复杂度越高，工具链粘性越强。", 82),
    candidate("CDNS", "Cadence Design Systems", "EDA/IP", "全球龙头", "数字/模拟设计、验证、仿真和系统分析工具龙头，受益 AI 芯片和先进封装设计复杂度。", 81),
    candidate("ARM", "Arm Holdings", "EDA/IP", "IP 平台", "CPU IP 授权平台，覆盖手机、服务器、汽车和边缘 AI。", 78),
    candidate("ANSS", "Ansys", "EDA/IP", "系统仿真", "多物理场仿真和系统级验证工具，可补足芯片、封装和热管理验证。", 74),
    candidate("ASML", "ASML Holding", "设备", "绝对龙头", "EUV/DUV 光刻设备全球核心供应商，是先进逻辑和高端存储扩产的关键瓶颈。", 84),
    candidate("AMAT", "Applied Materials", "设备", "全球龙头", "薄膜沉积、刻蚀、离子注入和材料工程平台覆盖面广，受益先进逻辑和存储资本开支。", 80),
    candidate("LRCX", "Lam Research", "设备", "全球龙头", "刻蚀和薄膜设备龙头，存储、HBM 和先进逻辑工艺升级直接受益。", 80),
    candidate("KLAC", "KLA", "设备", "全球龙头", "量测检测设备龙头，制程越先进，良率爬坡和过程控制价值越高。", 82),
    candidate("TOELY", "Tokyo Electron", "设备", "全球龙头", "涂胶显影、刻蚀、沉积和清洗设备覆盖广，是日本设备链代表。", 77),
    candidate("TER", "Teradyne", "封装测试", "测试设备", "自动测试设备供应商，覆盖 SoC、存储和系统级测试。", 75),
    candidate("ATEYY", "Advantest", "封装测试", "测试设备", "高端半导体测试设备龙头，AI/HPC 芯片和 HBM 测试复杂度提升受益。", 77),
    candidate("ENTG", "Entegris", "材料", "关键材料", "半导体材料、过滤和化学品供应商，先进制程对纯度和污染控制要求提升。", 74),
    candidate("WFRD", "Silicon Wafer Basket", "材料", "材料篮子", "硅片、光刻胶、电子特气和 CMP 材料共同决定晶圆厂稳定生产。", 68),
    candidate("LIN", "Linde", "材料", "电子特气", "工业气体和电子特气供应商，晶圆厂扩产带动高纯气体需求。", 72),
    candidate("DD", "DuPont", "材料", "电子材料", "电子材料、CMP、封装和互连材料供应商，受益先进封装和制程材料升级。", 70),
    candidate("TSM", "Taiwan Semiconductor Manufacturing", "晶圆制造", "全球龙头", "先进逻辑代工龙头，AI GPU、ASIC、CPU 和高端手机芯片核心制造平台。", 86),
    candidate("SSNLF", "Samsung Electronics", "晶圆制造", "IDM / 存储龙头", "先进逻辑、存储、HBM 和封装均有布局，是台积电之外的重要全栈玩家。", 78),
    candidate("INTC", "Intel", "晶圆制造", "IDM / 代工转型", "CPU、先进封装和晶圆代工转型并行，关键看制程追赶和代工客户。", 70),
    candidate("UMC", "UMC", "晶圆制造", "成熟制程", "成熟制程代工龙头，汽车、工业、模拟和电源管理需求相关。", 70),
    candidate("GFS", "GlobalFoundries", "晶圆制造", "特色工艺", "特色工艺和成熟制程代工平台，面向汽车、通信和工业客户。", 69),
    candidate("NVDA", "NVIDIA", "芯片设计", "AI 龙头", "AI GPU、网络、系统和 CUDA 生态龙头，是先进制程和封装需求的最大牵引之一。", 88),
    candidate("AMD", "Advanced Micro Devices", "芯片设计", "AI / CPU 龙头", "CPU、GPU 和 AI 加速器平台，Chiplet 和数据中心份额是核心看点。", 77),
    candidate("AVGO", "Broadcom", "芯片设计", "ASIC / 网络龙头", "定制 ASIC、交换芯片、光互联和基础设施软件结合，受益云厂商自研芯片。", 81),
    candidate("QCOM", "Qualcomm", "芯片设计", "移动 / 端侧 AI", "手机 SoC、射频、汽车和端侧 AI 芯片平台，观察换机周期和 AI 手机渗透。", 74),
    candidate("MRVL", "Marvell Technology", "芯片设计", "ASIC / 互联", "定制 ASIC、光互联、存储控制器和数据中心互联芯片具备 AI 弹性。", 75),
    candidate("ALAB", "Astera Labs", "芯片设计", "高速互联", "PCIe/CXL 连接芯片供应商，AI 服务器内部高速互联升级的高弹性环节。", 73),
    candidate("CRDO", "Credo Technology", "芯片设计", "高速互联", "高速 SerDes、AEC 和光互联芯片供应商，受益数据中心网络升级。", 72),
    candidate("FN", "Fabrinet", "芯片设计", "光通信制造", "光通信和精密制造服务商，承接数据中心光模块和硅光供应链需求。", 71),
    candidate("TXN", "Texas Instruments", "芯片设计", "模拟龙头", "模拟和嵌入式芯片龙头，工业、汽车和电源管理需求代表。", 72),
    candidate("ADI", "Analog Devices", "芯片设计", "模拟龙头", "高性能模拟、混合信号和电源管理芯片，汽车和工业周期相关。", 72),
    candidate("NXPI", "NXP Semiconductors", "芯片设计", "汽车半导体", "汽车 MCU、雷达、连接和安全芯片供应商，跟踪汽车电子周期。", 71),
    candidate("ON", "ON Semiconductor", "芯片设计", "功率半导体", "功率器件和图像传感器供应商，电动车、工业和能源转型相关。", 69),
    candidate("HXSCF", "SK Hynix", "存储", "HBM 龙头", "DRAM/HBM 龙头之一，AI 训练和高端 GPU 显存需求直接受益。", 83),
    candidate("MU", "Micron Technology", "存储", "HBM / DRAM 龙头", "DRAM、NAND 和 HBM 供应商，AI 数据中心带来周期弹性。", 79),
    candidate("WDC", "Western Digital", "存储", "NAND / SSD", "NAND、硬盘和企业存储供应商，数据增长和存储价格周期相关。", 70),
    candidate("SNDK", "SanDisk", "存储", "NAND / 闪存", "独立闪存平台，NAND 价格周期、企业 SSD 和数据中心存储是跟踪重点。", 68),
    candidate("STX", "Seagate", "存储", "HDD 龙头", "HDD 和大容量存储龙头，云数据中心冷数据和训练数据归档带来容量需求。", 69),
    candidate("SIMO", "Silicon Motion", "存储", "控制器", "NAND 控制器供应商，消费和企业级 SSD 周期相关。", 68),
    candidate("ASX", "ASE Technology", "封装测试", "OSAT 龙头", "全球封测龙头，先进封装、系统级封装和测试需求提升受益。", 74),
    candidate("AMKR", "Amkor Technology", "封装测试", "OSAT 龙头", "封装测试服务商，汽车、先进封装和系统级封装是跟踪重点。", 72),
    candidate("IBIDY", "Ibiden", "封装测试", "ABF 基板", "高端封装基板供应商，服务器 CPU/GPU 和先进封装需求相关。", 70),
    candidate("AAPL", "Apple", "下游应用", "终端龙头", "手机、PC、可穿戴和自研芯片生态，是先进制程最大终端需求之一。", 76),
    candidate("MSFT", "Microsoft", "下游应用", "AI 云需求", "Azure AI 资本开支拉动 GPU、网络、存储和先进制程需求。", 79),
    candidate("AMZN", "Amazon", "下游应用", "AI 云需求", "AWS 和自研芯片需求影响加速器、网络、存储和数据中心半导体。", 78),
    candidate("GOOGL", "Alphabet", "下游应用", "AI 云需求", "TPU、Google Cloud、搜索和广告 AI 需求带动先进芯片和数据中心投资。", 78),
    candidate("TSLA", "Tesla", "下游应用", "汽车 / 机器人", "自动驾驶、车载计算和机器人是端侧高算力芯片需求样本。", 69),
  ].map((company) => [company.symbol, company]),
);

const semiProfileDefaults = {
  "EDA/IP": {
    business: "提供芯片设计、验证、仿真、IP 授权和系统级分析工具，是设计公司和晶圆厂之间的前端入口。",
    chainRole: "前端设计底座：决定芯片能否完成架构、验证、物理设计和流片准备。",
    revenueMix: ["软件订阅和维护", "IP 授权和版税", "验证硬件或系统分析", "专业服务"],
    expenseMix: ["研发人员和算法平台", "云算力和验证基础设施", "销售和客户成功", "并购摊销"],
    financials: "重点看 ARR、续约率、订单 backlog、经营利润率和 AI/先进封装设计需求。",
    watch: "跟踪先进节点流片数量、AI ASIC 项目、IP 授权增长和大型客户续约。",
  },
  材料: {
    business: "提供硅片、光刻胶、电子特气、CMP、靶材和湿电子化学品，先进制程越复杂，对纯度和稳定供给要求越高。",
    chainRole: "晶圆制造耗材：影响良率、污染控制、产线稳定性和扩产节奏。",
    revenueMix: ["电子材料和化学品", "高纯气体或硅片", "过滤和污染控制", "封装与互连材料"],
    expenseMix: ["原材料和能源", "高纯制造和质量体系", "研发与客户认证", "物流和区域产能"],
    financials: "重点看晶圆厂开工率、先进制程认证进度、毛利率和库存周期。",
    watch: "跟踪台积电、三星、存储厂扩产节奏，以及关键材料供给扰动。",
  },
  设备: {
    business: "提供光刻、刻蚀、沉积、量测检测、清洗和离子注入等晶圆制造设备，是晶圆厂资本开支的核心去向。",
    chainRole: "制造能力瓶颈：决定先进制程、良率爬坡、存储扩产和封装工艺升级速度。",
    revenueMix: ["新设备销售", "服务、备件和升级", "先进逻辑客户", "存储和成熟制程客户"],
    expenseMix: ["研发和工程人员", "高精密零部件", "制造装配和服务网络", "库存与供应链"],
    financials: "重点看订单、出货、backlog、毛利率、服务收入和区域出口限制影响。",
    watch: "跟踪晶圆厂 CapEx、EUV/刻蚀/量测需求、存储复苏和中国区订单变化。",
  },
  晶圆制造: {
    business: "把设计转化为晶圆，包括先进逻辑、成熟制程、IDM 和特色工艺，核心能力是节点、良率、产能和客户结构。",
    chainRole: "芯片实物生产平台：承接 AI、手机、汽车、工业和存储需求。",
    revenueMix: ["先进逻辑代工", "成熟制程和特色工艺", "IDM 产品或代工服务", "先进封装协同"],
    expenseMix: ["设备折旧和资本开支", "材料和能源", "工艺研发和良率爬坡", "人工与厂务运维"],
    financials: "重点看产能利用率、HPC/AI 收入占比、毛利率、CapEx 和先进节点迁移。",
    watch: "跟踪 N2/N3/GAA 进展、客户集中度、地缘风险和存储周期。",
  },
  芯片设计: {
    business: "设计 GPU、CPU、ASIC、SoC、模拟、功率和互联芯片，毛利率和壁垒来自架构、软件生态和客户绑定。",
    chainRole: "需求定义者：把下游应用需求传导给 EDA、制造、存储和封装测试。",
    revenueMix: ["数据中心芯片", "移动/汽车/工业芯片", "定制 ASIC 或网络芯片", "软件和生态收入"],
    expenseMix: ["研发和软件生态", "晶圆与封装采购", "HBM/基板/测试", "销售和客户支持"],
    financials: "重点看数据中心收入、新产品爬坡、毛利率、库存和客户集中度。",
    watch: "跟踪云厂商 CapEx、AI 推理需求、先进封装供给和竞争定价。",
  },
  存储: {
    business: "提供 DRAM、HBM、NAND、SSD 和控制器，周期性强，但 AI/HPC 对高端 HBM 和企业存储形成结构性需求。",
    chainRole: "算力吞吐与数据承载：HBM 决定 AI 加速器效率，NAND/SSD 支撑数据中心存储。",
    revenueMix: ["DRAM 和 HBM", "NAND 和 SSD", "企业与数据中心存储", "移动、PC、汽车和工业存储"],
    expenseMix: ["晶圆制造折旧", "先进封装和测试", "研发与制程升级", "库存周期成本"],
    financials: "重点看 bit 出货、ASP、HBM 份额、毛利率和库存天数。",
    watch: "跟踪 HBM 认证、云客户订单、DRAM/NAND 价格和供给纪律。",
  },
  封装测试: {
    business: "提供封装、测试、基板、系统级封装和先进封装服务，把晶圆变成可交付芯片或模组。",
    chainRole: "芯片交付瓶颈：先进封装、测试和基板能力决定 AI/HPC 芯片出货。",
    revenueMix: ["封装测试服务", "先进封装和 SiP", "测试设备或服务", "基板与封装材料"],
    expenseMix: ["封测设备和折旧", "基板、材料和人工", "质量认证和良率管理", "客户项目投入"],
    financials: "重点看先进封装占比、产能利用率、测试时长、毛利率和资本开支。",
    watch: "跟踪 CoWoS/2.5D/3D 封装产能、HBM 测试需求和客户拉货节奏。",
  },
  下游应用: {
    business: "云、手机、汽车、工业和 AI 应用公司定义半导体需求，资本开支和终端销量决定上游景气。",
    chainRole: "需求侧：把 AI、消费电子、汽车电子和工业自动化需求传导到芯片链。",
    revenueMix: ["云服务或终端硬件", "广告/订阅/软件收入", "汽车或工业系统", "AI 应用和服务"],
    expenseMix: ["数据中心或供应链采购", "研发和芯片定制", "销售渠道", "内容、物流或合规"],
    financials: "重点看 CapEx、终端销量、云收入增速、库存和新产品周期。",
    watch: "跟踪 hyperscaler 资本开支、AI 手机/PC 渗透、汽车电子库存和工业订单。",
  },
};

const semiCompanyProfiles = {
  ASML: {
    business: "ASML 是全球 EUV 光刻设备核心供应商，同时提供 DUV、量测和计算光刻能力。先进逻辑和高端 DRAM/HBM 的节点迁移离不开其设备。",
    chainRole: "设备 / 光刻：EUV 供给、High-NA 节奏和服务能力决定先进制程扩产速度。",
    revenueMix: ["EUV 系统", "DUV 系统", "Installed Base 管理和服务", "量测与计算光刻"],
    expenseMix: ["研发和供应链协同", "高精密零部件采购", "装配和客户现场服务", "库存与交付周期管理"],
    financials: "重点看订单、backlog、EUV 出货、High-NA 采用和中国区 DUV 需求变化。",
    watch: "跟踪台积电/三星/英特尔 CapEx、出口管制、High-NA 客户验收和服务收入占比。",
  },
  TSM: {
    business: "台积电是先进逻辑代工核心平台，承接 AI GPU、ASIC、CPU、手机 SoC 和先进封装需求。",
    chainRole: "晶圆制造 / 先进逻辑：先进制程、CoWoS 和客户迁移节奏决定 AI 芯片交付。",
    revenueMix: ["HPC/AI", "智能手机", "IoT、汽车和消费", "先进封装服务"],
    expenseMix: ["先进设备折旧", "材料和能源", "工艺研发与良率爬坡", "厂务和区域扩产"],
    financials: "重点看 HPC 占比、毛利率、N2/N3 进展、CoWoS 产能和 CapEx 指引。",
    watch: "跟踪 AI 客户订单、先进封装扩产、地缘风险和美元/台币汇率影响。",
  },
  NVDA: {
    business: "NVIDIA 提供 AI GPU、网络、系统级机柜和 CUDA 软件生态，是 AI 半导体需求的核心牵引者。",
    chainRole: "芯片设计 / AI 加速器：定义先进制程、HBM、封装、网络和测试需求。",
    revenueMix: ["数据中心 GPU 和系统", "网络与互联", "游戏 GPU", "专业可视化、汽车和机器人"],
    expenseMix: ["晶圆、HBM 和封装采购", "研发和软件生态", "供应链锁产能", "渠道和客户支持"],
    financials: "重点看数据中心收入、毛利率、Blackwell/后续平台爬坡、推理占比和客户集中度。",
    watch: "跟踪云厂商 CapEx、HBM/CoWoS 供给、竞品 ASIC 和出口限制。",
  },
  SNPS: {
    business: "Synopsys 覆盖数字设计、验证、IP、软件安全和 EDA 自动化，是先进芯片设计前端的关键平台。",
    chainRole: "EDA/IP：设计复杂度、AI ASIC 项目和先进封装共同推高工具需求。",
    revenueMix: ["EDA 软件订阅", "IP 授权和版税", "验证硬件", "软件安全和服务"],
    expenseMix: ["研发人员", "云和验证基础设施", "销售和客户成功", "并购摊销"],
    financials: "重点看 ARR、backlog、经营利润率、IP 增速和大客户续约。",
    watch: "跟踪 AI 芯片流片数量、先进节点迁移和 Ansys 并购整合。",
  },
  CDNS: {
    business: "Cadence 提供数字/模拟设计、验证、仿真、系统分析和硬件验证平台，客户覆盖芯片设计、系统厂和晶圆厂。",
    chainRole: "EDA/IP：验证和系统级仿真能力对 AI/HPC、封装和热设计越来越重要。",
    revenueMix: ["EDA 软件订阅", "验证硬件", "IP 和系统分析", "服务"],
    expenseMix: ["研发和算法平台", "销售渠道", "云和硬件验证投入", "并购整合"],
    financials: "重点看经常性收入、订单能见度、硬件验证需求和经营杠杆。",
    watch: "跟踪 AI 设计工具采用、封装系统分析需求和大客户续约周期。",
  },
  AMAT: {
    business: "Applied Materials 是材料工程设备平台，覆盖薄膜沉积、刻蚀、离子注入、CMP 和过程控制等多类设备。",
    chainRole: "设备 / 材料工程：先进逻辑、存储、HBM 和封装工艺升级带来设备需求。",
    revenueMix: ["半导体系统", "应用全球服务", "显示和相邻市场", "先进封装相关设备"],
    expenseMix: ["研发与工程", "高精密零部件", "服务网络和库存", "制造和供应链"],
    financials: "重点看订单、服务收入、毛利率、中国区收入和先进封装/存储复苏。",
    watch: "跟踪晶圆厂 CapEx、存储周期、出口限制和新材料工艺渗透。",
  },
  LRCX: {
    business: "Lam Research 是刻蚀和沉积设备龙头，存储、先进逻辑和先进封装工艺都需要更复杂的刻蚀能力。",
    chainRole: "设备 / 刻蚀沉积：高纵深结构、3D NAND、HBM 和先进逻辑提升刻蚀价值量。",
    revenueMix: ["刻蚀设备", "沉积设备", "客户支持和备件", "存储与逻辑客户"],
    expenseMix: ["研发和工艺工程", "精密零部件", "服务交付", "库存和供应链"],
    financials: "重点看存储客户 CapEx、订单、服务收入和毛利率。",
    watch: "跟踪 DRAM/HBM 扩产、3D NAND 恢复和中国区限制影响。",
  },
  KLAC: {
    business: "KLA 是半导体过程控制龙头，提供检测、量测和良率管理设备，节点越先进越依赖过程控制。",
    chainRole: "设备 / 量测检测：良率爬坡和缺陷控制决定先进制程经济性。",
    revenueMix: ["过程控制系统", "服务收入", "先进逻辑客户", "存储和封装客户"],
    expenseMix: ["研发和光学/电子零部件", "制造装配", "服务网络", "供应链和库存"],
    financials: "重点看订单、服务收入、毛利率和先进节点客户需求。",
    watch: "跟踪先进制程良率压力、出口限制和客户资本开支结构。",
  },
  MU: {
    business: "Micron 提供 DRAM、NAND 和 HBM，AI 服务器高端内存需求让存储周期出现结构性弹性。",
    chainRole: "存储 / HBM：HBM 和服务器 DRAM 决定 AI 加速器吞吐和系统配置。",
    revenueMix: ["DRAM", "NAND", "HBM 和数据中心内存", "移动、PC、汽车和工业存储"],
    expenseMix: ["晶圆制造折旧", "封装测试", "研发与制程升级", "库存周期成本"],
    financials: "重点看 HBM 订单、ASP、bit 出货、毛利率和库存去化。",
    watch: "跟踪 HBM 认证进度、云客户需求、DRAM/NAND 价格和资本开支纪律。",
  },
  HXSCF: {
    business: "SK Hynix 是 DRAM/HBM 龙头，高端 HBM 供给与 AI GPU 平台绑定度高。",
    chainRole: "存储 / HBM：HBM3E/后续产品决定 AI 芯片系统性能和供给弹性。",
    revenueMix: ["DRAM 和 HBM", "NAND", "企业存储", "移动和 PC 存储"],
    expenseMix: ["晶圆厂折旧", "先进封装和 TSV", "研发和良率爬坡", "材料和测试"],
    financials: "重点看 HBM 份额、毛利率、价格周期和客户认证。",
    watch: "跟踪 NVIDIA/云客户需求、HBM 产能扩张和竞争份额变化。",
  },
  ASX: {
    business: "ASE 是全球封测龙头，提供传统封装、先进封装、系统级封装和测试服务。",
    chainRole: "封装测试 / OSAT：把晶圆转成可交付芯片，先进封装和测试复杂度提升带来价值量。",
    revenueMix: ["封装服务", "测试服务", "EMS 和系统级封装", "汽车和通信客户"],
    expenseMix: ["封测设备折旧", "基板和材料", "人工与厂务", "质量认证和客户项目"],
    financials: "重点看产能利用率、先进封装占比、毛利率和客户拉货。",
    watch: "跟踪 AI/HPC 封装需求、手机周期和车规订单。",
  },
  AMKR: {
    business: "Amkor 提供外包封装测试服务，客户覆盖通信、汽车、计算和消费电子。",
    chainRole: "封装测试 / OSAT：系统级封装和先进封装需求提升其战略位置。",
    revenueMix: ["先进封装", "传统封装", "测试服务", "汽车和通信客户"],
    expenseMix: ["封测设备", "材料和基板", "人工", "客户认证和区域产能"],
    financials: "重点看利用率、毛利率、资本开支和汽车/先进封装收入。",
    watch: "跟踪大客户项目、手机库存和先进封装扩产。",
  },
};

const semiLayers = ["EDA/IP", "材料", "设备", "晶圆制造", "芯片设计", "存储", "封装测试", "下游应用"];
const semiLayerX = [6, 18.5, 31, 43.5, 56, 68.5, 80, 97];
const semiLeafY = [13, 25, 37, 49, 72, 84];

const semiLayerConfig = [
  {
    id: "semi-eda-ip",
    title: "EDA/IP",
    summary: "芯片设计从工具和 IP 开始。EDA 订阅、IP 授权、验证仿真和系统分析决定流片效率。",
    symbols: ["SNPS", "CDNS", "ARM", "ANSS"],
    leaves: [
      ["eda-software", "EDA 软件", "数字设计、物理实现、时序、功耗和验证工具。", ["SNPS", "CDNS"]],
      ["ip-cores", "IP 授权", "CPU、接口、SerDes、存储控制器和基础模块授权。", ["ARM", "SNPS", "CDNS"]],
      ["verification", "验证仿真", "仿真、形式验证、硬件仿真和系统级验证。", ["SNPS", "CDNS", "ANSS"]],
      ["system-analysis", "系统分析", "热、电磁、封装和多物理场仿真。", ["ANSS", "CDNS", "SNPS"]],
    ],
  },
  {
    id: "semi-materials",
    title: "材料",
    summary: "材料是晶圆厂的稳定供给底座，核心在纯度、认证周期、区域供应和先进制程适配。",
    symbols: ["ENTG", "LIN", "DD", "WFRD"],
    leaves: [
      ["silicon-wafer", "硅片", "晶圆制造基础载体，尺寸、缺陷率和供给稳定性影响产线。", ["WFRD", "ENTG"]],
      ["photoresist", "光刻胶", "光刻工艺关键材料，先进节点需要长期认证。", ["WFRD", "DD"]],
      ["electronic-gas", "电子特气", "高纯气体用于沉积、刻蚀、清洗和工艺环境。", ["LIN", "ENTG"]],
      ["cmp-materials", "CMP 材料", "化学机械抛光材料影响平坦化和良率。", ["ENTG", "DD"]],
      ["wet-chemicals", "湿电子化学品", "清洗、蚀刻、显影和污染控制材料。", ["ENTG", "DD", "LIN"]],
    ],
  },
  {
    id: "semi-equipment",
    title: "设备",
    summary: "设备决定制造能力。光刻、刻蚀、沉积、量测检测和测试设备是晶圆厂资本开支的核心。",
    symbols: ["ASML", "AMAT", "LRCX", "KLAC", "TOELY", "TER", "ATEYY"],
    leaves: [
      ["lithography", "光刻", "EUV/DUV 光刻决定图形转移和先进节点推进。", ["ASML", "TOELY"]],
      ["etch", "刻蚀", "高深宽比结构、逻辑和存储工艺都依赖刻蚀能力。", ["LRCX", "AMAT", "TOELY"]],
      ["deposition", "薄膜沉积", "CVD/PVD/ALD 等沉积工艺决定材料堆叠和性能。", ["AMAT", "LRCX", "TOELY"]],
      ["metrology", "量测检测", "缺陷检测和过程控制决定良率爬坡速度。", ["KLAC", "ASML"]],
      ["test-equipment", "测试设备", "SoC、存储、HPC 和系统级测试复杂度提升。", ["TER", "ATEYY"]],
    ],
  },
  {
    id: "semi-foundry",
    title: "晶圆制造",
    summary: "制造端把设计转成晶圆，核心变量是节点、良率、产能利用率、客户结构和资本开支。",
    symbols: ["TSM", "SSNLF", "INTC", "UMC", "GFS"],
    leaves: [
      ["advanced-foundry", "先进逻辑代工", "AI GPU、ASIC、CPU 和手机 SoC 的高端制程平台。", ["TSM", "SSNLF", "INTC"]],
      ["mature-foundry", "成熟制程", "汽车、工业、模拟和电源管理芯片的制造底座。", ["UMC", "GFS", "TSM"]],
      ["idm-manufacturing", "IDM", "设计和制造一体化，覆盖 CPU、存储、模拟和功率。", ["INTC", "SSNLF", "TXN", "ADI"]],
      ["power-analog-fab", "功率 / 模拟制造", "汽车、工业和电源管理需求相关。", ["TXN", "ADI", "ON", "NXPI"]],
    ],
  },
  {
    id: "semi-chip-design",
    title: "芯片设计",
    summary: "设计公司定义需求，AI、手机、汽车、工业和网络芯片把下游景气传导到制造、封装和材料。",
    symbols: ["NVDA", "AMD", "AVGO", "QCOM", "MRVL", "ARM", "ALAB", "CRDO", "FN", "TXN", "ADI", "NXPI", "ON"],
    leaves: [
      ["gpu-ai", "GPU / AI 加速器", "训练和推理算力核心，带动先进制程、HBM 和封装。", ["NVDA", "AMD"]],
      ["custom-asic", "ASIC / 网络芯片", "云厂商定制芯片、交换芯片和高速互联。", ["AVGO", "MRVL", "ALAB", "CRDO", "FN"]],
      ["mobile-soc", "手机 SoC / 端侧 AI", "手机、PC 和边缘设备的本地推理平台。", ["QCOM", "AAPL", "ARM"]],
      ["analog-power", "模拟 / 功率", "工业、汽车、电源管理和传感场景。", ["TXN", "ADI", "ON", "NXPI"]],
      ["cpu-architecture", "CPU / 架构", "服务器、PC 和边缘计算 CPU 及 IP 平台。", ["ARM", "INTC", "AMD"]],
    ],
  },
  {
    id: "semi-memory",
    title: "存储",
    summary: "存储既是周期品也是 AI 硬约束。HBM 决定 AI 加速器效率，NAND/SSD 支撑数据增长。",
    symbols: ["HXSCF", "MU", "SSNLF", "WDC", "SNDK", "STX", "SIMO", "MRVL"],
    leaves: [
      ["memory-hbm", "HBM", "高带宽内存是 AI GPU 和 HPC 系统关键瓶颈。", ["HXSCF", "MU", "SSNLF"]],
      ["memory-dram", "DRAM", "服务器、PC、手机和汽车通用内存，周期弹性明显。", ["MU", "HXSCF", "SSNLF"]],
      ["memory-nand", "NAND / 闪存", "企业 SSD、手机和数据存储需求相关。", ["SSNLF", "WDC", "SNDK", "MU"]],
      ["hdd-storage", "HDD / 大容量存储", "训练数据、视频、日志和冷数据归档支撑云数据中心容量需求。", ["STX", "WDC"]],
      ["ssd-controller", "控制器 / SSD", "NAND 控制器和企业 SSD 影响存储系统性能。", ["SIMO", "MRVL", "WDC", "SNDK"]],
    ],
  },
  {
    id: "semi-packaging-test",
    title: "封装测试",
    summary: "先进封装和测试把晶圆变成可交付芯片。AI/HPC 推高 2.5D/3D、基板和测试价值量。",
    symbols: ["ASX", "AMKR", "IBIDY", "TER", "ATEYY", "TSM"],
    leaves: [
      ["osat", "OSAT", "外包封装测试服务，覆盖传统封装和系统级封装。", ["ASX", "AMKR"]],
      ["advanced-packaging-semi", "先进封装", "CoWoS、2.5D/3D、Chiplet 和 HBM 集成能力。", ["TSM", "ASX", "AMKR"]],
      ["package-substrate", "封装基板", "ABF 等高端基板是 HPC 芯片封装关键材料。", ["IBIDY", "ASX"]],
      ["ate-test", "ATE 测试", "高端 SoC、存储和系统级测试复杂度提升。", ["TER", "ATEYY"]],
    ],
  },
  {
    id: "semi-applications",
    title: "下游应用",
    summary: "下游应用决定需求弹性。云 AI、手机、汽车、工业和机器人把订单传导到芯片链。",
    symbols: ["MSFT", "AMZN", "GOOGL", "AAPL", "TSLA", "NVDA", "QCOM", "CRWV", "NBIS"],
    leaves: [
      ["ai-datacenter-demand", "AI 数据中心", "云厂商和 AI 算力云 CapEx 拉动 GPU、ASIC、网络、存储和电源芯片。", ["MSFT", "AMZN", "GOOGL", "CRWV", "NBIS", "NVDA"]],
      ["consumer-device", "手机 / 消费", "手机、PC 和可穿戴周期决定先进制程和端侧 AI 芯片需求。", ["AAPL", "QCOM", "SSNLF"]],
      ["auto-electronics", "汽车电子", "智能驾驶、电动化和座舱推动 MCU、功率和传感器需求。", ["TSLA", "NXPI", "ON", "QCOM"]],
      ["industrial-iot", "工业 / IoT", "工业自动化、电源管理和边缘计算需求。", ["TXN", "ADI", "INTC", "ARM"]],
    ],
  },
];

const semiNodes = semiLayerConfig.flatMap((layer, layerIndex) => {
  const x = semiLayerX[layerIndex];
  return [
    {
      id: layer.id,
      title: layer.title,
      layer: layer.title,
      segment: layer.title,
      kind: "hub",
      x,
      y: 60,
      summary: layer.summary,
      symbols: layer.symbols,
    },
    ...layer.leaves.map(([id, title, summary, symbols], leafIndex) => ({
      id,
      title,
      layer: layer.title,
      segment: layer.title,
      kind: "leaf",
      x,
      y: semiLeafY[leafIndex],
      summary,
      symbols,
    })),
  ];
});

const semiNodeById = new Map(semiNodes.map((node) => [node.id, node]));
const semiHubByLayer = new Map(semiLayerConfig.map((layer) => [layer.title, layer.id]));
const semiLinks = [
  ...semiLayerConfig.slice(0, -1).map((layer, index) => [layer.id, semiLayerConfig[index + 1].id]),
  ...semiNodes.filter((node) => node.kind === "leaf").map((node) => [semiHubByLayer.get(node.layer), node.id]),
  ["eda-software", "gpu-ai"],
  ["ip-cores", "cpu-architecture"],
  ["verification", "custom-asic"],
  ["silicon-wafer", "advanced-foundry"],
  ["photoresist", "lithography"],
  ["electronic-gas", "etch"],
  ["cmp-materials", "advanced-foundry"],
  ["lithography", "advanced-foundry"],
  ["etch", "advanced-foundry"],
  ["deposition", "advanced-foundry"],
  ["metrology", "advanced-foundry"],
  ["advanced-foundry", "gpu-ai"],
  ["advanced-foundry", "custom-asic"],
  ["advanced-foundry", "mobile-soc"],
  ["gpu-ai", "memory-hbm"],
  ["custom-asic", "ai-datacenter-demand"],
  ["custom-asic", "ate-test"],
  ["memory-hbm", "advanced-packaging-semi"],
  ["memory-dram", "ai-datacenter-demand"],
  ["memory-nand", "ai-datacenter-demand"],
  ["hdd-storage", "ai-datacenter-demand"],
  ["advanced-packaging-semi", "gpu-ai"],
  ["package-substrate", "advanced-packaging-semi"],
  ["ate-test", "custom-asic"],
  ["ai-datacenter-demand", "gpu-ai"],
  ["consumer-device", "mobile-soc"],
  ["auto-electronics", "analog-power"],
  ["industrial-iot", "analog-power"],
];

const semiDeepViews = {
  front: [
    ["设计入口", "SNPS / CDNS / ARM 决定芯片能否完成架构、验证、物理设计和 IP 复用，AI ASIC 项目越多，EDA/IP 粘性越强。"],
    ["算力与互联设计", "NVDA / AMD / AVGO / MRVL / ALAB / CRDO / FN 是 AI 加速器、定制 ASIC、网络芯片和高速互联观察池。"],
    ["端侧与模拟", "QCOM / ARM / TXN / ADI / NXPI / ON 代表手机、汽车、工业和电源管理芯片需求。"],
  ],
  manufacturing: [
    ["制造瓶颈", "TSM / Samsung / INTC / UMC / GFS 代表先进逻辑、IDM、成熟制程和特色工艺平台。"],
    ["设备杠杆", "ASML / AMAT / LRCX / KLAC / Tokyo Electron 是晶圆厂 CapEx 的核心受益环节。"],
    ["材料底座", "ENTG / LIN / DuPont / 硅片篮子代表高纯材料、电子特气、CMP 和湿电子化学品。"],
  ],
  market: [
    ["存储约束", "SK Hynix / MU / Samsung / WDC / SNDK / STX / SIMO 对应 HBM、DRAM、NAND、HDD 和 SSD 控制器。"],
    ["封测交付", "ASE / Amkor / Teradyne / Advantest / Ibiden 代表先进封装、OSAT、测试设备和基板。"],
    ["需求侧", "MSFT / AMZN / GOOGL / CRWV / NBIS / AAPL / TSLA 把云 AI、AI 算力云、手机、汽车和工业需求传导到整条半导体链。"],
  ],
};

const semiGlossaryGroups = {
  "EDA/IP": [
    ["RTL", "寄存器传输级设计描述，是数字芯片设计的重要抽象层。"],
    ["IP 核", "可复用的设计模块，例如 CPU、SerDes、PCIe、DDR 控制器。"],
    ["Tape-out", "芯片设计完成并提交晶圆厂制造的关键节点。"],
    ["DFM", "面向制造的设计，用来降低制造风险并提升良率。"],
    ["形式验证", "用数学方法证明设计逻辑满足规格，降低高复杂度芯片错误率。"],
  ],
  材料: [
    ["硅片", "晶圆制造基础载体，尺寸、缺陷和供给稳定性会影响产线。"],
    ["光刻胶", "接受曝光并形成图形的关键化学材料。"],
    ["电子特气", "晶圆制造所需高纯气体，常用于沉积、刻蚀和清洗。"],
    ["CMP slurry", "化学机械抛光浆料，用于晶圆表面平坦化。"],
    ["湿电子化学品", "用于清洗、蚀刻、显影等环节的高纯化学品。"],
  ],
  设备: [
    ["EUV", "极紫外光刻，是先进逻辑制程的关键设备能力。"],
    ["DUV", "深紫外光刻，仍广泛用于成熟制程和部分先进层。"],
    ["刻蚀", "按图形移除材料，先进结构对刻蚀精度要求极高。"],
    ["薄膜沉积", "在晶圆表面形成材料薄膜，包括 CVD、PVD、ALD 等。"],
    ["量测检测", "发现缺陷、测量关键尺寸和支持良率爬坡的过程控制。"],
  ],
  晶圆制造: [
    ["Foundry", "晶圆代工厂，为设计公司制造芯片。"],
    ["IDM", "设计与制造一体化公司，例如 Intel、Samsung、TI。"],
    ["制程节点", "描述晶体管世代和工艺能力，先进节点通常资本开支更高。"],
    ["良率", "合格芯片占比，直接影响成本和供给。"],
    ["产能利用率", "晶圆厂产线使用程度，影响毛利率和设备材料需求。"],
  ],
  芯片设计: [
    ["GPU", "并行计算芯片，是 AI 训练和推理的重要算力载体。"],
    ["ASIC", "面向特定用途定制的芯片，云厂商常用于降低推理成本。"],
    ["SoC", "系统级芯片，把 CPU、GPU、NPU、接口等集成在一颗芯片中。"],
    ["SerDes", "高速串并转换接口，是网络和 AI 互联的重要模块。"],
    ["CXL", "面向服务器内存扩展和设备互联的高速协议，AI 服务器架构升级会提升重要性。"],
    ["AEC", "有源电缆和相关芯片方案，用于短距高速数据中心互联。"],
    ["Chiplet", "把多个芯粒封装成一个系统，提高设计弹性和良率。"],
  ],
  存储: [
    ["HBM", "高带宽内存，通过先进封装靠近 GPU，决定 AI 芯片吞吐。"],
    ["DRAM", "动态随机存取存储器，服务器、PC、手机和汽车广泛使用。"],
    ["NAND", "非易失存储，常用于 SSD 和数据存储。"],
    ["HDD", "大容量硬盘，云数据中心冷数据、训练数据归档和视频数据仍大量使用。"],
    ["DDR5", "新一代服务器和 PC 内存规格，带宽和能效提升。"],
    ["SSD 控制器", "管理 NAND 读写、纠错和性能的核心芯片。"],
  ],
  封装测试: [
    ["OSAT", "外包封装测试厂，为芯片公司提供封装和测试服务。"],
    ["CoWoS", "台积电先进封装方案，用于 GPU 与 HBM 集成。"],
    ["TSV", "硅通孔，用于 3D 堆叠和 HBM 等先进封装。"],
    ["ABF 基板", "高端芯片封装基板，HPC 芯片需求的重要瓶颈。"],
    ["ATE", "自动测试设备，用于芯片功能和性能测试。"],
  ],
  下游应用: [
    ["Hyperscaler", "大型云厂商，如 Microsoft、Amazon、Google，是 AI 芯片需求核心。"],
    ["AI Server", "用于训练或推理的高功率服务器，拉动 GPU、HBM、网络和电源。"],
    ["AI Phone", "具备端侧 AI 能力的手机，影响 SoC、内存和传感器需求。"],
    ["汽车电子", "智能驾驶、电动化和座舱电子带动 MCU、功率和传感器。"],
    ["工业 IoT", "工业自动化和边缘计算场景，偏模拟、MCU 和连接芯片。"],
  ],
};

async function loadData() {
  if (window.__MARKET_DATA__) {
    return window.__MARKET_DATA__;
  }
  const response = await fetch("./data/market.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`数据读取失败：${response.status}`);
  return response.json();
}

function formatDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function pct(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatter.format(value)}%`;
}

function number(value, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return `${formatter.format(value)}${suffix}`;
}

function optionList(values) {
  return ["全部", ...Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "zh-CN"))];
}

function heatWindowKey() {
  return state.filters.heatWindow === "all" ? "today" : state.filters.heatWindow;
}

function heatLabel(windowKey) {
  return windowKey === "week" ? "本周" : "今日";
}

function emptyHeat(symbol) {
  return {
    symbol,
    score: 0,
    mentions: 0,
    posts: 0,
    comments: 0,
    upvotes: 0,
    sources: {
      reddit: { mentions: 0, posts: 0, comments: 0, upvotes: 0, topPosts: [] },
      x: { mentions: null, status: "not_configured" },
    },
  };
}

function socialWindow(windowKey) {
  return state.data.socialHeat?.windows?.[windowKey] || {
    items: {},
    leaders: [],
    summary: "暂无社媒热度数据",
  };
}

function socialHeatFor(symbol, windowKey = heatWindowKey()) {
  return socialWindow(windowKey).items?.[symbol] || emptyHeat(symbol);
}

function quoteFor(symbol) {
  return state.data.quotes?.[symbol] || {};
}

function companyBySymbol(symbol) {
  return state.data.companies.find((company) => company.symbol === symbol) || companyDirectory[symbol] || semiCompanyDirectory[symbol];
}

function semiCompanyBySymbol(symbol) {
  return semiCompanyDirectory[symbol] || state.data.companies.find((company) => company.symbol === symbol) || companyDirectory[symbol];
}

function allKnownCompanies() {
  const seen = new Set();
  return [...state.data.companies, ...Object.values(companyDirectory), ...Object.values(semiCompanyDirectory)].filter((company) => {
    if (seen.has(company.symbol)) return false;
    seen.add(company.symbol);
    return true;
  });
}

function allSemiCompanies() {
  const seen = new Set();
  return Object.values(semiCompanyDirectory).filter((company) => {
    if (seen.has(company.symbol)) return false;
    seen.add(company.symbol);
    return true;
  });
}

function scoreClass(score) {
  if (score >= 82) return "strong";
  if (score < 68) return "watch";
  return "";
}

function moveClass(value) {
  return (value ?? 0) >= 0 ? "up" : "down";
}

function changeText(quote) {
  if (!quote || quote.changePercent === undefined || quote.changePercent === null) return "--";
  return pct(quote.changePercent);
}

function enrichCompany(company) {
  const quote = quoteFor(company.symbol);
  const socialToday = socialHeatFor(company.symbol, "today");
  const socialWeek = socialHeatFor(company.symbol, "week");
  const socialCurrent = socialHeatFor(company.symbol);
  const baseScore = company.baseScore ?? 70;
  const earningsDelivery = company.earningsDelivery ?? 72;
  const valuationPercentile = company.valuationPercentile ?? 66;
  const priceChange = quote.changePercent ?? 0;
  const score = Math.round(
    baseScore +
      (earningsDelivery - 70) * 0.18 -
      Math.max(valuationPercentile - 65, 0) * 0.14 +
      Math.max(65 - valuationPercentile, 0) * 0.05 +
      Math.max(Math.min(priceChange, 6), -6) * 0.7,
  );

  return {
    ...company,
    quote,
    socialToday,
    socialWeek,
    socialCurrent,
    score: Math.max(0, Math.min(100, score)),
  };
}

function enrichSemiCompany(company) {
  const quote = quoteFor(company.symbol);
  const baseScore = company.baseScore ?? 72;
  const earningsDelivery = company.earningsDelivery ?? baseScore;
  const valuationPercentile = company.valuationPercentile ?? 66;
  const priceChange = quote.changePercent ?? 0;
  const score = Math.round(
    baseScore +
      (earningsDelivery - 70) * 0.12 -
      Math.max(valuationPercentile - 70, 0) * 0.08 +
      Math.max(Math.min(priceChange, 6), -6) * 0.5,
  );

  return {
    ...company,
    quote,
    score: Math.max(0, Math.min(100, score)),
  };
}

function strongestCompanies(limit = 5) {
  return state.data.companies
    .map(enrichCompany)
    .sort((a, b) => b.score - a.score || b.socialToday.score - a.socialToday.score)
    .slice(0, limit);
}

function hotCompanies(windowKey = "today", limit = 10) {
  const window = socialWindow(windowKey);
  const seen = new Set();
  const leaders = (window.leaders || []).map((item) => {
    seen.add(item.symbol);
    return {
      ...item,
      company: companyBySymbol(item.symbol),
      quote: quoteFor(item.symbol),
      isSocialOnly: !companyBySymbol(item.symbol),
    };
  });

  const fillers = Object.values(window.items || {})
    .filter((item) => !seen.has(item.symbol))
    .map((item) => ({
      ...item,
      name: companyBySymbol(item.symbol)?.name || item.symbol,
      topPost: item.sources?.reddit?.topPosts?.[0] || null,
      company: companyBySymbol(item.symbol),
      quote: quoteFor(item.symbol),
      isSocialOnly: !companyBySymbol(item.symbol),
    }))
    .filter((item) => item.score > 0 || Number.isFinite(item.quote?.changePercent))
    .sort((a, b) => b.score - a.score || b.mentions - a.mentions || Math.abs(b.quote?.changePercent || 0) - Math.abs(a.quote?.changePercent || 0));

  return [...leaders, ...fillers].slice(0, limit);
}

function setHeatWindow(value) {
  state.filters.heatWindow = value;
  elements.heatTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.heatWindow === value);
  });
  renderSocialHeat();
}

function setupTheme() {
  if (!elements.themeToggle) return;
  const saved = localStorage.getItem("investment-theme") || "dark";
  document.body.classList.toggle("light", saved === "light");
  elements.themeToggle.textContent = document.body.classList.contains("light") ? "切换深色" : "切换亮色";
  elements.themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("investment-theme", document.body.classList.contains("light") ? "light" : "dark");
    elements.themeToggle.textContent = document.body.classList.contains("light") ? "切换深色" : "切换亮色";
  });
}

function setupNavigation() {
  elements.navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.pageNav === elements.page);
  });

  elements.navDisclosure.forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.nextElementSibling.hidden = expanded;
    });
  });
}

function setupSearch() {
  if (!elements.siteSearchForm || !elements.siteSearch) return;
  elements.siteSearchForm.addEventListener("submit", (event) => event.preventDefault());
  elements.siteSearch.addEventListener("input", (event) => {
    state.filters.siteQuery = event.target.value.trim().toLowerCase();
    renderSiteSearch();
  });
}

function renderSiteSearch() {
  if (!elements.searchableBlocks.length) return;
  const query = state.filters.siteQuery;
  elements.searchableBlocks.forEach((block) => {
    const text = block.textContent.toLowerCase();
    const match = !query || text.includes(query);
    block.classList.toggle("search-dim", !match);
  });
}

function setupFilters(companies) {
  elements.heatTabs.forEach((button) => {
    button.addEventListener("click", () => setHeatWindow(button.dataset.heatWindow));
  });

  if (!elements.stockSearch || !elements.industry || !elements.tier || !elements.heatFilter || !elements.focus) return;
  elements.industry.innerHTML = optionList(companies.map((item) => item.industry))
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("");
  elements.tier.innerHTML = optionList(companies.map((item) => item.tier))
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("");
  elements.heatFilter.value = state.filters.companyHeat;

  elements.stockSearch.addEventListener("input", (event) => {
    state.filters.query = event.target.value.trim().toLowerCase();
    renderCompanies();
  });
  elements.industry.addEventListener("change", (event) => {
    state.filters.industry = event.target.value;
    renderCompanies();
  });
  elements.tier.addEventListener("change", (event) => {
    state.filters.tier = event.target.value;
    renderCompanies();
  });
  elements.heatFilter.addEventListener("change", (event) => {
    state.filters.companyHeat = event.target.value;
    renderCompanies();
  });
  elements.focus.addEventListener("change", (event) => {
    state.filters.focusOnly = event.target.checked;
    renderCompanies();
  });
}

function setupAiIndustry() {
  if (!elements.aiLayer || !elements.aiSearch || !elements.aiIncludeAll || !elements.aiReset) return;

  elements.aiLayer.innerHTML = ["全部层级", ...aiLayers]
    .map((layer) => `<option value="${layer}">${layer}</option>`)
    .join("");

  elements.aiSearch.addEventListener("input", (event) => {
    state.ai.query = event.target.value.trim().toLowerCase();
    renderAiIndustry();
  });

  elements.aiLayer.addEventListener("change", (event) => {
    state.ai.layer = event.target.value;
    renderAiIndustry();
  });

  elements.aiIncludeAll.addEventListener("change", (event) => {
    state.ai.includeAll = event.target.checked;
    renderAiIndustry();
  });

  elements.aiReset.addEventListener("click", () => {
    state.ai = {
      query: "",
      layer: "全部层级",
      segment: "全部",
      includeAll: true,
      selectedNode: "gpu",
    };
    elements.aiSearch.value = "";
    elements.aiLayer.value = "全部层级";
    elements.aiIncludeAll.checked = true;
    state.selectedGlossary = "芯片";
    renderAiIndustry();
    renderGlossary();
  });

  elements.aiTabs.forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(`#${button.dataset.aiScroll}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function setupSemiIndustry() {
  if (!elements.semiLayer || !elements.semiSearch || !elements.semiIncludeAll || !elements.semiReset) return;

  elements.semiLayer.innerHTML = ["全部层级", ...semiLayers]
    .map((layer) => `<option value="${layer}">${layer}</option>`)
    .join("");

  elements.semiSearch.addEventListener("input", (event) => {
    state.semi.query = event.target.value.trim().toLowerCase();
    renderSemiIndustry();
  });

  elements.semiLayer.addEventListener("change", (event) => {
    state.semi.layer = event.target.value;
    renderSemiIndustry();
  });

  elements.semiIncludeAll.addEventListener("change", (event) => {
    state.semi.includeAll = event.target.checked;
    renderSemiIndustry();
  });

  elements.semiReset.addEventListener("click", () => {
    state.semi = {
      query: "",
      layer: "全部层级",
      segment: "全部",
      includeAll: true,
      selectedNode: "semi-equipment",
    };
    elements.semiSearch.value = "";
    elements.semiLayer.value = "全部层级";
    elements.semiIncludeAll.checked = true;
    state.selectedSemiSymbol = null;
    state.selectedSemiGlossary = "设备";
    renderSemiIndustry();
    renderSemiGlossary();
  });

  elements.semiTabs.forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(`#${button.dataset.semiScroll}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function aiCompaniesFor(node) {
  return Array.from(new Set(node.symbols || []))
    .map(companyBySymbol)
    .filter(Boolean)
    .map(enrichCompany)
    .sort((a, b) => b.score - a.score || b.socialToday.score - a.socialToday.score);
}

function aiNodeMatches(node) {
  const layerMatch = state.ai.layer === "全部层级" || node.layer === state.ai.layer;
  const segmentMatch = state.ai.segment === "全部" || node.segment === state.ai.segment;
  const query = state.ai.query;
  if (!layerMatch || !segmentMatch) return false;
  if (!query) return true;

  const companies = aiCompaniesFor(node);
  const text = [
    node.title,
    node.layer,
    node.segment,
    node.summary,
    ...companies.flatMap((company) => [company.symbol, company.name, company.industry, company.logic]),
  ]
    .join(" ")
    .toLowerCase();
  return text.includes(query);
}

function glossaryKeyForNode(node) {
  if (!node) return state.selectedGlossary;
  if (node.id.includes("storage") || node.id.includes("hbm")) return "存储";
  if (node.layer === "基础设施") return node.id === "storage-data" ? "存储" : "基础设施";
  if (glossaryGroups[node.layer]) return node.layer;
  return state.selectedGlossary;
}

function renderAiIndustry() {
  if (!state.data || !elements.aiMapCanvas) return;

  const matchingNodes = aiNodes.filter(aiNodeMatches);
  const matchingIds = new Set(matchingNodes.map((node) => node.id));
  const filterActive = Boolean(state.ai.query || state.ai.layer !== "全部层级" || state.ai.segment !== "全部");
  const visibleNodes = state.ai.includeAll ? aiNodes : matchingNodes;
  const visibleIds = new Set(visibleNodes.map((node) => node.id));

  if (!visibleIds.has(state.ai.selectedNode)) {
    state.ai.selectedNode = matchingNodes[0]?.id || "gpu";
  }

  elements.aiStatGrid.innerHTML = [
    ["Layers", aiLayers.length],
    ["Nodes", aiNodes.length],
    ["Companies", new Set([...state.data.companies.map((company) => company.symbol), ...Object.keys(companyDirectory)]).size],
    ["Links", aiLinks.length],
  ]
    .map(
      ([label, value]) => `
        <div class="ai-stat">
          <span>${label}</span>
          <b>${value}</b>
        </div>
      `,
    )
    .join("");

  elements.aiSegments.innerHTML = ["全部", ...aiLayers]
    .map(
      (segment) => `
        <button class="${state.ai.segment === segment ? "active" : ""}" type="button" data-ai-segment="${segment}">
          ${segment}
        </button>
      `,
    )
    .join("");

  elements.aiSegments.querySelectorAll("[data-ai-segment]").forEach((button) => {
    button.addEventListener("click", () => {
      state.ai.segment = button.dataset.aiSegment;
      renderAiIndustry();
    });
  });

  const edgeHtml = aiLinks
    .filter(([from, to]) => visibleIds.has(from) && visibleIds.has(to))
    .map(([from, to]) => {
      const start = aiNodeById.get(from);
      const end = aiNodeById.get(to);
      const dim = filterActive && (!matchingIds.has(from) || !matchingIds.has(to));
      return `<line class="${dim ? "dim" : ""}" x1="${start.x}%" y1="${start.y}%" x2="${end.x}%" y2="${end.y}%" />`;
    })
    .join("");

  const nodeHtml = visibleNodes
    .map((node) => {
      const companies = aiCompaniesFor(node);
      const dim = filterActive && !matchingIds.has(node.id);
      const labelSide = node.x > 84 ? "left-label" : "";
      return `
        <button
          class="ai-node ${node.kind} ${labelSide} ${state.ai.selectedNode === node.id ? "active" : ""} ${dim ? "dim" : ""}"
          type="button"
          data-ai-node="${node.id}"
          style="left:${node.x}%; top:${node.y}%"
        >
          <span>${node.title}</span>
          <small>${companies.length ? `${companies.length}家公司` : "待补档案"}</small>
        </button>
      `;
    })
    .join("");

  elements.aiMapCanvas.innerHTML = `
    <span class="ai-map-count">${visibleNodes.length} nodes · ${aiLinks.length} links</span>
    <svg class="ai-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${edgeHtml}
    </svg>
    <div class="ai-node-layer">${nodeHtml}</div>
  `;

  elements.aiMapCanvas.querySelectorAll("[data-ai-node]").forEach((button) => {
    button.addEventListener("click", () => {
      state.ai.selectedNode = button.dataset.aiNode;
      state.selectedGlossary = glossaryKeyForNode(aiNodeById.get(state.ai.selectedNode));
      renderAiIndustry();
      renderGlossary();
    });
  });

  renderAiNodeSummary();
  renderAiDeepViews();
}

function renderAiNodeSummary() {
  const node = aiNodeById.get(state.ai.selectedNode) || aiNodeById.get("gpu");
  const companies = aiCompaniesFor(node);
  const connected = aiLinks.filter(([from, to]) => from === node.id || to === node.id).length;

  elements.aiNodeTitle.textContent = `${node.title} 关系卡`;
  elements.aiNodeSummary.textContent = node.summary;
  elements.aiSummaryStats.innerHTML = [
    ["层级", node.layer],
    ["连接边", connected],
    ["研究池公司", companies.length],
    ["节点类型", node.kind === "hub" ? "产业层" : "细分节点"],
  ]
    .map(
      ([label, value]) => `
        <div>
          <span>${label}</span>
          <b>${value}</b>
        </div>
      `,
    )
    .join("");

  elements.aiNodeCompanies.innerHTML = companies.length
    ? companies
        .map(
          (company) => `
            <div class="ai-company-row">
              <button class="ai-company-button" type="button" data-symbol="${company.symbol}">
                <b>${company.symbol}</b>
                <span>${company.name}</span>
                <em>${company.score}</em>
              </button>
              ${renderOfficialLink(company)}
            </div>
          `,
        )
        .join("")
    : `
      <div class="ai-empty">
        <b>公司档案待补</b>
        <span>这个节点先保留在产业链关系图里，后续可以继续补全公司池。</span>
      </div>
    `;

  elements.aiNodeCompanies.querySelectorAll("[data-symbol]").forEach((button) => {
    button.addEventListener("click", () => {
      const company = companyBySymbol(button.dataset.symbol);
      if (!company) return;
      state.selectedSymbol = company.symbol;
      renderCompanies();
      renderDetail(enrichCompany(company));
      document.querySelector("#research")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderAiDeepViews() {
  elements.aiSemiView.innerHTML = aiDeepViews.semi.map(renderAiDeepItem).join("");
  elements.aiModelView.innerHTML = aiDeepViews.models.map(renderAiDeepItem).join("");
  elements.aiAppView.innerHTML = aiDeepViews.apps.map(renderAiDeepItem).join("");
}

function renderAiDeepItem([title, text]) {
  const matched = allKnownCompanies()
    .map(enrichCompany)
    .filter((company) => text.includes(company.symbol) || text.includes(company.name))
    .slice(0, 4);
  return `
    <div class="ai-deep-item" data-searchable>
      <b>${title}</b>
      <p>${text}</p>
      ${
        matched.length
          ? `<div class="ai-mini-symbols">${matched.map((company) => `<span>${company.symbol} ${company.score}</span>`).join("")}</div>`
          : ""
      }
    </div>
  `;
}

function semiCompaniesFor(node) {
  if (!node) return [];
  return Array.from(new Set(node.symbols || []))
    .map(semiCompanyBySymbol)
    .filter(Boolean)
    .map(enrichSemiCompany)
    .sort((a, b) => b.score - a.score || a.symbol.localeCompare(b.symbol));
}

function semiNodeMatches(node) {
  const layerMatch = state.semi.layer === "全部层级" || node.layer === state.semi.layer;
  const segmentMatch = state.semi.segment === "全部" || node.segment === state.semi.segment;
  const query = state.semi.query;
  if (!layerMatch || !segmentMatch) return false;
  if (!query) return true;

  const companies = semiCompaniesFor(node);
  const text = [
    node.title,
    node.layer,
    node.segment,
    node.summary,
    ...companies.flatMap((company) => [company.symbol, company.name, company.industry, company.logic]),
  ]
    .join(" ")
    .toLowerCase();
  return text.includes(query);
}

function semiGlossaryKeyForNode(node) {
  if (!node) return state.selectedSemiGlossary;
  if (semiGlossaryGroups[node.layer]) return node.layer;
  return state.selectedSemiGlossary;
}

function semiProfileFor(company, node) {
  const fallback = semiProfileDefaults[company.industry] || semiProfileDefaults[node?.layer] || semiProfileDefaults["芯片设计"];
  return {
    ...fallback,
    ...semiCompanyProfiles[company.symbol],
  };
}

function renderSemiIndustry() {
  if (!state.data || !elements.semiMapCanvas) return;

  const matchingNodes = semiNodes.filter(semiNodeMatches);
  const matchingIds = new Set(matchingNodes.map((node) => node.id));
  const filterActive = Boolean(state.semi.query || state.semi.layer !== "全部层级" || state.semi.segment !== "全部");
  const visibleNodes = state.semi.includeAll ? semiNodes : matchingNodes;
  const visibleIds = new Set(visibleNodes.map((node) => node.id));

  if (!visibleIds.has(state.semi.selectedNode)) {
    state.semi.selectedNode = matchingNodes[0]?.id || "semi-equipment";
  }

  if (elements.semiStatGrid) {
    elements.semiStatGrid.innerHTML = [
      ["Layers", semiLayers.length],
      ["Nodes", semiNodes.length],
      ["Companies", Object.keys(semiCompanyDirectory).length],
      ["Links", semiLinks.length],
    ]
      .map(
        ([label, value]) => `
          <div class="ai-stat">
            <span>${label}</span>
            <b>${value}</b>
          </div>
        `,
      )
      .join("");
  }

  if (elements.semiSegments) {
    elements.semiSegments.innerHTML = ["全部", ...semiLayers]
      .map(
        (segment) => `
          <button class="${state.semi.segment === segment ? "active" : ""}" type="button" data-semi-segment="${segment}">
            ${segment}
          </button>
        `,
      )
      .join("");

    elements.semiSegments.querySelectorAll("[data-semi-segment]").forEach((button) => {
      button.addEventListener("click", () => {
        state.semi.segment = button.dataset.semiSegment;
        renderSemiIndustry();
      });
    });
  }

  const edgeHtml = semiLinks
    .filter(([from, to]) => visibleIds.has(from) && visibleIds.has(to))
    .map(([from, to]) => {
      const start = semiNodeById.get(from);
      const end = semiNodeById.get(to);
      if (!start || !end) return "";
      const dim = filterActive && (!matchingIds.has(from) || !matchingIds.has(to));
      return `<line class="${dim ? "dim" : ""}" x1="${start.x}%" y1="${start.y}%" x2="${end.x}%" y2="${end.y}%" />`;
    })
    .join("");

  const nodeHtml = visibleNodes
    .map((node) => {
      const companies = semiCompaniesFor(node);
      const dim = filterActive && !matchingIds.has(node.id);
      const labelSide = node.x > 88 ? "left-label" : "";
      return `
        <button
          class="ai-node semi-node ${node.kind} ${labelSide} ${state.semi.selectedNode === node.id ? "active" : ""} ${dim ? "dim" : ""}"
          type="button"
          data-semi-node="${node.id}"
          style="left:${node.x}%; top:${node.y}%"
        >
          <span>${node.title}</span>
          <small>${companies.length ? `${companies.length}家公司` : "待补档案"}</small>
        </button>
      `;
    })
    .join("");

  elements.semiMapCanvas.innerHTML = `
    <span class="ai-map-count">${visibleNodes.length} nodes · ${semiLinks.length} links</span>
    <svg class="ai-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${edgeHtml}
    </svg>
    <div class="ai-node-layer">${nodeHtml}</div>
  `;

  elements.semiMapCanvas.querySelectorAll("[data-semi-node]").forEach((button) => {
    button.addEventListener("click", () => {
      state.semi.selectedNode = button.dataset.semiNode;
      state.selectedSemiSymbol = null;
      state.selectedSemiGlossary = semiGlossaryKeyForNode(semiNodeById.get(state.semi.selectedNode));
      renderSemiIndustry();
      renderSemiGlossary();
    });
  });

  renderSemiNodeSummary();
  renderSemiDeepViews();
}

function renderSemiNodeSummary() {
  if (!elements.semiNodeTitle || !elements.semiNodeSummary || !elements.semiSummaryStats || !elements.semiNodeCompanies) return;
  const node = semiNodeById.get(state.semi.selectedNode) || semiNodeById.get("semi-equipment");
  const companies = semiCompaniesFor(node);
  const connected = semiLinks.filter(([from, to]) => from === node.id || to === node.id).length;

  elements.semiNodeTitle.textContent = `${node.title} 关系卡`;
  elements.semiNodeSummary.textContent = node.summary;
  elements.semiSummaryStats.innerHTML = [
    ["层级", node.layer],
    ["连接边", connected],
    ["研究池公司", companies.length],
    ["节点类型", node.kind === "hub" ? "产业层" : "细分节点"],
  ]
    .map(
      ([label, value]) => `
        <div>
          <span>${label}</span>
          <b>${value}</b>
        </div>
      `,
    )
    .join("");

  if (companies.length && !companies.some((company) => company.symbol === state.selectedSemiSymbol)) {
    state.selectedSemiSymbol = companies[0].symbol;
  }

  elements.semiNodeCompanies.innerHTML = companies.length
    ? companies
        .map(
          (company) => `
            <div class="ai-company-row">
              <button class="ai-company-button ${state.selectedSemiSymbol === company.symbol ? "active" : ""}" type="button" data-semi-symbol="${company.symbol}">
                <b>${company.symbol}</b>
                <span>${company.name}</span>
                <em>${company.score}</em>
              </button>
              ${renderOfficialLink(company)}
            </div>
          `,
        )
        .join("")
    : `
      <div class="ai-empty">
        <b>公司档案待补</b>
        <span>这个节点先保留在产业链关系图里，后续可以继续补全公司池。</span>
      </div>
    `;

  elements.semiNodeCompanies.querySelectorAll("[data-semi-symbol]").forEach((button) => {
    button.addEventListener("click", () => {
      const company = semiCompanyBySymbol(button.dataset.semiSymbol);
      if (!company) return;
      state.selectedSemiSymbol = company.symbol;
      renderSemiNodeSummary();
      document.querySelector("#semi-research")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const activeCompany = companies.find((company) => company.symbol === state.selectedSemiSymbol) || companies[0];
  if (activeCompany) renderSemiDetail(activeCompany, node);
}

function renderSemiDeepViews() {
  if (!elements.semiFrontView || !elements.semiManufacturingView || !elements.semiMarketView) return;
  elements.semiFrontView.innerHTML = semiDeepViews.front.map(renderSemiDeepItem).join("");
  elements.semiManufacturingView.innerHTML = semiDeepViews.manufacturing.map(renderSemiDeepItem).join("");
  elements.semiMarketView.innerHTML = semiDeepViews.market.map(renderSemiDeepItem).join("");
}

function renderSemiDeepItem([title, text]) {
  const matched = allSemiCompanies()
    .map(enrichSemiCompany)
    .filter((company) => text.includes(company.symbol) || text.includes(company.name) || text.includes(company.name.split(" ")[0]))
    .slice(0, 5);
  return `
    <div class="ai-deep-item" data-searchable>
      <b>${title}</b>
      <p>${text}</p>
      ${
        matched.length
          ? `<div class="ai-mini-symbols">${matched.map((company) => `<span>${company.symbol} ${company.score}</span>`).join("")}</div>`
          : ""
      }
    </div>
  `;
}

function renderSemiDetail(company, node) {
  if (!company || !elements.semiDetailBody || !elements.semiDetailTitle || !elements.semiDetailSymbol) return;
  const enriched = company.score === undefined ? enrichSemiCompany(company) : company;
  const quote = enriched.quote || {};
  const profile = semiProfileFor(enriched, node);
  const officialLink = renderOfficialLink(enriched, "detail-official-link");
  const relatedNodes = semiNodes
    .filter((item) => item.symbols?.includes(enriched.symbol))
    .map((item) => item.title)
    .slice(0, 10);

  elements.semiDetailTitle.textContent = enriched.name;
  elements.semiDetailSymbol.textContent = enriched.symbol;
  elements.semiDetailBody.innerHTML = `
    <div class="detail-block" data-searchable>
      <b>研究位置</b>
      <span>${enriched.industry} · ${enriched.tier} · 研究分 ${enriched.score}</span>
      <small>价格：${quote.close ? priceFormatter.format(quote.close) : "--"} / ${changeText(quote)}</small>
      ${officialLink}
    </div>
    <div class="detail-block" data-searchable>
      <b>公司业务</b>
      <span>${profile.business}</span>
    </div>
    <div class="detail-block" data-searchable>
      <b>产业链角色</b>
      <span>${profile.chainRole}</span>
      <small>${relatedNodes.length ? `对应节点：${relatedNodes.join(" / ")}` : "当前公司暂未绑定到半导体图谱节点。"}</small>
    </div>
    <div class="detail-block detail-list" data-searchable>
      <b>收入构成</b>
      <ul>${profile.revenueMix.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
    <div class="detail-block detail-list" data-searchable>
      <b>成本 / 支出构成</b>
      <ul>${profile.expenseMix.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
    <div class="detail-block" data-searchable>
      <b>财报跟踪</b>
      <span>${profile.financials}</span>
    </div>
    <div class="detail-block" data-searchable>
      <b>研究逻辑</b>
      <span>${enriched.logic}</span>
    </div>
    <div class="detail-block" data-searchable>
      <b>主要风险</b>
      <span>${enriched.risk}</span>
    </div>
    <div class="detail-block" data-searchable>
      <b>下一步观察</b>
      <span>${profile.watch} ${enriched.nextCheck}</span>
    </div>
  `;
}

function renderHeader() {
  const { generatedAt, sourceStatus, macro, cycles } = state.data;
  if (elements.updated) elements.updated.textContent = formatDate(generatedAt);
  if (elements.sourceStatus) elements.sourceStatus.textContent = sourceStatus.summary;
  if (elements.freshnessDot) elements.freshnessDot.classList.toggle("fresh", sourceStatus.quoteOk || sourceStatus.macroOk);
  if (elements.macroBadge) elements.macroBadge.textContent = `${macro.stage} · ${sourceStatus.socialOk ? "social ok" : "social wait"}`;
  if (elements.kWaveTag) elements.kWaveTag.textContent = cycles.kondratiev.stage;
  if (elements.marketSummary) elements.marketSummary.textContent = `当前框架：康波处于「${cycles.kondratiev.stage}」，美林时钟偏「${macro.stage}」。`;
  if (elements.kWaveSummary) elements.kWaveSummary.textContent = cycles.kondratiev.summary;
  if (elements.kWavePosition) {
    elements.kWavePosition.textContent = "当前处于第五轮信息技术革命后段：AI 正从芯片和模型能力，扩散到数据中心、电力、网络、安全和企业工作流。";
  }
  if (elements.merrillStage) elements.merrillStage.textContent = macro.stage;
  if (elements.merrillPosition) elements.merrillPosition.textContent = merrillConclusion(macro.stage);
  if (elements.merrillClock) elements.merrillClock.dataset.stage = macro.stage;
  if (elements.clockMarker) elements.clockMarker.textContent = macro.stage;
  if (elements.clockCurrentCard) {
    elements.clockCurrentCard.querySelector("span").textContent = `${macro.stage}：${merrillConclusion(macro.stage)}`;
  }
  if (elements.kWaveSignals) {
    elements.kWaveSignals.innerHTML = cycles.kondratiev.signals
      .map(
        (signal) => `
          <div class="compact-item" data-searchable>
            <b>${signal.title}</b>
            <span>${signal.text}</span>
          </div>
        `,
      )
      .join("");
  }
}

function merrillConclusion(stage) {
  const copy = {
    复苏: "当前位置：增长向上、通胀向下。股票和成长资产弹性更好，优先看云平台、软件和半导体修复。",
    过热: "当前位置：增长向上、通胀向上。主线仍可做，但要偏向盈利兑现、资本开支确定和实物约束强的行业。",
    滞胀: "当前位置：增长向下、通胀向上。压估值环境里优先看资源、防御现金流和必要基础设施。",
    衰退: "当前位置：增长向下、通胀向下。先看防御、现金流和利率下行受益资产，等待风险偏好修复。",
  };
  return copy[stage] || "等待宏观数据确认美林时钟位置。";
}

function renderThesis() {
  if (!elements.thesisPoints) return;
  const playbook = cyclePlaybook[state.data.macro.stage] || cyclePlaybook.复苏;
  const thesis = [
    ["康波位置", "第五轮信息技术革命后段，AI 是这一轮信息技术向基础设施和应用扩散的核心变量。"],
    ["美林位置", merrillConclusion(state.data.macro.stage)],
    ["配置结论", playbook.text],
    ["操作方式", "在公司研究池按行业、梯队、热度和强信号筛选；宏观阶段负责控制行业偏好，个股仍要回到财报、估值和订单兑现。"],
  ];

  elements.thesisPoints.innerHTML = thesis
    .map(
      ([label, text]) => `
        <div class="thesis-row" data-searchable>
          <span>${label}</span>
          <p>${text}</p>
        </div>
      `,
    )
    .join("");
}

function renderPortal() {
  if (elements.page !== "home") return;
  const { generatedAt, macro, cycles, sourceStatus } = state.data;
  const todayLeaders = hotCompanies("today", 5);
  const weekLeaders = hotCompanies("week", 3);
  const playbook = cyclePlaybook[macro.stage] || cyclePlaybook.复苏;

  if (elements.portalUpdated) elements.portalUpdated.textContent = formatDate(generatedAt);
  if (elements.portalStage) elements.portalStage.textContent = macro.stage;
  if (elements.portalHotCount) elements.portalHotCount.textContent = `${todayLeaders.length} 只`;
  if (elements.portalHotSummary) {
    elements.portalHotSummary.textContent = todayLeaders.length
      ? `今日热度靠前：${todayLeaders.slice(0, 3).map((item) => item.symbol).join(" / ")}。`
      : "等待今日热度数据。";
  }
  if (elements.portalCycleSummary) {
    elements.portalCycleSummary.textContent = `康波处于「${cycles.kondratiev.stage}」，美林时钟偏「${macro.stage}」。`;
  }
  if (elements.portalAiSummary) {
    elements.portalAiSummary.textContent = `AI 图谱按 ${aiLayers.length} 层、${aiNodes.length} 个节点组织，当前默认从芯片和基础设施切入。`;
  }
  if (elements.portalSemiSummary) {
    elements.portalSemiSummary.textContent = `半导体图谱按 ${semiLayers.length} 层、${semiNodes.length} 个节点组织，覆盖 ${Object.keys(semiCompanyDirectory).length} 家全球龙头。`;
  }
  if (elements.portalSocialSource) elements.portalSocialSource.textContent = sourceStatus.socialOk ? "WSB 已更新" : "热度待刷新";
  if (elements.portalMacroBadge) elements.portalMacroBadge.textContent = `${macro.stage} · ${sourceStatus.macroOk ? "macro ok" : "macro wait"}`;
  if (elements.portalLeaders) {
    elements.portalLeaders.innerHTML = todayLeaders
      .map(
        (item, index) => `
          <a href="./hot-stocks.html" data-searchable>
            <span>${index + 1}</span>
            <b>${item.symbol}</b>
            <small>${item.company?.name || item.name || item.symbol}</small>
            <em>${item.score}</em>
          </a>
        `,
      )
      .join("");
  }
  if (elements.portalCyclePoints) {
    const rows = [
      ["配置结论", playbook.text],
      ["本周热度", weekLeaders.length ? weekLeaders.map((item) => item.symbol).join(" / ") : "等待本周热度确认"],
      ["AI 入口", "产业链页从能源、芯片、基础设施、模型、应用五层进入公司档案。"],
      ["半导体入口", "半导体页从 EDA/IP、材料、设备、制造、设计、存储、封测、下游应用八层进入公司档案。"],
    ];
    elements.portalCyclePoints.innerHTML = rows
      .map(
        ([label, text]) => `
          <div class="compact-item" data-searchable>
            <b>${label}</b>
            <span>${text}</span>
          </div>
        `,
      )
      .join("");
  }
}

function renderMacroTable() {
  const rows = state.data.macro.metrics.map((metric) => ({
    label: metric.label,
    value: metric.format === "pct" ? number(metric.value, "%") : number(metric.value),
    asOf: state.data.generatedAt.slice(0, 10),
    source: metric.note,
    quality: state.data.sourceStatus.macroOk ? "ok" : "stale",
  }));

  elements.qualityCount.textContent = `${rows.filter((row) => row.quality === "ok").length} ok`;
  elements.macroTable.innerHTML = rows
    .map(
      (row) => `
        <tr data-searchable>
          <td>${row.label}</td>
          <td><b>${row.value}</b></td>
          <td>${row.asOf}</td>
          <td>${row.source}</td>
          <td><span class="quality ${row.quality}">${row.quality}</span></td>
        </tr>
      `,
    )
    .join("");
}

function renderMiniPanels() {
  const movers = state.data.companies
    .map(enrichCompany)
    .filter((company) => Number.isFinite(company.quote.changePercent))
    .sort((a, b) => Math.abs(b.quote.changePercent) - Math.abs(a.quote.changePercent))
    .slice(0, 4);
  elements.assetCount.textContent = `${movers.length} 条`;
  elements.assetMoves.innerHTML = movers
    .map(
      (company) => `
        <div class="rank-item" data-searchable>
          <b>${company.symbol}</b>
          <span>${company.name}</span>
          <em class="${moveClass(company.quote.changePercent)}">${changeText(company.quote)}</em>
        </div>
      `,
    )
    .join("");

  const top = strongestCompanies(3);
  elements.confirmations.innerHTML = top
    .map(
      (company) => `
        <div class="rank-item" data-searchable>
          <b>${company.symbol}</b>
          <span>${company.industry}</span>
          <em>${company.score}</em>
        </div>
      `,
    )
    .join("");

  const weekHot = hotCompanies("week", 3);
  elements.triggers.innerHTML = weekHot
    .map(
      (item, index) => `
        <div class="rank-item" data-searchable>
          <b>${index === 0 ? "24h" : "72h"}</b>
          <span>${item.symbol}：${item.topPost?.title || item.company.logic}</span>
          <em>${item.score}</em>
        </div>
      `,
    )
    .join("");
}

function renderAiBrief() {
  const groups = new Map();
  for (const company of state.data.companies.map(enrichCompany)) {
    if (!groups.has(company.industry)) groups.set(company.industry, []);
    groups.get(company.industry).push(company);
  }

  const sections = [...groups.entries()].slice(0, 5).map(([industry, companies]) => {
    const sorted = companies.sort((a, b) => b.score - a.score);
    const leader = sorted[0];
    const evidence = sorted
      .slice(0, 3)
      .map((company) => `${company.symbol} 综合分 ${company.score}`)
      .join("，");
    return {
      title: industry,
      bias: leader.score >= 82 ? "High" : leader.score >= 74 ? "Medium" : "Low",
      rows: [
        ["事实", leader.logic],
        ["证据", evidence],
        ["交易含义", leader.nextCheck],
        ["失效条件", leader.risk],
      ],
    };
  });

  elements.aiConfidence.textContent = state.data.sourceStatus.quoteOk ? "confidence medium" : "confidence low";
  elements.aiBrief.innerHTML = sections
    .map(
      (section) => `
        <section class="brief-section" data-searchable>
          <div class="brief-title">
            <h3>${section.title}</h3>
            <span>${section.bias}</span>
          </div>
          ${section.rows
            .map(
              ([label, text]) => `
                <div class="brief-row">
                  <b>${label}</b>
                  <p>${text}</p>
                </div>
              `,
            )
            .join("")}
        </section>
      `,
    )
    .join("");
}

function renderFeeds() {
  const events = [
    ...hotCompanies("today", 4).map((item) => ({
      score: `${item.score}/100`,
      title: `${item.symbol} 社媒热度升温`,
      source: `WSB · ${item.comments} 评论 · ${item.mentions} 次提及`,
      tags: [item.symbol, item.company.industry, "social"],
    })),
    {
      score: state.data.macro.stage,
      title: "美林时钟状态更新",
      source: state.data.sourceStatus.summary,
      tags: ["macro", state.data.macro.stage],
    },
  ];

  elements.eventFeed.innerHTML = events
    .map(
      (event) => `
        <a class="event-item" href="#stock-lab" data-searchable>
          <span>${event.score}</span>
          <b>${event.title}</b>
          <small>${event.source}</small>
          <em>${event.tags.join(" · ")}</em>
        </a>
      `,
    )
    .join("");

  const reports = strongestCompanies(5).map((company) => ({
    title: `${company.name} ${company.tier} 跟踪`,
    meta: `${company.industry} · 综合分 ${company.score}`,
    text: company.logic,
  }));
  elements.reportFeed.innerHTML = reports
    .map(
      (report) => `
        <article class="report-item" data-searchable>
          <b>${report.title}</b>
          <span>${report.text}</span>
          <small>${report.meta}</small>
        </article>
      `,
    )
    .join("");
}

function renderWatchlist() {
  const tags = ["SPX", "NVDA", "MSFT", "AI", "10Y", "WTI", "WSB"];
  elements.watchTags.innerHTML = tags.map((tag) => `<span>${tag}</span>`).join("");

  const hot = hotCompanies("week", 3);
  const rules = [
    ["数据质量刷新", state.data.sourceStatus.summary],
    ["信用压力扩散", "HY OAS > 3.0% 时降低高估值成长股权重。"],
    ["流动性警戒", "VIX > 20 或实际利率快速上行时，优先看现金流和盈利兑现。"],
    ["社媒异动", hot.length ? `${hot.map((item) => item.symbol).join(" / ")} 连续进入本周热度榜。` : "等待本周热度榜确认。"],
  ];
  elements.watchRules.innerHTML = rules
    .map(
      ([label, text]) => `
        <div class="rule-item" data-searchable>
          <b>${label}</b>
          <span>${text}</span>
        </div>
      `,
    )
    .join("");
}

function renderSocialHeat() {
  if (!elements.socialLeaders || !elements.socialSource || !elements.socialNote || !elements.hotDetail) return;
  const selectedWindow = heatWindowKey();
  const heat = socialWindow(selectedWindow);
  const leaders = hotCompanies(selectedWindow, 10);
  const status = state.data.socialHeat?.sourceStatus;
  elements.socialSource.textContent = status?.redditOk ? "WSB 已更新" : "热度待刷新";
  elements.socialNote.textContent =
    status?.summary || `${heatLabel(selectedWindow)}热度来自 WallStreetBets 公开帖子匹配；X 热度保留接入口。`;

  if (!leaders.length) {
    elements.socialLeaders.innerHTML = `
      <div class="heat-empty">
        <b>${heatLabel(selectedWindow)}暂无匹配</b>
        <span>当前研究池股票在 WSB 公开帖子里没有明显提及，或数据源暂时不可用。</span>
      </div>
    `;
    elements.hotDetail.innerHTML = "";
    return;
  }

  if (!leaders.some((item) => item.symbol === state.selectedHotSymbol)) {
    state.selectedHotSymbol = leaders[0].symbol;
  }

  elements.socialLeaders.innerHTML = leaders
    .map((item, index) => {
      const company = item.company;
      return `
        <button class="heat-card ${state.selectedHotSymbol === item.symbol ? "active" : ""}" type="button" data-symbol="${item.symbol}" data-searchable>
          <span class="rank">${index + 1}</span>
          <span class="heat-main">
            <b>${item.symbol}</b>
            <small>${company?.name || item.name}</small>
          </span>
          <span class="heat-score">${item.score}</span>
          <span class="heat-meta">${item.posts}帖 / ${item.comments}评 / ${item.mentions}次提及</span>
          <span class="heat-post">${item.topPost ? item.topPost.title : "暂无代表帖子"}</span>
        </button>
      `;
    })
    .join("");

  elements.socialLeaders.querySelectorAll(".heat-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedHotSymbol = card.dataset.symbol;
      renderSocialHeat();
    });
  });

  renderHotDetail(leaders.find((item) => item.symbol === state.selectedHotSymbol) || leaders[0]);
}

function renderHotDetail(item) {
  if (!elements.hotDetail) return;
  if (!item) {
    elements.hotDetail.innerHTML = "";
    return;
  }
  const company = item.company;
  const quote = item.quote || {};
  const topPost = item.topPost || item.sources?.reddit?.topPosts?.[0];
  elements.hotDetail.innerHTML = `
    <div class="hot-detail-main" data-searchable>
      <div>
        <span class="hot-kicker">${heatLabel(heatWindowKey())}热股公司档案</span>
        <h3>${item.symbol} ${company?.name || item.name || ""}</h3>
        <p>${company ? company.logic : "该代码来自社媒热度榜，尚未进入本站公司研究池。"}</p>
      </div>
      <div class="hot-detail-metrics">
        <span><b>${item.score}</b><small>热度分</small></span>
        <span><b>${item.mentions}</b><small>提及</small></span>
        <span><b>${item.comments}</b><small>评论</small></span>
        <span><b>${changeText(quote)}</b><small>日涨跌</small></span>
      </div>
    </div>
    <div class="hot-detail-post" data-searchable>
      <b>代表帖子</b>
      <span>${topPost ? topPost.title : "暂无代表帖子；如果 X API 后续接入，这里会合并 X 讨论热度。"}</span>
    </div>
    <div class="hot-detail-post" data-searchable>
      <b>跟踪要点</b>
      <span>${company ? `${company.nextCheck} 主要风险：${company.risk}` : "先观察热度是否连续进入今日/本周榜，再补充公司基本面档案。"}</span>
    </div>
  `;
}

function filteredCompanies() {
  const query = state.filters.query;
  const companyHeat = state.filters.companyHeat;
  return state.data.companies
    .map(enrichCompany)
    .filter((company) => {
      const text = [
        company.name,
        company.symbol,
        company.industry,
        company.tier,
        company.description,
        company.logic,
        company.risk,
      ]
        .join(" ")
        .toLowerCase();
      return !query || text.includes(query);
    })
    .filter((company) => state.filters.industry === "全部" || company.industry === state.filters.industry)
    .filter((company) => state.filters.tier === "全部" || company.tier === state.filters.tier)
    .filter((company) => companyHeat === "all" || socialHeatFor(company.symbol, companyHeat).score > 0)
    .filter((company) => !state.filters.focusOnly || company.score >= 78)
    .sort((a, b) => {
      if (companyHeat !== "all") {
        return socialHeatFor(b.symbol, companyHeat).score - socialHeatFor(a.symbol, companyHeat).score || b.score - a.score;
      }
      return b.score - a.score || b.socialToday.score - a.socialToday.score;
    });
}

function renderCompanies() {
  if (!elements.table || !elements.count) return;
  const companies = filteredCompanies();
  elements.count.textContent = `${companies.length} / ${state.data.companies.length}`;
  if (!companies.length) {
    state.selectedSymbol = null;
    elements.table.innerHTML = `<tr><td colspan="7">当前筛选条件下没有匹配股票。</td></tr>`;
    return;
  }

  if (!companies.some((company) => company.symbol === state.selectedSymbol)) {
    state.selectedSymbol = companies[0].symbol;
  }

  elements.table.innerHTML = companies
    .map((company) => {
      const quote = company.quote;
      const heatKey = state.filters.companyHeat === "week" ? "week" : "today";
      const currentHeat = socialHeatFor(company.symbol, heatKey);
      return `
        <tr data-symbol="${company.symbol}" class="${state.selectedSymbol === company.symbol ? "selected" : ""}" data-searchable>
          <td>
            <div class="company-name">
              <b>${company.name}</b>
              <small>${company.industry} · ${company.tier}</small>
            </div>
          </td>
          <td><b>${company.symbol}</b></td>
          <td>${quote.close ? priceFormatter.format(quote.close) : "--"}</td>
          <td class="${moveClass(quote.changePercent)}">${changeText(quote)}</td>
          <td><span class="score ${scoreClass(company.score)}">${company.score}</span></td>
          <td>
            <div class="heat-cell">
              <b>${currentHeat.score}</b>
              <span>${state.filters.companyHeat === "all" ? "今日" : heatLabel(heatKey)} / ${currentHeat.posts}帖</span>
            </div>
          </td>
          <td class="logic-cell">${company.logic}</td>
        </tr>
      `;
    })
    .join("");

  elements.table.querySelectorAll("tr[data-symbol]").forEach((row) => {
    row.addEventListener("click", () => {
      state.selectedSymbol = row.dataset.symbol;
      renderCompanies();
    });
  });
}

function renderDetail(company) {
  if (!company || !elements.detailBody || !elements.detailTitle || !elements.detailSymbol) return;
  const quote = company.quote || {};
  const profile = profileFor(company);
  const officialLink = renderOfficialLink(company, "detail-official-link");
  const relatedNodes = aiNodes
    .filter((node) => node.symbols?.includes(company.symbol))
    .map((node) => node.title)
    .slice(0, 8);
  elements.detailTitle.textContent = company.name;
  elements.detailSymbol.textContent = company.symbol;
  elements.detailBody.innerHTML = `
    <div class="detail-block" data-searchable>
      <b>研究位置</b>
      <span>${company.industry} · ${company.tier} · 综合分 ${company.score}</span>
      <small>价格：${quote.close ? priceFormatter.format(quote.close) : "--"} / ${changeText(quote)}</small>
      ${officialLink}
    </div>
    <div class="detail-block" data-searchable>
      <b>公司业务</b>
      <span>${profile.business}</span>
    </div>
    <div class="detail-block" data-searchable>
      <b>产业链角色</b>
      <span>${profile.chainRole}</span>
      <small>${relatedNodes.length ? `对应节点：${relatedNodes.join(" / ")}` : "当前公司暂未绑定到 AI 图谱节点。"}</small>
    </div>
    <div class="detail-block detail-list" data-searchable>
      <b>收入构成</b>
      <ul>${profile.revenueMix.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
    <div class="detail-block detail-list" data-searchable>
      <b>成本 / 支出构成</b>
      <ul>${profile.expenseMix.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
    <div class="detail-block" data-searchable>
      <b>财报跟踪</b>
      <span>${profile.financials}</span>
    </div>
    <div class="detail-block" data-searchable>
      <b>研究逻辑</b>
      <span>${company.logic}</span>
    </div>
    <div class="detail-block" data-searchable>
      <b>主要风险</b>
      <span>${company.risk}</span>
    </div>
    <div class="detail-block" data-searchable>
      <b>下一步跟踪</b>
      <span>${profile.watch} ${company.nextCheck}</span>
    </div>
  `;
}

function renderGlossary() {
  if (!elements.glossaryList) return;
  const groups = Object.keys(glossaryGroups);
  if (!groups.includes(state.selectedGlossary)) {
    state.selectedGlossary = groups[0];
  }
  const terms = glossaryGroups[state.selectedGlossary] || [];
  elements.glossaryList.innerHTML = `
    <div class="glossary-tabs" role="group" aria-label="AI 产业术语分类">
      ${groups
        .map(
          (group) => `
            <button class="${state.selectedGlossary === group ? "active" : ""}" type="button" data-glossary-group="${group}">
              ${group}
            </button>
          `,
        )
        .join("")}
    </div>
    <div class="glossary-group-title">
      <b>${state.selectedGlossary}术语</b>
      <span>和 AI 五层产业链对应，点上方行业切换术语池。</span>
    </div>
    ${terms
      .map(
        ([term, definition]) => `
        <div class="glossary-item" data-searchable>
          <b>${term}</b>
          <span>${definition}</span>
        </div>
      `,
      )
      .join("")}
  `;

  elements.glossaryList.querySelectorAll("[data-glossary-group]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedGlossary = button.dataset.glossaryGroup;
      renderGlossary();
    });
  });
}

function renderSemiGlossary() {
  if (!elements.semiGlossaryList) return;
  const groups = Object.keys(semiGlossaryGroups);
  if (!groups.includes(state.selectedSemiGlossary)) {
    state.selectedSemiGlossary = groups[0];
  }
  const terms = semiGlossaryGroups[state.selectedSemiGlossary] || [];
  elements.semiGlossaryList.innerHTML = `
    <div class="glossary-tabs" role="group" aria-label="半导体产业术语分类">
      ${groups
        .map(
          (group) => `
            <button class="${state.selectedSemiGlossary === group ? "active" : ""}" type="button" data-semi-glossary-group="${group}">
              ${group}
            </button>
          `,
        )
        .join("")}
    </div>
    <div class="glossary-group-title">
      <b>${state.selectedSemiGlossary}术语</b>
      <span>和半导体八层产业链对应，点上方行业切换术语池。</span>
    </div>
    ${terms
      .map(
        ([term, definition]) => `
        <div class="glossary-item" data-searchable>
          <b>${term}</b>
          <span>${definition}</span>
        </div>
      `,
      )
      .join("")}
  `;

  elements.semiGlossaryList.querySelectorAll("[data-semi-glossary-group]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSemiGlossary = button.dataset.semiGlossaryGroup;
      renderSemiGlossary();
    });
  });
}

function renderAll() {
  renderHeader();
  renderPortal();
  renderThesis();
  renderSocialHeat();
  renderAiIndustry();
  renderSemiIndustry();
  renderCompanies();
  renderGlossary();
  renderSemiGlossary();
  renderSiteSearch();
}

async function init() {
  setupTheme();
  setupNavigation();
  setupSearch();
  setupAiIndustry();
  setupSemiIndustry();

  try {
    state.data = await loadData();
    setupFilters(state.data.companies);
    renderAll();
  } catch (error) {
    if (elements.marketSummary) elements.marketSummary.textContent = error.message;
    if (elements.updated) elements.updated.textContent = "数据不可用";
    if (elements.sourceStatus) elements.sourceStatus.textContent = "DATA ERROR";
  }
}

init();
