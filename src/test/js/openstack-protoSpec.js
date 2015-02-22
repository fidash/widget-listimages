/* global OpenStackProto */

describe('Test Image Table', function () {
	"use strict";

	var openStack = null;
	var respImageList = null;
	var respAuthenticate = null;
	var respTenants = null;
	var respServices = null;
	var imageListSingleImage = null;
	var prefsValues;

	beforeEach(function() {

		// Set/Reset prefs values
		prefsValues = {
	    	"MashupPlatform.prefs.get": {
		        "id": true,
		        "name": true,
		        "status": true,
		        "visibility": false,
		        "checksum": false,
		        "created": false,
		        "updated": true,
		        "size": false,
		        "container_format": false,
		        "disk_format": false,
		    }
		};

		// Set/Reset strategy
		MashupPlatform.setStrategy(new MyStrategy(), prefsValues);

		// Set/Reset fixtures
		setFixtures('<table id="images_table"></table>');
		jasmine.getJSONFixtures().fixturesPath = 'src/test/fixtures/json';
		respImageList = getJSONFixture('respImageList.json');
		respAuthenticate = getJSONFixture('respAuthenticate.json');
		respTenants = getJSONFixture('respTenants.json');
		respServices = getJSONFixture('respServices.json');
		imageListSingleImage = getJSONFixture('imageListSingleImage.json');

		// Create new instance
		openStack = new OpenStackProto();
	});

	afterEach(function () {
		$('#images_table').empty();
	});


	/**************************************************************************/
	/*****************************AUXILIAR FUNCTIONS***************************/
	/**************************************************************************/

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

	function callListImageSuccessCallback (imageList) {

		var callback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];
		
		callback(imageList);

	}


	/**************************************************************************/
	/****************************FUNCTIONALITY TESTS***************************/
	/**************************************************************************/

	it('should authenticate through wirecloud proxy', function() {

		callListImage();

		expect(MashupPlatform.http.makeRequest.calls.count()).toBe(2);
		expect(JSTACK.Keystone.params.currentstate).toBe(2);

	});

	it('should have created a table with the received images', function () {

		callListImage();
		callListImageSuccessCallback(respImageList);

		var rows = document.querySelectorAll('tbody > tr');

		expect(rows.length).toBeGreaterThan(0);
	});

	it('should call error callback for getTenants correctly',function () {

		console.log = jasmine.createSpy("log").and.callThrough();	// REFACTOR

		callgetTenantsWithError();
		expect(console.log.calls.mostRecent().args[0]).toBe('Error: "Test successful"');
	});

	it('should call error callback for authenticate correctly', function () {
		
		console.log = jasmine.createSpy("log").and.callThrough();	// REFACTOR

		callgetTenantsWithError();
		callAuthenticateWithError();
		expect(console.log.calls.mostRecent().args[0]).toBe('Error: "Test successful"');
	});


	/**************************************************************************/
	/*****************************INTERFACE TESTS******************************/
	/**************************************************************************/

	it('should have called MashupPlatform.wiring.pushEvent when click event triggered on a row', function () {

		var spyEvent = spyOnEvent('tbody > tr', 'click');

		callListImage();
		callListImageSuccessCallback(respImageList);

		$('tbody > tr').trigger('click');

		expect(MashupPlatform.wiring.pushEvent).toHaveBeenCalled();
	});

	it('should add the given row', function() {

		var image = imageListSingleImage.images[0];
		var expectedTextList = [image.id, image.name, image.status, image.updated_at];
		var cell;

		callListImage();
		callListImageSuccessCallback(imageListSingleImage);

	    for (var i=0; i<expectedTextList.length; i++) {
	    	
	    	cell = $('tbody > tr > td')[i];
	    	expect(cell).toContainText(expectedTextList[i]);
	    }
	});

	it('should make the columns given in the preferences visible', function () {

		var columns;
		var expectedColumns = [
			'ID',
			'Name',
			'Status',
			'Updated'
		];

		callListImage();
		callListImageSuccessCallback(respImageList);
		columns = $('thead > tr > th');

		for (var i=0; i<columns.length; i++) {

			expect(columns[i].textContent).toEqual(expectedColumns[i]);
		}

	});

	it('should dynamically change the displayed columns when preferences change', function () {

		var columns, handlePreferences;
		var expectedColumns = [
			'Created',
			'Size',
			'Container format',
			'Disk format'
		];

		// Change preferences
		prefsValues["MashupPlatform.prefs.get"].id = false;
		prefsValues["MashupPlatform.prefs.get"].name = false;
		prefsValues["MashupPlatform.prefs.get"].status = false;
		prefsValues["MashupPlatform.prefs.get"].updated = false;
		prefsValues["MashupPlatform.prefs.get"].created = true;
		prefsValues["MashupPlatform.prefs.get"].size = true;
		prefsValues["MashupPlatform.prefs.get"].container_format = true;
		prefsValues["MashupPlatform.prefs.get"].disk_format = true;


		callListImage();
		callListImageSuccessCallback(respImageList);
		handlePreferences = MashupPlatform.prefs.registerCallback.calls.mostRecent().args[0];
		handlePreferences();
		columns = $('thead > tr > th');

		for (var i=0; i<columns.length; i++) {
			console.log(columns[i].textContent);
			expect(columns[i].textContent).toEqual(expectedColumns[i]);
		}
	});
});
