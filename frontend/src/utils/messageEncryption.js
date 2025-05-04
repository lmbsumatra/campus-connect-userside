// Utility for encrypting and decrypting messages
// This file provides encryption functions for the chat system to ensure message privacy
// It uses CryptoJS for AES encryption and implements functions to encrypt/decrypt text messages
import CryptoJS from 'crypto-js';

// Fixed encryption key - in a production environment, this should be properly secured
// This key could also be derived from user IDs or other session data
// IMPORTANT: In a real production environment, this key should never be hardcoded in client-side code
// Ideally, the encryption would happen server-side or through a secure key management system
const ENCRYPTION_KEY = 'campus-connect-secure-messaging-key';

/**
 * Encrypts a message string using AES encryption
 * This function is called before sending a message to ensure privacy during transmission and storage
 * Used in MessagePage.js before sending messages to the server
 * 
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
 * Decrypts an encrypted message string using AES decryption
 * This function is called when displaying messages to show the original content
 * Used in MessagePage.js when rendering messages in the chat interface
 * 
 * @param {string} encryptedMessage - The encrypted message to decrypt
 * @returns {string} The decrypted message
 */
export const decryptMessage = (encryptedMessage) => {
  if (!encryptedMessage || typeof encryptedMessage !== 'string') return encryptedMessage;
  
  try {
    // Check if the message is encrypted (has the format of an encrypted message)
    // AES-encrypted messages from CryptoJS typically start with "U2FsdGVkX1"
    if (!encryptedMessage.includes('U2FsdGVkX1')) {
      return encryptedMessage; // Not encrypted, return as is
    }
    
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    
    // Handle potential UTF-8 decoding errors more gracefully
    try {
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (utf8Error) {
      // If there's a UTF-8 conversion error, return the original message
      console.warn('UTF-8 decoding error, returning original message:', utf8Error.message);
      return encryptedMessage;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedMessage; // Return the original message if decryption fails
  }
};

/**
 * Determines if a message needs encryption based on its type
 * Product cards and system messages aren't encrypted, only regular text messages
 * This helps maintain the ability to search and index product information
 * 
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
 * Provides a protective wrapper around property access to avoid errors
 * 
 * @param {Object} message - The message object
 * @param {string} prop - The property name to get
 * @returns {*} The property value or undefined
 */
export const safeGetMessageProp = (message, prop) => {
  if (!message || typeof message !== 'object') return undefined;
  return message[prop];
}; 