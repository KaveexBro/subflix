import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format file size to human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Format date to readable format
export function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date with time
export function formatDateTime(date: Date | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'LKR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Validate SRT file format
export function validateSRTFile(content: string): boolean {
  const lines = content.trim().split('\n');
  let isValid = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Check for subtitle number
    if (/^\d+$/.test(line)) {
      // Check for timestamp line
      if (i + 1 < lines.length && /^\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}$/.test(lines[i + 1].trim())) {
        isValid = true;
        break;
      }
    }
  }

  return isValid;
}

// Extract text from SRT file
export function extractSRTText(content: string): string {
  const lines = content.split('\n');
  const textLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip subtitle numbers and timestamps
    if (!/^\d+$/.test(line) && !/^\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}$/.test(line) && line.length > 0) {
      textLines.push(line);
    }
  }

  return textLines.join(' ');
}

// Check if user is pro and subscription is still active
export function isProSubscriptionActive(proExpiresAt: Date | null): boolean {
  if (!proExpiresAt) return false;
  return new Date() < new Date(proExpiresAt);
}

// Check if user is eligible for earnings (≥100 ratings)
export function isEligibleForEarnings(totalRatings: number): boolean {
  return totalRatings >= 100;
}

// Generate download filename
export function generateDownloadFilename(subtitleTitle: string, movieTitle: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${movieTitle.replace(/\s+/g, '_')}_${subtitleTitle.replace(/\s+/g, '_')}_${timestamp}.srt`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
