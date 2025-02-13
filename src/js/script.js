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
      SPOTIFY_API + "/me/top/tracks?time_range=long_term&limit=10",
      function (error, data) {
        if (error) {
          console.error("Error fetching top tracks:", error);
          return;
        }
        console.log("Top Tracks:", data.items);
        var container = document.querySelector(".top-items.tracks.long");
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

    this.sendRequest(
      SPOTIFY_API + "/me/top/tracks?time_range=medium_term&limit=10",
      function (error, data) {
        if (error) {
          console.error("Error fetching top tracks:", error);
          return;
        }
        console.log("Top Tracks:", data.items);
        var container = document.querySelector(".top-items.tracks.medium");
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

    this.sendRequest(
      SPOTIFY_API + "/me/top/tracks?time_range=short_term&limit=10",
      function (error, data) {
        if (error) {
          console.error("Error fetching top tracks:", error);
          return;
        }
        console.log("Top Tracks:", data.items);
        var container = document.querySelector(".top-items.tracks.short");
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
      SPOTIFY_API + "/me/top/artists?time_range=long_term&limit=10",
      function (error, data) {
        if (error) {
          console.error("Error fetching top artists:", error);
          return;
        }
        console.log("Top Artists:", data.items);
        var container = document.querySelector(".top-items.artists.long");
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

    this.sendRequest(
      SPOTIFY_API + "/me/top/artists?time_range=medium_term&limit=10",
      function (error, data) {
        if (error) {
          console.error("Error fetching top artists:", error);
          return;
        }
        console.log("Top Artists:", data.items);
        var container = document.querySelector(".top-items.artists.medium");
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

    this.sendRequest(
      SPOTIFY_API + "/me/top/artists?time_range=short_term&limit=10",
      function (error, data) {
        if (error) {
          console.error("Error fetching top artists:", error);
          return;
        }
        console.log("Top Artists:", data.items);
        var container = document.querySelector(".top-items.artists.short");
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
    console.log(url)
    var hash = url.hash;
    console.log(hash)
    var response = this._parseHash(hash);
    console.log(response)
    if (response) {
      console.log("Requesting APIs...")
      Config.setToken(response["access_token"]);
      Config.setExpiresAt(response["expires_in"]);
      SpotifyApi.getUserProfile();
      SpotifyApi.getTopTracks();
      SpotifyApi.getTopArtists();
      document
        .querySelector("#login-button")
        .style.display="none"

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
  Auth.parseResponse(location);
  window.location(SITE_URL);
  document.querySelector("#container").style.display = "flex";
} else {
  if (Config.getValidToken()) {
    SpotifyApi.getUserProfile();
    SpotifyApi.getTopTracks();
    SpotifyApi.getTopArtists();
    document.querySelector("#container").style.display = "flex";
  }
}

document.querySelector("#login-button").addEventListener("click", authenticate);
