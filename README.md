# Image-Vectorizer
Vectorize images (JPEG, PNG) with variable quality

Temp URL: http://env-3497474.fr-1.paas.massivegrid.net/polyserver/client/

## Client

Either enter a URL of an image, or pick an image from the local system to vectorize.

The result is a `base64` string, and an Image of the vectorized original image (use right+click and save as... to download locally)

>Note: Use clear before using the tool again!


## Server

To install run `npm install` on the `/server` folder

We recommend using the `forever` plugin to install as a service https://www.npmjs.com/package/forever
