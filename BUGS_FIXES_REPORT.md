# BUGS FIXES REPORT


## Rapport de bugs / Solutions apportées


### Bills :
1/ Les notes s'affichent dans l'ordre croissant au lieu de décroissant

   - BillsUi : Ajout de la methode reverse() sur les data et leur passer la methode antiChrono règle le soucis

### Login :
2/ Impossible de se connecter en tant qu'admin
 - Login.js : Lignes 55 et 57 --> Modifications des "data-testid" avec les bonnes valeurs

### Bills :
3/ Je suis connecté en tant qu'employé, je saisis une note de frais avec un justificatif qui a une extension différente de jpg, jpeg ou png, j'envoie. J'arrive sur la page Bills, je clique sur l'icône "voir" pour consulter le justificatif : la modale s'ouvre, mais il n'y a pas d'image.

Si je me connecte à présent en tant qu'Admin, et que je clique sur le ticket correspondant, le nom du fichier affiché est null. De même, lorsque je clique sur l'icône "voir" pour consulter le justificatif : la modale s'ouvre, mais il n'y a pas d'image. 
 - Empêcher la saisie de fichiers invalides pour ne pas avoir de fichiers "null"
 -  NewBillsUI.js : 
      - Dans le template HTML ajouter dans l'input file "accept="image/png", "image/jpeg", "image/jpg"
      - Ajouter un div pour l'affichage d'un message d'erreur
- NewBill.js - handleChangeFile():
     - Controle des types mimes des fichiers (jpeg jpg png)
     - Si le fichier est incorrect , désactiver le bouton de soumission et afficher un message d'erreur, pas de soumission du formulaire

### Dashboard :
4/ Le click sur les catégories status bug et des problemes de selections de tickets apparaissent.
Comportement attendu : Pourvoir déplier plusieurs listes, et consulter les tickets de chacune des deux listes.
- Dashboard.js - handleShowTicket
     - Modifier le tableau passé à l'evenement du clique règle le soucis, auparavent un tableau non trié etait fourni, passer un tableau trié préalablement fixe le bug.

## Tests crées et ajoutés :
### Tests Bills
**Pour BillsUi**
  - Ajout de l'assertion ligne 45 45 
  - Ajout du test pour la vérification d'un bouton existant
  - Ajout du test pour vérifier la présence de l'icone "eye" 

 **Pour Bills**
  - Test pour la vérification du click, ouverture du modale
  - Test click sur ajout d'une nouvelle facture, test de la rédirection de page
  Test unitaire sur getBills :
  - Vérification si 4 factures sont présentes
  - Tests si le format de la date est valide/invalide
  Test integration GET
  - Test de navigation sur la page Bills
  - Test de navigation lors d'une erreur, redirection 404 et 500
### Tests NewBill
 **Test UI**
  - Vérification présence de l'icone en surbrillance
  - Vérification de la présence du formulaire
  - Vérification des champs requis / non requis

 **Test intégration**
  - Tests envoi d'un fichier valide / invalide

 **Test "post"**
  - Test a la soumission du formulaire
  - Test a l'envoi d'une facture
  - Test des erreurs 404 et 500


## Réalisation 
**  📝 Angie Pons :** 03/2024