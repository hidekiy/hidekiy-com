'use strict';
const gulp = require('gulp');
const del = require('del');
const hb = require('gulp-hb');

gulp.task('clean', () => {
    return del(['dist']);
});

gulp.task('handlebars', gulp.series('clean', () => {
    return gulp.src('src/posts/**/*.html')
        .pipe(hb().partials('src/partials/**/*.hbs'))
        .pipe(gulp.dest('dist'));
}));

gulp.task('static', gulp.series('clean', () => {
    return gulp.src('src/static/**/*')
        .pipe(gulp.dest('dist'));
}));

gulp.task('build', gulp.parallel('handlebars', 'static'));

gulp.task('default', gulp.task('build'));
