/* global OpenStackProto */

describe('Test Image Table', function () {
	"use strict";

	var openStack = null;
	var respImageList = null;
	var respAuthenticate = null;
	var respTenants = null;
	var respServices = null;

	beforeEach(function() {

		jasmine.getJSONFixtures().fixturesPath = 'src/test/fixtures/json';
		respImageList = getJSONFixture('respImageList.json');
		respAuthenticate = getJSONFixture('respAuthenticate.json');
		respTenants = getJSONFixture('respTenants.json');
		respServices = getJSONFixture('respServices.json');
		$('.border_layout').remove();
		openStack = new OpenStackProto();
	});

	function callListImage() {

		var handleServiceTokenCallback, callback, getTenantsOnSuccess;
		var myTable = new DataViewer();

		myTable.init();
		openStack.init();

		getTenantsOnSuccess = MashupPlatform.http.makeRequest.calls.mostRecent().args[1].onSuccess;
		respTenants = {
			responseText: JSON.stringify(respTenants)
		};
		getTenantsOnSuccess(respTenants);
		
		handleServiceTokenCallback = MashupPlatform.http.makeRequest.calls.mostRecent().args[1].onSuccess;
		respServices = {
			responseText: JSON.stringify(respServices)
		};
		handleServiceTokenCallback(respServices);

		openStack.listImage(myTable);
		callback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];
		callback(myTable, respImageList);
	}

	function checkRow(tdIndex, expectedText) {

		var myTable = new DataViewer();
		myTable.init();

	    var structure = [ {'id': 'name'}, {'id': 'status'}, {'id': 'updated'} ];
	    var data = [{'name': 'Ubuntu 11.10 (Oneiric Oncelot)', 'status': 'ACTIVE', 'updated': '2012-02-28T19:39:05Z'}];
	    var model = {'structure': structure, 'data': data};

	    myTable.setModel(model);
	    var cell = $('.cell')[tdIndex+3];

	    expect(cell).toContainText(expectedText);
	}

	it('should authenticate through wirecloud proxy', function() {

		callListImage();

		expect(MashupPlatform.http.makeRequest.calls.count()).toBe(2);
		expect(JSTACK.Keystone.params.currentstate).toBe(2);

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
