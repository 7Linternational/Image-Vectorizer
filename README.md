# Image-Vectorizer
Vectorize images (JPEG, PNG) with variable quality

URL: http://services.7linternational.com/ImageVectorizer

## Client

Either enter a URL of an image, or pick an image from the local system to vectorize.

The result is an `SVG` string, and an Image of the vectorized original image (use right+click and save as... to download locally)

>SVG sample usage: Copy the export and save it as a file `vector.svg` then import it to html like this `<img src='vector.svg'/>`

>Note: Use clear before using the tool again!


## Server

To install run `npm install` on the `/server` folder

We recommend using the `forever` plugin to install as a service https://www.npmjs.com/package/forever
