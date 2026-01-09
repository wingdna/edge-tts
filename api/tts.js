// api/tts.js
// 自动兼容 ESM 和 CommonJS
const isESM = typeof module === 'undefined';

async function handler(req, res) {
    try {
        // 尝试加载依赖
        const { UniversalEdgeTTS } = require('edge-tts-universal');
        const tts = new UniversalEdgeTTS();
        
        const text = req.query.text || "连接成功";
        const result = await tts.synthesize(text);
        
        res.setHeader('Content-Type', 'audio/mpeg');
        const reader = result.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
        }
        res.end();
    } catch (e) {
        // 强制把错误打印到页面上，不再依赖 Vercel Logs
        res.status(500).send(`
            <h1>运行崩溃诊断</h1>
            <p><b>错误信息:</b> ${e.message}</p>
            <p><b>错误堆栈:</b> ${e.stack}</p>
        `);
    }
}

if (isESM) {
    export default handler;
} else {
    module.exports = handler;
}
