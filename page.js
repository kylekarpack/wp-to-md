const Utils = require("./utils"),
	htmlEntities = require("he"),
	htmlToMarkdown = require("h2m"),
	cheerio = require("cheerio"),
	request = require("request-promise"),
	fs = require("fs"),
	progress = require("cli-progress");

class Page {

	constructor(page) {

		this.imageMap = new Map();

		// Normalize on instantiation
		this.page = this.processPage(page);
	}

	/**
	 * Get the title of the page / post
	 * @returns {string}
	 */
	get title() {
		let title = Utils.slugify(htmlEntities.decode(this.page.title));
		// Prepend dates to posts
		if (this.page.type !== "page") {
			title = `${Utils.dateify(this.page.date)}-${title}`;
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

		if (this.imageMap.size) {
			// Start a progress bar
			const bar = new progress.Bar({}, progress.Bar.shades_classic),
				failures = [];
			bar.start(this.imageMap.size, 0);

			for await (let item of this.imageMap) {
				try {
					if (item[0].startsWith("http")) {
						await request.get(item[0]).pipe(
							fs.createWriteStream(`${this.directory}/${item[1]}`)
						);
					}
				} catch (e) {
					failures.push(item[0]);
				}
				bar.increment();
			}

			if (failures.length) {
				console.warn("Could not get the following images", failures);
			}

			bar.stop();
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

		Utils.flattenObject()

		// Flatten out anything left that is nested
		page = Utils.flattenObject(page);

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
					const src = `./${el.attribs.src.split("/").pop().split("?")[0]}`;
					this.imageMap.set(el.attribs.src, src);
					el.attribs.src = src;

					// Get first image as the cover
					if (!page.cover) {
						page.cover = src;
					}
				}
			});

			page.content = $.html();
		}

		return page;
	}

}

module.exports = Page;