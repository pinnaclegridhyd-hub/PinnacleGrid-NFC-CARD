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

    // 3. Review URL validation (Stronger validation for Google Review links)
    const isGoogleUrl = review_url.includes('google.com') || review_url.includes('g.page');
    const isHttps = review_url.startsWith('https://');
    
    if (!isHttps || !isGoogleUrl) {
      console.warn(`[Activation] Invalid URL attempt | Card: ${card_id} | URL: ${review_url} | IP: ${ip}`);
      return NextResponse.json(
        { error: 'Invalid Google Review link. Must be a valid g.page or google.com/maps review link.' },
        { status: 400 }
      );
    }

    // 4. Find card in database
    const card = await Card.findOne({ card_id });
    if (!card) {
      console.error(`[Activation] Card not found | ID: ${card_id} | IP: ${ip}`);
      return NextResponse.json(
        { error: 'Card ID not found. Only pre-generated cards can be activated.' },
        { status: 404 }
      );
    }

    // 5. Prevent duplicate activation
    if (card.is_activated) {
      console.info(`[Activation] Attempted re-activation of already active card | ID: ${card_id} | IP: ${ip}`);
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
