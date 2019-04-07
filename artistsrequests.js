const fs = require('fs');
const request = require('request');
const sep = '\t';
const delayInRequests = 1000;
const artistsFileName = './allartists_more_details.csv';

let artists;

fs.readFile('./allartists.csv', function (err, data) {
  if (err) throw err;
  artists = data.toString().trim().split('\n');
  fs.writeFile(artistsFileName, '', (error) => {
    if (error) console.log(`Error writing blank ${artistsFileName}`, error);
    else (anArtist => getDetailsFor(anArtist))(artists.length);
  });
});

function getDetailsFor(anArtist) {
  setTimeout(() => {
    let artistName = artists[anArtist - 1].split(sep)[1];
    const options = {
      method: 'GET',
      url: 'https://app.ticketmaster.com/discovery/v2/attractions',
      qs: {
        apikey: 'JNlFytOL0UkGGCbuStweJy2cCiz76nGY',
        keyword: artistName,
        segmentId: 'KZFzniwnSyZfZ7v7nJ'
      }
    };
    request(options, (error, response, body) => {
      if (error) throw new Error(error);
      parseArtist(JSON.parse(body), artists[anArtist - 1]);
      if (--anArtist) getDetailsFor(anArtist);
    });
  }, delayInRequests);
}

function parseArtist(artistsResponse, artistCSVRow) {
  if (artistsResponse.hasOwnProperty('_embedded')) {
    let attractions = artistsResponse['_embedded']['attractions'];
    if (attractions) {
      artistCSVRow += sep + extractAdditionDetailsFor(attractions[0]);
    }
    artistCSVRow += '\n';
    appendToFile(artistCSVRow, artistsFileName, artistCSVRow.split(sep)[1]);
  }
}

function extractAdditionDetailsFor(attraction) {
  let details = attraction['name'] + sep;
  details += attraction['classifications'][0]['genre']['name'] + sep;
  details += attraction['classifications'][0]['subGenre']['name'] + sep;

  for (let image of attraction['images']) {
    if (image['ratio'] === '16_9' && image['width'] === 1024) {
      details += image.url;
    }
  }
  console.log(details);
  return details;
}

function appendToFile(content, fileName, description = false) {
  fs.appendFile(fileName, content, (error) => {
    if (error) {
      console.log(`Error writing ${description ? description : fileName}:`, error);
    }
    else if (description) console.log(`Content for ${description} was saved successfully!`);
  });
}
