const { Command } = include("bucket/index");

module.exports = class Autorole extends Command {
  constructor(...args) {
    super(...args, {
      name: "autorole",
      aliases: [],
      group: 'modules',
      options: { localeKey: "autorole", adminOnly: false, modOnly: true },
      usage: [
         { name: 'action', type: 'string', displayName: "delete/create/info" , choices: ['delete', 'create', 'info'], optional: false },
         { name: 'role', type: 'role', optional: true }
             ]
    })
  };

  async handle({ msg, args, client, store }, responder) {
    switch (args.action) {
      case 'delete': {

        if (store.modules.autorole == null) return responder.error('{{deleteRejection}}');

        await store.update({ 'modules.autorole': null });
        await store.cache().save();
        return responder.success(responder.t('{{deletedSuccess}}'));
      };
      case 'create': {
        
        if (!args.role) return responder.error(responder.t('{{missingRole}}'));

        const role = args.role[0];
        const myself = msg.guild.members.get(client.user.id);

        if (role.position > myself.highestRole.position) 
          return responder.error(responder.t('{{myselfLowRole}}'));
        if (role.managed)
          return responder.error(responder.t('{{managedError}}'));
        
        await store.update({'modules.autorole': role.id });

        await store.cache().save();

        return responder.success(responder.t('{{success}}'));

      };
      case 'info': {
        console.log(store);
        if (store.modules.autorole == null) return responder.send('{{notSet}}');
        else return responder.format('emoji:info').send('{{getInfo}}', { role: `<@&${store.modules.autorole}>` });
      };
    };
  };
};