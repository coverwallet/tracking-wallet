/**
 * Created by IntelliJ IDEA.
 * User: gilberto
 * Date: 19/05/15
 * Time: 16:56
 */

'use strict';
var Constants = require('../Constants');
var Log = require('../lib/utils/Log')('Metric');
var Server = require('../Server');
var Utils = require('../lib/utils/Utils');
var Url = require('../lib/utils/Url');
var Event = require('./../metric/event/main');
var Events = require('../lib/Events');
var Factory = require('./client/Factory');
var Video = require('../lib/video/main');
var Timer = require('./event/timer');
var $ = require('sizzle');

/**
 * @name Metric
 * @namespace
 */
module.exports = (function() {

	var onVideoPlayerReady = function(client, logtrustClient) {
        var mixpanelReady = client.onVideoPlayerReady();
        var logtrustReady = null;
        if (logtrustClient) {
            logtrustReady = logtrustClient.onVideoPlayerReady();
        }
        return function(event) {
            mixpanelReady.bind(this)(event);
            if (logtrustClient) {
                logtrustReady.bind(this)(event);
            }
        };
    };

    var onVideoPlayerStateChange = function(client, logtrustClient) {
        var mixpanelStateChange = client.onVideoStateChange();
        var logtrustStateChange = null;
        if (logtrustClient) {
            logtrustStateChange = logtrustClient.onVideoStateChange();
        }
        return function(event) {
            mixpanelStateChange.bind(this)(event);
            if (logtrustClient) {
                logtrustStateChange.bind(this)(event);
            }
        };
    };

    /**
     * Init function
     * @public
     * @name Metric#init
     * @function
     */
    var init = function() {
        Log.debug('Loading metric module');
        var dataTemplate = $(Constants.selectorTemplate);
        var dataTemplateLength = dataTemplate.length;

        for (var i = 0; i < dataTemplateLength; i++) {
            var element = dataTemplate[i];
            if (element.getAttribute('id') === null) {
                element.id = Utils.uniqueId();
            }
            Log.debug('Init metric for: ' + element);
            var group = null;
            if (Server.getSpecialUrl()) {
                group = Url.getUrlPublisher();
            } else {
                group = element.getAttribute(Constants.dataGroup) || null;
            }
            var type = element.getAttribute(Constants.dataType) || null;
            var status = element.getAttribute(Constants.dataStatus) || Constants.metricStatusActive;
            var readingTime = (element.getAttribute(Constants.dataReadingTime)!== null && !isNaN(element.getAttribute(Constants.dataReadingTime))) ? parseFloat(element.getAttribute(Constants.dataReadingTime)) : null ;

            if (null === group || null === type || null === readingTime || null === status) {
                throw new Error('Missing data the template');
            }

            var event = new Event(element, group, type);
            var client = Factory.getClient(event);

            var logtrustClient = null;


            if (status !== Constants.metricStatusActive) {
                client.trackDisable();
            }

            client.trackDisplay();
            client.trackClick('#' + element.id + ' a');
            client.trackClickCommand($(Constants.selectorClickCommand, element));
            client.trackPartyPixel($(Constants.selectorPartyPixel, element));

            if (Constants.enabledLogtrust) {
                logtrustClient = Factory.getLogtrustClient(event);
                logtrustClient.trackDisplay();
                logtrustClient.trackClick('#' + element.id + ' a');
                logtrustClient.trackClickCommand($(Constants.selectorClickCommand, element));
                logtrustClient.trackPartyPixel($(Constants.selectorPartyPixel, element));
            }

            Video.init(element, onVideoPlayerReady(client, logtrustClient), onVideoPlayerStateChange(client, logtrustClient));

            if (type !== Constants.adPositionType && 0 !== readingTime) {
                Events.addEvent(global, 'beforeunload', client.trackTime(readingTime));
                Timer.subscribe(client.trackRead(readingTime), (readingTime * 1000 * Constants.eventReadIntervalPercentage));
                if (Constants.enabledLogtrust) {
                    Events.addEvent(global, 'beforeunload', logtrustClient.trackTime(readingTime));
                    Timer.subscribe(logtrustClient.trackRead(readingTime), (readingTime * 1000 * Constants.eventReadIntervalPercentage));
                }
            }
        }
    };

    return {
        init: init
    };
})();
