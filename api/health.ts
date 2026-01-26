import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.json({ 
    status: 'ok',
    service: 'AmeriLend API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
