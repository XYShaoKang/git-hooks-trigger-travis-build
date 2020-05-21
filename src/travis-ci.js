const fetch = require('node-fetch')

const travisCiToken = process.env.TRAVIS_CI_TOKEN

const getRepoApi = (repo) =>
  `https://api.travis-ci.com/repo/${repo.replace('/', '%2F')}/requests`
function triggerBuild({ repo, branch = 'deploy' }) {
  const url = getRepoApi(repo)
  const body = {
    request: {
      branch,
      message: 'deploy',
    },
  }
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Travis-API-Version': 3,
      Authorization: `token ${travisCiToken}`,
    },
  }).then((res) => res.json())
  // .then(console.log)
}

module.exports = { triggerBuild }
