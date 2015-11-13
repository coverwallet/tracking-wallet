'use strict';
/**
 * @name Main
 * @namespace
 */
module.exports = (function() {

    var TrackingFactory = require('tracking/TrackingFactory');
    var logger = require('lib/Logger')('Main');
    var Constants = require('Constants');
    var $ = require('JQuery');
    var Dom = require('utils/Dom');
    var client = null;

    /**
     * Do click in element
     *
     * @private
     * @name Main#_bindClickEvent
     * @param Object el Dom element
     * @param Object attrs Object with all attributes to send
     * @function
     */
    var _doClickElement = function(el) {
        el[0].click();
    };

    /**
     * Do submit in element
     *
     * @private
     * @name Main#_doSubmitElement
     * @param Object el Dom element
     * @param Object attrs Object with all attributes to send
     * @function
     */
    var _doSubmitElement = function(el) {
        el[0].submit();
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
        var click = function(e) {
            e.preventDefault();
            e.stopPropagation();
            el.unbind('click', click);
            setTimeout(function() {
                _doClickElement(el);
            }, Constants.defaultTimeout);
            client.track(Constants.clickEvent, attrs);
            return false;
        };
        el.click(click);
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
        var submit = function(e) {
            e.preventDefault();
            e.stopPropagation();
            el.unbind('submit', submit);
            setTimeout(function() {
                _doSubmitElement(el);
            }, Constants.defaultTimeout);
            var values = {};
            $.each(el.serializeArray(), function(i, field) {
                values[field.name] = field.value;
            });
            attrs.payload = values;
            client.track(Constants.submitEvent, attrs);
            return false;
        };
        el.submit(submit);
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
        var attrs = Dom.getTrackDataOfElem(el);
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
                    console.warn('Event not found! ('+ eventName +')');
            }
        } else {
            logger.error('Element has not defined event attribute');
        }
    };

    /**
     * Search dom elements that have tracking data
     *
     * @private
     * @name Main#_startTracking
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
        var attrs = Dom.getTrackDataOfElem(el);
        client.track(Constants.pageViewEvent, attrs);
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
        _sendPageViewEvent();
        _searchTrackings();
    };

    /**
     * Init function
     *
     * @name Main#init
     * @param {String} nameClient Name of client that use (mixpanel)
     * @param {String} token token authentication
     * @function
     */
    var init = function(nameClient, token) {
        client = TrackingFactory.getTrackingClient(nameClient);
        if(client){
            var promise = client.init(token);
            promise.then(_startTracking);
            promise.catch(function(e) {
                logger.error('Error to init mixpanel ' + e);
            });
        }
    };

    /**
     * Track function
     *
     * @name Main#track
     * @param {String} event Name of the event
     * @param {Object} data Data to send
     * @function
     */
    var track = function(event, data){
        client.track(event, data);
    };

    //export a tracking and init function
    global.window.trackingWallet = {
        track : track,
        init : init
    };
}());
