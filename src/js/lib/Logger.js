'use strict';

var Constants = require('Constants');
var preTextLogger = Constants.preTextLogger;

/**
 * @name Logger
 * @class
 */
var Logger = function(preModuleText) {
	this.preText = preTextLogger || 'General';
	this.preText = this.preText + ' ' + preModuleText.trim() + ': ';
};

/**
 * Show debug Logger
 * @public
 * @name Logger#debug
 * @function
 * @param {String} Text to show
 */
Logger.prototype.debug = function(text) {
    if(Constants.levelLogger >= 3){
        if (global.window && global.window.console && global.window.console.debug) {
            global.window.console.debug(this.preText + text);
        }
    }
};

/**
 * Show info Logger
 * @public
 * @name Logger#info
 * @function
 * @param {String} Text to show
 */
Logger.prototype.info = function(text) {
    if(Constants.levelLogger >= 2){
        if (global.window && global.window.console && global.window.console.info) {
            global.window.console.info(this.preText + text);
        }
    }
};

/**
 * Show warn Logger
 * @public
 * @name Logger#warn
 * @function
 * @param {String} Text to show
 */
Logger.prototype.warn = function(text) {
    if(Constants.levelLogger >= 1){
        if (global.window && global.window.console && global.window.console.warn) {
            global.window.console.warn(this.preText + text);
        }
    }
};

/**
 * Show error Logger
 * @public
 * @name Logger#error
 * @function
 * @param {String} Text to show
 */
Logger.prototype.error = function(text) {
    if(Constants.levelLogger >= 0){
        if (global.window && global.window.console && global.window.console.error) {
            global.window.console.error(this.preText + text);
        }
    }
};

var LoggerFun = function(preTextLogger){
    return new Logger(preTextLogger);
};

module.exports = LoggerFun;
