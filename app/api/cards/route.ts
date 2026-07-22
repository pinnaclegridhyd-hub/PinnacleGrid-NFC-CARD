import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Card from '@/lib/models/Card';
import { getAuthUser } from '@/lib/auth';

// GET all cards
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const cards = await Card.find({}).sort({ created_at: -1 });

    return NextResponse.json(cards);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new card (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { 
      card_id,
      client_name,
      client_company,
      client_phone,
      client_email,
      client_address
    } = await req.json();

    if (!card_id) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const existingCard = await Card.findOne({ card_id });
    if (existingCard) {
      return NextResponse.json({ error: 'Card ID already exists' }, { status: 400 });
    }

    const card = await Card.create({ 
      card_id,
      client_name,
      client_company,
      client_phone,
      client_email,
      client_address
    });
    return NextResponse.json(card, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
