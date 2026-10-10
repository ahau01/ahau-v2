import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Guards the Task 5 acceptance criterion: no contract type may name an SSB
 * construct. Each has a documented replacement in primitives.ts.
 *
 * Comments are stripped before scanning, because the replacements are
 * explained in prose that necessarily names what it replaces. Flagging those
 * would be the same false positive that put a phantom crutRevision flag on
 * getSubmissions during Milestone 1 -- a word inside a comment is not a
 * dependency.
 */

const CONTRACT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')

const BANNED: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bfeedId\b/, 'IdentityId (who) and PeerId (where) -- the SSB conflation is split'],
  [/\brecps\b/, 'Visibility'],
  [/\boriginalAuthor\b/, 'Provenance'],
  [/\btombstone\b/i, 'RecordStatus'],
  [/\bintervals\b/, 'Membership.since / Membership.until']
]

const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')

function contractSources (dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) contractSources(full, acc)
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) acc.push(full)
  }
  return acc
}

test('no SSB construct is named in contract code', () => {
  const files = contractSources(CONTRACT_DIR)
  assert.ok(files.length >= 4, 'expected to find contract sources to scan')

  const offences: string[] = []
  for (const file of files) {
    const code = stripComments(readFileSync(file, 'utf8'))
    for (const [pattern, replacement] of BANNED) {
      if (pattern.test(code)) {
        offences.push(`${file}: ${pattern.source} -- use ${replacement}`)
      }
    }
  }
  assert.deepEqual(offences, [])
})

test('the scan would catch a real offence', () => {
  // Control: proves the check inspects code rather than always passing.
  const code = stripComments('export interface X { readonly feedId: string }')
  assert.ok(BANNED.some(([p]) => p.test(code)))
})

test('the scan does not flag a construct named only in a comment', () => {
  const code = stripComments('// replaces recps\nexport interface X { readonly a: string }')
  assert.ok(!BANNED.some(([p]) => p.test(code)))
})
