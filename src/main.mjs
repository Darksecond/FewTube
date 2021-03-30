import { Router } from "./router.mjs";

// Jobs
import "./jobs/scrape.mjs";

// Routes
import "./routes/watch.mjs";
import "./routes/channel.mjs";
import "./routes/feed.mjs";

Router.listen(3000);