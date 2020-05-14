const { Command } = include("bucket/index");
const moment = require('moment');

module.exports = class Avatar extends Command {
  constructor(...args) {
    super(...args, {
      name: "ct",
      options: { localeKey: "commands", adminOnly: false },
      usage: [
          { name: 'user', displayName: '@user', type: 'member', optional: true }
      ]
    })
  }
  async handle({ msg, args, client }, responder) {
    const data      = await this._client.plugins.get("store");
    const user      = args.user ? args.user[0] : msg.author;
    const target    = await data.users.findByPk(user.id) || null;

    if (!target || target.profile.aka.length == 0)
        return responder.format('emoji:mailbox').send(responder.t('{{aka.noResults}}', { user: user.username ? user.username : user.user.username }));
    
    const e       = new client.embed;
    const fetched = target.profile.aka;
    const result  = fetched.map(obj => `**${obj.tag}** - ${moment(obj.timestamp).format('llll')}`);

        return responder.embed(
            e.title(responder.t("{{aka.title}}", { user: user.username ? `${user.username}#${user.discriminator}` : `${user.user.username}#${user.user.discriminator}` })),
            e.description(result.join(`\n`),
            )
        ).send();
  };
};