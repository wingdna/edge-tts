import { UniversalEdgeTTS } from 'edge-tts-universal';
import WebSocket from 'ws';

// 补丁：Edge-TTS 必须环境
global.WebSocket = WebSocket;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const text = req.query.text || (req.body && req.body.input) || "测试语音";
        const voice = req.query.voice || "zh-CN-XiaoxiaoNeural";
        
        const tts = new UniversalEdgeTTS();
        const response = await tts.synthesize(text, voice);
        
        res.setHeader('Content-Type', 'audio/mpeg');

        const reader = response.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
        }
        res.end();
    } catch (e) {
        console.error("Runtime Error:", e.message);
        res.status(500).json({ error: e.message });
    }
}
