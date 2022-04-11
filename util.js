const isProd = process.env.NODE_ENV === "production";

const emailRegex
  = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const uuidRegex
  = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const timestampRegex
  = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/;

function rowToObject (row) {
	const result = {};

	Object.keys(row).forEach((key) => {
		result[snakeToCamel(key)] = row[key];
	});

	return result;
}

function snakeToCamel (string) {
	const tokens = string.split("_");

	for (let i = 1; i < tokens.length; i++) {
		tokens[i] = tokens[i].charAt(0).toUpperCase() + tokens[i].slice(1);
	}

	return tokens.join("");
}

function asyncWrapper(f) {
	return async (req, res, next) => {
		try {
			await f(req, res, next);
		}
		catch (error) {
			next(error);
		}
	};
}

module.exports = {
	isProd,
	emailRegex,
	uuidRegex,
	timestampRegex,
	rowToObject,
	asyncWrapper
};
