"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = photos;

var _utils = require("../utils");

var _lodash = require("lodash.get");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function photos() {
  var _this = this;

  return {
    listPhotos: function listPhotos() {
      var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var perPage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
      var orderBy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "latest";

      var url = "/photos";
      var query = {
        page: page,
        per_page: perPage,
        order_by: orderBy
      };

      return _this.request({
        url: url,
        method: "GET",
        query: query
      });
    },

    listCuratedPhotos: function listCuratedPhotos() {
      var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var perPage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
      var orderBy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "latest";

      var url = "/photos/curated";
      var query = {
        page: page,
        per_page: perPage,
        order_by: orderBy
      };

      return _this.request({
        url: url,
        method: "GET",
        query: query
      });
    },

    searchPhotos: function searchPhotos(q) {
      var category = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [""];
      var page = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var perPage = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;

      var url = "/photos/search";
      var query = {
        query: q,
        category: category.length > 1 ? category.join(",") : category.toString(),
        page: page,
        per_page: perPage
      };

      return _this.request({
        url: url,
        method: "GET",
        query: query
      });
    },

    getPhoto: function getPhoto(id, width, height, rectangle) {
      var url = "/photos/" + id;
      var query = {
        w: width,
        h: height,
        rect: rectangle
      };

      return _this.request({
        url: url,
        method: "GET",
        query: query
      });
    },

    getPhotoStats: function getPhotoStats(id) {
      var url = "/photos/" + id + "/stats";

      return _this.request({
        url: url,
        method: "GET"
      });
    },

    getRandomPhoto: function getRandomPhoto() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var url = "/photos/random";
      var category = options.category || [];
      var collections = options.collections || [];

      var query = {
        featured: options.featured,
        username: options.username,
        orientation: options.orientation,
        category: category.join(),
        collections: collections.join(),
        query: options.query,
        w: options.width,
        h: options.height,
        c: options.cacheBuster || new Date().getTime(), // Avoid ajax response caching
        count: options.count
      };

      Object.keys(query).forEach(function (key) {
        if (!query[key]) {
          delete query[key];
        }
      });

      return _this.request({
        url: url,
        method: "GET",
        query: query
      });
    },

    uploadPhoto: function uploadPhoto(photo) {
      if (!_this._bearerToken) {
        throw new Error("Requires a bearerToken to be set.");
      }

      var url = "/photos";

      return _this.request({
        url: url,
        method: "POST",
        body: {
          photo: photo
        }
      });
    },

    likePhoto: function likePhoto(id) {
      if (!_this._bearerToken) {
        throw new Error("Requires a bearerToken to be set.");
      }

      var url = "/photos/" + id + "/like";

      return _this.request({
        url: url,
        method: "POST"
      });
    },

    unlikePhoto: function unlikePhoto(id) {
      if (!_this._bearerToken) {
        throw new Error("Requires a bearerToken to be set.");
      }

      var url = "/photos/" + id + "/like";

      return _this.request({
        url: url,
        method: "DELETE"
      });
    },

    downloadPhoto: function downloadPhoto(photo) {
      var downloadLocation = (0, _lodash2.default)(photo, "links.download_location", undefined);

      if (downloadLocation === undefined) {
        throw new Error("Object received is not a photo. " + photo);
      }

      var urlComponents = (0, _utils.getUrlComponents)(downloadLocation);

      return _this.request({
        url: urlComponents.pathname,
        method: "GET",
        query: urlComponents.query
      });
    }
  };
}