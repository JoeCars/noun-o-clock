const { request, gql } = require('graphql-request');

async function getLatestAuctions(){

    const endpoint = 'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph'

    const query = gql`
    {
        auctions(orderBy: startTime, orderDirection: desc, first: 2) {
        id
        endTime
        startTime
        settled
        }
    }
    `

    return await request(endpoint, query);

}

module.exports.getLatestAuctions = async function() {
    return getLatestAuctions();
}