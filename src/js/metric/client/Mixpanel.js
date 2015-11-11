/**
 * Created by IntelliJ IDEA.
 * User: gilberto
 * Date: 19/05/15
 * Time: 10:53
 */

'use strict';

require('./MixpanelLib');

var Constants = require('../../Constants');
var Log = require('../../lib/utils/Log')('Mixpanel');
var Timer = require('../event/timer');
var Engagement = require('../event/Engagement');
var subscribedVideos = [];

/**
 * @name Mixpanel
 * @class
 */
var Mixpanel = function(event) {
    var options = {};
    if (3 === Constants.levelLog) {
        options = {debug:true};
    }
    global.mixpanel.init(Constants.mixpanelToken,options);
    this.client = global.mixpanel;
    this.event = event;
};

/**
 * Send track event
 * @public
 * @name Mixpanel#track
 * @function
 */
Mixpanel.prototype.track = function(name, properties){
    this.client.track(name, properties);
    Engagement.track(name, this, properties);
};

/**
 * Send track links event
 * @public
 * @name Mixpanel#trackLinks
 * @function
 */
Mixpanel.prototype.trackLinks = function(domQuery, callback){
    this.client.track_links(domQuery, 'click', callback); //jshint ignore:line
    var self = this;
    var func = function (element) {
        Engagement.track('click', self, callback(element));
    };
    this.client.track_links(domQuery, 'click', func); //jshint ignore:line
};

/**
 * Send display event
 * @public
 * @name Mixpanel#trackDisplay
 * @function
 */
Mixpanel.prototype.trackDisplay = function(){
    this.client.track('display', this.event.display());
};

/**
 * Tracking read
 * @public
 * @name Mixpanel#trackRead
 * @function
 */
Mixpanel.prototype.trackRead = function(readingTime){
    var self = this;
    if (readingTime === undefined) {
        readingTime = 0;
    }

    Timer.subscribe(function(data){
        Engagement.read(self, self.event.read(data, readingTime));
    }, 1000);

    return function(data) {
        var properties = self.event.read(data, readingTime);

        if (properties) {
            self.track('read', properties);
        }
    };
};

/**
 * Tracking time
 * @public
 * @name Mixpanel#trackTime
 * @function
 */
Mixpanel.prototype.trackTime = function(readingTime){
    var self = this;
    var data = {};
    data.startDate = new Date();
    data.endDate = null;
    data.seconds = 0;
    data.mode = 'in';

    var properties = self.event.time(data, readingTime);

    if (properties) {
        this.track('time', properties);
    }

    return function() {
        data.endDate = new Date();
        data.seconds = (data.endDate.getTime() - data.startDate.getTime())/1000;
        data.mode = 'out';

        var properties = self.event.time(data, readingTime);

        if (properties) {
            self.track('time', properties);
        }
    };
};

/**
 * Tracking links
 * @public
 * @name Mixpanel#trackDisplay
 * @function
 */
Mixpanel.prototype.trackClick = function(domQuery){
    this.trackLinks(domQuery, this.event.click.bind(this.event));
};

/**
 * Send video event
 * @public
 * @name Mixpanel#trackVideo
 * @function
 */
Mixpanel.prototype.trackVideo = function(video, event){
    this.track('video', this.event.video(video, event));
};

/**
 * Video playing
 * @public
 * @name Mixpanel#trackVideoPlaying
 * @function
 */
Mixpanel.prototype.trackVideoPlaying = function(video){
    var self = this;

    return function() {
        if(video.player.getPlayerState() === video.playerState.PLAYING) {
            self.trackVideo(video);
        }
    };
};

/**
 * Callback function on video player ready
 * @public
 * @name Mixpanel#onVideoPlayerReady
 * @function
 */
Mixpanel.prototype.onVideoPlayerReady = function(){
    var self = this;

    return function(event){
        Log.debug('onPlayerReady video');
        self.trackVideo(this, event);
    };
};

/**
 * Callback function on video state change
 * @public
 * @name Mixpanel#onVideoStateChange
 * @function
 */
Mixpanel.prototype.onVideoStateChange = function(){
    var self = this;

    return function(event){
        var video = this;
        Log.debug('onStateChange video');
        self.trackVideo(this, event);
        if (undefined === subscribedVideos[video.source + video.videoId]) {  //TODO unSubscribe video went change state
            Timer.subscribe(self.trackVideoPlaying(video), (video.player.getDuration() * 1000 * Constants.eventVideoIntervalPercentage));
            Timer.subscribe(function(){
                Engagement.video(self, self.event.video(video));
            }, 6000);
            subscribedVideos[this.source + this.videoId] = true;
        }
    };
};

/**
 * Tracking click command
 * @public
 * @name Mixpanel#trackClickCommand
 * @function
 */
Mixpanel.prototype.trackClickCommand = function(elements){
    var elemenstLength = elements.length;

    for (var i = 0; i < elemenstLength; i++) {
        var element = elements[i];
        var url = decodeURI(element.href);

        url = url.replace(/(\[|\{)random(\]|\})/ig, (Math.round(Math.random()*100000000)).toString());
        url = url.replace(/(\[|\{)timestamp(\]|\})/ig, ((new Date()).getTime()).toString());
        element.href = url;
    }
};

/**
 * Tracking party pixel
 * @public
 * @name Mixpanel#trackPartyPixel
 * @function
 */
Mixpanel.prototype.trackPartyPixel = function(elements){
    var elemenstLength = elements.length;

    for (var i = 0; i < elemenstLength; i++) {
        var element = elements[i];
        var url = decodeURI(element.src);

        url = url.replace(/(\[|\{)random(\]|\})/ig, (Math.round(Math.random()*100000000)).toString());
        url = url.replace(/(\[|\{)timestamp(\]|\})/ig, ((new Date()).getTime()).toString());
        element.src = url;
    }
};

/**
 * Tracking engagement
 * @public
 * @name Mixpanel#trackEngagement
 * @function
 */
Mixpanel.prototype.trackEngagement = function(type, id){
    var properties = this.event.engagement(type, id, Constants.nameMixpanelClient);

    if (properties) {
        this.client.track('engagement', properties);
    }
};

/**
 * Tracking disable
 * @public
 * @name Mixpanel#trackDisable
 * @function
 */
Mixpanel.prototype.trackDisable = function(){
        this.client.disable();
};

module.exports = Mixpanel;
