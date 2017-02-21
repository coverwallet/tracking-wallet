'use strict';
/**
 * @name Main
 * @namespace
 */
(function (window) {

    /**
     * @name Logger
     * @class
     */
    var Logger = function (levelLogger) {
        this.levelLogger = levelLogger;
    };
    /**
     * Show debug Logger
     * @public
     * @name Logger#debug
     * @function
     * @param {String} Text to show
     */
    Logger.prototype.debug = function (text) {
        if(this.levelLogger >= 3) {
            if(window && window.console && window.console.debug) {
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
    Logger.prototype.info = function (text) {
        if(this.levelLogger >= 2) {
            if(window && window.console && window.console.info) {
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
    Logger.prototype.warn = function (text) {
        if(this.levelLogger >= 1) {
            if(window && window.console && window.console.warn) {
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
    Logger.prototype.error = function (text) {
        if(this.levelLogger >= 0) {
            if(window && window.console && window.console.error) {
                window.console.error(text);
            }
        }
    };

    /**
     * Generator unique ids
     */
    var Generator = function () {};

    Generator.getId = function () {
        function chr4() {
            return Math.random().toString(16).slice(-4);
        }
        return chr4() + chr4() +
            '-' + chr4() +
            '-' + chr4() +
            '-' + chr4() +
            '-' + chr4() + chr4() + chr4();
    };

    /**
     * Utility for manage cookie
     */
    var Cookie = function () {};
    Cookie.getMixpanelCookie = function(){
        if(document.cookie.length > 0) {
            var cName = document.cookie.match(/mp_\w*_mixpanel/g);
            if(cName && cName.length > 0){
                var value = Cookie.get(cName[0]);
                return JSON.parse(value);
            }
        }
        return null;
    };

    Cookie.get = function (cName) {
        if(document.cookie.length > 0) {
            var cStart = document.cookie.indexOf(cName + '=');
            if(cStart !== -1) {
                cStart = cStart + cName.length + 1;
                var cEnd = document.cookie.indexOf(';', cStart);
                if(cEnd === -1) {
                    cEnd = document.cookie.length;
                }
                return window.unescape(document.cookie.substring(cStart, cEnd));
            }
        }
        return null;
    };

    Cookie.set = function (name, value, days, domain) {
        var expires;
        if(days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        } else {
            expires = '';
        }
        if (domain) {
            var domainOption = ';domain=' + domain;
        } else {
            domainOption = '';
        }
        document.cookie = name + '=' + value + expires + '; path=/' + domainOption;
    };

    var Constants = {
        prefixNameTrakingData: 'data-tw-',
        nameTrackingEventData: 'data-tw-event',
        prefixNameTrackingOwnerDomain: 'tw-owner-domain',
        preTextLogger: 'TR-W',
        pageViewEvent: 'Page view',
        clickEvent: 'click',
        submitEvent: 'submit',
        defaultTimeout: 300,
        cookieFirst: 'CW-FirstTime',
        cookieLastPartner: 'last-partner',
        sendPageView: 'send-page-view'
    };
    var defaultData = {};
    var logger = null;
    var config = {};

    /**
     * Return String with capitalize first letter and change - by spaces
     * @public
     * @name Main#_humanReadString
     * @function
     * @param {Object} String
     */
    var _humanReadString = function (string) {
        if(string !== Constants.prefixNameTrakingData + 'event') {
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
    var _capitalize = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    /**
     * Return object with all tracking properties of the param element
     * @public
     * @name Main#_getTrackDataOfElem
     * @function
     * @param {Object} Object with all tracking properties
     */
    var _getTrackDataOfElem = function (el) {
        var attributes = el[0].attributes;
        var length, i, attr = null,
            attrObj = {};
        for(i = 0, length = attributes.length; i < length; i++) {
            attr = attributes[i];
            if(attr.name.indexOf(Constants.prefixNameTrakingData) === 0) {
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
    var _doClickElement = function (el, click) {
        el[0].click();
        setTimeout(function () {
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
    var _getSelector = function (el) {
        if(el.attr('id')) {
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
    var _bindClickEvent = function (el, attrs) {
        if(el.prop('tagName').toLowerCase() === 'a') {
            window.mixpanel.track_links('#' + _getSelector(el), _capitalize(Constants.clickEvent), attrs); // jshint ignore:line
            logger.debug('Bind event click in ' + _getSelector(el));
        } else {
            var click = function (e) {
                e.preventDefault();
                el.unbind('click', click);
                setTimeout(function () {
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
    var extractDataForm = function (el) {
        var values = {};
        window.$.each(el.find('input, select'), function (i, field) {
            if(window.$(field).data('tw-name')) {
                values[window.$(field).data('tw-name')] = window.$(field).val();
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
    var _bindSubmitEvent = function (el, attrs) {
        if(el.prop('tagName').toLowerCase() === 'form') {
            window.mixpanel.track_forms('#' + _getSelector(el), _capitalize(Constants.submitEvent), function () { // jshint ignore:line
                var values = extractDataForm(el);
                return window.$.extend({}, attrs, values);
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
    var _bindTracking = function (el) {
        var attrs = _getTrackDataOfElem(el);
        attrs = window.$.extend({}, defaultData, attrs);
        if(attrs.event) {
            var eventName = attrs.event;
            delete attrs.event;
            switch(eventName) {
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
    var _searchTrackings = function () {
        var lengthElems, i = null;
        var elements = window.$('[' + Constants.nameTrackingEventData + ']');
        if(elements && elements.length > 0) {
            lengthElems = elements.length;
            for(i = 0; i < lengthElems; i++) {
                _bindTracking(window.$(elements[i]));
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
    var _sendPageViewEvent = function () {
        logger.debug('Sending page view event');
        var el = window.$('body');
        var attrs = _getTrackDataOfElem(el);
        //saving default data
        defaultData = attrs;
        window.mixpanel.track(Constants.pageViewEvent, attrs);
    };

    var getQueryParam = function (url, param) {
        // Expects a raw URL
        param = param.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
        var regexS = '[\\?&]' + param + '=([^&#]*)',
            regex = new RegExp(regexS),
            results = regex.exec(url);
        if(results === null || (results && typeof (results[1]) !== 'string' && results[1].length)) {
            return '';
        } else {
            return decodeURIComponent(results[1]).replace(/\+/g, ' ');
        }
    };

    var contains = function (text, search) {
        return text && text.indexOf(search) >= 0;
    };

    var _isSEO = function () {
        var url = document.referrer;
        if(contains(url, 'google') || contains(url, 'bing') || contains(url, 'yahoo')) {
            return true;
        }
        return false;
    };
    var _isSocial = function () {
        var url = document.referrer;
        if(contains(url, 'facebook') || contains(url, 'twitter') || contains(url, 'plus.google') || contains(url, 'linkedin') || contains(url, 'pinterest') || contains(url, 'instagram')) {
            return true;
        }
        return false;
    };
    var _isReferral = function () {
        var url = document.referrer;
        if(!_isSocial() && !_isSEO() && url) {
            return true;
        }
        return false;
    };

    var _isDirect = function () {
        if(!_isReferral()) {
            return true;
        }
        return false;
    };

    var _getTouchSource = function () {
        var utmMedium = getQueryParam(document.URL, 'utm_medium');
        if(utmMedium) {
            return utmMedium;
        }
        if(_isSocial()) {
            return 'social';
        } else if(_isSEO()) {
            return 'seo';
        } else if(_isReferral()) {
            return 'referral';
        } else if(_isDirect()) {
            return '$direct';
        }
    };

    var formatUTM = function (utm) {
        var parts = utm.split('_');
        if (parts.length > 1){
            return parts[0].toUpperCase() + ' ' + _capitalize(parts[1]);
        }else{
             return _capitalize(utm);
        }

    };

    var _unregisterLastParams = function () {
        var utms = ['UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term', 'US State',
            'Referrer', 'Entry URL', 'Touch Source', 'Partner'],
            params = {};
        for(var index = 0; index < utms.length; ++index) {
            var prop = 'Last ' + utms[index];
            window.mixpanel.unregister(prop);
            params[prop] = '-';
        }
        // Reset People's Last params
        window.mixpanel.people.set(params);
    };

    var _getParams = function (prefix, params) {
        params[prefix + 'Referrer']     = document.referrer;
        params[prefix + 'Touch Source'] = _getTouchSource();
        params[prefix + 'Partner']      = Cookie.get(Constants.cookieLastPartner) || 'CoverWallet';
        return params;
    };

    var _getLastParams = function () {
        _unregisterLastParams();
        var campaignKeywords = 'utm_source utm_medium utm_campaign utm_content utm_term'.split(' '),
            kw = '',
            prefix = 'Last ',
            params = {};
        var index;
        for(index = 0; index < campaignKeywords.length; ++index) {
            kw = getQueryParam(document.URL, campaignKeywords[index]);
            if(kw.length) {
                params[prefix + formatUTM(campaignKeywords[index])] = kw;
            }
        }
        return _getParams(prefix, params);
    };

    var _getFirstParams = function () {
        return _getParams('First ', {});
    };

    /**
     * Save last utm params and referrer
     *
     * @private
     * @name Main#_lastTouchUTMTags
     * @function
     */
    var _lastTouchUTMTags = function () {
        var params = {};
        if(!Cookie.get(Constants.cookieFirst)){
            params = window.$.extend(params, _getFirstParams());
            var subdomains = window.location.host.split('.');
            var cookieDomain = subdomains.length > 2 ? subdomains.slice(-2).join('.') : window.location.host;
            Cookie.set(Constants.cookieFirst, true, 365, cookieDomain);
        }
        logger.debug('Obtaining params last');
        params = window.$.extend(params, _getLastParams());
        window.mixpanel.people.set(params);
        window.mixpanel.register(params);

    };

    /**
     * Start tracking logic
     *
     * @private
     * @name Main#_startTracking
     * @function
     */
    var _startTracking = function () {
        logger.debug('Starting tracking');
        try {

          if (config.calcLastAttrs && (!document.referrer || document.referrer.indexOf(config.domainName) < 0)) {
            _lastTouchUTMTags();
          }

          if (!config.hasOwnProperty('sendPageView') || config.sendPageView === true) {
            _sendPageViewEvent();
          }

          _searchTrackings();

        } catch(e) {
          console.error(e);
        }

    };

    /**
     * Init function
     *
     * @name Main#init
     * @function
     * @param {Object} initialOptions
     */
    var init = function (initialOptions) {

        config = initialOptions || {};
        var levelLogger = 0;

        if (window.$ === undefined) {
          throw new Error('Jquery not load');
        }

        if (window.mixpanel === undefined) {
          throw new Error('window.Mixpanel not load');
        }

        config.env = window.$('body').data('env') ? window.$('body').data('env').toLowerCase() : 'production';

        if (config.env !== 'production') {
          levelLogger = 3;
        }

        if (!config.hasOwnProperty('domainName') || config.domainName === null) {
          config.domainName = window.location.host.match(/\.?([^.]+)\.[^.]+.?$/)[1];
        }

        if (!config.hasOwnProperty('sendPageView') || config.sendPageView === null) {
          config.sendPageView = true;
        }
        
        if (!config.hasOwnProperty('calcLastAttrs')) {
          config.calcLastAttrs = true;
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
    var track = function (event, attrs) {
        var objectToSend = window.$.extend({}, defaultData, attrs);
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
    var identify = function (uniqueId) {
        window.mixpanel.identify(uniqueId);
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
    var alias = function (alias, original) {
        window.mixpanel.alias(alias, original);
    };

    /**
     * Set properties on a user record.
     * https://mixpanel.com/help/reference/javascript-full-api-reference#mixpanel.people.set
     *
     * @name Main#set
     * @param {Object} Properties
     * @function
     */
    var set = function (properties) {
        window.mixpanel.people.set(properties);
    };

    window.trackingWallet = {
        init: init,
        track: track,
        extractDataForm: extractDataForm,
        getMixpanelCookie: Cookie.getMixpanelCookie,
        identify: identify,
        alias: alias,
        people: {
            set: set
        }
    };

}(window));
