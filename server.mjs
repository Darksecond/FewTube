import Parser from "rss-parser";
import ytdl from "ytdl-core";
import express from "express";
import path from "path";
import fetch from "node-fetch";
import fs from "fs";
import https from "https";
import httpProxy from "http-proxy";

let parser = new Parser();

(async () => {
  // let feed = await parser.parseURL("https://www.youtube.com/feeds/videos.xml?user=LinusTechTips");
  // console.log(feed.title);

  // feed.items.forEach(item => {
  //   console.log(item.title + ' : ' + item.link);
  // });

  // let info = await ytdl.getInfo(feed.items[0].link);
  // info.formats.forEach(format => {
  //   console.log(format.videoCodec, format.audioCodec, format.quality, format.itag);
  // });
  // let format = ytdl.chooseFormat(info.formats, {quality: 137});
  // console.log(format);


  const app = express();
  var proxy = httpProxy.createProxyServer({});
  proxy.on('error', console.error);

  app.get('/api/:id', async (req, res) => {
    let info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${req.params.id}`);
    let video = ytdl.chooseFormat(info.formats, {filter: format => format.container==='mp4' && format.hasVideo && format.hasAudio, quality: 'highestvideo'});
    // let video = ytdl.chooseFormat(info.formats, { quality: 137 });
    res.set('Content-Type', 'application/json');
    res.send({
      video,
      format: info,
    });
  });

  app.head('/api/stream/:format/:id', async (req, res) => {
    let info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${req.params.id}`);
    let video = ytdl.chooseFormat(info.formats, { quality: parseInt(req.params.format) });
    res.set('Content-Type', video.mimeType);
    res.send();
  });

  app.get('/api/stream/:format/:id', async (req, res) => {
    let info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${req.params.id}`);
    let video = ytdl.chooseFormat(info.formats, { quality: parseInt(req.params.format) });

    console.log(video.url);
    proxy.web(req, res, { target: video.url, changeOrigin: true, });
  });

  app.get('/videoplayback', async (req, res) => {
    console.log('here', req.query.host);
    proxy.web(req, res, { target: `https://${req.query.host}/`, changeOrigin: true, followRedirects: true  });
  });

  // app.get('/api/stream/:format/:id', async (req, res) => {
  //   res.set('Access-Control-Allow-Origin', '*');

  //   let range = req.get('Range');
  //   let info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${req.params.id}`);
  //   let video = ytdl.chooseFormat(info.formats, { quality: parseInt(req.params.format) });

  //   if(range) {
  //     console.log(range);
      
  //     let response = await fetch(video.url, {
  //       headers: {
  //         'range': range
  //       }
  //     });
  //     res.set('Content-Range', response.headers.get('Content-Range'));
  //     res.set('Content-Length', response.headers.get('Content-Length'));
  //     res.set('Accept-Ranges', response.headers.get('Accept-Ranges'));
  //     res.set('Content-Type', response.headers.get('Content-Type'));
  //     res.status(response.status);
  //     response.body.pipe(res);
  //   } else {
  //     let response = await fetch(video.url);
  //     res.set('Content-Length', response.headers.get('Content-Length'));
  //     res.set('Content-Type', response.headers.get('Content-Type'));
  //     res.status(response.status);
  //     response.body.pipe(res);
  //   }
  // });

  app.get('/', async (req, res) => {
    res.sendFile("index.html", {
      root: path.resolve('public'),
    });
  });

  app.get('/dashtest.mpd', async (req, res) => {
    res.contentType('application/dash+xml');
    res.sendFile('dashtest.mpd', {
      root: path.resolve('public'),
    });
  });

  app.get('/:file', async (req, res) => {
    res.sendFile(req.params.file, {
      root: path.resolve('public'),
    });
  });

  

  app.listen(3000);

  https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app)
    .listen(3001, function () {
      console.log('Example app listening on port 3000! Go to https://localhost:3000/')
    })

})();