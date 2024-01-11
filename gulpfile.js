'use strict';
const del = require('del');
const gulp = require('gulp');
const gulpFileInclude = require('gulp-file-include');
const gulpHb = require('gulp-hb');
const gulpHtmlhint = require('gulp-htmlhint');
const gulpSitemap = require('gulp-sitemap');
const gulpStylelint = require('gulp-stylelint');
const stylelint = require('stylelint');

const dest = 'dist';
const siteUrl = 'https://hidekiy.com';

gulp.task('clean', () => {
    return del(dest);
});

gulp.task('handlebars', () => {
    return gulp.src('src/templates/**/*.html')
        .pipe(gulpHb().partials('src/partials/**/*.hbs'))
        .pipe(gulp.dest(dest));
});

gulp.task('static', () => {
    return gulp.src('src/static/**/*')
        .pipe(gulp.dest(dest));
});

gulp.task('include', () => {
    return gulp.src(`${dest}/**/*.html`)
        .pipe(gulpFileInclude({indent: true}))
        .pipe(gulp.dest(dest));
});

gulp.task('sitemap', () => {
    return gulp.src(`${dest}/**/*.html`, { base: dest, read: false })
        .pipe(gulpSitemap({
            siteUrl,
            lastmod: new Date(0),
            mappings: [{
                pages: ['**/*'],
                getLoc(siteUrl, loc, entry) {
                    // Removes the file extension if it exists
                    return loc.replace(/\.\w+$/, '');
                }
            }],
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('build', gulp.series(gulp.parallel('handlebars', 'static'), 'include', 'sitemap'));

gulp.task('htmlhint', () => {
    return gulp.src(`${dest}/**/*.html`)
        .pipe(gulpHtmlhint())
        .pipe(gulpHtmlhint.failOnError());
});

gulp.task('stylelint', async () => {
    return gulp.src(`${dest}/**/*.css`)
        .pipe(gulpStylelint({
            quietDeprecationWarnings: true,
            reporters: [{
                console: true,
                formatter: await stylelint.formatters.string,
            }],
        }));
});

gulp.task('test', gulp.parallel('htmlhint', 'stylelint'));

gulp.task('default', gulp.series('clean', 'build', 'test'));
