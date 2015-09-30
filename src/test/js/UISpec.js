/* global UI */

describe('User Interface', function () {
	"use strict";

	var listImages = null;
    var respImageList = null;
    var respAuthenticate = null;
    var imageListSingleImage = null;
    var initCallbacks, drawCallbacks;
	var prefsValues;
	var units = [
        {
            "unit": "B",
            "bytes": 1,
            "expected": "1 B"
        },
        {
            "unit": "kiB",
            "bytes": 1024,
            "expected": "1.00 kiB"
        },
        {
            "unit": "kiB",
            "bytes": 135821,
            "expected": "132.64 kiB"
        },
        {
            "unit": "MiB",
            "bytes": 1048576,
            "expected": "1.00 MiB"
        },
        {
            "unit": "MiB",
            "bytes": 12358468,
            "expected": "11.79 MiB"
        },
        {
            "unit": "GiB",
            "bytes": 1073741824,
            "expected": "1.00 GiB"
        },
        {
            "unit": "GiB",
            "bytes": 4532282751,
            "expected": "4.22 GiB"
        },
        {
            "unit": "TiB",
            "bytes": 1.099511628e12,
            "expected": "1.00 TiB"
        },
        {
            "unit": "TiB",
            "bytes": 5423864125103,
            "expected": "4.93 TiB"
        },
        {
            "unit": "PiB",
            "bytes": 1.125899907e15,
            "expected": "1.00 PiB"
        },
        {
            "unit": "PiB",
            "bytes": 1452687412365789,
            "expected": "1.29 PiB"
        },
        {
            "unit": "EiB",
            "bytes": 1.152921505e18,
            "expected": "1.00 EiB"
        },
        {
            "unit": "EiB",
            "bytes": 4125369753962148752,
            "expected": "3.58 EiB"
        },
        {
            "unit": "ZiB",
            "bytes": 1.180591621e21,
            "expected": "1.00 ZiB"
        },
        {
            "unit": "ZiB",
            "bytes": 4756123651742368426957,
            "expected": "4.03 ZiB"
        },
        {
            "unit": "YiB",
            "bytes": 1.20892582e24,
            "expected": "1.00 YiB"
        },
        {
            "unit": "YiB",
            "bytes": 5123698741236987412369874,
            "expected": "4.24 YiB"
        }
    ];

    beforeEach(function () {
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

        MashupPlatform.setStrategy(new MyStrategy(), prefsValues);

        // Load fixtures
        jasmine.getFixtures().fixturesPath = 'base/src/test/fixtures/html';
        loadFixtures('defaultTemplate.html');
        jasmine.getJSONFixtures().fixturesPath = 'base/src/test/fixtures/json';
        respImageList = getJSONFixture('respImageList.json');
        respAuthenticate = getJSONFixture('respAuthenticate.json');
        imageListSingleImage = getJSONFixture('imageListSingleImage.json');

        // Callbacks spies
        initCallbacks = jasmine.createSpyObj('initCallbacks', ['refresh', 'create']);
        drawCallbacks = jasmine.createSpyObj('drawCallbacks', ['getImageList', 'launch']);

        UI.createTable(initCallbacks.refresh, initCallbacks.create);
        UI.updateHiddenColumns();
    });

    afterEach(function () {
        $('#images_table').empty();
        $('.FixedHeader_Cloned.fixedHeader.FixedHeader_Header > table').empty();
    });


    /**************************************************************************/
    /*                     I N T E R F A C E   T E S T S                      */
    /**************************************************************************/

    units.forEach(function (unit) {
        it('should display image size in ' + unit.unit + ' correctly', function () {
            
            var imageData = imageListSingleImage.images[0];
            
            // Change size value temporarily
            var sizeCopy = imageData.size;
            imageData.size = unit.bytes;
            prefsValues["MashupPlatform.prefs.get"].size = true;

			UI.updateHiddenColumns();
			UI.drawImages(drawCallbacks, false, imageListSingleImage.images);

            expect($('tbody > tr > td')[4]).toContainText(unit.expected);

            // Restore size value
            prefsValues["MashupPlatform.prefs.get"].size = false;
            imageData.size = sizeCopy;
        });
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

        UI.drawImages(drawCallbacks, false, imageListSingleImage.images);
        
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

        UI.updateHiddenColumns();
        UI.drawImages(drawCallbacks, false, respImageList.images);

        columns = $('.fixedHeader th');

        for (var i=0; i<columns.length; i++) {
            expect(columns[i].textContent).toEqual(expectedColumns[i]);
        }
    });

	it('should call MashupPlatform.wiring.pushEvent when click event triggered on a row', function () {

        var spyEvent = spyOnEvent('tbody > tr', 'click');
        var imageId;

        UI.drawImages(drawCallbacks, false, respImageList.images);
        
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

        var image = imageListSingleImage.images[0];
        var expectedTextList = [
            image.id,
            image.name,
            image.status,
            'Public',
            image.checksum,
            (new Date(image.created_at)).toUTCString(),
            (new Date(image.updated_at)).toUTCString(),
            parseFloat(image.size/1024/1024/1024).toFixed(2) + " GiB",
            image.container_format,
            image.disk_format
        ];
        var cell;

        UI.updateHiddenColumns();
        UI.drawImages(drawCallbacks, false, imageListSingleImage.images);                

        for (var i=0; i<expectedTextList.length; i++) {
            
            cell = $('tbody > tr > td')[i];
            expect(cell).toContainText(expectedTextList[i]);
        }
    });

    it('should start loading animation with width lesser than the height', function () {
        
        var bodyWidth = 100;

        $('body').width(bodyWidth);
        $('body').height(bodyWidth + 100);
        
        UI.startLoadingAnimation($('.loading'), $('.loading i'));

        expect($('.loading i').css('font-size')).toBe(Math.floor(bodyWidth/4) + 'px');

        // Return to original state
        UI.stopLoadingAnimation($('.loading'));
    });

    it('should start loading animation with height lesser than the width', function () {
        
        var bodyHeight = 100;
        
        $('body').width(bodyHeight + 100);
        $('body').height(bodyHeight);

        UI.startLoadingAnimation($('.loading'), $('.loading i'));

        expect($('.loading i').css('font-size')).toBe(Math.floor(bodyHeight/4) + 'px');

        // Return to original state
        UI.stopLoadingAnimation($('.loading'));
    });

    it('should correctly search images when new data is introduced in the input field', function () {

        var spyEvent = spyOnEvent('.search-container input', 'keyup');
        
        $('.search-container input')
            .val('RealVirtualInteractionGE-3.3.3')
            .trigger('keyup');

        expect('keyup').toHaveBeenTriggeredOn('.search-container input');
        expect($('tbody').children().size()).toBe(1);
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

    it('should expand the search bar', function () {
        var searchButton = $('.search-container button');
        var spyEvent = spyOnEvent('.search-container button', 'click');

        searchButton.click();

        expect('click').toHaveBeenTriggeredOn('.search-container button');
        expect('.search-container input').toHaveClass('slideRight');
        expect('.search-container input').toBeFocused();

        // Return to original state
        searchButton.click();
    });

    it('should collapse the search bar', function () {
        var searchButton = $('.search-container button');

        searchButton.click();
        searchButton.click();

        expect('.search-container input').not.toHaveClass('slideRight');
        expect('.search-container input').not.toBeFocused();
    });

    it('should expand the region selector', function () {
        var regionButton = $('button .fa-globe');
        var spyEvent = spyOnEvent('button .fa-globe', 'click');

        regionButton.click();

        expect('click').toHaveBeenTriggeredOn('button .fa-globe');
        expect('#region-selector').toHaveClass('slideRight');

        // Return to original state
        regionButton.click();
    });

    it('should collapse the region selector', function () {
        var regionButton = $('button .fa-globe');

        regionButton.click();
        regionButton.click();

        expect('#region-selector').not.toHaveClass('slideRight');
    });

    it('should select a region after clicking on its selector', function () {
        var regionSelector = $('input[value=Spain2]').parent();

        regionSelector.click();

        expect('input[value=Spain2]').toHaveClass('selected');
        expect('input[value=Spain2]').toHaveProp('checked', true);

        // Return to original state
        regionSelector.click();
    });

    it('should select a region after clicking on its selector', function () {
        var regionSelector = $('input[value=Spain2]').parent();

        regionSelector.click();
        regionSelector.click();

        expect('input[value=Spain2]').not.toHaveClass('selected');
        expect('input[value=Spain2]').toHaveProp('checked', false);
        
    });

    it('should call launchImage when a click event is triggered on a launch button', function () {

        var spyEvent = spyOnEvent('tbody > tr button', 'click');
        var imageId;

        UI.drawImages(drawCallbacks, false, respImageList.images);
        
        $('tbody > tr button').trigger('click');

    it('should select Spain2 by default when loading the widget', function () {
        expect('input[value=Spain2]').toHaveProp('checked', true);
    });
});