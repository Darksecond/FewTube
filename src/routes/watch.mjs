import { Router } from "../router.mjs";
import ytdl from "ytdl-core";
import { build_dash } from "../dash.mjs";
import httpProxy from "http-proxy";

let proxy = httpProxy.createProxyServer({});

Router.get('/watch/:id', async (req, res) => {
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
});

Router.get('/test/:id', async (req, res) => {
  let info = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${req.params.id}`); //TODO cache info 
  res.send(info);
});

Router.get('/api/dash/:id.mpd', async (req, res) => {
  let info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${req.params.id}`); //TODO cache info 
  let dash = build_dash(info);
  res.contentType('application/dash+xml');
  res.send(dash);
});

Router.get('/videoplayback', async (req, res) => {
  proxy.web(req, res, { target: `https://${req.query.host}/`, changeOrigin: true, followRedirects: true  });
});