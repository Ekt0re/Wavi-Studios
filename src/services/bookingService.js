import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createBooking = async (bookingData) => {
  try {
    // Verifica disponibilità
    const { date, time } = bookingData;
    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 ore di default

    // Controlla se ci sono altre prenotazioni in questo intervallo
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('date', '==', date),
      where('time', '==', time)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { 
        success: false, 
        error: 'Questo orario non è disponibile. Prova un altro orario.' 
      };
    }

    // Crea la prenotazione
    const newBooking = {
      ...bookingData,
      createdAt: serverTimestamp(),
      status: 'pending',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    
    const docRef = await addDoc(bookingsRef, newBooking);
    return { 
      success: true, 
      id: docRef.id,
      message: 'Prenotazione creata con successo! Ti contatteremo per la conferma.' 
    };
  } catch (error) {
    console.error('Errore nella creazione della prenotazione:', error);
    return { 
      success: false, 
      error: 'Si è verificato un errore. Riprova più tardi.' 
    };
  }
};

export const getAvailableSlots = async (date) => {
  try {
    // Orari di lavoro: 9:00 - 18:00
    const workingHours = [];
    for (let hour = 9; hour < 18; hour++) {
      workingHours.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // Recupera le prenotazioni esistenti per la data selezionata
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('date', '==', date));
    const querySnapshot = await getDocs(q);
    
    const bookedSlots = new Set();
    querySnapshot.forEach(doc => {
      const booking = doc.data();
      bookedSlots.add(booking.time);
    });

    // Filtra gli slot disponibili
    const availableSlots = workingHours.filter(time => !bookedSlots.has(time));
    
    return { 
      success: true, 
      slots: availableSlots 
    };
  } catch (error) {
    console.error('Errore nel recupero degli slot disponibili:', error);
    return { 
      success: false, 
      error: 'Impossibile recuperare gli orari disponibili.' 
    };
  }
}; 