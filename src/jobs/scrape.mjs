import Parser from "rss-parser";
import ytdl from "ytdl-core";

async function run() {
  console.log('Started scraping');
  console.log('Finished scraping');
}

setInterval(run, 1*60*1000); // Run every minute