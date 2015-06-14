"use strict";
var del = require("del");
var gulp = require("gulp");
var shell = require("gulp-shell");
var mocha = require("gulp-mocha");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var glob = require('glob');

var paths = {
    pattern: "./{build,test}/**/*.js",
    powered_test: "./powered-test/**.js",
    powered_test_dist: "./powered-test/"
};

var tsconfig = require("./tsconfig.json");

gulp.task("clean", function(cb) {
  return del(['build', paths.powered_test_dist], cb);
});

//gulp.task("compile", shell.task("./tsc"));

gulp.task("power-assert", function(cb) {
  var files = glob.sync(paths.pattern);
  var b = browserify({ entries: files, debug: true });
  b.transform('espowerify');
  return b.bundle()
   .pipe(source('all_test.js'))
   .pipe(gulp.dest(paths.powered_test_dist));
});
gulp.task("test", ["power-assert"], function(cb) {
    return gulp.src(paths.powered_test)
        .pipe(mocha());
});
