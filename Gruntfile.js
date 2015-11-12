module.exports = function(grunt) {
    'use strict';
    require('load-grunt-tasks')(grunt);

    require('time-grunt')(grunt);


    var userConfig = require('./build.config.js');
    var target = grunt.option('target') || 'dev';

    var taskConfig = {


        pkg: grunt.file.readJSON('package.json'),

        'notify_hooks': {
            options: {
                enabled: true,
                'max_jshint_notifications': 5, // maximum number of notifications from jshint output
                title: 'Tracking Wallet', // defaults to the name in package.json, or will use project directory's name
                success: true, // whether successful grunt executions should be notified automatically
                duration: 3 // the duration of notification in seconds, for `notify-send only
            }
        },



        clean: [
            '<%= buildDir %>'
        ],

        jshint: {

            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish'),

                force: true
            },
            js: ['src/**/*.js', '!src/js/tracking/Mixpanel.js'],
            testUnit: ['test/unit/**/*.spec.js']
        },
        replace: {
            prod: {
                options: {
                    patterns: [{
                        match: /require/g,
                        replacement: '_dereq_'
                    }, {
                        match:'levelLogger',
                        replacement: '0'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= buildDir %>/tracking-wallet.js'],
                    dest: '<%= buildDir %>/'
                }]
            },
            staging: {
                options: {
                    patterns: [{
                        match: /require/g,
                        replacement: '_dereq_'
                    }, {
                        match:'levelLogger',
                        replacement: '1'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= buildDir %>/tracking-wallet.js'],
                    dest: '<%= buildDir %>/'
                }]
            },
            dev: {
                options: {
                    patterns: [{
                        match: /require/g,
                        replacement: '_dereq_'
                    }, {
                        match:'levelLogger',
                        replacement: '3'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= buildDir %>/tracking-wallet.js'],
                    dest: '<%= buildDir %>/'
                }]
            }
        },
        browserify: {

            dev: {
                options: {
                    browserifyOptions: {
                        debug: true,
                        paths: ['src/js'],
                        plugin: [
                            ['browserify-derequire']
                        ]
                    }
                },
                files: {
                    '<%= buildDir %>/tracking-wallet.js': ['<%= devDir %>/js/**/*.js'],
                }
            },
            dist: {
                options: {
                    browserifyOptions: {
                        debug: false,
                        paths: ['src/js'],
                        plugin: [
                            ['browserify-derequire']
                        ]
                    }
                },
                files: {
                    '<%= buildDir %>/tracking-wallet.js': ['<%= devDir %>/js/**/*.js'],
                }
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'gzip',
                    pretty: true
                },
                files: [{
                    cwd: '<%= buildDir %>/',
                    expand: true,
                    src: ['tracking-wallet.js'],
                    dest: '<%= buildDir %>/gzip/',
                    ext: '.js'
                }, {
                    cwd: '<%= buildDir %>/',
                    expand: true,
                    src: ['tracking-wallet.min.js'],
                    dest: '<%= buildDir %>/gzip/',
                    ext: '.min.js'
                }]
            }
        },
        connect: {
            serverTest: {
                options: {
                    port: 3001,
                    hostname: '0.0.0.0',
                    base: ['build', 'test'],
                    livereload: true
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            js: {
                files: {
                    '<%= buildDir %>/tracking-wallet.min.js': ['<%= buildDir %>/tracking-wallet.js']
                }
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            },
            unitWatch: {
                configFile: 'karmaWatch.conf.js'
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
            options: {
                livereload: true
            },
            js: {
                files: ['src/**/*.js'],
                tasks: ['jshint:js', 'browserify:dev', 'replace:' + target/*, 'karma:unitWatch'*/]
            },
            testUnit: {
                files: ['test/unit/**/*.js'],
                tasks: ['jshint:testUnit', 'karma:unitWatch']
            }
        },

    };



    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));
    grunt.registerTask('build', ['clean', 'jshint', 'browserify:dev', 'replace:dev']);
    grunt.registerTask('dist', ['clean', 'build', 'browserify:dist', 'replace:' + target, 'uglify:js', 'compress', 'jsdoc']);
    grunt.registerTask('test', ['karma:unit', 'build']);
    grunt.registerTask('serve', ['build', 'connect:serverTest',  'watch']);

};
