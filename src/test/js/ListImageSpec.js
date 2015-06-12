/* global ListImages */

describe('List Image', function () {
    "use strict";

    var listImages = null;
    var respImageList = null;
    var respAuthenticate = null;
    var imageListSingleImage = null;

    beforeEach(function() {

        JSTACK.Keystone = jasmine.createSpyObj("Keystone", ["init", "authenticate", "gettenants", "params"]);
        JSTACK.Nova = jasmine.createSpyObj("Nova", ["getimagelist", "createimage", "createserver"]);


        // Set strategy
        MashupPlatform.setStrategy(new MyStrategy(), undefined);

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

    it('should call JSTACK.Nova.createserver with the given arguments when click event is triggered on a launch button', function () {

        var spyEvent;

        callListImage();
        callListImageSuccessCallback(respImageList);
        spyEvent = spyOnEvent('tbody > tr > td > button', 'click');
        $('tbody > tr > td > button').trigger('click');

        expect(JSTACK.Nova.createserver).toHaveBeenCalled();
        expect(spyEvent).toHaveBeenTriggered();
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

});
