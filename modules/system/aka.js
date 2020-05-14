const { Module } = include("bucket");

module.exports = class Ready extends Module {
    constructor(...args) {
        super(...args, {
            name: "aka:jasper",
            events: { userUpdate: "fire" }
        })
    }
    async init() {
        this.data  = await this._client.plugins.get("store");
    };
    async fire(user, oldUser) {
        let target = await this.data.users.findByPk(user.id);
        if (!target) {
            target = await this.data.users.create({ id: user.id, profile: { aka: [] } });
            return this.resolveNames(user, oldUser, target);
        };
        this.resolveNames(user, oldUser, target);
    };
    async resolveNames(after, before, target) {
        if ((before.username == after.username) && (before.discriminator == after.discriminator)) return;
        
        const tagArray = target.profile.aka;
        const uname = before.username !== after.username ? after.username : before.username;
        const discr = before.discriminator !== after.discriminator ? after.discriminator : before.discriminator;

        console.log(tagArray);
        if (tagArray.length == 10) tagArray.pop();

        tagArray.push({ tag: uname + '#' + discr, timestamp: Date.now() });
        await target.update({
            "profile.aka": tagArray
        })
        .then(async () => {
            await target.cache().save();
            this._client.logger.info(`New A.K.A added to: ${after.id}.`)
        });
    };
};