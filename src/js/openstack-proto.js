var OpenStackProto = (function (Nova) {
	"use strict";


	function getimagelist (table) {
		
		Nova.getimagelist(true, callbackImageList.bind(null, table), onError, null);
	}

	function callbackImageList (table, result) {

		for (var imageKey in result.images) {

			var image = result.images[imageKey];
			table.row.add([image.name, image.status, image.updated]).draw();
		}

	}

	function onError (error) {
		console.log('Error: ' + error);
	}

	function OpenStackProto () {

		this.listImage = getimagelist;
	}

	return OpenStackProto;
})(JSTACK.Nova);