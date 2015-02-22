var OpenStackProto = (function (JSTACK) {
    "use strict";

    var url = 'https://cloud.lab.fiware.org/keystone/v2.0/';
    var imageList, dataTable, hiddenColumns;

    function authenticate () {
        
        var tokenId, tenantId;
        var postBody, headersAuth;
        var options;
        var USERNAME, PASSWORD;
        var headersTenants = {};

        headersAuth = {
            "Accept": "application/json",
            "X-FI-WARE-OAuth-Token": "true",
            "X-FI-WARE-OAuth-Token-Body-Pattern": "%fiware_token%"
        };

        headersTenants['X-FI-WARE-OAuth-Token'] = 'true';
        headersTenants['X-FI-WARE-OAuth-Header-Name'] = 'X-Auth-Token';

        postBody = {
            "auth": {}
        };

        postBody.auth.token = {
            "id": "%fiware_token%"
        };


        // Initialize Keystone
        JSTACK.Keystone.init(url);

        // Get tenants with the user's FIWARE token
        MashupPlatform.http.makeRequest(url + 'tenants', {
            method: 'GET',
            requestHeaders: headersTenants,
            onSuccess: function (response) {

                response = JSON.parse(response.responseText);
                postBody.auth.tenantId = response.tenants[0].id;

                // Post request to receive service token from Openstack
                MashupPlatform.http.makeRequest(url + 'tokens', {
                    requestHeaders: headersAuth,
                    contentType: "application/json",
                    postBody: JSON.stringify(postBody),
                    onSuccess: function (response) {
                        response = JSON.parse(response.responseText);

                        // Mimic JSTACK.Keystone.authenticate behavior on success
                        JSTACK.Keystone.params.token = response.access.token.id;
                        JSTACK.Keystone.params.access = response.access;
                        JSTACK.Keystone.params.currentstate = 2;

                        createTable();
                        getImageList();
                    },
                    onFailure: function (response) {
                        onError(response);
                    }
                });

            },
            onFailure: function (response) {
                onError(response);
            }
        });
        
    }

    function createTable () {

        var refresh, createButton, modalCreateButton;

        // TODO let the user choose the content of columns as a preference
        var columns = [
            {'title': 'ID'},
            {'title': 'Name'},
            {'title': 'Status'},
            {'title': 'Visibility'},
            {'title': 'Checksum'},
            {'title': 'Created'},
            {'title': 'Updated'},
            {'title': 'Size'},
            {'title': 'Container format'},
            {'title': 'Disk format'},
        ];

        dataTable = $('#images_table').DataTable({
            'columns': columns,
            "columnDefs": [
                {
                    "targets": hiddenColumns,
                    "visible": false
                }
            ],
            'binfo': false,
            //responsive: true,
            'pagingType': 'full_numbers',
            'info': false
        });

        // Set refresh button
        refresh = $('<button>');
        refresh.text('Refresh');
        refresh.addClass('btn btn-default action-button pull-left');
        refresh.click(getImageList);
        refresh.insertBefore($('#images_table_paginate'));

        // Set upload button
        createButton = $('<button>');
        createButton.text('Create Image');
        createButton.addClass('btn btn-default action-button pull-left');
        createButton.attr('data-toggle', 'modal');
        createButton.attr('data-target', '#uploadImageModal');
        createButton.insertBefore($('#images_table_paginate'));

        // Set modal create image button click
        modalCreateButton = $('#create-image');
        //modalCreateButton.on('click', createImage);

    }

    function getImageList () {

        JSTACK.Nova.getimagelist(true, callbackImageList, onError, null);

    }

    function rowClickCallback (id) {
        var data = {
            'id': id,
            'access': JSTACK.Keystone.params.access
        };
        MashupPlatform.wiring.pushEvent('image_id', JSON.stringify(data));
    }

    function handlePreferences () {

        var display;
        var preferenceList = [
            'id',
            'name',
            'status',
            'visibility',
            'checksum',
            'created',
            'updated',
            'size',
            'container_format',
            'disk_format'
        ];
        
        for (var i=0; i<preferenceList.length; i++) {

            display = MashupPlatform.prefs.get(preferenceList[i]);
            
            if (!display) {
                hiddenColumns.push(i);
            }

            if (dataTable) {
                dataTable.column(i).visible(display, false);
            }

        }

        // Recalculate all columns size at once
        if (dataTable) {
            dataTable.columns.adjust().draw(false);
        }

    }

    function callbackImageList (result) {
        
        var image;
        var dataSet = [];

        // Clear previous elements
        dataTable.clear();

        // Build table body
        for (var i=0; i<result.images.length; i++) {
            image = result.images[i];

            image.is_public = image.is_public ? 'Public' : 'Private';

            dataTable.row.add([
                image.id,
                image.name,
                image.status,
                image.is_public,
                image.checksum,
                image.created_at,
                image.updated_at,
                image.size,
                image.container_format,
                image.disk_format
            ]).draw();
        }

        // Row events
        $('#images_table tbody').on('click', 'tr', function () {
            var id = $(this).children()[0].textContent;
            $('#images_table tbody tr').removeClass('selected');
            $(this).addClass('selected');
            rowClickCallback(id);
        });

        dataTable.columns.adjust().draw();

    }

    function onError (error) {
        console.log('Error: ' + JSON.stringify(error));
    }

    function OpenStackProto () {

        // Initialize parameters
        dataTable = null;
        hiddenColumns = [];

        this.init = authenticate;
        this.listImage = getImageList;

        // Initialize preferences
        handlePreferences();

        // Preferences handler
        MashupPlatform.prefs.registerCallback(handlePreferences);

    }

    return OpenStackProto;
})(JSTACK);
