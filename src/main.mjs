import { Router } from "./router.mjs";

// Jobs
import "./jobs/scrape.mjs";

// Routes
import "./routes/watch.mjs";
import "./routes/channel.mjs";

Router.listen(3000);