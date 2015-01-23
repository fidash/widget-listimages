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
    openStackProto.init();
    openStackProto.listImage(myTable);
});