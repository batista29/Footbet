
// Função para formatar a data
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}`;
}
async function carregar() {
    const myHeaders = new Headers();
    myHeaders.append("categoria", "copa do brasil");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch("http://127.0.0.1:3000/categoryEvents", requestOptions);

        let message = await response.text();
        console.log("Resposta do servidor:", message);
        message = JSON.parse(message);

        const eventosContainer = document.querySelector('.carousel'); // A div onde os cards ficarão

        // Limpar conteúdos antigos, se necessário
        eventosContainer.innerHTML = '';

        message.forEach(e => {
            const card = document.createElement('div');
            card.className = 'card';

            // Adicionar os dados ao card
            card.innerHTML = `
                <span class="data">${formatDate(e.dataEvento) || 'Data indisponível'}</span>
                <h4>${e.titulo || 'Título indisponível'}</h4>
                <div class="info">
                    <div class="categoria">${e.descricao || 'Descrição indisponível'}</div>
                    <div class="valor">Valor da cota: R$ ${e.valor_cota || '0.00'}</div>
                </div>
                <a href="#" class="button open" data-id="${e.id_evento}">Ver</a>
            `;

            // Adicionar o card ao contêiner
            eventosContainer.appendChild(card);
        });
        // Adicionando o listener para os botões
        document.querySelectorAll('.button.open').forEach(button => {
            button.addEventListener('click', function (event) {
                const id = event.target.getAttribute("data-id"); // Captura o ID através do data-id do botão
                if (id) {
                    window.location.href = `../../BetOnEvent/index.html?id=${id}`; // Redireciona com o ID na URL
                } else {
                    console.log("ID do evento não encontrado.");
                }
            });
        });

    } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
        alert("Erro ao conectar ao servidor. Por favor, tente novamente mais tarde.");
    }
}