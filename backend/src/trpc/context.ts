import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

/**
 * tRPC request context
 * Adds the authenticated `user` (when available) to the context so that
 * procedures can perform authorization checks.
 */
export async function createContext({ req, res }: CreateExpressContextOptions) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  let user: User | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      user = await User.findByPk(decoded.id);
    } catch (_err) {
      // Invalid token –  user remains null (treated as anonymous)
    }
  }

  return { req, res, user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;