import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Card from '@/lib/models/Card';

// Simple in-memory rate limiting map
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;

  const current = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - current.lastReset > windowMs) {
    current.count = 1;
    current.lastReset = now;
  } else {
    current.count++;
  }

  rateLimitMap.set(ip, current);
  return current.count > maxRequests;
}

export async function POST(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  // Robust IP fallback chain
  const ip = forwardedFor ? forwardedFor.split(',')[0] : (realIp || 'unknown');
  
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again after a minute.' },
      { status: 429 }
    );
  }

  try {
    await dbConnect();
    const { card_id, review_url } = await req.json();

    // 1. Basic validation
    if (!card_id || !review_url) {
      return NextResponse.json(
        { error: 'Card ID and Review URL are required.' },
        { status: 400 }
      );
    }

    // 2. Card ID format validation (Relaxed for flexibility)
    const cardIdRegex = /^[a-zA-Z0-9_-]{3,32}$/;
    if (!cardIdRegex.test(card_id)) {
      return NextResponse.json(
        { error: 'Invalid Card ID format.' },
        { status: 400 }
      );
    }

    // 3. Review URL validation (Allow standard URLs for testing and flexibility)
    const isUrl = review_url.startsWith('http://') || review_url.startsWith('https://');
    if (!isUrl) {
      return NextResponse.json(
        { error: 'Invalid URL format. Please provide a full link starting with http:// or https://' },
        { status: 400 }
      );
    }

    // 4. Find card in database
    const card = await Card.findOne({ card_id });
    if (!card) {
      return NextResponse.json(
        { error: 'Card ID not found. Only pre-generated cards can be activated.' },
        { status: 404 }
      );
    }

    // 5. Prevent duplicate activation
    if (card.is_activated) {
      return NextResponse.json(
        { error: 'This card is already activated.' },
        { status: 400 }
      );
    }

    // 6. Activate card
    card.review_url = review_url;
    card.is_activated = true;
    await card.save();

    return NextResponse.json({
      message: 'Card activated successfully!',
      card: {
        card_id: card.card_id,
        review_url: card.review_url,
        is_activated: card.is_activated,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
