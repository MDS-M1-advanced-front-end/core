# Réservation de salles

Plateforme où des clients réservent des salles mises à disposition par des gestionnaires, sous la supervision d'administrateurs.

## Acteurs

**Client** :
Utilisateur qui recherche des salles, les réserve et paie ses réservations.
_Éviter_ : utilisateur (trop générique), locataire

**Gestionnaire** :
Utilisateur propriétaire d'une ou plusieurs salles ; il en définit les disponibilités et confirme ou refuse les réservations qui les concernent.
_Éviter_ : propriétaire, owner, manager

**Administrateur** :
Utilisateur qui a tous les droits d'un gestionnaire sur toutes les salles, gère les utilisateurs et consulte les statistiques.
_Éviter_ : admin (dans les textes métier)

## Salles

**Salle** :
Espace réservable, avec une capacité, un lieu et un prix horaire ; elle est active ou inactive.
_Éviter_ : room (dans les textes métier), espace, local

**Disponibilité** :
Ensemble des créneaux d'une salle pour une date donnée, chacun ouvert ou non à la réservation.

**Créneau** :
Plage horaire d'une journée (heure de début, heure de fin) au sein d'une disponibilité.
_Éviter_ : slot, plage

## Réservations

**Réservation** :
Demande d'un client d'occuper une salle sur une période donnée, pour un montant total.
_Éviter_ : booking

**Statut de réservation** :
Étape du cycle de vie d'une réservation : en attente, confirmée, refusée, annulée ou terminée.

**Confirmation** :
Acceptation d'une réservation en attente par un gestionnaire ou un administrateur.
_Éviter_ : validation

**Refus** :
Rejet d'une réservation en attente par un gestionnaire ou un administrateur, éventuellement motivé.
_Éviter_ : rejet

**Annulation** :
Abandon d'une réservation en attente ou confirmée ; la réservation reste consultable avec le statut annulée.
_Éviter_ : suppression

## Paiement

**Paiement** :
Règlement par le client du montant total d'une réservation, par carte ou PayPal.
