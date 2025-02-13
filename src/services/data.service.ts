import DataModel from "../models/data.model";
import { db } from "../configs/db.config";
import Logger from "../utils/logger.util";

function saveConversation(data: DataModel) {
  return new Promise((resolve, reject) => {
    const {
      last_message,
      message_id,
      conversation_id,
      sender_id,
      author_id,
      author_name,
      last_response,
      last_message_timestamp,
      parent_message_id,
      is_group_chat
    } = data;

    db.run(
      `INSERT INTO messages (
    last_message,
    message_id,
    conversation_id,
    sender_id,
    author_id,
    author_name,
    last_response,
    last_message_timestamp,
    parent_message_id,
    is_group_chat
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        last_message,
        message_id,
        conversation_id,
        sender_id,
        author_id,
        author_name,
        last_response,
        last_message_timestamp,
        parent_message_id,
        is_group_chat
      ],
      function (error) {
        if (error) {
          Logger.error(`failed to insert row: ` + error);
          reject(error);
        }
        resolve(this);

        Logger.info(`inserted a data with the ID: ${this.lastID}`);
      }
    );
  });
}

function getMessagesOfSender(sender_id: string) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM messages WHERE sender_id = ?`,
      [sender_id],
      (error: any, rows: any) => {
        if (error) {
          reject(error);
        }
        resolve(rows);
      }
    );
  });
}

function removeMessagesOfSender(sender_id: string) {
    return new Promise((resolve, reject) => {
        db.all(
            `DELETE FROM messages WHERE sender_id = ?`,
            [sender_id],
            (error: any, rows: any) => {
                if (error) {
                    reject(error);
                }
                resolve(rows);
            }
        );
    });
}

function updateSingleMessageFromSender(
  sender_id: string,
  author_id,
  author_name,
  last_message: string,
  last_response: string,
  last_message_timestamp: string,
  message_id: string,
  parent_message_id: string
) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE messages SET author_id = ?, author_name = ?, last_message = ?, last_response = ?, last_message_timestamp = ?, message_id = ?, parent_message_id = ? WHERE sender_id = ?`,
      [
        author_id,
        author_name,
        last_message,
        last_response,
        last_message_timestamp,
        message_id,
        parent_message_id,
        sender_id,
      ],
      (error: any) => {
        if (error) {
          reject(error);
        }
        resolve({
          last_message,
          last_response,
          last_message_timestamp,
          sender_id,
          author_id,
          author_name,
          message_id,
          parent_message_id
        });
      }
    );
  });
}

export { saveConversation, getMessagesOfSender, updateSingleMessageFromSender, removeMessagesOfSender };
