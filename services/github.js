const axios = require('axios');

exports.createGitHubIssue = async (title, body) => {
  const response = await axios.post(
    `https://api.github.com/repos/${process.env.GITHUB_REPO}/issues`,
    { title, body },
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'support-ticket-system',
      },
    }
  );
  return response.data;
};

exports.closeGitHubIssue = async(issueNumber)=> {
  await axios.patch(
    `https://api.github.com/repos/${process.env.GITHUB_REPO}/issues/${issueNumber}`,
    { state: 'closed' },
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'support-ticket-system',
      },
    }
  );
}