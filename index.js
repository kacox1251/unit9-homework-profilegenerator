const fs = require("fs");
const axios = require("axios");
const inquirer = require("inquirer");
const open = require("open");
const convertFactory = require("electron-html-to");

const conversion = convertFactory({
  converterPath: convertFactory.converters.PDF
});

inquirer
  .prompt([
    {
      type: "input",
      message: "Enter your GitHub username:",
      name: "username"
    },
    {
      type: "list",
      name: "color",
      message: "What is your favorite color?",
      choices: ["green", "blue", "pink", "red"]
    }
  ])
  .then(async function({ username, color }) {
    const queryUrl = `https://api.github.com/users/${username}`;
    var generateHTML = require("./generateHTML");
    axios
      .get(queryUrl)
      .then(function(res) {
        axios
          .get(`https://api.github.com/users/${username}/repos`)
          .then(function(response) {
            var repos = response.data;
            var starsCount = 0;
            for (const repo of repos) {
              starsCount += repo.stargazers_count;
            }
            // console.log(starsCount);
            var colors = { color };
            var starsCount = { starsCount };
            var html = generateHTML(
              Object.assign({}, res.data, colors, starsCount)
            );
            conversion({ html }, function(err, result) {
              if (err) {
                return console.error(err);
              }

              result.stream.pipe(fs.createWriteStream("profile.pdf"));
              conversion.kill();
              open("./profile.pdf");
            });
          })
          .catch(function(err) {
            console.log(err);
          });
      })
      .catch(function(err) {
        console.log(err);
      });
  });
