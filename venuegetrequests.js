const request = require("request");
const fs = require('fs');
const delayInRequests = 1000;
const sep = '\t';
const fileName = './allshows.csv';
const venues = [
  { "name": "Lincoln Hall", "id": 513326 },
  { "name": "Riviera Theatre", "id": 1284 },
  { "name": "Metro", "id": 1070 },
  { "name": "Thalia Hall", "id": 1434818 },
  { "name": "Aragon Ballroom", "id": 837 },
  { "name": "Empty Bottle", "id": 251 },
];

fs.writeFile(fileName, '', (error) => {
  if (error) {
    console.log(`Error writing blank ${fileName}`, error);
  } else {
    (aVenue => getShowsFor(aVenue))(venues.length);
  }
});

function getShowsFor(aVenue) {
  setTimeout(() => {
    const options = {
      method: 'GET',
      url: 'https://api.songkick.com/api/3.0/venues/' + venues[aVenue - 1].id + '/calendar.json',
      qs: { apikey: '1zxi7X202ZmTZfrj' }
    };
    request(options, (error, response, body) => {
      if (error) throw new Error(error);
      parseVenue(JSON.parse(body), venues[aVenue - 1].name);
      if (--aVenue) getShowsFor(aVenue);
    });
  }, delayInRequests);
}

function parseVenue(events, venueName) {
  const eventlist = events.resultsPage.results.event;
  let shows = '';
  for (let i = 0; i < eventlist.length; i++) {
    let event = eventlist[i];
    // concertID, title, datetime, venueID, venueName, ageRestriction, band1ID, band2iD, band3ID, band4ID, etc.
    if (event.type === 'Concert') {
      shows += concertRowFor(event, sep) + '\n';
    }
  }
  appendToFile(shows, venueName);
}

function concertRowFor(event, separator) {
  let show = event.id + separator;
  show += event.displayName + separator;
  show += (event.start.datetime ? event.start.datetime : event.start.date) + separator;
  show += event.venue.id + separator;
  show += event.venue.displayName + separator;
  show += event.ageRestriction + separator; //note could be null
  for (let band of event.performance) {
    show += band.id + separator;
  }
  return show;
}

function appendToFile(shows, venueName) {
  fs.appendFile(fileName, shows, (error) => {
    if (error) {
      console.log(`Error writing shows for ${venueName}:`, error);
    }
    console.log(`Shows for ${venueName} were saved successfully!`);
  });
}
