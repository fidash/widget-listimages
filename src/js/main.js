/* global OpenStackProto DataViewer */

$(document).ready(function() {
    "use strict";

	var openStackProto = new OpenStackProto();
    var myTable = new DataViewer();

    myTable.init();
    openStackProto.init();
    openStackProto.listImage(myTable);
});