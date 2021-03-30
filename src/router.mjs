import express from "express";
import fs from "fs";
import Mustache from "mustache";
import path from "path";

export const Router = express();

Router.engine('mustache', function(filePath, options, callback) {
  fs.readFile(filePath, function(err, content) {
    if (err) return callback(err);

    let rendered = Mustache.render(content.toString(), options);

    return callback(null, rendered);
  });
});

Router.use(express.static('assets'));
Router.set('view engine', 'mustache');
Router.set('views', path.resolve('src', 'views')) // specify the views directory