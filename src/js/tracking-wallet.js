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

    Cookie.set = function (name, value, days) {
        var expires;
        if(days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        } else {
            expires = '';
        }
        document.cookie = name + '=' + value + expires + '; path=/';
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


    var _getDeviceType = function () {
      var check = false;

      (function(a){
        var deviceCategory = new RegExp([
          '(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|',
          'iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|',
          'palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|',
          'vodafone|wap|windows ce|xda|xiin|android|ipad|playbook|silko/i'].join(''));

        var browserCategory = new RegExp([
          '1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|',
           'an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|',
           'br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|',
           'dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|',
           'ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit',
           '|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|',
           'i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|',
           'kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|',
           'm3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|',
           't(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|',
           'ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|',
           'pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|',
           'qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|',
           'sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|',
           'sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|',
           'tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|',
           'veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|',
           'whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i'].join(''))

        if (deviceCategory.test(a) || browserCategory.test(a.substr(0,4))) check = true

      })(navigator.userAgent || navigator.vendor || window.opera);

      return check ? 'mobile' : 'desktop';
    }

    var _getLastParams = function () {

        var campaignKeywords = 'utm_source utm_medium utm_campaign utm_content utm_term'.split(' '),
            kw = '',
            params = {};
        var index;
        for(index = 0; index < campaignKeywords.length; ++index) {
            kw = getQueryParam(document.URL, campaignKeywords[index]);
            if(kw.length) {
                params['Last ' + formatUTM(campaignKeywords[index])] = kw;
            }
        }
        params['Last US State'] = getQueryParam(document.URL, 'state');
        params['Last Referrer'] = document.referrer;
        params['Last Entry URL'] = document.URL;
        params['Last Touch Source'] = _getTouchSource();
        params['Last Entry Device'] = _getDeviceType();
        return params;
    };

    var _getFirstParams = function () {
        var params = {};
        params['First US State'] = getQueryParam(document.URL, 'state');
        params['First Referrer'] = document.referrer;
        params['First Entry URL'] = document.URL;
        params['First Touch Source'] = _getTouchSource();
        params['First Entry Device'] = _getDeviceType();
        return params;
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
            Cookie.set(Constants.cookieFirst, true, 365);
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
          if (!document.referrer || document.referrer.indexOf(config.domainName) < 0) { // We not come from the same domain
              _lastTouchUTMTags();
          }
          if (config.sendPageView === undefined || config.sendPageView === 'true') {
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
     */
    var init = function (initialOptions) {
        config = Object.assign({}, initialOptions);
        var levelLogger = 0;

        if (window.$ === undefined) {
          throw new Error('Jquery not load');
        }

        if (window.mixpanel === undefined) {
          throw new Error('window.Mixpanel not load');
        }

        if (window.$('body').data('env') && window.$('body').data('env').toLowerCase() !== 'production') {
          levelLogger = 3;
        }

        if (!config.hasOwnProperty('domainName') || config.domainName == null) {
          config.domainName = window.location.host.match(/\.?([^.]+)\.[^.]+.?$/)[1];
        }

        config.sendPageView = window.$('body').data(Constants.sendPageView);
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
