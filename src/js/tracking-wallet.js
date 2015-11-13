'use strict';
/**
 * @name Main
 * @namespace
 */
(function(window, $) {

    /**
     * @name Logger
     * @class
     */
    var Logger = function(levelLogger) {
        this.levelLogger = levelLogger;
    };
    /**
     * Show debug Logger
     * @public
     * @name Logger#debug
     * @function
     * @param {String} Text to show
     */
    Logger.prototype.debug = function(text) {
        if (this.levelLogger >= 3) {
            if (window && window.console && window.console.debug) {
                window.console.debug(text);
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
        if (this.levelLogger >= 2) {
            if (window.window && window.window.console && window.window.console.info) {
                window.window.console.info(this.preText + text);
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
        if (this.levelLogger >= 1) {
            if (window.window && window.window.console && window.window.console.warn) {
                window.window.console.warn(this.preText + text);
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
        if (this.levelLogger >= 0) {
            if (window.window && window.window.console && window.window.console.error) {
                window.window.console.error(this.preText + text);
            }
        }
    };

    /**
     * Generator unique ids
     */
    var Generator = function() {};

    Generator.getId = function() {
        return Math.floor(Math.random() * 26) + Date.now();
    };


    var Constants = {
        prefixNameTrakingData: 'data-tw-',
        nameTrackingEventData: 'data-tw-event',
        preTextLogger: 'TR-W',
        pageViewEvent: 'Page view',
        clickEvent: 'click',
        submitEvent: 'submit',
        defaultTimeout: 300
    };
    var logger = null;

    /**
     * Return object with all tracking properties of the param element
     * @public
     * @name Main#_getTrackDataOfElem
     * @function
     * @param {Object} Object with all tracking properties
     */
    var _getTrackDataOfElem = function(el) {
        var attributes = el[0].attributes;
        var length, i, attr = null,
            attrObj = {};
        for (i = 0, length = attributes.length; i < length; i++) {
            attr = attributes[i];
            if (attr.name.startsWith(Constants.prefixNameTrakingData)) {
                attrObj[attr.name.replace(Constants.prefixNameTrakingData, '')] = attr.value;
            }
        }
        return attrObj;
    };



    /**
     * Do click in element and bind after the timeout the same callback to track clicks
     *
     * @private
     * @name Main#_bindClickEvent
     * @param Object el Dom element
     * @param Object attrs Object with all attributes to send
     * @function
     */
    var _doClickElement = function(el, click) {
        el[0].click();
        setTimeout(function() {
            el.on('click', click);
        }, 200);
    };


    /**
     * Obtain unique id of the element. If it has not id, generate it
     *
     * @private
     * @name Main#_getSelector
     * @param Object el Dom element
     * @function
     */
    var _getSelector = function(el) {
        if (el.attr('id')) {
            return el.attr('id');
        }
        var randomId = Generator.getId();
        el.attr('id', randomId);
        return randomId;
    };

    /**
     * Track click event
     *
     * @private
     * @name Main#_bindClickEvent
     * @param Object el Dom element
     * @param Object attrs Object with all attributes to send
     * @function
     */
    var _bindClickEvent = function(el, attrs) {
        if (el.prop('tagName').toLowerCase() === 'a') {
            window.mixpanel.track_links('#' + _getSelector(el), Constants.clickEvent, attrs);
        } else {
            var click = function(e) {
                e.preventDefault();
                el.unbind('click', click);
                setTimeout(function() {
                    _doClickElement(el, click);
                }, Constants.defaultTimeout);
                window.mixpanel.track(Constants.clickEvent, attrs);
            };
            el.on('click', click);
        }

    };

    /**
     * Track submit event
     *
     * @private
     * @name Main#_bindSubmitEvent
     * @param Object el Dom element
     * @param Object attrs Object with all attributes to send
     * @function
     */
    var _bindSubmitEvent = function(el, attrs) {
        if (el.prop('tagName').toLowerCase() === 'form') {
            window.mixpanel.track_forms('#' + _getSelector(el), Constants.submitEvent, function() {
                var values = {};
                $.each(el.serializeArray(), function(i, field) {
                    values['form_' + field.name] = field.value;
                });
                return $.extend({}, attrs, values);
            });
        } else {
            console.error('submit event if only allowed in form tags');
        }
    };

    /**
     * Bind events to throw tracking
     *
     * @private
     * @name Main#_bindTracking
     * @param Object el Dom element
     * @function
     */
    var _bindTracking = function(el) {
        var attrs = _getTrackDataOfElem(el);
        if (attrs.event) {
            var eventName = attrs.event;
            delete attrs.event;
            switch (eventName) {
                case Constants.clickEvent:
                    _bindClickEvent(el, attrs);
                    break;
                case Constants.submitEvent:
                    _bindSubmitEvent(el, attrs);
                    break;
                default:
                    console.warn('Event not found! (' + eventName + ')');
            }
        } else {
            logger.error('Element has not defined event attribute');
        }
    };

    /**
     * Search dom elements that have tracking data
     *
     * @private
     * @name Main#_searchTrackings
     * @function
     */
    var _searchTrackings = function() {
        var lengthElems, i = null;
        var elements = $('[' + Constants.nameTrackingEventData + ']');
        if (elements && elements.length > 0) {
            lengthElems = elements.length;
            for (i = 0; i < lengthElems; i++) {
                _bindTracking($(elements[i]));
            }
        }
    };

    /**
     * Send page view event
     *
     * @private
     * @name Main#_sendPageViewEvent
     * @function
     */
    var _sendPageViewEvent = function() {
        logger.debug('Sending page view event');
        var el = $('body');
        var attrs = _getTrackDataOfElem(el);
        window.mixpanel.track(Constants.pageViewEvent, attrs);
    };

    /**
     * Start tracking logic
     *
     * @private
     * @name Main#_startTracking
     * @function
     */
    var _startTracking = function() {
        logger.debug('Starting tracking');
        try {
            _sendPageViewEvent();
            _searchTrackings();
        } catch (e) {
            console.error(e);
        }

    };

    /**
     * Init function
     *
     * @name Main#init
     * @param {String} token token authentication
     * @param {Number} levelLogger 0: error, 1: warn, 2: info, 3: debug
     * @function
     */
    var init = function(levelLogger) {
        if ($ === undefined) {
            throw new Error('Jquery not load');
        }
        if (window.mixpanel === undefined) {
            throw new Error('window.Mixpanel not load');
        }

        logger = new Logger(levelLogger);
        _startTracking();
        window.mixpanel.set_config({
            debug:levelLogger === 3
        });

    };

    //export a tracking and init function
    window.trackingWallet = {
        init: init
    };
}(window, jQuery));
