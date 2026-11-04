import type { FastifyPluginAsync } from 'fastify';

// 健康检查单独拆出来，方便后面接 uptime 监控或者容器探针
const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (_req, reply) => {
    // 健康检查不能被缓存，不然监控会一直看到旧状态
    reply.header('cache-control', 'no-store');
    return {
      ok: true,
      uptime: Math.round(process.uptime()),
      version: process.env.npm_package_version ?? 'dev',
    };
  });
};

export default healthRoutes;
