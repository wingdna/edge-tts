// api/tts.js
// 直接引用安装好的 npm 包，不引用本地 src 源码
const { UniversalEdgeTTS } = require('edge-tts-universal'); 

module.exports = async (req, res) => {
    // 设置 CORS，允许跨域请求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 预检请求直接返回
    if (req.method === 'OPTIONS') return res.status(200).end();

    // 解析参数
    const text = req.query.text || (req.body && req.body.input) || "接口已就绪";
    const voice = req.query.voice || "zh-CN-XiaoxiaoNeural";

    try {
        const tts = new UniversalEdgeTTS();
        // 开始合成
        const result = await tts.synthesize(text, voice);
        
        // 设置响应头为音频流
        res.setHeader('Content-Type', 'audio/mpeg');

        // 将 Web Stream 转换为 Vercel 的响应流
        const reader = result.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value); 
        }
        res.end();
    } catch (e) {
        // 如果出错，返回错误日志
        console.error("TTS Error:", e);
        res.status(500).json({ error: e.message });
    }
};
