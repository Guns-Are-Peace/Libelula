const { Command } = include("bucket/index");

module.exports = class Avatar extends Command {
  constructor(...args) {
    super(...args, {
      name: "level",
      aliases: ["levelling"],
      group: 'modules',
      options: { localeKey: "commands", adminOnly: true }
    });
  };
  async handle(container, responder) {
    responder.selection(['setup', 'delete', 'reset'], {
        title: "{{level.summary}}",
        mapFunc: ch => responder.t(`{{level.options.${ch}}}`)
    }).then(arg => arg.length ? this[arg[0]](container, responder) : false)
  };
  setup ({ msg, client, store }, responder) {
      if (typeof store.modules.levelSystem == Object) return responder.error('{{alreadyInstalled}}');
      responder.format("emoji:floppy_disk").dialog(
      [{ 
      prompt:responder.t("{{level.setupDialog.askConfirm}}"),
      input: {type: "string", name: "option", choices: ['confirm', 'cancel']}}
      ])
      .then(async args => {
        if (args.option == 'confirm') {
        let x     = 0;
        let roles = {};
        while (x <= 10){
          let roleName = x == 0 ? `Level 1` : `Level ${x}0`;  
          await client.createRole(msg.channel.guild.id, { name: roleName })
          .then(role =>{
            roles[x == 0 ? x : `${x}0`] = role.id;
            x++;
          });
        };
        store.update({ "modules.levelSystem": { roles: roles, members: {}, message: "Congratulations {{user}}! You're now on level {{level}}" }});
        await store.cache().save();
        return responder.success("{{level.setupDialog.confirmSuccess}}");
        } else {
        return responder.success("{{level.setupDialog.InstallCancel}}");
        }
      });
  };
  delete ({ msg, client, store }, responder) {
    if (!store.modules.levelSystem) return responder.error('{{level.deleteDialog.notInstalled}}');
    try {
      let toUpdate = store.modules;
      delete toUpdate.levelSystem;
      store.update({ "modules": toUpdate });
      store.cache().save().then(() => {
        responder.success('{{level.deleteDialog.deleteSuccess}}');
      });
    } catch {
      client.logger.error(`Não pude deletar o módulo de níveis em ${msg.channel.guild.name} (${msg.channel.guild.id})`);
    }
  };
};