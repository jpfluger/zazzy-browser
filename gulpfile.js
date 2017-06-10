'use strict';

var gulp = require('gulp')
var fse = require('fs-extra')
var rimraf = require('rimraf')
var insert = require('gulp-insert')
var concat = require('gulp-concat')
var eslint = require('gulp-eslint')
var uglify = require('gulp-uglify')
var path = require('path')
var util = require('util')
var pkg = require('./package.json')

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
    rimraf(paths.dist, function() {
        fse.ensureDir(paths.dist, cb)
    });
})

gulp.task('lint-js', function() {
    return gulp.src([paths.js], {base: '.'})
        .pipe(eslint({}))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
})

gulp.task('dist-js', function (cb) {
    return gulp.src([paths.js], {base: '.'})
        .pipe(insert.prepend(pckInfo.join('\n')))
        .pipe(concat(paths.distJS))
        .pipe(gulp.dest('.'));
})

gulp.task('minify-js', function () {
    return gulp.src([paths.distJS], {base: '.'})
        .pipe(concat(paths.minJS))
        .pipe(uglify())
        .pipe(insert.prepend(pckInfo.join('\n')))
        .pipe(gulp.dest('.'));
})

gulp.task('default', ['clean-js', 'lint-js', 'dist-js', 'minify-js'])
gulp.task('clean', ['clean-js'])
gulp.task('lint', ['lint-js'])
