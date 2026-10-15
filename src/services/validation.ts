/* src/services/validation.ts */
import type { EntityId, Restaurant, Submission } from '../types';
import { isRecord } from './storage';

export function isEntityId(value: unknown): value is EntityId {
  return typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item: unknown) => typeof item === 'string');
}

function hasOptionalStrings(value: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => value[key] === undefined || typeof value[key] === 'string');
}

export function isRestaurant(value: unknown): value is Restaurant {
  return isRecord(value)
    && isEntityId(value.id)
    && typeof value.name === 'string'
    && typeof value.category === 'string'
    && typeof value.location === 'string'
    && typeof value.rating === 'number' && Number.isFinite(value.rating)
    && typeof value.likes === 'number' && Number.isFinite(value.likes)
    && isStringArray(value.recommendedMenu)
    && hasOptionalStrings(value, ['priceRange', 'description', 'image']);
}

export function isSubmission(value: unknown): value is Submission {
  return isRecord(value)
    && isEntityId(value.id)
    && typeof value.restaurantName === 'string'
    && typeof value.category === 'string'
    && typeof value.location === 'string'
    && (value.status === 'pending' || value.status === 'approved' || value.status === 'rejected')
    && (value.recommendedMenu === undefined || isStringArray(value.recommendedMenu))
    && hasOptionalStrings(value, ['priceRange', 'review', 'submitterName', 'submitterEmail']);
}

export function isLikedRestaurants(value: unknown): value is EntityId[] {
  return Array.isArray(value) && value.every(isEntityId);
}

export function isRestaurantLikes(value: unknown): value is Record<string, number> {
  return isRecord(value)
    && Object.values(value).every((count) => typeof count === 'number' && Number.isFinite(count));
}