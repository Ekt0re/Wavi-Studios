import React from 'react';
import { useParams } from 'react-router-dom';
import '../styles/PurchaseDetail.scss';

const PurchaseDetail = () => {
  const { id } = useParams();
  const purchaseOptions = [
    { label: "MP3 Lease", price: 20 },
    { label: "WAV Lease", price: 40 },
    { label: "Multitrack Lease", price: 80 },
    { label: "Unlimited Lease", price: 110 }
  ];

  return (
    <div className="purchase-detail-page">
      <h1>Dettagli Acquisto</h1>
      <p>Seleziona un'opzione di acquisto per il beat ID: {id}</p>
      <select className="purchase-options">
        {purchaseOptions.map((option, index) => (
          <option key={index} value={option.price}>{option.label} {option.price}€</option>
        ))}
      </select>
      <button className="confirm-button">Conferma Acquisto</button>
    </div>
  );
};

export default PurchaseDetail; 