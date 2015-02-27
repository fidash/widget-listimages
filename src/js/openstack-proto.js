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
            {'title': 'Actions'}
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

        hiddenColumns = [];
        
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

    function launchInstanceCallback (response) {

        // Show instance created message
        console.log("New instance created");
    }

    function getDisplayableSize (size) {
        
        var units = [
            "B",
            "kiB",
            "MiB",
            "GiB",
            "TiB",
            "PiB",
            "EiB",
            "ZiB",
            "YiB",
        ];
        size = parseFloat(size);
        var displayableSize = size;
        var unit = 0;

        if (size <= 1024) {
            return size + units[0];
        }

        while (parseFloat(displayableSize/1024) > parseFloat(1) && unit < 9) {
            displayableSize /= 1024;
            unit += 1;
        }

        return displayableSize.toFixed(2) + ' ' + units[unit];
    
    }

    function callbackImageList (result) {
        
        var image, displayableSize;
        var dataSet = [];

        // Launch button
        var wrapper = $('<div>');
        var launchButton = $('<button>')
            .addClass('btn btn-primary')
            .text('Launch')
            .appendTo(wrapper);

        // Clear previous elements
        dataTable.clear();

        // Build table body
        for (var i=0; i<result.images.length; i++) {
            image = result.images[i];

            image.is_public = image.is_public ? 'Public' : 'Private';  
            displayableSize = getDisplayableSize(image.size);

            dataTable.row.add([
                image.id,
                image.name,
                image.status,
                image.is_public,
                image.checksum,
                image.created_at,
                image.updated_at,
                displayableSize,
                image.container_format,
                image.disk_format,
                wrapper.html()
            ]).draw();
        }

        // Launch button events
        $('#images_table tbody tr td').on('click', 'button', function () {
            
            // Undefined parameters
            var key_name,
                user_data,
                security_groups,
                min_count,
                max_count,
                availability_zone;

            var row = $(this).parent().parent();
            var data = dataTable.row(row).data();

            JSTACK.Nova.createserver(data[1] + '__instance', data[0], 1, key_name, user_data, security_groups, min_count, max_count, availability_zone, launchInstanceCallback, onerror);
        });

        // Row events
        $('#images_table tbody').on('click', 'tr', function () {
            var data = dataTable.row(this).data();
            var id = data[0];
            $('#images_table tbody tr').removeClass('selected');
            $(this).addClass('selected');
            rowClickCallback(id);
        });

        dataTable.columns.adjust().draw();

        setTimeout(function () {
            getImageList();
        }, 2000);

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
