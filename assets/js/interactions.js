// Keep form editing available while preventing page content selection and dragging.
function isEditable(target) {
  return target instanceof Element && (
    target.closest('input, textarea') !== null || target.isContentEditable
  );
}

document.addEventListener('contextmenu', event => event.preventDefault());
for (const type of ['selectstart', 'dragstart']) {
  document.addEventListener(type, event => {
    if (!isEditable(event.target)) event.preventDefault();
  });
}
