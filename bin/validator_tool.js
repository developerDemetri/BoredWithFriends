'use strict';

let validator_tool = {};

validator_tool.checkInput = function(input, type, regex) {
  if (input) {
    if (type === 'string') {
      if (typeof(input) === 'string' && regex.test(input)) {
        return true;
      }
    }
    else if (type === 'number') {
      if (typeof(input) === 'number' || !(isNaN(input))) {
        return true;
      }
    }
  }
  return false;
}

validator_tool.checkCoordinates = function(location) {
  if (location) {
    if ((validator_tool.checkInput(location.latitude, 'number', null) && validator_tool.checkInput(location.longitude, 'number', null)) || (validator_tool.checkInput(location.lat, 'number', null) && validator_tool.checkInput(location.lng, 'number', null))) {
      return true;
    }
    else {
      return false;
    }
  }
  else {
    return false;
  }
}

module.exports = validator_tool;
