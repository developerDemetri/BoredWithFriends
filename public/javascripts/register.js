'use strict';

var user = null;

function register() {
  startLoading();
  var username = $('#username').val();
  var email = $('#eml').val();
  var password1 = $('#pass1').val();
  var password2 = $('#pass2').val();
  if (username &&  email && password1 && password2) {
    checkusername(function(usernameIsValid) {
      if(usernameIsValid) {
        checkemail(function(emailIsValid) {
          if (emailIsValid) {
            if (checkPassStrength() && checkPassMatch()) {
              user = {
                'username': username,
                'email': email,
                'password': password1
              };
              loadModal();
            }
            else {
              stopLoading();
              Materialize.toast('Please enter a valid Password!', 5000, 'warning-toast');
            }
          }
          else {
            Materialize.toast('Please enter a valid Email Address!', 5000, 'warning-toast');
            stopLoading();
          }
        });
      }
      else {
        Materialize.toast('Please enter a valid Username!', 5000, 'warning-toast');
        stopLoading();
      }
    });
  }
  else {
    stopLoading();
    Materialize.toast('Please fill in ALL fields!', 5000, 'warning-toast');
  }
};

function startLoading() {
  $('#registerBtn').addClass('hide');
  $('#registerLoadingCircle').removeClass('hide');
}

function stopLoading() {
  $('#registerLoadingCircle').addClass('hide');
  $('#registerBtn').removeClass('hide');
}

function insertUser() {
  var url = getServer()+'/register/submit';
  $.ajax({
    type: "POST",
    url: url,
    data: user,
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

function loadModal() {
  stopLoading();
  $('#terms-modal').openModal();
}

function rejectTerms() {
  user = null;
  $('#terms-modal').closeModal();
}

function acceptTerms() {
  insertUser();
  startLoading();
  $('#terms-modal').closeModal();
}

function checkPassStrength() {
  var pass1 = $('#pass1').val();
  var re = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9!@#$%^&*/._+-]{8,31})$/;
  if (re.test(pass1)) {
    $("#weakPass").addClass("hide");
    return true;
  }
  else {
    $("#weakPass").removeClass("hide");
    return false;
  }
}

function checkPassMatch() {
  var pass1 = $('#pass1').val();
  var pass2 = $('#pass2').val();
  if (pass1 === pass2) {
    $("#badPassMatch").addClass("hide");
    return true;
  }
  else {
    $("#badPassMatch").removeClass("hide");
    return false;
  }
}

function checkusername(callback) {
  var username = $('#username').val();
  var name_decision = null;
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
          $("#takenUsername").addClass("hide");
          name_decision = true;
        }
        else {
          name_decision = false;
          $("#takenUsername").removeClass("hide");
        }
        if (callback) {
          callback(name_decision);
        }
      }
    });
  }
  else {
    $("#badUsername").removeClass("hide");
    if (callback) {
      callback(name_decision);
    }
  }
}

function checkemail(callback) {
  var email = $('#eml').val();
  var email_decision = null;
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(email)) {
    $("#badEmail").addClass("hide");
    var url = getServer()+'/register/checkemail';
    var emlObj = {
      "email": email
    };
    $.ajax({
      type: "POST",
      url: url,
      data: emlObj,
      success: function(data2) {
        if (data2.status === 200 && data2.validity) {
          email_decision = true;
          $("#takenEmail").addClass("hide");
        }
        else {
          email_decision = false;
          $("#takenEmail").removeClass("hide");
        }
        if (callback) {
          callback(email_decision);
        }
      }
    });
  }
  else {
    email_decision = false;
    $("#badEmail").removeClass("hide");
    if (callback) {
      callback(email_decision);
    }
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
