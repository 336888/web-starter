import Fastify from 'fastify';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
});

app.get('/health', async () => ({
  ok: true,
  uptime: Math.round(process.uptime()),
}));

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
