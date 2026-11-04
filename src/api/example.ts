import type { FastifyPluginAsync } from 'fastify';
import { timer } from '../lib/logger.js';

interface EchoQuery {
  q?: string;
  limit?: string;
}

// 示例路由，实际项目里删掉就行
// 主要是演示参数校验、错误处理、耗时统计怎么接
const exampleRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: EchoQuery }>('/api/echo', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', maxLength: 200 },
          limit: { type: 'string', pattern: '^\\d+$' },
        },
      },
    },
  }, async (req, reply) => {
    const elapsed = timer();
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    // 参数不合法直接 400，别让下游去猜
    if (limit > 100) {
      return reply.code(400).send({ error: 'limit 不能超过 100' });
    }

    return {
      q: req.query.q ?? '',
      limit,
      took: Math.round(elapsed()),
    };
  });
};

export default exampleRoutes;
