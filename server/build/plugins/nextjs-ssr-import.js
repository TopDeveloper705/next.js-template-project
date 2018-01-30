import { join, sep } from 'path'

// This plugin modifies the require-ensure code generated by Webpack
// to work with Next.js SSR
export default class NextJsSsrImportPlugin {
  constructor ({ dir, dist }) {
    this.dir = dir
    this.dist = dist
  }

  apply (compiler) {
    compiler.plugin('compilation', (compilation) => {
      compilation.mainTemplate.plugin('require-ensure', (code) => {
        // Update to load chunks from our custom chunks directory
        const chunksDirPath = join(this.dir, this.dist, 'dist')
        let updatedCode = code.replace('require("./"', `require("${chunksDirPath}${sep}"`)

        // Replace a promise equivalent which runs in the same loop
        // If we didn't do this webpack's module loading process block us from
        // doing SSR for chunks
        updatedCode = updatedCode.replace(
          'return Promise.resolve();',
          `return require('next/dynamic').SameLoopPromise.resolve();`
        )
        return updatedCode
      })
    })
  }
}
