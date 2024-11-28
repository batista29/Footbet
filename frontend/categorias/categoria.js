const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const closeSidebar = document.querySelector('.close-sidebar');

// Mostrar o menu
menuToggle.addEventListener('click', () => {
  sidebar.classList.add('active');
});

// Fechar o menu
closeSidebar.addEventListener('click', () => {
  sidebar.classList.remove('active');
});

// Fechar o menu clicando fora
window.addEventListener('click', (event) => {
  if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
    sidebar.classList.remove('active');
  }
});



const carousel = document.querySelector('.carousel');
const prevButton = document.querySelector('.carousel-button.prev');
const nextButton = document.querySelector('.carousel-button.next');

// Variável para controlar a posição do carrossel
let scrollPosition = 0;

// Largura de cada cartão (incluindo gap entre eles)
const cardWidth = 270; // Altere conforme o tamanho real do cartão + gap

// Evento para o botão "Anterior"
prevButton.addEventListener('click', () => {
  scrollPosition += cardWidth;
  if (scrollPosition > 0) scrollPosition = 0; // Impede que volte além do início
  updateCarousel();
});

// Evento para o botão "Próximo"
nextButton.addEventListener('click', () => {
  scrollPosition -= cardWidth;
  const maxScroll = -(carousel.scrollWidth - carousel.clientWidth);
  if (scrollPosition < maxScroll) scrollPosition = maxScroll; // Impede de ultrapassar o fim
  updateCarousel();
});

// Função para atualizar a posição do carrossel
function updateCarousel() {
  carousel.style.transform = `translateX(${scrollPosition}px)`;
}


//evento mais apostado
const carousel2 = document.querySelector('.carousel2');
const prevButton2 = document.querySelector('.carousel-button.prev2');
const nextButton2 = document.querySelector('.carousel-button.next2');

// Variável para controlar a posição do carrossel
let scrollPosition2 = 0;

// Largura de cada cartão (incluindo gap entre eles)
const cardWidth2 = 270; // Altere conforme o tamanho real do cartão + gap

// Evento para o botão "Anterior"
prevButton2.addEventListener('click', () => {
  scrollPosition2 += cardWidth2;
  if (scrollPosition2 > 0) scrollPosition2 = 0; // Impede que volte além do início
  updateCarousel2();
});

// Evento para o botão "Próximo"
nextButton2.addEventListener('click', () => {
  scrollPosition2 -= cardWidth2;
  const maxScroll = -(carousel2.scrollWidth - carousel2.clientWidth);
  if (scrollPosition2 < maxScroll) scrollPosition2 = maxScroll; // Impede de ultrapassar o fim
  updateCarousel2();
});

// Função para atualizar a posição do carrossel
function updateCarousel2() {
  carousel2.style.transform = `translateX(${scrollPosition2}px)`;
}



//Categorias
const carousel3 = document.querySelector('.carousel3');
const prevButton3 = document.querySelector('.carousel-button.prev3');
const nextButton3 = document.querySelector('.carousel-button.next3');

// Variável para controlar a posição do carrossel
let scrollPosition3 = 0;

// Largura de cada cartão (incluindo o gap entre eles)
const cardWidth3 = 270; // Altere conforme o tamanho do card + o espaçamento

// Evento para o botão "Anterior"
prevButton3.addEventListener('click', () => {
  scrollPosition3 += cardWidth3;
  if (scrollPosition3 > 0) scrollPosition3 = 0; // Impede que volte além do início
  updateCarousel3();
});

// Evento para o botão "Próximo"
nextButton3.addEventListener('click', () => {
  scrollPosition3 -= cardWidth3;
  const maxScroll3 = -(carousel3.scrollWidth - carousel3.clientWidth);
  if (scrollPosition3 < maxScroll3) scrollPosition3 = maxScroll3; // Impede que passe do final
  updateCarousel3();
});

// Função para atualizar a posição do carrossel
function updateCarousel3() {
  carousel3.style.transform = `translateX(${scrollPosition3}px)`;
}



