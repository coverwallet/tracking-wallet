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
            if (window && window.console && window.console.info) {
                window.console.info(text);
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
            if (window && window.console && window.console.warn) {
                window.console.warn(text);
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
            if (window && window.console && window.console.error) {
                window.console.error(text);
            }
        }
    };

    /**
     * Generator unique ids
     */
    var Generator = function() {};

    Generator.getId = function() {
        function chr4() {
            return Math.random().toString(16).slice(-4);
        }
        return chr4() + chr4() +
            '-' + chr4() +
            '-' + chr4() +
            '-' + chr4() +
            '-' + chr4() + chr4() + chr4();
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
    var defaultData = {};
    var logger = null;

    /**
     * Return String with capitalize first letter and change - by spaces
     * @public
     * @name Main#_humanReadString
     * @function
     * @param {Object} String
     */
    var _humanReadString = function(string) {
        if (string !== Constants.prefixNameTrakingData + 'event') {
            var text = string.replace(Constants.prefixNameTrakingData, '');
            text = text.replace('-', ' ');
            return _capitalize(text);
        } else {
            return string.replace(Constants.prefixNameTrakingData, '');
        }
    };

    /**
     * Return String with capitalize first letter
     * @public
     * @name Main#_capitalize
     * @function
     * @param {Object} String
     */
    var _capitalize = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

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
            if (attr.name.indexOf(Constants.prefixNameTrakingData) === 0) {
                attrObj[_humanReadString(attr.name)] = attr.value;
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
        el.attr('id', 'tw-' + randomId);
        return 'tw-' + randomId;
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
            window.mixpanel.track_links('#' + _getSelector(el), _capitalize(Constants.clickEvent), attrs); // jshint ignore:line
            logger.debug('Bind event click in ' + _getSelector(el));
        } else {
            var click = function(e) {
                e.preventDefault();
                el.unbind('click', click);
                setTimeout(function() {
                    _doClickElement(el, click);
                }, Constants.defaultTimeout);
                window.mixpanel.track(_capitalize(Constants.clickEvent), attrs);
            };
            el.on('click', click);
        }

    };

    /**
     * Extract data of form to send in mixpanel object
     *
     * @private
     * @name Main#extractDataForm
     * @param Object el Dom element
     * @function
     */
    var extractDataForm = function(el) {
        var values = {};
        $.each(el.find('input, select'), function(i, field) {
            if ($(field).data('tw-name')) {
                values[$(field).data('tw-name')] = $(field).val();
            }
        });
        return values;
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
            window.mixpanel.track_forms('#' + _getSelector(el), _capitalize(Constants.submitEvent), function() { // jshint ignore:line
                var values = extractDataForm(el);
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
        attrs = $.extend({}, defaultData, attrs);
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
        //saving default data
        defaultData = attrs;
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
     * @function
     */
    var init = function() {
        if ($ === undefined) {
            throw new Error('Jquery not load');
        }
        if (window.mixpanel === undefined) {
            throw new Error('window.Mixpanel not load');
        }
        var levelLogger = 0;
        if($('body').data('env') && $('body').data('env').toLowerCase() !== 'production'){
            levelLogger = 3;
        }

        logger = new Logger(levelLogger);
        window.mixpanel.set_config({ // jshint ignore:line
            debug: levelLogger === 3
        });
        _startTracking();


    };

    /**
     * Track event and complete attributes with default data of page (body data attributes)
     *
     * @name Main#track
     * @param {String} event Name of event
     * @param {Object} attrs Attributes to send
     * @function
     */
    var track = function(event, attrs){
        var objectToSend = $.extend({}, defaultData, attrs);
        window.mixpanel.track(event, objectToSend);
    };

    /**
     * Identify a user with a unique ID. All subsequent actions caused by this user will be tied to this unique ID.
     * https://mixpanel.com/help/reference/javascript-full-api-reference#mixpanel.identify
     *
     * @name Main#identify
     * @param {String} unique_id A string that uniquely identifies a user
     * @function
     */
    var identify = function(unique_id){
        window.mixpanel.identify(unique_id);
    };

    /**
     * Create an alias, which Mixpanel will use to link two distinct_ids going forward
     * https://mixpanel.com/help/reference/javascript-full-api-reference#mixpanel.alias
     *
     * @name Main#alias
     * @param {String} alias A unique identifier that you want to use for this user in the future
     * @param {String} original The current identifier being used for this user
     * @function
     */
    var alias = function(alias, original){
        window.mixpanel.alias(alias, original);
    };

    window.trackingWallet = {
        init: init,
        track: track,
        extractDataForm: extractDataForm,
        identify: identify,
        alias: alias,
        people: window.mixpanel.people
    };

}(window, jQuery));
