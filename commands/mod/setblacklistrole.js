const db = require("quick.db");

module.exports = {
  config: {
    name: "setblacklistrole",
    aliases: ["setblacklist", "sbrole", "sbr"],
    description: "Sets A blacklist Role For blacklisted Users!",
    usage: "[role name | role mention | role ID]",
  },
  run: async (bot, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR"))
      return message.channel.send(
        "**You Do Not Have The Required Permissions! - [ADMINISTRATOR]**"
      );
    if (!args[0]) {
      let b = await db.fetch(`blacklistrole_${message.guild.id}`);
      let roleName = message.guild.roles.cache.get(b);
      if (message.guild.roles.cache.has(b)) {
        return message.channel.send(
          `**blacklistrole Set In This Server Is \`${roleName.name}\`!**`
        );
      } else
        return message.channel.send(
          "**Please Enter A Role Name or ID To Set!**"
        );
    }

    let role =
      message.mentions.roles.first() ||
      bot.guilds.cache.get(message.guild.id).roles.cache.get(args[0]) ||
      message.guild.roles.cache.find(
        c => c.name.toLowerCase() === args.join(" ").toLocaleLowerCase()
      );

    if (!role)
      return message.channel.send("**Please Enter A Valid Role Name or ID!**");

    try {
      let a = await db.fetch(`blacklistrole_${message.guild.id}`);

      if (role.id === a) {
        return message.channel.send(
          "**This Role is Already Set As blacklistrole!**"
        );
      } else {
        db.set(`blacklistrole_${message.guild.id}`, role.id);

        message.channel.send(
          `**\`${role.name}\` Has Been Set Successfully As blacklistrole!**`
        );
      }
    } catch (e) {
      return message.channel.send(
        "**Error - `Missing Permissions or Role Doesn't Exist!`**",
        `\n${e.message}`
      );
    }
  }
};