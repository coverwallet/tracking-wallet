'use strict';

require('tracking/Mixpanel');

var Constants = require('Constants');
var PromiseBlue = require('bluebird');
var logger = require('lib/Logger')('Mixpanel Client');

/**
 * @name MixpanelClient
 * @class
 */
var MixpanelClient = function(){
};

/**
 * Init mixpanel client
 * @public
 * @name MixpanelClient#init
 * @function
 */
MixpanelClient.prototype.init = function(token){
    return new PromiseBlue(function(resolve, reject){
        var options = {
            loaded: this._loaded.bind(this, resolve, reject)
        };
        if (Constants.levelLogger === 3) {
            options.debug = true;
        }
        global.mixpanel.init(token,options);
    }.bind(this));
};

/**
 * Private function that is called when client is initialized
 * @public
 * @name MixpanelClient#_loaded
 * @private
 * @function
 */
MixpanelClient.prototype._loaded = function(resolve, reject){
    this.mixpanel = global.mixpanel;
    logger.debug('Success initialized');
    resolve('ok');
};

/**
 * Function that track the event with mixpanel
 * @public
 * @name MixpanelClient#track
 * @private
 * @function
 */
MixpanelClient.prototype.track = function(event, data){
    if(data){
        logger.debug('Tracking event: ' + event + ', y data ' + JSON.stringify(data));
    }else{
        logger.debug('Tracking event: ' + event);
    }
    this.mixpanel.track(event, data);
};



module.exports = new MixpanelClient();
