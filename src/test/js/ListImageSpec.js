/* global ListImages */

describe('List Image', function () {
    "use strict";

    var listImages = null;
    var respImageList = null;
    var respAuthenticate = null;
    var imageListSingleImage = null;
    var respFlavorList = null;
    var respNetworksList = null;

    beforeEach(function() {

        // Set strategy
        MashupPlatform.setStrategy(new MyStrategy(), undefined);

        // Load fixtures
        jasmine.getFixtures().fixturesPath = 'base/src/test/fixtures/html';
        loadFixtures('defaultTemplate.html');
        jasmine.getJSONFixtures().fixturesPath = 'base/src/test/fixtures/json';
        respImageList = getJSONFixture('respImageList.json');
        respAuthenticate = getJSONFixture('respAuthenticate.json');
        imageListSingleImage = getJSONFixture('imageListSingleImage.json');
        respFlavorList = getJSONFixture('respFlavorList.json');
        respNetworksList = getJSONFixture('respNetworksList.json');

        // Create new instance
        listImages = new ListImages();
        listImages.init();

    });

    afterEach(function () {

        MashupPlatform.reset();
        jasmine.resetAll(JSTACK.Keystone);
        jasmine.resetAll(JSTACK.Nova);
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
        callAuthenticateWithError({"error": {"message": "An unexpected error prevented the server from fulfilling your request.", "code": 500, "title": "Internal Server Error"}});
        expect(consoleSpy.calls.mostRecent().args[0]).toBe("Error: " + JSON.stringify({message: "500 Internal Server Error", body: "An unexpected error prevented the server from fulfilling your request.", region: "IDM"}));
    });

    it('should call error callback for getImageList correctly', function () {

        var error = {message: 'Error 404', body: 'Image not found'};
        var spyLog = spyOn(console, 'log');

        callListImage();
        callListImageErrorCallback(error);

        expect(spyLog).toHaveBeenCalledWith("Error: " + JSON.stringify(error));
    });

    it('should call getserverlist 4 seconds after receiving the last update', function () {

        var refresh;
        var setTimeoutSpy = spyOn(window, 'setTimeout');

        callListImage();
        callListImageSuccessCallback(imageListSingleImage);
        refresh = setTimeout.calls.mostRecent().args[0];
        refresh();

        expect(JSTACK.Nova.getimagelist).toHaveBeenCalled();
        expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 4000);
    });

    it('should call createImage function when click event is triggered on the create image button', function () {

        var createButton = $("#create-image");
        var spyEvent, region;

        callListImage();
        callListImageSuccessCallback(respImageList);

        region = $('#id_region').find(":selected").val();
        
        $('#x-image-meta-name').val("ImageName");
        spyEvent = spyOnEvent(createButton, 'click');
        createButton.trigger('click');

        expect('click').toHaveBeenTriggeredOn('#create-image');
        expect(MashupPlatform.http.makeRequest).toHaveBeenCalledWith('https://cloud.lab.fiware.org/' + region + '/image/v1/images', jasmine.any(Object));

    });

    it('should call JSTACK.Nova.createserver with the given arguments', function () {

        var image = {
            id: "12345",
            name: "testImage",
            region: "someRegion",
            size: "3000000000"
        };
        var getNetworks, createServer;

        callListImage();
        listImages.launchImage(image);
        
        getNetworks = JSTACK.Nova.getflavorlist.calls.mostRecent().args[1];
        getNetworks(respFlavorList);
        
        createServer = JSTACK.Neutron.getnetworkslist.calls.mostRecent().args[0];
        createServer(respNetworksList.networks);

        expect(JSTACK.Nova.createserver).toHaveBeenCalledWith(image.name + "__instance", image.id, "2", undefined, undefined, [], "1", "1", undefined, jasmine.any(Array), undefined, {"region": image.region}, jasmine.any(Function), jasmine.any(Function), image.region);
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
