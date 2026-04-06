import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const S3_URL = process.env.NEXT_PUBLIC_S3_ENDPOINT;
export const S3 = process.env.NEXT_PUBLIC_S3;
export const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const getImageUrl = (src: string) => {
  if (!src) return '';

  const normalizedSrc = src.trim();
  if (!normalizedSrc) return '';

  if (
    normalizedSrc.startsWith('http://') ||
    normalizedSrc.startsWith('https://')
  ) {
    return normalizedSrc;
  }

  if (S3 === 'true') {
    if (S3_URL && BUCKET_NAME) {
      const key = normalizedSrc.startsWith('/')
        ? normalizedSrc.slice(1)
        : normalizedSrc;
      return `${S3_URL}/${BUCKET_NAME}/${key}`;
    }
  }

  if (normalizedSrc.startsWith('/')) {
    if (API_URL) return `${API_URL}${normalizedSrc}`;
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${normalizedSrc}`;
    }
    return normalizedSrc;
  }

  if (API_URL) return `${API_URL}/${normalizedSrc}`;
  return normalizedSrc;
};
