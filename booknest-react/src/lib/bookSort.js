/** Client-side sort for catalogue (search/genre endpoints return unsorted lists). */
export function sortBooks(list, sortKey) {
  if (!list?.length) return [];
  const [field, dir] = (sortKey || 'title,asc').split(',');
  const mul = dir === 'desc' ? -1 : 1;
  const arr = [...list];
  arr.sort((a, b) => {
    if (field === 'title') {
      return mul * String(a.title || '').localeCompare(String(b.title || ''), undefined, { sensitivity: 'base' });
    }
    if (field === 'price') {
      return mul * ((Number(a.price) || 0) - (Number(b.price) || 0));
    }
    if (field === 'rating') {
      return mul * ((Number(a.rating) || 0) - (Number(b.rating) || 0));
    }
    return 0;
  });
  return arr;
}
