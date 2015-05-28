/* global ListImages */

describe('Test Image Table', function () {
    "use strict";

    var listImages = null;
    var respImageList = null;
    var respAuthenticate = null;
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


        // Set preferences values
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

        // Set strategy
        MashupPlatform.setStrategy(new MyStrategy(), prefsValues);

        // Load fixtures
        jasmine.getFixtures().fixturesPath = 'base/src/test/fixtures/html';
        loadFixtures('defaultTemplate.html');
        jasmine.getJSONFixtures().fixturesPath = 'base/src/test/fixtures/json';
        respImageList = getJSONFixture('respImageList.json');
        respAuthenticate = getJSONFixture('respAuthenticate.json');
        imageListSingleImage = getJSONFixture('imageListSingleImage.json');

        // Create new instance
        listImages = new ListImages();
        listImages.init();
    });

    afterEach(function () {
        $('#images_table').empty();
        $('.FixedHeader_Cloned.fixedHeader.FixedHeader_Header > table').empty();
    });


    /**************************************************************************/
    /*                  A U X I L I A R   F U N C T I O N S                   */
    /**************************************************************************/

    function callListImage() {

        var createWidgetUI;
        listImages.authenticate();

        createWidgetUI = MashupPlatform.http.makeRequest.calls.mostRecent().args[1].onSuccess;
        respAuthenticate = {
            responseText: JSON.stringify(respAuthenticate),
            getHeader: function () {}
        };
        createWidgetUI(respAuthenticate);
        
    }

    function callAuthenticateWithError (error) {
        
        var authError;

        authError = MashupPlatform.http.makeRequest.calls.mostRecent().args[1].onFailure;
        authError(error);

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
    /*                  F U N C T I O N A L I T Y   T E S T S                 */
    /**************************************************************************/

    it('should authenticate through wirecloud proxy', function() {

        callListImage();

        expect(MashupPlatform.http.makeRequest.calls.count()).toBe(1);
        expect(JSTACK.Keystone.params.currentstate).toBe(2);

    });

    it('should have created a table with the received images', function () {

        callListImage();
        callListImageSuccessCallback(respImageList);

        var rows = document.querySelectorAll('tbody > tr');

        expect(rows.length).toBeGreaterThan(0);
    });

    it('should call error callback when authentication fails', function () {
        
        var consoleSpy = spyOn(console, "log"); // REFACTOR

        callListImage();
        callAuthenticateWithError('Test successful');
        expect(consoleSpy.calls.mostRecent().args[0]).toBe('Error: "Test successful"');
    });

    it('should call error callback for getImageList correctly', function () {

        var error = {message: 'Error 404', body: 'Image not found'};
        var spyLog = spyOn(console, 'log');

        callListImage();
        callListImageErrorCallback(error);

        expect(spyLog).toHaveBeenCalledWith("Error: " + JSON.stringify(error));
    });

    it('should call getserverlist 4 seconds after receiving the last update', function () {

        var expectedCount, refresh;
        var setTimeoutSpy = spyOn(window, 'setTimeout');

        callListImage();
        callListImageSuccessCallback(imageListSingleImage);
        expectedCount = JSTACK.Nova.getimagelist.calls.count() + 1;
        refresh = setTimeout.calls.mostRecent().args[0];
        refresh();

        expect(JSTACK.Nova.getimagelist.calls.count()).toEqual(expectedCount);
        expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 4000);
    });


    /**************************************************************************/
    /*                        I N T E R F A C E   T E S T S                   */
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
            'Region',
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
            'Region',
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
        
        var bodyWidth = 100;

        $('body').width(bodyWidth);
        $('body').height(bodyWidth + 100);
        callListImage();
        callListImageSuccessCallback(respImageList);

        expect($('.loading i').css('font-size')).toBe(Math.floor(bodyWidth/4) + 'px');
    });

    it('should start loading animation with height lesser than the width', function () {
        
        var bodyHeight = 100;
        
        $('body').width(bodyHeight + 100);
        $('body').height(bodyHeight);

        callListImage();
        callListImageSuccessCallback(respImageList);

        expect($('.loading i').css('font-size')).toBe(Math.floor(bodyHeight/4) + 'px');
    });

    units.forEach(function (unit) {
        it('should display image size in ' + unit.unit + ' correctly', function () {
            
            var handlePreferences;
            var imageData = imageListSingleImage.images[0];
            var sizeCopy = imageData.size;
            imageData.size = unit.value;
            prefsValues["MashupPlatform.prefs.get"].size = true;
            callListImage();
            callListImageSuccessCallback(imageListSingleImage);
            handlePreferences = MashupPlatform.prefs.registerCallback.calls.mostRecent().args[0];
            handlePreferences();

            expect($('tbody > tr > td')[4]).toContainText(unit.expected);
            prefsValues["MashupPlatform.prefs.get"].size = false;
            imageData.size = sizeCopy;
        });
    });

    it('should show an error alert with the appropiate predefined' + 
       ' message and the received message body in the details', function () {

        var imageId = 'id';
        var error = {message: "500 Error", body: "Internal Server Error"};
        
        callListImage();
        callListImageErrorCallback(error);
        
        expect($('.alert > strong').last().text()).toBe('Error ');
        expect($('.alert > span').last().text()).toBe('An error has occurred in FIWARE\'s Cloud. ');
        expect($('.alert > div').last().text()).toBe(error.message + ' ' + error.body + ' ' + error.region + ' ');

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

    it('should disable and reset the file or location field in the create image form when the other is selected', function () {

        var file = $('#x-image-meta-file');
        var location = $('#x-image-meta-location');

        $('input[name=image][value=location]')
            .attr('checked', 'checked')
            .change();

        expect(file).toBeDisabled();
        expect(file).toHaveValue('');
        expect(location).not.toBeDisabled();

        location.val('Something else');
        $('input[name=image][value=file]')
            .attr('checked', 'checked')
            .change();

        expect(file).not.toBeDisabled();
        expect(location).toBeDisabled();
        expect(location).toHaveValue('');

    });

});
