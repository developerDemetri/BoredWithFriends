'use strict';

var loc = {
  lat: null,
  long: null
}

function setup() {
  setLocation();
}

function setLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      loc.lat = position.coords.latitude;
      loc.long = position.coords.longitude;
      $('#geoLoader').addClass("hide");
      $('#geoError').addClass("hide");
      $('#explore-vs-home').removeClass("hide");
    });
  }
  else {
    console.log('no geolocation ):');
    $('#geoError').removeClass("hide");
  }
}

function findFood() {
  $('#explore-options').addClass("hide");
  $('#find-food').removeClass("hide");
  var find_food_url = getServer()+'/suggestions/food/find/'+loc.lat+'/'+loc.long;
  $.get(find_food_url).done(function(data) {
    console.log(data);
  });
}

function orderFood() {
  $('#home-options').addClass("hide");
  $('#order-food').removeClass("hide");
  var order_food_url = getServer()+'/suggestions/food/order/'+loc.lat+'/'+loc.long;
  $.get(order_food_url).done(function(data) {
    console.log(data);
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
