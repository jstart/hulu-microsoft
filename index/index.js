var restify = require('restify');
var builder = require('botbuilder');
require('dotenv').config()
var hulu = require('./hulu')

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
  var messageText = session.message.text
  if (messageText) {
    messageText = messageText.toLowerCase()
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    if (messageText.includes('popular') || messageText.includes('top') || messageText.includes('best')) {
      hulu.callPopular(senderID, function() {
        session.send("Welcome to HuluBot! You can search for content on Hulu by saying show me Handmaids Tale or search for Seinfeld. Here are the most popular shows on Hulu.")
        // messenger.sendGenericMessage(senderID, elements)
      });
    } else if (messageText.includes("help") || messageText.includes("support") || messageText.includes("can you") || messageText.includes("how do")) {
      session.send("You can say things like, search for Seinfeld, or tell me about The Handmaids Tale.")
    } else if (hulu.containsGenre(messageText)) {
      var genre = hulu.containsGenre(messageText)
      session.send("You can browse the " + genre.name + " genre on hulu.com" + genre.link)
    }  else {
      messageText = messageText.replace("search for", "").replace("tell me about", "").replace("find", "").replace("season", "").replace("seasons", "")
      hulu.search(messageText, function(results, speechOutput) {
        if (results == undefined) {
          session.send("Hmm, I can't find that show")
          return
        }
        // let elements = messenger.parseAsElements(results)
        session.send(speechOutput + " " + 'https://hulu.com/' + results.canonical_name)
        // messenger.sendGenericMessage(senderID, elements)
      })
    }
  }
});
