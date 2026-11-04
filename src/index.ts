import Fastify from 'fastify';
import { logger, timer } from './lib/logger.js';
import healthRoutes from './routes/health.js';
import exampleRoutes from './api/example.js';

// 注意 import 带 .js 后缀：NodeNext 模块解析要求
const app = Fastify({ loggerInstance: logger });

// 每个请求记一条，带耗时，方便和 nginx 的 urt 对照
const elapsed = new WeakMap<object, () => number>();

app.addHook('onRequest', async (req) => {
  elapsed.set(req, timer());
});

app.addHook('onResponse', async (req, reply) => {
  app.log.info(
    {
      method: req.method,
      url: req.url,
      status: reply.statusCode,
      ms: Math.round(elapsed.get(req)?.() ?? 0),
    },
    'request',
  );
});

await app.register(healthRoutes);
await app.register(exampleRoutes);

// 优雅退出
// docker compose down 默认只给 10 秒，不处理 SIGTERM 的话
// 正在处理的请求会被直接切断，前端看到的就是 502
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    app.log.info({ signal }, '收到退出信号，开始关闭');
    await app.close();
    process.exit(0);
  });
}

const port = Number(process.env.PORT ?? 3000);

try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
