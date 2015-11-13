'use strict';

var Constants = require('Constants');
var mixpanelClient = require('tracking/MixpanelClient');
var logger = require('lib/Logger')('TrackingFactory');

/**
 * @name TrackingFactory
 * @namespace
 */
module.exports = (function() {

    /**
     * Obtain client for tracking
     * @private
     * @name TrackingFactory#getTrackingClient
     * @param {String} client Name of client that use (mixpanel)
     * @function
     */
    var getTrackingClient = function(client) {
        switch (client) {
            case 'mixpanel':
                return mixpanelClient;
            default:
                logger.error('Client not found');
                throw new Error('Client not found');
        }
    };

    return {
        getTrackingClient: getTrackingClient
    };

}());
