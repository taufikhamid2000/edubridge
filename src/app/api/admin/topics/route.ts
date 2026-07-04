import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createMyQuizaTopic } from '@/lib/myquiza';
import { getSessionToken } from '@/lib/serverSession';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      chapterId,
      name,
      description,
      difficultyLevel,
      timeEstimateMinutes,
      orderIndex,
    } = body;

    if (!chapterId || !name || orderIndex === undefined) {
      return NextResponse.json(
        { error: 'chapterId, name, and orderIndex are required' },
        { status: 400 }
      );
    }

    const token = await getSessionToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const topic = await createMyQuizaTopic(
      { chapterId, name, description, difficultyLevel, timeEstimateMinutes, orderIndex },
      token
    );
    return NextResponse.json(topic);
  } catch (error) {
    logger.error('Error creating topic:', error);
    if (error instanceof Error && error.message.includes('403')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Unable to connect to the API. Please contact the administrator.' },
      { status: 500 }
    );
  }
}
