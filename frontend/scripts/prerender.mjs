import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer, loadEnv } from 'vite';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectDir, 'dist');
const fileEnv = loadEnv('production', projectDir, '');
const productionHost = process.env.SITE_URL || fileEnv.SITE_URL || 
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) || 
  'https://calendar-api-web.vercel.app';

const siteUrl = new URL(productionHost);
const escapeXml = (value) => 
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
const vite = await createServer({
  root: projectDir,
  server: { middlewareMode: true },
  appType: 'custom',
  mode: 'production',
});

try {
  const { AppContent } = await vite.ssrLoadModule('/src/App.jsx');
  const { CALENDAR_GUIDES } = await vite.ssrLoadModule('/src/content/guidesData.js');

  const mainPages = [
    {
      route: '/',
      file: path.join(distDir, 'index.html'),
      title: 'India Calendar API — Free Keyless Indian Public Holidays REST API',
      description: 'A free, open-source Indian Holiday Calendar REST API. Query Central & 36 State/UT gazetted holidays, check dates, and automate HRMS leave calendars without API keys.'
    },
    {
      route: '/docs',
      file: path.join(distDir, 'docs', 'index.html'),
      title: 'API Documentation & Endpoints — India Calendar API',
      description: 'Comprehensive developer reference for all 5 Indian Calendar REST endpoints, state filters, range queries, and JSON response models.'
    },
    {
      route: '/guides',
      file: path.join(distDir, 'guides', 'index.html'),
      title: 'Technical Guides & Architecture — India Calendar API',
      description: 'Authoritative developer guides for Indian gazetted vs restricted holiday rules, HRMS payroll automation, and integration code recipes.'
    },
    {
      route: '/status',
      file: path.join(distDir, 'status', 'index.html'),
      title: 'Service Status & Latency Diagnostics — India Calendar API',
      description: 'Live service health, edge response times, uptime monitoring, and caching diagnostics for the India Calendar API.'
    }
  ];

  const guidePages = CALENDAR_GUIDES.map((g) => ({
    route: `/guides/${g.id}`,
    file: path.join(distDir, 'guides', g.id, 'index.html'),
    title: `${g.title} — India Calendar API`,
    description: g.summary
  }));

  const allPages = [...mainPages, ...guidePages];

  for (const page of allPages) {
    const body = renderToString(
      React.createElement(MemoryRouter, { initialEntries: [page.route] }, React.createElement(AppContent))
    );

    if (!body.includes('<h1') && !body.includes('<h2')) {
      throw new Error(`Prerender failed: No heading found for route ${page.route}`);
    }

    const canonical = new URL(page.route === '/' ? '' : page.route, siteUrl).href;

    const html = template
      .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeXml(page.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeXml(page.description)}" />`)
      .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${escapeXml(canonical)}" />`)
      .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escapeXml(canonical)}" />`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeXml(page.title)}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeXml(page.description)}" />`);

    await fs.mkdir(path.dirname(page.file), { recursive: true });
    await fs.writeFile(page.file, html, 'utf8');
  }

  // Generate sitemap.xml
  const sitemapEntries = allPages.map((page) => {
    const loc = new URL(page.route === '/' ? '' : page.route, siteUrl).href;
    const priority = page.route === '/' ? '1.0' : page.route.startsWith('/guides/') ? '0.8' : '0.9';
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>2026-09-28</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');

  await fs.writeFile(
    path.join(distDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`,
    'utf8'
  );

  // Generate robots.txt
  await fs.writeFile(
    path.join(distDir, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl.href}sitemap.xml\n`,
    'utf8'
  );

  console.log(`[prerender] Successfully rendered ${allPages.length} pages; generated dist/sitemap.xml & dist/robots.txt.`);
} finally {
  await vite.close();
}
