var Auth = {
  getAuthUrl: function (siteUrl) {
    var clientId = "9e5bc3ca56f746b49e1e1f7049706043";
    var redirectUri = encodeURIComponent(siteUrl + "?auth_callback");

    return (url =
      "https://accounts.spotify.com/authorize?client_id=" +
      clientId +
      "&redirect_uri=" +
      redirectUri +
      "&response_type=token");
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

    parsed = hash
      .replace("#", "")
      .split("&")
      .map(function (el) {
        return el.split("=");
      })
      .reduce(function (acc, el) {
        acc[el[0]] = el[1];
        return acc;
      }, {});

    return parsed;
  },
};
