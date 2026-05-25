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
