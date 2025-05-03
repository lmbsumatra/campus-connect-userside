// Utility for encrypting and decrypting messages
import CryptoJS from 'crypto-js';

// Fixed encryption key - in a production environment, this should be properly secured
// This key could also be derived from user IDs or other session data
const ENCRYPTION_KEY = 'campus-connect-secure-messaging-key';

/**
 * Encrypts a message string
 * @param {string} message - The plain text message to encrypt
 * @returns {string} The encrypted message
 */
export const encryptMessage = (message) => {
  if (!message || typeof message !== 'string') return message;
  
  try {
    const encrypted = CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return message; // Fallback to unencrypted on error
  }
};

/**
 * Decrypts an encrypted message string
 * @param {string} encryptedMessage - The encrypted message to decrypt
 * @returns {string} The decrypted message
 */
export const decryptMessage = (encryptedMessage) => {
  if (!encryptedMessage || typeof encryptedMessage !== 'string') return encryptedMessage;
  
  try {
    // Check if the message is encrypted (has the format of an encrypted message)
    if (!encryptedMessage.includes('U2FsdGVkX1')) {
      return encryptedMessage; // Not encrypted, return as is
    }
    
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedMessage; // Return the original message if decryption fails
  }
};

/**
 * Checks if a message needs encryption (excludes product cards)
 * @param {Object} message - The message object
 * @returns {boolean} Whether the message should be encrypted
 */
export const shouldEncryptMessage = (message) => {
  // Check if message is a valid object
  if (!message || typeof message !== 'object') return false;
  
  // Don't encrypt product cards or messages without text
  return !message.isProductCard && message.text && typeof message.text === 'string';
};

/**
 * Safely gets a property from a message object
 * @param {Object} message - The message object
 * @param {string} prop - The property name to get
 * @returns {*} The property value or undefined
 */
export const safeGetMessageProp = (message, prop) => {
  if (!message || typeof message !== 'object') return undefined;
  return message[prop];
}; 