"use strict";

var pngparse= require('pngparse');
var context= typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d'): null;
var toImageData= function(fakeImageData,frame){
    var width= fakeImageData.width;
    var height= fakeImageData.height;

    var imagedata= null;
    if(context){
        imagedata= context.createImageData(width,height);
    }
    else{
        imagedata= {width:width, height:height};
        imagedata.data= new Uint8Array(width*height*4);
    }
    
    // Convert (1:gray/2:gray+alpha/3:rgb) -> 4bit:rgba
    // See: https://github.com/darkskyapp/pngparse#usage
    var i= 0;
    var channel= fakeImageData.channels
    switch(channel){
        case 3:
            var j= 0;
            var rgb= fakeImageData.data;
            while(rgb[j]){
                imagedata.data[i+0]= rgb[j+0];
                imagedata.data[i+1]= rgb[j+1];
                imagedata.data[i+2]= rgb[j+2];
                imagedata.data[i+3]= 255;
                i+= 4;
                j+= channel;
            }
            break;
        case 2:
            var j= 0;
            var grayA= fakeImageData.data;
            while(grayA[i]){
                imagedata.data[i+0]= grayA[j+0];
                imagedata.data[i+1]= grayA[j+0];
                imagedata.data[i+2]= grayA[j+0];
                imagedata.data[i+3]= grayA[j+1];
                i+= 4;
                j+= channel;
            }
            break;
        case 1:
            var j= 0;
            var gray= fakeImageData.data;
            while(gray[i]){
                imagedata.data[i+0]= gray[j+0];
                imagedata.data[i+1]= gray[j+0];
                imagedata.data[i+2]= gray[j+0];
                imagedata.data[i+3]= 255;
                i+= 4;
                j+= channel;
            }
            break;

        case 4:
        default:
            if(imagedata.data.set){
                imagedata.data.set(fakeImageData.data);
            }
            else{
                var rgba= fakeImageData.data;
                while(rgba[i]){
                    imagedata.data[i+0]= rgba[i+0];
                    imagedata.data[i+1]= rgba[i+1];
                    imagedata.data[i+2]= rgba[i+2];
                    imagedata.data[i+3]= rgba[i+3];
                    i+= 4;
                }
            }
            break;
    }

    if(frame){
        delete frame.dataParts
        for(var key in frame){
            if(imagedata[key]==null){
                imagedata[key]= frame[key];
            }
        }
    }

    return imagedata;
}
var BlobBuffer= function(){
    var cache= '';

    var buffers= [];
    for(var i=0; i<arguments.length; i++){
        var arg= arguments[i];

        if(arg instanceof Array){
            for(var j=0; j<arg.length; j++){
                buffers.push(new Buffer(arg[j]));
            }
        }
        else{
            buffers.push(new Buffer(arg));
        }
    }

    return Buffer.concat(buffers);
}

var Promise = require('bluebird');
// var Promise = Promise || require('es6-promise').Promise;
var Animation = require('./animation');
var crc32 = require('./crc32');

// "\x89PNG\x0d\x0a\x1a\x0a"
var PNG_SIGNATURE_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * @param {ArrayBuffer} buffer
 * @return {Promise}
 */
module.exports = function (buffer) {
    var images= [];

    var bytes = new Uint8Array(buffer);
    return new Promise(function (result, reject) {
        // var t0 = performance.now();
        for (var i = 0; i < PNG_SIGNATURE_BYTES.length; i++) {
            if (PNG_SIGNATURE_BYTES[i] != bytes[i]) {
                reject("Not a PNG file (invalid file signature)");
                return;
            }
        }

        // fast animation test
        var isAnimated = false;
        parseChunks(bytes, function (type) {
            if (type == "acTL") {
                isAnimated = true;
                return false;
            }
            return true;
        });
        if (!isAnimated) {
            // reject("Not an animated PNG");
            return pngparse.parseBuffer(buffer,function(error,fakeImageData){
                if(error){
                    reject(error);
                }
                else{
                    images.push(toImageData(fakeImageData,anim));
                    result(images);
                }
            });
        }

        var
            preDataParts = [],
            postDataParts = [],
            headerDataBytes = null,
            frame = null,
            anim = new Animation();

        parseChunks(bytes, function (type, bytes, off, length) {
            switch (type) {
                case "IHDR":
                    headerDataBytes = bytes.subarray(off + 8, off + 8 + length);
                    anim.width = readDWord(bytes, off + 8);
                    anim.height = readDWord(bytes, off + 12);
                    break;
                case "acTL":
                    anim.numPlays = readDWord(bytes, off + 8 + 4);
                    break;
                case "fcTL":
                    if (frame) anim.frames.push(frame);
                    frame = {};
                    frame.width = readDWord(bytes, off + 8 + 4);
                    frame.height = readDWord(bytes, off + 8 + 8);
                    frame.left = readDWord(bytes, off + 8 + 12);
                    frame.top = readDWord(bytes, off + 8 + 16);
                    var delayN = readWord(bytes, off + 8 + 20);
                    var delayD = readWord(bytes, off + 8 + 22);
                    if (delayD == 0) delayD = 100;
                    frame.delay = 1000 * delayN / delayD;
                    // see http://mxr.mozilla.org/mozilla/source/gfx/src/shared/gfxImageFrame.cpp#343
                    if (frame.delay <= 10) frame.delay = 100;
                    anim.playTime += frame.delay;
                    frame.disposeOp = readByte(bytes, off + 8 + 24);
                    frame.blendOp = readByte(bytes, off + 8 + 25);
                    frame.dataParts = [];
                    break;
                case "fdAT":
                    if (frame) frame.dataParts.push(bytes.subarray(off + 8 + 4, off + 8 + length));
                    break;
                case "IDAT":
                    if (frame) frame.dataParts.push(bytes.subarray(off + 8, off + 8 + length));
                    break;
                case "IEND":
                    postDataParts.push(subBuffer(bytes, off, 12 + length));
                    break;
                default:
                    preDataParts.push(subBuffer(bytes, off, 12 + length));
            }
        });

        if (frame) anim.frames.push(frame);

        if (anim.frames.length == 0) {
            reject("Not an animated PNG");
            return;
        }

        var promise= Promise.resolve(null);

        // creating images
        var createdImages = 0;
        var preBlob = new BlobBuffer(preDataParts), postBlob = new BlobBuffer(postDataParts);
        for (var f = 0; f < anim.frames.length; f++) {
            frame = anim.frames[f];

            var bb = [];
            bb.push(PNG_SIGNATURE_BYTES);
            headerDataBytes.set(makeDWordArray(frame.width), 0);
            headerDataBytes.set(makeDWordArray(frame.height), 4);
            bb.push(makeChunkBytes("IHDR", headerDataBytes));
            bb.push(preBlob);
            for (var j = 0; j < frame.dataParts.length; j++) {
                bb.push(makeChunkBytes("IDAT", frame.dataParts[j]));
            }
            bb.push(postBlob);

            (function(frame,buffer){
                promise= promise.then(function(){
                    return new Promise(function(resolve,reject){
                        pngparse.parseBuffer(buffer,function(error,image){
                            if(error){
                                reject(error);
                            }
                            else{
                                images.push(toImageData(image,frame));

                                for(var key in anim){
                                    if(images[key]==null){
                                        images[key]= anim[key];
                                    }
                                }
                                resolve();
                            }
                        });  
                    })
                });
            })(frame,new BlobBuffer(bb));
            continue;

            var url = URL.createObjectURL(new Blob(bb, {"type": "image/png"}));
            delete frame.dataParts;
            bb = null;

            /**
             * Using "createElement" instead of "new Image" because of bug in Chrome 27
             * https://code.google.com/p/chromium/issues/detail?id=238071
             * http://stackoverflow.com/questions/16377375/using-canvas-drawimage-in-chrome-extension-content-script/16378270
             */
            frame.img = document.createElement('img');
            frame.img.onload = function () {
                URL.revokeObjectURL(this.src);
                createdImages++;
                if (createdImages == anim.frames.length) {
                    resolve(anim);
                }
            };
            frame.img.onerror = function () {
                reject("Image creation error");
            };
            frame.img.src = url;
        }

        promise.then(function(){
            result(images);
        })
    });
};

/**
 * @param {Uint8Array} bytes
 * @param {function(string, Uint8Array, int, int)} callback
 */
var parseChunks = function (bytes, callback) {
    var off = 8;
    do {
        var length = readDWord(bytes, off);
        var type = readString(bytes, off + 4, 4);
        var res = callback(type, bytes, off, length);
        off += 12 + length;
    } while (res !== false && type != "IEND" && off < bytes.length);
};

/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */
var readDWord = function (bytes, off) {
    var x = 0;
    // Force the most-significant byte to unsigned.
    x += ((bytes[0 + off] << 24 ) >>> 0);
    for (var i = 1; i < 4; i++) x += ( (bytes[i + off] << ((3 - i) * 8)) );
    return x;
};

/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */
var readWord = function (bytes, off) {
    var x = 0;
    for (var i = 0; i < 2; i++) x += (bytes[i + off] << ((1 - i) * 8));
    return x;
};

/**
 * @param {Uint8Array} bytes
 * @param {int} off
 * @return {int}
 */
var readByte = function (bytes, off) {
    return bytes[off];
};

/**
 * @param {Uint8Array} bytes
 * @param {int} start
 * @param {int} length
 * @return {Uint8Array}
 */
var subBuffer = function (bytes, start, length) {
    var a = new Uint8Array(length);
    a.set(bytes.subarray(start, start + length));
    return a;
};

var readString = function (bytes, off, length) {
    var chars = Array.prototype.slice.call(bytes.subarray(off, off + length));
    return String.fromCharCode.apply(String, chars);
};

var makeDWordArray = function (x) {
    return [(x >>> 24) & 0xff, (x >>> 16) & 0xff, (x >>> 8) & 0xff, x & 0xff];
};
var makeStringArray = function (x) {
    var res = [];
    for (var i = 0; i < x.length; i++) res.push(x.charCodeAt(i));
    return res;
};
/**
 * @param {string} type
 * @param {Uint8Array} dataBytes
 * @return {Uint8Array}
 */
var makeChunkBytes = function (type, dataBytes) {
    var crcLen = type.length + dataBytes.length;
    var bytes = new Uint8Array(new ArrayBuffer(crcLen + 8));
    bytes.set(makeDWordArray(dataBytes.length), 0);
    bytes.set(makeStringArray(type), 4);
    bytes.set(dataBytes, 8);
    var crc = crc32(bytes, 4, crcLen);
    bytes.set(makeDWordArray(crc), crcLen + 4);
    return bytes;
};

