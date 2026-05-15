import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import bookService from '@/services/bookService';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const categorySchema = yup.object({
  categoryName: yup.string().required('Category name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().required('Description is required').min(5, 'Description must be at least 5 characters'),
});

const CategoryFormModal = ({ category, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: category ? {
      categoryName: category.categoryName,
      description: category.description,
    } : { categoryName: '', description: '' },
  });

  const onSubmit = (data) => {
    onSave(data);
    reset();
  };

  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white dark:bg-ink-800 rounded-2xl shadow-elevated w-full max-w-lg"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-parchment-200 dark:border-ink-700">
          <h2 className="font-display text-xl text-ink-900 dark:text-white">{category ? 'Edit Category' : 'Add New Category'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-parchment-50 dark:bg-ink-900 text-ink-500 dark:text-ink-400">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">Category Name</label>
            <input 
              {...register('categoryName')} 
              type="text"
              placeholder="e.g., Fiction, Technology, Science"
              className="input-field" 
            />
            {errors.categoryName && <p className="mt-1 text-xs text-red-600">{errors.categoryName.message}</p>}
          </div>

          <div>
            <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">Description</label>
            <textarea 
              {...register('description')} 
              placeholder="Brief description of this category"
              rows={3}
              className="input-field resize-none"
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? <Spinner size="sm" /> : (category ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminCategoriesPage = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data: categories = [], isLoading, error } = useQuery(
    'admin-categories',
    async () => {
      console.log('Fetching categories...');
      try {
        const result = await bookService.getCategories();
        console.log('Categories fetched:', result);
        return result;
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        throw err;
      }
    }
  );

  const createMutation = useMutation(bookService.createCategory, {
    onSuccess: () => { qc.invalidateQueries('admin-categories'); setModal(null); toast.success('Category created!'); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation(({ id, data }) => bookService.updateCategory(id, data), {
    onSuccess: () => { qc.invalidateQueries('admin-categories'); setModal(null); toast.success('Category updated!'); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation(bookService.deleteCategory, {
    onSuccess: () => { qc.invalidateQueries('admin-categories'); toast.success('Category deleted'); },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = (data) => {
    if (modal && modal !== 'create') {
      updateMutation.mutate({ id: modal.categoryId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink-900 dark:text-white">Manage Categories</h1>
        <button onClick={() => setModal('create')} className="btn-primary">
          <FiPlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {categories.map((cat) => (
            <motion.div
              key={cat.categoryId}
              className="card p-5 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-display text-lg text-ink-900 dark:text-white mb-2">{cat.categoryName}</h3>
              <p className="font-sans text-sm text-ink-600 dark:text-ink-400 mb-4 line-clamp-2">{cat.description}</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setModal(cat)}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  <FiEdit2 className="w-4 h-4 inline mr-1" /> Edit
                </button>
                <button 
                  onClick={() => deleteMutation.mutate(cat.categoryId)}
                  className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg py-2 font-medium transition"
                >
                  <FiTrash2 className="w-4 h-4 inline mr-1" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ink-500 dark:text-ink-400 mb-4">No categories yet. Create one to get started!</p>
          <button onClick={() => setModal('create')} className="btn-primary">
            <FiPlus className="w-4 h-4 inline mr-2" /> Create First Category
          </button>
        </div>
      )}

      <AnimatePresence>
        {modal && <CategoryFormModal category={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategoriesPage;
