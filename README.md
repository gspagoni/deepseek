# Esempio di come aggiornare un applicazione in Electron

Vedi configurazione del file package.json
per funzionare la creazione di nuove release nel repository GitHub
devi creare un token nel repository e devi configurare una
variabile di ambiente che si chiama GH_TOKEN

una volta che lanci il comando

npm run build

electron-builder crea il pacchetto di installazione
crea una nuova release nel repositoty
e fa l'upload del nuovo codice

quando rilanci l'applicazione, intercetta una nuova versione
la scarica e la installa

questo è il codice dell applicazione
