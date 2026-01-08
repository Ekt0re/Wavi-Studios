import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Account/Account.scss';
import Purchases from './Purchases';

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
  const [activeTab, setActiveTab] = useState('profile');
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImageUrl: ''
  });
  
  // Questa parte verrà implementata quando l'API sarà disponibile
  // const [orders, setOrders] = useState([]);
  
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
                <img 
                  src={profileImage} 
                  alt="Profilo" 
                  className="profile-image"
                />
              ) : (
                <span>{userData.name ? userData.name.charAt(0).toUpperCase() : '?'}</span>
              )}
              
              {!isUploading && (
                <div className="avatar-overlay">
                  <span className="camera-icon" role="img" aria-label="Cambia immagine profilo">📷</span>
                </div>
              )}
              
              {isUploading && (
                <div 
                  className="upload-overlay"
                  style={{ '--progress': `${uploadProgress}%` }}
                >
                  {uploadProgress}%
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>
          <h1 className="account-title">Il tuo account</h1>
        </div>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {success && (
          <div className="success-message">{success}</div>
        )}
        
        {/* Tab di navigazione */}
        <div className="account-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profilo
          </button>
          <button 
            className={`tab-button ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            Acquisti
          </button>
        </div>
        
        {/* Sezione profilo */}
        {activeTab === 'profile' && (
          <>
            <div className="account-section">
              <h2>Informazioni personali</h2>
              {editMode ? (
                <form onSubmit={handleSaveProfile}>
                  <div className="form-group">
                    <label htmlFor="name">Nome</label>
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
                    <label htmlFor="email">Email</label>
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
                    <label htmlFor="phone">Telefono</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={userData.phone || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Immagine profilo</label>
                    <div className="profile-image-edit">
                      <div className="current-image">
                        {profileImage ? (
                          <img src={profileImage} alt="Profilo" />
                        ) : (
                          <div className="avatar-placeholder">
                            {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
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
                      <small>Formati supportati: JPG, PNG, GIF (max. 5MB)</small>
                      <small>L'immagine sarà visibile solo nel tuo profilo</small>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="save-button"
                      disabled={loading}
                    >
                      {loading ? 'Salvataggio...' : 'Salva modifiche'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => {
                        setEditMode(false);
                        // Ripristina i dati originali
                        setUserData({
                          name: currentUser.name || '',
                          email: currentUser.email || '',
                          phone: currentUser.phone || '',
                          profileImageUrl: currentUser.profileImageUrl || ''
                        });
                        
                        if (currentUser.profileImageUrl) {
                          setProfileImage(currentUser.profileImageUrl);
                        } else {
                          setProfileImage(null);
                        }
                      }}
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="info-display">
                    <div className="info-item">
                      <div className="info-label">Nome:</div>
                      <div className="info-value">{userData.name}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Email:</div>
                      <div className="info-value">{userData.email}</div>
                    </div>
                    {userData.phone && (
                      <div className="info-item">
                        <div className="info-label">Telefono:</div>
                        <div className="info-value">{userData.phone}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="action-buttons">
                    <button 
                      className="edit-button"
                      onClick={() => setEditMode(true)}
                    >
                      Modifica profilo
                    </button>
                    <button 
                      className="delete-button"
                      onClick={handleDeleteAccount}
                    >
                      Elimina account
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </>
        )}
        
        {/* Sezione acquisti */}
        {activeTab === 'purchases' && (
          <Purchases />
        )}
        
        <div className="back-link">
          <Link to="/">Torna alla home</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Account; 