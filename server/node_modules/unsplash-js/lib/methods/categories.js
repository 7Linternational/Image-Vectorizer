"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = categories;
function categories() {
  var _this = this;

  return {
    listCategories: function listCategories() {
      var url = "/categories";

      return _this.request({
        url: url,
        method: "GET"
      });
    },

    category: function category(id) {
      var url = "/categories/" + id;

      return _this.request({
        url: url,
        method: "GET"
      });
    },

    categoryPhotos: function categoryPhotos(id, page, perPage) {
      var url = "/categories/" + id + "/photos";

      var query = {
        page: page,
        per_page: perPage
      };

      return _this.request({
        url: url,
        method: "GET",
        query: query
      });
    }
  };
}