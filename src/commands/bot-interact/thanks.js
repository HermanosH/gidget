import { MessageAttachment, MessageEmbed } from 'discord.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Thanks";
    }
    async run(bot, message) {
        const att = new MessageAttachment("https://contributors-img.web.app/image?repo=AndreMor955/gidget", "contributors.png");
        const embed = new MessageEmbed()
        .attachFiles([att])
        .setTitle("Some of the people who helped in some way with this project =D")
        .addField((await bot.users.fetch("455891977712566274")).tag, "Current bot hosting.")
        .addField((await bot.users.fetch("398321973404368927")).tag, "https://gidget.xyz domain (1 year)")
        .addField((await bot.users.fetch("224619540263337984")).tag, "Access to a free VPS :)")
        .addField((await bot.users.fetch("756733721171984444")).tag, "Support server creation and design")
        .addField("GitHub", "[Those who contributed to the bot code](https://github.com/AndreMor955/gidget/graphs/contributors)")
        .setImage("attachment://contributors.png");
        await message.channel.send(embed);
    }
}
