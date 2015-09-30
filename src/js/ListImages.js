/* global Utils,UI,Region */

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

    }


    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/

    function handlePreferences () {

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
        
        var token = tokenResponse.getHeader('x-subject-token');
        var responseBody = JSON.parse(tokenResponse.responseText);

        // Temporal change to fix catalog name
        responseBody.token.serviceCatalog = responseBody.token.catalog;

        // Mimic JSTACK.Keystone.authenticate behavior on success
        JSTACK.Keystone.params.token = token;
        JSTACK.Keystone.params.access = responseBody.token;
        JSTACK.Keystone.params.currentstate = 2;

        UI.stopLoadingAnimation($('.loading'));
        UI.createTable(getImageList, createImage);
        getImageList(true);

    }

    function onError (error) {

        if (error.message in ERRORS) {
            Utils.createAlert('danger', 'Error', ERRORS[error.message], error.region, error);
        }
        else {
            Utils.createAlert('danger', error.message, error.body, error.region);
        }

        console.log('Error: ' + JSON.stringify(error));
    }

    function authError (error) {
        error = error.error;
        onError({message: error.code + " " + error.title, body: error.message, region: "IDM"});
        authenticate();
    }

    function createJoinRegions (regionsLimit, autoRefresh) {

        var currentImageList = [];
        var errorList = [];

        function deductRegionLimit () {

            regionsLimit -= 1;

            if (regionsLimit === 0) {

                var callbacks = {
                    "getImageList": getImageList,
                    "launch": launchImage
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

            deductRegionLimit();
        }

        function joinRegionsErrors (region, error) {

            error.region = region;
            errorList.push(error);

            deductRegionLimit();
        }

        return {
            success: joinRegionsSuccess,
            error: joinRegionsErrors
        };
    }


    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    function init () {

        // Initialize preferences
        handlePreferences();

        // Preferences handler
        MashupPlatform.prefs.registerCallback(handlePreferences);

    }

    function authenticate () {
        
        var headersAuth = {
            "X-FI-WARE-OAuth-Token": "true",
            "X-FI-WARE-OAuth-Token-Body-Pattern": "%fiware_token%",
            "Accept": "application/json"
        };

        var authBody = {
            "auth": {
                "identity": {
                    "methods": [
                        "oauth2"
                    ],
                    "oauth2": {
                        "access_token_id": "%fiware_token%"
                    }
                }
            }
        };

        JSTACK.Keystone.init(authURL);
        UI.startLoadingAnimation($('.loading'), $('.loading i'));

        // Get token with user's FIWARE token
        MashupPlatform.http.makeRequest(authURL + 'tokens', {
            method: 'POST',
            requestHeaders: headersAuth,
            contentType: "application/json",
            postBody: JSON.stringify(authBody),
            onSuccess: createWidgetUI,
            onFailure: authError
        });
        
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

        var regions = Region.getCurrentRegions();

        if (regions.length === 0) {
            UI.clearTable();

            // Keep refreshing even if there are no regions selected
            if (autoRefresh) {
                setTimeout(function () {
                    getImageList(autoRefresh);
                }, 4000);
            }
        }
        else {
            var joinRegions = createJoinRegions(regions.length, autoRefresh);
            regions.forEach(function (region) {
                JSTACK.Nova.getimagelist(true, joinRegions.success.bind(null, region), joinRegions.error.bind(null, region), region);
            });
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
                    },
                    onerror,
                    image.region
                );

            }.bind(this), onerror, image.region);
        }.bind(this), onerror, image.region);

    }

    return ListImages;
})(JSTACK);
