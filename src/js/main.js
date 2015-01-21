/* global OpenStackProto */

$(document).ready(function() {
    "use strict";

	var openStackProto = new OpenStackProto();
    var myTable = new DataViewer();
    /*var refresh = $('<button>');
    var filter = $("#example_filter");


    refresh.text('Refresh');
    refresh.css({
    	float: 'left',
    	'margin-left': '10px'
    });
    refresh.click(function () {
    	openStackProto.listImage(myTable);
    });
    refresh.insertBefore(filter);*/

    myTable.init();
    var structure = [ {'id': 'name'}, {'id': 'status'}, {'id': 'updated'} ];
    var data = [{'name': 'name1', 'status': 'OK', 'updated': 'NOW'},
                {'name': 'name2', 'status': 'NOT_OK', 'updated': 'NOT_NOW'},
                {'name': 'name3', 'status': 'FAIL', 'updated': 'NEVER'}];
    var model = {'structure': structure, 'data': data};
    myTable.setModel(model);
    //openStackProto.init();
    //openStackProto.listImage(myTable);
});