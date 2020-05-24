const { Command } = include("bucket/index");
const moment = require('moment');

module.exports = class UserInfoCommand extends Command {
    constructor(...args) {
        super(...args, {
            name: 'userinfo',
            group: 'info',
            aliases: ['user'],
            cooldown: 5,
            description: 'View ping bot',
            options: {
                guildOnly: true,
                localeKey: "whois"
            },
            usage: [{
                name: 'member',
                displayName: 'id/@mention/name',
                type: 'member',
                optional: true
            }]
        });
    }

    handle({ args, client, msg, store }, responder) {
        let user = args.member ? args.member[0].id : msg.member.user.id
        user = msg.channel.guild.members.get(user)
        const permission = Object.entries(user.permission.json).filter((r) => r[1] === true) || "0"
        let clientStatus = user.clientStatus ? Object.entries(user.clientStatus).filter((s) => s[1] !== "offline") : null
        const userRoles = user.roles.map(r => msg.channel.guild.roles.get(r))
        const rolesOrder = userRoles.sort((a, b) => b.position - a.position)

        moment.locale(store.settings.locale)

        const embed = new client.embed
        embed
            .title(responder.t('{{title}}'))

            /** 
              *field `user status` @online @idle @dnd @offline
              */
            .field('Status', responder.t(`{{status.${user.status}}}`), true)

            .field('Mention', user.mention, true)
            .field('ID', user.id, true)

            /** 
             *field `user client status` @mobile @web @desktop
             */
            .field(responder.t('{{clientStatus}}'),
                `\`\`\`Markdown\n# ${clientStatus ? clientStatus.map((r) => r[0]).join(" ") : "None"}\`\`\``, true)

            /** 
             *field `user playing` @playing or @none
             */

            .field(responder.t('{{gamming}}'),
                `\`\`\`Markdown\n# ${user.game ? user.game.name : "none"}\`\`\``, true)

            /** 
             *field `user days entry server`
             */
            .field(responder.t('{{entry_server}}'), responder.t('{{day_entry}}', {
                days: moment().diff(user.joinedAt, "days") || "0"
            }), true)

            /** 
             *field `user days create account`
             */
            .field(responder.t('{{create_account}}'), responder.t('{{day_entry}}', {
                days: moment().diff(user.createdAt, "days") || "0"
            }), true)

            /** 
             *field `user roles in server`
             */
            .field(responder.t('{{roles}}', { length: user.roles.length || "0" }),
                rolesOrder.map(r => `<@&${r.id}>`).join(', ') || "None", true)

            /** 
             *field `user is bot` @true or @false
             */
            .field('Bot', user.bot ? "``true``" : "``false``", true)
            .color(user.color)
            .thumbnail(user.user.dynamicAvatarURL())
            .timestamp()

        /** 
         *field `user nickname` case you have nickname
         */
        if (user.nick) embed.field(responder.t('{{nickname}}'), user.nick, true)

        /** 
         *field `list permissions user in server`
         */
        embed.field(responder.t('{{permissions}}', { length: permission.length || "0" }),
            `\`\`\`CSS\n${permission.map(r => r[0]).join(" | ")}\`\`\``, false)

        return responder.embed(embed).send().catch(this.logger.error)
    }
}