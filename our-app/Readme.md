Setup steps:

$ npm install
$ ln -s node-modules web/vendor
(sau windows, cmder: λ mklink /j web\vendor\ node_modules\ )


Run:

$ node webhook.js
$ ngrok http 8000 (make it public, so facebook can access it)



Webhook bot part:

- In the facebook integration app, add the http://<ngrok_link>/webhook
- In the .env file:
	- PAGE_ACCESS_TOKEN is the one provided by api.ai (now dialogflow.com), for your messenger integration.
	- APIAI_TOKEN - in dialogflow, check you templace's settings, and there is a "Client access token
" there. That is the one in there.



Interface part:

- Used for spamming speciffic individuals (by knowing their email);
- If you access that ngrok provided link in your browser, there will be an interface with an email field (or you can add more email fields), and a textbox for the message you want to send.
- If you press 'Send', the Bot will message those indivisuals.
- The Bot should have enough rights to be able to spam people.
