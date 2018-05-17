'use strict';
const gulp = require('gulp');
const rimraf = require('rimraf');
const handlebars = require('gulp-compile-handlebars');

gulp.task('clean', cb => {
    rimraf('dist', cb);
});

gulp.task('handlebars', () => {
    return gulp.src('src/pages/**/*.html')
        .pipe(handlebars({}, {
            ignorePartials: true,
            batch : ['src/partials'],
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('static', () => {
    return gulp.src('src/static/**/*')
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean', 'handlebars', 'static']);
