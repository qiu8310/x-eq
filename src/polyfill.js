if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

if (!Object.keys) {
  Object.keys = function (obj) {
    let result = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) result.push(key);
    }
    return result;
  };
}
