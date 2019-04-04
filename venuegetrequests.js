const request = require("request");
const fs = require('fs');
const venues = {
	"venues": [
		{
			"venueName": "Lincoln Hall",
			"id": 513326
		},
		{
			"venueName": "Riviera Theatre",
			"id": 1284
		},
		{
			"venueName": "Metro",
			"id": 1070
		},
		{
			"venueName": "Thalia Hall",
			"id": 1434818
		},
		{
			"venueName": "Aragon Ballroom",
			"id": 837
		},
		{
			"venueName": "Empty Bottle",
			"id": 251
		},
	]
};

console.log(venues);

for (let venue of venues.venues) {
	var options = {
		method: 'GET',
		url: 'https://api.songkick.com/api/3.0/venues/' + venue.id + '/calendar.json',
		qs: { apikey: '1zxi7X202ZmTZfrj' },
		headers:
		{
			'Postman-Token': '48eb1cdb-e961-4a57-bde9-b38a9412ccef',
			'cache-control': 'no-cache'
		}
	};


	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		let sep = "\t";
		let venuejson = JSON.parse(body);
		let eventlist = venuejson.resultsPage.results.event;
		let allshows = "";
		for (let i = 0; i < eventlist.length; i++) {
			let event = eventlist[i];
			//concertID, title, datetime, venueID, venueName, ageRestriction, band1ID, band2iD, band3ID, band4ID, etc.
			if (event.type === "Concert") {
				let show = event.id + sep;
				show += event.displayName + sep;
				show += (event.start.datetime ? event.start.datetime : event.start.date) + sep;
				show += event.venue.id + sep;
				show += event.venue.displayName + sep;
				show += event.ageRestriction + sep; //note could be null
				for (let band of event.performance) {
					show += band.id + sep;
				}
				show += "\n";
				allshows += show;
				show = "";
			}
		}
		fs.appendFile("./allshows.csv", allshows, function (err) {
			if (err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		});
	});
}

/*
//get request for Lincoln Hall
var options = { method: 'GET',
  url: 'https://api.songkick.com/api/3.0/venues/513326/calendar.json',
  qs: { apikey: '1zxi7X202ZmTZfrj' },
  headers:
   { 'Postman-Token': '48eb1cdb-e961-4a57-bde9-b38a9412ccef',
     'cache-control': 'no-cache' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

	fs.writeFile("./lincolnhall.json", body, function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	});
//  console.log(JSON.parse(body));
});*/