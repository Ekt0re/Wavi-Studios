import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Shop.scss';

const Shop = () => {
  const beats = [
    { id: 1, title: "Beat Pronto", description: "Sfoglia e acquista beat pronti per l'uso.", tags: ["emotional", "trap"], coverImage: "/images/beat1.jpg", previewAudio: "/audio/beat1-preview.mp3" },
    { id: 2, title: "Beat Custom", description: "Crea un beat su misura per le tue esigenze.", tags: ["pop", "dance"], coverImage: "/images/beat2.jpg", previewAudio: "/audio/beat2-preview.mp3" },
    { id: 3, title: "Registrazione", description: "Prenota una sessione di registrazione professionale.", tags: ["rock", "live"], coverImage: "/images/beat3.jpg", previewAudio: "/audio/beat3-preview.mp3" },
    { id: 4, title: "Mix e Master", description: "Dai al tuo progetto il suono professionale che merita.", tags: ["jazz", "acoustic"], coverImage: "/images/beat4.jpg", previewAudio: "/audio/beat4-preview.mp3" }
  ];

  const purchaseOptions = [
    { label: "MP3 Lease", price: 20 },
    { label: "WAV Lease", price: 40 },
    { label: "Multitrack Lease", price: 80 },
    { label: "Unlimited Lease", price: 110 }
  ];

  return (
    <div className="shop-page">
      <h1>Shop</h1>
      <div className="beats-list">
        {beats.map(beat => (
          <div key={beat.id} className="beat-card">
            <img src={beat.coverImage} alt={beat.title} className="cover-image" />
            <h2>{beat.title}</h2>
            <p>{beat.description}</p>
            <div className="tags">
              {beat.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            <audio controls src={beat.previewAudio} className="audio-player">
              Your browser does not support the audio element.
            </audio>
            <div className="purchase-section">
              <select className="purchase-options">
                {purchaseOptions.map((option, index) => (
                  <option key={index} value={option.price}>{option.label} {option.price}€</option>
                ))}
              </select>
              <Link to={`/acquisto/${beat.id}`} className="buy-button">Acquista</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;