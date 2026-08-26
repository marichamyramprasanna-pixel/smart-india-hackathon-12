/**
 * SENTINELX APPLICATION SECURITY & SANITIZATION UTILITIES
 * Provides robust XSS protection, URI sanitization, and input validation guards.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
}

/**
 * Escapes HTML dangerous characters to prevent Stored & Reflected XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Validates and sanitizes destination URLs to prevent javascript: or data: URI injection
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return 'about:blank'
  const trimmed = url.trim()
  
  // Allow relative URLs, http, https, mailto
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://localhost') ||
    trimmed.startsWith('http://127.0.0.1') ||
    trimmed.startsWith('mailto:')
  ) {
    return trimmed
  }
  
  return 'about:blank'
}

/**
 * Validates strict IPv4 address format
 */
export function isValidIPv4(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false
  const parts = ip.trim().split('.')
  if (parts.length !== 4) return false
  return parts.every((part) => {
    const num = Number(part)
    return !isNaN(num) && num >= 0 && num <= 255 && String(num) === part
  })
}

/**
 * Validates IEEE 802.3 MAC Address format (XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX)
 */
export function isValidMacAddress(mac: string): boolean {
  if (!mac || typeof mac !== 'string') return false
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
  return macRegex.test(mac.trim())
}

/**
 * Simple Token Bucket rate-limiter for client-side API action flooding protection
 */
export class ClientRateLimiter {
  private timestamps: number[] = []
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  canExecute(): boolean {
    const now = Date.now()
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs)
    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now)
      return true
    }
    return false
  }

  getRemainingLimit(): number {
    const now = Date.now()
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs)
    return Math.max(0, this.maxRequests - this.timestamps.length)
  }
}
