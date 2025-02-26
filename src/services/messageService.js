import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const sendMessage = async (messageData) => {
  try {
    const messagesRef = collection(db, 'messages');
    const newMessage = {
      ...messageData,
      createdAt: serverTimestamp(),
      status: 'new'
    };
    
    const docRef = await addDoc(messagesRef, newMessage);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Errore nell\'invio del messaggio:', error);
    return { success: false, error: error.message };
  }
}; 