'use strict';

var Controllers = {};
var meta = require.main.require('./src/meta');
var Categories = require.main.require("./src/Categories");
var TeamSpeakClient = require("node-teamspeak");
var async = require('async');
var nconf = require('nconf');
var util = require('util');

Controllers.renderAdminPage = function (req, res, next) {
	var settings = {},
		ts_channels = [],
		categories = []

	async.series([
			function (callback) {
				meta.settings.get('teamspeakcategories', function (err, results) {
					if (err) {
						console.log('[teamspeak-categories]', err)
					}
					settings = results;
					callback()
				})
			},
			function (callback) {
				if (
					settings.hasOwnProperty('serverip') &&
					settings.hasOwnProperty('queryport') &&
					settings.hasOwnProperty('username') &&
					settings.hasOwnProperty('password') &&
					settings.hasOwnProperty('vid')
				) {
					var cl = new TeamSpeakClient(settings.serverip, settings.queryport);
					cl.on('connect', function (res) {
						// console.log('connected')
						cl.send('login', {
							client_login_name: settings.username,
							client_login_password: settings.password
						}, function (err, response, rawResponse) {
							if (err) {
								console.log('[teamspeak-categories]', err)
								callback()
							}
							cl.send('use', {
								sid: settings.vid
							}, function (err, response, rawResponse) {
								if (err) {
									console.log('[teamspeak-categories]', err)
									callback()
								}
								cl.send('channellist', function (err, response, rawResponse) {
									ts_channels = response;
									cl.send('quit', function (err, response, rawResponse) {
										// console.log('log out')
										callback()
									})
								})
							})
						})
					})
				} else {
					callback()
				}
			},
			function (callback) {
				Categories.getAllCategories(0, function (err, res) {
					if (err) {
						console.log('[teamspeak-categories]', err)
						callback()
					} else {
						categories = res
						callback()
					}
				})

			}
		],
		function (err, results) {
			res.render('admin/plugins/teamspeakcategories', {
				'ts_channels': ts_channels,
				'categories': categories
			});
		})
};

Controllers.updateTeamspeakChannel = function (data) {
	var settings = {},
		siteurl = nconf.get('url'),
		category_id = data.cid,
		channel_id = '',
		category = {},
		cat_topics = [],
		channel_description = ''
	console.log('[teamspeak-categories]- starting updateTeamspeakChannel -[teamspeak-categories]')
	async.series([
		function (callback) {
			//get plugin settings
			console.log('[teamspeak-categories]- settings -[teamspeak-categories]')
			meta.settings.get('teamspeakcategories', function (err, results) {
				if (err) {
					console.log('[teamspeak-categories]', err)
				}
				settings = results;
				callback()
			})
		},
		function (callback) {
			//match ts channel and nodebb category
			console.log('[teamspeak-categories]- match ts channel -[teamspeak-categories]')
			if (settings.hasOwnProperty('category_' + category_id)) {
				var tempchan = settings['category_' + category_id];
				if (tempchan.length > 0) {
					channel_id = tempchan.split('_')[1]
					callback()
				}
			}
		},
		function (callback) {
			//get category by id
			console.log('[teamspeak-categories]- get category -[teamspeak-categories]')

			Categories.getCategoryById({
				cid: category_id,
				uid: 0
			}, function (err, res) {
				if (err) {
					console.log('[teamspeak-categories]', err)
				}
				category = res
				callback()
			})
		},
		function (callback) {
			//get topics for category
			console.log('[teamspeak-categories]- get topics -[teamspeak-categories]')

			Categories.getCategoryTopics({
				cid: category_id,
				set: 'cid:' + category_id + ':tids',
				reverse: true,
				start: 0,
				stop: -1,
				uid: 0
			}, function (err, result) {
				if (err) {
					console.log('[teamspeak-categories]', err)
				}
				cat_topics = result.topics
				callback()
			})
		},
		function (callback) {
			//build channel description
			console.log('[teamspeak-categories]- post update -[teamspeak-categories]')

			if (category.hasOwnProperty('image')) {
				channel_description = '[url=' + siteurl + '/category/' + category.slug + '][img]' + category.image + '[/img][/url]\n'
			}
			if (category.hasOwnProperty('description')) {
				channel_description += category.description + '\n\n'
			}
			channel_description += '[b]Latest Topics:[/b]\n'
			if (cat_topics.length > 0) {
				for (var i = 0; i < cat_topics.length && i < 5; i++) {
					channel_description += '[size=15][' + (i + 1) + ']\t' + '[url=' + siteurl + '/topic/' + cat_topics[i].tid + ']' + cat_topics[i].title + '[/url][/size]\n'
				}
			}
			else{
				channel_description += 'Sorry no topics for this category.  Head over to [url=' + siteurl + '/category/' + category.slug + ']our forum[/url] and create one!'
			}
			//send update description
			if (
				settings.hasOwnProperty('serverip') &&
				settings.hasOwnProperty('queryport') &&
				settings.hasOwnProperty('username') &&
				settings.hasOwnProperty('password') &&
				settings.hasOwnProperty('vid')
			) {
				var cl = new TeamSpeakClient(settings.serverip, settings.queryport);
				cl.on('connect', function (res) {
					// console.log('connected')
					cl.send('login', {
						client_login_name: settings.username,
						client_login_password: settings.password
					}, function (err, response, rawResponse) {
						if (err) {
							console.log('[teamspeak-categories]', err)
							callback()
						}
						cl.send('use', {
							sid: settings.vid
						}, function (err, response, rawResponse) {
							if (err) {
								console.log('[teamspeak-categories]', err)
								callback()
							}
							cl.send('channeledit', {
								cid: channel_id,
								channel_description: channel_description
							}, function (err, response, rawResponse) {
								cl.send('quit', function (err, response, rawResponse) {
									callback()
								})
							})
						})
					})
				})
			}
		}
	], function (err, results) {
		console.log('[teamspeak-categories]- finish updateTeamspeakChannel -[teamspeak-categories]')
	})
}

Controllers.updateAllTeamspeakChannels = function(){
	var settings = {},
		siteurl = nconf.get('url'),
		categories = []
	console.log('[teamspeak-categories]- starting updateAllTeamspeakChannels -[teamspeak-categories]')
	async.series([
		function (callback) {
			//get plugin settings
			console.log('[teamspeak-categories]- settings -[teamspeak-categories]')
			meta.settings.get('teamspeakcategories', function (err, results) {
				if (err) {
					console.log('[teamspeak-categories]', err)
				}
				settings = results;
				// console.log(settings)
				callback()
			})
		},
		function(callback){
			Categories.getAllCategories(0,function(err,res){
				if(err){
					console.log('[teamspeak-categories]',err)
				}
				categories  = res
				callback()
			})
		},
		function(callback){
			//match ts channel and nodebb category
			for(var i = 0; i < categories.length; i++){
				var _key = 'category_'+categories[i].cid
				if(settings.hasOwnProperty(_key)){
					var tempchan = settings[_key];
					if (tempchan.length > 0) {
						categories[i].ts_cid = tempchan.split('_')[1]
					}
				}
			}
			callback()
		},
		function(callback){
			async.each(categories,
				function(category,cb){
					category.topics = []
					if(category.hasOwnProperty('ts_cid')){
						Categories.getCategoryTopics({
							cid: category.cid,
							set: 'cid:' + category.cid + ':tids',
							reverse: true,
							start: 0,
							stop: -1,
							uid: 0
						},function (err, result){
							category.topics = result.topics
							cb()
						})
					}
					else{
						cb()
					}
				},
				function(err){
					if(err){
						console.log(err)
					}
					callback()
				})
		},
		function(callback){
			//build and sumbit ts description
			async.each(categories,
				function(category,cb){
					//build the description
					var channel_description = ''
					if (category.hasOwnProperty('image')) {
						channel_description = '[url=' + siteurl + '/category/' + category.slug + '][img]' + category.image + '[/img][/url]\n'
					}
					if (category.hasOwnProperty('description')) {
						channel_description += category.description + '\n\n'
					}
					channel_description += '[b]Latest Topics:[/b]\n'
					if (category.topics.length > 0) {
						for (var i = 0; i < category.topics.length && i < 5; i++) {
							channel_description += '[size=15][' + (i + 1) + ']\t' + '[url=' + siteurl + '/topic/' + category.topics[i].tid + ']' + category.topics[i].title + '[/url][/size]\n'
						}
					}
					else{
						channel_description += 'Sorry no topics for this category.  Head over to [url=' + siteurl + '/category/' + category.slug + ']our forum[/url] and create one!'
					}

					//send the update
					if (
						settings.hasOwnProperty('serverip') &&
						settings.hasOwnProperty('queryport') &&
						settings.hasOwnProperty('username') &&
						settings.hasOwnProperty('password') &&
						settings.hasOwnProperty('vid') &&
						category.hasOwnProperty('ts_cid')
					) {
						var cl = new TeamSpeakClient(settings.serverip, settings.queryport)
						cl.on('connect', function (res) {
							cl.send('login', {
								client_login_name: settings.username,
								client_login_password: settings.password
							}, function (err, response, rawResponse) {
								if(err){
									console.log('[teamspeak-categories]',err)
									cb()
								}
								cl.send('use', {
									sid: settings.vid
								}, function (err, response, rawResponse) {
									if(err){
										console.log('[teamspeak-categories]',err)
										cb()
									}
									cl.send('channeledit', {
										cid: category.ts_cid,
										channel_description: channel_description
									}, function (err, response, rawResponse) {
										cl.send('quit', function (err, response, rawResponse) {
											cb()
										})
									})
								})
							})
						})
					}
					else{
						cb()
					}
				},
				function(err){
					if(err){
						console.log(err)
					}
					callback()
				})
		}
	],function (err, results) {
		console.log('[teamspeak-categories]- finish updateAllTeamspeakChannels -[teamspeak-categories]')
	})
}
module.exports = Controllers;
