const express = require('express');
const app = express();
const port = 3000;
const fs = require("fs");
const HenrikDevValorantAPI = require('unofficial-valorant-api');

const vapi = new HenrikDevValorantAPI(INPUT_YOUR_HENRIKDEV_KEY_HERE);
const github = "https://github.com/yash1441/Chat-Valorant-Rank/";
const myConsole = new console.Console(fs.createWriteStream('./output.txt', { flags: 'a' }));

app.get('/', (req, res) => {
	return res.send(`Please visit <a href="${github}">GitHub</a> to know how to use this API.`);
});

app.get('/valorant/:region?/:name/:tag', async (req, res, next) => {
	const name = req.params.name;
	const tag = req.params.tag;
	let region = req.params.region;

	if (name == "name" && tag == "tag") {
		return res.send(`Please visit <a href="${github}">GitHub</a> to know how to use this API.`);
	}

	if (!region) region = 'ap';

	const mmr_data = await vapi.getMMR({
		version: 'v1',
		region: region,
		name: name,
		tag: tag
	});

	if (mmr_data.error) {
		res.send(`Error ${mmr_data.status}`);
		return myConsole.log(`${region} ${name}#${tag} Error: ${mmr_data.status}`);
	}

	if (req.query.onlyRank === "true") {
		res.send(`${mmr_data.data.currenttierpatched} - ${mmr_data.data.ranking_in_tier} RR`);
	} else res.send(`${name}#${tag} [${mmr_data.data.currenttierpatched}] - ${mmr_data.data.ranking_in_tier} RR`);

	myConsole.log(`${region} ${name}#${tag} [${mmr_data.data.currenttierpatched}] - ${mmr_data.data.ranking_in_tier} RR`);
});

app.listen(port, () => {
	myConsole.log(`Logged in.`)
});
