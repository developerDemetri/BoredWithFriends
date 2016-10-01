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

/*
Copyright 2016 DeveloperDemetri
developerdemetri.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
