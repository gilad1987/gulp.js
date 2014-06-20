/*
 npm

 install gulp-ruby-sass
 gulp-autoprefixer
 gulp-minify-css
 gulp-jshint
 gulp-concat
 gulp-uglify
 gulp-imagemin
 gulp-clean
 gulp-notify
 gulp-rename
 gulp-livereload
 gulp-cache
 gulp-inject
 gulp-strip-debug

 --save-dev

 */

/*
 To read more tasks for sass etc.

 http://markgoodyear.com/2014/01/getting-started-with-gulp/
 https://gist.github.com/markgoodyear/8497946#file-gruntfile-js
 https://gist.github.com/markgoodyear/8497946#file-gulpfile-js

*/

var gulp = require('gulp'),
//    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
//    imagemin = require('gulp-imagemin'),
//    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
//    notify = require('gulp-notify'),
//    cache = require('gulp-cache'),
//    livereload = require('gulp-livereload'),
    minifyHTML = require('gulp-minify-html'),
    stripDebug = require('gulp-strip-debug');
    inject = require("gulp-inject");


var scripts = [
    './views/js/lib/src/*.js',
    './views/js/app/**/*.srv.js',
    './views/js/app/**/*.drv.js',
    './views/js/app/*.js'
];

var styles = [
    './views/css/lib/**/*.css',
    './views/css/*.css'
];

var NAME_FILE_MINIFY_CSS = 'style.min.css';
var SRC_FILE_MINIFY_CSS = 'views/css/';
var RESOURCE_TO_CLEAN = [
    'views/css/style.min.css',
    'views/js/script.min.js'
];

var SRC_FILES_JSON = 'files.json'; // UPDATE files.json in all resource .css .js
var DST_FILES_JSON = './';

var DST_IMAGES_AFTER_COMPRESS = 'views/assets/img';
var SRC_IMAGES_TO_COMPRESS = 'src/images/**/*';

var HTML_SRC = 'index.html',
    HTML_STD = './new';

/* ----- jshint -----*/
gulp.task('jshint',function(){
    gulp.src('./views/js/lib/src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});



/* ----- minscripts -----*/
gulp.task('minscripts',function(){
    gulp.src(scripts)
        .pipe(concat('script.min.js'))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest('./views/js/'));
});

/* ----- include resource to html -----*/

// must in html fro Scripts     <!-- inject:js --><!-- endinject -->
// must in html fro Css         <!-- inject:css --><!-- endinject -->

gulp.task('inject_css_js_to_html', function() {

    var options = {
        addRootSlash:false,
        transform: function (filepath, file, i, length) {
            var tag,
                max,min;

            min=1111; max=9999;

            if(filepath.indexOf('css') != -1){
                tag = "<link rel='stylesheet' href='<filename>'>";
            }
            if(filepath.indexOf('js') != -1){
                tag = "<script src='<filename>'></script>";
            }

            return tag.replace("<filename>",filepath+'?v='+(Math.floor(Math.random() * (max - min + 1)) + min));
        }
    };

    var resources = scripts.concat(styles);

    gulp.src('index.html')
        .pipe(inject(gulp.src(resources,{read: false}),options)) // Not necessary to read the files (will speed up things), we're only after their paths
        .pipe(gulp.dest("./"));
});

/* ----- minifycss  -----*/
gulp.task('minify_css', function() {
    gulp.src(styles)
        .pipe(concat(NAME_FILE_MINIFY_CSS))
        .pipe(autoprefixer("last 2 version", "> 5%", "ie 8", "ie 7","Firefox > 15"))
        .pipe(minifycss())
        .pipe(gulp.dest(SRC_FILE_MINIFY_CSS));
});

/* ----- minhtml  -----*/
gulp.task('minhtml',function(){
    var opts = {comments:true,spare:true};

    gulp.src(HTML_SRC)
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest(HTML_STD));
});


/* ----- Clean files  -----*/
gulp.task('clean', function() {
    return gulp.src(RESOURCE_TO_CLEAN, {read: false})
        .pipe(clean());
});

/* ----- Clean files  -----*/
gulp.task('files',function(){

    var options = {
        addRootSlash:false,
        starttag: '"{{ext}}": [',
        endtag: ']',
        transform: function (filepath, file, i, length) {
            return '"' + filepath + '"' + (i + 1 < length ? ',' : '');
        }
    };

    var resources = scripts.concat(styles);

    gulp.src(SRC_FILES_JSON)
        .pipe(inject(gulp.src(resources, {read: false}), options))
        .pipe(gulp.dest(DST_FILES_JSON));

});

/* ----- Compress Images  -----*/
gulp.task('images', function() {
    return gulp.src(SRC_IMAGES_TO_COMPRESS)
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest(DST_IMAGES_AFTER_COMPRESS))
        .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('developer', ['inject_css_js_to_html'], function() {
});

gulp.task('production', ['clean'], function() {
    gulp.start('minify_css','minscripts','inject_css_js_to_html');
});


/* ----- Watch  -----*/
gulp.task('watch', function() {

    // Watch .scss files
    gulp.watch('src/styles/**/*.scss', ['styles']);

    // Watch .js files
    gulp.watch('src/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('src/images/**/*', ['images']);

});

/* ----- LiveReload  -----*/
gulp.task('watch', function() {

    // Create LiveReload server
    var server = livereload();

    // Watch any files in dist/, reload on change
    gulp.watch(['dist/**']).on('change', function(file) {
        server.changed(file.path);
    });

});