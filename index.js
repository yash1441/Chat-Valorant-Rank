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

	const rankData = {
		rank: mmr_data.data.currenttierpatched,
	    	rr: mmr_data.data.ranking_in_tier,
	    	change: mmr_data.data.mmr_change_to_last_game,
	};

	if (req.query.onlyRank === 'true' && req.query.mmrChange === 'true') {
		res.send(`${rankData.rank} : ${rankData.rr} RR [${rankData.change}]`);
	} else if (req.query.onlyRank === 'true' && req.query.mmrChange != 'true') {
    		res.send(`${rankData.rank} : ${rankData.rr} RR`);
  	} else if (req.query.onlyRank  != 'true' && req.query.mmrChange === 'true') {
    		res.send(`${name}#${tag} [${rankData.rank}] : ${rankData.rr} RR [${rankData.change}]`);
  	} else {
    		res.send(`${name}#${tag} [${rankData.rank}] : ${rankData.rr} RR`);
  	}

	myConsole.log(`${region} ${name}#${tag} [${rankData.rank}] : ${rankData.rr} RR`);
});

app.listen(port, () => {
	myConsole.log(`Logged in.`)
});
