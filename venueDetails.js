const fs = require('fs');
const request = require('request');
const sep = '\t';
const delayInRequests = 500;
const venueDetailsFileName = './venueDetails.tsv';

const venues = [
  { "name": "Lincoln Hall", "id": 513326 },
  { "name": "Riviera Theatre", "id": 1284 },
  { "name": "Metro", "id": 1070 },
  { "name": "Thalia Hall", "id": 1434818 },
  { "name": "Aragon Ballroom", "id": 837 },
  { "name": "Empty Bottle", "id": 251 },
];

fs.writeFile(venueDetailsFileName, '', (error) => {
  if (error) console.log(`Error writing blank ${venueDetailsFileName}`, error);
  else (aVenue => getDetailsFor(aVenue))(venues.length);
});


function getDetailsFor(aVenue) {
  setTimeout(() => {
    const options = {
      method: 'GET',
      url: 'https://api.songkick.com/api/3.0/venues/' + venues[aVenue - 1].id + '.json?apikey=1zxi7X202ZmTZfrj',
      qs: { apikey: '1zxi7X202ZmTZfrj' }
    };
    request(options, (error, response, body) => {
      if (error) throw new Error(error);
      parseVenue(JSON.parse(body), venues[aVenue - 1].name);
      if (--aVenue) getDetailsFor(aVenue);
    });
  }, delayInRequests);
}

function parseVenue(events, venueName) {
  const venue = events.resultsPage.results.venue;
  let details = venue.id + sep + venue.displayName + sep + venue.street + sep + 
    venue.city.displayName + sep + venue.city.state.displayName + sep + 
    venue.zip + sep + venue.website + sep + venue.phone + sep + 
    venue.capacity + sep + venue.uri + '\n';
  appendToFile(details, venueDetailsFileName, venueName);
}

function appendToFile(content, fileName, description = false) {
  fs.appendFile(fileName, content, (error) => {
    if (error) {
      console.log(`Error writing ${description ? description : fileName}:`, error);
    }
    else if (description) console.log(`Content for ${description} was saved successfully!`);
  });
}
