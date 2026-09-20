import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createServer } from 'vite'

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : fallback
}

function readIntegerArgument(name, fallback) {
  const rawValue = readArgument(name, String(fallback))
  const value = Number(rawValue)

  if (!Number.isInteger(value)) {
    throw new Error(name + 'には整数を指定してください。')
  }

  return value
}

const samplesPerDifficulty = readIntegerArgument('--samples', 10_000)
const seedStart = readIntegerArgument('--seed-start', 1)
const outputPath = resolve(
  readArgument('--output', 'reports/generator-simulation-v4.json'),
)

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const { runGeneratorSimulation } = await server.ssrLoadModule(
    '/src/core/simulation/runGeneratorSimulation.ts',
  )

  let lastProgress = -1
  const report = runGeneratorSimulation({
    samplesPerDifficulty,
    seedStart,
    onProgress(completed, total) {
      const progress = Math.floor((completed / total) * 10) * 10

      if (progress !== lastProgress) {
        lastProgress = progress
        console.log('Simulation progress: ' + progress + '%')
      }
    },
  })

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n', 'utf8')

  console.table(
    report.difficultySummaries.map((summary) => ({
      requested: summary.requestedDifficulty,
      generated: summary.generatedCount,
      failed: summary.failedCount,
      averageQuality: summary.averageQuality,
      averageAttempts: summary.averageGenerationAttempts,
      maxAttempts: summary.maximumGenerationAttempts,
      averageStartScore: summary.averageStartStructuralScore,
    })),
  )

  console.log('Total: ' + report.totalGenerated + '/' + report.totalRequested)
  console.log('Result: ' + (report.allPassed ? 'PASS' : 'FAIL'))
  console.log('Report: ' + outputPath)

  if (!report.allPassed) {
    console.error(JSON.stringify(report.failures.slice(0, 20), null, 2))
    process.exitCode = 1
  }
} finally {
  await server.close()
}

