var OpenStackProto = (function (jstack) {
	"use strict";

	var myTable = null;

	function getImageList (table) {
		
		myTable = table;
		jstack.getImageList(true, callbackImageList, onError, null);
	}

	function callbackImageList (result) {

		for (var imageKey in result.images) {
			var image = result.images[imageKey];
			myTable.row.add([image.name, image.status, image.updated]).draw();
		}

	}

	function onError (error) {
		console.log('Error: ' + error);
	}

	function OpenStackProto () {

		this.listImage = getImageList;
	}

	return OpenStackProto;
})(jstack);