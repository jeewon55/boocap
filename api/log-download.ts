import type { VercelRequest, VercelResponse } from '@vercel/node';

const GAS_URL =
  'https://script.google.com/macros/s/AKfycbynXsxZMXeKOpVkGlYAt42apE2IEpdbabsfQxXA6Rvbub1-qHwRdoeLy-A1J6MsN0z9/exec';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
  } catch {
    // silent fail — logging is best-effort
  }
  res.status(200).end();
}
