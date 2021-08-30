const fetch = require('node-fetch'),
	{ Collection } = require('discord.js');

// Interact with Reddit API
module.exports = class RedditAPI {
	constructor() {
		this.memeSubreddits = ['funny', 'jokes', 'comedy', 'notfunny', 'bonehurtingjuice',
			'ComedyCemetery', 'comedyheaven', 'dankmemes', 'meme'];
		this.cachedSubreddits = new Collection();
	}

	// Fetch post from a 'meme' subreddit.
	async fetchMeme(options = {}) {
		// choose a subreddit to get meme from
		const subreddit = this.memeSubreddits[Math.floor(Math.random() * this.memeSubreddits.length)];
		// check cache system before requesting reddit
		if (this.cachedSubreddits.has(subreddit)) {
			return this._fetchPost(this.cachedSubreddits.get(subreddit));
		} else {
			const resp = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json`).then(res => res.json());
			this._handleCache(subreddit, resp);
			return this._fetchPost(resp, options);
		}
	}

	// Fetch post from chosen subreddit.
	async fetchSubreddit(subreddit, options = {}) {
		// check cache system before requesting reddit
		if (this.cachedSubreddits.has(subreddit)) {
			return this._fetchPost(this.cachedSubreddits.get(subreddit));
		} else {
			const resp = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?`).then(res => res.json());
			if (resp.error) throw new Error(`Error: '${resp.message}' when searching for that subreddit.`);
			this._handleCache(subreddit, resp);
			return this._fetchPost(resp, options);
		}
	}

	// Turns RAW API data to a 'RedditPost'.
	_fetchPost({ data }, options) {
		// Check if NSFW posts needs to be filtered out
		if (options.removeNSFW) data.children = data.children.filter(post => !post.data.over_18);

		// Double check there are still posts after filtering (if any)
		if (!data.children[0]) throw new Error('No posts were found with that filter.');

		// Choose post and send back to bot
		const post = data.children[Math.floor(Math.random() * 25)].data;
		return new RedditPost(post);
	}

	// Delete the cached subreddit
	_handleCache(subreddit, resp) {
		this.cachedSubreddits.set(subreddit, resp);
		setTimeout(() => {
			this.cachedSubreddits.delete(subreddit);
			// 5 minute and then delete from cache
		}, 5 * 60 * 1000);
	}
};

// The reddit post
class RedditPost {
	constructor({ title, subreddit, permalink, url, ups, downs, author, num_comments, over_18, media }) {
		this.title = title;
		this.subreddit = subreddit;
		this.link = `https://www.reddit.com${permalink}`;
		this.imageURL = media ? media.oembed.thumbnail_url : url;
		this.upvotes = ups ?? 0;
		this.downvotes = downs ?? 0;
		this.author = author ;
		this.comments = num_comments ?? 0;
		this.nsfw = over_18;
	}
}
