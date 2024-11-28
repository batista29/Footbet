function apostar(id_evento) {
  let id = id_evento;
  console.log(id);

  localStorage.setItem('id_aposta', id);
  window.location.href='../BetOnEvent/index.html';
}

async function pesquisar() {
  const inpPesquisa = document.getElementById('inpPesquisa').value;
  console.log(inpPesquisa);
  const myHeaders = new Headers();
  myHeaders.append("keyword", `${inpPesquisa}`);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow"
  };
  try {
    const response = await fetch("http://127.0.0.1:3000/searchEvents", requestOptions);
    console.log(inpPesquisa);
    let message = await response.text();
    message = JSON.parse(message);
    const eventosContainer = document.querySelector('.carousel'); // A div onde os cards ficarão
    // Limpar conteúdos antigos, se necessário
    eventosContainer.innerHTML = '';
    message.forEach(e => {
      const data = new Date(e.inicioApostas);
      const dia = data.getDate().toString().padStart(2, '0');
      const mes = (data.getMonth() + 1).toString().padStart(2, '0');
      const ano = data.getFullYear();
      const dataBR = `${dia}/${mes}/${ano}`;
      const card = document.createElement('div');
      card.className = 'card';
      // Adicionar os dados ao card
      card.innerHTML = `
              <span class="data">${dataBR || 'Data indisponível'}</span>
              <h4>${e.titulo || 'Título indisponível'}</h4>
              <div class="info">
                  <div class="categoria">${e.descricao || 'Descrição indisponível'}</div>
                  <div class="valor">Valor da cota: R$ ${e.valor_cota || '0.00'}</div>
              </div>
              <a href="#" class="button">Ver</a>
          `;
      // Adicionar o card ao contêiner
      eventosContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao conectar ao servidor:", error);
    alert("Evento não existe ou indisponivel");
  }
}
async function todos() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  try {
    const response = await fetch("http://127.0.0.1:3000/getAllEvents", requestOptions);

    let message = await response.text();
    message = JSON.parse(message);

    const eventosContainer = document.querySelector('.carousel'); // A div onde os cards ficarão

    // Limpar conteúdos antigos, se necessário
    eventosContainer.innerHTML = '';

    message.forEach(e => {
      const data = new Date(e.inicioApostas);

      const dia = data.getDate().toString().padStart(2, '0');
      const mes = (data.getMonth() + 1).toString().padStart(2, '0');
      const ano = data.getFullYear();

      const dataBR = `${dia}/${mes}/${ano}`;

      const card = document.createElement('div');
      card.className = 'card';

      // Adicionar os dados ao card
      card.innerHTML = `
              <span class="data">${dataBR || 'Data indisponível'}</span>
              <h4>${e.titulo || 'Título indisponível'}</h4>
              <div class="info">
                  <div class="categoria">${e.descricao || 'Descrição indisponível'}</div>
                  <div class="valor">Valor da cota: R$ ${e.valor_cota || '0.00'}</div>
              </div>
              <button class="button" onclick="apostar(${e.id_evento})">Ver</button>
          `;

      // Adicionar o card ao contêiner
      eventosContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Erro ao conectar ao servidor:", error);
    alert("Erro ao conectar ao servidor. Por favor, tente novamente mais tarde.");

    alert("Evento não existe ou indisponivel");
  }
}

async function topBets() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  try {
    const response = await fetch("http://127.0.0.1:3000/topEvents", requestOptions);

    let message = await response.text();
    message = JSON.parse(message);

    const eventosContainer = document.querySelector('.carousel2'); // A div onde os cards ficarão

    // Limpar conteúdos antigos, se necessário
    eventosContainer.innerHTML = '';

    message.forEach(e => {
      const data = new Date(e.inicioApostas);

      const dia = data.getDate().toString().padStart(2, '0');
      const mes = (data.getMonth() + 1).toString().padStart(2, '0');
      const ano = data.getFullYear();

      const dataBR = `${dia}/${mes}/${ano}`;

      const card = document.createElement('div');
      card.className = 'card';

      // Adicionar os dados ao card
      card.innerHTML = `
              <span class="data">${dataBR || 'Data indisponível'}</span>
              <h4>${e.titulo || 'Título indisponível'}</h4>
              <div class="info">
                  <div class="categoria">${e.descricao || 'Descrição indisponível'}</div>
                  <div class="valor">Valor da cota: R$ ${e.valor_cota || '0.00'}</div>
              </div>
             <button class="button" onclick="apostar(${e.id_evento})">Ver</button>
          `;

      // Adicionar o card ao contêiner
      eventosContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Erro ao conectar ao servidor:", error);
    alert("Erro ao conectar ao servidor. Por favor, tente novamente mais tarde.");

    alert("Evento não existe ou indisponivel");
  }
}

async function carregar() {
  todos();
  topBets();
}

carousel = document.querySelector('.carousel');
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
carousel2 = document.querySelector('.carousel2');
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
