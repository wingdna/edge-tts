// api/tts.js
const { UniversalEdgeTTS } = require('edge-tts-universal'); 

module.exports = async (req, res) => {
    // 允许跨域，方便程序接入
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const text = req.query.text || "测试成功";
    const voice = req.query.voice || "zh-CN-XiaoxiaoNeural";

    try {
        // 直接使用 npm 安装的包，不要 require('../src/...')
        const tts = new UniversalEdgeTTS();
        const result = await tts.synthesize(text, voice);
        
        res.setHeader('Content-Type', 'audio/mpeg');

        // 把流传给前端
        const reader = result.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value); 
        }
        res.end();
    } catch (e) {
        // 如果报错，直接把错误显示在页面上，方便排查
        res.status(500).json({ 
            error: "运行时崩溃", 
            message: e.message,
            tip: "请检查 package.json 是否包含 edge-tts-universal 依赖"
        });
    }
};
