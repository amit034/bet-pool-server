const apiFootballSdk = require('../lib/apiFootballSDK');

function getCompetitions(req, res) {
    return apiFootballSdk.getCompetitions({play: 'TIER_ONE'}).then(res.json);
}
function getMatches(req, res) {
    return apiFootballSdk.getMatches(req.param.competitionId).then(res.json);
}
module.exports = {
    getCompetitions,
    getMatches
};

