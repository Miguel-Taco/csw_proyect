import fs from 'fs'
import path from 'path'
import { afterAll } from 'vitest'
import { getCoverageProvider } from 'vitest/node'

// Este hook fuerza a Vitest a volcar (flush) la cobertura, incluso si los tests fallaron
afterAll(async () => {
  try {
    const provider = await getCoverageProvider()
    if (provider && typeof provider.report === 'function') {
      console.log('🧾 Forzando guardado de cobertura...')
      await provider.report()
    }

    const coverageDir = path.resolve('./coverage')
    const lcovFile = path.join(coverageDir, 'lcov.info')

    if (fs.existsSync(lcovFile)) {
      console.log(`✅ Coverage real guardado en: ${lcovFile}`)
    } else {
      console.log('⚠️ No se generó coverage real, creando marcador vacío...')
      fs.mkdirSync(coverageDir, { recursive: true })
      fs.writeFileSync(lcovFile, 'TN:\nend_of_record\n')
    }
  } catch (err) {
    console.error('❌ Error al forzar la generación de cobertura:', err)
  }
})
