const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')
const util = require('util')
const pkg = require('./package.json')

const SRC_DIR = path.join(__dirname, 'src')
const DIST_DIR = path.join(__dirname, 'dist')

const minimizeAndMangle = (process.env.ZZBMINIMZIZE === 'true')
let filename = 'zzb.ui.js'
if (minimizeAndMangle) {
  filename = 'zzb.ui.min.js'
}

const pckInfo = []
pckInfo.push(util.format('//! %s v%s (%s)', filename, pkg.version, pkg.homepage))
pckInfo.push(util.format('//! MIT License; Copyright 2017-2023 %s', pkg.author.name))

module.exports = {
  mode: 'production',
  entry: path.join(SRC_DIR, 'zzb.ui.js'),
  output: {
    path: DIST_DIR,
    filename: filename
  },
  plugins: [
    new webpack.BannerPlugin({ banner: pckInfo.join('\n'), raw: true, entryOnly: true })
  ],
  optimization: {
    minimize: minimizeAndMangle, // always run Terser
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          format: {
            comments: false, // remove all comments
          },
          compress: minimizeAndMangle, // only compress if env flag is true
          mangle: minimizeAndMangle    // only mangle if env flag is true
        }
      })
    ]
  }
}

// const webpack = require('webpack')
// const TerserPlugin = require('terser-webpack-plugin')
//
// const path = require('path')
// const util = require('util')
// const pkg = require('./package.json')
// const SRC_DIR = path.join(__dirname, 'src')
// const DIST_DIR = path.join(__dirname, 'dist')
//
// const minimizeAndMangle = (process.env.ZZBMINIMZIZE === 'true')
// let filename = 'zzb.ui.js'
// if (minimizeAndMangle) {
//   filename = 'zzb.ui.min.js'
// }
//
// const pckInfo = []
// pckInfo.push(util.format('//! %s v%s (%s)', filename, pkg.version, pkg.homepage))
// pckInfo.push(util.format('//! MIT License; Copyright 2017-2023 %s', pkg.author.name))
//
// module.exports = {
//   mode: 'production',
//   entry: path.join(SRC_DIR, 'zzb.ui.js'),
//   output: {
//     path: DIST_DIR,
//     filename: filename
//   },
//   plugins: [
//     new webpack.BannerPlugin({ banner: pckInfo.join('\n'), raw: true, entryOnly: true })
//   ],
//   optimization: {
//     minimize: minimizeAndMangle,
//     minimizer: [
//       new TerserPlugin({
//         parallel: true,
//         extractComments: false, // don't extract to a separate file
//         terserOptions: {
//           format: {
//             comments: false // remove ALL comments
//           }
//         }
//       })
//     ]
//   }
// }
