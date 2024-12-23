import { describe, expect, test } from 'vitest';
import { getSummaryByTitle } from './getBookSummary';

describe('getSummaryByTitle 集成测试', () => {
  test(
    '应该成功获取书籍摘要',
    async function () {
      const result = await getSummaryByTitle({
        book_title: '白鲸',
        author: '赫尔曼·梅尔维尔',
      });

      // 验证返回的基本数据结构
      expect(result).toHaveProperty('summary');

      // 验证摘要内容的具体字段
      const { summary } = result;
      expect(summary).toHaveProperty('title');
      expect(summary).toHaveProperty('author');
      expect(summary).toHaveProperty('characters');
      expect(summary).toHaveProperty('synopsis');

      // 验证角色数组
      expect(Array.isArray(summary.characters)).toBe(true);
      expect(summary.characters.length).toBeGreaterThan(0);
      expect(summary.characters[0]).toHaveProperty('name');
      expect(summary.characters[0]).toHaveProperty('role');

      // 验证文本内容
      expect(typeof summary.synopsis).toBe('string');
      expect(summary.synopsis.length).toBeGreaterThan(0);
    },
    { timeout: 10000 }
  );
});
