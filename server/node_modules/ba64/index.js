var fs = require("fs");

// gets the extension of a base64 encoded image
function getExt(data_url){
  return data_url.split("data:image/")[1].split(";")[0];
}

// gets the base64 encoded image from the data url
function getBa64Img(data_url){
  return data_url.split(";base64,").pop();
}

// saves a base64 encoded image synchronously
module.exports.writeImageSync = function(file_path, data_url){
  if (arguments.length < 2){
    throw new Error("writeImageSync() requires two arguments. You have only included " + arguments.length);
  }
  fs.writeFileSync(file_path + "." + getExt(data_url), getBa64Img(data_url), {encoding: "base64"});
}

// saves a base64 encoded image asynchronously
module.exports.writeImage = function(file_path, data_url, callback){
  if (arguments.length < 3){
    throw new Error("writeImage() requires three arguments. You have only included " + arguments.length);
  }
  fs.writeFile(file_path + "." + getExt(data_url), getBa64Img(data_url), {encoding: "base64"}, callback);
}

module.exports.getExt = getExt;
module.exports.getBa64Img = getBa64Img;
module.exports.fs = {writeFile: fs.writeFile, writeFileSync: fs.writeFileSync};