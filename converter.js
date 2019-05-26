const Page = require("./page"),
	fs = require("fs"),
	request = require("request-promise");

class JsonToMarkdown {

	constructor(options) {
		if (!options.url) {
			throw "Base URL for WordPress instance is required";
		}
		this.options = options;
	}

	/**
	 * Query the WordPress API to get pages/posts/etc
	 * @returns {Promise<Object[]>} array of pages/posts/etc
	 */
	async getPages() {
		let pagesResult = [],
			url =`${this.options.url}/wp-json/wp/v2/${this.options.type}?per_page=${this.options.number}`;

		try {
			pagesResult = await request.get(url);
		} catch (err) {
			throw `Could not get ${this.options.type}: ${err.toString()}`
		} 
		return JSON.parse(pagesResult);
	}

	/**
	 * Run the application
	 * @returns {void}
	 */
	async run() {
		
		const pages = await this.getPages();
		
		for (let p of pages) {
			
			const page = new Page(p);

			if (page.title) {
				await page.saveImages();
				fs.mkdirSync(page.directory, { recursive: true });
				fs.writeFileSync(`${page.directory}/index.md`, page.renderAsMarkdown());
			}

		}
		console.info(`Converted ${pages.length} ${this.options.type}`);
	}


}

module.exports = JsonToMarkdown;