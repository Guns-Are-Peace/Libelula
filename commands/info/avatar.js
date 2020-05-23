const { Command } = include("bucket/index");

module.exports = class InviteCommand extends Command {
    constructor(...args) {
        super(...args, {
            name: 'avatar',
            group: 'info',
            aliases: ['av'],
            cooldown: 5,
            options: {
                guildOnly: true,
                localeKey: "commands"
            },
            usage: [
                {
                    name: 'user',
                    displayName: '<mention/id>',
                    type: 'member',
                    optional: true
                }
            ]
        })
    }

    async handle({ msg, args, client }, responder) {
        const target = args.user ? args.user[0] : msg.member;
        const embed  = new client.embed
        embed
        .title(responder.t("{{avatar.title}}", { user: target.user.username  }))    
        .color(11220318)
        .image(target.user.dynamicAvatarURL(null, 512))
        .footer(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL)

        return responder.send(msg.author.mention, { embed: embed });
    };
};