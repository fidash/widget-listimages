/* global Utils */

var UI = (function () {
    "use strict";

    var hiddenColumns = [];
    var dataTable;

    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/

    function selectImage (id) {
        var data = {
            'id': id,
            'access': JSTACK.Keystone.params.access,
            'token': JSTACK.Keystone.params.token
        };
        MashupPlatform.wiring.pushEvent('image_id', JSON.stringify(data));
    }

    function initDataTable () {

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

        dataTable = $('#images_table').dataTable({
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
    }

    function createSearchField (nextElement) {

        var search = $('<div>').addClass('input-group search-container').insertBefore(nextElement);
        var searchButton = $('<button>').addClass('btn btn-default').html('<i class="fa fa-search"></i>');
        $('<span>').addClass('input-group-btn').append(searchButton).appendTo(search);
        var searchInput = $('<input>').attr('type', 'text').attr('placeholder', 'Search for...').addClass('search form-control').appendTo(search);
        var focusState = false;

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
            dataTable.api().search(this.value).draw();
        });
    }

    function createModalButton (nextElement) {

        $('<button>')
            .html('<i class="fa fa-plus"></i>')
            .addClass('btn btn-primary action-button pull-left')
            .attr('data-toggle', 'modal')
            .attr('data-target', '#uploadImageModal')
            .insertBefore(nextElement);
    }

    function createRefreshButton (nextElement, refreshCallback) {

        $('<button>')
            .html('<i class="fa fa-refresh"></i>')
            .addClass('btn btn-default action-button pull-left')
            .click(refreshCallback)
            .insertBefore(nextElement);
    }

    function buildTableBody (imageList) {

        var row, image;

        // Launch button
        var wrapper = $('<div>');
        var launchButton = $('<button>')
            .addClass('btn btn-primary')
            .text('Launch')
            .appendTo(wrapper);

        // Clear previous elements
        dataTable.api().clear();

        for (var i=0; i<imageList.images.length; i++) {
           
            image = imageList.images[i];
            image.is_public = image.is_public ? 'Public' : 'Private';

            row = dataTable.api().row.add([
                image.id,
                image.name,
                image.status,
                image.is_public,
                image.checksum,
                image.created_at,
                image.updated_at,
                Utils.getDisplayableSize(image.size),
                image.container_format,
                image.disk_format,
                wrapper.html()
            ])
            .draw()
            .nodes()
            .to$();

            if (UI.selectedRowId && image.id === UI.selectedRowId) {
                row.addClass('selected');
            }
        }
    }

    function setLaunchInstanceEvents (launchInstanceCallback) {

        // Launch button events
        $('#images_table tbody tr td').on('click', 'button', function () {
            
            // Undefined parameters
            var key_name,
                user_data,
                security_groups,
                min_count,
                max_count,
                availability_zone,
                networks,
                block_device_mapping,
                metadata;

            var row = $(this).parent().parent();
            var data = dataTable.api().row(row).data();

            JSTACK.Nova.createserver(data[1] + '__instance', data[0], 1, key_name, user_data, security_groups, min_count, max_count, availability_zone, networks, block_device_mapping, metadata, launchInstanceCallback, onerror, "Spain2");
        });
    }

    function setSelectImageEvents () {

        // Remove previous row click events
        $('#images_table tbody').off('click', '**');

        // Row events
        $('#images_table tbody').on('click', 'tr', function () {
            var data = dataTable.api().row(this).data();
            var id = data[0];
            UI.selectedRowId = id;

            dataTable.api().row('.selected')
                .nodes()
                .to$()
                .removeClass('selected');
            $(this).addClass('selected');
            selectImage(id);
        });
    }

    function initFixedHeader () {
        // Fixed header
        UI.fixedHeader = new $.fn.dataTable.FixedHeader(dataTable);

        $(window).resize(function () {
            UI.fixedHeader._fnUpdateClones(true); // force redraw
            UI.fixedHeader._fnUpdatePositions();
        });
    }


    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    function createTable (refreshCallback, modalSubmitCallback) {

        initDataTable();

        // Extra padding to adjust to bottom fixed navbar
        $('#images_table_wrapper').attr('style', 'padding-bottom: 40px;');

        // Pagination style
        $('#images_table_paginate').addClass('pagination pull-right');

        createModalButton($('#images_table_paginate'));
        createSearchField($('#images_table_paginate'));
        createRefreshButton($('#images_table_paginate'), refreshCallback);

        // Set modal create image button click
        $('#create-image').on('click', modalSubmitCallback);

    }

    function updateHiddenColumns () {

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
                dataTable.api().column(i).visible(display, false);
            }

        }

        // Recalculate all columns size at once
        if (dataTable) {
            dataTable.api().columns.adjust();
        }

    }

    function drawImages (callbacks, imageList) {

        // Save previous scroll and page
        var scroll = $(window).scrollTop();
        var page = dataTable.api().page();

        buildTableBody(imageList);
        setLaunchInstanceEvents(callbacks.launchInstanceCallback);
        setSelectImageEvents();

        dataTable.api().columns.adjust().draw();

        // Restore previous scroll and page
        $(window).scrollTop(scroll);
        dataTable.api().page(page).draw(false);
        
        setTimeout(function () {
            callbacks.getImageList();
        }, 4000);
        
        initFixedHeader();
    }

    function startLoadingAnimation (element, icon) {

        var bodyWidth = $('body').width();
        var bodyHeight = $('body').height();

        // Reference size is the smaller between height and width
        var referenceSize = (bodyWidth < bodyHeight) ? bodyWidth : bodyHeight;
        var font_size = referenceSize / 4;

        icon.css('font-size', font_size);
        element.removeClass('hide');

    }

    function stopLoadingAnimation (element) {

        element.addClass('hide');

    }

    return {
        createTable: createTable,
        updateHiddenColumns: updateHiddenColumns,
        drawImages: drawImages,
        startLoadingAnimation: startLoadingAnimation,
        stopLoadingAnimation: stopLoadingAnimation
    };
})();