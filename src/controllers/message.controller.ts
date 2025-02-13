import { api } from "../configs/chatAPI.config";
import {
  getMessagesOfSender, removeMessagesOfSender,
  saveConversation,
  updateSingleMessageFromSender,
} from "../services/data.service";
import { SendMessageOptions } from "chatgpt";
import DataModel from "../models/data.model";
import {Client, Message, MessageMedia} from "whatsapp-web.js";
import { personalMessageHandler } from "src/services/message.service";
import Logger from "../utils/logger.util";
import Prefix from "../models/prefix.model";
import {
  getAuthorId,
  getAuthorName,
  getImgPrefix,
  getPrompt,
  getSenderId,
  isMentionsMe
} from "../utils/message.util"
import {GPT_IMG_PROMPT, GPT_NSFW_PROMPT, NOTHING_TO_RESET_REPLY, RESET_REPLY} from "../configs/constants.config";
import {craiyon} from "../configs/cClient.config";
import {openai} from "../configs/oClient.config";


export const handler = async (client: Client, message: Message, p: any) => {
  try {
    const start = Date.now();

    //Logger.info(JSON.stringify(message, null, 2));

    const prompt = await getPrompt(message);

    // if(isGroupChat(message)){
    const isGroupChat = (await message.getChat()).isGroup;
    if(isGroupChat){
      if (!await isMentionsMe(message)) return;
      Logger.info(`Received prompt from Group Chat ${getSenderId(message)} author ${await getAuthorId(message)}(${await getAuthorName(message)}): ${prompt}`);
    }else {
      Logger.info(`Received prompt from Private Chat ${getSenderId(message)}: ${prompt}`);
    }

    const imgPrefix: Prefix = getImgPrefix(message.body);

    if(imgPrefix.isPrefix) {
      Logger.info(`Generating images using ${imgPrefix.prefix}`)
      await message.reply("Patience is a virtue. It may take upto 10 seconds...");
      const imgPrompt = GPT_IMG_PROMPT(prompt)
      let res = await api.sendMessage(imgPrompt);

      // const result = await craiyon.generate({
      //   prompt: prompt,
      // });
      Logger.info(`Using image prompt from chatgpt: ${res.text}`);
      const response = await openai.createImage({
        prompt: res.text,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      });
      const decodedImg = response.data.data[0].b64_json;
      const media = await new MessageMedia("image/jpg", decodedImg)
      await message.reply(media);
      return;
    }

    // Check if the message is a personal message or not and handles it
    const isHandled = await personalMessageHandler(message, prompt);
    if (isHandled) return;

    // Get previous conversations
    const prevConversation: any = await getMessagesOfSender(getSenderId(message));

    if(prompt.toLowerCase() == 'reset'){
      Logger.info("Resetting context")
      if (prevConversation && prevConversation.length > 0) {
        Logger.info("Removing db row");
        await removeMessagesOfSender(getSenderId(message));
        message.reply(RESET_REPLY);
      }else {
        message.reply(NOTHING_TO_RESET_REPLY);
      }
      return;
    }

    let chatOptions: SendMessageOptions = null;
    let hasPreviousConversation: boolean = false;

    if (prevConversation && prevConversation.length > 0) {
      Logger.info("Found previous conversation. Using it as context");
      hasPreviousConversation = true;
      chatOptions = {
        conversationId: prevConversation[0].conversation_id,
        parentMessageId: prevConversation[0].message_id,
      };
    }

    let response: any;

    let gptPrompt = prompt;
    if(prompt.toLowerCase() == 'nsfw') {
      Logger.info("Setting NSFW mode...");
      gptPrompt = GPT_NSFW_PROMPT;
    }

    if (hasPreviousConversation || chatOptions) {
      response = await api.sendMessage(gptPrompt, chatOptions);
    }

    if (!hasPreviousConversation || !chatOptions) {
      response = await api.sendMessage(gptPrompt);
    }

    if (!hasPreviousConversation) {
      // Save the conversation
      const conversation: DataModel = {
        last_message: gptPrompt,
        message_id: response.id,
        conversation_id: response.conversationId,
        sender_id: getSenderId(message),
        author_id: await getAuthorId(message),
        author_name: getAuthorName(message),
        last_response: response.text,
        last_message_timestamp: new Date().toISOString(),
        parent_message_id: response.parentMessageId,
        is_group_chat: String(isGroupChat)
      };
      await saveConversation(conversation);
    } else {
      // Update the conversation
      await updateSingleMessageFromSender(
        getSenderId(message),
        getAuthorId(message),
        getAuthorName(message),
        gptPrompt,
        response.text,
        new Date().toISOString(),
        response.id,
        response.parentMessageId
      );
    }

    if(isGroupChat){
      Logger.info(`Answer to Group Chat ${getSenderId(message)} author ${await getAuthorId(message)}(${await getAuthorName(message)}): ${response.text}`);
    }else {
      Logger.info(`Answer to Private Chat ${getSenderId(message)}: ${response.text}`);
    }


    message.reply(response.text);

    const end = Date.now() - start;

    Logger.info(`ChatGPT took ` + end + "ms");
  } catch (error: any) {
    Logger.error(`Failed to send message to ChatGPT API: ` + error);

    return message.reply(
      "I'm sorry, I'm not available at the moment to reply. Please try again after sometime."
    );
  }
};
