# List Images Widget

[![Build Status](https://build.conwet.fi.upm.es/jenkins/view/FI-Dash/job/Widget%20ListImages/badge/icon)](https://build.conwet.fi.upm.es/jenkins/view/FI-Dash/job/Widget%20ListImages/)

This project is part of [FIWARE](https://www.fiware.org/). This widget is part of FI-Dash component included in FIWARE.

The widget displays a list of images availables to the user in FIWARE's Cloud in a table interface with searching and pagination capabilities. It also offers support multi-region and allows the creation of new images in any region in which the user is allowed to do so.


## Wiring endpoints

The List Images widget has the following wiring output endpoints:

|Label|Name|Friendcode|Type|Description|
|:--:|:--:|:--:|:--:|:--|
|Image ID|image_id|image_id|text|Sends the image ID and OpenStack access.|


## User preferences

List Images has the following preferences:

|Label|Name|Type|Default|Description|
|:--:|:--:|:--:|:--:|:--|
|Disk format|disk_format|boolean|false|Activate to display the disk format column|
|Container format|container_format|boolean|false|Activate to display the container format column|
|Size|size|boolean|false|Activate to display the size column|
|Updated|updated|boolean|false|Activate to display the updated column|
|Created|created|boolean|true|Activate to display the created column|
|Checksum|checksum|boolean|false|Activate to display the checksum column|
|Visibility|visibility|boolean|true|Activate to display the visibility column|
|Status|status|boolean|true|Activate to display the status column|
|Name|name|boolean|true|Activate to display the name column|
|ID|id|boolean|false|Activate to display the id column|
