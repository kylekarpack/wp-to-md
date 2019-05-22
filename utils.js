class Utils {
	pad(n) {
		return String(n).padStart(2, "0");
	}

	dateify(date) {
		if (!date) {
			return "";
		}

		if (typeof date === "string") {
			date = new Date(date);
		}

		return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}`;
	}

	slugify(text = "") {
		return text.toString().toLowerCase()
			//.replace(/[-!$%^&*()_+|~=`{}\[\]:";\'<>?,.\/]/, "")
			.replace(/\s+/g, "-")
			.replace(/[^\w\-]+/g, "")
			.replace(/\-\-+/g, "-")
			.replace(/^-+/, "")
			.replace(/-+$/, "")
	}

	flattenObject(obj) {
		const flattened = {}

		Object.keys(obj).forEach((key) => {
			if (typeof obj[key] === "object" && obj[key] !== null) {
				Object.assign(flattened, this.flattenObject(obj[key]))
			} else {
				flattened[key] = obj[key]
			}
		})

		return flattened
	}
}

module.exports = Utils;