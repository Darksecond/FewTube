import { Router } from "../router.mjs";
import { Database } from "../database.mjs";
import * as subscription from "../subscription.mjs";

Router.get('/', async (req, res) => {
  res.redirect('/feed');
});

Router.get('/feed', async (req, res) => {
  let subscriptions = await Database('subscriptions').orderBy('title');
  let feed = await Database('feed').orderBy('published', 'desc').limit(1000);
  res.render('feed', {
    feed,
    subscriptions,
  });
});

Router.get('/subscribe/:id', async (req, res) => {
  await subscription.subscribe(req.params.id);
  res.redirect(`/channel/${req.params.id}`);
});

Router.get('/unsubscribe/:id', async (req, res) => {
  await subscription.unsubscribe(req.params.id);
  res.redirect(`/channel/${req.params.id}`);
});