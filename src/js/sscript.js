var SITE_URL = "https://0adri3n.github.io/stats4spotify";
var SPOTIFY_API = "https://api.spotify.com/v1";
var HIGHLIGHT_TIMEOUT = 100;

var SpotifyApi = {
  sendRequest: function (url, callback) {
    var accessToken = Config.getValidToken();
    if (accessToken == null) {
      var error = "unauthorised";
      callback(error);
      return;
    }
    d3.json(url)
      .header("Authorization", "Bearer " + accessToken)
      .get(callback);
  },
};

var Auth = {
  getAuthUrl: function (siteUrl) {
    var clientId = "9e5bc3ca56f746b49e1e1f7049706043";
    var redirectUri = encodeURIComponent(siteUrl + "?auth_callback");
    return (
      "https://accounts.spotify.com/authorize?client_id=" +
      clientId +
      "&redirect_uri=" +
      redirectUri +
      "&response_type=token"
    );
  },

  parseResponse: function (url) {
    var hash = url.hash;
    var response = this._parseHash(hash);
    if (response != null) {
      Config.setToken(response["access_token"]);
      Config.setExpiresAt(response["expires_in"]);
    }
  },

  _parseHash: function (hash) {
    if (!hash) {
      return null;
    }
    return hash
      .replace("#", "")
      .split("&")
      .map(function (el) {
        return el.split("=");
      })
      .reduce(function (acc, el) {
        acc[el[0]] = el[1];
        return acc;
      }, {});
  },
};

var Config = {
  setLastSearch: function (id) {
    localStorage.setItem("lastSearch", id);
    window.location.hash = id;
  },

  getLastSearch: function () {
    return (
      window.location.hash.substring(1) || localStorage.getItem("lastSearch")
    );
  },

  setExactSearch: function (useExact) {
    localStorage.setItem("exactSearch", useExact);
  },

  getExactSearch: function () {
    return localStorage.getItem("exactSearch") === "true";
  },

  getValidToken: function () {
    var expiresAt = parseInt(localStorage.getItem("token_expires_at"), 10);
    var token = localStorage.getItem("token");
    var now = Date.now();
    return !!token && !!expiresAt && expiresAt > now ? token : null;
  },

  setToken: function (accessToken) {
    localStorage.setItem("token", accessToken);
  },

  setExpiresAt: function (expiresIn) {
    var now = Date.now();
    var expiresAt = now + parseInt(expiresIn, 10) * 1000;
    localStorage.setItem("token_expires_at", expiresAt);
  },
};

function authenticate() {
  var authUrl = Auth.getAuthUrl(SITE_URL);
  window.location = authUrl;
}

if (location.search.indexOf("auth_callback") > 0) {
  Auth.parseResponse(location);
  window.location = SITE_URL;
}

var loginButton = document.querySelector("#login-button");

loginButton.addEventListener("click", authenticate);