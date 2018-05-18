'use strict';
const gulp = require('gulp');
const del = require('del');
const hb = require('gulp-hb');

gulp.task('clean', () => {
    return del(['dist']);
});

gulp.task('handlebars', ['clean'], () => {
    return gulp.src('src/posts/**/*.html')
        .pipe(hb().partials('src/partials/**/*.hbs'))
        .pipe(gulp.dest('dist'));
});

gulp.task('static', ['clean'], () => {
    return gulp.src('src/static/**/*')
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['handlebars', 'static']);

gulp.task('default', ['build']);
