'use strict';

var loc = {
  lat: null,
  long: null
}

var geoUpdater;

function setup() {
  checkLocation(true);
  geoUpdater = setInterval(function() {
     checkLocation(false);
  }, 30 * 1000);
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
      var issueChecker = setInterval(function() {
         kill_loading();
      }, 20 * 1000);
    }
    navigator.geolocation.getCurrentPosition(function(position) {
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
      if(data.status == 200) {
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
  var find_food_url = getServer()+'/suggestions/food/find/'+loc.lat+'/'+loc.long;
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
  var order_food_url = getServer()+'/suggestions/food/order/'+loc.lat+'/'+loc.long;
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
  var go_shopping_url = getServer()+'/suggestions/shopping/'+loc.lat+'/'+loc.long;
  console.log(go_shopping_url)
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
