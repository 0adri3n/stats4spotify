var SITE_URL = "https://0adri3n.github.io/stats4spotify";
var SPOTIFY_API = "https://api.spotify.com/v1";

var SpotifyApi = {
  sendRequest: function (url, callback) {
    var accessToken = Config.getValidToken();
    if (accessToken == null) {
      console.error("Unauthorized: No valid token");
      callback("unauthorised");
      return;
    }
    d3.json(url)
      .header("Authorization", "Bearer " + accessToken)
      .get(callback);
  },

  getUserProfile: function () {
    this.sendRequest(SPOTIFY_API + "/me", function (error, data) {
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      console.log("User Profile:", data);
      document.querySelector(".profile img").src =
        data.images[0]?.url || "default.png";
      document.querySelector(".profile h2").textContent = data.display_name;
      document.querySelector(
        ".profile p"
      ).textContent = `Followers: ${data.followers.total}`;
    });
  },

  getTopTracks: function () {
    this.sendRequest(
      SPOTIFY_API + "/me/top/tracks?limit=5",
      function (error, data) {
        if (error) {
          console.error("Error fetching top tracks:", error);
          return;
        }
        console.log("Top Tracks:", data.items);
        var container = document.querySelector(".top-items.tracks");
        container.innerHTML = "";
        data.items.forEach((track) => {
          container.innerHTML += `
          <div class="top-item">
            <img src="${track.album.images[0]?.url}" alt="Track">
            <p>${track.name}</p>
          </div>
        `;
        });
      }
    );
  },

  getTopArtists: function () {
    this.sendRequest(
      SPOTIFY_API + "/me/top/artists?limit=5",
      function (error, data) {
        if (error) {
          console.error("Error fetching top artists:", error);
          return;
        }
        console.log("Top Artists:", data.items);
        var container = document.querySelector(".top-items.artists");
        container.innerHTML = "";
        data.items.forEach((artist) => {
          container.innerHTML += `
          <div class="top-item">
            <img src="${artist.images[0]?.url}" alt="Artist">
            <p>${artist.name}</p>
          </div>
        `;
        });
      }
    );
  },
};

var Auth = {
  getAuthUrl: function (siteUrl) {
    var clientId = "9e5bc3ca56f746b49e1e1f7049706043";
    var redirectUri = encodeURIComponent(siteUrl + "/index.html");
    return `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=user-read-private user-read-email user-top-read`;
  },

  parseResponse: function (url) {
    var hash = url.hash;
    console.log(hash)
    var response = this._parseHash(hash);
    
    if (response) {
      console.log("Requesting APIs...")
      Config.setToken(response["access_token"]);
      Config.setExpiresAt(response["expires_in"]);
      SpotifyApi.getUserProfile();
      SpotifyApi.getTopTracks();
      SpotifyApi.getTopArtists();
      console.log(Config)
    }
  },

  _parseHash: function (hash) {
    if (!hash) return null;
    return hash
      .replace("#", "")
      .split("&")
      .reduce((acc, el) => {
        let [key, value] = el.split("=");
        acc[key] = value;
        return acc;
      }, {});
  },
};

var Config = {
  getValidToken: function () {
    var expiresAt = parseInt(localStorage.getItem("token_expires_at"), 10);
    var token = localStorage.getItem("token");
    var now = Date.now();
    return token && expiresAt > now ? token : null;
  },

  setToken: function (accessToken) {
    localStorage.setItem("token", accessToken);
  },

  setExpiresAt: function (expiresIn) {
    var now = Date.now();
    localStorage.setItem(
      "token_expires_at",
      now + parseInt(expiresIn, 10) * 1000
    );
  },
};

function authenticate() {
  window.location = Auth.getAuthUrl(SITE_URL);
}

if (location.hash) {
  console.log(location)
  Auth.parseResponse(location.hash);
} else {
  if (Config.getValidToken()) {
    SpotifyApi.getUserProfile();
    SpotifyApi.getTopTracks();
    SpotifyApi.getTopArtists();
  }
}

document.querySelector("#login-button").addEventListener("click", authenticate);
