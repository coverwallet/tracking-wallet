'use strict';

var Constants = require('Constants');
var mixpanelClient = require('tracking/MixpanelClient');

/**
 * @name TrackingFactory
 * @namespace
 */
module.exports = (function() {

    /**
     * Obtain client for tracking
     * @private
     * @name TrackingFactory#getTrackingClient
     * @function
     */
    var getTrackingClient = function() {
        switch (Constants.trackingClient) {
            case 'mixpanel':
                return mixpanelClient;
            default:

        }
    };

    return {
        getTrackingClient: getTrackingClient
    };

}());
