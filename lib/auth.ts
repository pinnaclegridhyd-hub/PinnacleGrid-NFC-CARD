import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export interface AuthUser {
  id: string;
  email: string;
  plan: string;
}

export async function signToken(user: AuthUser): Promise<string> {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan },
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

  return verifyToken(token);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
