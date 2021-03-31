import { Router } from "../router.mjs";
import ytdl from "ytdl-core";
import { build_dash } from "../dash.mjs";
import httpProxy from "http-proxy";
import fetch from "node-fetch";

let proxy = httpProxy.createProxyServer({});

Router.get('/watch/:id', async (req, res) => {
  try {
    let info = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${req.params.id}`); //TODO cache info 
    res.render('watch', {
      id: req.params.id,
      title: info.videoDetails.title,
      description: info.videoDetails.description.replace(new RegExp('\r?\n', 'g'), '<br />'),
      channel: {
        name: info.videoDetails.author.name,
        url: `/channel/${info.videoDetails.author.id}`,
      },
      poster: info.videoDetails.thumbnails.sort((a,b) => b.width-a.width)[0].url, //TODO cleanup
      related: info.related_videos,
    });
  } catch {
    res.status(404).send("Not Found");
  }
});

Router.get('/test/:id', async (req, res) => {
  let info = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${req.params.id}`); //TODO cache info 
  res.send(info);
});

Router.get('/api/dash/:id.mpd', async (req, res) => {
  let info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${req.params.id}`); //TODO cache info 

  res.contentType('application/dash+xml');

  if(info.player_response.streamingData.dashManifestUrl) {
    let mpd = await transform_yt_dash(info.player_response.streamingData.dashManifestUrl);
    res.send(mpd);
  } else {
    let dash = build_dash(info); 
    res.send(dash);
  }
});

Router.get('/videoplayback', async (req, res) => {
  proxy.web(req, res, { target: `https://${req.query.host}/`, changeOrigin: true, followRedirects: true  });
});

async function transform_yt_dash(url) {
  let response = await fetch(url);
  let mpd = await response.text();

  mpd = mpd.replace(/(?<=<BaseURL>)(.*?)(?=<\/BaseURL>)/g, (match)=>{
    return base_url(match);
  });

  return mpd;
}

Router.get('/videoplayback/*', async (req, res) => {
  let url = new URL('http://example/videoplayback');
  let params = req.originalUrl.replace(/^\/videoplayback\//,'').split('/');
  let mergedParams = [];
  for(let i=0; i < params.length; i+=2) {
    mergedParams.push(`${params[i]}=${params[i+1]}`);
  }
  url.search = mergedParams.join('&');
  res.redirect(`${url.pathname}${url.search}`);
});

function base_url(base) {
  let url = new URL(base);

  return `${url.pathname}host/${url.host}/`
}