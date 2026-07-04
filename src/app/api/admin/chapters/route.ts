import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createMyQuizaChapter } from '@/lib/myquiza';
import { getSessionToken } from '@/lib/serverSession';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId, name, form, orderIndex } = body;

    if (!subjectId || !name || form === undefined || orderIndex === undefined) {
      return NextResponse.json(
        { error: 'subjectId, name, form, and orderIndex are required' },
        { status: 400 }
      );
    }

    const token = await getSessionToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chapter = await createMyQuizaChapter(
      { subjectId, name, form, orderIndex },
      token
    );
    return NextResponse.json(chapter);
  } catch (error) {
    logger.error('Error creating chapter:', error);
    if (error instanceof Error && error.message.includes('403')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Unable to connect to the API. Please contact the administrator.' },
      { status: 500 }
    );
  }
}
