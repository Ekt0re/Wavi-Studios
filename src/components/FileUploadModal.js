import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { uploadService } from '../services/uploadService';
import { stripeService } from '../services/stripeService';
import '../styles/FileUploadModal.scss';
import JSZip from 'jszip';

const MAX_SIZE_GB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_GB * 1024 * 1024 * 1024;

const FileUploadModal = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    numero: '',
    files: [],
    totalSize: 0,
    selectedService: ''
  });

  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const services = [
    { id: 'solo-mix', name: 'Solo Mix del Beat', price: 30 },
    { id: 'solo-master', name: 'Solo Master', price: 20 },
    { id: 'mix-voice', name: 'Mix Voce + Master con Beat già Mixato', price: 35 },
    { id: 'mix-master', name: 'Mix e Master', price: 45 }
  ];

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionId = query.get('session_id');
    
    if (sessionId) {
      // Definisco la funzione direttamente nell'useEffect per evitare il warning
      const processPayment = async (sid) => {
        try {
          setIsProcessing(true);
          setError('Verifica del pagamento in corso...');

          const paymentResult = await stripeService.handlePaymentCompletion(sid);
          
          if (paymentResult.success) {
            setError('Pagamento confermato. Caricamento file in corso...');
            
            // Recupera i dati dei file salvati
            const pendingUpload = JSON.parse(localStorage.getItem('pendingUpload'));
            if (!pendingUpload) {
              throw new Error('Dati di upload non trovati');
            }
            
            // Aggiungi i file all'oggetto formData
            const formDataToUpload = new FormData();
            pendingUpload.files.forEach(file => {
              formDataToUpload.append('files', file);
            });
            
            // Aggiungi informazioni aggiuntive
            formDataToUpload.append('email', pendingUpload.email);
            formDataToUpload.append('sessionId', sid);
            formDataToUpload.append('customerName', pendingUpload.name || 'Cliente');
            
            // Esegui l'upload
            await uploadService.uploadFiles(formDataToUpload);
          } else {
            throw new Error('Verifica del pagamento fallita');
          }
        } catch (err) {
          console.error('Errore nel completamento del pagamento:', err);
          setError(`Errore: ${err.message}`);
          setIsProcessing(false);
        }
      };
      
      processPayment(sessionId);
    }
  }, [location]);

  // eslint-disable-next-line no-unused-vars
  const handleFileUpload = async () => {
    if (!formData.files.length) return;

    try {
      setIsUploading(true);
      setError('Creazione file zip in corso...');

      const nonEmptyFiles = formData.files.filter(file => file.size > 0);
      if (nonEmptyFiles.length === 0) {
        throw new Error('Nessun file valido da caricare');
      }

      const zip = new JSZip();
      nonEmptyFiles.forEach((file) => {
        zip.file(file.name, file);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const data = new FormData();
      data.append('file', new Blob([zipBlob], { type: 'application/zip' }));
      data.append('nome', formData.nome);
      data.append('email', formData.email);
      data.append('numero', formData.numero);
      data.append('servizio', formData.selectedService);

      const uploadResult = await uploadService.uploadFiles(data);
      
      if (uploadResult.success) {
        setError('');
        onClose();
      } else {
        throw new Error(uploadResult.error || 'Errore durante il caricamento');
      }
    } catch (error) {
      console.error('Errore durante il caricamento:', error);
      setError(error.message || 'Errore durante il caricamento. Riprova.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    addFiles(newFiles);
  };

  const addFiles = (newFiles) => {
    let updatedFiles = [...formData.files];
    let newTotalSize = formData.totalSize;

    newFiles.forEach(file => {
      // Verifica se il file esiste già
      const fileExists = updatedFiles.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );

      if (!fileExists) {
        newTotalSize += file.size;
        if (newTotalSize > MAX_SIZE_BYTES) {
          setError(`Il totale dei file supera il limite di ${MAX_SIZE_GB}GB`);
          return;
        }
        updatedFiles.push(file);
      }
    });

    setError('');
    setFormData(prev => ({
      ...prev,
      files: updatedFiles,
      totalSize: newTotalSize
    }));
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...formData.files];
    const removedFile = updatedFiles[index];
    updatedFiles.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      files: updatedFiles,
      totalSize: prev.totalSize - removedFile.size
    }));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleAddMoreFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleServiceSelect = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      selectedService: serviceId
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleNextStep = () => {
    if (!formData.selectedService) {
      setError('Seleziona un tipo di servizio');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.files.length) {
      setError('Carica almeno un file');
      return;
    }
    if (!formData.nome || !formData.email || !formData.numero) {
      setError('Compila tutti i campi richiesti');
      return;
    }

    try {
      setIsProcessing(true);
      setError('Preparazione del pagamento...');

      // Salva i file selezionati in localStorage per recuperarli dopo il pagamento
      const filesInfo = formData.files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      localStorage.setItem('pendingUpload', JSON.stringify({
        files: filesInfo,
        email: formData.email,
        nome: formData.nome,
        numero: formData.numero,
        selectedService: formData.selectedService,
        timestamp: Date.now()
      }));

      // Crea la sessione di checkout
      const checkoutSession = await stripeService.createCheckoutSession(
        formData.selectedService, 
        {
          name: formData.nome,
          email: formData.email,
          phone: formData.numero
        }
      );

      if (!checkoutSession || !checkoutSession.id) {
        throw new Error('Errore nella creazione della sessione di pagamento');
      }

      // Redirect al checkout
      await stripeService.redirectToCheckout(checkoutSession.id);
    } catch (error) {
      console.error('Errore durante il processo:', error);
      setError(error.message || 'Si è verificato un errore. Riprova.');
      setIsProcessing(false);
    }
  };

  const renderStep1 = () => (
    <>
      <h2>SELEZIONA IL SERVIZIO</h2>
      <div className="service-selection">
        <div className="service-options">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              className={`service-option ${formData.selectedService === service.id ? 'active' : ''}`}
              onClick={() => handleServiceSelect(service.id)}
              disabled={isProcessing}
            >
              {service.name}: {service.price}€
            </button>
          ))}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="button-container">
        <motion.button 
          type="button" 
          className="submit-button" 
          onClick={handleNextStep}
          disabled={!formData.selectedService || isProcessing}
          whileHover={{ 
            scale: formData.selectedService && !isProcessing ? 1.05 : 1,
            boxShadow: formData.selectedService && !isProcessing ? "0 5px 15px rgba(255, 77, 77, 0.3)" : "none"
          }}
          whileTap={{ scale: formData.selectedService && !isProcessing ? 0.95 : 1 }}
        >
          {isProcessing ? 'ELABORAZIONE...' : 'AVANTI'}
        </motion.button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <h2>INVIA I FILE DA MIXARE/MASTERIZZARE</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="nome"
            placeholder="NOME COMPLETO"
            value={formData.nome}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="MAIL"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="tel"
              name="numero"
              placeholder="NUMERO"
              value={formData.numero}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div 
          className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            multiple
            className="file-input"
            accept=".wav,.mp3,.zip"
          />
          {formData.files.length === 0 ? (
            <label htmlFor="file-upload" className="file-label">
              TRASCINA QUI I FILE O CLICCA PER SELEZIONARLI
              <span className="upload-icon">↑</span>
              <div className="file-limit">MAX {MAX_SIZE_GB}GB</div>
            </label>
          ) : null}

          {error && <div className="error-message">{error}</div>}
          
          {formData.files.length > 0 && (
            <div className="file-list">
              <div className="total-size">
                Dimensione totale: {formatFileSize(formData.totalSize)}
              </div>
              {formData.files.map((file, index) => (
                <motion.div 
                  key={index} 
                  className="file-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                  <button 
                    type="button"
                    className="remove-file"
                    onClick={() => handleRemoveFile(index)}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
              <button 
                type="button" 
                className="add-more-files"
                onClick={handleAddMoreFiles}
              >
                + Aggiungi altri file
              </button>
            </div>
          )}
        </div>

        <div className="button-group">
          <motion.button 
            type="button" 
            className="back-button" 
            onClick={handlePrevStep}
            disabled={isProcessing}
            whileHover={{ 
              scale: !isProcessing ? 1.05 : 1,
              boxShadow: !isProcessing ? "0 5px 15px rgba(255, 77, 77, 0.2)" : "none"
            }}
            whileTap={{ scale: !isProcessing ? 0.95 : 1 }}
          >
            INDIETRO
          </motion.button>
          <motion.button 
            type="submit" 
            className="submit-button"
            disabled={formData.files.length === 0 || !formData.nome || !formData.email || !formData.numero || isProcessing}
            whileHover={{ 
              scale: formData.files.length > 0 && !isProcessing ? 1.05 : 1,
              boxShadow: formData.files.length > 0 && !isProcessing ? "0 5px 15px rgba(255, 77, 77, 0.3)" : "none"
            }}
            whileTap={{ scale: formData.files.length > 0 && !isProcessing ? 0.95 : 1 }}
          >
            {isProcessing ? 'ELABORAZIONE...' : 'PAGA E PROCEDI'}
          </motion.button>
        </div>
      </form>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="file-upload-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="file-upload-modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <button className="close-button" onClick={onClose} disabled={isProcessing}>×</button>
            {isUploading ? (
              <div className="upload-status">
                <h2>CARICAMENTO IN CORSO...</h2>
                <p>{error}</p>
              </div>
            ) : (
              step === 1 ? renderStep1() : renderStep2()
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FileUploadModal; 