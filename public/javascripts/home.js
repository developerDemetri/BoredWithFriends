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
    });
  }
  else {
    console.log('no geolocation ):');
    $('#geoError').removeClass("hide");
  }
}

function loadFood() {
  console.log('what up fam');
  var food_url = getServer()+'/suggestions/food/'+loc.lat+'/'+loc.long;
  $.get(food_url).done(function(data) {
    console.log(data);
  });
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
