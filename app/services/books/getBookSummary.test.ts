// services/__tests__/book.test.ts
import { describe, expect, it } from 'vitest';
import { getSummaryByTitle } from './getBookSummary';
import { getBookList } from './getBook';

describe('Book Service Integration Tests', () => {
  // 基础请求测试
  it('should fetch books with default parameters', async () => {
    const result = await getBookList();
    // 验证书籍数组
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // 验证单本书的数据结构
    const book = result[0];
    expect(book).toHaveProperty('id');
    expect(book).toHaveProperty('title');
    expect(book).toHaveProperty('author');
    expect(book).toHaveProperty('book_url');
    expect(book).toHaveProperty('description');
    expect(book).toHaveProperty('cover_url');
    expect(book).toHaveProperty('format');
    expect(book).toHaveProperty('tags');
    expect(book).toHaveProperty('score');
    expect(book).toHaveProperty('created_at');
    expect(book).toHaveProperty('updated_at');
  }, 10000);
});

describe('getSummaryByTitle Integration Tests', () => {
  it('should fetch book summary successfully', async () => {
    const result = await getSummaryByTitle({
      book_title: '三体',
      author: '刘慈欣',
    });

    expect(result).toHaveProperty('summary');
    const { summary } = result;

    // 基础属性验证
    expect(summary).toHaveProperty('title');
    expect(summary).toHaveProperty('author');
    expect(summary).toHaveProperty('characters');
    expect(summary).toHaveProperty('synopsis');

    // 内容验证
    expect(summary.title).toBe('三体');
    expect(summary.author).toBe('刘慈欣');
    expect(Array.isArray(summary.characters)).toBe(true);
    expect(typeof summary.synopsis).toBe('string');
    expect(summary.synopsis.length).toBeGreaterThan(0);

    // 角色验证
    if (summary.characters.length > 0) {
      const character = summary.characters[0];
      expect(character).toHaveProperty('name');
      expect(character).toHaveProperty('role');
      expect(typeof character.name).toBe('string');
      expect(typeof character.role).toBe('string');
    }
  }, 20000); // 增加超时时间，因为实际API调用可能较慢
});
