# ba64
[![Build Status](https://travis-ci.org/HarryStevens/ba64.svg?branch=master)](https://travis-ci.org/HarryStevens/ba64) [![Coverage Status](https://coveralls.io/repos/github/HarryStevens/ba64/badge.svg?branch=master)](https://coveralls.io/github/HarryStevens/ba64?branch=master)

A tiny npm module for saving Base64 encoded images that are part of [data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) to your file system. This is useful for saving images that have been uploaded to the browser via [`FileReader.readAsDataUrl()`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL).

* [Installation](#installation)
* [Example](#example)
* [API](#api)

## <a name="installation" href="#installation">Installation</a>

```bash
npm i ba64 -S
```

## <a name="example" href="#example">Example</a>

```js
var ba64 = require("ba64"),
  data_url = "data:image/jpeg;base64,[Base64 encoded image goes here]";

// Save the image synchronously.
ba64.writeImageSync("myimage", data_url); // Saves myimage.jpeg.

// Or save the image asynchronously.
ba64.writeImage("myimage", data_url, function(err){
  if (err) throw err;

  console.log("Image saved successfully");

  // do stuff
});
```

## <a name="api" href="#api">API</a>

<a name="writeImage" href="#writeImage">#</a> ba64.**writeImage**(*path/to/file_name*, *data_url*, *callback*)

Asynchronously saves the Base64 encoded image to the file system. `file_name` should not include the file extension; ba64 will do that for you.

<a name="writeImageSync" href="#writeImageSync">#</a> ba64.**writeImageSync**(*path/to/file_name*, *data_url*)

Synchronously saves the Base64 encoded image to the file system. `file_name` should not include the file extension; ba64 will do that for you.

### Helper functions

<a name="getExt" href="#getExt">#</a> ba64.**getExt**(*data_url*)

Returns the file extension of the Base64 encoded image.

<a name="getBa64Img" href="#getBa64Img">#</a> ba64.**getBa64Img**(*data_url*)

Returns the Base64 encoded image without the `data:` scheme prefix.
