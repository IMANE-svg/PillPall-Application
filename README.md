# Med Adherence App

**Backend:** Spring Boot (PostgreSQL, Mail, FCM, Twilio)
**Mobile:** React Native 
**ML Engine:** Python (scikit‑learn, TensorFlow)

> Application mobile de suivi d’observance thérapeutique avec notifications FCM, alertes e‑mail/SMS, analytics et moteur IA pour recommandations et détection d’anomalies.

---
## Aperçu

L’application permet aux **médecins** de prescrire des traitements (manuel ou scan), de **suivre l’observance** des patients en temps quasi réel, et de **générer des rapports**. Les **patients** reçoivent des **rappels FCM** aux heures de prise, confirment la prise dans l’app, et peuvent gérer leurs contacts et leurs médecins. Un **moteur intelligent** segmente les profils d’adhérence (K‑Means), **prédit les oublis** (Random Forest / LSTM) et **détecte les anomalies** (Isolation Forest). Un **administrateur** supervise globalement, gère les spécialités et les comptes.
Intégration de **Twilio** pour l’envoi de **SMS automatiques** aux contacts des patients en cas d’absence de confirmation.  
---

## Rôles & Fonctionnalités

### Médecin

1. **Authentification** (inscription: nom, prénom, email, mot de passe, rôle=médecin, spécialité; connexion par email/mot de passe).
2. **Dashboard** avec statistiques.
3. **Prescriptions**: créer (manuel ou via scan), préciser infos (nom médicament, dosage, horaires, période), **consulter/modifier/supprimer**; consulter par patient.
4. **Patients**: consulter la liste de ses patients.
5. **Observance**: tableau par patient (période + créneaux 8h/13h/20h, etc.) + horodatage réel des prises, statut *pris* / *non pris*.
6. **Rapports**: génération automatique (période, bilan, anomalies et niveau de risque issu du moteur IA).
7. **Historique**: toutes les prescriptions triées de la plus récente à l’ancienne.

### Patient

1. **Authentification** (inscription: nom/prénom/email/mot de passe, rôle=patient, choix de son/ses médecins; connexion par email/mot de passe).
2. **Dashboard**: nombre de médicaments, **prochaine prise** (heure/nom), **recommandations** IA.
3. **Liste des médicaments**: nom, description, horaires, médecin prescripteur.
4. **Rappels & confirmations**: notifications FCM à chaque horaire (jusqu’à **4 tentatives** espacées de **15 min**). En l’absence de réponse, **e‑mail et SMS** aux contacts. Page de **confirmation de prise** (enregistrement heure réelle).
5. **Profil & Contacts**: consulter/modifier infos; **CRUD des contacts** (nom, email, téléphone); gérer la liste de ses médecins.

### Administrateur

1. **Compte auto‑créé**, connexion uniquement.
2. **Dashboard global** (statistiques médecins/patients/spécialités).
3. **Gestion médecins**: liste (par spécialité), **modifier/supprimer** comptes.
4. **Gestion patients**: par médecin, **supprimer** patients.
5. **Gestion spécialités**: **CRUD**.
6. **Supervision** & **droits**.

---

## Architecture

```text
┌────────────────────────────────────────────────────────────────┐
│                        Mobile (React Native)                   │
│  - UI Patient & Médecin                                        │
│  - Auth (JWT) via Backend                                      │
│  - Réception notifications FCM                                 │
└───────────────▲───────────────────────────────┬────────────────┘
                │                               │
                │ REST/JSON                     │ Push (FCM)
                │                               │
        ┌───────┴───────────────────────────────▼───────────────┐
        │                    Backend (Spring Boot)              │
        │  - API REST, Auth JWT                                 │
        │  - Planification rappels / Observance                 │
        │  - E-mail (SMTP) & SMS (Twilio)                       │
        │  - Intégration FCM (envoi notifications)              │
        │  - Expose endpoints vers Moteur ML                    │
        └───────▲───────────────────────────────┬───────────────┘
                │ JDBC                         │ HTTP/gRPC
                │                               │
        ┌───────┴───────────────┐       ┌───────▼───────────────┐
        │   PostgreSQL          │       │   Moteur ML (Python)  │
        │   (Données métiers)   │       │ - KMeans / RF / LSTM  │
        └───────────────────────┘       │ - Isolation Forest    │
                                        └───────────────────────┘
```

## Prérequis
- Java 17+ (pour le backend)
- Maven (pour gérer les dépendances backend)
- Node.js et npm (pour le frontend React Native)
- PostgreSQL (base de données)
- Compte Firebase (pour les notifications push)
- Compte Twilio (pour les SMS)
- Compte Gmail (pour l’envoi d’emails)

## Configuration du backend
1. **Configurer la base de données** :
   - Créez une base de données PostgreSQL nommée `pillpall_app`.
   - Mettez à jour les identifiants dans `application.properties`.

2. **Configurer les fichiers de configuration** :
   - Copiez `src/main/resources/application.properties.example` vers `src/main/resources/application.properties`.
   - Remplissez les champs suivants avec vos valeurs :
     - `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password` : Identifiants PostgreSQL.
     - `spring.mail.username`, `spring.mail.password` : Identifiants SMTP (par exemple, Gmail).
     - `app.security.jwt.secret` : Clé secrète pour JWT.
     - `app.fcm.projectId`, `app.fcm.credentialsPath` : Identifiants Firebase.
     - `app.twilio.accountSid`, `app.twilio.authToken`, `app.twilio.fromNumber` : Identifiants Twilio.
     - `ml.service.base-url` : URL du service ML (si applicable).

3. **Configurer Firebase** :
   - Téléchargez le fichier `firebase-service-account.json` depuis la console Firebase (Projet > Paramètres > Comptes de service).
   - Placez-le dans `src/main/resources/`.

4. **Alternative : Utiliser des variables d’environnement** :
   - Configurez les variables d’environnement suivantes (par exemple, dans un fichier `.env` ou via votre système) :
     ```env
     DB_URL=jdbc:postgresql://localhost:5432/pillpall_app
     DB_USERNAME=your_db_username
     DB_PASSWORD=your_db_password
     MAIL_USERNAME=your_email@gmail.com
     MAIL_PASSWORD=your_email_password
     JWT_SECRET=your_jwt_secret
     FCM_CREDENTIALS_PATH=classpath:firebase-service-account.json
     FCM_PROJECT_ID=your_fcm_project_id
     TWILIO_ACCOUNT_SID=your_twilio_account_sid
     TWILIO_AUTH_TOKEN=your_twilio_auth_token
     TWILIO_PHONE_NUMBER=your_twilio_phone_number
     ML_SERVICE_URL=http://localhost:8000