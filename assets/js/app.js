// Initialize Firebase
var config = {
  apiKey: "AIzaSyCvpTUzbU9prXZLDP9BtwBE1viuztTbt0k",
  authDomain: "audiosauce-6eb52.firebaseapp.com",
  databaseURL: "https://audiosauce-6eb52.firebaseio.com",
  projectId: "audiosauce-6eb52",
  storageBucket: "audiosauce-6eb52.appspot.com",
  messagingSenderId: "266026610182"
};
firebase.initializeApp(config);

// Variable for Firebase
var database = firebase.database();

// Initialize global variable
var currentMoment;
var usernameInput;
var userComment;
var weatherCondition;
var geolocationAllowed = false;
var userLatitude;
var userLongitude;
var weatherSearchString;
var userCity = "";
var userZipcode = "";
var cityName; // Retrieved from API
var queryParams = parseQueryString(window.location.search.substr(1));
var spotifyAccessToken = queryParams.access_token;
var currentPlaylist;
var currentPlaylistID;
var spotifyLoaded = false;
var weatherLoaded = false;
// Running on page load
$(document).ready(function(){
  if (!spotifyAccessToken && window.location.href.includes("github.io")) {
    window.location = "https://polar-headland-83144.herokuapp.com/login?callback=" + window.location.href;
  } else {
    getLocation();
  }
});

// Get location data ----------------------------
function getLocation() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
  } else {
    alert("Geolocation is not supported by this browser");
  }
}

// Location success
function geoSuccess(position) {
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;
  geolocationAllowed = true;
  $("#location-input-container").hide();
  console.log("Latitude: " + userLatitude + " Longitude: " + userLongitude);
  weatherSearchString = "?lat=" + userLatitude + "&lon=" + userLongitude;
  getWeather();
}

// Location error
function geoError() {
  // If location access is denied
  $("#location-input-container").show();
  // alert("Geocoder failed.");
}
// End location --------------------------------------------


// Wrapper for API call --------------------------------------------
function getWeather() {
// Setup for weather API call
var weatherAPIKey = "&APPID=4aa09d0ed51ac90ebeb79c63e62ba521";
var weatherSiteString = "https://api.openweathermap.org/data/2.5/weather";
var weatherQueryURL = weatherSiteString + weatherSearchString + weatherAPIKey;

// Weather API call
$.ajax({
  url: weatherQueryURL,
  method: "GET"
}).then(function(response) {
  console.log(response);
  cityName = response.name;
  var dKelvin = response.main.temp; // MAX ADDED
  var dFahrenheit = (dKelvin - 273.15) * 1.8 + 32; // MAX ADDED
  var dCelcius = (dKelvin - 273.15); // MAX ADDED

  var sunriseSec = response.sys.sunrise;
  var sunriseDate = new Date(sunriseSec * 1000);
  var sunriseTimestr = sunriseDate.toLocaleTimeString();
  var sunsetSec = response.sys.sunset;
  var sunsetDate = new Date(sunsetSec * 1000);
  var sunsetTimestr = sunsetDate.toLocaleTimeString();

  cityName = response.name; 

  $("#city-name").text(cityName);
  $("#city-name2").text(cityName);
  weatherCondition = response.weather[0].main;
  pickMedia(weatherCondition);
  displayComments();
  
  // Display weather data on weather flyout
  $(".weather-drop").append("<img style='height: 30px; width: 40px; margin-right: 5px' src='assets/images/thermometerIcon.png'/>" + "    " + dFahrenheit.toFixed(2) + " °F" + "  /  " + dCelcius.toFixed(2) + " °C" +"<hr>");
  $(".weather-drop").append("<img style='height: 30px; width: 40px; margin-right: 5px' src='assets/images/humidityIcon.png'/>" + "    " + response.main.humidity + "%" + "<hr>");
  $(".weather-drop").append("<img style='height: 30px; width: 40px; margin-right: 5px' src='assets/images/windIcon.png'/>" + "    " + response.wind.speed + " mph" + "<hr>");
  $(".weather-drop").append("<img style='height: 30px; width: 40px; margin-right: 5px' src='assets/images/sunriseIcon.png'/>" + "    " + sunriseTimestr + "  /  ");
  $(".weather-drop").append("<img style='height: 30px; width: 35px; margin-right: 5px' src='assets/images/sunsetIcon.png'/>" + "    " + sunsetTimestr + "<hr>");
}); // End ajax
} // End getWeather ------------------------------------------------------

// Button event for name and/or location ---------------------------
$("#submit-button").on("click", function(event) {
  event.preventDefault();
  // Test for username input
  usernameInput = $("#username-input").val().trim();

  if (usernameInput === "") {
    $("#username-input").addClass("error");
    // Materialize.toast(message, displayLength, className, completeCallback);
    Materialize.toast('You must enter your name.', 4000); // 4000 is the duration of the toast
    return;
  }

  if (!geolocationAllowed) {
    // Test for user location input
    userCity = $("#city-input").val().trim();
    userZipcode = $("#zipcode-input").val().trim();
    if ((userCity !== "") || (userZipcode !== "")) {
      if (userZipcode !== ""){
        weatherSearchString = "?zip=" + $("#zipcode-input").val().trim();
        getWeather();
      } else {
        weatherSearchString = "?q=" + $("#city-input").val().trim();
        getWeather();
      }
    } else {
      $("#city-input").addClass("error");
      $("#zipcode-input").addClass("error");
      // Materialize.toast(message, displayLength, className, completeCallback);
      Materialize.toast('You must enter your location.', 4000); // 4000 is the duration of the toast
      return;
    }
  }

  // Successfull! close opening screen and get weather
  $(".information-input").addClass("scale-out");
  setTimeout(function(){  
    $(".information-input").addClass("displayNone");
    $(".music-box").addClass("scale-in");
  }, 500);


  // Show the chat
  $("#social-icon-button").show();
  $("#world-icon-button").show();
}); // End submit ----------------------------------------------------------------

// Display messages
function displayMessages(messages) {
  $("#messages").text(message);
}

// Check database and display comments -----------------------------------------
function displayComments() {

  database.ref().on("child_added", function(dataSnapshot) {
    // $(".chatroom-drop").empty();
    var location =dataSnapshot.val().location;
    var username = dataSnapshot.val().username;
    var comment = dataSnapshot.val().comment; 
    console.log("Location: " + location + "City: " + cityName);
    
    if (location === cityName) {
      var commentDiv = $("<div>");
      var commentParagraph = $("<p>" + username + ": " + comment + "</p>");
      commentDiv.append(commentParagraph);
      $(".chatroom-drop").prepend(commentDiv);
    }
  }); 
} //End display comments --------------------------------------------------

function handleSubmit(eventPassed) {
  eventPassed.preventDefault();
  userComment = $("#chatroom-textbox").val().trim();
  currentMoment = moment();
  console.log("Comment: " + userComment + " City: " + cityName + " User: " + usernameInput);
  $("#chatroom-textbox").val("");
  database.ref().push({
    username: usernameInput,
    comment: userComment,
    location: cityName,
  });
}
// Submit comment -------------------------------------------------------------
$("#send-chat-button").on("click", function(event) {
  handleSubmit(event);
  // event.preventDefault();
  // userComment = $("#chatroom-textbox").val().trim();
  // currentMoment = moment();
  // console.log("Comment: " + userComment + " City: " + cityName + " User: " + usernameInput);
  // $("#chatroom-textbox").val("");
  // database.ref().push({
  //   username: usernameInput,
  //   comment: userComment,
  //   location: cityName,
  // });
}); // End submit comment

$('#chatroom-textbox').keyup(function(e){
        if(e.keyCode == 13 && $("#chatroom-textbox").val().trim().length > 0) {
          handleSubmit(e);
        }
});


// Function to set media to weather condition --------------------------------------
function pickMedia(weatherCondition) {
  // Variable for the image
  var backgroundImage;

  // Switch to choose the right image based on weather
  switch (weatherCondition) {
    case "Thunderstorm":
      backgroundImage = "https://media.giphy.com/media/CIYF0RVOmd2qQ/giphy.gif";
      currentPlaylistID = "7KYAAVLORZyMbmEAvSEoYw";
      break;
    case "Rain":
      backgroundImage = "https://media.giphy.com/media/Il9f7ZhytEiI0/giphy.gif";
      currentPlaylistID ="5PQEIdCn3ezxTbC0ZbwxRq";
      break;
    case "Snow":
      backgroundImage = "https://media.giphy.com/media/Xi2Xu0MejhsUo/giphy.gif";
      currentPlaylistID = "1nbwrUKXkXyQ5Lvk0lSgM8";
      break;
    case "Clear":
      backgroundImage = "http://78.media.tumblr.com/tumblr_m6ltvk2pHg1r9bkeao1_500.gif";
      currentPlaylistID = "1QZ6eQbSRBy2HR9arAk9Ns";
      break;
    case "Clouds":
      backgroundImage = "https://media.giphy.com/media/qq5gwamAHVofm/giphy.gif";
      currentPlaylistID = "4m19bZbDAZ0PBCvDkBDgvn";
      break;
    case "Extreme":
      backgroundImage = "https://media.giphy.com/media/QksV5jdMsPYK4/giphy.gif";
      currentPlaylistID = "747OCIB1gpl2xnq5M0DTLJ";
      break;
    case "Drizzle":
      backgroundImage = "https://media.giphy.com/media/QPsEnRasf0Vfa/giphy.gif";
      currentPlaylistID = "1klpyzcS6vqNCGA6npx637";
      break;
    case "Additional":
      backgroundImage = "https://media.giphy.com/media/tMf9OezQLRxRu/giphy.gif";
      currentPlaylistID = "5V68XWbxzLnM7uKL1tI24t";
      break;
    case "Atmosphere":
      backgroundImage = "https://media.giphy.com/media/McDhCoTyRyLiE/giphy.gif";
      currentPlaylistID = "1X7fnHaJuMOAioCyMJz3Mg";
      break;
    }

    weatherLoaded = true;

  // Set the background image
  var htmlBackground = "url(" + backgroundImage + ") no-repeat center center fixed";
  $("html").css({
    "background" : htmlBackground,
    "-webkit-background-size": "cover",
    "-moz-background-size": "cover",
    "-o-background-size": "cover",
    "background-size": "cover"
  });
} // End pickMedia -----------------------------------------------------------------


function parseQueryString( queryString ) {
    var params = {}, queries, temp, i, l;
    // Split into key/value pairs
    queries = queryString.split("&");
    // Convert the array of strings into an object
    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
}
