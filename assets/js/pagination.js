export const PAGE_SIZE = 12;

export function paginate(items, requestedPage = 1) {
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number.isSafeInteger(Number(requestedPage)) ? Number(requestedPage) : 1));
  const start = (page - 1) * PAGE_SIZE;
  return { page, pages, start, end: Math.min(start + PAGE_SIZE, items.length), items: items.slice(start, start + PAGE_SIZE) };
}

export function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  let middle = [current - 1, current, current + 1];
  if (current <= 4) middle = [2, 3, 4, 5];
  else if (current >= total - 3) middle = [total - 4, total - 3, total - 2, total - 1];
  const values = [1, ...middle, total];
  const result = [];
  values.forEach((value, index) => {
    if (index && value - values[index - 1] > 1) result.push(null);
    result.push(value);
  });
  return result;
}
