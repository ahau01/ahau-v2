import path from 'node:path'
import { fileURLToPath } from 'node:url'

process.env.NODE_ENV = 'production'

const { build } = await import('vite')
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const normalise = (value) => value.replaceAll('\\', '/')
const expectedPresent = normalise(path.resolve(repoRoot, 'src/app/main.ts'))
const forbiddenModules = [
  normalise(path.resolve(repoRoot, 'src/profile/pretend-client.ts'))
]

const output = await build({ logLevel: 'silent', build: { write: false } })
const chunks = (Array.isArray(output) ? output : [output])
  .flatMap((result) => result.output)
  .filter((item) => item.type === 'chunk')

if (chunks.length === 0) {
  throw new Error('The app build check is broken: Rollup returned no chunks.')
}

const moduleIds = chunks.flatMap((chunk) => Object.keys(chunk.modules).map(normalise))

if (moduleIds.length === 0 || !moduleIds.includes(expectedPresent)) {
  throw new Error('The app build check is broken: Rollup returned no usable module graph containing src/app/main.ts.')
}

for (const forbiddenModule of forbiddenModules) {
  const offendingChunk = chunks.find((chunk) =>
    Object.keys(chunk.modules).map(normalise).includes(forbiddenModule)
  )

  if (offendingChunk) {
    throw new Error(
      `Production app build includes ${path.relative(repoRoot, forbiddenModule)} in ${offendingChunk.fileName}; ` +
      'a lost import.meta.env.DEV guard in src/app/main.ts is the likely cause.'
    )
  }
}
