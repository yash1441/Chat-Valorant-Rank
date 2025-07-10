const http = require("http");
const url = require("url");
const fetch = require("node-fetch");
const HenrikDevValorantAPI = require("unofficial-valorant-api");

const vapi = new HenrikDevValorantAPI(process.env.HENRIK_ADVANCE_KEY);
const cache = {};

const server = http.createServer(async (req, res) => {
	const parsedUrl = url.parse(req.url, true);
	const parts = parsedUrl.pathname.split("/").filter(Boolean);
	const query = parsedUrl.query;

	res.writeHead(200, { "Content-Type": "text/plain" });

	// Root
	if (parsedUrl.pathname === "/") {
		return res.end("Root is working!");
	}

	// Health check
	if (parsedUrl.pathname === "/health") {
		return res.end("It works! ✅");
	}

	// /puuid/:region/:puuid
	if (parts[0] === "puuid" && parts.length === 3) {
		const region = parts[1];
		const puuid = parts[2];

		const cacheKey = `puuid-${puuid}`;
		try {
			const rankData = await getRankData(cacheKey, () =>
				vapi.getMMRByPUUID({ version: "v2", region, puuid })
			);

			const formatted = formatRankData(
				query,
				rankData.name,
				rankData.tag,
				rankData
			);
			res.end(formatted);

			if (process.env.WEBHOOK) {
				await sendMessage(
					`${region} ${rankData.name}#${rankData.tag} [${rankData.rank}] : ${rankData.rr} RR *(PUUID)*`
				);
			}
		} catch (error) {
			return res.end("Error: " + error.message);
		}
		return;
	}

	// /:region/:name/:tag
	if (parts.length === 3) {
		const region = parts[0];
		const name = parts[1];
		const tag = parts[2];

		const cacheKey = `${region}-${name}-${tag}`;
		try {
			const rankData = await getRankData(cacheKey, () =>
				vapi.getMMR({ version: "v2", region, name, tag })
			);

			const formatted = formatRankData(
				query,
				rankData.name,
				rankData.tag,
				rankData
			);
			res.end(formatted);

			if (process.env.WEBHOOK) {
				await sendMessage(
					`${region} ${rankData.name}#${rankData.tag} [${rankData.rank}] : ${rankData.rr} RR`
				);
			}
		} catch (error) {
			return res.end("Error: " + error.message);
		}
		return;
	}

	// Fallback
	res.end("Invalid route.");
});

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

async function getRankData(cacheKey, fetchFunction) {
	const cached = cache[cacheKey];
	if (cached && Date.now() - cached.timestamp < 300000) {
		return cached.data;
	}

	const mmr_data = await fetchFunction();
	if (mmr_data.error || !mmr_data.data?.current_data?.currenttierpatched) {
		throw new Error(
			`Either you haven't played any game recently or there could to be some error with the backend. You can track the status on bit.ly/henrikapistatus`
		);
	}

	const data = {
		rank: mmr_data.data.current_data.currenttierpatched,
		rr: mmr_data.data.current_data.ranking_in_tier,
		change: mmr_data.data.current_data.mmr_change_to_last_game,
		status: mmr_data.status,
		name: mmr_data.data.name,
		tag: mmr_data.data.tag,
	};

	cache[cacheKey] = { data, timestamp: Date.now() };
	return data;
}

async function sendMessage(message, retries = 3, delay = 1000) {
	try {
		const res = await fetch(process.env.WEBHOOK, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content: message }),
		});

		if (!res.ok && res.status === 429 && retries > 0) {
			const retryAfter = res.headers.get("Retry-After");
			const retryDelay = retryAfter ? parseInt(retryAfter) * 1000 : delay;
			await new Promise((r) => setTimeout(r, retryDelay));
			return sendMessage(message, retries - 1, delay * 2);
		}

		if (!res.ok) {
			throw new Error(`Webhook failed with status ${res.status}`);
		}

		console.log("Webhook sent:", message);
	} catch (err) {
		console.error("Webhook error:", err.message);
	}
}

server.listen(); // Passenger handles port binding
