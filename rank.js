'use-strict';

/**
 * Main Content Ranking Processes File
 */

require('dotenv').load();
const Twitter = require('twitter'),
    rp = require('request-promise'),
    async = require('async'),
    interweave = require('array-interweave');

/**
 * Feed dimension values
 * @type {number}
 */
const subredditCount = 5,
    threadCount = 100,
    topicCount = 5,
    tweetCount = 100,
    rankingMaxLength = 1000;


/**
 * Initialized content arrays
 * @type {Array}
 */
let threads = [],
    tweets = [],
    final = [];

const redditUrl = 'https://oauth.reddit.com',
    redditUserAgent = 'node.js:chriscovneytestapp:v1.0 (by /u/djcuvcuv)',
    twitterClient = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        bearer_token: process.env.TWITTER_BEARER_TOKEN
    });

/**
 * Makes two nested API calls to the Reddit API and returns a callback once both have completed
 * First function in the async.parallel execution
 * @param cb
 */
function redditRequests(cb) {
    const redditHeaders = {
            'User-Agent': redditUserAgent,
            'Authorization': 'Bearer ' + process.env.REDDIT_BEARER_TOKEN
        },
        subredditsOptions = {
            url: redditUrl + `/subreddits/popular?limit=${subredditCount}`,
            headers: redditHeaders,
            json: true,
        };

    /**
     * Dates generated used for 24 hour filtration
     * @type {Date}
     */
    const d = new Date(),
        endTime = Math.floor(Date.parse(d) / 1000),
        startTime = Math.floor(d.setDate(d.getDate() - 1) / 1000);

    rp(subredditsOptions)
        .then((body) => {
            let subs = [];
            // subs = body.data.children;
            // subs.sort((a, b) => {return b.data.subscribers - a.data.subscribers});
            body.data.children.forEach((item) => subs.push(item.data.display_name));
            return subs;
        })
        .then((subs) => {
            let calls = [];
            subs.forEach((sub) => {
                let threadOptions = {
                    url: redditUrl + `/r/${sub}/search?g=GLOBAL&limit=${threadCount}&sort=top&rank=hot&q=timestamp:${startTime}..${endTime}&restrict_sr=on&syntax=cloudsearch`,
                    headers: redditHeaders,
                    json: true,
                };

                calls.push((callback) => {
                    rp(threadOptions)
                        .then((body) => {
                            let cleanedThreads = [];
                            body.data.children.forEach((item) => {
                                cleanedThreads.push({
                                    "subreddit": item.data.subreddit,
                                    "id": item.data.id,
                                    "title": item.data.title,
                                    "score": item.data.score,
                                    "over_18": item.data.over_18,
                                    "subreddit_id": item.data.subreddit_id,
                                    "name": item.data.name,
                                    "subreddit_type": item.data.subreddit_type,
                                    "url": item.data.url,
                                    "created_utc": item.data.created_utc,
                                    "author": item.data.author,
                                    "ups": item.data.ups,
                                    "num_comments": item.data.num_comments
                                })
                            });
                            callback(null, cleanedThreads);
                        })
                        .catch((err) => {
                            callback(err);
                        });
                });
            });

            async.parallel(calls, (err, result) => {
                if (err) return console.error(err);
                result.forEach((item) => {
                    threads = threads.concat(item);
                });
                cb(null, threads);
            });
        })
        .catch(console.error);
}

/**
 * Makes two nested API calls to the Twitter API and returns a callback once both have completed
 * Second function in the async.parallel execution
 * @param cb
 */
function twitterRequests(cb) {
    twitterClient.get('trends/place', {id: 1})
        .then((trends) => {
            let tags = [];
            let sortedTrends = trends[0].trends;
            sortedTrends.sort((a, b) => {
                return b.tweet_volume - a.tweet_volume;
            });
            sortedTrends.slice(0, topicCount).forEach((item) => {
                tags.push(item.query);
            });
            return tags;
        })
        .then((tags) => {
            let calls = [];
            tags.forEach((tag) => {
                calls.push((callback) => {
                    twitterClient.get('search/tweets', {q: tag, count: tweetCount, result_type: 'popular'})
                        .then((body) => {
                            let cleanedTweets = [];
                            body.statuses.forEach((item) => {
                                cleanedTweets.push({
                                    "created_at": item.created_at,
                                    "id_str": item.id_str,
                                    "text": item.text,
                                    "entities": item.entities,
                                    "source": item.source,
                                    "retweet_count": item.retweet_count,
                                    "favorite_count": item.favorite_count,
                                    "possibly_sensitive": item.possibly_sensitive,
                                    "lang": item.lang
                                })
                            });
                            callback(null, cleanedTweets);
                        })
                        .catch((err) => {
                            callback(err);
                        });
                });
            });

            async.parallel(calls, (err, result) => {
                if (err) return console.error(err);
                result.forEach((item) => {
                    tweets = tweets.concat(item);
                });
                cb(null, tweets);
            });
        })
        .catch((error) => {
            throw error;
        });
}

/**
 * Async.parallel array of functions to be executed in parallel
 * @type {[null,null]}
 */
let requests = [redditRequests, twitterRequests];

/**
 * Express.js rank function
 * Exposed through the HTTP API interface
 * Executes the async.parallel API requests, blends the responses, returns the final outgoing HTTP response
 * @param req
 * @param res
 */
let rank = (req, res) => {
    async.parallel(requests, (err, result) => {
        if (err) return console.error(err);
        final = interweave(result[0], result[1]);
        let i = 1;
        final.forEach((item) => {
            item['x-content-ranking'] = i;
            i++;
        });
        final.slice(0, rankingMaxLength);
        res.send(final);
    });
};

module.exports = rank;
