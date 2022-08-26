const express = require('express');
const app = express();
const port = 3000;

const HenrikDevValorantAPI = require('unofficial-valorant-api');
const vapi = new HenrikDevValorantAPI();

app.get('/', (req, res) => {
	res.send('Stop snooping around >.>');
});

app.get('/valorant/:name/:tag', async (req, res, next) => {
	const name = req.params.name;
	const tag = req.params.tag;

	const mmr_data = await vapi.getMMR({
		version: 'v1',
		region: 'ap',
		name: name,
		tag: tag,
	});
	if (mmr_data.error)	{
		return res.send(`Error ${mmr_data.status}`);
	}

	// console.log(`[${mmr_data.data.currenttierpatched}] - ${mmr_data.data.ranking_in_tier} RR`);
	// console.log(`${name}#${tag}`);
	res.send(`${name}#${tag} [${mmr_data.data.currenttierpatched}] - ${mmr_data.data.ranking_in_tier} RR`);
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
});