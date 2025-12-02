import React, { useState, useEffect } from 'react';

interface Alert {
  id: number;
  criteria: string;
  email_sent_count: number;
  created_at: string;
}

interface AlertsManagerProps {
  token: string | null;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({ token }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAlert, setNewAlert] = useState({
    minPrice: '',
    maxPrice: '',
    minSurface: '',
    location: '',
    alertName: '',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (token) {
      loadAlerts();
    }
  }, [token]);

  const loadAlerts = async () => {
    try {
      const res = await fetch('http://localhost:4242/api/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.alertName || !newAlert.location) {
      alert('Veuillez remplir au moins le nom de l\'alerte et la localisation');
      return;
    }

    setLoading(true);
    try {
      const criteria = {
        name: newAlert.alertName,
        location: newAlert.location,
        minPrice: newAlert.minPrice ? parseInt(newAlert.minPrice) : null,
        maxPrice: newAlert.maxPrice ? parseInt(newAlert.maxPrice) : null,
        minSurface: newAlert.minSurface ? parseInt(newAlert.minSurface) : null,
      };

      const res = await fetch('http://localhost:4242/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ criteria }),
      });

      if (res.ok) {
        await loadAlerts();
        setNewAlert({
          minPrice: '',
          maxPrice: '',
          minSurface: '',
          location: '',
          alertName: '',
        });
        setShowForm(false);
        alert('Alerte créée avec succès ! Vous recevrez des notifications par email.');
      } else {
        const error = await res.json();
        alert('Erreur : ' + (error.error || 'Impossible de créer l\'alerte'));
      }
    } catch (err) {
      console.error('Error creating alert:', err);
      alert('Une erreur s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) return;

    try {
      const res = await fetch(`http://localhost:4242/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await loadAlerts();
        alert('Alerte supprimée');
      }
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  return (
    <div className="alerts-manager">
      <div className="alerts-header">
        <h2>🔔 Vos Alertes Immobilières</h2>
        <p>Recevez des notifications par email quand une annonce correspond à vos critères</p>
      </div>

      <button 
        className="primary-cta primary-chrome"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? '✕ Fermer' : '+ Créer une nouvelle alerte'}
      </button>

      {showForm && (
        <form className="alerts-form chrome-card" onSubmit={handleCreateAlert}>
          <div className="form-group">
            <label>Nom de l'alerte *</label>
            <input
              type="text"
              placeholder="Ex: Appartement T2 Marais"
              value={newAlert.alertName}
              onChange={(e) => setNewAlert({ ...newAlert, alertName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Localisation (ville/région) *</label>
            <input
              type="text"
              placeholder="Ex: Paris, Lyon, Côte d'Azur"
              value={newAlert.location}
              onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prix minimum (€)</label>
              <input
                type="number"
                placeholder="Ex: 150000"
                value={newAlert.minPrice}
                onChange={(e) => setNewAlert({ ...newAlert, minPrice: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Prix maximum (€)</label>
              <input
                type="number"
                placeholder="Ex: 300000"
                value={newAlert.maxPrice}
                onChange={(e) => setNewAlert({ ...newAlert, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Surface minimale (m²)</label>
            <input
              type="number"
              placeholder="Ex: 60"
              value={newAlert.minSurface}
              onChange={(e) => setNewAlert({ ...newAlert, minSurface: e.target.value })}
            />
          </div>

          <button 
            type="submit" 
            className="primary-cta primary-chrome"
            disabled={loading}
          >
            {loading ? '⏳ Création en cours...' : '✓ Créer l\'alerte'}
          </button>
        </form>
      )}

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <p className="alerts-empty">
            Aucune alerte créée. Créez-en une pour commencer à recevoir des notifications !
          </p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="alert-card chrome-card">
              <div className="alert-content">
                <h3>
                  🎯 {typeof alert.criteria === 'string' 
                    ? alert.criteria 
                    : (alert.criteria as any)?.name || 'Alerte sans nom'}
                </h3>
                <p className="alert-details">
                  Créée le {new Date(alert.created_at).toLocaleDateString('fr-FR')} • 
                  {alert.email_sent_count} notification{alert.email_sent_count !== 1 ? 's' : ''} envoyée{alert.email_sent_count !== 1 ? 's' : ''}
                </p>
                {typeof alert.criteria === 'object' && (
                  <div className="alert-criteria">
                    <p>
                      📍 {(alert.criteria as any).location}
                      {(alert.criteria as any).minPrice && ` • ${(alert.criteria as any).minPrice}€ min`}
                      {(alert.criteria as any).maxPrice && ` • ${(alert.criteria as any).maxPrice}€ max`}
                      {(alert.criteria as any).minSurface && ` • ${(alert.criteria as any).minSurface}m² min`}
                    </p>
                  </div>
                )}
              </div>
              <button
                className="alert-delete-btn"
                onClick={() => handleDeleteAlert(alert.id)}
                title="Supprimer cette alerte"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
