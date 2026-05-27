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
  selectedSymbol: null,
  selectedHotSymbol: null,
  selectedSector: null,
};

const elements = {
  updated: document.querySelector("#last-updated"),
  freshnessDot: document.querySelector("#freshness-dot"),
  sourceStatus: document.querySelector("#source-status"),
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
  navLinks: document.querySelectorAll("[data-nav]"),
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
  sectorConclusion: document.querySelector("#sector-conclusion"),
  sectorButtons: document.querySelector("#sector-buttons"),
  sectorCompanies: document.querySelector("#sector-companies"),
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
  stockSearch: document.querySelector("#search-input"),
  focus: document.querySelector("#focus-toggle"),
  count: document.querySelector("#visible-count"),
  table: document.querySelector("#company-table"),
  detailTitle: document.querySelector("#detail-title"),
  detailSymbol: document.querySelector("#detail-symbol"),
  detailBody: document.querySelector("#detail-body"),
  glossaryList: document.querySelector("#glossary-list"),
};

const formatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const glossary = [
  ["HBM", "高带宽内存，决定高端 GPU 训练吞吐和封装供给弹性。"],
  ["CoWoS", "台积电先进封装能力，连接 GPU 与 HBM，是 AI 芯片交付的重要瓶颈。"],
  ["AI ASIC", "云厂商或大客户定制 AI 加速芯片，主要用于降低推理成本。"],
  ["CPO", "共封装光学，把光互联更靠近交换芯片，用来降低高带宽网络功耗。"],
  ["液冷", "高功率机柜散热方案，AI 数据中心功率密度提升后渗透率上升。"],
  ["推理", "模型被真实调用和部署的环节，比训练更接近应用收入兑现。"],
];

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
    candidate("QCOM", "Qualcomm", "AI 算力与芯片", "终端 AI", "端侧 AI、手机芯片和边缘推理生态是应用层算力观察点。", 70),
  ].map((company) => [company.symbol, company]),
);

const cycleSectorCandidates = {
  "数据中心电力与冷却": ["VRT", "ETN", "GEV", "HUBB", "TT", "CARR", "JCI", "PWR"],
  "低碳电力与电网": ["GEV", "CEG", "VST", "NEE", "PWR", "ETN", "HUBB"],
  "半导体设备与制造": ["TSM", "ASML", "AMAT", "LRCX", "KLAC"],
  "AI 算力与芯片": ["NVDA", "AVGO", "AMD", "MRVL", "MU", "ARM", "TSM"],
  "资源品": ["FCX", "SCCO", "NEM", "GOLD", "CCJ", "XOM"],
  "云平台与 AI 软件": ["MSFT", "GOOGL", "AMZN", "META", "ORCL", "NOW", "CRM", "ADBE", "SNOW"],
  "网络安全": ["PANW", "CRWD", "DDOG"],
  "医疗创新": ["LLY", "ISRG"],
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

const aiLayers = ["能源", "芯片", "基础设施", "模型", "应用"];

const aiLayerX = [9, 30, 51, 72, 93];
const aiLeafY = [18, 32, 46, 60, 74];

const aiLayerConfig = [
  {
    id: "energy",
    title: "能源",
    segment: "能源",
    summary: "黄仁勋五层蛋糕的底层是能源。AI 工厂首先是电力工程，约束来自发电、输配电、冷却和电力设备。",
    symbols: ["GEV", "CEG", "VST", "ETN", "VRT", "PWR"],
    leaves: [
      ["power-generation", "电力供给", "核电、燃机和可再生能源共同决定 AI 数据中心能否拿到稳定电。", ["CEG", "VST", "NEE", "GEV"]],
      ["grid-buildout", "电网与输配", "变压器、开关、输配电工程和并网能力是扩容瓶颈。", ["ETN", "HUBB", "PWR", "GEV"]],
      ["cooling", "冷却与热管理", "高功率机柜推动液冷、高效制冷和楼宇控制升级。", ["VRT", "TT", "CARR", "JCI"]],
      ["backup-power", "备用电源", "AI 工厂对可靠性要求高，燃机、UPS 和电力管理需求上升。", ["GEV", "ETN", "VRT"]],
      ["energy-materials", "能源材料", "铜、铀、天然气和电气化材料共同支撑电力基础设施。", ["FCX", "SCCO", "CCJ", "XOM"]],
    ],
  },
  {
    id: "chips",
    title: "芯片",
    segment: "芯片",
    summary: "第二层是芯片和加速计算。GPU、ASIC、HBM、先进制程和封装决定 AI 算力供给。",
    symbols: ["NVDA", "AVGO", "AMD", "TSM", "ASML", "AMAT", "MU", "MRVL"],
    leaves: [
      ["gpu", "GPU / 加速器", "训练和推理的核心算力载体，短期仍是 AI 基建中心。", ["NVDA", "AMD", "ARM"]],
      ["ai-asic", "AI ASIC", "云厂商定制芯片降低推理成本，也带动高速互联和先进封装。", ["AVGO", "MRVL", "GOOGL", "AMZN"]],
      ["foundry", "先进制程", "先进逻辑制程决定高端 GPU、CPU、ASIC 的供给弹性。", ["TSM", "ASML", "AMAT", "LRCX", "KLAC"]],
      ["hbm-memory", "HBM / 存储", "HBM、DRAM 和企业级 SSD 决定训练吞吐、缓存和数据管线。", ["MU", "NVDA", "AMD", "TSM"]],
      ["advanced-packaging", "先进封装", "CoWoS、Chiplet 和 2.5D/3D 封装把芯片、HBM 与互联集成。", ["TSM", "AMAT", "NVDA", "AMD"]],
    ],
  },
  {
    id: "infrastructure",
    title: "基础设施",
    segment: "基础设施",
    summary: "第三层是基础设施，把芯片变成可运营的 AI 工厂：数据中心、云、网络、存储和安全。",
    symbols: ["MSFT", "AMZN", "GOOGL", "ANET", "VRT", "PANW", "CRWD"],
    leaves: [
      ["ai-datacenter", "AI 数据中心", "机柜、供电、散热、调度和运营能力决定算力能否交付。", ["VRT", "ETN", "GEV", "MSFT", "AMZN", "GOOGL"]],
      ["cloud-platform", "云平台", "云厂商把算力、模型、数据和企业客户整合成平台。", ["MSFT", "AMZN", "GOOGL", "ORCL"]],
      ["networking", "网络与互联", "训练集群瓶颈从单卡转向东西向流量和低延迟网络。", ["ANET", "AVGO", "NVDA", "MRVL"]],
      ["storage-data", "存储与数据层", "数据湖、向量库、企业数据治理和高性能存储支撑模型落地。", ["SNOW", "AMZN", "MSFT", "GOOGL"]],
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
    summary: "第五层是应用。真正的经济价值来自企业工作流、医疗、机器人、自动驾驶和行业软件。",
    symbols: ["MSFT", "CRM", "ADBE", "PANW", "CRWD", "LLY", "ISRG", "TSLA"],
    leaves: [
      ["enterprise-app", "企业应用", "AI Copilot 和 Agent 进入 CRM、办公、ITSM、数据分析和创意流程。", ["MSFT", "CRM", "NOW", "ADBE", "PATH"]],
      ["cybersecurity-app", "安全应用", "AI 带来新攻击面，也提升检测、响应和身份安全预算。", ["PANW", "CRWD", "MSFT", "DDOG"]],
      ["healthcare-ai", "医疗与生命科学", "药物研发、手术机器人和诊疗流程自动化是长期落点。", ["LLY", "ISRG", "GOOGL", "MSFT"]],
      ["robotics-industrial", "机器人与工业", "实体 AI、仓储自动化和工业软件把模型带进物理世界。", ["TSLA", "SYM", "ISRG", "GEV"]],
      ["auto-edge", "自动驾驶与边缘", "自动驾驶、端侧 AI 和边缘推理决定应用层新增算力需求。", ["TSLA", "NVDA", "ARM", "QCOM"]],
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
      y: 50,
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
  ["ai-asic", "inference"],
  ["foundry", "gpu"],
  ["hbm-memory", "gpu"],
  ["advanced-packaging", "gpu"],
  ["ai-datacenter", "cloud-platform"],
  ["cloud-platform", "foundation-model"],
  ["networking", "ai-datacenter"],
  ["storage-data", "data-model"],
  ["security-ops", "model-tooling"],
  ["foundation-model", "enterprise-app"],
  ["inference", "enterprise-app"],
  ["ai-agent-platform", "enterprise-app"],
  ["data-model", "enterprise-app"],
  ["model-tooling", "cybersecurity-app"],
  ["enterprise-app", "robotics-industrial"],
  ["inference", "auto-edge"],
];

const aiDeepViews = {
  semi: [
    ["能源底座", "GEV / CEG / VST / ETN / VRT / PWR 对应黄仁勋五层蛋糕的能源层，先看电力接入、输配电和冷却订单。"],
    ["芯片供给", "NVDA / AVGO / AMD / TSM / ASML / AMAT / LRCX / KLAC / MU 是芯片层观察池，重点看先进制程、HBM 和封装。"],
    ["基础设施", "MSFT / AMZN / GOOGL / ANET / ORCL / PANW / CRWD 把芯片转成云、网络、安全和可运营 AI 工厂。"],
  ],
  models: [
    ["通用模型", "MSFT / GOOGL / META / AMZN 的模型能力和推理成本曲线决定应用扩散速度。"],
    ["Agent 平台", "NOW / CRM / MSFT / PLTR 代表模型进入企业流程，关键看续费、席位和工作流渗透。"],
    ["数据模型", "SNOW / ORCL / MSFT 解决企业数据治理、检索增强和私有化落地。"],
  ],
  apps: [
    ["企业应用", "MSFT / CRM / NOW / ADBE / PATH 观察 AI Copilot 和 Agent 是否真正进入预算。"],
    ["安全应用", "PANW / CRWD / DDOG / MSFT 受益于 AI 带来的新攻击面、身份安全和可观测性需求。"],
    ["实体 AI", "LLY / ISRG / TSLA / SYM 是医疗、机器人、自动驾驶和工业自动化方向的应用层候选。"],
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
  return state.data.companies.find((company) => company.symbol === symbol) || companyDirectory[symbol];
}

function allKnownCompanies() {
  const seen = new Set();
  return [...state.data.companies, ...Object.values(companyDirectory)].filter((company) => {
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
  elements.navDisclosure.forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.nextElementSibling.hidden = expanded;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      elements.navLinks.forEach((link) => link.classList.toggle("active", link.dataset.nav === visible.target.id));
    },
    { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.3, 0.6] },
  );

  document.querySelectorAll("main section[id], main article[id]").forEach((section) => observer.observe(section));
}

function setupSearch() {
  elements.siteSearchForm.addEventListener("submit", (event) => event.preventDefault());
  elements.siteSearch.addEventListener("input", (event) => {
    state.filters.siteQuery = event.target.value.trim().toLowerCase();
    renderSiteSearch();
  });
}

function renderSiteSearch() {
  const query = state.filters.siteQuery;
  elements.searchableBlocks.forEach((block) => {
    const text = block.textContent.toLowerCase();
    const match = !query || text.includes(query);
    block.classList.toggle("search-dim", !match);
  });
}

function setupFilters(companies) {
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
  elements.heatTabs.forEach((button) => {
    button.addEventListener("click", () => setHeatWindow(button.dataset.heatWindow));
  });
  elements.focus.addEventListener("change", (event) => {
    state.filters.focusOnly = event.target.checked;
    renderCompanies();
  });
}

function setupAiIndustry() {
  if (!elements.aiLayer) return;

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
    renderAiIndustry();
  });

  elements.aiTabs.forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(`#${button.dataset.aiScroll}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      renderAiIndustry();
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
            <button type="button" data-symbol="${company.symbol}">
              <b>${company.symbol}</b>
              <span>${company.name}</span>
              <em>${company.score}</em>
            </button>
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

function renderHeader() {
  const { generatedAt, sourceStatus, macro, cycles } = state.data;
  elements.updated.textContent = formatDate(generatedAt);
  elements.sourceStatus.textContent = sourceStatus.summary;
  elements.freshnessDot.classList.toggle("fresh", sourceStatus.quoteOk || sourceStatus.macroOk);
  elements.macroBadge.textContent = `${macro.stage} · ${sourceStatus.socialOk ? "social ok" : "social wait"}`;
  elements.kWaveTag.textContent = cycles.kondratiev.stage;
  elements.marketSummary.textContent = `当前框架：康波处于「${cycles.kondratiev.stage}」，美林时钟偏「${macro.stage}」。`;
  elements.kWaveSummary.textContent = cycles.kondratiev.summary;
  elements.kWavePosition.textContent = `当前处于第五轮信息技术革命后段：AI 正从芯片和模型能力，扩散到数据中心、电力、网络、安全和企业工作流。`;
  elements.merrillStage.textContent = macro.stage;
  elements.merrillPosition.textContent = merrillConclusion(macro.stage);
  elements.merrillClock.dataset.stage = macro.stage;
  elements.clockMarker.textContent = macro.stage;
  elements.clockCurrentCard.querySelector("span").textContent = `${macro.stage}：${merrillConclusion(macro.stage)}`;
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
  const playbook = cyclePlaybook[state.data.macro.stage] || cyclePlaybook.复苏;
  const thesis = [
    ["康波位置", "第五轮信息技术革命后段，AI 是这一轮信息技术向基础设施和应用扩散的核心变量。"],
    ["美林位置", merrillConclusion(state.data.macro.stage)],
    ["配置结论", playbook.text],
    ["操作方式", `先点下方行业按钮，再看每个行业里综合分、估值分位和社媒热度排序靠前的股票。`],
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

function renderCycleSectors() {
  const playbook = cyclePlaybook[state.data.macro.stage] || cyclePlaybook.复苏;
  const available = playbook.industries.filter((industry) => cycleSectorCandidates[industry]?.length);
  if (!state.selectedSector || !available.includes(state.selectedSector)) {
    state.selectedSector = available[0] || "全部";
  }

  elements.sectorConclusion.textContent = playbook.text;
  elements.sectorButtons.innerHTML = available
    .map(
      (industry) => `
        <button class="${state.selectedSector === industry ? "active" : ""}" type="button" data-sector="${industry}">
          ${industry}
        </button>
      `,
    )
    .join("");

  elements.sectorButtons.querySelectorAll("[data-sector]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSector = button.dataset.sector;
      renderCycleSectors();
    });
  });

  const companies = (cycleSectorCandidates[state.selectedSector] || [])
    .map(companyBySymbol)
    .filter(Boolean)
    .map(enrichCompany)
    .sort((a, b) => b.score - a.score || b.socialWeek.score - a.socialWeek.score)
    .slice(0, 8);

  elements.sectorCompanies.innerHTML = companies
    .map(
      (company) => `
        <button class="sector-company" type="button" data-sector-symbol="${company.symbol}" data-searchable>
          <span>
            <b>${company.symbol}</b>
            <small>${company.name} · ${company.tier}</small>
          </span>
          <em>${company.score}</em>
          <p>${company.logic}</p>
          <small class="sector-check">${company.nextCheck}</small>
        </button>
      `,
    )
    .join("");

  elements.sectorCompanies.querySelectorAll("[data-sector-symbol]").forEach((button) => {
    button.addEventListener("click", () => {
      const company = companyBySymbol(button.dataset.sectorSymbol);
      if (!company) return;
      state.selectedSymbol = company.symbol;
      renderCompanies();
      document.querySelector("#stock-lab")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
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
  const companies = filteredCompanies();
  elements.count.textContent = `${companies.length} / ${state.data.companies.length}`;
  if (!companies.length) {
    state.selectedSymbol = null;
    elements.table.innerHTML = `<tr><td colspan="7">当前筛选条件下没有匹配股票。</td></tr>`;
    elements.detailTitle.textContent = "选择一家公司";
    elements.detailSymbol.textContent = "--";
    elements.detailBody.innerHTML = "<p>调整筛选条件后，点击表格里的公司查看详情。</p>";
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
      renderDetail(enrichCompany(companyBySymbol(state.selectedSymbol)));
    });
  });

  renderDetail(enrichCompany(companyBySymbol(state.selectedSymbol)));
}

function renderDetail(company) {
  if (!company) return;
  const quote = company.quote || {};
  const today = company.socialToday || emptyHeat(company.symbol);
  const week = company.socialWeek || emptyHeat(company.symbol);
  const current = company.socialCurrent || today;
  const topPost = current.sources?.reddit?.topPosts?.[0];
  elements.detailTitle.textContent = company.name;
  elements.detailSymbol.textContent = company.symbol;
  elements.detailBody.innerHTML = `
    <div class="detail-block" data-searchable>
      <b>价格与变化</b>
      <span>${quote.close ? priceFormatter.format(quote.close) : "--"} / ${changeText(quote)}</span>
    </div>
    <div class="detail-block" data-searchable>
      <b>社媒热度</b>
      <span>今日 ${today.score} 分（${today.posts}帖 / ${today.comments}评），本周 ${week.score} 分（${week.posts}帖 / ${week.comments}评）。</span>
      <small>${topPost ? `代表帖子：${topPost.title}` : "WSB 暂无代表帖子；X 热度字段已预留，需配置 API 后接入。"}</small>
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
      <span>${company.nextCheck}</span>
    </div>
  `;
}

function renderGlossary() {
  elements.glossaryList.innerHTML = glossary
    .map(
      ([term, definition]) => `
        <div class="glossary-item" data-searchable>
          <b>${term}</b>
          <span>${definition}</span>
        </div>
      `,
    )
    .join("");
}

function renderAll() {
  renderHeader();
  renderThesis();
  renderCycleSectors();
  renderSocialHeat();
  renderAiIndustry();
  renderCompanies();
  renderGlossary();
  renderSiteSearch();
}

async function init() {
  setupTheme();
  setupNavigation();
  setupSearch();
  setupAiIndustry();

  try {
    state.data = await loadData();
    setupFilters(state.data.companies);
    renderAll();
  } catch (error) {
    elements.marketSummary.textContent = error.message;
    elements.updated.textContent = "数据不可用";
    elements.sourceStatus.textContent = "DATA ERROR";
  }
}

init();
