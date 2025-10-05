'use strict';
const CrowdBot = require('./crowdBot');
const MonkeyBot = require('./monkeyBot');
const SmartBot = require('./smartBot');
const CrazyBot = require('./crazyBot');
module.exports = {
    crowdBot : new CrowdBot(),
    monkeyBot : new MonkeyBot(),
    smartBot : new SmartBot(),
    crazyBot : new CrazyBot()
};