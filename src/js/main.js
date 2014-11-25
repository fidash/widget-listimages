$(document).ready(function() {
	var openStackProto = new OpenStackProto();
    var myTable = $('#example').DataTable();

    openStackProto.init();
    openStackProto.listImage(myTable);
});