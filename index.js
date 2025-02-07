const express = require("express");
const app = express();
const port = 3000;
const fetch = require("node-fetch");
const HenrikDevValorantAPI = require("unofficial-valorant-api");
const vapi = new HenrikDevValorantAPI(process.env.HENRIK_ADVANCE_KEY);

const github = "https://github.com/yash1441/Chat-Valorant-Rank/";
const cache = {};

app.get("/", (req, res) => {
	return res.send(
		`Please visit <a href="${github}">GitHub</a> to know how to use this API.`
	);
});

app.get("/valorant/:region?/:name/:tag", async (req, res, next) => {
	const { region = "ap", name, tag } = req.params;

	if ((name == "name" && tag == "tag") || region == "region") {
		return res.send(
			`Please visit <a href="${github}">GitHub</a> to know how to use this API.`
		);
	}

	const cacheKey = `${region}-${name}-${tag}`;
	const rankData = await getRankData(cacheKey, () =>
		vapi.getMMR({
			version: "v2",
			region,
			name,
			tag,
		})
	);

	if (!rankData.rank && !rankData.rr) {
		return res.send(
			`Either you haven't played any game recently or there could to be some error with the backend. You can track the status on bit.ly/henrikapistatus`
		);
	}

	res.send(formatRankData(req.query, name, tag, rankData));
	await sendMessage(
		`${region} ${name}#${tag} [${rankData.rank}] : ${rankData.rr} RR`
	);
	cache[cacheKey] = { data: rankData, timestamp: Date.now() };
});

app.get("/valorant-puuid/:region?/:puuid", async (req, res, next) => {
	const { region = "ap", puuid } = req.params;

	const cacheKey = `puuid-${puuid}`;
	const rankData = await getRankData(cacheKey, () =>
		vapi.getMMRByPUUID({
			version: "v2",
			region,
			puuid,
		})
	);

	if (!rankData.rank && !rankData.rr) {
		return res.send(
			`Either you haven't played any game recently or there could to be some error with the backend. You can track the status on bit.ly/henrikapistatus`
		);
	}

	res.send(formatRankData(req.query, rankData.name, rankData.tag, rankData));
	await sendMessage(
		`${region} ${rankData.name}#${rankData.tag}  [${rankData.rank}] : ${rankData.rr} RR *(PUUID)*`
	);
	cache[cacheKey] = { data: rankData, timestamp: Date.now() };
});

app.listen(port, () => {
	sendMessage(`Logged in.`);
});

async function getRankData(cacheKey, fetchFunction) {
	const cachedData = cache[cacheKey];
	if (cachedData && Date.now() - cachedData.timestamp < 300000) {
		return cachedData.data;
	}

	const mmr_data = await fetchFunction();
	if (mmr_data.error) {
		throw new Error(`Error: ${mmr_data.status}`);
	}

	return {
		rank: mmr_data.data.current_data.currenttierpatched,
		rr: mmr_data.data.current_data.ranking_in_tier,
		change: mmr_data.data.current_data.mmr_change_to_last_game,
		status: mmr_data.status,
		name: mmr_data.data.name,
		tag: mmr_data.data.tag,
	};
}

function formatRankData(query, name, tag, rankData) {
	if (query.onlyRank === "true" && query.mmrChange === "true") {
		return `${rankData.rank} : ${rankData.rr} RR [${rankData.change}]`;
	} else if (query.onlyRank === "true") {
		return `${rankData.rank} : ${rankData.rr} RR`;
	} else if (query.mmrChange === "true") {
		return `${name}#${tag} [${rankData.rank}] : ${rankData.rr} RR [${rankData.change}]`;
	} else {
		return `${name}#${tag} [${rankData.rank}] : ${rankData.rr} RR`;
	}
}

async function sendMessage(message) {
	try {
		const response = await fetch(process.env.WEBHOOK, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				content: message,
			}),
		});

		if (!response.ok) {
			throw new Error(
				`Failed to send message, status code: ${response.status}`
			);
		}

		console.log(message);
	} catch (error) {
		console.error("Error sending message:", error);
	}
}
