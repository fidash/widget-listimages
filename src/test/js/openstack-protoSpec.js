describe('Test Image Table', function () {
	"use strict";
	var openStack = null;
	var respObj, respAuthenticate, respTenants, respServices;

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

		openStack = new OpenStackProto();
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

		respAuthenticate = {
		    "access": {
		        "metadata": {
		            "is_admin": 0, 
		            "roles": []
		        }, 
		        "serviceCatalog": [], 
		        "token": {
		            "audit_ids": [
		                "C8W4Eg4tQA2cYihJUXT3Dw"
		            ], 
		            "expires": "2014-11-25T12:32:17Z", 
		            "id": "PKIZ_eJxtVEuzojwQ3fMrZm_dEtCLl2V4xSiJIhIeOwHlDd5BDPjrJ3K_r2YzVKVIdzrdp0-fyscH_zQTIvJLx-7b-BAwQsYuC3f7LkL5MyHASfSO-6yXroMR68AxR-MMbC2rs7zKtMjBJshMlmWWqGXVt5BXBVSZqGkMZtxZawhpYdAXoU_KKCAvVHbZddqJsfyo4wIpaNsXF-5PfVoFsiUK7wBUIobPzgOfzQcuqcf_Cn4hBZ-TARvemhiZhAqWoYauE1hPUYCLQwEKXIJRILo4YlecCHVGXHYvvkYidYWtg-LiO3NgAsc8lGkXy2MVBWg-CwNaXYLTTbj4pxmmP-2Mg5WIJz8RU8vScEOii5_vKc09LJ5WqJbU98VEplPa1GXkkTyFVi_EcsKraHHgcogtfb0rcHvzs98NoS_Vc5vNbuJV-4v_NSNIGrXnHN2EGNbDZYX_Jmnq6oeXqCFGJUZlssJnMBLDkXFpfkalVoUl_iSyVRygxwRcVmwmqN09Y0h_2pHEHun_rn6bi0g1h1-FwSkX_hvTPZHUPILSfR6VAd4JJk5anUzcth7pLZBUHCItP3N9hOZbHywwtEDATs90JzSo40CT7aj3Mg8YMAgkj0cxi_qfnAtnNEqAtYxQDSRYo3TgZIrYWTPBAPPlvQEojVtSp4YZYi2cEwDGjukqXdl8_rwdFkNvCGX1wZWoYdBD3deh4AKrBszRwRmQtzT_VyaHaAHgcqjaduyX8faWmCm8nIfXXemGnQ5VpV945Ch4iPRfg3v8PMpglanxfdfu26dUgoPkAmUYA_JtXsJNhKk-3i-uF4vt3v5tXMut0qrmMRSy-hgs7Ih0i3Dlmknj3UVGkivEwL7tbSIewwGn6xaej3izpvXCd92DdnBJkGKnHbOVUDnJzTisT2NXbm9qni8qex83YZ-mVsfQwVlev8CLSoWRgNHaTKTw_WvuKctn_iT35ToVlqMp0-Wjuy42uQMVZ-it31wNC3u8KWnpnC1gdNtUsW20ybbpULqn6bl4gS-r0Rfrgd6EoT0ZgbrVfOVaWbUXY_nU2P2ztoel0m1bcmKMxKZfhNN3xY5j0ql2nVVQEubnxCTG36flD8Znc1c=", 
		            "issued_at": "2014-11-25T11:32:17.058485"
		        }, 
		        "user": {
		            "id": "6f494f77101446219f0db397ab8e0290", 
		            "name": "braulio", 
		            "roles": [], 
		            "roles_links": [], 
		            "username": "braulio"
		        }
		    }
		};

		respTenants = {
		    "tenants": [
		        {
		            "description": null, 
		            "enabled": true, 
		            "id": "efdee1fee7b849af9c51967770cd21fb", 
		            "name": "demo"
		        }
		    ], 
		    "tenants_links": []
		};

		respServices = {
		    "access": {
		        "metadata": {
		            "is_admin": 0, 
		            "roles": [
		                "9fe2ff9ee4384b1894a90878d3e92bab"
		            ]
		        }, 
		        "serviceCatalog": [
		            {
		                "endpoints": [
		                    {
		                        "adminURL": "http://192.168.11.10:8774/v2/efdee1fee7b849af9c51967770cd21fb", 
		                        "id": "33cf6374bf004edfae1a74923965e46c", 
		                        "internalURL": "http://192.168.11.10:8774/v2/efdee1fee7b849af9c51967770cd21fb", 
		                        "publicURL": "http://192.168.11.10:8774/v2/efdee1fee7b849af9c51967770cd21fb", 
		                        "region": "RegionOne"
		                    }
		                ], 
		                "endpoints_links": [], 
		                "name": "nova", 
		                "type": "compute"
		            }, 
		            {
		                "endpoints": [
		                    {
		                        "adminURL": "http://192.168.11.10:8776/v2/efdee1fee7b849af9c51967770cd21fb", 
		                        "id": "82248d5ef35a4eda9eb87d7d76b20f52", 
		                        "internalURL": "http://192.168.11.10:8776/v2/efdee1fee7b849af9c51967770cd21fb", 
		                        "publicURL": "http://192.168.11.10:8776/v2/efdee1fee7b849af9c51967770cd21fb", 
		                        "region": "RegionOne"
		                    }
		                ], 
		                "endpoints_links": [], 
		                "name": "cinderv2", 
		                "type": "volumev2"
		            }, 
		            {
		                "endpoints": [
		                    {
		                        "adminURL": "http://192.168.11.10:8774/v3", 
		                        "id": "5f4060b0e7824bb48855384af6a87291", 
		                        "internalURL": "http://192.168.11.10:8774/v3", 
		                        "publicURL": "http://192.168.11.10:8774/v3", 
		                        "region": "RegionOne"
		                    }
		                ], 
		                "endpoints_links": [], 
		                "name": "novav3", 
		                "type": "computev3"
		            }, 
		            {
		                "endpoints": [
		                    {
		                        "adminURL": "http://192.168.11.10:3333", 
		                        "id": "c3acc6cc86104b88b9c102f1c352d020", 
		                        "internalURL": "http://192.168.11.10:3333", 
		                        "publicURL": "http://192.168.11.10:3333", 
		                        "region": "RegionOne"
		                    }
		                ], 
		                "endpoints_links": [], 
		                "name": "s3", 
		                "type": "s3"
		            }, 
		            {
		                "endpoints": [
		                    {
		                        "adminURL": "http://192.168.11.10:9292", 
		                        "id": "2f5120f9a87c479999a8c1a5558bc78e", 
		                        "internalURL": "http://192.168.11.10:9292", 
		                        "publicURL": "http://192.168.11.10:9292", 
		                        "region": "RegionOne"
		                    }
		                ], 
		                "endpoints_links": [], 
		                "name": "glance", 
		                "type": "image"
		            }, 
		            {
		                "endpoints": [
		                    {
		                        "adminURL": "http://192.168.11.10:8000/v1", 
		                        "id": "3196d31dc15e4f9990ceb28c01a73c36", 
		                        "internalURL": "http://192.168.11.10:8000/v1", 
		                        "publicURL": "http://192.168.11.10:8000/v1", 
		                        "region": "RegionOne"
		                    }
		                ], 
		                "endpoints_links": [], 
		                "name": "heat-cfn", 
		                "type": "cloudformation"
		            }, 
		            {
		                "endpoints": [
		                    {
		                        "adminURL": "http://192.168.11.10:8776/v1/efdee1fee7b849af9c51967770cd21fb", 
		                        "id": "9b948ac7cca143eea4d1789f8cf2e40c", 
		                        "internalURL": "http://192.168.11.10:8776/v1/efdee1fee7b849af9c51967770cd21fb", 
		                        "publicURL": "http://192.168.11.10:8776/v1/efdee1fee7b849af9c51967770cd21fb", 
		                        "region": "RegionOne"
		                    }
		                ], 
		                "endpoints_links": [], 
		                "name": "cinder", 
		                "type": "volume"
		            }, 
		            {
		                "endpoints": [
		                    {
		                        "adminURL": "http://192.168.11.10:8773/services/Admin", 
		                        "id": "7cc6e88122614803b1530498ff473d53", 
		                        "internalURL": "http://192.168.11.10:8773/services/Cloud", 
		                        "publicURL": "http://192.168.11.10:8773/services/Cloud", 
		                        "region": "RegionOne"
		                    }
		                ], 
		                "endpoints_links": [], 
		                "name": "ec2", 
		                "type": "ec2"
		            }, 
		            {
		                "endpoints": [
		                    {
		                        "adminURL": "http://192.168.11.10:8004/v1/efdee1fee7b849af9c51967770cd21fb", 
		                        "id": "002b43ba8d82436bb817c4e015f367aa", 
		                        "internalURL": "http://192.168.11.10:8004/v1/efdee1fee7b849af9c51967770cd21fb", 
		                        "publicURL": "http://192.168.11.10:8004/v1/efdee1fee7b849af9c51967770cd21fb", 
		                        "region": "RegionOne"
		                    }
		                ], 
		                "endpoints_links": [], 
		                "name": "heat", 
		                "type": "orchestration"
		            }, 
		            {
		                "endpoints": [
		                    {
		                        "adminURL": "http://192.168.11.10:35357/v2.0", 
		                        "id": "2695a0084516475991964b98c3c11eaf", 
		                        "internalURL": "http://192.168.11.10:5000/v2.0", 
		                        "publicURL": "http://192.168.11.10:5000/v2.0", 
		                        "region": "RegionOne"
		                    }
		                ], 
		                "endpoints_links": [], 
		                "name": "keystone", 
		                "type": "identity"
		            }
		        ], 
		        "token": {
		            "audit_ids": [
		                "VNJgiHZ2QoSon9zm-VsmxQ", 
		                "C8W4Eg4tQA2cYihJUXT3Dw"
		            ], 
		            "expires": "2014-11-25T12:32:17Z", 
		            "id": "PKIZ_eJylWEl3o7gW3utXvH2dPs3kVLPoBZjBuCwobCZpZyBhErZTHhh-_btgO-VUJZWhk-MTR4B0db_hXvHXX_Cj6qZl_2-KV8M_fyFsWW7qkvm3LbXyU2IrbjLdwhgtp1O4c6q4eqt5ykLNWJZXmUpdrCuZ3mTZV03NqkeUV4UpN5yqNmaWZXecalnOfrYvSGiXNLJ7q9xm992ci4UDiwvrzoJraxhPw6CKBINDww1WaTXYcw_Y0w-4DHz4e4d7_87WlKPjEQn3mWgVTWbVgZSYrKMRLpxCKXCptMieci1ecZ0duC0utz18WpvfFoupUqxDd7wxMducCME2FtqKRtZ4LTWDIwkn5wggRLhgl0nNmtRkpzFUc8LHZrO3pnMW10YRm0E13JvO5jxdDdGw8X8EYdXUDBgOKaNeWjiaOyEhmZDebyF80e6ThghuB9eL8zYmeRz6Y2Tw3AHF3VweQiJRUK2j5cM6XI6JC7t56FW7zdrP15gZJ1-Qj060OywC2sdRvhwnq7CEgn5p0H7J-b7eEZ7t1vouCA23X86SIoq4YQs9jebCOrSZC1knYXuiHWzROHyF6I-IztTTGpKRPA0aVRyyYxDM8YhQnXPpTLlbdP_AlqwjBlQWpd7Cp3HKTER2757S0jrRkFY09FtaB8wWLMnWWE5LVtqePoH0Qi7UkmoWXD-jkNTBZh3KxzMP2JxRAbJfyUe6soawd_FmyZIhYUaw8qYQ3XS-TWfLxin-OWGv6iACwZlKLcIrqcXaVoJscwuRdAvhY6igK55WiXsiEAHDRKQmDdaWjJo0p56RwzYnuMSwFdieRssRgY3Kk7rdIcL_OcS3IkR_DHHDp0PCaDipElMe8tJHQruL68OZKzy3R7Aydx-p7AyZfYojlU9Nf8w0UPgASR2iO8Yiza0N8ALUeDvhiEIoDvJdHoAPgV81I03XsyWXaNvTotcnuJBau8yAAzp8lDtHA1gLWcCFzBCtIVmeUQMHRFJmnBMatRNiHvIgwHZEbNoVLo2aFCO8HQ3TXSxI4yI-cAENZPCECTsLhR1Bph2Evv8AE8mnmHj1CkDB6mwtr-wwqHEf5DbonniMwXZEqqWV3VNwHrW2vQuFZwF4AyuvEaK3QnwrQvRSiA8Bd3GiZRMLkJeZ_QCrHtfi4IVqHA2OtFlOEoAbDftIa3mfhjyDlX7FvwRoq8EPcDEYjzp6wK0FoM94wNkC8LgYuur6s7JGr4imv_DiotSghhohYNNqqJdIuFwWpHQlR_N5BEUDfA6E7GUiLqv2VqrvUSp6tuo71Per-NBZfYGAu3HPUG34y8XJKa0NGH85-9fko_dnH_fw-8xQz0z8D4Z6zcEw8_OsgyqG8m7XduloBNBZgrnmBcgcvs9rHOLe9uYV1qwGfTTrTwteEo7enfHNNcqfxTWBnKAHEAaU9xvhnAUDYzk1-V3M3ldYwPer7rydS1KL8aHV2cIm3-PavxjJhANxAdzt6J_oTQP1LBg7o0PHSKyOln47mIwT6hKyBczZfTVxPJY7Jm6J5_O2lxekT6QLrE0azvdQ3l90bPTyinN5NI1b9vEyTDL5cWHhiEA6Yw26GMcuDo3NZcUbOqd7aKRKunqdzuiDZgJFVwEz0Z8ojf6LmQxQolszgdkbkHX73EwwREIr3BsV6XWeesva8aoJVCywfktCpFcg80lPeix8gtYSelr142ayj8WgguIqd4AAN-biF66vzSBPp3xJa6l4jfLovZy_MV1hiPjaqaB3t7ivaAS9JpL3NhmgRpl9sMm4impCyopDjmmUtmCXxNM5LASMeMsKQ_FwQiJBteio5zake11U6M0-6I0I0fMQ36_CiwgFBMcYfsD95bJuvYr_FX70Afz7hWizZEN3cH7qF9xZxegzPngLMXotgbiTn04qSSdrsSnzAN8tjCK05gKiXiZhDzq1UuccTelJqfO4VzjHy2tauiIWXB5_FsaXo3iOFHoHVGzoV35BaRwbEEL_pSo9dShgKtytRD-iUPRZ-K55Q88TpzT29G3-39If_SJR8P15YWt2Qby8gkacw9BswwTtUAKpp7R2SHq7THNyKXvoT3Xvd2h_jxC9bSJ_Vih6AfdTUttbGtlcUv_Jrc_1Er3W_723XiLo_4D7vjgeKkvltz7wrZqJ3uEF_KV6PS1wPS_hkkyQHeoAXcbByUWwtYSHwjmwjgPHlQbAsGcwYOOL56Vha-j1XsC_9AIwPn0dCfSKAnegCThDMu7-t67lwO4BoXg4a0JBRuODEej98pZq_H4DGdnM8zSEKn02lQ5MmL3Ig2ti7JqAGy1rIBMkUOdsjXTYYzU2lwXuK5GElgSU7hxPuZ6Z5P351dboAz9DZfKBhnwBany49g43hgJQGzwk9ITGI_10fqDREkzE4Mjq6YXbw_lEPx60mzM_fi5mlaym3hy0UDIQhds70NJjL5vYJohIy0THdHsKnCC1UViMlx8irs0y08CWpWaupSqemmAjadG0V-ZqZgeqQjyFBR52pUZTiBa4rqUpQRBvbJZquoOVxlR4X1ebxgjCCZit22qlgtH54S1Wg-CYCAGHl1ljZOMEmqbIYiomRxrlOZyt9nQ1KWOBG15SNtOGzIlFLaSEvqYqlooVzpyuHs2VFYuaq6uK6ysqhKvM7s1oJevfue0mX7jyMUrEU_RtrgRfj0Yu5Kj-kqbfIO6DWnSS4ct_s3u_3DgHS3rsmBY_-qSp8sYl66At0rQkLN_m8ndS7aK4WhVYRrx_On378s1LavxF5DK7maqcUmsyU6VtY5Jo4067r8xqgs3cWome0JBaYm6Q7vP7WXvIarR3Al-FFj_ss8SeVD-sTntIp_fCj7u_-UeaNcfZ8atuZdY8V2d2R5N6xkJCFsH2nnXbxK_RffuDS7_31pfpQ_W1drbqjy8TWY1KT7w7ho8gH2V-OrLUWRT-JJd36_vHY3WkibgMv8QHc3NEp_zR53dSTI9RyQLTfTilD4-KuFEn0W6qq-k9y4wZfoycIBW__RMfV8slE43tv2h8q6zb2s83zP8H8gCC7g==", 
		            "issued_at": "2014-11-25T11:35:40.968387", 
		            "tenant": {
		                "description": null, 
		                "enabled": true, 
		                "id": "efdee1fee7b849af9c51967770cd21fb", 
		                "name": "demo"
		            }
		        }, 
		        "user": {
		            "id": "6f494f77101446219f0db397ab8e0290", 
		            "name": "braulio", 
		            "roles": [
		                {
		                    "name": "_member_"
		                }
		            ], 
		            "roles_links": [], 
		            "username": "braulio"
		        }
		    }
		};
	});

	function callListImage() {

		var myTable = $('#example').DataTable();
		openStack.init();

		var handleTempTokenCallback = JSTACK.Keystone.authenticate.calls.mostRecent().args[4];
		handleTempTokenCallback(respAuthenticate);

		var gettenantsCallback = JSTACK.Keystone.gettenants.calls.mostRecent().args[0];
		gettenantsCallback(respTenants);

		var handleServiceTokenCallback = JSTACK.Keystone.authenticate.calls.mostRecent().args[4];
		handleServiceTokenCallback(respServices);

		openStack.listImage(myTable);
		var callback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];
		callback(respObj);
	}

	function checkRow(tdIndex, expectedText) {

		callListImage();
		var row = $('#example > tbody > tr > td');
		expect(row[tdIndex]).toContainText(expectedText);
	}

	it('should initialize Keystone with URL', function() {

		var url = "http://arcturus.ls.fi.upm.es:5000/v2.0/";

		openStack.init();

		expect(JSTACK.Keystone.init).toHaveBeenCalledWith(url);

	});


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
