'use strict';

/**
 * @name Dom
 * @namespace
 */
module.exports = (function() {

    var Constants = require('Constants');
    var logger = require('lib/Logger')('Dom');

    /**
     * Return object with all tracking properties of the param element
     * @public
     * @name Logger#getTrackDataOfElem
     * @function
     * @param {Object} Object with all tracking properties
     */
    var getTrackDataOfElem = function(el){
        logger.debug('Obtaining attributes of ' + el);
        var attributes = el[0].attributes;
        var length, i, attr = null, attrObj = {};
        for(i = 0, length = attributes.length; i < length; i++){
            attr = attributes[i];
            if(attr.name.startsWith(Constants.prefixNameTrakingData)){
                attrObj[attr.name.replace(Constants.prefixNameTrakingData, '')] = attr.value;
            }
        }
        logger.debug('Return object ' + attrObj);
        return attrObj;
    };

    return {
        getTrackDataOfElem : getTrackDataOfElem
    };
}());
