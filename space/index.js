const koa = require("koa");
const path = require("path");
const render = require("koa-ejs");
const koaRouter = require("koa-router");
const axios = require("axios");
const { profile } = require("../server/api.js");

const app = new koa();
const router = new koaRouter();

render(app, {
  root: path.join(__dirname, "views"),
  layout: "index",
  viewExt: "html",
});

router.get("/", async (ctx) => {
  const label = ctx.host.split(".")[0];
  console.log(label);
  const user_profile = await profile(label);

  return ctx.render("index", {
    profile: user_profile,
  });
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`running on port:${PORT}`));
