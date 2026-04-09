import dbConnect from '@/lib/db';
import Card from '@/lib/models/Card';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  await dbConnect();
  
  // Fetch initial cards data
  const cards = await Card.find({}).sort({ created_at: -1 }).lean();
  
  // Serialize Mongo documents
  const serializedCards = JSON.parse(JSON.stringify(cards));

  return (
    <DashboardClient initialCards={serializedCards} />
  );
}
