import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración HuggingFace
const HF_TOKEN = process.env.HF_TOKEN; // tu token gratuito HuggingFace
const HF_URL = "https://api-inference.huggingface.co/v1/chat/completions";
const MODEL = "microsoft/Phi-3-mini-4k-instruct";

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

// Home
app.get('/', (req, res) => {
    res.render('index');
});

// Procesar CV
app.post('/procesar', async (req, res) => {
    const cvText = req.body.cv_text;

    const payload = {
        model: MODEL,
        messages: [
            { role: "system", content: "Eres un experto en recursos humanos y reescribes CVs para pasar filtros ATS." },
            { role: "user", content: `Reescribe este CV profesionalmente:\n${cvText}` }
        ]
    };

    let optimizado = "No se pudo generar el CV. Intenta nuevamente más tarde.";

    try {
        const response = await fetch(HF_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        optimizado = data.choices[0].message.content;
    } catch (err) {
        console.log("Error generando CV:", err);
    }

    res.send(`
        <h2>CV Optimizado</h2>
        <pre>${optimizado}</pre>
        <p>Herramienta gratuita por ahora. Próxima versión premium con resultados ilimitados.</p>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
