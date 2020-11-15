'use strict';
const gulp = require('gulp');
const del = require('del');
const hb = require('gulp-hb');
const sitemap = require('gulp-sitemap');
const htmlhint = require('gulp-htmlhint');
const stylelint = require('gulp-stylelint');

const dest = 'dist';
const siteUrl = 'https://hidekiy.com';

gulp.task('clean', () => {
    return del(dest);
});

gulp.task('handlebars', () => {
    return gulp.src('src/templates/**/*.html')
        .pipe(hb().partials('src/partials/**/*.hbs'))
        .pipe(gulp.dest(dest));
});

gulp.task('static', () => {
    return gulp.src('src/static/**/*')
        .pipe(gulp.dest(dest));
});

gulp.task('sitemap', () => {
    return gulp.src(`${dest}/**/*.html`, { base: dest, read: false })
        .pipe(sitemap({
            siteUrl,
            mappings: [{
                pages: ['**/*'],
                getLoc(siteUrl, loc, entry) {
                    // Removes the file extension if it exists
                    return loc.replace(/\.\w+$/, '');
                }
            }]
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('build', gulp.series(gulp.parallel('handlebars', 'static'), 'sitemap'));

gulp.task('htmlhint', () => {
    return gulp.src(`${dest}/**/*.html`)
        .pipe(htmlhint())
        .pipe(htmlhint.failOnError());
});

gulp.task('stylelint', () => {
    return gulp.src(`${dest}/**/*.css`)
        .pipe(stylelint({
            reporters: [{
                formatter: 'string',
                console: true
            }]
        }));
});

gulp.task('test', gulp.parallel('htmlhint', 'stylelint'));

gulp.task('default', gulp.series('clean', 'build', 'test'));
