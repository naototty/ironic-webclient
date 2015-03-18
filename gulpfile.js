var gulp = require('gulp');
var bower = require('gulp-bower');
var mainBowerFiles = require('main-bower-files');
var filter = require('gulp-filter');
var git = require('gulp-git');
var debug = require('gulp-debug');
var notify = require('gulp-notify');
var webserver = require('gulp-webserver');
var sequence = require('gulp-sequence');
var useref = require('gulp-useref');

var dir = {
    app: './app',
    dist: './dist'
};

/**
 * Resolve all of our runtime libraries from bower.
 */
gulp.task('bower', function () {
    return bower()
        .pipe(gulp.dest('bower_components/'));
});

/**
 * Resolve all bower dependencies and add them to our app directory.
 */
gulp.task('update_dependencies', ['bower'], function () {

    var files = mainBowerFiles();

    var resolve_js = gulp.src(files)
        .pipe(filter('*.js'))
        .pipe(gulp.dest(dir.app + '/js/lib'));

    var resolve_css = gulp.src(files)
        .pipe(filter('*.css'))
        .pipe(gulp.dest(dir.app + '/css'));

    var resolve_fonts = gulp.src(files)
        .pipe(filter(['*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2']))
        .pipe(gulp.dest(dir.app + '/fonts'));

    return sequence(resolve_js, resolve_css, resolve_fonts)
});

/**
 * Start a local server and serve the raw application code. This is equivalent
 * to opening index.html in a browser.
 */
gulp.task('serve:raw', function () {
    return gulp.src(dir.app)
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});

/**
 * Package a concatenated, but not minified, application.
 */
gulp.task('package', function () {
    var assets = useref.assets();

    var concat_assets = gulp.src(dir.app + '/*.html')
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest(dir.dist));

    var copy_assets = gulp.src(
        [dir.app + '/**/*.+(eot|svg|ttf|woff|woff2)'])
        .pipe(gulp.dest(dir.dist));

    return sequence(concat_assets, copy_assets)
});