import React from 'react';

interface LegalPageProps {
  page: 'cgu' | 'privacy' | 'cookies' | 'mentions';
  onClose: () => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ page, onClose }) => {
  const getContent = () => {
    switch (page) {
      case 'cgu':
        return (
          <>
            <h1>Conditions Générales d'Utilisation</h1>
            <p className="legal-date">Dernière mise à jour : 2 décembre 2025</p>

            <h2>1. Objet du Service</h2>
            <p>
              Real Estate AI est une plateforme d'analyse de biens immobiliers. Elle propose des outils de calcul
              de rendement, de cashflow et de scoring de deals immobiliers basés sur les données que vous fournissez.
            </p>

            <h2>2. Acceptation des Conditions</h2>
            <p>
              En accédant à Real Estate AI, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces
              conditions, veuillez ne pas utiliser le service.
            </p>

            <h2>3. Utilisation Licite</h2>
            <p>
              Vous vous engagez à utiliser Real Estate AI uniquement à des fins légales. Vous ne pouvez pas :
            </p>
            <ul>
              <li>Utiliser le service pour des activités illégales ou frauduleuses</li>
              <li>Accéder au service par des moyens non autorisés</li>
              <li>Transmettre des logiciels malveillants ou du code malicieux</li>
              <li>Reproduire ou distribuer le contenu sans autorisation</li>
              <li>Utiliser des outils d'automatisation pour accéder au service</li>
            </ul>

            <h2>4. Comptes Utilisateur</h2>
            <p>
              Vous êtes responsable de la confidentialité de votre mot de passe et du maintien de la sécurité de votre
              compte. Real Estate AI ne peut pas être tenu responsable des activités réalisées sur votre compte.
            </p>

            <h2>5. Limitation de Responsabilité</h2>
            <p>
              Real Estate AI est fourni "tel quel" sans garantie d'aucune sorte. Les analyses fournies par le service
              sont basées sur les données que vous entrez et sont à titre informatif uniquement. Elles ne constituent
              pas des conseils financiers, juridiques ou d'investissement.
            </p>
            <p>
              Vous utilisez le service à vos propres risques. Real Estate AI ne peut pas être tenu responsable des
              pertes financières ou dommages résultant de l'utilisation du service.
            </p>

            <h2>6. Propriété Intellectuelle</h2>
            <p>
              Tous les contenus, logos, et technologies de Real Estate AI sont protégés par les droits d'auteur.
              Vous avez une licence limitée pour utiliser ces contenus uniquement pour votre usage personnel.
            </p>

            <h2>7. Modifications du Service</h2>
            <p>
              Real Estate AI se réserve le droit de modifier ou d'interrompre le service à tout moment, avec ou sans
              préavis.
            </p>

            <h2>8. Résiliation</h2>
            <p>
              Nous pouvons résilier ou suspendre votre compte si vous violez ces conditions ou les lois applicables.
            </p>

            <h2>9. Droit Applicable</h2>
            <p>
              Ces conditions sont régies par les lois françaises. Tout litige sera soumis aux tribunaux compétents de
              France.
            </p>

            <h2>10. Contact</h2>
            <p>
              Pour toute question concernant ces conditions, veuillez nous contacter à realestateai@outlook.com
            </p>
          </>
        );

      case 'privacy':
        return (
          <>
            <h1>Politique de Confidentialité</h1>
            <p className="legal-date">Dernière mise à jour : 2 décembre 2025</p>

            <h2>1. Introduction</h2>
            <p>
              Real Estate AI s'engage à protéger votre vie privée. Cette politique explique comment nous collectons,
              utilisons et protégeons vos données personnelles.
            </p>

            <h2>2. Données Collectées</h2>
            <p>Nous collectons les types de données suivants :</p>
            <ul>
              <li><strong>Données de compte :</strong> Nom, email, mot de passe (haché)</li>
              <li><strong>Données d'analyse :</strong> Prix d'achat, loyer, charges, durée de prêt</li>
              <li><strong>Données d'utilisation :</strong> Interactions avec le site, pages visitées</li>
              <li><strong>Données techniques :</strong> Adresse IP, type de navigateur, cookies</li>
            </ul>

            <h2>3. Utilisation des Données</h2>
            <p>Nous utilisons vos données pour :</p>
            <ul>
              <li>Fournir et améliorer le service</li>
              <li>Traiter les paiements et gérer les abonnements</li>
              <li>Vous envoyer des notifications et mises à jour importantes</li>
              <li>Analyser l'utilisation et optimiser l'expérience utilisateur</li>
              <li>Respecter les obligations légales</li>
            </ul>

            <h2>4. Partage des Données</h2>
            <p>
              Nous ne partageons vos données personnelles avec des tiers que dans les cas suivants :
            </p>
            <ul>
              <li>Avec votre consentement explicite</li>
              <li>Avec nos prestataires (paiements, hébergement, email) sous contrat de confidentialité</li>
              <li>Si requis par la loi ou autorité compétente</li>
              <li>En cas de fusion ou acquisition de Real Estate AI</li>
            </ul>

            <h2>5. Sécurité des Données</h2>
            <p>
              Nous mettons en place des mesures de sécurité techniques et organisationnelles pour protéger vos données :
            </p>
            <ul>
              <li>Chiffrement SSL/TLS pour les transmissions</li>
              <li>Hachage sécurisé des mots de passe</li>
              <li>Accès limité aux données sensibles</li>
              <li>Sauvegardes régulières</li>
            </ul>

            <h2>6. Durée de Rétention</h2>
            <p>
              Nous conservons vos données personnelles aussi longtemps que votre compte est actif. Après suppression
              de votre compte, nous conservons les données minimales nécessaires pour respecter les obligations légales.
            </p>

            <h2>7. Vos Droits</h2>
            <p>Vous avez le droit de :</p>
            <ul>
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier des données inexactes</li>
              <li>Demander la suppression de vos données (droit à l'oubli)</li>
              <li>Obtenir une copie de vos données</li>
              <li>Vous opposer au traitement de vos données</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à realestateai@outlook.com
            </p>

            <h2>8. Cookies</h2>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience. Voir notre politique de cookies pour plus
              d'informations.
            </p>

            <h2>9. Modifications</h2>
            <p>
              Nous pouvons modifier cette politique à tout moment. Les modifications prennent effet dès la publication.
            </p>

            <h2>10. Contact</h2>
            <p>
              Pour toute question sur cette politique, contactez-nous à realestateai@outlook.com
            </p>
          </>
        );

      case 'cookies':
        return (
          <>
            <h1>Politique de Gestion des Cookies</h1>
            <p className="legal-date">Dernière mise à jour : 2 décembre 2025</p>

            <h2>1. Qu'est-ce qu'un Cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte stocké sur votre navigateur. Les cookies nous permettent de vous
              reconnaître et de personnaliser votre expérience.
            </p>

            <h2>2. Types de Cookies que Nous Utilisons</h2>
            <p>
              <strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (authentification, sécurité)
            </p>
            <p>
              <strong>Cookies de performance :</strong> Nous aident à comprendre comment vous utilisez le site
              (Google Analytics)
            </p>
            <p>
              <strong>Cookies de fonctionnalité :</strong> Mémorisent vos préférences (langue, thème)
            </p>
            <p>
              <strong>Cookies de marketing :</strong> Utilisés pour vous proposer des contenus pertinents (optionnel)
            </p>

            <h2>3. Cookies Tiers</h2>
            <p>
              Nous travaillons avec les services tiers suivants qui posent leurs propres cookies :
            </p>
            <ul>
              <li><strong>Stripe :</strong> Traitement des paiements</li>
              <li><strong>Google Analytics :</strong> Analyse du trafic</li>
              <li><strong>Nodemailer :</strong> Envoi d'emails</li>
            </ul>

            <h2>4. Contrôle des Cookies</h2>
            <p>
              Vous pouvez contrôler les cookies via les paramètres de votre navigateur :
            </p>
            <ul>
              <li>Chrome : Paramètres &gt; Confidentialité et sécurité &gt; Cookies</li>
              <li>Firefox : Préférences &gt; Vie privée &gt; Cookies</li>
              <li>Safari : Préférences &gt; Confidentialité</li>
              <li>Edge : Paramètres &gt; Confidentialité &gt; Cookies</li>
            </ul>

            <h2>5. Consentement aux Cookies</h2>
            <p>
              Nous demandons votre consentement pour les cookies non essentiels. Vous pouvez modifier vos choix à tout
              moment dans les paramètres de confidentialité du site.
            </p>

            <h2>6. Cookies et RGPD</h2>
            <p>
              Conformément au RGPD, nous ne plaçons les cookies non essentiels que si vous les acceptez. Vous pouvez
              retirer votre consentement à tout moment.
            </p>

            <h2>7. Durée de Conservation</h2>
            <p>
              Les cookies essentiels sont conservés pendant votre session ou selon les besoins de sécurité. Les autres
              cookies sont conservés pendant une durée définie (généralement 1 an).
            </p>

            <h2>8. Contact</h2>
            <p>
              Pour des questions sur notre politique de cookies, contactez-nous à realestateai@outlook.com
            </p>
          </>
        );

      case 'mentions':
        return (
          <>
            <h1>Mentions Légales</h1>
            <p className="legal-date">Dernière mise à jour : 2 décembre 2025</p>

            <h2>1. Identification du Responsable</h2>
            <p>
              <strong>Entreprise :</strong> Real Estate AI SARL<br/>
              <strong>SIRET :</strong> 92345678901234<br/>
              <strong>TVA :</strong> FR92345678901<br/>
              <strong>Adresse :</strong> 42 rue de Rivoli, 75004 Paris, France<br/>
              <strong>Email :</strong> realestateai@outlook.com<br/>
              <strong>Téléphone :</strong> +33 (0)1 23 45 67 89
            </p>

            <h2>2. Représentant Legal</h2>
            <p>
              <strong>Directeur de la publication :</strong> Thomas Boutet
            </p>

            <h2>3. Hébergement du Site</h2>
            <p>
              <strong>Hébergeur :</strong> Amazon Web Services (AWS)<br/>
              <strong>Localisation :</strong> Paris, France<br/>
              <strong>Contact :</strong> aws.amazon.com
            </p>

            <h2>4. Propriété Intellectuelle</h2>
            <p>
              L'ensemble du contenu du site (textes, images, logos, graphiques) est la propriété exclusive de Real
              Estate AI ou de ses partenaires. Toute reproduction ou utilisation sans autorisation est interdite.
            </p>

            <h2>5. Données Financières</h2>
            <p>
              Les analyses proposées par Real Estate AI sont fournies à titre informatif uniquement. Elles ne
              constituent pas des conseils financiers ou d'investissement. Les utilisateurs sont seuls responsables
              de leurs décisions d'investissement.
            </p>

            <h2>6. Disclaimer</h2>
            <p>
              Real Estate AI s'efforce de fournir des informations exactes, mais ne garantit pas l'exactitude ou la
              complétude des données fournies. L'utilisateur utilise le service à ses propres risques.
            </p>

            <h2>7. Limitations de Responsabilité</h2>
            <p>
              Real Estate AI ne peut pas être tenu responsable de :
            </p>
            <ul>
              <li>Les erreurs ou omissions dans les contenus</li>
              <li>Les interruptions ou défaillances du service</li>
              <li>Les pertes financières résultant de l'utilisation du service</li>
              <li>Les dommages indirects ou consécutifs</li>
            </ul>

            <h2>8. Conformité Légale</h2>
            <p>
              Real Estate AI se conforme aux lois françaises applicables, notamment :
            </p>
            <ul>
              <li>Loi Informatique et Libertés (CNIL)</li>
              <li>Règlement Général sur la Protection des Données (RGPD)</li>
              <li>Loi de Finances</li>
              <li>Code de la Consommation</li>
            </ul>

            <h2>9. Modifications des Conditions</h2>
            <p>
              Real Estate AI se réserve le droit de modifier ces mentions légales à tout moment. Les modifications
              prennent effet dès leur publication.
            </p>

            <h2>10. Droit Applicable et Compétence</h2>
            <p>
              Ces mentions légales sont régies par la loi française. Tout litige sera soumis aux tribunaux compétents
              en France.
            </p>

            <h2>11. Contact et Réclamations</h2>
            <p>
              Pour toute réclamation, question ou signalement concernant le site, veuillez nous contacter :
            </p>
            <ul>
              <li>Email : realestateai@outlook.com</li>
              <li>Adresse : 42 rue de Rivoli, 75004 Paris, France</li>
              <li>Téléphone : +33 (0)1 23 45 67 89</li>
            </ul>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-modal" onClick={(e) => e.stopPropagation()}>
        <button className="legal-close" onClick={onClose}>✕</button>
        <div className="legal-content">
          {getContent()}
        </div>
      </div>
    </div>
  );
};
