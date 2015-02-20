/* global OpenStackProto */

describe('Test Image Table', function () {
	"use strict";

	var openStack = null;
	var respImageList = null;
	var respAuthenticate = null;
	var respTenants = null;
	var respServices = null;

	beforeEach(function() {
		setFixtures('<table id="images_table"></table>');
		jasmine.getJSONFixtures().fixturesPath = 'src/test/fixtures/json';
		respImageList = getJSONFixture('respImageList.json');
		respAuthenticate = getJSONFixture('respAuthenticate.json');
		respTenants = getJSONFixture('respTenants.json');
		respServices = getJSONFixture('respServices.json');
		openStack = new OpenStackProto();
	});

	function callListImage() {

		var handleServiceTokenCallback, getTenantsOnSuccess;
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

		openStack.listImage();

	}

	function callgetTenantsWithError () {
		
		var getTenantsOnError;

		openStack.init();
		getTenantsOnError = MashupPlatform.http.makeRequest.calls.mostRecent().args[1].onFailure;
		getTenantsOnError('Test successful');
	}

	function callAuthenticateWithError () {
		
		var authenticateError, getTenantsOnSuccess;

		getTenantsOnSuccess = MashupPlatform.http.makeRequest.calls.mostRecent().args[1].onSuccess;
		respTenants = {
			responseText: JSON.stringify(respTenants)
		};
		getTenantsOnSuccess(respTenants);

		authenticateError = MashupPlatform.http.makeRequest.calls.mostRecent().args[1].onFailure;
		authenticateError('Test successful');
	}

	function callListImageSuccessCallback () {

		var callback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];
		
		callback(respImageList);

	}

	function checkRow(expectedTextList) {

		var dataTable, cell;

		dataTable = $('#images_table').DataTable({
			"columns": [
				{'title': 'Name'},
				{'title': 'Status'},
				{'title': 'Updated'}
			]
		});

	    dataTable.row.add(expectedTextList).draw();

	    for (var i=0; i<expectedTextList.length; i++) {
	    	
	    	cell = $('tbody > tr > td')[i];
	    	expect(cell).toContainText(expectedTextList[i]);
	    }
	}

	it('should authenticate through wirecloud proxy', function() {

		callListImage();

		expect(MashupPlatform.http.makeRequest.calls.count()).toBe(2);
		expect(JSTACK.Keystone.params.currentstate).toBe(2);

	});

	it('should have created a table with the received images', function () {

		callListImage();
		callListImageSuccessCallback();

		var rows = document.querySelectorAll('tbody > tr');

		expect(rows.length).toBeGreaterThan(0);
	});

	it('should call error callback for getTenants correctly',function () {

		var output;

		console.log = jasmine.createSpy("log").and.callFake(function (error) {
			output = error;
		});

		callgetTenantsWithError();
		expect(output).toBe('Error: "Test successful"');
	});

	it('should call error callback for authenticate correctly', function () {
		
		var output;

		console.log = jasmine.createSpy("log").and.callFake(function (error) {
			output = error;
		});

		callAuthenticateWithError();
		expect(output).toBe('Error: "Test successful"');
	});

	it('should have called MashupPlatform.wiring.pushEvent when click event triggered on a row', function () {

		var spyEvent = spyOnEvent('tbody > tr', 'click');

		callListImage();
		callListImageSuccessCallback();

		$('tbody > tr').trigger('click');

		expect(MashupPlatform.wiring.pushEvent).toHaveBeenCalled();
	});

	it('should add the given row', function() {

		checkRow(['Ubuntu 11.10 (Oneiric Oncelot)', 'ACTIVE', '2012-02-28T19:39:05Z']);
	});
});
