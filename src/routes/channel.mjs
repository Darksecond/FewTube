import { Router } from "../router.mjs";
import ytpl from "ytpl";

Router.get('/channel/:id', async (req, res) => {
  let info = await ytpl(req.params.id, { pages: 1 }); //TODO cache info 

  res.render('channel', {
    info,
  });
});

Router.get('/channeltest/:id', async (req, res) => {
  let info = await ytpl(req.params.id, { pages: 1 });
  res.send(info);
});