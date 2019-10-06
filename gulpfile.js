'use strict'

var gulp = require('gulp')
var fse = require('fs-extra')
var rimraf = require('rimraf')
var insert = require('gulp-insert')
var concat = require('gulp-concat')
var eslint = require('gulp-eslint')
var uglify = require('gulp-uglify')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var browserifyTools = require('browserify-transform-tools')

var path = require('path')
var util = require('util')
var pkg = require('./package.json')

var literalify = browserifyTools.makeRequireTransform('literalify', {excludeExtensions: ['json']}, function (args, opts, cb) {
  if (opts.config && args[0] in opts.config) {
    return cb(null, opts.config[args[0]])
  } else {
    return cb()
  }
})

var pckInfo = []
pckInfo.push('//! zzb.js')
pckInfo.push(util.format('//! version: %s', pkg.version))
pckInfo.push(util.format('//! author(s): %s', pkg.author.name))
pckInfo.push(util.format('//! license: %s', pkg.license))
pckInfo.push(util.format('//! %s', pkg.homepage))
pckInfo.push('')

var paths = {
  dist: path.join(__dirname, 'dist'),
  srcJSEntry: './src/zzb.js',
  distJS: './dist/zzb.js',
  minJS: './dist/zzb.min.js'
}

function cleanJS (cb) {
  rimraf(paths.dist, function () {
    fse.ensureDir(paths.dist, cb)
  })
}

function lintJS () {
  return gulp.src([paths.srcJSEntry], {base: '.'})
    .pipe(eslint({}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

function distJS (cb) {
  // http://blog.revathskumar.com/2016/02/browserify-with-gulp.html
  var appBundler = browserify({
    entries: paths.srcJSEntry,
    transform: [[literalify.configure({
      'jQuery': 'window.$',
      'BootstrapDialog': 'window.BootstrapDialog',
      'lodash': 'window._'
    })]],
    cache: {},
    packageCache: {},
    fullPaths: false
  })

  return appBundler
    .bundle()
    .pipe(source(paths.distJS))
    .pipe(buffer())
    .pipe(insert.prepend(pckInfo.join('\n')))
    .pipe(gulp.dest('.'))
}

function minifyJS () {
  return gulp.src([paths.distJS], {base: '.'})
    .pipe(concat(paths.minJS))
    .pipe(uglify())
    .pipe(insert.prepend(pckInfo.join('\n')))
    .pipe(gulp.dest('.'))
}

exports.default = gulp.series(cleanJS, lintJS, distJS, minifyJS)
exports.nomin = gulp.series(cleanJS, lintJS, distJS)
exports.minify = minifyJS
exports.clean = cleanJS
exports.lint = lintJS
