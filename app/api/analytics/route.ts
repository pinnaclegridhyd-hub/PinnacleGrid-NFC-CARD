import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Analytics from '@/lib/models/Analytics';
import { getAuthUser } from '@/lib/auth';

function getDeviceType(ua: string = '') {
  const lowercaseUa = ua.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(lowercaseUa)) {
    return 'Tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(lowercaseUa)) {
    return 'Mobile';
  }
  return 'Desktop';
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '7D';

    await dbConnect();

    // 1. Calculate the start date based on the period
    const now = new Date();
    let startDate = new Date();
    let daysCount = 7;

    if (period === '7D') {
      startDate.setDate(now.getDate() - 7);
      daysCount = 7;
    } else if (period === '30D') {
      startDate.setDate(now.getDate() - 30);
      daysCount = 30;
    } else if (period === '90D') {
      startDate.setDate(now.getDate() - 90);
      daysCount = 90;
    } else if (period === 'All') {
      const earliestRecord = await Analytics.findOne({}).sort({ timestamp: 1 }).lean();
      if (earliestRecord && earliestRecord.timestamp) {
        startDate = new Date(earliestRecord.timestamp);
        const diffTime = Math.abs(now.getTime() - startDate.getTime());
        daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      } else {
        startDate.setDate(now.getDate() - 30);
        daysCount = 30;
      }
    }

    startDate.setHours(0, 0, 0, 0);

    // 2. Fetch all matching analytics records
    const records = await Analytics.find({
      timestamp: { $gte: startDate }
    }).lean();

    // 3. Generate date sequence with 0s to make sure no gaps exist
    const chartDataMap: { [key: string]: number } = {};
    const dateList: { key: string; label: string }[] = [];

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i + 1);
      
      const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
      let label = '';
      if (daysCount <= 7) {
        label = d.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      }
      
      chartDataMap[key] = 0;
      dateList.push({ key, label });
    }

    // 4. Fill in data from records
    const hourCounts: { [key: number]: number } = {};
    const uniqueIps = new Set<string>();
    const deviceCounts: { [key: string]: number } = { Mobile: 0, Desktop: 0, Tablet: 0 };
    const cardCounts: { [key: string]: number } = {};

    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0;
    }

    let totalTaps = 0;

    records.forEach((record: any) => {
      const timestamp = new Date(record.timestamp);
      const key = timestamp.toISOString().split('T')[0];
      if (chartDataMap[key] !== undefined) {
        chartDataMap[key]++;
      }
      totalTaps++;

      const hr = timestamp.getHours();
      hourCounts[hr] = (hourCounts[hr] || 0) + 1;

      if (record.ip) {
        uniqueIps.add(record.ip);
      }

      // Device categorization
      const deviceType = getDeviceType(record.device || record.userAgent);
      deviceCounts[deviceType]++;

      // Top Cards categorization
      if (record.card_id) {
        cardCounts[record.card_id] = (cardCounts[record.card_id] || 0) + 1;
      }
    });

    // Populate chartData array
    const chartData = dateList.map(item => ({
      name: item.label,
      taps: chartDataMap[item.key] || 0
    }));

    // Find peak hour
    let peakHour = 14; // Default to 2 PM
    let maxHourCount = 0;
    for (let i = 0; i < 24; i++) {
      if (hourCounts[i] > maxHourCount) {
        maxHourCount = hourCounts[i];
        peakHour = i;
      }
    }

    const peakTimeFormatted = (() => {
      const ampm = peakHour >= 12 ? 'PM' : 'AM';
      const hr12 = peakHour % 12 || 12;
      return `${hr12}:00 ${ampm}`;
    })();

    // Calculate metrics
    const avgScans = daysCount > 0 ? (totalTaps / daysCount).toFixed(1) : '0.0';
    const uniqueReachCount = uniqueIps.size;

    // Format devices breakdown
    const totalCategorized = deviceCounts.Mobile + deviceCounts.Desktop + deviceCounts.Tablet || 1;
    const devicesBreakdown = [
      { name: 'Mobile', value: deviceCounts.Mobile, percentage: Math.round((deviceCounts.Mobile / totalCategorized) * 100) },
      { name: 'Desktop', value: deviceCounts.Desktop, percentage: Math.round((deviceCounts.Desktop / totalCategorized) * 100) },
      { name: 'Tablet', value: deviceCounts.Tablet, percentage: Math.round((deviceCounts.Tablet / totalCategorized) * 100) },
    ];

    // Format top active cards
    const topCards = Object.entries(cardCounts)
      .map(([card_id, count]) => ({ card_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      chartData,
      stats: {
        avgScansPerDay: avgScans,
        peakTime: totalTaps > 0 ? peakTimeFormatted : 'N/A',
        uniqueReach: uniqueReachCount.toString(),
        systemHealth: 'Nominal'
      },
      devices: devicesBreakdown,
      topCards
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
