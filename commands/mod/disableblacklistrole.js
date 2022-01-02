const db = require('quick.db');

module.exports = {
    config: {
        name: "disableblackkistrole",
        aliases: ['clearblacklistrole', 'dbr', 'disablebr', 'dbrole'],
        description: 'Disables Server Blacklist Role',
        usage: '[role name | role mention | role ID]',
    },
    run: async (bot, message, args) => {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("**You Do Not Have The Required Permissions! - [ADMINISTRATOR]**")

        try {
            let a = db.fetch(`blacklistrole_${message.guild.id}`)

            if (!a) {
                return message.channel.send("**There Is No Blacklist Set To Disable!**")
            } else {
                let role = message.guild.roles.cache.get(a)
                db.delete(`blacklistrole_${message.guild.id}`)

                message.channel.send(`**\`${role.name}\` Has Been Successfully Disabled**`)
            }
            return;
        } catch {
            return message.channel.send("**Error - `Missing Permissions or Role Doesn't Exist`**")
        }
    }
}