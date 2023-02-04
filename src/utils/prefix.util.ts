import Prefix from "../models/prefix.model";
import {imagePrefixes, prefixes, removablePrefixes} from "../configs/constants.config";

export const getPrefix = (message: string): Prefix => {
  const containsGPTPrefix = prefixes.some((prefix) => message.startsWith(prefix));
  const containsImgPrefix = imagePrefixes.some((prefix) => message.startsWith(prefix));

  if (!containsGPTPrefix && !containsImgPrefix) return { isPrefix: false, message, prefix: "" };

  let prefix, isGPT, isImg;
  if(containsGPTPrefix){
    prefix = prefixes.find((prefix) => message.startsWith(prefix));
    isGPT = true;
    isImg = false;
  }else {
    prefix = imagePrefixes.find((prefix) => message.startsWith(prefix));
    isGPT = false;
    isImg = true;
  }

  const isRemovable = removablePrefixes.includes(prefix);

  const messageWithoutPrefix = isRemovable
    ? message.replace(prefix, "").trim()
    : message;

  return { isPrefix: true, message: messageWithoutPrefix, prefix, isGPT, isImg };
};
