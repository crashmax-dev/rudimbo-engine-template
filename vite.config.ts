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
    viteSingleFile({ removeViteModuleLoader: true }),
    replaceSvgUrl()
  ],
  build: {
    target: 'esnext',
    minify: true
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
