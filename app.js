const state = {
  data: null,
  filters: {
    query: "",
    siteQuery: "",
    industry: "全部",
    tier: "全部",
    heatWindow: "all",
    focusOnly: false,
  },
  selectedSymbol: null,
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
  socialSource: document.querySelector("#social-source"),
  socialLeaders: document.querySelector("#social-leaders"),
  socialNote: document.querySelector("#social-note"),
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
  ["康波周期", "用长期技术革命和资本开支周期解释产业主线，适合判断大方向。"],
  ["美林时钟", "用增长和通胀方向划分复苏、过热、滞胀、衰退，适合控制仓位节奏。"],
  ["估值分位", "当前估值相对历史区间的位置，越高说明预期越满。"],
  ["盈利兑现", "收入、利润和现金流对叙事的验证程度。"],
  ["社媒热度", "来自 WSB 公开帖子匹配的讨论强度，X 热度预留 API 接口。"],
  ["触发条件", "能让主线被确认或被证伪的下一组数据、价格或事件。"],
];

async function loadData() {
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
  return state.data.companies.find((company) => company.symbol === symbol);
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
  const priceChange = quote.changePercent ?? 0;
  const score = Math.round(
    company.baseScore +
      (company.earningsDelivery - 70) * 0.18 -
      Math.max(company.valuationPercentile - 65, 0) * 0.14 +
      Math.max(65 - company.valuationPercentile, 0) * 0.05 +
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

function hotCompanies(windowKey = "today", limit = 5) {
  return socialWindow(windowKey)
    .leaders.map((item) => ({
      ...item,
      company: companyBySymbol(item.symbol),
      quote: quoteFor(item.symbol),
    }))
    .filter((item) => item.company)
    .slice(0, limit);
}

function setHeatWindow(value) {
  state.filters.heatWindow = value;
  if (elements.heatFilter.value !== value) elements.heatFilter.value = value;
  elements.heatTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.heatWindow === value);
  });
  renderSocialHeat();
  renderCompanies();
}

function setupTheme() {
  const saved = localStorage.getItem("investment-theme") || "dark";
  document.body.classList.toggle("light", saved === "light");
  elements.themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("investment-theme", document.body.classList.contains("light") ? "light" : "dark");
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
  elements.heatFilter.addEventListener("change", (event) => setHeatWindow(event.target.value));
  elements.heatTabs.forEach((button) => {
    button.addEventListener("click", () => setHeatWindow(button.dataset.heatWindow));
  });
  elements.focus.addEventListener("change", (event) => {
    state.filters.focusOnly = event.target.checked;
    renderCompanies();
  });
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

function renderThesis() {
  const leaders = strongestCompanies(3);
  const hot = hotCompanies("today", 1)[0];
  const thesis = [
    ["主线", `长期主线仍在 AI、半导体、电力基础设施、云平台和医疗创新，当前节奏由「${state.data.macro.stage}」约束。`],
    ["反证", "若实际利率继续上行、信用利差扩张，成长资产估值会先受压；若油价和通胀回落，优质科技会恢复弹性。"],
    [
      "触发",
      hot
        ? `${hot.symbol} 今日社媒热度 ${hot.score}，代表帖子带来短线关注；强趋势股优先验证成交和基本面兑现。`
        : "等待社媒和价格同时确认，避免只追单一情绪信号。",
    ],
    ["确认", `综合分靠前：${leaders.map((item) => `${item.symbol} ${item.score}`).join(" / ")}。`],
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
  const status = state.data.socialHeat?.sourceStatus;
  elements.socialSource.textContent = status?.redditOk ? "WSB 已更新" : "热度待刷新";
  elements.socialNote.textContent =
    status?.summary || `${heatLabel(selectedWindow)}热度来自 WallStreetBets 公开帖子匹配。`;

  if (!heat.leaders?.length) {
    elements.socialLeaders.innerHTML = `
      <div class="heat-empty">
        <b>${heatLabel(selectedWindow)}暂无匹配</b>
        <span>当前研究池股票在 WSB 公开帖子里没有明显提及，或数据源暂时不可用。</span>
      </div>
    `;
    return;
  }

  elements.socialLeaders.innerHTML = heat.leaders
    .slice(0, 6)
    .map((item, index) => {
      const company = companyBySymbol(item.symbol);
      return `
        <button class="heat-card" type="button" data-symbol="${item.symbol}" data-searchable>
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
      state.selectedSymbol = card.dataset.symbol;
      if (state.filters.heatWindow === "all") setHeatWindow(selectedWindow);
      else renderCompanies();
      renderDetail(enrichCompany(companyBySymbol(state.selectedSymbol)));
      document.querySelector("#research").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function filteredCompanies() {
  const query = state.filters.query;
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
    .filter((company) => state.filters.heatWindow === "all" || company.socialCurrent.score > 0)
    .filter((company) => !state.filters.focusOnly || company.score >= 78)
    .sort((a, b) => {
      if (state.filters.heatWindow !== "all") {
        return b.socialCurrent.score - a.socialCurrent.score || b.score - a.score;
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
      const currentHeat = company.socialCurrent;
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
              <span>${heatLabel(heatWindowKey())} / ${currentHeat.posts}帖</span>
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
  renderMacroTable();
  renderMiniPanels();
  renderAiBrief();
  renderFeeds();
  renderWatchlist();
  renderSocialHeat();
  renderCompanies();
  renderGlossary();
  renderSiteSearch();
}

async function init() {
  setupTheme();
  setupNavigation();
  setupSearch();

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
