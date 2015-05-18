/* global Utils,UI */

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

    }


    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/

    function handlePreferences () {

        UI.updateHiddenColumns();

    }

    function launchInstanceCallback (response) {

        // Show instance created message
        console.log("New instance created");

    }

    function readCreateImageForm (form) {

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
        getImageList();

    }

    function onError (error) {

        if (error.message in ERRORS) {
            Utils.createAlert('danger', 'Error', ERRORS[error.message], error);            
        }
        else {
            Utils.createAlert('danger', error.message, error.body);
        }

        console.log('Error: ' + JSON.stringify(error));
    }

    function authError (error) {
        onError(error);
        authenticate();
    }


    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    function init () {

        $('input[name=image]').change(function () {
            if ($(this).val() === "file") {
                $('#x-image-meta-file').prop('disabled', false);
                $('#x-image-meta-location')
                    .prop('disabled', true)
                    .val('');
            }
            else {
                $('#x-image-meta-file')
                    .prop('disabled', true)
                    .val('');
                $('#x-image-meta-location').prop('disabled', false);
            }
        });

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

        var glanceURL = "https://cloud.lab.fiware.org/Spain2/image/v1/images";
        var token = JSTACK.Keystone.params.token;
        var form = $('#create_image_form');
        var headers = readCreateImageForm(form);
        headers['X-Auth-Token'] = token;
        var content = $('input[type=radio][name=image]').val() == 'file' ? "application/octet-stream" : "application/json";
        var file = $('#x-image-meta-file').val() !== "" ? $('#x-image-meta-file')[0].files[0] : "";

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

    function getImageList () {
        var callbacks = {
            "getImageList": getImageList,
            "launchInstanceCallback": launchInstanceCallback
        };

        JSTACK.Nova.getimagelist(true, UI.drawImages.bind(null, callbacks), onError, "Spain2");
    }

    return ListImages;
})(JSTACK);
