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
  $('#explore-options').removeClass("hide");
}

function backToHomeOptions() {
  $('#order-food').addClass("hide");
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
