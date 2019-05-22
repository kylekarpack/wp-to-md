const config = require("./config"),
	Utils = require("./utils"),
	Page = require("./page"),
	fs = require("fs"),
	request = require("request-promise");

class JsonToMarkdown {

	constructor() {
		this.utils = new Utils();
	}

	async getPages(endpoint, perPage) {
		let pagesResult = await request.get(`${config.wpBaseUrl}/wp-json/wp/v2/${endpoint}?per_page=${perPage}`);
		return JSON.parse(pagesResult);
	}

	extractImages(page) {

	}

	async run(endpoint = "pages", perPage = 100) {
		
		const pages = await this.getPages(endpoint, perPage);
		
		for (let p of pages) {
			
			const page = new Page(p);

			if (page.title) {
				fs.mkdirSync(page.directory, { recursive: true });
				fs.writeFileSync(`${page.directory}/index.md`, page.renderAsMarkdown());
			}

		}
		console.info(`Converted ${pages.length} ${endpoint}`);
	}


}

module.exports = JsonToMarkdown;