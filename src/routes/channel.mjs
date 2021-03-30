import { Router } from "../router.mjs";
import ytpl from "ytpl";
import { isSubscribed } from "../subscription.mjs";

Router.get('/channel/:id', async (req, res) => {
  try {
    let info = await ytpl(req.params.id, { pages: 1 }); //TODO cache info 

    res.render('channel', {
      info,
      isSubscribed: await isSubscribed(req.params.id),
    });
  } catch {
    res.status(404).send("Not Found");
  }
});

Router.get('/channeltest/:id', async (req, res) => {
  let info = await ytpl(req.params.id, { pages: 1 });
  res.send(info);
});