const config = require("./config"),
	Utils = require("./utils"),
	fs = require("fs"),
	he = require("he"),
	request = require("request-promise"),
	h2m = require("h2m");

class JsonToMarkdown {

	constructor() {
		this.utils = new Utils();
	}

	async getPages(endpoint, perPage) {
		let pagesResult = await request.get(`${config.wpBaseUrl}/wp-json/wp/v2/${endpoint}?per_page=${perPage}`);
		return JSON.parse(pagesResult);
	}

	processPage(page) {
		for (let key in page) {
			// Process out content
			page[key] = page[key] && page[key].rendered ? page[key].rendered : page[key];
		}
		return page;
	}

	buildPage(page) {

		const ignoreKeys = new Set(["post_content", "content", "excerpt"])
		const contentKeys = new Set(["post_content", "content"]);

		// Create frontmatter
		let output = "---\n";

		for (let key in page) {
			if (!ignoreKeys.has(key)) {
				output += `${key}: "${page[key]}"\n`;
			}
		}

		output += "---\n";

		// Create content
		for (let key in page) {
			if (contentKeys.has(key)) {
				output += h2m(page[key]);
				return output; // Only allow one content item
			}
		}

		return output;

	}

	async run(endpoint = "pages", perPage = 100) {
		const pages = await this.getPages(endpoint, perPage);
		for (let page of pages) {
			page = this.processPage(page);

			let title = this.utils.slugify(he.decode(page.title)),
				content = this.buildPage(page);

			// Prepend dates to posts
			if (endpoint !== "pages") {
				title = `${this.utils.dateify(page.date)}-${title}`;
			}

			if (title) {
				fs.mkdirSync(`./output/${endpoint}/${title}`, { recursive: true });
				fs.writeFileSync(`./output/${endpoint}/${title}/index.md`, content);
			}

		}
		console.info(`Converted ${pages.length} ${endpoint}`);
	}


}

module.exports = JsonToMarkdown;