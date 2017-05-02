'use strict';

var Controllers = {};
var meta = require.main.require('./src/meta');
var Categories = require.main.require("./src/Categories");
var TeamSpeakClient = require("node-teamspeak");
var async = require('async');
Controllers.renderAdminPage = function (req, res, next) {
	/*
		Make sure the route matches your path to template exactly.

		If your route was:
			myforum.com/some/complex/route/
		your template should be:
			templates/some/complex/route.tpl
		and you would render it like so:
			res.render('some/complex/route');
	*/
	//get settings from db
	var settings = {},
		ts_channels = [],
		categories = []

	async.series([
			function (callback) {
				meta.settings.get('teamspeakcategories', function (err, results) {
					if (err) {
						console.log('teamspeakcategories', err)
					}
					settings = results;
					callback()
				})
			},
			function (callback) {
				var cl = new TeamSpeakClient(settings.serverip, settings.queryport);
				cl.on('connect', function (res) {
					console.log('connected')
					cl.send('login', {
						client_login_name: settings.username,
						client_login_password: settings.password
					}, function (err, response, rawResponse) {
						if (err) {
							console.log(err)
						}
						cl.send('use', {
							sid: settings.vid
						}, function (err, response, rawResponse) {
							if (err) {
								console.log(err)
							}
							cl.send('channellist', function (err, response, rawResponse) {
								ts_channels = response;
								cl.send('quit', function (err, response, rawResponse) {
									console.log('log out')
									callback()
								})
							})
						})
					})
				})
			},
			function (callback) {
				Categories.getAllCategories(req.uid, function (err, data) {
					if(err){console.log('categories',err)}
					categories = data;
				});
				callback()
			}
		],
		function (err, results) {
			console.log('settings', settings)
			console.log('ts_channels', ts_channels)
			console.log('categories', categories)
			res.render('admin/plugins/teamspeakcategories', {
				'test': 'ok',
				'ts_channels': ts_channels,
				'categories': categories
			});
		})






};

module.exports = Controllers;
