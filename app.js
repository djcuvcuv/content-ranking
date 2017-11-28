'use-strict';

/**
 * Express.js HTTP API Interface
 */

const app = require('express')(),
    authenticate = require('./authenticate'),
    rank = require('./rank'),
    port = 9000;

app.use((req, res, next) => {
    console.log("\n############## INCOMING REQUEST ##############");
    console.log(req.headers);
    next();
});
app.use(authenticate);
app.all('*', rank);
app.listen(port, () => console.log('try http://localhost:' + port + '/snip/feed.json'));
