'use strict';

var fs = require('fs');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var sass = require('gulp-sass')(require('sass'));

// /////////////////////////////////////////////////////////////////////////////
// --------------------------- Variables -------------------------------------//
// ---------------------------------------------------------------------------//

// The package.json
var pkg;

// Environment
// Set the correct environment, which controls what happens in config.js
if (!process.env.DS_ENV) {
  if (!process.env.TRAVIS_BRANCH || process.env.TRAVIS_BRANCH !== process.env.DEPLOY_BRANCH) {
    process.env.DS_ENV = 'staging';
  } else {
    process.env.DS_ENV = 'production';
  }
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var watching = false;

// /////////////////////////////////////////////////////////////////////////////
// ------------------------- Helper functions --------------------------------//
// ---------------------------------------------------------------------------//

function readPackage () {
  pkg = JSON.parse(fs.readFileSync('package.json'));
}
readPackage();

// /////////////////////////////////////////////////////////////////////////////
// ------------------------- Browserify tasks --------------------------------//
// ------------------- (Not to be called directly) ---------------------------//
// ---------------------------------------------------------------------------//

// Compiles the user's script files to bundle.js.
// When including the file in the index.html we need to refer to bundle.js not
// main.js
gulp.task('javascript', function () {
  var watcher = browserify({
    entries: ['./app/assets/scripts/main.js'],
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  });

  if (watching) {
    watcher = watchify(watcher);
  }

  function bundler () {
    if (pkg.dependencies) {
      watcher.external(Object.keys(pkg.dependencies));
    }
    return watcher.bundle()
      .on('error', function (e) {
        console.log('Javascript error:', e);
      })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      // Source maps.
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('.tmp/assets/scripts'))
      .pipe(reload({stream: true}));
  }

  watcher
  .on('log', gutil.log)
  .on('update', bundler);

  return bundler();
});

// Vendor scripts. Basically all the dependencies in the package.js.
// Therefore be careful and keep the dependencies clean.
gulp.task('vendorScripts', function () {
  // Ensure package is updated.
  readPackage();
  var vb = browserify({
    debug: true,
    require: pkg.dependencies ? Object.keys(pkg.dependencies) : []
  });
  return vb.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp/assets/scripts/'))
    .pipe(reload({stream: true}));
});

// //////////////////////////////////////////////////////////////////////////////
// --------------------------- Helper tasks -----------------------------------//
// ----------------------------------------------------------------------------//

gulp.task('styles', function () {
  return gulp.src('app/assets/styles/main.scss')
    .pipe($.sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.'].concat(require('node-bourbon').includePaths).concat(['node_modules/jeet/scss'])
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/assets/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('html', gulp.series('styles', function () {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe($.if(/\.(css|js)$/, rev()))
    .pipe(revReplace())
    .pipe(gulp.dest('dist'));
}));

gulp.task('images', function () {
  return gulp.src('app/assets/graphics/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/assets/graphics'));
});

gulp.task('fonts', function () {
  return gulp.src('app/assets/fonts/**/*')
    .pipe(gulp.dest('.tmp/assets/fonts'))
    .pipe(gulp.dest('dist/assets/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/**/*',
    '!app/*.html',
    '!app/assets/graphics/**',
    '!app/assets/vendor/**',
    '!app/assets/styles/**',
    '!app/assets/scripts/**'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

// /////////////////////////////////////////////////////////////////////////////
// ------------------------- Callable tasks ----------------------------------//
// ---------------------------------------------------------------------------//

gulp.task('clean', function () {
  return del(['.tmp', 'dist'])
    .then(function () {
      $.cache.clearAll();
    });
});

gulp.task('serve', gulp.series(function () {
  watching = true;
}, gulp.parallel('vendorScripts', 'javascript', 'styles', 'fonts'), function () {
  browserSync({
    port: 3000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/node_modules': './node_modules'
      }
    }
  });

  // watch for changes
  gulp.watch([
    'app/*.html',
    'app/assets/graphics/**/*',
    '.tmp/assets/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/assets/styles/**/*.scss', ['styles']);
  gulp.watch('app/assets/fonts/**/*', ['fonts']);
  gulp.watch('package.json', ['vendorScripts']);
}));

gulp.task('build', gulp.series(gulp.parallel('vendorScripts', 'javascript'), gulp.parallel('html', 'images', 'fonts', 'extras'), function () {
  return gulp.src('dist/**/*')
    .pipe($.size({title: 'build', gzip: true}));
}));

gulp.task('default', gulp.parallel('clean', 'build'));
