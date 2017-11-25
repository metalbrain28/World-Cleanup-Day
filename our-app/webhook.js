"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const rp = require('request-promise');
const _ = require("underscore");
const env = require('node-env-file');
const path = require('path');
const randomstring = require("randomstring");
env(__dirname + '/.env');

const apiaiApp = require('apiai')(process.env.APIAI_TOKEN);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve('./web')));

/* For Facebook Validation */
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'asdf1234') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach((entry) => {
          entry.messaging.forEach((event) => {
              console.log(event);
            if (event.message && event.message.text) {
              sendMessage(event);
            } else if (event.postback && event.postback.title) {
                event.message = {"text": event.postback.title};
                sendMessage(event);
            }
          });
        });
        res.status(200).end();
    }
});

function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  let apiai = apiaiApp.textRequest(text, {
    sessionId: randomstring.generate(10) // use any arbitrary id
  });

  apiai.on('response', (response) => {
    let aiText = response.result.fulfillment.speech;

    request({
        uri: 'https://graph.facebook.com/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
          recipient: {id: sender},
          message: {text: aiText}
        }
      }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
  });

  apiai.on('error', (error) => {
    console.log(error);
  });

  apiai.end();
}

/* Trigger bot for users with the id for request */
app.post('/send-message', (req, res) => {
    let usersIds = [],
        usersEmails = req.body.emails,
        message = req.body.message;

    let usersReqOptions = {
        url: 'https://www.facebook.com/scim/v1/Users',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'},
        json: true
    };

    /* Get the list of all users from facebook api */
    rp(usersReqOptions)
        .then((responseBody) => {
            let allUsers = responseBody.Resources;

            /* Receive all the users ids */
            usersIds = findUsersIds(allUsers, usersEmails);

            /* Send the message to all requested users */
            broadcastMessage(res, usersIds, message);
        })
        .catch((err) => {
            console.log("ERROR");
            console.log(err);
            res.status(400).send();
        });
});

/**
 * Get the requested users ids
 * @param {[]} allUsers - the users list returned by facebook
 * @param {[]} usersEmails - the received list of emails from request
 * @returns an array with all the ids found matching
 */
function findUsersIds(allUsers, usersEmails) {
    return _.pluck(
        _.filter(allUsers, (user) => {
            let crtUserEmails = _.pluck(user.emails, 'value');
            return _.filter(usersEmails, (userEmail) => {
                for (let i in crtUserEmails) {
                    if (crtUserEmails[i].match(userEmail)) {
                        return 1;
                    }
                }
                return 0;
            })[0];
        }), 'id');
}

/**
 * Send the message to all the users having the ids in usersIds
 * @param {{}} response - the "res" from caller function
 * @param {[]} usersIds - the ids of the users you want to send the message to
 * @param {{}|string} message - the message to be sent
 */
function broadcastMessage(response, usersIds, message) {
    message = typeof message === "object" ? message : {"text": message};

    let options = {
        method: 'POST',
        url: 'https://graph.facebook.com/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'},
        json: {
            recipient: {id: null},
            message: message
        }
    };

    let count = 0;
    _.map(usersIds, (id) => {
        options.json.recipient.id = id;

        /* Send the message to the user having the id {id} */
        rp(options)
            .then(() => {
                if (++count === usersIds.length) {
                    response.status(200).send("Message sent successfully!");
                }
            })
            .catch((err) => {
                console.log("ERROR");
                console.log(err);
                response.status(400).send();
            });
    });
}

/* This keeps the app running in case there's an error */
process.on('uncaughtException', function (err) {
    console.log(err);
}); 

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
