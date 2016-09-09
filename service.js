'use strict';
var req = require('request');
var Promise = require('bluebird');
var request = Promise.promisify(req);
var pageSize = 100;
var BASE_URL='http://0.0.0:5000';

var ServiceHelper = function (queue) {
    var self = this;
    var parserPages = function (data) {
        if (data == null || data == undefined) return;
        var dataObject = JSON.parse(data.body);
        var pages = [];
        for (var i = 0; i < dataObject.totalPage; i++) {
            pages.push(i);
        }
        return pages;
    };
    var getChannelSummary = function () {
        var requestOption = {
            url: BASE_URL+ '/api/v1/channel/' + pageSize
        };
        return request(requestOption).then(parserPages)
    };

    var pushChannelsToQueue = function (channels) {
        for (var i = 0; i < channels.length; i++) {
            var item = channels[i];
            var msg = JSON.stringify(item);
            queue.sendToQueue('fetcher', new Buffer(msg));
            console.log(" [x] Sent %s", msg);
        }
    };
    var parserChannels = function (data) {
        var body = JSON.parse(data.body);
        return body.channels;
    };
    var getItemsOfPageAndPush = function (page) {
        var requestOption = {
            url: BASE_URL+ '/api/v1/channels/' + page + '/' + pageSize
        };
        return request(requestOption).then(parserChannels).then(pushChannelsToQueue);
    };

    var getChannelThenPushToQueue = function (pages) {
        return Promise.map(pages, function (page) {
            console.log('page' + page);
            return getItemsOfPageAndPush(page);
        });
    };

    self.pushChannelsToQueue = function () {
        getChannelSummary()
            .then(getChannelThenPushToQueue);
    };
};

module.exports = ServiceHelper;
