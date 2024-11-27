async function carregar() {
    const myHeaders = new Headers();
    myHeaders.append("categoria", "sul americana");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch("http://127.0.0.1:3000/categoryEvents", requestOptions);

        let message = await response.text();
        message = JSON.parse(message);

        const eventosContainer = document.querySelector('.carousel'); // A div onde os cards ficarão

        // Limpar conteúdos antigos, se necessário
        eventosContainer.innerHTML = '';

        message.forEach(e => {
            const card = document.createElement('div');
            card.className = 'card';

            // Adicionar os dados ao card
            card.innerHTML = `
                <span class="data">${e.dataEvento || 'Data indisponível'}</span>
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
        alert("Erro ao conectar ao servidor. Por favor, tente novamente mais tarde.");
    }
}