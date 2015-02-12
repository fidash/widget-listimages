var OpenStackProto = (function (JSTACK) {
    "use strict";

    var isAuthenticated = false;
    var dataViewer = null;
    var url = 'https://cloud.lab.fiware.org/keystone/v2.0/';
    var imageList;

    function authenticate () {
        // curl -s http://arcturus.ls.fi.upm.es:5000/v2.0/tokens -X 'POST' -d '{"auth":{"passwordCredentials":{"username":"braulio", "password":"braulio"}}}' -H "Content-Type: application/json" | python -m json.tool
        var tokenId, tenantId;
        var postBody, headersAuth;
        var options;
        var USERNAME, PASSWORD;
        var headersTenants = {};

        headersAuth = {
            "Accept": "application/json",
            "X-FI-WARE-OAuth-Token": "true",
            "X-FI-WARE-OAuth-Token-Body-Pattern": "%fiware_token%"
        };

        headersTenants['X-FI-WARE-OAuth-Token'] = 'true';
        headersTenants['X-FI-WARE-OAuth-Header-Name'] = 'X-Auth-Token';

        postBody = {
            "auth": {}
        };

        postBody.auth.token = {
            "id": "%fiware_token%"
        };


        // Initialize Keystone
        JSTACK.Keystone.init(url);

        // Get tenants with the user's FIWARE token
        MashupPlatform.http.makeRequest(url + 'tenants', {
            method: 'GET',
            requestHeaders: headersTenants,
            onSuccess: function (response) {

                response = JSON.parse(response.responseText);
                postBody.auth.tenantId = response.tenants[0].id;

                // Post request to receive service token from Openstack
                MashupPlatform.http.makeRequest(url + 'tokens', {
                    requestHeaders: headersAuth,
                    contentType: "application/json",
                    postBody: JSON.stringify(postBody),
                    onSuccess: function (response) {
                        response = JSON.parse(response.responseText);

                        // Mimic JSTACK.Keystone.authenticate behavior on success
                        JSTACK.Keystone.params.token = response.access.token.id;
                        JSTACK.Keystone.params.access = response.access;
                        JSTACK.Keystone.params.currentstate = 2;

                        handleServiceToken();
                    },
                    onFailure: function (response) {
                        console.log('Call failed with status: ' + response.status);
                    }
                });

            },
            onFailure: function (response) {
                console.log('Call failed with status: ' + response.status);
            }
        });
        
        
        //JSTACK.Keystone.authenticate(USERNAME, PASSWORD, tokenId, tenantId, handleTempToken, onError);
    }

    function handleServiceToken () {

        isAuthenticated = true;
        doWork();
    }

    function getImageList (table) {
        
        dataViewer = table;
        doWork();
    }

    function doWork() {

        if (isReady()) {

            JSTACK.Nova.getimagelist(true, callbackImageList.bind(null, dataViewer), onError, null);
        }
    }

    function isReady() {

        return (isAuthenticated === true && dataViewer);    
    }

    function rowClickCallback(row) {
        var data = {
            'id': row.id,
            'access': JSTACK.Keystone.params.access
        };
        MashupPlatform.wiring.pushEvent('image_id', JSON.stringify(data));
    }

    function callbackImageList (table, result) {
        
        var structure = [{'id': 'id'}, {'id': 'name'}, {'id': 'status'}, {'id': 'updated'} ];
        var data = [];
        var dataset = {'structure': structure, 'data': data};
        var refresh;

        // Gather data from GET response
        for (var imageKey in result.images) {
            var image = result.images[imageKey];
            data.push({'id': image.id, 'name': image.name, 'status': image.status, 'updated': image.updated_at});
        }

        // Create table with the given dataset
        table.setModel(dataset);

        // Set rows events
        table.addEventListener('click', rowClickCallback);

        // Set refresh button
        refresh = new StyledElements.StyledButton({
            text: 'Refresh'
        });
        refresh.addEventListener('click', doWork);
        var south_container = document.querySelector("div.container.south_container.statusrow");
        refresh.insertInto(south_container);
        table.layout.repaint();
    }

    function onError (error) {
        console.log('Error: ' + JSON.tableringify(error));
    }

    function OpenStackProto () {

        this.init = authenticate;
        this.listImage = getImageList;
    }

    return OpenStackProto;
})(JSTACK);
