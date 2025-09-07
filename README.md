# Med Adherence App

**Backend:** Spring Boot (PostgreSQL, Mail, FCM, Twilio)
**Mobile:** React Native 
**ML Engine:** Python (scikit‑learn, TensorFlow)

> Application mobile de suivi d’observance thérapeutique avec notifications FCM, alertes e‑mail/SMS, analytics et moteur IA pour recommandations et détection d’anomalies.

---
## Aperçu

L’application permet aux **médecins** de prescrire des traitements (manuel ou scan), de **suivre l’observance** des patients en temps quasi réel, et de **générer des rapports**. Les **patients** reçoivent des **rappels FCM** aux heures de prise, confirment la prise dans l’app, et peuvent gérer leurs contacts et leurs médecins. Un **moteur intelligent** segmente les profils d’adhérence (K‑Means), **prédit les oublis** (Random Forest / LSTM) et **détecte les anomalies** (Isolation Forest). Un **administrateur** supervise globalement, gère les spécialités et les comptes.

---

## Rôles & Fonctionnalités

### Médecin

1. **Authentification** (inscription: nom, prénom, email, mot de passe, rôle=médecin, spécialité; connexion par email/mot de passe).
2. **Dashboard** avec statistiques.
3. **Prescriptions**: créer (manuel ou via scan), préciser infos (nom médicament, description, posologie, horaires, période), **consulter/modifier/supprimer**; consulter par patient.
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
        │  - E‑mail (SMTP) & SMS (Twilio)                       │
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

