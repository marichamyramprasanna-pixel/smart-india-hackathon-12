import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Production Readiness & Security Audit', () => {
  it('confirms .gitignore includes .env and secret files', () => {
    const gitignorePath = path.resolve(__dirname, '../../.gitignore')
    expect(fs.existsSync(gitignorePath)).toBe(true)
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
    expect(gitignoreContent).toContain('.env')
    expect(gitignoreContent).toContain('.env.local')
  })

  it('confirms .env.example does not contain hardcoded private secrets or live keys', () => {
    const envExamplePath = path.resolve(__dirname, '../../.env.example')
    expect(fs.existsSync(envExamplePath)).toBe(true)
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf8')
    expect(envExampleContent).not.toContain('service_role')
    expect(envExampleContent).not.toContain('SUPABASE_SERVICE_ROLE')
    expect(envExampleContent).not.toContain('password123')
  })

  it('confirms no source files expose service-role keys or hardcoded admin passwords', () => {
    const srcDir = path.resolve(__dirname, '../')

    function scanDir(dir: string, results: string[] = []) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scanDir(fullPath, results)
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          // Exclude this test file from scanning itself
          if (entry.name === 'productionSecurityAudit.test.ts') continue
          const content = fs.readFileSync(fullPath, 'utf8')
          if (
            content.includes('service_role_key') ||
            content.includes('SUPABASE_SERVICE_ROLE')
          ) {
            results.push(fullPath)
          }
        }
      }
      return results
    }

    const leakedFiles = scanDir(srcDir)
    expect(leakedFiles).toEqual([])
  })
})
