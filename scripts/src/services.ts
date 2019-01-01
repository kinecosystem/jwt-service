import * as moment from "moment";
import { readFileSync } from "fs";
import * as jsonwebtoken from "jsonwebtoken";
import * as axios from "axios";
import { Request, Response, RequestHandler } from "express";

import { getDefaultLogger } from "./logging";
import { randomItem, path } from "./utils";
import { getConfig } from "./config";

class KeyMap extends Map<string, { algorithm: string; key: Buffer; }> {
	public random() {
		const entries = Array.from(this.entries()).map(([id, key]) => ({
			id,
			key: key.key,
			algorithm: key.algorithm
		}));

		return randomItem(entries);
	}
}

const CONFIG = getConfig();
const PRIVATE_KEYS = new KeyMap();
const PUBLIC_KEYS = new Map<string, string>();

export type BaseRequest = Request & {
	query: {
		user_id?: string;
		device_id?: string;
	}
};

export type RegisterRequest = BaseRequest & {
	query: {
		iat?: string;
		exp?: string;
	}
};

export const getRegisterJWT = function(req: RegisterRequest, res: Response) {
	if (req.query.user_id) {
		const data = {
			user_id: req.query.user_id
		} as any;

		if (req.query.device_id) {
			data.device_id = req.query.device_id;
		}

		if (req.query.iat) {
			data.iat = parseInt(req.query.iat, 10);
		}

		if (req.query.exp) {
			data.exp = parseInt(req.query.exp, 10);
		}

		res.status(200).json({ jwt: sign("register", data) });
	} else {
		res.status(400).send({ error: "'user_id' query param is missing" });
	}
} as any as RequestHandler;

export type EarnRequest = BaseRequest & {
	query: {
		offer_id: string;
		nonce?: string;
	}
};

export const getEarnJWT = function(req: EarnRequest, res: Response) {
	if (req.query.offer_id && req.query.user_id) {
		const offer = getOffer(req.query.offer_id);

		if (!offer) {
			res.status(400).send({ error: `cannot find offer with id '${ req.query.offer_id }'` });
		} else if (offer.type !== "earn") {
			res.status(400).send({ error: "requested offer is not an earn one" });
		} else {
			const data = {
				offer: { id: offer.id, amount: offer.amount },
				recipient: {
					user_id: req.query.user_id,
					title: offer.title,
					description: offer.description
				}
			} as any;

			if (req.query.device_id) {
				data.device_id = req.query.device_id;
			}
			if (req.query.device_id) {
				Object.assign(data.recipient, { device_id: req.query.device_id });
			}

			res.status(200).json({
				jwt: sign("earn", data, req.query.nonce)
			});
		}
	} else {
		res.status(400).send({ error: "'offer_id' and/or 'user_id' query param is missing" });
	}
} as any as RequestHandler;

export type SpendRequest = BaseRequest & {
	query: {
		offer_id: string;
		nonce?: string;
	}
};

export const getSpendJWT = function(req: SpendRequest, res: Response) {
	if (req.query.offer_id) {
		const offer = getOffer(req.query.offer_id);

		if (!offer) {
			res.status(400).send({ error: `cannot find offer with id '${ req.query.offer_id }'` });
		} else if (offer.type !== "spend") {
			res.status(400).send({ error: "requested offer is not an spend one" });
		} else {
			const payload = {
				offer: { id: offer.id, amount: offer.amount },
				sender: {
					user_id: req.query.user_id,
					device_id: req.query.device_id,
					title: offer.title,
					description: offer.description
				}
			};
			if (req.query.user_id) {
				Object.assign(payload.sender, { user_id: req.query.user_id });
			}

			if (req.query.device_id) {
				Object.assign(payload.sender, { device_id: req.query.device_id });
			}

			res.status(200).json({ jwt: sign("spend", payload, req.query.nonce) });
		}
	} else {
		res.status(400).send({ error: "'offer_id' query param is missing" });
	}
} as any as RequestHandler;

export type P2PRequest = BaseRequest & {
	query: {
		offer_id: string;
		amount: number;
		sender_title: string;
		sender_description: string;
		recipient_id: string;
		recipient_title: string;
		recipient_description: string;

		nonce?: string;
	}
};

export const getP2PJWT = function(req: P2PRequest, res: Response) {
	const missing = [
		"offer_id",
		"amount",
		"sender_title",
		"sender_description",
		"recipient_id",
		"recipient_title",
		"recipient_description"].filter(name => req.query[name] === undefined);

	if (missing.length > 0) {
		res.status(400).send({ error: missing.join(", ") + " query params are missing" });
	} else {
		const payload = {
			offer: {
				id: req.query.offer_id,
				amount: req.query.amount
			},
			sender: {
				title: req.query.sender_title,
				description: req.query.sender_description
			},
			recipient: {
				user_id: req.query.recipient_id,
				title: req.query.recipient_title,
				description: req.query.recipient_description
			}
		} as any;

		if (req.query.user_id) {
			Object.assign(payload.sender, { user_id: req.query.user_id });
		}

		if (req.query.device_id) {
			Object.assign(payload.sender, { device_id: req.query.device_id });
		}

		res.status(200).json({ jwt: sign("pay_to_user", payload, req.query.nonce) });
	}
} as any as RequestHandler;

export const getOffers = function(req: Request, res: Response) {
	res.status(200).send({ offers: CONFIG.offers });
} as any as RequestHandler;

export type ArbitraryPayloadRequest = Request & {
	body: {
		subject: string;
		payload: { [key: string]: any };
	}
};

export const signArbitraryPayload = function(req: ArbitraryPayloadRequest, res: Response) {
	if (req.body.subject && req.body.payload) {
		res.status(200).json({ jwt: sign(req.body.subject, req.body.payload) });
	} else {
		res.status(400).send({ error: "missing 'subject' and/or 'payload' in request body" });
	}
} as any as RequestHandler;

export type ValidateRequest = Request & {
	query: {
		jwt: string;
	}
};

export type JWTContent = {
	header: {
		typ: string;
		alg: string;
		kid: string;
	};
	payload: any;
	signature: string;
};

async function getPublicKey(kid: string): Promise<string> {
	let publicKey = PUBLIC_KEYS.get(kid);
	if (publicKey) {
		getDefaultLogger().info(`found public key ${ kid } locally`);
	} else if (CONFIG.marketplace_service) {
		// try to get key from marketplace service
		const res = await axios.default.get(`${ CONFIG.marketplace_service }/v1/config`);
		for (const key of Object.keys(res.data.jwt_keys)) {
			PUBLIC_KEYS.set(key, res.data.jwt_keys[key].key);
		}
		publicKey = PUBLIC_KEYS.get(kid);
		if (publicKey) {
			getDefaultLogger().info(`found public key ${ kid } from remote`);
		}
	}
	if (!publicKey) {
		getDefaultLogger().error(`did not find public key ${ kid }`);
		throw new Error(`no key for kid ${ kid }`);
	}
	return publicKey;
}

export const validateJWT = async function(req: ValidateRequest, res: Response) {
	const decoded = jsonwebtoken.decode(req.query.jwt, { complete: true }) as JWTContent;
	try {
		const publicKey = await getPublicKey(decoded.header.kid);
		jsonwebtoken.verify(req.query.jwt, publicKey); // throws
		res.status(200).json({ is_valid: true });
	} catch (e) {
		res.status(200).json({ is_valid: false, error: e });
	}
} as any as RequestHandler;

function sign(subject: string, payload: any, nonce?: string) {
	const signWith = PRIVATE_KEYS.random();

	payload = Object.assign({
		iss: getConfig().app_id,
		exp: moment().add(6, "hours").unix(),
		iat: moment().unix(),
		sub: subject
	}, payload);

	if (nonce) {
		payload.nonce = nonce;
	}

	return jsonwebtoken.sign(payload, signWith.key, {
		header: {
			kid: signWith.id,
			alg: signWith.algorithm,
			typ: "JWT"
		}
	});
}

function getOffer(id: string): any | null {
	for (const offer of CONFIG.offers) {
		if (offer.id === id) {
			return offer;
		}
	}

	return null;
}

// init
(() => {
	Object.entries(CONFIG.private_keys).forEach(([name, key]) => {
		PRIVATE_KEYS.set(name, { algorithm: key.algorithm, key: readFileSync(path(key.file)) });
	});
	Object.entries(CONFIG.public_keys).forEach(([name, key]) => {
		PUBLIC_KEYS.set(name, readFileSync(path(key), "utf-8"));
	});
})();
