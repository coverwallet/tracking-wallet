'use strict';
module.exports = function(config) {
    config.set({

        basePath: '',

        frameworks: ['browserify', 'jasmine'],

        files: [
			'node_modules/jasmine-ajax/lib/mock-ajax.js',
			'src/**/*.js',
            'test/unit/**/*.js'
        ],

        exclude: [],

        preprocessors: {

            'src/**/*.js': ['browserify'],
			'test/unit/**/*.js': ['browserify']
        },

        reporters: ['progress', 'junit', 'coverage'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: false,

        browsers: ['PhantomJS'],

        browserify: {
            debug: true,
            paths: ['src/js'],
            transform: ['browserify-shim', 'browserify-istanbul']
        },

        plugins: [
            'karma-phantomjs-launcher', 'karma-jasmine',
			'karma-browserify', 'karma-junit-reporter',
			'karma-coverage', 'karma-chrome-launcher'
        ],

        singleRun: true,

        junitReporter: {
            outputFile: 'build/report/unit-test.xml',
            suite: ''
        },
        coverageReporter: {
            dir: 'build/report/coverage/',
            reporters:[
                { type: 'cobertura', subdir: '.', file: 'coverage.txt' },
                { type: 'html', subdir: 'report-html' }
            ]
        }
    });
};
