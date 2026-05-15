import apiClient from '@/lib/axios';

const normalizeCategory = (category) => {
  if (!category) return category;

  return {
    ...category,
    categoryId: category.categoryId ?? category.category_id,
    categoryName: category.categoryName ?? category.category_name ?? category.name,
  };
};

const normalizeBook = (book) => {
  if (!book) return book;

  return {
    ...book,
    bookId: book.bookId ?? book.book_id,
    categoryId: book.categoryId ?? book.category_id,
    coverImageUrl: book.coverImageUrl ?? book.cover_image_url,
    publishedDate: book.publishedDate ?? book.published_date,
    category: normalizeCategory(book.category),
  };
};

const normalizeBooksResponse = (data) => {
  if (Array.isArray(data)) return data.map(normalizeBook);
  if (data?.content && Array.isArray(data.content)) {
    return { ...data, content: data.content.map(normalizeBook) };
  }
  return normalizeBook(data);
};

const normalizeCategoriesResponse = (data) => {
  if (Array.isArray(data)) return data.map(normalizeCategory);
  return normalizeCategory(data);
};

/**
 * Book Service — wraps book-service and category-service REST endpoints.
 * Spring Boot: com.booknest.book.resource.BookResource, CategoryResource
 * Base paths: /books, /categories
 */
const bookService = {
  /** GET /books — paginated list with optional filters */
  getBooks: (params = {}) =>
    apiClient.get('/books', { params }).then((r) => normalizeBooksResponse(r.data)),

  /** GET /books/:id */
  getBook: (id) =>
    apiClient.get(`/books/${id}`).then((r) => normalizeBook(r.data)),

  /** GET /books/search?title=... */
  searchBooks: (query) =>
    apiClient.get('/books/search', { params: { title: query } }).then((r) => normalizeBooksResponse(r.data)),

  /** GET /books/genre/:genre */
  getByGenre: (genre) =>
    apiClient.get(`/books/genre/${genre}`).then((r) => normalizeBooksResponse(r.data)),

  /** POST /books — Admin: create book */
  createBook: (data) =>
    apiClient.post('/books', data).then((r) => normalizeBook(r.data)),

  /** PUT /books/:id — Admin: update book */
  updateBook: (id, data) =>
    apiClient.put(`/books/${id}`, data).then((r) => normalizeBook(r.data)),

  /** DELETE /books/:id — Admin: delete book */
  deleteBook: (id) =>
    apiClient.delete(`/books/${id}`).then((r) => r.data),

  /** PUT /books/:id/stock — Admin: update stock quantity */
  updateStock: (id, stock) =>
    apiClient.put(`/books/${id}/stock`, { stock }).then((r) => r.data),

  // ── Categories ────────────────────────────────

  /** GET /categories */
  getCategories: () =>
    apiClient.get('/categories').then((r) => normalizeCategoriesResponse(r.data)),

  /** POST /categories — Admin */
  createCategory: (data) =>
    apiClient.post('/categories', data).then((r) => normalizeCategory(r.data)),

  /** PUT /categories/:id — Admin */
  updateCategory: (id, data) =>
    apiClient.put(`/categories/${id}`, data).then((r) => normalizeCategory(r.data)),

  /** DELETE /categories/:id — Admin */
  deleteCategory: (id) =>
    apiClient.delete(`/categories/${id}`).then((r) => r.data),
};

export default bookService;
