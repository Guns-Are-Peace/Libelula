const { Command } = include("bucket/index");
const Reactor   = require('eris-reactions');

module.exports = class Avatar extends Command {
  constructor(...args) {
    super(...args, {
      name: 'ttt',
      group: 'games',
      options: { localeKey: "commands", adminOnly: false },
      usage: [
          { name: 'user', displayName: '@user', type: 'member' }
      ]
    })
  }
  async handle({ msg, args }, responder) {

    let responses = await msg.channel.awaitMessages(m => m.content === "yes", { time: 10000, maxMatches: 1 });
    responses.on('reacted', (reacted) => { console.log(reacted) });
  };
  async startGame(msg, args, responder) {
    
    let 
    display = `0️⃣ 1️⃣ 2️⃣\n3️⃣ 4️⃣ 5️⃣\n6️⃣ 7️⃣ 8️⃣`,
    board = ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
    marks = ['⭕', '❌'];

    this.playerList = [msg.author.id, args.user[0].id];
    this.player     = 0;
    this.finish     = false;
    this.reactionArr;
    this.count      = 0;

    responder.send(responder.t('{{ttt.timeOf}}', { user: `<@${this.playerList[this.player]}>`, display: display })).then(async msg => {
      this.refreshReactions(msg, display);
      const reactionHandler = new Reactor.continuousReactionStream(msg, (Auth) => this.playerList.includes(Auth), true, { maxMatches: 9, time: 180000 })
      
      reactionHandler.on('reacted', async reaction => {
        if (this.playerList[this.player] !== reaction.userID) return; 

        display = display.replace(reaction.emoji.name, marks[this.player]);
        await this.markPosition(board, marks, msg, reaction.emoji.name, responder);

        if (!this.finish || this.count >= 9)
          await msg.edit({ content: responder.t('{{ttt.timeOf}}', { user: `<@${this.playerList[this.player]}>`, display: display }) });

      });
    });
  };
  async markPosition(board, marks, msg, emoji, responder) {

    let position    = this.reactionArr.indexOf(emoji);
    board[position] = marks[this.player];
    
    this.checkWin(board);

    if (this.finish == true) {
        await msg.edit({ content: responder.t('{{ttt.gameWin}}', { user: `<@${this.playerList[this.player]}>` }) })
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