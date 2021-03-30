import knex from "knex";

export const Database = knex({
  client: 'sqlite3',
  connection: {
    filename: './database.sqlite'
  }
});

(async () => {
  if (!await db.schema.hasTable('test'))
    await db.schema.createTable('test', table => {
      table.string('test');
    });
})();

/*
Videos
  id
  title
  publishDate
  info -> json
  rss -> json
  infoScrapeDate
*/

/*
Channels
  id
  title
  lastScrape
  scrapeInterval
*/