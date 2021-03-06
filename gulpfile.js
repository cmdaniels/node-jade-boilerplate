var dest = './_dist',
  src = '.';

var gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  changed = require('gulp-changed'),
  concat = require('gulp-concat'),
  del = require('del'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  notify = require('gulp-notify'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass'),
  uglify = require('gulp-uglify'),
  gutil = require('gulp-util'),
  ftp = require('vinyl-ftp'),
  lr = require('tiny-lr')(),
  server = require('gulp-express');

var FTP_CONFIG = {
		host: 'mywebsite.tld',
		user: 'me',
		password: 'mypass',
		parallel: 10,
		log: gutil.log
};

var AUTOPREFIXER_BROWSERS = [
  'ie >= 8',
  'ie_mob >= 8',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 2.1',
  'bb >= 10'
];

// Error handling
function errorAlert(error) {
  var filename;
  var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ': ' : '';
  if (error.fileName) {
    filename = (error.fileName).split('/');
    filename = filename[filename.length - 1];
  } else {
    filename = '';
  }

  notify({
    subtitle: error.plugin.toUpperCase() + ' caused an error.',
    title: lineNumber + filename,
    sound: 'Glass' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
  }).write(error);

  // Pretty error reporting
  var report = '';
  var chalk = gutil.colors.white.bgRed;

  report += chalk('TASK:') + ' [' + error.plugin + ']\n';
  report += chalk('PROB:') + ' ' + error.message + '\n';
  if (error.lineNumber) {
    report += chalk('LINE:') + ' ' + error.lineNumber + '\n';
  }
  if (error.fileName) {
    report += chalk('FILE:') + ' ' + error.fileName + '\n';
  }
  console.error(report);

  // Prevent the 'watch' task from stopping
  this.emit('end');
}

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {
  server.run(['app.js']);
  gulp.watch(src + "/assets/sass/*.sass", function(event){
        gulp.start('sass');
        server.notify(event);
  });
  gulp.watch([src + "/assets/js/*.js", src + "/controllers/*.js", src + "/models/*.js", "!" + src + "/assets/js/jquery*.js"], function(event){
        gulp.start('js');
        server.run(['app.js']);
  });
  gulp.watch(src + "/views/templates/*.jade", server.notify);
  gulp.watch(src + "/views/*.jade", server.notify);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
  return gulp.src(src + "/assets/sass/*.sass")
    .pipe(plumber({
      errorHandler: errorAlert
    }))
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['chrome >= 40']
    })) // no autoprefixing needed in development
    .pipe(gulp.dest(src + '/assets/css/'));
});

// Handle errors
gulp.task('js', ['controller', 'model'], function() {
  return gulp.src([src + '/assets/js/*.js'])
    .pipe(plumber({
      errorHandler: errorAlert
    }));
});

gulp.task('controller', function() {
  return gulp.src([src + '/controllers/*.js'])
    .pipe(plumber({
      errorHandler: errorAlert
    }));
});

gulp.task('model', function() {
  return gulp.src([src + '/models/*.js'])
    .pipe(plumber({
      errorHandler: errorAlert
    }));
});

// compress images
gulp.task('compress', function() {
  return gulp.src(src + '/assets/img/**')
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(dest + '/assets/img/'));
});

// PRODUCTION
gulp.task('sass-prod', function() {
  return gulp.src(src + "/assets/sass/*.sass")
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(autoprefixer({
      browsers: AUTOPREFIXER_BROWSERS
    }))
    .pipe(gulp.dest(dest + '/assets/css/'));
});

gulp.task('js-prod', function() {
  // uglify JS
  return gulp.src(src + '/assets/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(dest + '/assets/js/'));
});

gulp.task('copy-files-root', function() {
  // but do not copy the assets folder
  return gulp.src([src + '/**/*', "!" + src + "/node_modules/**/*", "!" + src + "/_dist/**/*", "!" + src + "/_dist", "!" + src + "/assets/**/*"])
    .pipe(changed(dest))
    .pipe(gulp.dest(dest));
});

// Preparing files for production: First, run the 'js' task, afterwards ...
gulp.task('production', ['compress', 'js-prod', 'sass-prod', 'copy-files-root']);

// alias task name
gulp.task('prod', ['compress', 'js-prod', 'sass-prod', 'copy-files-root']);

// Clean Output Directory
gulp.task('clear', del.bind(null, [dest + '/**/*'], {
  dot: true
}));

// Easy FTP-upload
gulp.task('deploy', ['prod'], function() {
  var conn = ftp.create(FTP_CONFIG);
  return gulp.src('./_dist/**/*', {
      base: '_dist',
      buffer: false
    })
    .pipe(conn.newer('/')) // only upload newer files
    .pipe(conn.dest('/'));
});

// Default: turn the server on and refresh/inject on change!
gulp.task('default', ['serve']);
