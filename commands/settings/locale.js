const { Command } = include("bucket/index");

module.exports = class Avatar extends Command {
  constructor(...args) {
    super(...args, {
      name: "locale",
      aliases: ["language"],
      group: 'settings',
      options: { localeKey: "commands" },
    })
  }
  async handle({ msg, args, store, client }, responder) {

    const listIdiom = ['pt-BR', 'en-US', 'sp-SP']

    const lang = await responder.selection(listIdiom, { mapFunc: c => c });
    if (!lang.length) return 0

    store.cache().update({ "settings.locale": lang[0] });
    store.cache().save()
      .then(() => {
        responder.settings.lang = lang[0];
        responder.send(responder.t("{{set_lang}}", {
          user: msg.author.id
        }))
      });
  };
};