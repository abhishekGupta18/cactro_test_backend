const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const GITHUB_API = "https://api.github.com";
const USERNAME = "abhishekGupta18";
const TOKEN = process.env.GITHUB_ACCESS_TOKEN;

// api for basic info git info
app.get("/github", async (req, res) => {
  try {
    const { data } = await axios.get(`${GITHUB_API}/users/${USERNAME}`, {
      headers: { Authorization: `token ${TOKEN}` },
    });

    const { login, followers, following, public_repos } = data;

    const reposResponse = await axios.get(
      `${GITHUB_API}/users/${USERNAME}/repos`,
      {
        headers: { Authorization: `token ${TOKEN}` },
      }
    );

    const repositories = reposResponse.data.map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
    }));

    res.json({ login, followers, following, public_repos, repositories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// api to get info about specific repo
app.get("/github/:repo", async (req, res) => {
  const { repo } = req.params;
  try {
    const { data } = await axios.get(
      `${GITHUB_API}/repos/${USERNAME}/${repo}`,
      {
        headers: { Authorization: `token ${TOKEN}` },
      }
    );

    const repoDetails = {
      name: data.name,
      url: data.html_url,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      open_issues: data.open_issues_count,
    };

    res.json(repoDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create an issue in a repository
app.post("/github/:repo/issues", async (req, res) => {
  const { repo } = req.params;
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required" });
  }

  try {
    const { data } = await axios.post(
      `${GITHUB_API}/repos/${USERNAME}/${repo}/issues`,
      { title, body },
      { headers: { Authorization: `token ${TOKEN}` } }
    );

    res.json({ issue_url: data.html_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
