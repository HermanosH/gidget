//Load .env contents
import dotenv from 'dotenv';
dotenv.config();

//Database
import database from "./database/database.js";

//Registry for commands and events
import { registerCommands, registerEvents } from './utils/registry.js';

//Other packages
import puppeteer from "puppeteer";
import DBL from 'dblapi.js';

//Discord import
import Discord from 'discord.js';

//Discord.js extended structures
import './structures.js';
//Bot client
const bot = new Discord.Client({ partials: ["MESSAGE", "REACTION", "CHANNEL", "GUILD_MEMBER", "USER"], ws: { properties: { $browser: "Discord Android" }, intents: 32511 }, allowedMentions: { parse: [] }, presence: { status: "dnd", activity: { name: "Ready event (Loading...)", type: "LISTENING" } } });

//top.gg
if(process.env.EXTERNAL === "yes") {
  bot.dbl = new DBL(process.env.DBLKEY, bot);
  bot.dbl.on("posted", () => {
    console.log("tog.gg: Server count posted!");
  });
  bot.dbl.on("error", e => {
    console.error("top.gg: Error:", e);
  });
}

//Global definitions
global.botIntl = Intl.DateTimeFormat("en", { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/New_York", hour12: true, timeZoneName: "short" });
global.botVersion = "0.99 RC";
(async () => {
  //Puppeteer
  if (process.env.PUPPETEER !== "NO") {
    global.browser = await puppeteer.launch({
      headless: true, defaultViewport: {
        width: 1440,
        height: 900
      }, args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"]
    });
  }
  //Database
  if (process.argv[2] !== "ci") await database();
  //Commands
  await registerCommands("../commands");
  //Cache system
  bot.cachedMessageReactions = new Discord.Collection();
  bot.rrcache = new Discord.Collection();
  //Registers
  await registerEvents(bot, "../events");
  //Login with Discord
  if (process.argv[2] !== "ci") {
    await bot.login();
  } else process.exit();
})().catch(err => {
  console.log(err);
  setTimeout(() => process.exit(1), 1000);
});
process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", async err => {
  global.browser ? await global.browser.close() : undefined;
  bot.destroy();
  console.error("Uncaught exception: ", err);
  process.exit(1);
});