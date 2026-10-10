import test from 'node:test'
import assert from 'node:assert/strict'

import { CONTRACT_VERSION } from './index.js'

test('toolchain smoke test: contract module compiles and loads', () => {
  assert.equal(CONTRACT_VERSION, '0.0.0-draft')
})
