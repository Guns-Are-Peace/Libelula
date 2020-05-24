const { Command } = include('bucket/index')

module.exports = class RemoveRoleAll extends Command {
    constructor(...args) {
        super(...args, {
            name: 'removeroleall',
            group: 'moderation',
            aliases: ['removera', 'rra'],
            cooldown: 5,
            description: 'Remove a single role from all the server members.',
            options: {
                guildOnly: true,
                localeKey: "rra",
                permissions: ['manageRoles']
            },
            usage: [{
                name: 'role',
                displayName: '<@role>',
                type: 'role',
                optional: false
            }]
        })
    }

    async handle({ args, msg, client }, responder) {
        const role = args.role[0];
        const memberLength = msg.guild.memberCount

        const msg_responder = await msg.channel.createMessage(`Remover role de \`\`${memberLength}\`\` membros`)
        let success = 0
        let error = 0

        msg.guild.members.map(member => {
            member.removeRole(role.id, "Command remove role all")
                .then(() => {
                    msg_responder.edit(responder.t("{{edited}}", { success: ++success,  memberLength: memberLength, errors: error }));
                })
                .catch(() => {
                    msg_responder.edit(responder.t("{{edited}}", { success: ++success,  memberLength: memberLength, errors: ++error }));
                })
        })
    };
}