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
  js: './src/zzb.js',
  distJS: './dist/zzb.js',
  minJS: './dist/zzb.min.js'
}

gulp.task('clean-js', function (cb) {
  rimraf(paths.dist, function () {
    fse.ensureDir(paths.dist, cb)
  })
})

gulp.task('lint-js', function () {
  return gulp.src([paths.js], {base: '.'})
    .pipe(eslint({}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('dist-js', function (cb) {
  // http://blog.revathskumar.com/2016/02/browserify-with-gulp.html
  var appBundler = browserify({
    entries: paths.js,
    transform: [[literalify.configure({
      'jQuery': 'window.$',
      'BootstrapDialog': 'window.BootstrapDialog',
      'lodash': 'window._'
    })]],
    cache: {},
    packageCache: {},
    fullPaths: false
  })

  appBundler
    .bundle()
    .pipe(source(paths.distJS))
    .pipe(buffer())
    .pipe(insert.prepend(pckInfo.join('\n')))
    .pipe(gulp.dest('.'))
  cb()
})

gulp.task('minify-js', function (cb) {
  return gulp.src([paths.distJS], {base: '.'})
    .pipe(concat(paths.minJS))
    .pipe(uglify())
    .pipe(insert.prepend(pckInfo.join('\n')))
    .pipe(gulp.dest('.'))
})

gulp.task('default', ['clean-js', 'lint-js', 'dist-js', 'minify-js'])
gulp.task('minify', ['minify-js'])
gulp.task('clean', ['clean-js'])
gulp.task('lint', ['lint-js'])
