const axios = require('axios');

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.query || '';
  const ids = event.queryStringParameters.ids || '';

  if (!query || !ids) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Query and IDs are required' }),
    };
  }

  const pubmedIdsToCheck = ids.split(',');

  try {
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodedQuery}&retmax=10000&retmode=json`;

    // Debugging: Log the query parameters and constructed URL
    console.log(`Query: ${query}`);
    console.log(`Encoded Query: ${encodedQuery}`);
    console.log(`Search URL: ${searchUrl}`);

    const searchResponse = await axios.get(searchUrl);
    const searchResults = searchResponse.data.esearchresult;
    const searchIds = searchResults.idlist;
    const totalHits = searchResults.count;

    const capturedIds = pubmedIdsToCheck.filter(id => searchIds.includes(id));
    const percentageCaptured = (capturedIds.length / pubmedIdsToCheck.length) * 100;

    return {
      statusCode: 200,
      body: JSON.stringify({
        capturedIds,
        totalHits,
        percentageCaptured: percentageCaptured.toFixed(2),
      }),
    };
  } catch (error) {
    // Debugging: Log the error message
    console.log(`Error: ${error.message}`);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
