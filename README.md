# List Images Widget

This project is part of [FIWARE](https://www.fiware.org/). This widget is part of FI-Dash component included in FIWARE.

The widget displays a list of images availables to the user in FIWARE's Cloud in a table interface with searching and pagination capabilities. It also offers support multi-region and allows the creation of new images in any region in which the user is allowed to do so.


## Wiring endpoints

The List Images widget has the following wiring endpoints:

|Way|Name|Type|Description|Label|Friendcode|
|:--:|:--:|:--:|:--:|:--:|:--:|
|output|image_id|text|Sends the image ID and OpenStack access.|Image ID|image_id|


## User preferences

List Images has the following preferences:

|Name|Type|Description|Label|Default|
|:--:|:--:|:--:|:--:|:--:|
|disk_format|boolean|Activate to display the disk format column|Disk format|false|
|container_format|boolean|Activate to display the container format column|Container format|false|
|size|boolean|Activate to display the size column|Size|false|
|updated|boolean|Activate to display the updated column|Updated|false|
|created|boolean|Activate to display the created column|Created|true|
|checksum|boolean|Activate to display the checksum column|Checksum|false|
|visibility|boolean|Activate to display the visibility column|Visibility|true|
|status|boolean|Activate to display the status column|Status|true|
|name|boolean|Activate to display the name column|Name|true|
|id|boolean|Activate to display the id column|ID|false|
