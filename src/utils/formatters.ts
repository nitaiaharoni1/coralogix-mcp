/**
 * Utility functions for formatting travel data
 */

import { format, parseISO } from 'date-fns';

export function formatDateTime(dateTimeString: string): string {
  try {
    const date = parseISO(dateTimeString);
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return dateTimeString;
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return dateString;
  }
}

export function formatDuration(duration: string): string {
  // Convert ISO 8601 duration (PT2H30M) to readable format
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  
  if (hours && minutes) {
    return `${hours}h ${minutes}m`;
  } else if (hours) {
    return `${hours}h`;
  } else if (minutes) {
    return `${minutes}m`;
  }
  
  return duration;
}

export function formatPrice(amount: string, currency: string): string {
  const numAmount = parseFloat(amount);
  return `${currency} ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDistance(distance: number, unit: string): string {
  return `${distance.toFixed(1)} ${unit.toLowerCase()}`;
}

export function formatAirportCode(code: string): string {
  return code.toUpperCase();
}

export function formatTravelClass(travelClass: string): string {
  return travelClass.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

export function formatStops(segmentCount: number): string {
  const stops = segmentCount - 1;
  if (stops === 0) return 'Non-stop';
  if (stops === 1) return '1 stop';
  return `${stops} stops`;
} 