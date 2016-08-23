'use strict';
function setup() {
  $(document).keypress(function(e){
    if (e.which == 13){
        $("#login-button").click();
    }
  });
};

function login() {
  $('#loginLoadingCircle').removeClass('hide');
  $('#login-button').addClass('hide');
  $('#login-button-mobile').addClass('hide');
  var username = $('#username').val();
  var password = $('#pass').val();
  if (username && password) {
    var url = getServer()+'/auth';
    var data = {
      "username": username,
      "password": password
    };
    $.ajax({
      type: "POST",
      url: url,
      data: data,
      success: function(data) {
        if(data.status == 200) {
          var tempUrl = getServer()+'/';
          window.location.replace(tempUrl);
        }
        else if (data.status == 400) {
          $('#loginLoadingCircle').addClass('hide');
          $('#login-button').removeClass('hide');
          $('#login-button-mobile').removeClass('hide');
          $("#login-err").removeClass("hide");
        }
        else {
          $('#loginLoadingCircle').addClass('hide');
          $('#login-button').removeClass('hide');
          $('#login-button-mobile').removeClass('hide');
          //something went wrong with the server
        }
      }
    });
  }
  else {
    $("#login-err").removeClass("hide");
    $('#loginLoadingCircle').addClass('hide');
    $('#login-button').removeClass('hide');
  }
};

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
