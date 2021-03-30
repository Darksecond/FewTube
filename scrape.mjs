import Parser from "rss-parser";
import ytdl from "ytdl-core";

const url = "https://www.youtube.com/feeds/videos.xml?user=LinusTechTips";

let parser = new Parser();

(async ()=>{
  let feed = await parser.parseURL(url);
  let item = feed.items[0];
  console.log(ytdl.getVideoID(item.link));
})();