import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

/**
 * Standard paginated response type
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Standard response for single items
 */
export interface SingleResponse<T> {
  data: T;
}

/**
 * Standard error response type
 */
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
  };
}

/**
 * Converter for Postgrest responses to our standard paginated format
 */
export function toPaginatedResponse<T>(
  response: PostgrestResponse<T>,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  return {
    data: response.data || [],
    total: response.count || 0,
    page,
    pageSize,
    hasMore: (response.count || 0) > page * pageSize,
  };
}

/**
 * Converter for Postgrest single response to our standard format
 */
export function toSingleResponse<T>(
  response: PostgrestSingleResponse<T>,
): SingleResponse<T> {
  if (response.error || !response.data) {
    throw new Error(response.error?.message || "No data found");
  }
  return {
    data: response.data,
  };
}
