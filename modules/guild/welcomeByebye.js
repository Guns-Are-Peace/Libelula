const { Module } = include("bucket");
const moment     = require('moment');

module.exports = class botGuild extends Module {
    constructor(...args) {
        super(...args, {
            name: "welcommer",
            events: {
                guildMemberAdd: 'onJoin',
                guildMemberDelete: 'onLeave'
            }
        });
    };
    init() {
        return this.db = this._client.plugins.get('store');
    };
    get tags() {
        'user',
        'userName',
        'guild',
        'date',
        'members',
        'humans'
    };
    async onJoin(guild, member) {
        const gData = await this.db.fetchGuild(guild.id);
        if (!gData.modules.welcome.channel || !gData.modules.welcome) return;
        
        let chan = gData.modules.welcome.channel;
        let msg  = gData.modules.welcome.text;

        this.send(chan, this.i18n.shift(msg, {
            user: member.mention,
            guild: guild.name,
            userName: member.user.username,
            date: moment(moment()).format('lll'),
            members: guild.members.size,
            humans: guild.members.filter(m => m.bot).length
        }))
        .catch(e => this.logger.error('Error while sending welcome message', e));
        typeof gData.modules.autorole == 'object'
        && member.addRole(gData.modules.autorole, "Autorole system - Jasper")
        .catch(e => this.logger.error('Error while setting autorole.', e));
    };
    async onLeave(guild) {
        const gData = await this.db.fetchGuild(guild.id);
        if (!gData.modules.welcome.channel || !gData.modules.welcome) return;
        
        let chan = gData.modules.welcome.channel;
        let msg  = gData.modules.welcome.text;

        this.send(chan, this.i18n.shift(msg, {
            user: member.mention,
            guild: guild.name,
            userName: member.user.username,
            date: moment(moment()).format('lll'),
            members: guild.members.size,
            humans: guild.members.filter(m => m.bot).length
        }))
        .catch(e => this.logger.error('Error while sending welcome message', e));
    };
};