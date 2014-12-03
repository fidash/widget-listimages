/* global OpenStackProto */

describe('Test Image Table', function () {
	"use strict";

	var openStack = null;
	var respImageList = null;
	var respAuthenticate = null;
	var respTenants = null;
	var respServices = null;

	beforeEach(function() {

		jasmine.getFixtures().set('<table id="example" class="display" cellspacing="0" width="100%">' +
									'<thead>' +
										'<tr>' +
											'<th>Instance</th>' +
											'<th>Status</th>' +
											'<th>Last Update</th>' +
										'</tr>' +
									'</thead>' +
								'</table>');
		jasmine.getJSONFixtures().fixturesPath = 'src/test/fixtures/json';
		respImageList = getJSONFixture('respImageList.json');
		respAuthenticate = getJSONFixture('respAuthenticate.json');
		respTenants = getJSONFixture('respTenants.json');
		respServices = getJSONFixture('respServices.json');
		openStack = new OpenStackProto();
	});

	function callListImage() {

		var myTable = $('#example').DataTable();
		openStack.init();

		var handleTempTokenCallback = JSTACK.Keystone.authenticate.calls.mostRecent().args[4];
		handleTempTokenCallback(respAuthenticate);

		var gettenantsCallback = JSTACK.Keystone.gettenants.calls.mostRecent().args[0];
		gettenantsCallback(respTenants);

		var handleServiceTokenCallback = JSTACK.Keystone.authenticate.calls.mostRecent().args[4];
		handleServiceTokenCallback(respServices);

		openStack.listImage(myTable);
		var callback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];
		callback(respImageList);
	}

	function checkRow(tdIndex, expectedText) {

		callListImage();
		var row = $('#example > tbody > tr > td');
		expect(row[tdIndex]).toContainText(expectedText);
	}

	it('should initialize Keystone with URL', function() {

		var url = "http://arcturus.ls.fi.upm.es:5000/v2.0/";

		openStack.init();

		expect(JSTACK.Keystone.init).toHaveBeenCalledWith(url);

	});


	it('should add Name', function() {

		checkRow(0, 'Ubuntu 11.10 (Oneiric Oncelot)');
	});

	it('should add Status', function() {

		checkRow(1, 'ACTIVE');
	});

	it('should add last updated value', function() {

		checkRow(2, '2012-02-28T19:39:05Z');
	});
});
