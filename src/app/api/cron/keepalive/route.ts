import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron and not an external actor
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiUrl = process.env.MYQUIZA_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ error: 'MYQUIZA_API_URL not set' }, { status: 500 });
  }

  try {
    const res = await fetch(`${apiUrl}/health`, { method: 'GET' });
    logger.log(`MyQuiza keep-alive ping: ${res.status}`);
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch (error) {
    logger.error('MyQuiza keep-alive ping failed:', error);
    return NextResponse.json({ ok: false, error: 'Ping failed' }, { status: 502 });
  }
}
