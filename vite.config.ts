import { fileURLToPath } from 'node:url'
import { defineConfig, Plugin } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { version } from './package.json'

export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  },
  plugins: [
    solarEngine({ url: 'https://solar-dust.ru/js/libs/engine/v_1_0_0/engine.min.js' }),
    viteSingleFile({ removeViteModuleLoader: true }),
    replaceSvgUrl()
  ],
  build: {
    target: 'esnext',
    minify: false,
    modulePreload: false
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

function replaceSvgUrl(): Plugin {
  const svgUrl = 'http://www.w3.org/2000/svg'
  const svgUrlRegexp = new RegExp(svgUrl, 'g')
  const svgUrlBase64 = btoa(svgUrl)
  const svgUrlVariable = `const __SVG_URL__ = atob("${svgUrlBase64}");`

  return {
    name: 'vite:replace-svg-url',
    apply: 'build',
    generateBundle(_, bundle) {
      for (const bundleIndex in bundle) {
        const file = bundle[bundleIndex]
        if (file.type === 'chunk' && svgUrlRegexp.test(file.code)) {
          file.code =
            svgUrlVariable +
            file.code.replaceAll(svgUrlRegexp, `"+__SVG_URL__+"`)
        }
      }
    }
  }
}

interface SolarEngineOptions {
  url: string
}

function solarEngine(options: SolarEngineOptions): Plugin {
  const resolvedConfig = {
    url: new URL(options.url),
    virtualModuleId: 'engine',
    engineCode: ''
  }

  return {
    name: 'vite:solar-engine',
    resolveId(id) {
      if (id === resolvedConfig.virtualModuleId) {
        return resolvedConfig.virtualModuleId
      }
    },
    async load(id) {
      if (id === resolvedConfig.virtualModuleId) {
        if (!resolvedConfig.engineCode) {
          const response = await fetch(resolvedConfig.url)
          resolvedConfig.engineCode = await response.text()
        }

        return resolvedConfig.engineCode
      }
    },
    async config() {
      return {
        build: {
          rollupOptions: {
            external: [resolvedConfig.virtualModuleId],
            output: {
              paths: {
                engine: resolvedConfig.url.pathname
              }
            }
          }
        }
      }
    }
  }
}
