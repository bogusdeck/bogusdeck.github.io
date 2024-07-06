document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const modalBg = document.getElementById('modal-bg');
    const closeModal = document.getElementById('close-modal');
  
    menuToggle.addEventListener('click', () => {
        modalBg.classList.remove('hidden');
    });
  
    closeModal.addEventListener('click', () => {
        modalBg.classList.add('hidden');
    });
  
    modalBg.addEventListener('click', (e) => {
        if (e.target === modalBg) {
            modalBg.classList.add('hidden');
        }
    });
  });
  