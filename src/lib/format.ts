/**
 * Format a number as Indian currency (₹ with lakhs/crores notation)
 */
export function formatIndianCurrency(amount: number): string {
  if (amount === 0) return '₹0'
  if (amount < 0) return `-₹${formatIndianCurrencyAbsolute(Math.abs(amount))}`
  return `₹${formatIndianCurrencyAbsolute(amount)}`
}

function formatIndianCurrencyAbsolute(amount: number): string {
  // For amounts >= 1 crore (1,00,00,000)
  if (amount >= 10000000) {
    const crores = amount / 10000000
    return crores % 1 === 0
      ? `${crores.toFixed(0)} Cr`
      : `${crores.toFixed(2).replace(/\.?0+$/, '')} Cr`
  }
  // For amounts >= 1 lakh (1,00,000)
  if (amount >= 100000) {
    const lakhs = amount / 100000
    return lakhs % 1 === 0
      ? `${lakhs.toFixed(0)} L`
      : `${lakhs.toFixed(2).replace(/\.?0+$/, '')} L`
  }
  // For smaller amounts, use full Indian number format with commas
  return amount.toLocaleString('en-IN')
}

/**
 * Format a number with Indian comma separators (full precision)
 */
export function formatIndianNumber(amount: number): string {
  return amount.toLocaleString('en-IN')
}

/**
 * Format amount as ₹ with full Indian comma notation
 */
export function formatRupees(amount: number): string {
  return `₹${formatIndianNumber(amount)}`
}

/**
 * Format a date string to a readable format
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format a date string to a readable datetime format
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get status badge color classes
 */
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'Cleared':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Failed':
    case 'Bounced':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

export function getVisitStatusColor(status: string): string {
  switch (status) {
    case 'Scheduled':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'In Progress':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Cancelled':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'No Show':
      return 'bg-slate-100 text-slate-600 border-slate-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

export function getCommissionStatusColor(status: string): string {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Approved':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Hold':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}
