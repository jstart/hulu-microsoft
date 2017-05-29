'use strict'
// https://wiki.hulu.com/display/SEA/Search+API+Docs

const request = require('request');
const popularCache = require('./popular_shows')
const genres = require('./genres').data

exports.containsGenre = function(text) {
  for (let genre of genres) {
    if (text.includes(genre.genre.name.toLowerCase())) {
      return genre.genre
    }
  }
}

exports.callPopular = function (callback) {
  if (popularCache.data != undefined) {
    callback(popularCache)
    return
  }
  request('https://www.hulu.com/sapi/popular_shows?distro=apple&distroplatform=phone&items_per_page=5',
   function (error, response, body, popularCache) {
    if (!error && response.statusCode == 200) {
      popularCache = JSON.parse(body);
      callback(popularCache)
    } else {
      console.error("Unable to fetch popular shows.");
      console.error(response.statusCode);
      console.error(error);
    }
  });
}

exports.search = function (query, callback) {
  query = query.replace(/[^0-9a-zA-Z ]/g, '');
  request('http://www.hulu.com/sapi/search/shows?q=' + query,
   function (error, response, body) {
    var parsed = JSON.parse(body);
    if (parsed.data.length > 0) {
      var show = parsed.data[0].show

      var cardTitle = show.name;
      var cardContent = show.description;

      var pluralSeasons = 's'
      if (show.seasons_count == 1) {
        pluralSeasons = ''
      }
      var pluralEpisodes = 's'
      if (show.episodes_count == 1) {
        pluralEpisodes = ''
      }
      var speechOutput = show.name + ' has ' + show.seasons_count + ' season' + pluralSeasons + ' and ' + show.episodes_count + ' episode' + pluralEpisodes + ' available'
      callback(show, speechOutput)
    } else {
      console.error("Unable to search for " + query + body + parsed);
      console.error(response.statusCode);
      console.error(error);
      callback()
    }
  })
}
