
import Discord from 'discord.js';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Random images";
        this.permissions = {
            user: [0, 0],
            bot: [0, 16384]
        }
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send('First give me a search term.')
        await image(message, args);
    }
}

/**
 * @param message
 * @param args
 */
async function image(message, args) {

    let options = {
        method: "GET",
        headers: {
            "Accept": "text/html",
            "User-Agent": "Chrome"
        }
    };

    const response = await fetch("http://results.dogpile.com/serp?qc=images&q=" + args.slice(1).join(" "), options)
    const responseBody = await response.text()
    let $ = cheerio.load(responseBody);

    let links = $(".image a.link");

    let urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));

    if (!urls.length) {
        return message.channel.send("I didn't find anything.");
    }

    let i = 0;
    let max = urls.length - 1;
    const embed = new Discord.MessageEmbed()
        .setTitle("Image search: " + args.slice(1).join(" "))
        .setDescription(`Use the reactions to move from one image to another`)
        .setFooter(`${i + 1}/${max + 1}`)
        .setImage(urls[i])
        .setColor("RANDOM")

    const filter = (reaction, user) => {
        return ['◀️', '▶️', '⏹️'].includes(reaction.emoji.name) && user.id === message.author.id;
    };
    let msg = await message.channel.send(embed);
    await msg.react('◀️');
    await msg.react('▶️');
    await msg.react('⏹️');

    let collector = msg.createReactionCollector(filter, { idle: 20000 });
    collector.on('collect', async (reaction, user) => {
        if (reaction.emoji.name === '▶️') {

            if (message.guild && message.channel.permissionsFor(message.client.user).has("MANAGE_MESSAGES")) {
                await reaction.users.remove(user.id);
            }
            if (max !== i) {
                i++
                embed.setImage(urls[i])
                embed.setFooter(`${i + 1}/${max + 1}`)
                await msg.edit(embed);
            }
        }
        if (reaction.emoji.name === '◀️') {
            if (message.guild && message.channel.permissionsFor(message.client.user).has("MANAGE_MESSAGES")) {
                await reaction.users.remove(user.id);
            }
            if (i !== 0) {
                i--
                embed.setImage(urls[i])
                embed.setFooter(`${i + 1}/${max + 1}`)
                await msg.edit(embed);
            }
        }
        if (reaction.emoji.name === '⏹️') {
            collector.stop();
        }
    })
    collector.on('end', () => {
        if (message.guild && message.channel.permissionsFor(message.client.user).has("MANAGE_MESSAGES")) { msg.reactions.removeAll() }
    });
}