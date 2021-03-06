/* global Utils,Region */

var UI = (function () {
    "use strict";

    var hiddenColumns = [];
    var dataTable;

    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/

    function selectImage (id, region) {
        // ?? Sending token through wiring?
        var data = {
            'id': id,
            'access': JSTACK.Keystone.params.access,
            'token': JSTACK.Keystone.params.token,
            'region': region
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
            {'title': 'Region'},
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
            else {
                searchInput.blur();
            }
        });

        searchInput.on( 'keyup', function () {
            dataTable.api().search(this.value).draw();
        });
    }

    function createModalButton (nextElement) {

        $('<button>')
            .html('<i class="fa fa-plus"></i>')
            .addClass('btn btn-success action-button pull-left')
            .attr('data-toggle', 'modal')
            .attr('data-target', '#uploadImageModal')
            .insertBefore(nextElement);
    }

    function createRefreshButton (nextElement, refreshCallback) {

        $('<button>')
            .html('<i class="fa fa-refresh"></i>')
            .addClass('btn btn-default action-button pull-left')
            .click(refreshCallback.bind(null, false))
            .insertBefore(nextElement);
    }

    function createRegionsButton (nextElement) {
        $('<button>')
            .html('<i class="fa fa-globe"></i>')
            .addClass('btn btn-primary action-button pull-left')
            .click(toggleRegionSelector)
            .insertBefore(nextElement);
    }

    function createProgressBar (nextElement) {
        var pgb = $('<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>');
        $("<div id=\"loadprogressbar\"></div>")
            .addClass('progress')
            .addClass('hidden') // Start hidden
            .append(pgb)
            .insertBefore(nextElement);
    }

    function activateProgressBar () {
        $("#loadprogressbar")
            .removeClass("hidden");
    }

    function deactivateProgressBar () {
        $("#loadprogressbar")
            .removeClass("hidden") // remove first
            .addClass("hidden");
    }


    function createRegionSelector (refreshCallback) {
        var regions = Region.getAvailableRegions();
        var regionSelector = $('<div>')
                .attr('id', 'region-selector')
                .addClass('region-selector')
                .css('max-height', window.innerHeight - 50)
                .appendTo($('body'));

        $(window).resize(function () {
            regionSelector.css('max-height', window.innerHeight - 50);
        });

        regions.forEach(function(region) {
            var checked = false;
            $('<div>')
                .html('<input type="checkbox" name="region" value="' + region + '" /> ' + region)
                .addClass('region-container')
                .click(function (e) {
                    var input = $('input', this);
                    checked = !checked;

                    input.toggleClass('selected');
                    input.prop('checked', checked);

                    Region.setCurrentRegions(regionSelector);
                    refreshCallback();

                })
                .appendTo(regionSelector);
        });

        $("div>input[type=checkbox][value=Spain2]").prop("checked", true);
        Region.setCurrentRegions(regionSelector);
        refreshCallback();
    }

    function toggleRegionSelector () {
        $('#region-selector').toggleClass('slideRight');
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

        imageList.forEach(function (image) {

            image.is_public = image.is_public ? 'Public' : 'Private';

            row = dataTable.api().row.add([
                image.id,
                image.name,
                image.status,
                image.is_public,
                image.checksum,
                Utils.formatDate(image.created_at),
                Utils.formatDate(image.updated_at),
                Utils.getDisplayableSize(image.size),
                image.container_format,
                image.disk_format,
                image.region,
                wrapper.html()
            ])
            .draw()
            .nodes()
            .to$();

            if (UI.selectedRowId && image.id === UI.selectedRowId) {
                row.addClass('selected');
            }
        });
    }

    function setLaunchEvent (launchCallback) {
        $('#images_table tbody tr td').on('click', 'button', function () {
            var rowElement = $(this).parent().parent();
            var data = dataTable.api().row(rowElement).data();
            var sizeSplit = data[7].split(" ");
            var sizeInGiB = Utils.convertToGiB(parseFloat(sizeSplit[0]), sizeSplit[1]);
            var image = {
                id: data[0],
                name: data[1],
                size: sizeInGiB,
                region: data[data.length - 2]
            };

            launchCallback(image);
        });
    }

    function setSelectImageEvents () {

        // Remove previous row click events
        $('#images_table tbody').off('click', '**');

        // Row events
        $('#images_table tbody').on('click', 'tr', function () {
            var data = dataTable.api().row(this).data();
            var id = data[0];
            var region = data[data.length - 2];
            UI.selectedRowId = id;

            dataTable.api().row('.selected')
                .nodes()
                .to$()
                .removeClass('selected');
            $(this).addClass('selected');
            selectImage(id, region);
        });
    }

    function initFixedHeader () {

        UI.fixedHeader = new $.fn.dataTable.FixedHeader(dataTable);

        $(window).resize(redrawFixedHeaders);

    }

    function redrawFixedHeaders () {
        UI.fixedHeader._fnUpdateClones(true); // force redraw
        UI.fixedHeader._fnUpdatePositions();
    }

    function initFileChooserEvents () {
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
    }

    function createFormRegionSelector () {

        var availableRegions = Region.getAvailableRegions();
        var currentRegions = Region.getCurrentRegions();
        var regionFormSelector = $('#id_region');

        availableRegions.forEach(function (region) {
            $('<option>')
                .val(region)
                .text(region)
                .appendTo(regionFormSelector);
        });

        if (currentRegions.length === 1) {
            $('option[value=' + currentRegions[0] + ']').attr('default', true);
        }
    }

    function joinArrays(a, b) {
        return a.filter(function(i) {
            return b.indexOf(i) >= 0;
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

        createRegionSelector(refreshCallback);
        createFormRegionSelector();
        initFileChooserEvents();
        createRegionsButton($('#images_table_paginate'));
        createModalButton($('#images_table_paginate'));
        createSearchField($('#images_table_paginate'));
        createRefreshButton($('#images_table_paginate'), refreshCallback);
        createProgressBar($('#images_table_paginate'));

        // Set modal create image button click
        $('#create-image').on('click', modalSubmitCallback);

        initFixedHeader();

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

        preferenceList.forEach(function (preference, index) {

            display = MashupPlatform.prefs.get(preference);

            if (!display) {
                hiddenColumns.push(index);
            }

            if (dataTable) {
                dataTable.api().column(index).visible(display, false);
            }

        });

        // Recalculate all columns size at once
        if (dataTable) {
            dataTable.api().columns.adjust();
        }

    }

    function drawImages (callbacks, autoRefresh, imageList) {

        // Save previous scroll and page
        var scroll = $(window).scrollTop();
        var page = dataTable.api().page();

        buildTableBody(imageList);
        setLaunchEvent(callbacks.launch);
        setSelectImageEvents();

        // Restore previous scroll and page
        $(window).scrollTop(scroll);
        dataTable.api().page(page).draw(false);

        // Adjust columns and headers
        dataTable.api().columns.adjust();
        redrawFixedHeaders();

        // if (autoRefresh) {
        //     setTimeout(function () {
        //         callbacks.getImageList(true);
        //     }, 4000);
        // }
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

    function clearTable () {
        dataTable.api().clear();
        dataTable.api().draw();
    }

    function toggleManyRegions (regions) {
        var otherregions = Region.getAvailableRegions();
        var joinregions = joinArrays(regions, otherregions);
        var i, region, input;

        // First set everything to false
        for(i=0;  i<otherregions.length; i++) {
            region = otherregions[i];
            input = $("input[value=" + region + "]");
            input.removeClass('selected');
            input.prop("checked", false);
        }

        // Then check only the received
        for (i=0; i<joinregions.length; i++) {
            region = joinregions[i];
            input = $("input[value=" + region + "]");
            input.toggleClass('selected');
            input.prop("checked", !input.prop("checked"));
        }
        Region.setCurrentRegions($("#region-selector"));
    }

    return {
        clearTable: clearTable,
        createTable: createTable,
        updateHiddenColumns: updateHiddenColumns,
        drawImages: drawImages,
        startLoadingAnimation: startLoadingAnimation,
        stopLoadingAnimation: stopLoadingAnimation,
        toggleManyRegions: toggleManyRegions,
        activateProgressBar: activateProgressBar,
        deactivateProgressBar: deactivateProgressBar
    };
})();
