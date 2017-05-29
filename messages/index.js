

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var hulu = require('./hulu')

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}

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
      session.send("You can browse the " + genre.name + " genre on Hulu.com")
    }  else {
      messageText = messageText.replace("search for", "").replace("tell me about", "").replace("find", "").replace("season", "").replace("seasons", "")
      hulu.search(messageText, function(results, speechOutput) {
        // let elements = messenger.parseAsElements(results)
        session.send(speechOutput + " " + 'https://hulu.com/' + results.canonical_name)
        // messenger.sendGenericMessage(senderID, elements)
      })
    }
  }
});
