'use strict';
function register() {
  $('#registerBtn').addClass('hide');
  $('#registerLoadingCircle').removeClass('hide');
  var username = $('#username').val();
  var email = $('#eml').val();
  var password1 = $('#pass1').val();
  var password2 = $('#pass2').val();
  if (username &&  email && password1 && password2) {
    var re = /^(\w{3,63})$/;
    if (re.test(username)) {
      $("#badUsername").addClass("hide");
      var url = getServer()+'/register/checkusername';
      var unameObj = {
        "username": username
      };
      $.ajax({
        type: "POST",
        url: url,
        data: unameObj,
        success: function(data1) {
          if (data1.status === 200 && data1.validity) {
            re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (re.test(email)) {
              url = getServer()+'/register/checkemail';
              var emlObj = {
                "email": email
              };
              $.ajax({
                type: "POST",
                url: url,
                data: emlObj,
                success: function(data2) {
                  if(data2.status === 200) {
                    if (data2.validity) {
                      $("#badEmail").addClass("hide");
                      if (checkPass(password1,password2)) {
                        console.log('inserting user')
                        insertUser(username,email,password1);
                      }
                      else {
                        stopLoading();
                      }
                    }
                    else {
                      $("#badEmail").removeClass("hide");
                      stopLoading();
                    }
                  }
                  else {
                    $("#badEmail").removeClass("hide");
                    stopLoading();
                  }
                }
              });
            }
            else {
              $("#badEmail").removeClass("hide");
              Materialize.toast('Please enter a valid email address!', 5000, 'warning-toast');
              stopLoading();
            }
          }
          else {
            $("#badUsername").removeClass("hide");
            Materialize.toast('Username Already In Use!', 5000, 'warning-toast');
            stopLoading();
          }
        }
      });
    }
    else {
      $("#badUsername").removeClass("hide");
      Materialize.toast('Invalid Username!', 5000, 'warning-toast');
      stopLoading();
    }
  }
  else {
    stopLoading();
    Materialize.toast('Please fill in ALL fields!', 5000, 'warning-toast');
  }
};

function stopLoading() {
  $('#registerLoadingCircle').addClass('hide');
  $('#registerBtn').removeClass('hide');
}

function insertUser(username,email,password) {
  var url = getServer()+'/register/submit';
  var data = {
    "username": username,
    "email": email,
    "password": password
  };
  $.ajax({
    type: "POST",
    url: url,
    data: data,
    success: function(data) {
      if (data.status === 201) {
        var homeUrl = getServer()+'/'
        window.location.replace(homeUrl);
      }
      else {
        $('#registerLoadingCircle').addClass('hide');
        $('#registerBtn').removeClass('hide');
      }
    }
  });
}

function checkPass(pass1, pass2) {
  if (pass1 == pass2) {
    $("#badPassMatch").addClass("hide");
    var re = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9!@#$%^&*/._+-]{8,31})$/;
    if (re.test(pass1)) {
      $("#badPass").addClass("hide");
      return true;
    }
    else {
      $("#badPass").removeClass("hide");
      Materialize.toast('Please enter a valid password!', 5000, 'warning-toast');
      return false;
    }
  }
  else {
    $("#badPassMatch").removeClass("hide");
    Materialize.toast('The passwords do not match!', 5000, 'warning-toast');
    return false;
  }
}

/*
Copyright 2016 DeveloperDemetri
developerdemetri.com

Licensed under the Apache License, Version 2.0 (the "License");
u may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
