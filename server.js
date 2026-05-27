const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. On dit au serveur de servir les fichiers du dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Gestion des scores en mémoire
let scoresGlobaux = { victoiresX: 0, victoiresO: 0 };

app.get('/api/scores', (req, res) => {
    res.json(scoresGlobaux);
});

app.post('/api/scores/gagnant', (req, res) => {
    const { joueur } = req.body;
    if (joueur === 'X') scoresGlobaux.victoiresX++;
    if (joueur === 'O') scoresGlobaux.victoiresO++;
    res.json({ message: "Score mis à jour", scores: scoresGlobaux });
});

// 2. Sécurité : Si index.html n'est pas trouvé par le code ci-dessus, cette route s'activera
app.get('*', (req, res) => {
    res.send("Le serveur Node.js fonctionne ! Si tu vois ce message, c'est que le fichier index.html n'est pas au bon endroit dans le dossier 'public'.");
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
