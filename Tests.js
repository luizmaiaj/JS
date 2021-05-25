var unirest = require("unirest");

var req = unirest("GET", "https://nutritionix-api.p.rapidapi.com/v1_1/item");

req.query({
	"upc": "49000036756"
});

req.headers({
	"x-rapidapi-key": "16e2c1a827msh446d04107881719p157391jsn1e65b9bed8af",
	"x-rapidapi-host": "nutritionix-api.p.rapidapi.com",
	"useQueryString": true
});


req.end(function (res) {
	if (res.error) throw new Error(res.error);

	console.log(res.body);
});
