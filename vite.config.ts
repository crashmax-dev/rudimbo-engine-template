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
    minify: 'terser',
    modulePreload: false,
    terserOptions: {
      format: {
        comments: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})


interface Replacer {
  variableName: string
  regexp: RegExp
  code: string
}

function replaceSvgUrl(): Plugin {
  const urls = [
    'https://vuejs.org/error',
    'http://www.w3.org/2000/svg',
    'http://www.w3.org/1998/Math/MathML',
    'http://www.w3.org/1999/xlink',
  ]

  function createUrlReplacer(url: string): Replacer {
    const regexp = new RegExp(url, 'g')
    const base64 = btoa(url)
    const variableName = url.split('/').at(-1)!
    const code = `const __${variableName}__ = atob('${base64}');`

    return {
      variableName,
      regexp,
      code,
    }
  }

  return {
    name: 'vite:replace-svg-url',
    apply: 'build',
    generateBundle(_, bundle) {
      for (const bundleIndex in bundle) {
        const file = bundle[bundleIndex]
        if (file.type === 'chunk') {
          const replacers: Replacer[] = []
          for (const url of urls) {
            replacers.push(createUrlReplacer(url))
          }

          let code = file.code
          for (const replacer of replacers) {
            code = code.replaceAll(
              replacer.regexp,
              `"+__${replacer.variableName}__+"`,
            )
          }

          file.code = replacers
            .map((replacer) => replacer.code)
            .join('') + code
        }
      }
    },
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
