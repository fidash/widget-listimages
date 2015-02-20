/* global OpenStackProto DataViewer */

$(document).ready(function() {
    "use strict";

	var openStackProto = new OpenStackProto();

    openStackProto.init();
    openStackProto.listImage();
});