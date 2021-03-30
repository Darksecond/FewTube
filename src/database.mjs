import knex from "knex";

export const Database = knex({
  client: 'sqlite3',
  connection: {
    filename: './database.sqlite'
  },
  useNullAsDefault: true,
});

(async (tableName) => {
  if (await Database.schema.hasTable(tableName)) return;

  await Database.schema.createTable(tableName, table => {
    table.string('id').notNullable().primary();
    table.string('title');
    table.timestamp('lastScrape').notNullable(); //TODO index
    //TODO scrapeInterval
  });

  await Database(tableName).insert({
    id: 'UC5I2hjZYiW9gZPVkvzM8_Cw',
    title: 'Techmoan',
    lastScrape: 0,
  });

  await Database(tableName).insert({
    id: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
    title: 'Linus Tech Tips',
    lastScrape: 0,
  });
})('subscriptions');

(async (tableName) => {
  if (await Database.schema.hasTable(tableName)) return;

  await Database.schema.createTable(tableName, table => {
    table.string('id').notNullable().primary();
    table.string('title').notNullable();
    table.string('channel').notNullable();
    table.timestamp('published');
  });
})('feed');