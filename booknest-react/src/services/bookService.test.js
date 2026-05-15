import { describe, it, expect, vi } from 'vitest';
import bookService from './bookService';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('bookService', () => {
  it('normalizes books response correctly', async () => {
    const rawData = {
      content: [
        { book_id: 1, title: 'B1', category: { category_id: 10, name: 'C1' } },
      ],
      totalElements: 1
    };
    apiClient.get.mockResolvedValue({ data: rawData });

    const result = await bookService.getBooks();
    expect(result.content[0].bookId).toBe(1);
    expect(result.content[0].category.categoryId).toBe(10);
    expect(result.content[0].category.categoryName).toBe('C1');
  });

  it('handles array response in normalization', async () => {
    const rawData = [{ book_id: 2 }];
    apiClient.get.mockResolvedValue({ data: rawData });
    const result = await bookService.searchBooks('query');
    expect(result[0].bookId).toBe(2);
  });

  it('normalizes single book', async () => {
    apiClient.get.mockResolvedValue({ data: { book_id: 5, published_date: '2021' } });
    const result = await bookService.getBook(5);
    expect(result.bookId).toBe(5);
    expect(result.publishedDate).toBe('2021');
  });

  it('calls createBook with data', async () => {
    const data = { title: 'New' };
    apiClient.post.mockResolvedValue({ data: { book_id: 100 } });
    await bookService.createBook(data);
    expect(apiClient.post).toHaveBeenCalledWith('/books', data);
  });

  it('calls deleteBook', async () => {
    apiClient.delete.mockResolvedValue({ data: 'ok' });
    await bookService.deleteBook(1);
    expect(apiClient.delete).toHaveBeenCalledWith('/books/1');
  });

  it('normalizes categories', async () => {
    apiClient.get.mockResolvedValue({ data: [{ category_id: 1, name: 'SciFi' }] });
    const result = await bookService.getCategories();
    expect(result[0].categoryId).toBe(1);
    expect(result[0].categoryName).toBe('SciFi');
  });
});
