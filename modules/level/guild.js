// Importing source modules
const Module = include("bucket/structures/Module");
const { randomize } = include("bucket/util/Utils");

// Importing NPM modules
const chalk = require("chalk");
const moment = require("moment");


module.exports = class LevelSystem extends Module {
    constructor(...args) {
        super(...args, {
            name: "guild:leveller",
            events: {
                messageCreate: "context"
            }
        })
        this.controller = new Map();
    }
    async init() {
        this.data  = await this._client.plugins.get("store");
    };
    async context(message) {
        if (!message.channel.guild) return;
        if (message.author.bot) return;   
        
        const store = await this.data.fetchGuild(message.channel.guild.id);

        if (!store.modules.levelSystem) return;

        /**
         * Checking if the member was in the DB. If not, create the default xp-card.
         * 
         * @store -> @PolarisStore AKA Database instance;
         * @target -> Member in the @PolarisStore context;
         * @guild -> The guild who the @message was readed;
         */

        const members       = store.modules.levelSystem.members;
        const target        = members[message.author.id];
        const member        = message.channel.guild.members.get(message.author.id);
        const guild         = message.channel.guild;

        if (!target) {
            members[message.author.id] = ({ "id": message.author.id, "experience": 0 });
            return await store.cache().update({ "levelSystem.members": members });
        };

        const oldLevel      = await this.calculateLevel(target.experience);
        this.addExp(guild.members.get(message.author.id), target, store, members);
        const newLevel    = await this.calculateLevel(members[message.author.id].experience);

        if (oldLevel != newLevel) {
            this.levelUp(message, store, member, newLevel);
        };
    };
    async addExp(contextMember, target, store, members) {

        /**
         * @contextMember -> The member in the API context;
         * @target -> The member in @PolarisStore context;
         * @Generated -> Random number between 15-25;
         * @newEXP -> Member previous exp count + @Generated ;
         * @members -> @Array instance of @PolarisStore server'bgbs context;
         * @memberIndex -> Member's position at @PolarisStore server's specific @members
         */

        if(moment().diff(contextMember.cooldown || 0) < 0) return false;

        const Generated   = randomize(15, 25);
        const newEXP      = target.experience + Generated;

        members[contextMember.id].experience = newEXP;
        

        store.cache().update({ "levelSystem.members": members });
        store.cache().save().then(() => {
            contextMember.cooldown = moment().add(1, 'minute');
            this._client.logger.info(chalk.yellow(`[LEVEL]: ${chalk.white(contextMember.user.tag)} earned ${Generated + " exp"} on "${chalk.green.bold(contextMember.guild.name)}"`));
        })
    }
    async getNeeded(level) {
        return 5 * (Math.pow(level, 2)) + 60 * level + 100;
    }
    async calculateLevel(experience) {
        let level = 0;
        while(experience >= await this.getNeeded(level)) {
            experience -= await this.getNeeded(level);
            level++;
        }
        return level;
    }
    async levelUp(message, store, member, newLevel) {
        const text    = store.modules.levelSystem.message;
        const rewards = store.modules.levelSystem.roles;
        message.channel.createMessage(text.replace("{{user}}", `<@${member.id}>`).replace("{{level}}", `**${newLevel}**`)).then((msg) => {
            if (newLevel == 1) {
                try {
                 member.addRole(rewards["0"])
                } catch (e) {
                    return
                }
            };
            if (newLevel >= 10 && rewards[newLevel] != null) {
                return new Promise((resolve) => {
                    const New    = msg.channel.guild.roles.get(rewards[newLevel]);
                    const Old    = msg.channel.guild.roles.get(rewards[newLevel == 10 ? 0 : newLevel - 10]);
                    try {
                        if(New) return member.addRole(New.id, 'Lapsus level system!').then(() => {
                            if (Old) {
                                member.removeRole(Old.id, 'Lapsus level system!');
                                return resolve();
                            } else {
                                return resolve();
                            }
                        })
                    } catch(e) {
                        this._client.logger.error(e);
                        return resolve();
                    }
                })
            }
        });
    }
}