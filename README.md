📝 Descrizione
PPM_BackEnd_Project è un backend RESTful costruito con Django e Django REST Framework, pensato per gestire post, commenti e like in un'applicazione social o community.
Supporta un sistema di autenticazione JWT, ruoli utente differenziati e un’architettura pronta per essere collegata a un frontend React (non incluso in questo repo).

 Funzionalità principali
 Post: crea, visualizza, modifica e cancella post.

Commenti: aggiungi e gestisci commenti ai post.

 Like: metti like ai post (massimo uno per utente per post).
Possiblità di inserire una biografia di un utente 
sezione dedicata al profilo e alla sua modifica 

 Ruoli: utenti normali e admin, con permessi diversi.
 Super User: Admin 
 Password : 12345

 Autenticazione JWT: per interazioni sicure tramite token.

 Stack Tecnologico
Python 3.x

Django

Django REST Framework

Simple JWT

React 

In Railway è stato usato un databaser PostgreSQL

api-social-network.up.railway.app (link al frontend)
ppmbackendproject-production.up.railway.app (link al backend)

    Come iniziare
1 accedi al frontend tramite il link api-social-network.up.railway.app
successivament ecrea un account o accedi con le credenziali di un utente esistente per il super user usa le credenziali:
   - username: admin
   - password: 12345
   - per gli altri utenti puoi crearne uno nuovo o usare le credenziali di un utente esistente
successivamente pubblica un post, aggiungi un commento e metti like al post.
e aggiungi una bio al profilo
