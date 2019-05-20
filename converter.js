const config = require("./config"),
	fs = require("fs"),
	request = require("request-promise"),
	h2m = require("h2m");

class JsonToMarkdown {

	async getPages() {
		let pagesResult = await request.get(`${config.wpBaseUrl}/wp-json/wp/v2/pages`),
			pages = JSON.parse(pagesResult);
		console.log(pages)
	}

	parse(file = "./wp_posts.json") {
		return JSON.parse(fs.readFileSync(file).toString()).find(el => el.type === "table").data;
	}

	buildPost(post) {
		if (!post.ID) {
			return;
		}

		let output = "---\n";

		for (let key in post) {
			if (key !== "post_content") {
				output += `${key}: "${post[key]}"\n`;
			}
		}

		output += "---\n";

		output += h2m(post.post_content);

		return output;

	}

	slugify(text = "") {
		return text.toString().toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^\w\-]+/g, '')
			.replace(/\-\-+/g, '-')
			.replace(/^-+/, '') 
			.replace(/-+$/, '');
	}

	run() {
		this.getPages();
		return;
		const posts = this.parse();
		for (let post of posts) {
			const title = this.slugify(post.post_title),
				content = this.buildPost(post);

			if (title) {
				fs.mkdirSync(`./output/${title}`, { recursive: true });
				fs.writeFileSync(`./output/${title}/index.md`, content);
			}

		}
		console.info(`Converted ${posts.length} posts`);
	}


}

module.exports = JsonToMarkdown;