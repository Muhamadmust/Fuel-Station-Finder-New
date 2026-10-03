import type { FuelType, StationWithDetails } from '../types';

export function formatTimeAgo(isoString?: string): string {
  if (!isoString) return 'No reports yet';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatPrice(price?: number): string {
  if (price === undefined || price === null || isNaN(price)) return '—';
  // Format in Nigerian Naira (₦)
  return `₦${Math.round(price).toLocaleString('en-NG')}`;
}

export function getPriceTierColor(
  price: number | undefined,
  averagePrice: number
): { bg: string; text: string; border: string; label: string } {
  if (price === undefined) {
    return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'Unreported' };
  }
  // Difference threshold for Nigerian fuel pricing in Naira (e.g., ₦25 spread)
  const diffThreshold = Math.max(25, averagePrice * 0.02);
  if (price <= averagePrice - diffThreshold) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300', label: 'Cheapest' };
  }
  if (price >= averagePrice + diffThreshold) {
    return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300', label: 'Higher' };
  }
  return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', label: 'Average' };
}

export function calculateAveragePrice(
  stations: StationWithDetails[],
  fuelType: FuelType | 'all'
): number {
  const prices: number[] = [];
  stations.forEach((st) => {
    if (fuelType === 'all') {
      if (st.currentPrices.petrol) prices.push(st.currentPrices.petrol.price);
      else if (st.currentPrices.diesel) prices.push(st.currentPrices.diesel.price);
      else if (st.currentPrices.premium) prices.push(st.currentPrices.premium.price);
    } else {
      const p = st.currentPrices[fuelType];
      if (p) prices.push(p.price);
    }
  });

  if (prices.length === 0) return 1040; // Default Nigerian petrol average (Naira/Litre)
  const sum = prices.reduce((acc, curr) => acc + curr, 0);
  return sum / prices.length;
}

export function getFlagBadgeInfo(type: string): { label: string; bg: string; text: string; border: string; icon: string } {
  switch (type) {
    case 'no_fuel':
      return {
        label: 'No Fuel',
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-300',
        icon: '⛽',
      };
    case 'long_queue':
      return {
        label: 'Long Queue',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        icon: '⏳',
      };
    case 'closed':
      return {
        label: 'Closed',
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-300',
        icon: '🚫',
      };
    case 'wrong_price':
      return {
        label: 'Wrong Price',
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        border: 'border-orange-300',
        icon: '🏷️',
      };
    default:
      return {
        label: type,
        bg: 'bg-slate-50',
        text: 'text-slate-800',
        border: 'border-slate-300',
        icon: '⚠️',
      };
  }
}
