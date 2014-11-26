$(document).ready(function() {
	var openStackProto = new OpenStackProto();
    var myTable = $('#example').DataTable();

    var refresh = $('<button>');
    refresh.text('Refresh');
    refresh.css({
    	float: 'left',
    	'margin-left': '10px'
    });
    refresh.click(function () {
    	openStackProto.listImage(myTable);
    });
    var filter = $("#example_filter");
    refresh.insertBefore(filter);

    openStackProto.init();
    openStackProto.listImage(myTable);
});