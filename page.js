const Utils = require("./utils"),
	htmlEntities = require("he"),
	htmlToMarkdown = require("h2m"),
	cheerio = require("cheerio"),
	request = require("request-promise"),
	fs = require("fs");

class Page {

	constructor(page) {

		this.imageMap = new Map();
		this.utils = new Utils();

		// Normalize on instantiation
		this.page = this.processPage(page);
	}

	/**
	 * Get the title of the page / post
	 * @returns {string}
	 */
	get title() {
		let title = this.utils.slugify(htmlEntities.decode(this.page.title));
		// Prepend dates to posts
		if (this.page.type !== "page") {
			title = `${this.utils.dateify(this.page.date)}-${title}`;
		}
		return title;
	}

	/**
	 * Get the directory location where files related to this page / post belong
	 * @returns {string}
	 */
	get directory() {
		return `./output/${this.page.type}/${this.title}`
	}

	/**
	 * Download all images in this page and save to disk
	 * @returns {void}
	 */
	async saveImages() {
		for (let item of this.imageMap) {
			try {
				const image = await request.get(item[0]);
				fs.writeFileSync(`${this.directory}/${item[1]}`, image);
			} catch (e) {
				console.error("Could not get image", item[0]);
			}
		}
	}

	/**
	 * Output the post as a string containing markdown
	 * @returns {string}
	 */
	renderAsMarkdown() {

		const markdownContent = htmlToMarkdown(this.page.content);

		// Create frontmatter
		let output = "---\n";

		for (let key in this.page) {
			if (key !== "content") {
				output += `${key}: "${this.page[key]}"\n`;
			}
		}

		output += "---\n";

		// Add in markdown content
		output += markdownContent;

		return output;
	}

	/**
	 * Make pages and posts have the same general structure
	 * Process out any irregularities
	 * @param  {Object} page
	 * @returns {Object}
	 */
	processPage(page) {

		// Process out rendered content
		for (let key in page) {
			page[key] = page[key] && page[key].rendered ? page[key].rendered : page[key];
		}

		this.utils.flattenObject()

		// Flatten out anything left that is nested
		page = this.utils.flattenObject(page);

		// Normalize the content
		page.content = page.content || page.post_content || page.excerpt;
		delete page.excerpt;
		delete page.post_content;

		// Extract images
		// for (let key in page) {
		// 	if (typeof page[key] === "string" && page[key].startsWith("http")) {
		// 		const imgPath = page[key].split("/").pop();
		// 		this.imageMap.set(page[key], imgPath);
		// 		page[key] = imgPath;
		// 	}
		// }

		if (page.content) {
			const $ = cheerio.load(page.content);
			$("img").each((i, el) => {
				if (el.attribs.src) {
					const src = el.attribs.src.split("/").pop().split("?")[0];
					this.imageMap.set(el.attribs.src, src);
					el.attribs.src = src;
				}
			});

			page.content = $.html();
		}

		return page;
	}

}

module.exports = Page;