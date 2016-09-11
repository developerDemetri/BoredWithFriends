'use strict';

var loc = {
  lat: null,
  long: null
}

var geoUpdater;
var issueChecker;

function setup() {
  checkLocation(true);
  geoUpdater = setInterval(function() {
     checkLocation(false);
  }, 10 * 1000);
}

function setCustomLocation() {
  var re = /^[^<>={}]{2,255}$/;
  $('#locationBtn').addClass("hide");
  $('#customLocationLoadingCircle').removeClass("hide");
  var address = $('#customLocation').val();
  if (address && re.test(address)) {
    $('#customLocationError').addClass("hide");
    address += '';
    var url = getServer()+'/location/custom';
    $.ajax({
      type: "POST",
      url: url,
      data: {
        address: address
      },
      success: function(data) {
        if (data.status === 202) {
          console.log('successfully set custom location');
          $('#geo_issue_reload').addClass("hide");
          $('#explore-vs-home').removeClass("hide");
          clearInterval(geoUpdater);
          clearInterval(issueChecker);
        }
        else {
          console.log('issue setting custom location');
          $('#customLocationError').removeClass("hide");
        }
        $('#locationBtn').removeClass("hide");
        $('#customLocationLoadingCircle').addClass("hide");
      }
    });
  }
  else {
    console.log('issue setting custom location');
    $('#customLocationError').removeClass("hide");
  }
}

function kill_loading() {
  $('#geoLoader').addClass("hide");
  window.updateLocation = function(stuff) {return false;};
  clearInterval(geoUpdater);
  $('#geo_issue_reload').removeClass("hide");
}

function updateLocation(is_inital_load) {
  if ("geolocation" in navigator) {
    if (is_inital_load) {
      issueChecker = setInterval(function() {
         kill_loading();
      }, 20 * 1000);
    }
    navigator.geolocation.getCurrentPosition(function(position) {
      clearInterval(issueChecker);
      loc.lat = position.coords.latitude;
      loc.long = position.coords.longitude;
      saveLocation(loc.lat, loc.long);
      if (is_inital_load) {
        $('#geoLoader').addClass("hide");
        $('#geoError').addClass("hide");
        $('#explore-vs-home').removeClass("hide");
      }
    });
  }
  else {
    console.log('no geolocation ):');
    if (is_inital_load) {
      $('#geoError').removeClass("hide");
    }
  }
}

function checkLocation(is_inital_load) {
  if (is_inital_load) {
    var loc_url = getServer()+'/location';
    $.get(loc_url).done(function(data) {
      if (data.status === 200) {
        if (data.location) {
          loc.lat = data.location.latitude;
          loc.long = data.location.longitude;
          $('#geoLoader').addClass("hide");
          $('#geoError').addClass("hide");
          $('#explore-vs-home').removeClass("hide");
        }
        else {
          updateLocation(is_inital_load);
        }
      }
      else {
        console.log('error getting location');
        if (is_inital_load) {
          $('#geoError').removeClass("hide");
        }
      }
    });
  }
  else {
    updateLocation(is_inital_load);
  }
}

function saveLocation(lat, long) {
  console.log('updating location...');
  var data = {
    lat: lat,
    long: long
  };
  var url = getServer()+'/location';
  $.ajax({
    type: "POST",
    url: url,
    data: data,
    success: function(data) {
      if(data.status === 200) {
        console.log('successfully updated location');
      }
      else {
        console.log('issue updating location');
      }
    }
  });
}

function shortenName(name) {
  if (name.length > 37) {
    return (name.substring(0, 37)+'...');
  }
  else {
    return name;
  }
}

function findFood() {
  $('#explore-options').addClass("hide");
  $('#find-food').removeClass("hide");
  var find_food_url = getServer()+'/suggestions/food/find';
  $.get(find_food_url).done(function(data) {
    for (var i = 0; i < data.places.length; i++) {
      var card = '';
      card += '<div class="col s6 m4">';
      card += ' <div class="card teal lighten-4 food-card">';
      card += '   <div class="card-content blue-grey-text text-darken-4">';
      card += '     <span class="grey-text text-darken-4 smaller-card-font">'+shortenName(data.places[i].name)+'</span>';
      card += '     <p>'+starify(data.places[i].rating)+'</p>';
      card += '   </div>';
      card += '  </div>';
      card += '</div>';
      $('#food-places').append(card);
    }
    $('.google-attribution').removeClass('hide');
  });
}

function orderFood() {
  $('#home-options').addClass("hide");
  $('#order-food').removeClass("hide");
  var order_food_url = getServer()+'/suggestions/food/order';
  $.get(order_food_url).done(function(data) {
    for (var i = 0; i < data.places.length; i++) {
      var card = '';
      card += '<div class="col s6 m4">';
      card += ' <div class="card food-card blue lighten-4">';
      card += '   <div class="card-content blue-grey-text text-darken-4">';
      card += '     <span class="grey-text text-darken-4 smaller-card-font">'+shortenName(data.places[i].name)+'</span>';
      card += '     <p>'+starify(data.places[i].rating)+'</p>';
      card += '   </div>';
      card += '  </div>';
      card += '</div>';
      $('#order-places').append(card);
    }
    $('.google-attribution').removeClass('hide');
  });
}

function displayHomeOptions() {
  $('#explore-vs-home').addClass("hide");
  $('#explore-options').addClass("hide");
  $('#home-options').removeClass("hide");
}

function displayExploreOptions() {
  $('#explore-vs-home').addClass("hide");
  $('#home-options').addClass("hide");
  $('#explore-options').removeClass("hide");
}

function backToHome() {
  $('#explore-options').addClass("hide");
  $('#home-options').addClass("hide");
  $('#explore-vs-home').removeClass("hide");
}

function backToExploreOptions() {
  $('#find-food').addClass("hide");
  $('#go-shopping').addClass("hide");
  $('#see-movie').addClass("hide");
  $('#explore-options').removeClass("hide");
}

function backToHomeOptions() {
  $('#order-food').addClass("hide");
  $('#watch-tv').addClass("hide");
  $('#home-options').removeClass("hide");
}

function starify(rating) {
  var stars = '';
  if(isNaN(rating)) {
    return stars;
  }
  for (var i = 0; i < 5; i++) {
    if (rating >= 1) {
      stars += '<i class="fa fa-star" aria-hidden="true"></i>';
    }
    else if (rating >= .5) {
      stars += '<i class="fa fa-star-half-o" aria-hidden="true"></i>';
    }
    else {
      stars += '<i class="fa fa-star-o" aria-hidden="true"></i>';
    }
    rating--;
  }
  return stars;
}

function loadTerms() {
  $('#terms-privacy-modal').openModal();
}

function closeTerms() {
  $('#terms-privacy-modal').closeModal();
}

function goShopping() {
  $('#explore-options').addClass("hide");
  $('#go-shopping').removeClass("hide");
  var go_shopping_url = getServer()+'/suggestions/shopping';
  $.get(go_shopping_url).done(function(data) {
    for (var i = 0; i < data.places.length; i++) {
      var card = '';
      card += '<div class="col s6 m4">';
      card += ' <div class="card food-card blue lighten-4">';
      card += '   <div class="card-content blue-grey-text text-darken-4">';
      card += '     <span class="grey-text text-darken-4 smaller-card-font">'+shortenName(data.places[i].name)+'</span>';
      card += '     <p>'+starify(data.places[i].rating)+'</p>';
      card += '   </div>';
      card += '  </div>';
      card += '</div>';
      $('#shopping-places').append(card);
    }
    $('.google-attribution').removeClass('hide');
  });
}

function watchTV() {
  $('#home-options').addClass("hide");
  $('#watch-tv').removeClass("hide");
  //load data//
}

function seeMovie() {
  $('#explore-options').addClass("hide");
  $('#see-movie').removeClass("hide");
}

function logout() {
  var url = getServer()+'/logout';
  $.ajax({
    type: "POST",
    url: url,
    data: null,
    success: function(data) {
      if(data.status == 200) {
        var tempUrl = getServer()+'/';
        window.location.replace(tempUrl);
      }
      else if (data.status == 400) {
        console.log("couldn't log out");
      }
      else {
        //something went wrong with the server
      }
    }
  });
}

/*
Copyright 2016 DeveloperDemetri

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
