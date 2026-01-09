// api/tts.js
// 强制让 Vercel 处理 TypeScript 引用
require('ts-node/register'); 

// 注意：这里指向 src/index.ts
const { UniversalEdgeTTS } = require('../src/index.ts'); 

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const text = req.query.text || (req.body && req.body.input) || "测试语音";
    const voice = req.query.voice || "zh-CN-XiaoxiaoNeural";

    try {
        const tts = new UniversalEdgeTTS();
        const result = await tts.synthesize(text, voice);
        
        res.setHeader('Content-Type', 'audio/mpeg');

        // 这里的 result 是一个 Web Stream (ReadableStream)
        const reader = result.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value); // 将二进制数据块写入响应
        }
        res.end();
    } catch (e) {
        // 在日志中打印详细错误，方便排查
        console.error("TTS Error Details:", e);
        res.status(500).json({ error: e.message, stack: e.stack });
    }
};
