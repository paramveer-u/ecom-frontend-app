import { BACKEND_ORIGIN } from '../services/api';

export const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const FALLBACK_PRODUCT_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="#EEF2F6"/>
      <rect x="200" y="130" width="240" height="170" rx="14" fill="#17243B"/>
      <rect x="218" y="148" width="204" height="122" rx="6" fill="#2A3F63"/>
      <circle cx="320" cy="209" r="24" fill="#E66C3D"/>
      <rect x="265" y="314" width="110" height="14" rx="7" fill="#94A3B8"/>
      <text x="320" y="370" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="600" fill="#526078">ElectroMart Hardware</text>
    </svg>`
  );

export const resolveImageUrl = (url) => {
  if (!url) return FALLBACK_PRODUCT_IMAGE;
  if (url.startsWith('/uploads/')) {
    return `${BACKEND_ORIGIN}${url}`;
  }
  return url;
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Delivered':
    case 'PAID':
    case 'CAPTURED':
    case 'COD_COLLECTED':
      return 'badge-success';
    case 'Confirmed':
    case 'Processing':
    case 'Shipped':
    case 'Out for Delivery':
      return 'badge-info';
    case 'Pending':
    case 'PENDING':
    case 'COD_PENDING':
    case 'CREATED':
      return 'badge-warning';
    case 'Cancelled':
    case 'FAILED':
    case 'REFUNDED':
      return 'badge-danger';
    default:
      return 'badge-neutral';
  }
};
