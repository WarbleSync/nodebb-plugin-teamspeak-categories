'use strict';
/* globals $, app, socket */

define('admin/plugins/teamspeakcategories', ['settings'], function(Settings) {

	var ACP = {};


	ACP.init = function() {
		Settings.load('teamspeakcategories', $('.teamspeakcategories-settings'));

		$('#save').on('click', function() {
			Settings.save('teamspeakcategories', $('.teamspeakcategories-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'teamspeakcategories-saved',
					title: 'Settings Saved',
					message: 'Please reload your NodeBB to apply these settings',
					clickfn: function() {
						socket.emit('admin.reload');
					}
				});
			});
		});

		$('#updateTS').on('click', function(){
			Settings.save('teamspeakcategories', $('.teamspeakcategories-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'teamspeakcategories-saved',
					title: 'Settings Saved',
					message: 'Please refresh the page to Pair your channels/categories',
					clickfn: function() {
						socket.emit('admin.reload');
					}
				});
			})


		})
	};

	return ACP;
});
