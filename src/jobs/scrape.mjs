import Parser from "rss-parser";
import ytdl from "ytdl-core";
import { Database } from "../database.mjs";

let parser = new Parser();

const SCRAPE_INTERVAL_MS = 15 * 60 * 1000; // Every 15 minutes

async function job() {

  let time = new Date().getTime() - SCRAPE_INTERVAL_MS;

  let channel = await Database('subscriptions')
  .where('lastScrape', '<', time)
  .orderBy('lastScrape')
  .first();

  if(!channel) return; //Nothing to do

  let feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`);

  // Mark as scraped
  await Database('subscriptions')
  .where('id', channel.id)
  .update({
    lastScrape: Date.now(),
    title: feed.title,
  });

  console.log(`Scraping ${channel.id} (${feed.title}) `);

  for(let item of feed.items) {
    await Database('feed').insert({
      id: ytdl.getURLVideoID(item.link),
      title: item.title,
      channel: channel.id,
      published: new Date(item.pubDate),
    }).onConflict('id').merge();
  }
    
}

setInterval(async function run() {
  try {
    await job();
  } catch(e) {
    console.error("Error while scraping", e);
  }
}, 10 * 1000); // Run every 10 seconds