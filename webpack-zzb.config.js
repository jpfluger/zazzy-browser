const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')
const util = require('util')
const pkg = require('./package.json')

const SRC_DIR = path.join(__dirname, 'src')
const DIST_DIR = path.join(__dirname, 'dist')

const minimizeAndMangle = (process.env.ZZBMINIMZIZE === 'true')
let filename = 'zzb.js'
if (minimizeAndMangle) {
  filename = 'zzb.min.js'
}

const pckInfo = []
pckInfo.push(util.format('//! %s v%s (%s)', filename, pkg.version, pkg.homepage))
pckInfo.push(util.format('//! MIT License; Copyright 2017-2023 %s', pkg.author.name))

module.exports = {
  mode: 'production',
  entry: path.join(SRC_DIR, 'zzb.js'),
  output: {
    path: DIST_DIR,
    filename: filename
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: pckInfo.join('\n'),
      raw: true,
      entryOnly: true
    })
  ],
  optimization: {
    minimize: minimizeAndMangle, // always minimize so comments are stripped
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          format: {
            comments: false // remove ALL comments, even JSDoc
          },
          compress: minimizeAndMangle, // compress only if flag is set
          mangle: minimizeAndMangle    // mangle only if flag is set
        }
      })
    ]
  }
}
