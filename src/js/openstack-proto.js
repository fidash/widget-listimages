var OpenStackProto = (function (JSTACK) {
	"use strict";

	var isAuthenticated = false;
	var myTable = null;


	function authenticate () {
		// curl -s http://arcturus.ls.fi.upm.es:5000/v2.0/tokens -X 'POST' -d '{"auth":{"passwordCredentials":{"username":"braulio", "password":"braulio"}}}' -H "Content-Type: application/json" | python -m json.tool
		var tokenId, tenantId;
		var USERNAME = 'braulio';
		var PASSWORD = 'braulio';
		JSTACK.Keystone.init("http://arcturus.ls.fi.upm.es:5000/v2.0/");
		JSTACK.Keystone.authenticate(USERNAME, PASSWORD, tokenId, tenantId, handleTempToken, onError);
	}



// RESULT
// {
//     "access": {
//         "metadata": {
//             "is_admin": 0, 
//             "roles": []
//         }, 
//         "serviceCatalog": [], 
//         "token": {
//             "audit_ids": [
//                 "C8W4Eg4tQA2cYihJUXT3Dw"
//             ], 
//             "expires": "2014-11-25T12:32:17Z", 
//             "id": "PKIZ_eJxtVEuzojwQ3fMrZm_dEtCLl2V4xSiJIhIeOwHlDd5BDPjrJ3K_r2YzVKVIdzrdp0-fyscH_zQTIvJLx-7b-BAwQsYuC3f7LkL5MyHASfSO-6yXroMR68AxR-MMbC2rs7zKtMjBJshMlmWWqGXVt5BXBVSZqGkMZtxZawhpYdAXoU_KKCAvVHbZddqJsfyo4wIpaNsXF-5PfVoFsiUK7wBUIobPzgOfzQcuqcf_Cn4hBZ-TARvemhiZhAqWoYauE1hPUYCLQwEKXIJRILo4YlecCHVGXHYvvkYidYWtg-LiO3NgAsc8lGkXy2MVBWg-CwNaXYLTTbj4pxmmP-2Mg5WIJz8RU8vScEOii5_vKc09LJ5WqJbU98VEplPa1GXkkTyFVi_EcsKraHHgcogtfb0rcHvzs98NoS_Vc5vNbuJV-4v_NSNIGrXnHN2EGNbDZYX_Jmnq6oeXqCFGJUZlssJnMBLDkXFpfkalVoUl_iSyVRygxwRcVmwmqN09Y0h_2pHEHun_rn6bi0g1h1-FwSkX_hvTPZHUPILSfR6VAd4JJk5anUzcth7pLZBUHCItP3N9hOZbHywwtEDATs90JzSo40CT7aj3Mg8YMAgkj0cxi_qfnAtnNEqAtYxQDSRYo3TgZIrYWTPBAPPlvQEojVtSp4YZYi2cEwDGjukqXdl8_rwdFkNvCGX1wZWoYdBD3deh4AKrBszRwRmQtzT_VyaHaAHgcqjaduyX8faWmCm8nIfXXemGnQ5VpV945Ch4iPRfg3v8PMpglanxfdfu26dUgoPkAmUYA_JtXsJNhKk-3i-uF4vt3v5tXMut0qrmMRSy-hgs7Ih0i3Dlmknj3UVGkivEwL7tbSIewwGn6xaej3izpvXCd92DdnBJkGKnHbOVUDnJzTisT2NXbm9qni8qex83YZ-mVsfQwVlev8CLSoWRgNHaTKTw_WvuKctn_iT35ToVlqMp0-Wjuy42uQMVZ-it31wNC3u8KWnpnC1gdNtUsW20ybbpULqn6bl4gS-r0Rfrgd6EoT0ZgbrVfOVaWbUXY_nU2P2ztoel0m1bcmKMxKZfhNN3xY5j0ql2nVVQEubnxCTG36flD8Znc1c=", 
//             "issued_at": "2014-11-25T11:32:17.058485"
//         }, 
//         "user": {
//             "id": "6f494f77101446219f0db397ab8e0290", 
//             "name": "braulio", 
//             "roles": [], 
//             "roles_links": [], 
//             "username": "braulio"
//         }
//     }
// }
	function handleTempToken (result) {
		// curl -s http://arcturus.ls.fi.upm.es:5000/v2.0/tenants -X 'GET' -H "X-Auth-Token: $token" "Content-Type: application/json" | python -m json.tool
		var isAdmin = false;
		var tokenId = result.access.token.id;
		JSTACK.Keystone.gettenants(handleTenants.bind(null, tokenId), isAdmin, onError);
	}

// RESULT
// {
//     "tenants": [
//         {
//             "description": null, 
//             "enabled": true, 
//             "id": "efdee1fee7b849af9c51967770cd21fb", 
//             "name": "demo"
//         }
//     ], 
//     "tenants_links": []
// }
	function handleTenants (tokenId, result) {
		// curl -s http://arcturus.ls.fi.upm.es:5000/v2.0/tenants -X 'GET' -H "X-Auth-Token: $token" "Content-Type: application/json" | python -m json.tool
		var tenantId = result.tenants[0].id;
		var username, password;

		JSTACK.Keystone.authenticate(username,password, tokenId, tenantId, handleServiceToken, onError);
	}


	function handleServiceToken (result) {

		isAuthenticated = true;
		console.log("Authenticated");
		doWork();
	}

	function getimagelist (table) {
		
		myTable = table;
		console.log("Setting table");
		doWork();
	}

	function doWork() {

		if (isReady()) {

			JSTACK.Nova.getimagelist(true, callbackImageList.bind(null, myTable), onError, null);
		}
	}

	function isReady() {

		return (isAuthenticated === true && myTable);	
	}

	function callbackImageList (table, result) {
		table.clear().draw();
		for (var imageKey in result.images) {

			var image = result.images[imageKey];

			var nameCell = $("<td>" + image.name + "</td>");
			var statusCell = $("<td>" + image.status + "</td>");
			var updatedCell = $("<td>" + image.updated + "</td>");
			var row = $("<tr title='" + "ID: " + image.id + "'>").append(nameCell, statusCell, updatedCell);

			table.row.add(row);
		}
		table.draw();

	}

	function onError (error) {
		console.log('Error: ' + JSON.stringify(error));
	}

	function OpenStackProto () {

		this.init = authenticate;
		this.listImage = getimagelist;
	}

	return OpenStackProto;
})(JSTACK);
