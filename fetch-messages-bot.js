require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const token = process.env.DISCORD_TOKEN;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// メッセージが作成された時のイベントリスナー
client.on('messageCreate', async message => {
  // 特定のチャンネルでコマンドが使用されたかチェック
  if (message.channel.id === process.env.TARGET_CHANNEL_ID && message.content === '!fetchMessages') {
    try {
      // メッセージ取得の初期設定
      let lastId;
      let allMessages = [];

      // 全メッセージを取得するまでループ
      while (true) { // 無限ループを開始（明示的にbreakで抜ける）
        const options = { limit: 100 };
        if (lastId) options.before = lastId; // lastIdがある場合のみbeforeオプションを設定

        const fetchedMessages = await message.channel.messages.fetch(options);
        if (fetchedMessages.size === 0) break; // メッセージがなければループ終了

        fetchedMessages.forEach(msg => {
          if (msg.author.id === process.env.TARGET_USER_ID) {
            allMessages.push(msg); // 特定のユーザーのメッセージのみ追加
          }
          lastId = msg.id; // 次の取得の基準となるメッセージIDを更新
        });

        if (fetchedMessages.size < 100) break; // 取得メッセージ数が100未満なら全メッセージ取得済み
      }

      // 取得したメッセージの日付を集計
      const seenDates = new Set(); // 各日付のメッセージを一度だけ処理するためのセット
      allMessages.forEach(msg => {
        // メッセージ投稿日のフォーマット
        const postedAt = msg.createdAt;
        const formattedDate = postedAt.getFullYear() + '-' +
                              String(postedAt.getMonth() + 1).padStart(2, '0') + '-' +
                              String(postedAt.getDate()).padStart(2, '0');

        // 同じ日付のメッセージは一度だけ表示
        if (!seenDates.has(formattedDate)) {
          seenDates.add(formattedDate);
          console.log(`Posted at: ${formattedDate}`);
        }
      });

    } catch (error) {
      console.error(error); // エラー発生時の処理
    }
  }
});


client.login(token);
