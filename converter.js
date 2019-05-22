const config = require("./config"),
	Utils = require("./utils"),
	Page = require("./page"),
	fs = require("fs"),
	request = require("request-promise");

class JsonToMarkdown {

	constructor() {
		this.utils = new Utils();
	}

	/**
	 * Query the WordPress API to get pages/posts/etc
	 * @param  {string} endpoint
	 * @param  {number} perPage
	 * @returns {Promise<Object[]>}
	 */
	async getPages(endpoint, perPage) {
		let pagesResult = await request.get(`${config.wpBaseUrl}/wp-json/wp/v2/${endpoint}?per_page=${perPage}`);
		return JSON.parse(pagesResult);
	}

	/**
	 * Run the application with sensible defaults
	 * @param  {string} endpoint="pages"
	 * @param  {number} perPage=100
	 * @returns {void}
	 */
	async run(endpoint = "pages", perPage = 100) {
		
		const pages = await this.getPages(endpoint, perPage);
		
		for (let p of pages) {
			
			const page = new Page(p);

			if (page.title) {
				page.saveImages();
				fs.mkdirSync(page.directory, { recursive: true });
				fs.writeFileSync(`${page.directory}/index.md`, page.renderAsMarkdown());
			}

		}
		console.info(`Converted ${pages.length} ${endpoint}`);
	}


}

module.exports = JsonToMarkdown;