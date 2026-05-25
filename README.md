# 康波 × 美林时钟投资研究仪表盘

这是一个轻量静态网站原型，用来把「长期康波主线」和「短中期美林时钟」落到行业与公司研究池里。

## 本地运行

```bash
npm run update
npm run dev
```

打开：

```text
http://localhost:4173
```

## 每天自动更新

仓库里已经包含 GitHub Actions 工作流：

```text
.github/workflows/daily-update.yml
```

默认每天北京时间早上约 06:30 运行一次：

1. 拉取公开免费行情和宏观数据。
2. 生成最新的 `data/market.json`。
3. 构建 `dist/` 并发布到 GitHub Pages。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库，比如 `daily-investment-research-site`。
2. 在本地执行：

```bash
git init
git add .
git commit -m "init daily investment research site"
git branch -M main
git remote add origin https://github.com/<你的用户名>/daily-investment-research-site.git
git push -u origin main
```

3. 打开 GitHub 仓库：

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

4. 到 `Actions` 页面手动运行一次 `Daily Market Site Deploy`，之后交易日会自动更新并重新发布。

## 当前免费版数据边界

- 股票行情：默认尝试使用 Stooq 免费行情，可能延迟或缺失。
- 宏观数据：默认尝试使用 FRED 免费 CSV。
- 估值分位、盈利兑现程度：当前是研究池里的手工评分字段，用来做筛选和排序。后续可以接入 Financial Modeling Prep、Alpha Vantage、TIKR、Koyfin 或自建数据库。

## 下一步可升级

- 接入付费基本面 API，自动计算 PE/PS/PB 历史分位。
- 加入财报日历、新闻摘要、SEC 10-Q/10-K 链接。
- 部署到 GitHub Pages、Vercel 或 Cloudflare Pages。
- 用 Vercel Cron 或 GitHub Actions 替代本地更新。
