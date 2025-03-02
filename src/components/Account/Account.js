import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Account/Account.scss';

const Account = () => {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImageUrl: ''
  });
  
  // Per ora gli ordini saranno vuoti finché l'API non sarà disponibile
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    // Reindirizza alla pagina di login se l'utente non è autenticato
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Carica i dati dell'utente
    setUserData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      profileImageUrl: currentUser.profileImageUrl || ''
    });
    
    // Se l'utente ha già un'immagine del profilo, la impostiamo
    if (currentUser.profileImageUrl) {
      setProfileImage(currentUser.profileImageUrl);
    }
    
    // Per ora non caricheremo gli ordini finché l'API non sarà disponibile
    // In una versione futura implementeremo questa parte
  }, [currentUser, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Funzione per comprimere l'immagine e ridurne le dimensioni
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      // Crea un elemento immagine per caricare il file
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = function(e) {
        img.src = e.target.result;
        
        img.onload = function() {
          // Crea un canvas per ridimensionare l'immagine
          const canvas = document.createElement('canvas');
          
          // Calcola le nuove dimensioni mantenendo l'aspect ratio
          let width = img.width;
          let height = img.height;
          
          // Dimensione massima (lato più lungo)
          const MAX_SIZE = 800;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Disegna l'immagine ridimensionata sul canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Converti il canvas in un data URL con qualità ridotta (70%)
          const dataUrl = canvas.toDataURL(file.type, 0.7);
          
          // Simula il progresso dell'upload
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
              clearInterval(progressInterval);
              resolve(dataUrl);
            }
          }, 100);
        };
        
        img.onerror = function() {
          reject(new Error("Errore nel caricamento dell'immagine"));
        };
      };
      
      reader.onerror = function() {
        reject(new Error("Errore nella lettura del file"));
      };
      
      reader.readAsDataURL(file);
    });
  };
  
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Controlla se l'immagine è un dataURL e se è troppo grande
      let finalImageUrl = userData.profileImageUrl;
      
      if (profileImage && profileImage.startsWith('data:')) {
        // Verifica la dimensione del dataURL - se è troppo grande, potrebbe causare problemi
        const sizeInBytes = profileImage.length * 0.75; // Approssimazione della dimensione in byte
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 1) {
          // L'immagine è troppo grande anche dopo la compressione
          setError("L'immagine è ancora troppo grande. Per favore, usa un'immagine più piccola.");
          setLoading(false);
          return;
        }
        
        finalImageUrl = profileImage;
      }
      
      // Crea un oggetto di aggiornamento del profilo che non includa l'immagine se è troppo grande
      const updatedData = {
        ...userData,
        profileImageUrl: finalImageUrl
      };
      
      await updateUserProfile(updatedData);
      setSuccess('Profilo aggiornato con successo!');
      setEditMode(false);
    } catch (error) {
      setError("Errore durante l'aggiornamento del profilo: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (window.confirm('Sei sicuro di voler eliminare il tuo account? Questa azione non può essere annullata.')) {
      try {
        const response = await fetch('http://localhost:3002/api/auth/delete-account', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          await logout();
          navigate('/');
        } else {
          const data = await response.json();
          setError(data.message || 'Errore durante l\'eliminazione dell\'account');
        }
      } catch (error) {
        setError('Errore durante l\'eliminazione dell\'account: ' + error.message);
      }
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Verifichiamo che sia un'immagine
    if (!file.type.startsWith('image/')) {
      setError('Per favore carica un file immagine valido (JPG, PNG, GIF)');
      return;
    }
    
    // Limitiamo la dimensione a 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("L'immagine è troppo grande. La dimensione massima è 5MB.");
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      setUploadProgress(10);
      
      // Comprimi l'immagine per ridurne le dimensioni
      const compressedImage = await compressImage(file);
      
      // Impostiamo l'immagine compressa
      setProfileImage(compressedImage);
      
      // Aggiorniamo il modello locale
      setUserData(prev => ({
        ...prev,
        profileImageUrl: compressedImage
      }));
      
      setSuccess('Immagine caricata con successo! Clicca su "Salva Modifiche" per confermare.');
    } catch (error) {
      setError("Errore durante il caricamento dell'immagine: " + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Funzione per eliminare l'immagine profilo
  const handleRemoveProfileImage = () => {
    if (window.confirm('Sei sicuro di voler rimuovere la tua immagine del profilo?')) {
      setProfileImage(null);
      setUserData(prev => ({
        ...prev,
        profileImageUrl: ''
      }));
    }
  };
  
  // Nel componente, aggiungiamo un effetto per aggiornare la barra di progresso CSS
  useEffect(() => {
    // Aggiorna la variabile CSS per la barra di progresso
    if (isUploading) {
      document.documentElement.style.setProperty('--progress', `${uploadProgress}%`);
    }
  }, [uploadProgress, isUploading]);
  
  return (
    <div className="account-container">
      <div className="account-background"></div>
      
      <motion.div 
        className="account-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="account-header">
          <div className="avatar-container">
            <div className="avatar" onClick={handleAvatarClick}>
              {profileImage ? (
                <img src={profileImage} alt="Immagine profilo" className="profile-image" />
              ) : (
                <span>{userData.name ? userData.name.charAt(0).toUpperCase() : 'E'}</span>
              )}
              {isUploading && (
                <div className="upload-overlay">
                  {uploadProgress > 0 ? `${uploadProgress}%` : 'Caricamento...'}
                </div>
              )}
              <div className="avatar-overlay">
                <span className="camera-icon">📷</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>
          <h1 className="account-title">
            {editMode ? 'Modifica Profilo' : 'Il Tuo Account'}
          </h1>
        </div>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {success && (
          <div className="success-message">{success}</div>
        )}
        
        <div className="account-section">
          <h2>Informazioni</h2>
          
          {editMode ? (
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label htmlFor="name">Nome:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Numero di telefono:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Immagine del profilo:</label>
                <div className="profile-image-edit">
                  <div className="current-image">
                    {profileImage ? (
                      <img src={profileImage} alt="Immagine profilo" />
                    ) : (
                      <div className="avatar-placeholder">
                        {userData.name ? userData.name.charAt(0).toUpperCase() : 'E'}
                      </div>
                    )}
                  </div>
                  <div className="image-actions">
                    <button 
                      type="button" 
                      className="change-image-button"
                      onClick={handleAvatarClick}
                    >
                      Cambia immagine
                    </button>
                    
                    {profileImage && (
                      <button 
                        type="button" 
                        className="remove-image-button"
                        onClick={handleRemoveProfileImage}
                      >
                        Rimuovi
                      </button>
                    )}
                  </div>
                </div>
                <div className="image-info">
                  <small>Dimensione massima: 1MB. Formati supportati: JPG, PNG, GIF.</small>
                  <small>L'immagine verrà compressa automaticamente.</small>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={loading || isUploading}
                >
                  {loading ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setEditMode(false)}
                >
                  Annulla
                </button>
              </div>
            </form>
          ) : (
            <div className="info-display">
              <div className="info-item">
                <span className="info-label">Nome:</span>
                <span className="info-value">{userData.name}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{userData.email}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Numero:</span>
                <span className="info-value">{userData.phone || 'Non specificato'}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="account-section">
          <h2>Ordini e Acquisti</h2>
          {orders && orders.length > 0 ? (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-item">
                  <div className="order-header">
                    <span className="order-id">Ordine #{order._id.substring(0, 8)}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="order-details">
                    <span className="order-status">Stato: {order.status}</span>
                    <span className="order-amount">€{order.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-orders">Non hai ancora effettuato acquisti.</p>
          )}
        </div>
        
        <div className="account-section">
          <h2>Altro</h2>
          <div className="action-buttons">
            {!editMode && (
              <button 
                className="edit-button" 
                onClick={() => setEditMode(true)}
              >
                Modifica
              </button>
            )}
            <button 
              className="delete-button" 
              onClick={handleDeleteAccount}
            >
              Elimina
            </button>
          </div>
        </div>
        
        <div className="back-link">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            Torna alla Home
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Account; 