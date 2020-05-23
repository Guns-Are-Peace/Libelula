const { Command } = include("bucket/index");
const Reactor   = require('eris-reactions');

module.exports = class Avatar extends Command {
  constructor(...args) {
    super(...args, {
      name: 'ttt',
      group: 'games',
      options: { localeKey: "ttt", adminOnly: false },
      usage: [
          { name: 'user', displayName: '@user', type: 'member', optional: false }
      ]
    })
  }
  async handle({ msg, args }, responder) {

    if (args.user[0].id === this._client.user.id) return responder.error("{{rejection_error}}");
    if (args.user[0].ttt == true) return responder.error("{{rejection_inGame}}");
    if (msg.member.ttt == true) return responder.error("{{rejection_inGameAuthor}}");


    responder.send("{{challenge_request}}", { target: args.user[0].mention, challenger: `**${msg.author.username}**` }).then(async m => {
      await this._client.addMessageReaction(m.channel.id, m.id, '✅');
      await this._client.addMessageReaction(m.channel.id, m.id, '❎');

      const reactionHandler = new Reactor.continuousReactionStream(m, (userID) => userID === msg.author.id, true, { maxMatches: 1, time: 18000000 });
      reactionHandler.on('reacted', (r) => {

        if (r.emoji.name !== "✅") return m.edit({ content: responder.t('{{challenge_rejected}}', { target: args.user[0].mention, challenger: `**${msg.author.username}**` } )});

        this._client.deleteMessage(m.channel.id, m.id, "Jasper's ttt game :D");
        return this.startGame(msg, args, responder);
      });
    });
  };
  async startGame(msg, args, responder) {

    // Setting up member's playing status

    msg.member.ttt = true;
    args.user[0].ttt = true;

    let 
    display = `0️⃣ 1️⃣ 2️⃣\n3️⃣ 4️⃣ 5️⃣\n6️⃣ 7️⃣ 8️⃣`,
    board = ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
    marks = ['⭕', '❌'];

    this.playerList = [msg.author.id, args.user[0].id];
    this.player     = 0;
    this.finish     = false;
    this.reactionArr;
    this.count      = 0;

    responder.send(responder.t('{{timeOf}}', { user: `<@${this.playerList[this.player]}>`, display: display })).then(async msg => {
      this.refreshReactions(msg, display);
      const reactionHandler = new Reactor.continuousReactionStream(msg, (Auth) => this.playerList.includes(Auth), true, { maxMatches: 9, time: 180000 })
      
      reactionHandler.on('reacted', async reaction => {
        if (this.playerList[this.player] !== reaction.userID) return; 

        display = display.replace(reaction.emoji.name, marks[this.player]);
        await this.markPosition(board, marks, msg, reaction.emoji.name, responder);

        if (!this.finish || this.count >= 9)
          await msg.edit({ content: responder.t('{{timeOf}}', { user: `<@${this.playerList[this.player]}>`, display: display }) });
      });
    });
  };
  async markPosition(board, marks, msg, emoji, responder) {

    let position    = this.reactionArr.indexOf(emoji);
    board[position] = marks[this.player];
    
    this.checkWin(board);

    if (this.finish == true) {
        await msg.edit({ content: responder.t('{{gameWin}}', { user: `<@${this.playerList[this.player]}>` }) })
    };

    if (!this.finish && this.count >= 9)
      return msg.edit({ content: "velha!" });
    
    if (this.player == 0) 
      return this.player = 1;
    else 
      return this.player = 0;
    };
    checkWin(board) {
            let winStates =[
                [0,1,2],
                [3,4,5],
                [6,7,8],
                [0,3,6],
                [1,4,7],
                [2,5,8],
                [0,4,8],
                [2,4,6],
            ];
            
            for (let i = 0; i < winStates.length; i++) {
              let sequence = winStates[i];

              let 
              pos1 = sequence[0], 
              pos2 = sequence[1], 
              pos3 = sequence[2];
 
              if ((board[pos1] == board[pos2] && board[pos1] == board[pos3]) && board[pos1] != 'x')
                return this.finish = true
              else continue;
        };
        this.count += 1;
        console.log(this.count)
        return this.finish = false;
      };
    async refreshReactions(message, display) {
      this.reactionArr = display.replace(/\n/g,' ').split(' ');
      for (const emoji of this.reactionArr) {
        await this._client.addMessageReaction(message.channel.id ,message.id, emoji);
      };
    };
};