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
	var units = [
		{
			"unit": "B",
			"value": 1,
			"expected": "1 B"
		},
		{
			"unit": "kiB",
			"value": 135821,
			"expected": "132.64 kiB"
		},
		{
			"unit": "MiB",
			"value": 12358468,
			"expected": "11.79 MiB"
		},
		{
			"unit": "GiB",
			"value": 4532282751,
			"expected": "4.22 GiB"
		},
		{
			"unit": "TiB",
			"value": 5423864125103,
			"expected": "4.93 TiB"
		},
		{
			"unit": "PiB",
			"value": 1452687412365789,
			"expected": "1.29 PiB"
		},
		{
			"unit": "EiB",
			"value": 4125369753962148752,
			"expected": "3.58 EiB"
		},
		{
			"unit": "ZiB",
			"value": 4756123651742368426957,
			"expected": "4.03 ZiB"
		},
		{
			"unit": "YiB",
			"value": 5123698741236987412369874,
			"expected": "4.24 YiB"
		}
	];

	beforeEach(function() {

		JSTACK.Keystone = jasmine.createSpyObj("Keystone", ["init", "authenticate", "gettenants", "params"]);
		JSTACK.Nova = jasmine.createSpyObj("Nova", ["getimagelist", "createimage", "createserver"]);


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
		jasmine.getFixtures().fixturesPath = 'src/test/fixtures/html';
		loadFixtures('defaultTemplate.html');
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
		$('.FixedHeader_Cloned.fixedHeader.FixedHeader_Header > table').empty();
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

	function callListImageErrorCallback (error) {

		var callback = JSTACK.Nova.getimagelist.calls.mostRecent().args[2];

		callback(error);
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

		var consoleSpy = spyOn(console, "log");	// REFACTOR

		callgetTenantsWithError();
		expect(consoleSpy.calls.mostRecent().args[0]).toBe('Error: "Test successful"');
	});

	it('should call error callback for authenticate correctly', function () {
		
		var consoleSpy = spyOn(console, "log");	// REFACTOR

		callgetTenantsWithError();
		callAuthenticateWithError();
		expect(consoleSpy.calls.mostRecent().args[0]).toBe('Error: "Test successful"');
	});

	it('should call error callback for getImageList correctly', function () {

		var error = {message: 'Error 404', body: 'Image not found'};
		var spyLog = spyOn(console, 'log');
		var errorCallback;

		callListImage();
		callListImageErrorCallback(error);
		errorCallback = JSTACK.Nova.getimagelist.calls.mostRecent().args[2];

		expect(spyLog).toHaveBeenCalledWith("Error: " + JSON.stringify(error));
	});

	it('should call getserverlist 2 seconds after receiving the last update', function () {

		var expectedCount, callback;
		var setTimeoutSpy = spyOn(window, 'setTimeout');

		callListImage();
		expectedCount = JSTACK.Nova.getimagelist.calls.count() + 1;
		callListImageSuccessCallback(imageListSingleImage);
		callback = setTimeout.calls.mostRecent().args[0];
		callback();

		expect(JSTACK.Nova.getimagelist.calls.count()).toEqual(expectedCount);
		expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 4000);
	});


	/**************************************************************************/
	/*****************************INTERFACE TESTS******************************/
	/**************************************************************************/

	it('should call MashupPlatform.wiring.pushEvent when click event triggered on a row', function () {

		var spyEvent = spyOnEvent('tbody > tr', 'click');
		var imageId;

		callListImage();
		callListImageSuccessCallback(respImageList);
		$('tbody > tr').trigger('click');

		for (var i=0; i<respImageList.images.length; i++) {

			if (respImageList.images[i].id === JSON.parse(MashupPlatform.wiring.pushEvent.calls.mostRecent().args[1]).id) {
				imageId = respImageList.images[i].id;
			}
		}

		expect(MashupPlatform.wiring.pushEvent).toHaveBeenCalled();
		expect(imageId).toBeDefined();
	});

	it('should add the given row', function() {

		prefsValues["MashupPlatform.prefs.get"].id = true;
		prefsValues["MashupPlatform.prefs.get"].name = true;
		prefsValues["MashupPlatform.prefs.get"].status = true;
		prefsValues["MashupPlatform.prefs.get"].visibility = true;
		prefsValues["MashupPlatform.prefs.get"].checksum = true;
		prefsValues["MashupPlatform.prefs.get"].updated = true;
		prefsValues["MashupPlatform.prefs.get"].created = true;
		prefsValues["MashupPlatform.prefs.get"].size = true;
		prefsValues["MashupPlatform.prefs.get"].container_format = true;
		prefsValues["MashupPlatform.prefs.get"].disk_format = true;

		var handlePreferences = MashupPlatform.prefs.registerCallback.calls.mostRecent().args[0];
		handlePreferences();

		var image = imageListSingleImage.images[0];
		var expectedTextList = [
			image.id,
			image.name,
			image.status,
			'Public',
			image.checksum,
			image.created_at,
			image.updated_at,
			parseFloat(image.size/1024/1024/1024).toFixed(2) + " GiB",
			image.container_format,
			image.disk_format
		];
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
			'Updated',
			'Actions'
		];

		callListImage();
		callListImageSuccessCallback(respImageList);
		columns = $('.fixedHeader th');

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
			'Disk format',
			'Actions'
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
		columns = $('.fixedHeader th');

		for (var i=0; i<columns.length; i++) {
			expect(columns[i].textContent).toEqual(expectedColumns[i]);
		}
	});

	it('should call JSTACK.Nova.createserver with the given arguments when click event is triggered on a launch button', function () {

		var spyEvent;

		callListImage();
		callListImageSuccessCallback(respImageList);
		spyEvent = spyOnEvent('tbody > tr > td > button', 'click');
		$('tbody > tr > td > button').trigger('click');

		expect(JSTACK.Nova.createserver).toHaveBeenCalled();
		expect(spyEvent).toHaveBeenTriggered();
	});

	it('should start loading animation with width lesser than the height', function () {
		
		var innerWidth = 100;
		window.innerWidth = innerWidth;
		window.innerHeight = innerWidth + 100;
		callListImage();
		callListImageSuccessCallback(respImageList);

		expect($('.loading i').css('font-size')).toBe(Math.floor(innerWidth/4) + 'px');
	});

	it('should start loading animation with height lesser than the width', function () {
		
		var innerHeight = 100;
		window.innerWidth = innerHeight + 100;
		window.innerHeight = innerHeight;
		callListImage();
		callListImageSuccessCallback(respImageList);

		expect($('.loading i').css('font-size')).toBe(Math.floor(innerHeight/4) + 'px');
	});

	units.forEach(function (unit) {
    	it('should display image size in ' + unit.unit + ' correctly', function () {
    		
    		var handlePreferences;
    		var imageData = imageListSingleImage.images[0];

    		imageData.size = unit.value;
    		prefsValues["MashupPlatform.prefs.get"].size = true;
    		callListImage();
			callListImageSuccessCallback(imageListSingleImage);
			handlePreferences = MashupPlatform.prefs.registerCallback.calls.mostRecent().args[0];
			handlePreferences();

    		expect($('tbody > tr > td')[4]).toContainText(unit.expected);
    		prefsValues["MashupPlatform.prefs.get"].size = false;
    	});
    });

    it('should show an error alert with the appropiate predefined' + 
       ' message and the received message body in the details', function () {

		var imageId = 'id';
		var error = {message: "500 Error", body: "Internal Server Error"};
		
		callListImage();
		callListImageErrorCallback(error);
		
		expect($('.alert > strong').last().text()).toBe('Error ');
		expect($('.alert > span').last().text()).toBe('An error has occurred on the server side. ');
		expect($('.alert > div').last().text()).toBe(error.message + ' ' + error.body + ' ');

	});

	it('should show an error alert with the message' + 
	   ' received writen on it when ir doesn\'t recognize the error', function () {

	   	var imageId = 'id';
	   	var error = {message: "404 Error", body: "Image not found"};

		callListImage();
		callListImageErrorCallback(error);
		
		expect($('.alert > strong').last().text()).toBe(error.message + ' ');
		expect($('.alert > span').last().text()).toBe(error.body + ' ');

	});

	it('should display the error details when a click event is' + 
	   ' triggered in the details button', function () {

	   	var imageId = 'id';
	   	var spyEvent = spyOnEvent('.alert a', 'click');
	   	var error = {message: "500 Error", body: "Internal Server Error"};

		callListImage();
		callListImageErrorCallback(error);
		$('.alert a').trigger('click');
		
		expect($('.alert > div').last()).not.toHaveCss({display: "none"});

	});

	it('should expand the search input when a click event is triggered in the search button', function () {

		var spyEvent = spyOnEvent('.search-container button', 'click');

		callListImage();
		callListImageSuccessCallback(respImageList);
		$('.search-container button').trigger('click');

		expect($('.search-container input')).toHaveClass('slideRight');
	});

	it('should correctly search images when new data is introduced in the input field', function () {

		var spyEvent;

		callListImage();
		callListImageSuccessCallback(respImageList);
		spyEvent = spyOnEvent('.search-container input', 'keyup');
		$('.search-container input')
			.val('RealVirtualInteractionGE-3.3.3')
			.trigger('keyup');

		expect('keyup').toHaveBeenTriggeredOn('.search-container input');
		expect($('tbody').children().size()).toBe(1);
	});

	it('should call createImage function when click event is triggered on the create image button', function () {

		var createButton = $("#create-image");
		var spyEvent;

		callListImage();
		callListImageSuccessCallback(respImageList);
		$('#x-image-meta-name').val("ImageName");
		spyEvent = spyOnEvent(createButton, 'click');
		createButton.trigger('click');

		expect('click').toHaveBeenTriggeredOn('#create-image');
		expect(MashupPlatform.http.makeRequest).toHaveBeenCalledWith('https://cloud.lab.fiware.org/Spain2/image/v1/images', jasmine.any(Object));

	});

});
