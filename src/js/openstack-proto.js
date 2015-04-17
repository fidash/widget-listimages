var OpenStackProto = (function (JSTACK) {
    "use strict";

    var url = 'https://cloud.lab.fiware.org/keystone/v2.0/';
    var imageList, dataTable, hiddenColumns, fixedHeader, selectedRowId;

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

        // Start loading animation
        startLoadingAnimation();

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

                        // Stop loading animation
                        stopLoadingAnimation();
                        
                        // Create table
                        createTable();

                        // Get image list and draw it in the table
                        getImageList();
                    },
                    onFailure: function (error) {
                        authError(error);
                    }
                });

            },
            onFailure: function (error) {
                authError(error);
            }
        });
        
    }

    function createTable () {

        var refresh, createButton, modalCreateButton, search, searchButton,
            searchInput;
        var focusState = false;

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
            'dom': 't<"navbar navbar-default navbar-fixed-bottom"p>',
            'binfo': false,
            'pagingType': 'full_numbers',
            'info': false,
            "language": {
                "paginate": {
                    "first": '<i class="fa fa-fast-backward"></i>',
                    "last": '<i class="fa fa-fast-forward"></i>',
                    "next": '<i class="fa fa-forward"></i>',
                    "previous": '<i class="fa fa-backward"></i>'
                }
            }
        });

        // Padding bottom for fixed to bottom bar
        $('#images_table_wrapper').attr('style', 'padding-bottom: 40px;');

        // Pagination style
        $('#images_table_paginate').addClass('pagination pull-right');

        // Fixed header
        fixedHeader = new $.fn.dataTable.FixedHeader(dataTable);

        $(window).resize(function () {
            fixedHeader._fnUpdateClones(true); // force redraw
            fixedHeader._fnUpdatePositions();
        });

        // Set upload button
        createButton = $('<button>')
            .html('<i class="fa fa-plus"></i>')
            .addClass('btn btn-primary action-button pull-left')
            .attr('data-toggle', 'modal')
            .attr('data-target', '#uploadImageModal')
            .insertBefore($('#images_table_paginate'));

        // Set Search field
        search = $('<div>').addClass('input-group search-container').insertBefore($('#images_table_paginate'));
        searchButton = $('<button>').addClass('btn btn-default').html('<i class="fa fa-search"></i>');
        $('<span>').addClass('input-group-btn').append(searchButton).appendTo(search);
        searchInput = $('<input>').attr('type', 'text').attr('placeholder', 'Search for...').addClass('search form-control').appendTo(search);

        searchButton.on('click', function () {
            focusState = !focusState;
            
            searchInput.toggleClass('slideRight');
            searchButton.parent()
                .css('z-index', 20);

            if (focusState) {
                searchInput.focus();
            }
        });

        searchInput.on( 'keyup', function () {
            dataTable.search(this.value).draw();
        });

        // Set refresh button
        refresh = $('<button>')
            .html('<i class="fa fa-refresh"></i>')
            .addClass('btn btn-default action-button pull-left')
            .click(getImageList)
            .insertBefore($('#images_table_paginate'));

        // Set modal create image button click
        modalCreateButton = $('#create-image');
        modalCreateButton.on('click', createImage);

    }

    function createImage (e) {

        var glanceURL = "https://cloud.lab.fiware.org/Spain2/image/v1/images";
        var token = JSTACK.Keystone.params.token;
        var form = $('#create_image_form');
        var headers = {
            "X-Auth-Token": token
        };

        $.each(form.serializeArray(), function(i, field) {
            if (field.value !== "") {
                headers[field.name] = field.value;
            }
        });

        // Post request to receive service token from Openstack
        MashupPlatform.http.makeRequest(glanceURL, {
            requestHeaders: headers,
            contentType: "application/json",
            onSuccess: createImageSuccess,
            onFailure: onError
        });

        // Reset form, prevent submit and close modal
        form.reset();
        e.preventDefault();
        $('#uploadImageModal').modal('hide');

    }

    function createImageSuccess (response) {
        getImageList();
    }

    function getImageList () {
        JSTACK.Nova.getimagelist(true, callbackImageList, onError, "Spain2");
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

    function startLoadingAnimation () {

        // Reference size is the smaller between height and width
        var referenceSize = (window.innerWidth < window.innerHeight) ? window.innerWidth : window.innerHeight;
        var font_size = referenceSize / 4;

        // Calculate loading icon size
        $('.loading i').css('font-size', font_size);

        // Show
        $('.loading').removeClass('hide');

    }

    function stopLoadingAnimation () {

        // Hide
        $('.loading').addClass('hide');
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
        
        var image, displayableSize, scroll, page, row;
        var dataSet = [];

        // Launch button
        var wrapper = $('<div>');
        var launchButton = $('<button>')
            .addClass('btn btn-primary')
            .text('Launch')
            .appendTo(wrapper);


        // Save previous scroll and page
        scroll = $(window).scrollTop();
        page = dataTable.page();

        // Clear previous elements
        dataTable.clear();

        // Build table body
        for (var i=0; i<result.images.length; i++) {
            image = result.images[i];

            image.is_public = image.is_public ? 'Public' : 'Private';  
            displayableSize = getDisplayableSize(image.size);

            row = dataTable.row.add([
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
            ])
            .draw()
            .nodes()
            .to$();

            if (image.id === selectedRowId) {
                row.addClass('selected');
            }
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

            JSTACK.Nova.createserver(data[1] + '__instance', data[0], 1, key_name, user_data, security_groups, min_count, max_count, availability_zone, launchInstanceCallback, onerror, "Spain2");
        });

        // Remove previous row click events
        $('#images_table tbody').off('click', '**');

        // Row events
        $('#images_table tbody').on('click', 'tr', function () {
            var data = dataTable.row(this).data();
            var id = data[0];
            selectedRowId = id;

            dataTable.row('.selected')
                .nodes()
                .to$()
                .removeClass('selected');
            $(this).addClass('selected');
            rowClickCallback(id);
        });

        dataTable.columns.adjust().draw();

        // Restore previous scroll and page
        $(window).scrollTop(scroll);
        dataTable.page(page).draw(false);
        
        setTimeout(function () {
            getImageList();
        }, 4000);
        
        fixedHeader._fnUpdateClones(true); // force redraw
        fixedHeader._fnUpdatePositions();
    }

    function createAlert (type, title, message, details) {

        // TODO buffer them and shown them on a list instead of removing them
        // Hide previous alerts
        $('.alert').hide();
 
        var alert = $('<div>')
            .addClass('alert alert-dismissible alert-' + type + ' fade in')
            .attr('role', 'alert')
            .html('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>');

        // Title
        $('<strong>')
            .text(title + ' ')
            .appendTo(alert);

        // Message
        $('<span>')
            .text(message  + ' ')
            .appendTo(alert);

        if (details) {
            // Details
            var detailsMessage = $('<div>')
                .appendTo(alert)
                .hide();
            for (var detail in details) {
                detailsMessage.text(detailsMessage.text() + details[detail] + ' ');
            }

            // Toggle details
            $('<a>')
                .text('Details')
                .click(function () {
                    detailsMessage.toggle('fast');
                })
                .insertBefore(detailsMessage);
        }

        $('body').append(alert);

    }

    function onError (error) {

        var errors = {
            '500 Error': 'An error has occurred on the server side.',
            '503 Error': 'Cloud service is not available at the moment.'
        };

        if (error.message in errors) {
            createAlert('danger', 'Error', errors[error.message], error);            
        }
        else {
            createAlert('danger', error.message, error.body);
        }

        console.log('Error: ' + JSON.stringify(error));
    }

    function authError (error) {
        onError(error);
        authenticate();
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
