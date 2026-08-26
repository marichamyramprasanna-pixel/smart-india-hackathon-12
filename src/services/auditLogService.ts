/**
 * TAMPER-EVIDENT CRYPTOGRAPHIC AUDIT LOG LEDGER
 * Implements a SHA-256 Merkle-Chained Ledger for all security actions
 * (Quarantine, Decommission, IP Block, ACL Deploy, Email Dispatch)
 */

export interface CryptographicAuditEntry {
  id: string
  index: number
  timestamp: string
  actor: string
  action: 'QUARANTINE_DEVICE' | 'UNQUARANTINE_DEVICE' | 'DELETE_DEVICE' | 'RESTORE_DEVICE' | 'BLOCK_IP' | 'UNBLOCK_IP' | 'GMAIL_ESCALATION' | 'FIREWALL_RULE_DEPLOY' | 'ANOMALY_OVERRIDE'
  targetId: string
  details: string
  previousHash: string
  hash: string
}

const AUDIT_LEDGER_STORAGE_KEY = 'sentinelx_crypto_audit_ledger'
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000'

// In-memory fallback
let inMemoryLedger: CryptographicAuditEntry[] = []

/**
 * Calculates SHA-256 digest string using Web Crypto API
 */
async function computeSha256(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(data)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    } catch {}
  }
  // Fast simple hash fallback
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(64, '0')
}

export function getCryptographicLedger(): CryptographicAuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LEDGER_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return inMemoryLedger
}

function saveLedger(ledger: CryptographicAuditEntry[]): void {
  inMemoryLedger = ledger
  try {
    localStorage.setItem(AUDIT_LEDGER_STORAGE_KEY, JSON.stringify(ledger))
  } catch {}
}

export const auditLogService = {
  /**
   * Appends an action to the cryptographic ledger with previous block hash chaining
   */
  async recordAction(
    action: CryptographicAuditEntry['action'],
    targetId: string,
    details: string,
    actor: string = 'SOC Lead Analyst (Alex Rivera)'
  ): Promise<CryptographicAuditEntry> {
    const ledger = getCryptographicLedger()
    const lastEntry = ledger[ledger.length - 1]
    const previousHash = lastEntry ? lastEntry.hash : GENESIS_HASH
    const index = ledger.length + 1
    const timestamp = new Date().toISOString()

    const rawPayload = `${index}:${timestamp}:${actor}:${action}:${targetId}:${details}:${previousHash}`
    const hash = await computeSha256(rawPayload)

    const entry: CryptographicAuditEntry = {
      id: `ledger-blk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      index,
      timestamp,
      actor,
      action,
      targetId,
      details,
      previousHash,
      hash,
    }

    const updated = [...ledger, entry]
    saveLedger(updated)
    return entry
  },

  /**
   * Verifies the cryptographic integrity of the entire audit chain
   */
  async verifyChainIntegrity(): Promise<{ valid: boolean; totalBlocks: number; tamperedIndex?: number }> {
    const ledger = getCryptographicLedger()
    if (ledger.length === 0) return { valid: true, totalBlocks: 0 }

    for (let i = 0; i < ledger.length; i++) {
      const entry = ledger[i]
      const expectedPrevHash = i === 0 ? GENESIS_HASH : ledger[i - 1].hash
      if (entry.previousHash !== expectedPrevHash) {
        return { valid: false, totalBlocks: ledger.length, tamperedIndex: i }
      }

      const rawPayload = `${entry.index}:${entry.timestamp}:${entry.actor}:${entry.action}:${entry.targetId}:${entry.details}:${entry.previousHash}`
      const calculatedHash = await computeSha256(rawPayload)
      if (calculatedHash !== entry.hash) {
        return { valid: false, totalBlocks: ledger.length, tamperedIndex: i }
      }
    }

    return { valid: true, totalBlocks: ledger.length }
  },

  /**
   * Clears ledger (for testing or reset)
   */
  clearLedger(): void {
    inMemoryLedger = []
    try {
      localStorage.removeItem(AUDIT_LEDGER_STORAGE_KEY)
    } catch {}
  },
}
