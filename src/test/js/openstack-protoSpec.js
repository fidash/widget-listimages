describe('Test Image Table', function () {

	var openStack = null;
	var respObj;

	beforeEach(function() {


		jasmine.getFixtures().set('<table id="example" class="display" cellspacing="0" width="100%">' +
									'<thead>' +
										'<tr>' +
											'<th>Instance</th>' +
											'<th>Owner</th>' +
											'<th>Data</th>' +
										'</tr>' +
									'</thead>' +
								'</table>');

		openstack = new OpenStackProto();
		respObj = {
			"images": [
			{
				"OS-DCF:diskConfig": "AUTO", 
				"created": "2012-02-28T19:38:57Z", 
				"id": "3afe97b2-26dc-49c5-a2cc-a2fc8d80c001", 
				"links": [
				{
					"href": "https://dfw.servers.api.rackspacecloud.com/v2/010101/images/3afe97b2-26dc-49c5-a2cc-a2fc8d80c001", 
					"rel": "self"
				}, 
				{
					"href": "https://dfw.servers.api.rackspacecloud.com/010101/images/3afe97b2-26dc-49c5-a2cc-a2fc8d80c001", 
					"rel": "bookmark"
				}, 
				{
					"href": "https://dfw.servers.api.rackspacecloud.com/010101/images/3afe97b2-26dc-49c5-a2cc-a2fc8d80c001", 
					"rel": "alternate", 
					"type": "application/vnd.openstack.image"
				}
				], 
				"metadata": {
					"arch": "x86-64", 
					"auto_disk_config": "True", 
					"com.rackspace__1__build_core": "1", 
					"com.rackspace__1__build_managed": "1", 
					"com.rackspace__1__build_rackconnect": "1", 
					"com.rackspace__1__options": "0", 
					"com.rackspace__1__visible_core": "1", 
					"com.rackspace__1__visible_managed": "1", 
					"com.rackspace__1__visible_rackconnect": "1", 
					"image_type": "base", 
					"org.openstack__1__architecture": "x64", 
					"org.openstack__1__os_distro": "org.ubuntu", 
					"org.openstack__1__os_version": "11.10", 
					"os_distro": "ubuntu", 
					"os_type": "linux", 
					"os_version": "11.10", 
					"rax_managed": "false", 
					"rax_options": "0"
				}, 
				"minDisk": 10, 
				"minRam": 256, 
				"name": "Ubuntu 11.10 (Oneiric Oncelot)", 
				"progress": 100, 
				"status": "ACTIVE", 
				"updated": "2012-02-28T19:39:05Z"
			}
			]
		};

		jstack.getImageList.and.returnValue(respObj);
	});

	function callListImage() {

		var myTable = $('#example').DataTable();
		openstack.listImage(myTable);
		var callback = jstack.getImageList.calls.mostRecent().args[1];
		callback(respObj);
	}

	function checkRow(tdIndex, expectedText) {

		callListImage();
		var row = $('#example > tbody > tr > td');
		expect(row[tdIndex]).toContainText(expectedText);
	}


	it('should add Name', function() {

		checkRow(0, 'Ubuntu 11.10 (Oneiric Oncelot)');
	});

	it('should add Status', function() {

		checkRow(1, 'ACTIVE');
	});

	it('should add last updated value', function() {

		checkRow(2, '2012-02-28T19:39:05Z');
	});
});