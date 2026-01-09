// api/tts.js
const { UniversalEdgeTTS } = require('edge-tts-universal'); 

module.exports = async (req, res) => {
    // 基础头信息
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 1. 简单的输入校验
    const text = req.query.text || (req.body && req.body.input) || "连接成功";
    const voice = req.query.voice || "zh-CN-XiaoxiaoNeural";

    try {
        // 2. 初始化（只要 package.json 里有这个包，这里就不会报 500）
        const tts = new UniversalEdgeTTS();
        const result = await tts.synthesize(text, voice);
        
        // 3. 流式传输音频
        res.setHeader('Content-Type', 'audio/mpeg');

        const reader = result.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value); 
        }
        res.end();
    } catch (e) {
        // 4. 这里的日志会出现在 Vercel 的 Logs 里
        console.error("TTS Runtime Error:", e.message);
        res.status(500).json({ error: e.message });
    }
};
