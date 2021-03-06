const Command = include("bucket/structures/Command");

module.exports = class Autorole extends Command {
    constructor(...args) {
        super(...args, {
            name: "welcome",
            aliases: [],
            group: 'modules',
            options: { localeKey: "welcome", modOnly: true },
        })
    }
    async handle(container, responder) {
        responder.selection(['set', 'get', 'enable', 'disable'], {
            title: "{{configTitle}}",
            mapFunc: ch => responder.t(`{{${ch}}}`)
        }).then(arg => arg.length ? this[arg[0]](container, responder) : false)
    }
    async get({ msg, store }, responder) {
      if (!store.modules.welcome) {
        responder.error(responder.t("{{rejectMessageRequest}}"));
        return 0;
      } else {
        responder.format("emoji:info").send(store.modules.welcome.text);
        return 1;
      }
    }
    async set ({ msg, args, store, client }, responder) {
        responder.selection(["edit", "delete"], {
            title: "{{configure.title}}",
            mapFunc: ch => responder.t(`{{configure.${ch}}}`)
        }).then(arg => arg.length ? this[arg[0]]({ msg, args, store, client}, responder) : false);
      };
    async enable({msg, store }, responder) {
      if(!store.modules.welcome.channel) {
        responder.error("{{configure.enable.rejection}}");
        return 0;
      };
      const inframodules = store.modules.welcome;
      inframodules.channel = msg.channel.id;
      store.update({ "inframodules": inframodules });
      store.cache().save().then(() => {
        store.save();
        responder.success("{{configure.enable.success}}");
        return 1;
      });
    }
    async disable({msg, store}, responder) {
        if(!store.modules.welcome) {
          responder.error("{{configure.disable.rejection}}");
          return 0;
        };
        const inframodules = store.modules.welcome;
        inframodules.channel = null;
        store.update({ "inframodules": inframodules });
        store.cache().save().then(() => {
          store.save();
          responder.success("{{configure.disable.success}}");
          return 1;
        });
    }
    async edit ({ msg, args, store, client }, responder) {
      responder.format("emoji:info").dialog([{ prompt:responder.t("{{configure.edit_prompt.typerequest}}", { user: msg.author.id }), input: {type: "string", name: "text"}}]).then(args => {
       const text = args.text;
        if(text.length < 5) {
          responder.error(responder.t("{{configure.edit_prompt.lessThan}}"));
          return 0;
        };
        if(text.length > 1500) {
          responder.error(responder.t("{{configure.edit_prompt.higherThan}}"));
          return 0;
        };
       if(!store.modules.welcome) {
         store.update({ "modules.welcome": { "channel": msg.channel.id, "text": text  }  });
         store.save().then(() => {
           responder.success(responder.t("{{configure.edit_prompt.success}}"));
           return 1;
         })
       } else {
         const inframodules = store.modules.welcome
         inframodules.text = text;
         store.cache().update({ "modules.welcome": inframodules });
         store.cache().save().then(() => {
           responder.success(responder.t("{{configure.edit_prompt.success}}"));
           return 1;
         })
       }
      })
    }
    async delete({store}, responder) {
      let inframodules = store.modules;
      if (!inframodules) {
        responder.error(responder.t("{{configure.delete_prompt.reject}}"));
        return 0;
      }
      delete inframodules.welcome;
      store.update({ "modules": inframodules });
      store.cache().save().then(() => {
        store.save();
        responder.success(responder.t("{{configure.delete_prompt.success}}"));
        return 1;
      })
    }
}