import { Database } from "./database.mjs";

export async function subscribe(id) {
  await Database('subscriptions').insert({
    id,
    lastScrape: 0,
  });
}

export async function unsubscribe(id) {
  await Database('subscriptions')
  .where('id', id)
  .delete();

  // Delete all videos related to channel from feed.
  await Database('feed')
  .where('channel', id)
  .delete();
}

export async function isSubscribed(id) {
  return !!(await Database('subscriptions').where('id', id).first());
}