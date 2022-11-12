// const store = require("../public/assets/store.json");

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

const API_KEY=process.env.API_KEY;

// example API call
app.get("/apod", async (req, res) => {
  try {
    let image = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`
    ).then((res) => res.json());
    res.send({ image });
  } catch (err) {
    console.log("error:", err);
  }
});

// my API calls

/**
 * @description fetch rover manifest
 */
app.get('/rover-manifest/:name', async (req, res) => {
    try {
        const roverName = req.params.name;
		const roverManifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`).then(res => res.json())
		res.send(roverManifest.photo_manifest)
    } catch (err) {
        console.log('error:', err);
    }
});

app.get('/rover-photos/:name', async (req, res) => {
    try {
        const roverName = req.params.name;
		const sol = req.query.sol;
        const data = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?sol=${sol}&api_key=${API_KEY}`)
            .then(res => res.json())
        res.send( data.photos.slice(-9) )
    } catch (err) {
        console.log('error:', err);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));