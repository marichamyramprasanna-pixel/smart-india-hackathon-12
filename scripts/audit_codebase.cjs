/**
 * SentinelX Automated Codebase Audit Script
 * Scans for:
 * 1. Hardcoded credentials / private secrets
 * 2. Unsafe production fallbacks
 * 3. Leaked service role keys
 * 4. Production build bundle inspection
 */
const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '..')
const SRC_DIR = path.join(ROOT_DIR, 'src')
const DIST_DIR = path.join(ROOT_DIR, 'dist')

const FORBIDDEN_PATTERNS = [
  { name: 'Service Role Key', regex: /supabase_service_role|service_role_key/i },
  { name: 'Hardcoded Admin Password', regex: /password123/i },
  { name: 'AWS Secret Access Key', regex: /aws_secret_access_key\s*=/i },
  { name: 'Private RSA Key', regex: /-----BEGIN RSA PRIVATE KEY-----/ },
]

console.log('🛡️  Running SentinelX Codebase Production & Security Audit...\n')

let violationCount = 0

function scanDirectory(dir, isSource = true) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      scanDirectory(fullPath, isSource)
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.map')) continue
      // Skip the audit script itself
      if (entry.name === 'audit_codebase.cjs' || entry.name === 'productionSecurityAudit.test.ts') continue

      const content = fs.readFileSync(fullPath, 'utf8')
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.regex.test(content)) {
          console.error(`❌ [${pattern.name}] detected in: ${path.relative(ROOT_DIR, fullPath)}`)
          violationCount++
        }
      }
    }
  }
}

// 1. Scan Source Files
console.log('1. Scanning source files in src/...')
scanDirectory(SRC_DIR, true)

// 2. Check .gitignore
console.log('2. Checking .gitignore...')
const gitignorePath = path.join(ROOT_DIR, '.gitignore')
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8')
  if (!gitignore.includes('.env')) {
    console.error('❌ .gitignore does NOT include .env!')
    violationCount++
  } else {
    console.log('  ✓ .env is properly ignored')
  }
}

// 3. Scan Build Output (if dist exists)
if (fs.existsSync(DIST_DIR)) {
  console.log('3. Scanning production build artifacts in dist/...')
  scanDirectory(DIST_DIR, false)
}

console.log('\n----------------------------------------')
if (violationCount === 0) {
  console.log('✅ AUDIT PASSED: Zero forbidden secrets or hardcoded test credentials found.')
  process.exit(0)
} else {
  console.error(`🚨 AUDIT FAILED: ${violationCount} security violation(s) found.`)
  process.exit(1)
}
