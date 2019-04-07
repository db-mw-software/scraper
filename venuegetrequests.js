const request = require("request");
const fs = require('fs');
const delayInRequests = 1000;
const sep = '\t';
const showsFileName = './allshows.csv';
const artistsFileName = './allartists.csv';
const artistsNamesFileName = './artistsNames.json'
const venues = [
  { "name": "Lincoln Hall", "id": 513326 },
  { "name": "Riviera Theatre", "id": 1284 },
  { "name": "Metro", "id": 1070 },
  { "name": "Thalia Hall", "id": 1434818 },
  { "name": "Aragon Ballroom", "id": 837 },
  { "name": "Empty Bottle", "id": 251 },
];

fs.writeFile(artistsNamesFileName, '[', (error) => {
  if (error) console.log(`Error writing blank ${artistsNamesFileName}`, error);
  else
    fs.writeFile(artistsFileName, '', (error) => {
      if (error) console.log(`Error writing blank ${artistsFileName}`, error);
      else
        fs.writeFile(showsFileName, '', (error) => {
          if (error) console.log(`Error writing blank ${showsFileName}`, error);
          else (aVenue => getShowsFor(aVenue))(venues.length);
        });
    });
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
  appendToFile(shows, showsFileName, venueName);
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
    writeArtist(band.artist, separator);
  }
  return show;
}

function writeArtist(artist, separator) {
  const artistRow = artist.id + separator + artist.displayName + separator + artist.uri + '\n';
  appendToFile(artistRow, artistsFileName);
  appendToFile(`"${artist.displayName}",`, artistsNamesFileName);
}

function appendToFile(content, fileName, description = false) {
  fs.appendFile(fileName, content, (error) => {
    if (error) {
      console.log(`Error writing ${description ? description : fileName}:`, error);
    }
    else if (description) console.log(`Content for ${description} was saved successfully!`);
  });
}
