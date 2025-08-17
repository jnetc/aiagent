// src/utils/typeUtils.ts
import type { User } from '../types/index.js';
import type { Request } from 'express';

/**
 * Safely get authenticated user from Express request
 * Handles type conversion from Express.User to our User type
 */
export function getAuthenticatedUser(req: Request): User | undefined {
  return req.user as User | undefined;
}

/**
 * Check if user has Pro access (either through subscription or token gate)
 */
export function hasProAccess(user: User | undefined): boolean {
  return user ? user.pro || user.tokenGatePassed : false;
}

/**
 * Determine access level for a user
 */
export function getAccessLevel(user: User | undefined): 'guest' | 'free' | 'pro' {
  if (!user) return 'guest';
  if (user.pro || user.tokenGatePassed) return 'pro';
  return 'free';
}

/**
 * Check if current environment allows development features
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Validate user object has all required fields
 */
export function isValidUser(user: any): user is User {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.username === 'string' &&
    typeof user.displayName === 'string' &&
    typeof user.pro === 'boolean' &&
    typeof user.tokenGatePassed === 'boolean' &&
    typeof user.createdAt === 'string' &&
    typeof user.updatedAt === 'string'
  );
}

/**
 * Extract safe user data for client-side use
 */
export function getSafeUserData(user: User | undefined) {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    profileImage: user.profileImage,
    pro: user.pro,
    tokenGatePassed: user.tokenGatePassed,
    accessLevel: getAccessLevel(user),
    hasProAccess: hasProAccess(user),
  };
}
