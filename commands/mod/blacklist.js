const { MessageEmbed } = require("discord.js");
const db = require('quick.db');

module.exports = {
    config: {
        name: "blacklist",
        description: "blacklist a member in the discord!",
        usage: "[name | nickname | mention | ID] <reason> (optional)",
    },
    run: async (bot, message, args) => {
        try {
            if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("**You Dont Have Permmissions To blacklist Someone! - [MANAGE_GUILD]**");

            if (!message.guild.me.hasPermission("MANAGE_GUILD")) return message.channel.send("**I Don't Have Permissions To blacklist Someone! - [MANAGE_GUILD]**")
            if (!args[0]) return message.channel.send("**Please Enter A User To Be blacklisted!**");

            var blacklist = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(r => r.user.username.toLowerCase() === args[0].toLocaleLowerCase()) || message.guild.members.cache.find(ro => ro.displayName.toLowerCase() === args[0].toLocaleLowerCase());
            if (!blacklist) return message.channel.send("**Please Enter A Valid User To Be blacklisted!**");

            if (blacklist === message.member) return message.channel.send("**You Cannot blacklist Yourself!**")
            if (blacklist.roles.highest.comparePositionTo(message.guild.me.roles.highest) >= 0) return message.channel.send('**Cannot blacklist This User!**')

            let reason = args.slice(1).join(" ");
            if (blacklist.user.bot) return message.channel.send("**Cannot blacklist Bots!**");
            const userRoles = blacklist.roles.cache
                .filter(r => r.id !== message.guild.id)
                .map(r => r.id)

            let blacklistrole;
            let dbblacklist = await db.fetch(`blacklistrole_${message.guild.id}`);
            let blacklistrole = message.guild.roles.cache.find(r => r.name === "blacklisted")

            if (!message.guild.roles.cache.has(dbblacklist)) {
                blacklistrole = blacklistrole
            } else {
                blacklistrole = message.guild.roles.cache.get(dbblacklist)
            }

            if (!blacklistrole) {
                try {
                    blacklistrole = await message.guild.roles.create({
                        data: {
                            name: "blacklisted",
                            color: "#514f48",
                            permissions: []
                        }
                    })
                    message.guild.channels.cache.forEach(async (channel) => {
                        await channel.createOverwrite(blacklistrole, {
                            SEND_MESSAGES: false,
                            ADD_REACTIONS: false,
                            SPEAK: false,
                            CONNECT: false,
                        })
                    })
                } catch (e) {
                    console.log(e);
                }
            };

            if (blacklist.roles.cache.has(blacklistrole.id)) return message.channel.send("**User Is Already blacklisted!**")

            db.set(`blacklistid_${message.guild.id}_${blacklist.id}`, userRoles)
          try {
            blacklist.roles.set([blacklistrole.id]).then(() => {
                blacklist.send(`**Hello, You Have Been blacklisted In ${message.guild.name} for - ${reason || "No Reason"}`).catch(() => null)
            })
            } catch {
                blacklist.roles.set([blacklistrole.id])                               
            }
                if (reason) {
                const sembed = new MessageEmbed()
                    .setColor("GREEN")
                    .setAuthor(message.guild.name, message.guild.iconURL())
                    .setDescription(`${blacklist.user.username} was successfully blacklisted for ${reason}`)
                message.channel.send(sembed);
                } else {
                    const sembed2 = new MessageEmbed()
                    .setColor("GREEN")
                    .setDescription(`${blacklist.user.username} was successfully blacklisted`)
                message.channel.send(sembed2);
                }
            
            let channel = db.fetch(`modlog_${message.guild.id}`)
            if (!channel) return;

            let embed = new MessageEmbed()
                .setColor('RED')
                .setThumbnail(blacklist.user.displayAvatarURL({ dynamic: true }))
                .setAuthor(`${message.guild.name} Modlogs`, message.guild.iconURL())
                .addField("**Moderation**", "mute")
                .addField("**blacklist**", blacklist.user.username)
                .addField("**Moderator**", message.author.username)
                .addField("**Reason**", `${reason || "**No Reason**"}`)
                .addField("**Date**", message.createdAt.toLocaleString())
                .setFooter(message.member.displayName, message.author.displayAvatarURL())
                .setTimestamp()

            var sChannel = message.guild.channels.cache.get(channel)
            if (!sChannel) return;
            sChannel.send(embed)
        } catch {
            return;
        }
    }
}