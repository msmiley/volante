const fs = require('fs');
const path = require('path');

//
// util function to find the root (dir containing package.json) for a given path
//
exports.findRoot = function(p) {
  var rpath = path.resolve(p);
  if (fs.existsSync(path.join(rpath, 'package.json'))) {
    return rpath;
  } else {
    var parent = path.dirname(rpath);
    if (parent !== rpath) {
      return exports.findRoot(parent);
    } else {
      // if a parent root cannot be found, naively default to using our own root
      return exports.findRoot(__dirname);
    }
  }
};

//
// util function to find an $emit call and evaluate and return the emit name
//
exports.findEmits = function(str) {
  let emits = [];
  str.replace(/\.\$emit\(['"](.+?)['"]\,/g, function(m, p1){ emits.push(p1); });
  return emits;
};

//
// clone sanitized (no functions or circular deps) members specified by keys
// out of the given obj
//
exports.selectProps = function(obj, keys) {
  let ret = {};
  for (let k of keys) {
    try {
      ret[k] = JSON.parse(JSON.stringify(obj[k]));
    } catch(e) {
      ret[k] = '<object with circular references>';
    }
  }
  return ret;
};

//
// set a value anywhere in an object given a path
//
exports.deepSet = function(obj, path, value) {
  let a = path.split('.');
  let o = obj;
  while (a.length - 1) {
    let n = a.shift();
    if (!(n in o)) {
      o[n] = {};
    }
    o = o[n];
  }
  // check for basic type primitives and coerce
  switch (typeof o[a[0]]) {
    case 'number':
      o[a[0]] = parseFloat(value);
      break;
    case 'boolean':
      o[a[0]] = value === 'true';
      break;
    case 'object':
      o[a[0]] = JSON.parse(value);
      break;
    default: // string, etc.
      o[a[0]] = value;
      break;
  }
};