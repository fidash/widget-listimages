/* global Utils,UI,Region,OStackAuth,MashupPlatform */

var ListImages = (function (JSTACK) {
    "use strict";

    var ERRORS = {
        '500 Error': 'An error has occurred in FIWARE\'s Cloud.',
        '503 Error': 'FIWARE\'s Cloud service is not available at the moment.',
        '422 Error': 'You are not authenticated in the wirecloud platform.'
    };

    var authURL = 'https://cloud.lab.fiware.org/keystone/v3/auth/';


    /******************************************************************/
    /*                      C O N S T R U C T O R                     */
    /******************************************************************/

    function ListImages () {

        this.init = init;
        this.authenticate = authenticate;
        this.listImage = getImageList;
        this.createImage = createImage;
        this.launchImage = launchImage;
        this.mintime = 2000;
        this.maxtime = 30000;

    }


    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/

    function handlePreferences () {
        /* jshint validthis: true */
        this.mintime = MashupPlatform.prefs.get("mintime") * 1000;
        this.maxtime = MashupPlatform.prefs.get("maxtime") * 1000;
        UI.updateHiddenColumns();

    }

    function getFittingFlavor (flavorList, imageSize) {
        for (var flavor in flavorList) {
            if (imageSize < flavorList[flavor].disk) {
                return flavorList[flavor].id;
            }
        }
    }

    function getNetworksObject (networkList) {
        var networks = [];

        networkList.forEach(function (network) {
            networks.push({uuid: network.id});
        });

        return networks;
    }

    function readFormFields (form) {

        var fields = {};

        $.each(form.serializeArray(), function(i, field) {
            if (field.value !== "") {
                if (field.name === "image" && field.value === "file" && $('#x-image-meta-file').val() !== "") {
                    fields['x-image-meta-size'] = $('#x-image-meta-file')[0].files[0].size;
                }
                else {
                    fields[field.name] = field.value;
                }
            }
        });

        return fields;
    }

    function createWidgetUI (tokenResponse) {
        /* jshint validthis: true */
        var token = tokenResponse.getHeader('x-subject-token');
        var responseBody = JSON.parse(tokenResponse.responseText);

        // Temporal change to fix catalog name
        responseBody.token.serviceCatalog = responseBody.token.catalog;

        // Mimic JSTACK.Keystone.authenticate behavior on success
        JSTACK.Keystone.params.token = token;
        JSTACK.Keystone.params.access = responseBody.token;
        JSTACK.Keystone.params.currentstate = 2;

        UI.stopLoadingAnimation($('.loading'));
        UI.createTable(getImageList.bind(this), createImage);
        getImageList.call(this, true);

    }

    function onError (error) {
        if (error.message in ERRORS) {
            Utils.createAlert('danger', 'Error', ERRORS[error.message], error.region, error);
        }
        else {
            Utils.createAlert('danger', error.message, error.body, error.region);
        }
        UI.deactivateProgressBar();
        console.log('Error: ' + JSON.stringify(error));
    }

    function authError (error) {
        error = error.error;
        onError({message: error.code + " " + error.title, body: error.message, region: "IDM"});
        authenticate();
    }

    function createJoinRegions (regionsLimit, autoRefresh) {
        /* jshint validthis: true */

        var currentImageList = [];
        var errorList = [];

        function deductRegionLimit () {

            regionsLimit -= 1;

            if (regionsLimit === 0) {

                var callbacks = {
                    getImageList: getImageList.bind(this),
                    launch: launchImage.bind(this)
                };

                UI.drawImages(callbacks, autoRefresh, currentImageList);
                drawErrors();
            }
        }

        function drawErrors () {
            if (errorList.length === 0) return;

            errorList.forEach(function (error) {
                onError(error);
            });
        }

        function joinRegionsSuccess (region, imageList) {

            imageList.images.forEach(function (image) {
                image.region = region;
                currentImageList.push(image);
            });

            deductRegionLimit.call(this);
            UI.deactivateProgressBar();
        }

        function joinRegionsErrors (region, error) {

            error.region = region;
            errorList.push(error);

            deductRegionLimit.call(this);
            UI.deactivateProgressBar();
        }

        return {
            success: joinRegionsSuccess.bind(this),
            error: joinRegionsErrors.bind(this)
        };
    }


    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    function init () {
        /* jshint validthis: true */
        // Initialize preferences
        handlePreferences.call(this);

        // Preferences handler
        MashupPlatform.prefs.registerCallback(handlePreferences.bind(this));
        MashupPlatform.wiring.registerCallback("regions", function(regionsraw) {
            UI.toggleManyRegions(JSON.parse(regionsraw));
            getImageList.call(this);
        }.bind(this));
    }

    function authenticate () {
        /* jshint validthis: true */
        JSTACK.Keystone.init(authURL);
        UI.startLoadingAnimation($('.loading'), $('.loading i'));

        MashupPlatform.wiring.registerCallback("authentication", function(paramsraw) {
            var params = JSON.parse(paramsraw);
            var token = params.token;
            var responseBody = params.body;

            if (token === this.token) {
                // same token, ignore
                return;
            }

            // Mimic JSTACK.Keystone.authenticate behavior on success
            JSTACK.Keystone.params.token = token;
            JSTACK.Keystone.params.access = responseBody.token;
            JSTACK.Keystone.params.currentstate = 2;

            this.token = token;
            this.body = responseBody;

            // extra
            UI.stopLoadingAnimation($('.loading'));
            UI.createTable(getImageList.bind(this), createImage);
            getImageList.call(this, true);
        }.bind(this));
    }

    function createImage (e) {

        var token = JSTACK.Keystone.params.token;
        var form = $('#create_image_form');
        var headers = readFormFields(form);
        headers['X-Auth-Token'] = token;
        var content = $('input[type=radio][name=image]').val() == 'file' ? "application/octet-stream" : "application/json";
        var file = $('#x-image-meta-file').val() !== "" ? $('#x-image-meta-file')[0].files[0] : "";
        var glanceURL = "";

        var region = $('#id_region').find(":selected").val();

        glanceURL = "https://cloud.lab.fiware.org/" + region + "/image/v1/images";

        // Call OpenStack API
        MashupPlatform.http.makeRequest(glanceURL, {
            requestHeaders: headers,
            contentType: content,
            postBody: file,
            onSuccess: getImageList,
            onFailure: onError
        });

        // Reset form, prevent submit and close modal
        form[0].reset();
        e.preventDefault();
        $('#uploadImageModal').modal('hide');

    }

    function getImageList (autoRefresh) {
        /* jshint validthis: true */
        var regions = Region.getCurrentRegions();

        UI.activateProgressBar();
        if (regions.length === 0) {
            UI.clearTable();
        }
        else {
            var joinRegions = createJoinRegions(regions.length, autoRefresh);
            regions.forEach(function (region) {
                JSTACK.Nova.getimagelist(true, joinRegions.success.bind(null, region), joinRegions.error.bind(null, region), region);
            });
        }
        if (autoRefresh) {
            setTimeout(getImageList.bind(this, autoRefresh), this.maxtime);
        }
    }

    function launchImage (image) {
        // Undefined parameters
        var key_name,
            user_data,
            security_groups = [],
            min_count = "1",
            max_count = "1",
            availability_zone,
            block_device_mapping,
            metadata = {region: image.region};

        UI.activateProgressBar();
        JSTACK.Nova.getflavorlist(true, function (flavorResponse) {

            var selectedFlavorId = getFittingFlavor(flavorResponse.flavors, image.size);

            JSTACK.Neutron.getnetworkslist(function (networkResponse) {

                var networks = getNetworksObject(networkResponse);

                JSTACK.Nova.createserver(
                    image.name + '__instance',
                    image.id,
                    selectedFlavorId,
                    key_name,
                    user_data,
                    security_groups,
                    min_count,
                    max_count,
                    availability_zone,
                    networks,
                    block_device_mapping,
                    metadata,
                    function () {
                        console.log("Instance launched successfully.");
                        UI.deactivateProgressBar();
                    },
                    onError,
                    image.region
                );

            }.bind(this), onError, image.region);
        }.bind(this), onError, image.region);
    }

    return ListImages;
})(JSTACK);
