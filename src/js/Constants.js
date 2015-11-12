'use strict';


/**
 * @name Constants
 * @class
 */
var Constants = function() {};

/**
 * Name of data attribute that contains values to save
 * @name Constants#prefixNameTrakingData
 * @type String
 * @default 'data-mx-'
 */
Constants.prefixNameTrakingData = 'data-tw-';

/**
 * Name of data attribute that contains the event name. This data is required
 * @name Constants#nameTrackingEventData
 * @type String
 * @default 'data-mx-event'
 */
Constants.nameTrackingEventData = 'data-tw-event';

/**
 * Default client to tracking
 * @name Constants#trackingClient
 * @type String
 * @default 'mixpanel'
 */
Constants.trackingClient = '@@trackingClient';


/**
 * Default level logger
 * values: 0-Error, 1-Warn, 2-Info, 3-debug
 * @name Constants#levelLogger
 * @type Number
 * @default 2 (info)
 */
Constants.levelLogger = parseInt('@@levelLogger');

/**
 * Default preffix text for logger
 * @name Constants#preTextLogger
 * @type String
 * @default TR-W
 */
Constants.preTextLogger = 'TR-W';

/**
 * Name of page view event
 * @name Constants#pageViewEvent
 * @type String
 * @default Page view
 */
Constants.pageViewEvent = 'Page view';

/**
 * Name of click event
 * @name Constants#clickEvent
 * @type String
 * @default click
 */
Constants.clickEvent = 'click';

/**
 * Name of submit event
 * @name Constants#submitEvent
 * @type String
 * @default submit
 */
Constants.submitEvent = 'submit';

/**
 * Default timeout to continue links (ms)
 * @name Constants#defaultTimeout
 * @type Number
 * @default 300
 */
Constants.defaultTimeout = 300;


module.exports = Constants;
