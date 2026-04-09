import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Card from '@/lib/models/Card';
import Analytics from '@/lib/models/Analytics';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ card_id: string }> }
) {
  const { card_id } = await params;

  // 1. Validate card_id format (Relaxed for more flexibility)
  const cardIdRegex = /^[a-zA-Z0-9_-]{3,32}$/;
  if (!cardIdRegex.test(card_id)) {
    return NextResponse.redirect(new URL('/error?type=Invalid%20ID&message=The%20identifier%20format%20is%20incorrect.%20Please%20check%20your%20link.', req.url));
  }

  try {
    await dbConnect();

    // 2. Fetch card
    const card = await Card.findOne({ card_id }).lean();

    if (!card) {
      return NextResponse.redirect(new URL(`/error?type=Not%20Found&message=Card%20ID%20${card_id}%20does%20not%20exist.%20Please%20generate%20it%20in%20the%20dashboard%20first.`, req.url));
    }

    // 3. Check activation status
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;

    if (!card.is_activated || !card.review_url) {
      return NextResponse.redirect(new URL(`/activate/${card_id}`, origin));
    }

    // 4. Async logging (Non-blocking)
    const logAnalytics = async () => {
      try {
        await dbConnect(); // Re-ensure connection in this context
        
        // Increment tap count
        await Card.updateOne({ card_id }, { $inc: { taps_count: 1 } });

        // Store detailed analytics
        const device = req.headers.get('user-agent') || 'unknown';
        const forwardedFor = req.headers.get('x-forwarded-for');
        const realIp = req.headers.get('x-real-ip');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : (realIp || 'unknown');
        
        await Analytics.create({
          card_id,
          device,
          ip,
          userAgent: device,
        });
      } catch (err) {
        console.error('Analytics logging failed:', err);
      }
    };

    // Execute logging without awaiting
    logAnalytics();

    // 5. Instant Redirect
    return NextResponse.redirect(new URL(card.review_url, origin));
  } catch (error: any) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
