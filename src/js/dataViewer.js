/*
 *     Copyright (c) 2014 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 */

/* global StyledElements */

var DataViewer = (function () {
 
    "use strict";

    var DataViewer = function() {

        /* Context */
        MashupPlatform.widget.context.registerCallback(function (newValues) {
            if (this.layout && ("heightInPixels" in newValues || "widthInPixels" in newValues)) {
                this.layout.repaint();
            }
        }.bind(this));

        this.layout = null;
        this.table = null;

        this.structure = [];
        this.data = [];
    };
 
    DataViewer.prototype.init = function init() {
        this.layout = new StyledElements.BorderLayout();
        this.layout.insertInto(document.body);
        createFilter.call(this);
        this.layout.repaint();
    };

    // structure: [ {"id":"pk", "field": "number", "type": "(number, boolean, string, date)", "sortable": "(true,false)", "width": "number", "contentBuilder": "", "dataparser": "", "unit": "", "sort_id": ""} , {"id":"name", ...} ...]
    // data: [ {"pk":"2", "name":"test", ...}, {"pk":"3", "name": "test2", ...}, ...]

    DataViewer.prototype.setModel = function (model) {
        /*  model = {
         *      "structure": [ {"id": "pk", "type": "number"}, ... ],
         *      "data": [ {"pk": "", ...}, ...]
         *  }
         */

        // Remove the previuos table
        this.layout.getCenterContainer().clear();

        // Set the data and the structure
        this.data = model.data;
        this.structure = model.structure;

        // Create the table
        var columns = [];
        for (var i = 0; i < this.structure.length; i++) {
            //Accepted types: number, boolean, string, date
            columns.push({ field: this.structure[i].id, label: this.structure[i].id, sortable: true, type: this.structure[i].type});
        }

        this.table = new StyledElements.ModelTable(columns, {id: this.structure[0].id, pageSize: 10});
        this.table.source.changeElements(this.data);
        this.layout.getCenterContainer().appendChild(this.table);

        // Repaint the layout
        this.layout.repaint();
    };

    DataViewer.prototype.addEventListener = function addEventListener(event, listener) {
        this.table.addEventListener(event, listener);
    };

/**************************************************************************/
/****************************** AUXILIAR **********************************/
/**************************************************************************/

    var createFilter = function createFilter() {
        var southLayoutOptions = {
            'class': 'input input-prepend input-append'
        };
        var southLayout = new StyledElements.HorizontalLayout(southLayoutOptions);

        this.layout.getSouthContainer().appendChild(southLayout);

        // Function to be call when the user clicks on "search" or types "enter"
        function filter() {
            /*jshint validthis:true */
            this.table.source.changeOptions({'keywords': textInput.getValue()});
        }

        var searchAddon = new StyledElements.Addon({'title': 'Search'});
        southLayout.getWestContainer().appendChild(searchAddon);

        // Set search icon
        var searchIcon = document.createElement('i');
        searchIcon.className = 'icon-search';
        searchAddon.appendChild(searchIcon);

        // Set input field
        var textInput = new StyledElements.StyledTextField({placeholder: 'Filter'});
        textInput.addEventListener('submit', filter.bind(this));
        southLayout.getCenterContainer().appendChild(textInput);
        searchAddon.assignInput(textInput);

        // Set search button
        var search_button = new StyledElements.StyledButton({
            text: 'Search'
        });
        search_button.addEventListener('click', filter.bind(this));
        southLayout.getEastContainer().appendChild(search_button);
    };

    return DataViewer;

})();
