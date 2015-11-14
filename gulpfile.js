var gulp = require('gulp');
var postcss = require('gulp-postcss');
var _ = require('lodash');

var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var csswring = require('csswring');
var browserSync = require('browser-sync').create();
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var imageOptim = require('gulp-imageoptim');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var path = require('path');

var apps = [{
  name: 'lights',
  styles: {
    src: [
      './public/styles/**/[^_]*.pcss',
      '!./public/styles/build/*.css'
    ],
    dest: './public/styles/build',
    watch: [
      './public/styles/**/*.pcss',
      '!./public/styles/build/*.css'
    ]
  },
  views: {
    src: './views/**/*.jade'
  },
  images: {
    src: [
      './public/img/**/*'
    ]
  },
  scripts: {
    src: [
      './public/js/**/*.js',
      '!./public/js/build/*.js'
    ],
    dest: './public/js/build',
    watch: [
      './public/js/**/*.js',
      '!./public/js/build/*.js'
    ]
  }
}];

var stylesTask = function(app) {
  var processors = [
      require('postcss-import'),
      require('postcss-nested'),
      require('postcss-custom-properties'),
      require('postcss-each'),
      require('postcss-custom-media'),
      autoprefixer({ browsers: ['last 2 version'] }),
      mqpacker,
      csswring({ removeAllComments: true })
  ];
  gulp.src(app.styles.src)
    .pipe(postcss(processors))
    .pipe(minifyCss())
    .pipe(rename({
      suffix: '.min',
      extname: '.css'
    }))
    .pipe(gulp.dest(app.styles.dest))
    .pipe(browserSync.stream());
};

gulp.task('styles', function() {
  _.each(apps, function(app) {
    stylesTask(app);
  });
});

gulp.task('scripts', function() {
  _.each(apps, function(app) {
    gulp.src(app.scripts.src)
      .pipe(uglify())
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(gulp.dest(app.scripts.dest));
  });
});

gulp.task('images', function() {
  _.each(apps, function(app) {
    gulp.src(app.images.src)
      .pipe(imageOptim.optimize())
      .pipe(gulp.dest(function(data) {
        return data.base;
      }));
  });
});

gulp.task('default', ['styles', 'scripts'], function() {
  browserSync.init({
    open: 'external',
    proxy: 'localhost:3100',
    port: 3100
  });

  _.each(apps, function(app) {
    gulp.watch(app.styles.watch, ['styles']);
    gulp.watch(app.views.src).on('change', browserSync.reload);

    gulp.watch(app.scripts.watch, ['scripts']);
  });
});
