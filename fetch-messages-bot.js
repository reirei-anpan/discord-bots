require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});
const token = process.env.DISCORD_TOKEN; // 実際のトークンに置き換えてください

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  // 特定のチャンネルIDを指定
  const targetChannelId = process.env.TARGET_CHANNEL_ID;
  // 特定のユーザーIDを指定
  const targetUserId = process.env.TARGET_USER_ID;

  if (message.channel.id === targetChannelId && message.content === '!fetchMessages') {
    try {
      let lastId;
      let allMessages = [];
      let fetchAgain = true;

      while (fetchAgain) {
        const options = { limit: 100 };
        if (lastId) {
          options.before = lastId;
        }

        const fetchedMessages = await message.channel.messages.fetch(options);
        if (fetchedMessages.size === 0) break;

        fetchedMessages.forEach(msg => {
          // 特定のユーザーによって投稿されたメッセージのみを追加
          if (msg.author.id === targetUserId) {
            allMessages.push(msg);
          }
          lastId = msg.id;
        });

        if (fetchedMessages.size < 100) {
          fetchAgain = false;
        }
      }

      console.log(`Message ID: ${targetUserId}`);
      const seenDates = new Set(); // 出力済みの日付を追跡するセット
      allMessages.forEach(msg => {
        const postedAt = msg.createdAt;
        const formattedDate = postedAt.getFullYear() + '-' +
                              String(postedAt.getMonth() + 1).padStart(2, '0') + '-' +
                              String(postedAt.getDate()).padStart(2, '0');

        if (!seenDates.has(formattedDate)) {
          seenDates.add(formattedDate);
          console.log(`Posted at: ${formattedDate}`);
        }
      });

    } catch (error) {
      console.error(error);
    }
  }
});

client.login(token);
