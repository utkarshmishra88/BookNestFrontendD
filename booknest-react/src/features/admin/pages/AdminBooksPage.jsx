import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import bookService from '@/services/bookService';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const bookSchema = yup.object({
  title:       yup.string().required('Title is required'),
  author:      yup.string().required('Author is required'),
  isbn:        yup.string().required('ISBN is required'),
  price:       yup.number().positive().required('Price is required'),
  stock:       yup.number().integer().min(0).required('Stock is required'),
  description: yup.string(),
  coverImageUrl: yup.string().url('Must be a valid URL'),
  publishedDate: yup.string(),
  categoryId:  yup.number().required('Category is required'),
});

const BookFormModal = ({ book, categories, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(bookSchema),
    defaultValues: book ? {
      ...book,
      categoryId: book.category?.categoryId,
      publishedDate: book.publishedDate ?? '',
    } : {},
  });

  console.log('BookFormModal received categories:', categories);

  const onSubmit = (data) => {
    console.log('Form submitted with data:', data);
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white dark:bg-ink-800 rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-parchment-200 dark:border-ink-700">
          <h2 className="font-display text-xl text-ink-900 dark:text-white">{book ? 'Edit Book' : 'Add New Book'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-parchment-50 dark:bg-ink-900 text-ink-500 dark:text-ink-400">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {[
            { name: 'title',       label: 'Title',       type: 'text' },
            { name: 'author',      label: 'Author',      type: 'text' },
            { name: 'isbn',        label: 'ISBN',        type: 'text' },
            { name: 'publisher',   label: 'Publisher',   type: 'text' },
            { name: 'price',       label: 'Price (₹)',   type: 'number', step: '0.01' },
            { name: 'stock',       label: 'Stock',       type: 'number' },
            { name: 'coverImageUrl', label: 'Cover Image URL', type: 'url' },
            { name: 'publishedDate', label: 'Published Date',  type: 'date' },
          ].map(({ name, label, ...rest }) => (
            <div key={name}>
              <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">{label}</label>
              <input {...register(name)} {...rest} className="input-field" />
              {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name].message}</p>}
            </div>
          ))}

          <div>
            <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">Category</label>
            <select 
              {...register('categoryId', { 
                setValueAs: (value) => value ? parseInt(value) : ''
              })} 
              className="input-field"
            >
              <option value="">Select category</option>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((c) => {
                  console.log('Rendering category option:', c);
                  return (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName || c.name}
                    </option>
                  );
                })
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="input-field resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? <Spinner size="sm" /> : (book ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminBooksPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null); // null | 'create' | book object

  const { data: rawBooks = [], isLoading } = useQuery(
    'admin-books-all',
    () => bookService.getBooks({ size: 200 }).then((d) => Array.isArray(d) ? d : d?.content ?? [])
  );
  
  const { data: categoriesData = [], isLoading: categoriesLoading, error: categoriesError } = useQuery(
    'categories',
    async () => {
      console.log('Fetching categories in AdminBooksPage...');
      try {
        const result = await bookService.getCategories();
        console.log('Categories result:', result);
        console.log('Is array?', Array.isArray(result));
        // Handle if response is wrapped in a data field
        return Array.isArray(result) ? result : (result?.data ?? []);
      } catch (err) {
        console.error('Categories fetch failed:', err);
        throw err;
      }
    }
  );
  
  const categories = categoriesData || [];
  console.log('Final categories:', categories, 'Loading:', categoriesLoading);

  const filtered = rawBooks.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation(bookService.createBook, {
    onSuccess: () => { qc.invalidateQueries('admin-books-all'); setModal(null); toast.success('Book created!'); },
    onError: (err) => {
      console.error('Create book error:', err);
      toast.error(err.message || 'Failed to create book');
    },
  });

  const updateMutation = useMutation(({ id, data }) => bookService.updateBook(id, data), {
    onSuccess: () => { qc.invalidateQueries('admin-books-all'); setModal(null); toast.success('Book updated!'); },
    onError: (err) => {
      console.error('Update book error:', err);
      toast.error(err.message || 'Failed to update book');
    },
  });

  const deleteMutation = useMutation(bookService.deleteBook, {
    onSuccess: () => { qc.invalidateQueries('admin-books-all'); toast.success('Book deleted'); },
    onError: (err) => {
      console.error('Delete book error:', err);
      toast.error(err.message || 'Failed to delete book');
    },
  });

  const handleSave = (data) => {
    if (modal && modal !== 'create') {
      updateMutation.mutate({ id: modal.bookId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl text-ink-900 dark:text-white">Manage Books</h1>
        <button 
          onClick={() => {
            if (categoriesLoading) {
              toast.error('Loading categories... Please wait');
              return;
            }
            if (categories.length === 0) {
              toast.error('No categories available. Please create a category first.');
              return;
            }
            setModal('create');
          }} 
          className="btn-primary w-full sm:w-auto"
          disabled={categoriesLoading}
        >
          <FiPlus className="w-4 h-4" /> Add Book
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 dark:text-ink-400 w-4 h-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books…"
          className="input-field pl-9 h-11"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead className="bg-parchment-50 dark:bg-ink-900 border-b border-parchment-200 dark:border-ink-700">
                <tr>
                  {['Title', 'Author', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-xs font-medium text-ink-500 dark:text-ink-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-100">
                {filtered.map((book) => (
                  <tr key={book.bookId} className="hover:bg-parchment-50 dark:bg-ink-900 transition-colors">
                    <td className="px-4 py-3 font-sans text-sm text-ink-800 dark:text-parchment-50 max-w-[160px] truncate">{book.title}</td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-600 dark:text-ink-400 max-w-[120px] truncate">{book.author}</td>
                    <td className="px-4 py-3"><span className="badge-green text-xs">{book.category?.categoryName || book.category?.name || book.categoryName || '—'}</span></td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-800 dark:text-parchment-50">₹{book.price?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={book.stock > 0 ? 'badge-green' : 'badge-red'}>{book.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal(book)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-500 dark:text-ink-400 hover:bg-parchment-100 dark:bg-ink-800 hover:text-ink-800 dark:text-parchment-50 transition-colors"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this book?')) deleteMutation.mutate(book.bookId); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <BookFormModal
            book={modal === 'create' ? null : modal}
            categories={categories}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBooksPage;
