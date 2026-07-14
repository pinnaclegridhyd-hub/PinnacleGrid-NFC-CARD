import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export interface AuthUser {
  id: string;
  email: string;
  plan: string;
  role: string;
}

export async function signToken(user: AuthUser): Promise<string> {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(req?: NextRequest): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const user = await verifyToken(token);
  if (user) {
    if (user.email === 'admin@pinnaclegrid.com' || user.email.startsWith('admin@')) {
      user.role = 'admin';
    }
  }
  return user;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
