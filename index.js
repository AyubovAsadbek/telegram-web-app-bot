const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const token = "7523807287:AAHbdfQrQJrmY_bELSRKZwdqE3eIiPmfMZs";

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

const bootstrap = () => {
  bot.setMyCommands([
    {
      command: "/start",
      description: "Bosh menu",
    },
    {
      command: "/courses",
      description: "Kurslar ro'yxati",
    },
  ]);

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start") {
      await bot.sendMessage(
        chatId,
        "Sammi.ac platformasida bor kurslarni sotib olishingiz mumkin",
        {
          reply_markup: {
            keyboard: [
              [
                {
                  text: "Kurslarni sotib olish",
                  web_app: {
                    url: "https://telegram-web-bot-two-hazel.vercel.app/",
                  },
                },
              ],
            ],
          },
        }
      );
    }

    if (text === "/courses") {
      await bot.sendMessage(chatId, "Kurslar ro'yxati", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Kurslarni sotib olish",
                web_app: {
                  url: "https://telegram-web-bot-two-hazel.vercel.app/",
                },
              },
            ],
          ],
        },
      });
    }

    if (msg.web_app_data?.data) {
      try {
        const data = JSON.parse(msg.web_app_data.data);

        await bot.sendMessage(
          chatId,
          "Bizning kurslarni sotib olganingiz uchun raxmat )) \n\n Sotib olgan kurslaringiz:"
        );

        for (item of data) {
          await bot.sendPhoto(chatId, item.image);

          await bot.sendMessage(chatId, `${item.title} - ${item.quantity}x`);

          await bot.sendMessage(
            chatId,
            `Umumiy narx: ${data
              .reduce((acc, item) => acc + item.price * item.quantity, 0)
              .toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}`
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
};

bootstrap();

app.post("/web-data", async (req, res) => {
  const { products, queryID } = req.body;
  try {
    await bot.answerWebAppQuery(queryID, {
      type: "article",
      id: queryID,
      title: "Muvaffaqiyatli xarid qildingiz",
      input_message_content: {
        message_text: `Xaridingiz bilan tabriklayman, siz ${products
          .reduce((acc, item) => acc + item.price * item.quantity, 0)
          .toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })} qiymatga ega kurs sotib oldingiz , ${products
          .map((c) => `${c.title} - ${c.quantity}x`)
          .join(", ")}`,
      },
    });
    return res.status(200).json({});
  } catch (error) {
    return res.status(500).json({});
  }
});

app.listen(process.env.PORT || 8000, () => {
  console.log("Server starting");
});
