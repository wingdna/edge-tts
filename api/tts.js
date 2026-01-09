// api/tts.js
const { UniversalEdgeTTS } = require('edge-tts-universal'); 

module.exports = async (req, res) => {
    // 跨域设置
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const text = req.query.text || (req.body && req.body.input);
    const voice = req.query.voice || "zh-CN-XiaoxiaoNeural";

    if (!text) return res.status(400).send("Missing text");

    try {
        const tts = new UniversalEdgeTTS();
        const result = await tts.synthesize(text, voice);
        
        res.setHeader('Content-Type', 'audio/mpeg');

        // 这里的 result 是一个 Web Stream (ReadableStream)
        const reader = result.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value); 
        }
        res.end();
    } catch (e) {
        console.error("TTS Error:", e);
        res.status(500).json({ error: e.message });
    }
};
