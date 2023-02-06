import {Message} from "whatsapp-web.js";
import Prefix from "../models/prefix.model";
import {imagePrefixes, removablePrefixes} from "../configs/constants.config";

// export const isGroupChat = (msg: Message) => {
//     return !!msg.author;
// }

export const getAuthorId = async (msg: Message) => {
    const isGroupChat = (await msg.getChat()).isGroup;
    return isGroupChat ? msg.author : msg.from;
}

export const getSenderId = (msg: Message) => {
    return msg.from;
}

export const getAuthorName = (msg: Message) => {
    // @ts-ignore
    return isGroupChat(msg) ? msg.rawData.notifyName : null;
}

export const isMentionsMe = async (msg: Message): Promise<boolean> => {
    const mentions = await msg.getMentions();
    if(mentions.length !=1) return false;
    return mentions[0].isMe;
}

export const getPrompt = async (msg: Message): Promise<string> => {
    if (await isMentionsMe(msg)) {
        // @ts-ignore
        return msg.body.replace(/^^(@.*? .*?)/,"");
    }
    return sanitize(msg.body);
}

const sanitize = (str: string): string => {
    const SOCRATES_PREFIX = "Socrates";
    const ZAPPY_PREFIX = "Zappy";
    if (str.toLowerCase().startsWith(SOCRATES_PREFIX)) {
        str.slice(SOCRATES_PREFIX.length);
    }
    if (str.toLowerCase().startsWith(ZAPPY_PREFIX)) {
        str.slice(ZAPPY_PREFIX.length);
    }
    return str;
}

export const getImgPrefix = (message: string): Prefix => {
    const containsImgPrefix = imagePrefixes.some((prefix) => message.startsWith(prefix));

    if (!containsImgPrefix) return { isPrefix: false, message, prefix: "" };

    let prefix;
    prefix = imagePrefixes.find((prefix) => message.startsWith(prefix));

    const isRemovable = removablePrefixes.includes(prefix);

    const messageWithoutPrefix = isRemovable
        ? message.replace(prefix, "").trim()
        : message;

    return { isPrefix: true, message: messageWithoutPrefix, prefix };
};
