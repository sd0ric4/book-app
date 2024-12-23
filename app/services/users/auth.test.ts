import { registerUser, loginUser } from './auth';
import { describe, expect, test } from 'vitest';

describe('auth 集成测试', () => {
  test('应该成功注册用户', async function () {
    await registerUser({
      username: '田所浩二',
      email: '114514@114514.com',
      password: '1145141919810',
    });
  });
  test('应该成功登录用户', async function () {
    await loginUser({
      email: '114514@114514.com',
      password: '1145141919810',
    });
  });
});
