#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var ServiceHelper = require('./service');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var helper = new ServiceHelper(ch);
    helper.pushChannelsToQueue();
  });
});
