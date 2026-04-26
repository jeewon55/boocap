import type { VercelRequest, VercelResponse } from '@vercel/node';

const GAS_URL =
  'https://script.google.com/macros/s/AKfycbynXsxZMXeKOpVkGlYAt42apE2IEpdbabsfQxXA6Rvbub1-qHwRdoeLy-A1J6MsN0z9/exec';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  try {
    const body = JSON.stringify(req.body);
    console.log('[log-download] calling GAS with body:', body);
    const gasRes = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    });
    const text = await gasRes.text();
    console.log('[log-download] GAS response:', gasRes.status, text);
  } catch (err) {
    console.error('[log-download] GAS fetch error:', err);
  }
  res.status(200).end();
}
