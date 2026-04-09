import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Analytics from '@/lib/models/Analytics';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ card_id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { card_id } = await params;
    await dbConnect();

    // Get analytics for the last 30 days grouped by day
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Analytics.aggregate([
      {
        $match: {
          card_id: card_id,
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format for charting
    const chartData = stats.map((s) => ({
      date: s._id,
      taps: s.count,
    }));

    return NextResponse.json(chartData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
