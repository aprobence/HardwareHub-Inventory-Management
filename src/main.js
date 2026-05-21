import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('#nav-links .nav-link');
  const pages = document.querySelectorAll('.page-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      pages.forEach(page => page.classList.add('d-none'));

      const targetPageId = link.getAttribute('data-page');
      const targetPage = document.getElementById(`page-${targetPageId}`);
      if (targetPage) {
        targetPage.classList.remove('d-none');
      }
    });
  });
});