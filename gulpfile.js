'use strict';
const gulp = require('gulp');
const del = require('del');
const handlebars = require('gulp-compile-handlebars');

gulp.task('clean', () => {
    return del(['dist']);
});

gulp.task('handlebars', ['clean'], () => {
    return gulp.src('src/pages/**/*.html')
        .pipe(handlebars({}, {
            ignorePartials: true,
            batch : ['src/partials'],
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('static', ['clean'], () => {
    return gulp.src('src/static/**/*')
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['handlebars', 'static']);

gulp.task('default', ['build']);
