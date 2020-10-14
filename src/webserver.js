import { bot } from './index.js';
import http from 'http';
http.createServer((req, res) => {
  if (req.headers.pass !== process.env.ACCESS) {
    res.statusCode = 403;
    res.end("You don't have authorization");
    return;
  }
  try {
    const todelete = new URL(req.url).searchParams.get("delete");
    if (todelete) deleteCache(todelete);
    res.statusCode = 200;
    res.end("Good.");
  } catch (err) {
    console.log(err);
    res.statusCode = 500
    res.end("Something happened! " + err);
  }
})
function deleteCache(guildID) {
  bot.cachedMessageReactions.delete(guildID);
  bot.rrcache.delete(guildID);
  const guild = bot.guilds.cache.get(guildID);
  if (guild) {
    guild.cache.prefix = false;
    guild.cache.customresponses = false;
    guild.cache.levelconfig = false;
    guild.cache.welcome = false;
    guild.cache.messagelinksconfig = false;
    return true;
  } else return false
}