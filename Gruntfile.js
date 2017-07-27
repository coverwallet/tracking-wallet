module.exports = function(grunt) {
  'use strict';
  require('load-grunt-tasks')(grunt);

  require('time-grunt')(grunt);

  var userConfig = require('./build.config.js');
  var target = grunt.option('target') || 'dev';

  var taskConfig = {
    pkg: grunt.file.readJSON('package.json'),
    notify_hooks: {
      options: {
        enabled: true,
        max_jshint_notifications: 5,
        title: 'Tracking Wallet',
        success: true,
        duration: 3
      }
    }, // maximum number of notifications from jshint output // defaults to the name in package.json, or will use project directory's name // whether successful grunt executions should be notified automatically // the duration of notification in seconds, for `notify-send only
    clean: ['<%= buildDir %>'],
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        force: true
      },
      js: ['src/**/*.js', '!src/js/vendor/**'],
      testUnit: ['test/unit/**/*.spec.js']
    },
    compress: {
      main: {
        options: { mode: 'gzip', pretty: true },
        files: [
          {
            cwd: '<%= buildDir %>/',
            expand: true,
            src: ['tracking-wallet.js'],
            dest: '<%= buildDir %>/gzip/',
            ext: '.js'
          },
          {
            cwd: '<%= buildDir %>/',
            expand: true,
            src: ['tracking-wallet.min.js'],
            dest: '<%= buildDir %>/gzip/',
            ext: '.min.js'
          }
        ]
      }
    },
    connect: {
      serverTest: {
        options: {
          port: 3001,
          hostname: '0.0.0.0',
          base: ['build', 'test', 'src'],
          livereload: true
        }
      }
    },
    uglify: {
      options: {
        banner:
          '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      js: {
        files: {
          '<%= buildDir %>/tracking-wallet.min.js': [
            'src/js/tracking-wallet.js'
          ]
        }
      }
    },
    copy: {
      main: {
        cwd: 'src/js/',
        expand: true,
        src: 'tracking-wallet.js',
        dest: '<%= buildDir %>/'
      }
    },
    jsdoc: {
      dist: {
        src: ['src/**/*.js', 'test/unit/**/*.spec.js'],
        options: {
          destination: '<%= buildDir %>/doc',
          configure: 'jsdocConf.json',
          template: 'node_modules/ink-docstrap/template'
        }
      }
    },
    watch: {
      options: { livereload: true },
      js: { files: ['src/**/*.js'], tasks: ['jshint:js'] }
    }
  };

  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));
  grunt.registerTask('build', ['clean', 'jshint']);
  grunt.registerTask('dist', [
    'clean',
    'build',
    'copy:main',
    'uglify:js',
    'compress',
    'jsdoc'
  ]);
  grunt.registerTask('test', ['karma:unit', 'build']);
  grunt.registerTask('serve', ['build', 'connect:serverTest', 'watch']);
};
