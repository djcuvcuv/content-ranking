# Reddit and Twitter Content Ranking

An HTTP server which fetches the 1000 (total) most popular reddit threads and twitter tweets from the last 24 hours and returns a .json array

### Prerequisites

You will need node.js version 6 or later in order to run this. You can install node.js (and co-bundled npm) here:

https://nodejs.org/en/download/

### Installing and Using

1. Clone this repo to your local and cd into the project root directory:
```
git clone https://github.com/djcuvcuv/content-ranking.git
cd content-ranking
```

2. Update the local `.env` file with valid Reddit and Twitter authentication values:
```
cat .env 
TWITTER_CONSUMER_KEY=foobaryourkey
TWITTER_CONSUMER_SECRET=foobaryoursecret
TWITTER_BEARER_TOKEN=foobaryourtoken
REDDIT_BASIC_AUTH=VnlFaXNsNFlMd3BGeWc6aldxRmczUkM5MlhOdzRuaGp0blBKNnVfZ3I0
```
NB that the REDDIT_BASIC_AUTH value must be a base64 encoded string of your reddit application's consumer key, followed by a colon, and then consumer secret:
```
echo foobarconsumerkey:foobarconsumersecret | base64
Zm9vYmFyY29uc3VtZXJrZXk6Zm9vYmFyY29uc3VtZXJzZWNyZXQK
```

3. Install the required node modules and run the server:
```
npm install
node app.js
```

4. Send HTTP requests to the now locally running server to get the ranked content!
```
curl http://localhost:9000/snip/feed.json
```

Example response body:
```
[
    {
        "subreddit": "AskReddit",
        "id": "7fqsdz",
        "title": "What was your school's 'incident'?",
        "score": 35237,
        "over_18": false,
        "subreddit_id": "t5_2qh1i",
        "name": "t3_7fqsdz",
        "subreddit_type": "public",
        "url": "https://www.reddit.com/r/AskReddit/comments/7fqsdz/what_was_your_schools_incident/",
        "created_utc": 1511739358,
        "author": "TemiOO",
        "ups": 35237,
        "num_comments": 27353
    },
    {
        "created_at": "Mon Nov 27 21:48:39 +0000 2017",
        "id_str": "935264131002851329",
        "text": "Mucha suerte Mireya! #CuandoNadieMeVe #OTGala5 https://t.co/QAxRHtiCPm",
        "entities": {
            "hashtags": [
                {
                    "text": "CuandoNadieMeVe",
                    "indices": [
                        21,
                        37
                    ]
                },
                {
                    "text": "OTGala5",
                    "indices": [
                        38,
                        46
                    ]
                }
            ],
            "symbols": [],
            "user_mentions": [],
            "urls": [
                {
                    "url": "https://t.co/QAxRHtiCPm",
                    "expanded_url": "https://twitter.com/ot_oficial/status/934468033548079105",
                    "display_url": "twitter.com/ot_oficial/sta…",
                    "indices": [
                        47,
                        70
                    ]
                }
            ]
        },
        "source": "<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>",
        "retweet_count": 554,
        "favorite_count": 1315,
        "possibly_sensitive": false,
        "lang": "es"
    },
    {
        "subreddit": "CFB",
        "id": "7fpndq",
        "title": "Texas A&amp;M has officially fired Kevin Sumlin.",
        "score": 2656,
        "over_18": false,
        "subreddit_id": "t5_2qm9d",
        "name": "t3_7fpndq",
        "subreddit_type": "public",
        "url": "https://www.reddit.com/r/CFB/comments/7fpndq/texas_am_has_officially_fired_kevin_sumlin/",
        "created_utc": 1511729166,
        "author": "Sctvman",
        "ups": 2656,
        "num_comments": 1358
    },
    {
        "created_at": "Mon Nov 27 21:12:13 +0000 2017",
        "id_str": "935254959486009344",
        "text": "لكل من يفكر بهموم الدنياء من أموال ومناصب الخ..\n قال رسول الله صلى الله عليه وسلم : من أصبح منكم آمناً في سربه ، مع… https://t.co/6znS8rNU4n",
        "entities": {
            "hashtags": [],
            "symbols": [],
            "user_mentions": [],
            "urls": [
                {
                    "url": "https://t.co/6znS8rNU4n",
                    "expanded_url": "https://twitter.com/i/web/status/935254959486009344",
                    "display_url": "twitter.com/i/web/status/9…",
                    "indices": [
                        117,
                        140
                    ]
                }
            ]
        },
        "source": "<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>",
        "retweet_count": 17,
        "favorite_count": 11,
        "lang": "ar"
    }
]
```

### How It Works

*Data Collection:*
- calls the reddit API for most popular subreddits (globally)
    - https://www.reddit.com/dev/api#GET_subreddits_popular
- iterates over most popular subreddits for the 500 most "hot" threads newer than 24hrs
    - https://www.reddit.com/dev/api#GET_hot
    - this returns a sorted array of threads from most "hot" to least "hot"

- calls the twitter API for trending topics from the last 24 hours (globally)
    - https://developer.twitter.com/en/docs/trends/trends-for-location/api-reference/get-trends-place
- iterates over trending topics for the 500 most "popular" tweets
    - https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets.html
    - this returns a sorted array of tweets from most "popular" to least "popular"

*Data Processing:*
- removes some of the metadata from the tweets and threads objects for simplicity
- combines the two sorted arrays by simply interweaving the objects in an alternating pattern
    - the value judgement here is that it is not meaningful to crudely compare relative popularity between tweets and threads
- returns a JSON array the top 1000 (total combined) posts from twitter and reddit

## Versioning

We use [SemVer](http://semver.org/) for versioning. 

## Authors

* **Chris Covney** - [djcuvcuv](https://github.com/djcuvcuv)

## Copyright and License
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

