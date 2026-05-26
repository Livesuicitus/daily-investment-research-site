const state = {
  data: null,
  filters: {
    query: "",
    industry: "全部",
    tier: "全部",
    heatWindow: "all",
    focusOnly: false,
  },
  selectedSymbol: null,
};

const elements = {
  summary: document.querySelector("#market-summary"),
  updated: document.querySelector("#last-updated"),
  freshnessDot: document.querySelector("#freshness-dot"),
  kWaveTag: document.querySelector("#k-wave-tag"),
  kWaveSummary: document.querySelector("#k-wave-summary"),
  kWaveSignals: document.querySelector("#k-wave-signals"),
  clockTag: document.querySelector("#clock-tag"),
  macroSource: document.querySelector("#macro-source"),
  macroMetrics: document.querySelector("#macro-metrics"),
  clockCells: document.querySelectorAll(".clock-cell"),
  search: document.querySelector("#search-input"),
  industry: document.querySelector("#industry-filter"),
  tier: document.querySelector("#tier-filter"),
  heatFilter: document.querySelector("#heat-filter"),
  heatTabs: document.querySelectorAll(".heat-tab"),
  socialSource: document.querySelector("#social-source"),
  socialLeaders: document.querySelector("#social-leaders"),
  socialNote: document.querySelector("#social-note"),
  focus: document.querySelector("#focus-toggle"),
  count: document.querySelector("#visible-count"),
  table: document.querySelector("#company-table"),
  detailTitle: document.querySelector("#detail-title"),
  detailSymbol: document.querySelector("#detail-symbol"),
  detailBody: document.querySelector("#detail-body"),
};

const formatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

async function loadData() {
  const response = await fetch("./data/market.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`数据读取失败：${response.status}`);
  }
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
      reddit: {
        mentions: 0,
        posts: 0,
        comments: 0,
        upvotes: 0,
        topPosts: [],
      },
      x: {
        mentions: null,
        status: "not_configured",
      },
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

function setHeatWindow(value) {
  state.filters.heatWindow = value;
  if (elements.heatFilter.value !== value) elements.heatFilter.value = value;
  elements.heatTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.heatWindow === value);
  });
  renderSocialHeat();
  renderCompanies();
}

function setupFilters(companies) {
  elements.industry.innerHTML = optionList(companies.map((item) => item.industry))
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("");
  elements.tier.innerHTML = optionList(companies.map((item) => item.tier))
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("");

  elements.search.addEventListener("input", (event) => {
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
    setHeatWindow(event.target.value);
  });
  elements.heatTabs.forEach((button) => {
    button.addEventListener("click", () => {
      setHeatWindow(button.dataset.heatWindow);
    });
  });
  elements.focus.addEventListener("change", (event) => {
    state.filters.focusOnly = event.target.checked;
    renderCompanies();
  });
}

function scoreClass(score) {
  if (score >= 82) return "strong";
  if (score < 68) return "watch";
  return "";
}

function enrichCompany(company) {
  const quote = state.data.quotes[company.symbol] || {};
  const socialToday = socialHeatFor(company.symbol, "today");
  const socialWeek = socialHeatFor(company.symbol, "week");
  const socialCurrent = socialHeatFor(company.symbol);
  const priceChange = quote.changePercent ?? 0;
  const score =
    Math.round(
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
        return (
          b.socialCurrent.score - a.socialCurrent.score ||
          b.socialCurrent.mentions - a.socialCurrent.mentions ||
          b.score - a.score ||
          a.symbol.localeCompare(b.symbol)
        );
      }
      return b.score - a.score || b.socialToday.score - a.socialToday.score || a.symbol.localeCompare(b.symbol);
    });
}

function renderHeader() {
  const { generatedAt, sourceStatus, macro, cycles } = state.data;
  elements.summary.textContent = `当前框架：康波处于「${cycles.kondratiev.stage}」，美林时钟偏「${macro.stage}」。数据源状态：${sourceStatus.summary}`;
  elements.updated.textContent = `更新于 ${formatDate(generatedAt)}`;
  elements.freshnessDot.classList.toggle("fresh", sourceStatus.quoteOk || sourceStatus.macroOk);

  elements.kWaveTag.textContent = cycles.kondratiev.stage;
  elements.kWaveSummary.textContent = cycles.kondratiev.summary;
  elements.kWaveSignals.innerHTML = cycles.kondratiev.signals
    .map(
      (signal) => `
        <div class="signal">
          <b>${signal.title}</b>
          <span>${signal.text}</span>
        </div>
      `,
    )
    .join("");

  elements.clockTag.textContent = macro.stage;
  elements.macroSource.textContent = sourceStatus.macroOk ? "已联网更新" : "使用本地数据";
  elements.clockCells.forEach((cell) => {
    cell.classList.toggle("active", cell.dataset.stage === macro.stage);
  });
}

function renderMacro() {
  const metrics = state.data.macro.metrics;
  elements.macroMetrics.innerHTML = metrics
    .map(
      (metric) => `
        <div class="metric">
          <span>${metric.label}</span>
          <b>${metric.format === "pct" ? number(metric.value, "%") : number(metric.value)}</b>
          <small>${metric.note}</small>
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
      const topPost = item.topPost;
      return `
        <button class="heat-card" type="button" data-symbol="${item.symbol}">
          <span class="rank">${index + 1}</span>
          <span class="heat-main">
            <b>${item.symbol}</b>
            <small>${item.name}</small>
          </span>
          <span class="heat-score">${item.score}</span>
          <span class="heat-meta">${item.posts}帖 / ${item.comments}评 / ${item.mentions}次提及</span>
          <span class="heat-post">${topPost ? topPost.title : "暂无代表帖子"}</span>
        </button>
      `;
    })
    .join("");

  elements.socialLeaders.querySelectorAll(".heat-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedSymbol = card.dataset.symbol;
      if (state.filters.heatWindow === "all") setHeatWindow(selectedWindow);
      else renderCompanies();
      renderDetail(enrichCompany(state.data.companies.find((item) => item.symbol === state.selectedSymbol)));
    });
  });
}

function renderCompanies() {
  const companies = filteredCompanies();
  elements.count.textContent = `${companies.length} / ${state.data.companies.length}`;
  if (!companies.length) {
    state.selectedSymbol = null;
    elements.table.innerHTML = `<tr><td colspan="11">当前筛选条件下没有匹配股票。</td></tr>`;
    elements.detailTitle.textContent = "选择一家公司";
    elements.detailSymbol.textContent = "--";
    elements.detailBody.innerHTML = "<p>调整筛选条件后，点击表格里的公司查看详情。</p>";
    return;
  }
  if (companies.length && !companies.some((company) => company.symbol === state.selectedSymbol)) {
    state.selectedSymbol = companies[0].symbol;
  }
  elements.table.innerHTML = companies
    .map((company) => {
      const quote = company.quote;
      const isSelected = state.selectedSymbol === company.symbol;
      const changeClass = (quote.changePercent ?? 0) >= 0 ? "up" : "down";
      const currentHeat = company.socialCurrent;
      return `
        <tr data-symbol="${company.symbol}" class="${isSelected ? "selected" : ""}">
          <td>
            <div class="company-name">
              <b>${company.name}</b>
              <small>${company.description}</small>
            </div>
          </td>
          <td><b>${company.symbol}</b></td>
          <td>${company.industry}</td>
          <td>${company.tier}</td>
          <td>${quote.close ? priceFormatter.format(quote.close) : "--"}</td>
          <td class="change ${changeClass}">${pct(quote.changePercent)}</td>
          <td>${company.valuationPercentile}%</td>
          <td>${company.earningsDelivery}%</td>
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

  elements.table.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => {
      state.selectedSymbol = row.dataset.symbol;
      renderCompanies();
      renderDetail(enrichCompany(state.data.companies.find((item) => item.symbol === state.selectedSymbol)));
    });
  });

  if (!state.selectedSymbol && companies[0]) {
    state.selectedSymbol = companies[0].symbol;
    renderDetail(companies[0]);
  } else if (state.selectedSymbol) {
    renderDetail(enrichCompany(state.data.companies.find((item) => item.symbol === state.selectedSymbol)));
  }
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
    <div class="detail-block">
      <b>价格与变化</b>
      <span>${quote.close ? priceFormatter.format(quote.close) : "--"} / ${pct(quote.changePercent)}</span>
    </div>
    <div class="detail-block">
      <b>社媒热度</b>
      <span>今日 ${today.score} 分（${today.posts}帖 / ${today.comments}评），本周 ${week.score} 分（${week.posts}帖 / ${week.comments}评）。当前筛选窗口：${heatLabel(heatWindowKey())}。</span>
      <small>${topPost ? `代表帖子：${topPost.title}` : "WSB 暂无代表帖子；X 热度字段已预留，需配置 API 后接入。"}</small>
    </div>
    <div class="detail-block">
      <b>研究逻辑</b>
      <span>${company.logic}</span>
    </div>
    <div class="detail-block">
      <b>主要风险</b>
      <span>${company.risk}</span>
    </div>
    <div class="detail-block">
      <b>下一步跟踪</b>
      <span>${company.nextCheck}</span>
    </div>
  `;
}

async function init() {
  try {
    state.data = await loadData();
    setupFilters(state.data.companies);
    renderHeader();
    renderMacro();
    renderSocialHeat();
    renderCompanies();
  } catch (error) {
    elements.summary.textContent = error.message;
    elements.updated.textContent = "数据不可用";
  }
}

init();
const state = {
  data: null,
  filters: {
    query: "",
    industry: "全部",
    tier: "全部",
    focusOnly: false,
  },
  selectedSymbol: null,
};

const elements = {
  summary: document.querySelector("#market-summary"),
  updated: document.querySelector("#last-updated"),
  freshnessDot: document.querySelector("#freshness-dot"),
  kWaveTag: document.querySelector("#k-wave-tag"),
  kWaveSummary: document.querySelector("#k-wave-summary"),
  kWaveSignals: document.querySelector("#k-wave-signals"),
  clockTag: document.querySelector("#clock-tag"),
  macroSource: document.querySelector("#macro-source"),
  macroMetrics: document.querySelector("#macro-metrics"),
  clockCells: document.querySelectorAll(".clock-cell"),
  search: document.querySelector("#search-input"),
  industry: document.querySelector("#industry-filter"),
  tier: document.querySelector("#tier-filter"),
  focus: document.querySelector("#focus-toggle"),
  count: document.querySelector("#visible-count"),
  table: document.querySelector("#company-table"),
  detailTitle: document.querySelector("#detail-title"),
  detailSymbol: document.querySelector("#detail-symbol"),
  detailBody: document.querySelector("#detail-body"),
};

const formatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

async function loadData() {
  const response = await fetch("./data/market.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`数据读取失败：${response.status}`);
  }
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

function setupFilters(companies) {
  elements.industry.innerHTML = optionList(companies.map((item) => item.industry))
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("");
  elements.tier.innerHTML = optionList(companies.map((item) => item.tier))
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("");

  elements.search.addEventListener("input", (event) => {
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
  elements.focus.addEventListener("change", (event) => {
    state.filters.focusOnly = event.target.checked;
    renderCompanies();
  });
}

function scoreClass(score) {
  if (score >= 82) return "strong";
  if (score < 68) return "watch";
  return "";
}

function enrichCompany(company) {
  const quote = state.data.quotes[company.symbol] || {};
  const priceChange = quote.changePercent ?? 0;
  const score =
    Math.round(
      company.baseScore +
        (company.earningsDelivery - 70) * 0.18 -
        Math.max(company.valuationPercentile - 65, 0) * 0.14 +
        Math.max(65 - company.valuationPercentile, 0) * 0.05 +
        Math.max(Math.min(priceChange, 6), -6) * 0.7,
    );

  return {
    ...company,
    quote,
    score: Math.max(0, Math.min(100, score)),
  };
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
    .filter((company) => !state.filters.focusOnly || company.score >= 78)
    .sort((a, b) => b.score - a.score || a.symbol.localeCompare(b.symbol));
}

function renderHeader() {
  const { generatedAt, sourceStatus, macro, cycles } = state.data;
  elements.summary.textContent = `当前框架：康波处于「${cycles.kondratiev.stage}」，美林时钟偏「${macro.stage}」。数据源状态：${sourceStatus.summary}`;
  elements.updated.textContent = `更新于 ${formatDate(generatedAt)}`;
  elements.freshnessDot.classList.toggle("fresh", sourceStatus.quoteOk || sourceStatus.macroOk);

  elements.kWaveTag.textContent = cycles.kondratiev.stage;
  elements.kWaveSummary.textContent = cycles.kondratiev.summary;
  elements.kWaveSignals.innerHTML = cycles.kondratiev.signals
    .map(
      (signal) => `
        <div class="signal">
          <b>${signal.title}</b>
          <span>${signal.text}</span>
        </div>
      `,
    )
    .join("");

  elements.clockTag.textContent = macro.stage;
  elements.macroSource.textContent = sourceStatus.macroOk ? "已联网更新" : "使用本地数据";
  elements.clockCells.forEach((cell) => {
    cell.classList.toggle("active", cell.dataset.stage === macro.stage);
  });
}

function renderMacro() {
  const metrics = state.data.macro.metrics;
  elements.macroMetrics.innerHTML = metrics
    .map(
      (metric) => `
        <div class="metric">
          <span>${metric.label}</span>
          <b>${metric.format === "pct" ? number(metric.value, "%") : number(metric.value)}</b>
          <small>${metric.note}</small>
        </div>
      `,
    )
    .join("");
}

function renderCompanies() {
  const companies = filteredCompanies();
  elements.count.textContent = `${companies.length} / ${state.data.companies.length}`;
  elements.table.innerHTML = companies
    .map((company) => {
      const quote = company.quote;
      const isSelected = state.selectedSymbol === company.symbol;
      const changeClass = (quote.changePercent ?? 0) >= 0 ? "up" : "down";
      return `
        <tr data-symbol="${company.symbol}" class="${isSelected ? "selected" : ""}">
          <td>
            <div class="company-name">
              <b>${company.name}</b>
              <small>${company.description}</small>
            </div>
          </td>
          <td><b>${company.symbol}</b></td>
          <td>${company.industry}</td>
          <td>${company.tier}</td>
          <td>${quote.close ? priceFormatter.format(quote.close) : "--"}</td>
          <td class="change ${changeClass}">${pct(quote.changePercent)}</td>
          <td>${company.valuationPercentile}%</td>
          <td>${company.earningsDelivery}%</td>
          <td><span class="score ${scoreClass(company.score)}">${company.score}</span></td>
          <td class="logic-cell">${company.logic}</td>
        </tr>
      `;
    })
    .join("");

  elements.table.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => {
      state.selectedSymbol = row.dataset.symbol;
      renderCompanies();
      renderDetail(enrichCompany(state.data.companies.find((item) => item.symbol === state.selectedSymbol)));
    });
  });

  if (!state.selectedSymbol && companies[0]) {
    state.selectedSymbol = companies[0].symbol;
    renderCompanies();
    renderDetail(companies[0]);
  }
}

function renderDetail(company) {
  if (!company) return;
  const quote = company.quote || {};
  elements.detailTitle.textContent = company.name;
  elements.detailSymbol.textContent = company.symbol;
  elements.detailBody.innerHTML = `
    <div class="detail-block">
      <b>价格与变化</b>
      <span>${quote.close ? priceFormatter.format(quote.close) : "--"} / ${pct(quote.changePercent)}</span>
    </div>
    <div class="detail-block">
      <b>研究逻辑</b>
      <span>${company.logic}</span>
    </div>
    <div class="detail-block">
      <b>主要风险</b>
      <span>${company.risk}</span>
    </div>
    <div class="detail-block">
      <b>下一步跟踪</b>
      <span>${company.nextCheck}</span>
    </div>
  `;
}

async function init() {
  try {
    state.data = await loadData();
    setupFilters(state.data.companies);
    renderHeader();
    renderMacro();
    renderCompanies();
  } catch (error) {
    elements.summary.textContent = error.message;
    elements.updated.textContent = "数据不可用";
  }
}

init();
