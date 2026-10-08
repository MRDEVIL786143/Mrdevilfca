const login = require('./Mr Devil'); // yahan FCA ka folder name likha hai
const fs = require('fs');

// appstate.json se cookies load karo
const appState = JSON.parse(
  fs.readFileSync('./appstate.json', 'utf8')
);

login(appState, (err, api) => {
  if (err) return console.error(err);

  // Events sunna enable karo
  api.setOptions({ listenEvents: true });

  // Messages sunna shuru karo
  const stopListening = api.listenMqtt((err, event) => {
    if (err) return console.error(err);

    switch (event.type) {
      case 'message':

        // Agar koi "uid" likhe
        if (event.body === 'uid') {
          api.sendMessage(
            'Your UID: ' + event.senderID,
            event.threadID
          );
        }

        // Agar koi "stop" likhe
        else if (event.body === 'stop') {
          api.sendMessage(
            'Listening stopped',
            event.threadID
          );
          // stopListening();
        }

        // Agar koi ".uid @mention" likhe
        else if (event.body && event.body.startsWith('.uid ')) {
          if (event.mentions && Object.keys(event.mentions).length > 0) {
            let reply = 'UIDs:\n';

            for (let id in event.mentions) {
              reply += event.mentions[id] + ': ' + id + '\n';
            }

            api.sendMessage(reply, event.threadID);
          } else {
            api.sendMessage(
              'Please mention someone to get their UID.',
              event.threadID
            );
          }
        }
        break;
    }
  });
});
