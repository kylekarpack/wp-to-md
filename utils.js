class Utils {

	/**
	 * Pad the start of a date part so that all numbers are two characters long
	 * @param  {number} n
	 * @returns {string}
	 * @example padDatePart(3); // returns "03"
	 */
	static padDatePart(n) {
		return String(n).padStart(2, "0");
	}

	/**
	 * Generate a slug from a given date
	 * @param  {Date} date
	 * @returns {string}
	 * @example dateify(new Date()); // returns "YYYY-MM-DD"
	 */
	static dateify(date) {
		if (!date) {
			return "";
		}

		if (typeof date === "string") {
			date = new Date(date);
		}

		return `${date.getFullYear()}-${Utils.padDatePart(date.getMonth() + 1)}-${Utils.padDatePart(date.getDate())}`;
	}

	/**
	 * Generate a URL slug from a given input text
	 * @param  {string} text=""
	 * @returns {string}
	 * @example slugify("It's some test text"); // returns "its-some-test-text"
	 */
	static slugify(text = "") {
		return text.toString().toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^\w\-]+/g, "")
			.replace(/\-\-+/g, "-")
			.replace(/^-+/, "")
			.replace(/-+$/, "")
	}

	/**
	 * Flatten an object
	 * @param  {Object} obj
	 * @returns {Object}
	 * @example flattenObject({ a: 1, b: { c: 2 } }); // returns { a: 1, c: 2 }
	 */
	static flattenObject(obj) {

		if (!obj) {
			return obj;
		}

		const flattened = {}

		Object.keys(obj).forEach((key) => {
			if (typeof obj[key] === "object" && obj[key] !== null) {
				Object.assign(flattened, Utils.flattenObject(obj[key]))
			} else {
				flattened[key] = obj[key]
			}
		})

		return flattened
	}
}

module.exports = Utils;