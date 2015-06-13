"use strict";
var del = require("del");
var gulp = require("gulp");
var shell = require("gulp-shell");
var espower = require("gulp-espower");
var mocha = require("gulp-mocha");

var paths = {
    test: "./test/*.js",
    powered_test: "./powered-test/*.js",
    powered_test_dist: "./powered-test/"
};

var tsconfig = require("./tsconfig.json");

gulp.task("clean", function(cb) {
  return del(['build'], cb);
});

//gulp.task("compile", shell.task("./tsc"));

gulp.task("power-assert", function(cb) {
    return gulp.src(paths.test)
        .pipe(espower())
        .pipe(gulp.dest(paths.powered_test_dist));
});
gulp.task("test", ["power-assert"], function(cb) {
    return gulp.src(paths.powered_test)
        .pipe(mocha());
});
