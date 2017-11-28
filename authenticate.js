'use-strict';

/**
 * Reddit "Application Only" (Manual) Authentication Process
 *
 * Performed manyally because the leading Reddit node.js client does not yet support "Application Only" OAuth:
 * https://github.com/not-an-aardvark/snoowrap
 */

require('dotenv').load();
const rp = require('request-promise'),
    redditAuth = process.env.REDDIT_BASIC_AUTH,
    redditUrlAuth = new Buffer(redditAuth, 'base64').toString("ascii"),
    redditAuthOptions = {
        method: 'POST',
        url: 'https://' + redditUrlAuth + '@www.reddit.com/api/v1/access_token',
        json: true,
        headers:
            {
                'cache-control': 'no-cache',
                'user-agent': 'node.js:chriscovneytestapp:v1.0 (by /u/djcuvcuv)',
                'content-type': 'application/x-www-form-urlencoded'
            },
        form:
            {
                grant_type: 'client_credentials',
                Authorization: 'Basic ' + redditAuth
            }
    };

/**
 * The reddit authenticate function
 * Executed at API runtime, but NOT exposed through the external HTTP API interface
 * @param req
 * @param res
 * @param next
 */
let authenticate = (req, res, next) => {
    rp(redditAuthOptions)
        .then((body) => {
            process.env['REDDIT_BEARER_TOKEN'] = body.access_token;
            next();
        })
        .catch((err) => {
            throw new Error(err);
        });
};

module.exports = authenticate;
