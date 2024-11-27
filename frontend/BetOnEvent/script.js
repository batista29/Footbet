// Seleciona os elementos
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.querySelector(".close-btn");

// Verifica se os elementos foram encontrados
if (modal && openModalBtn && closeModalBtn) {
    // Abre o modal ao clicar no botão "Apostar"
    openModalBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    // Fecha o modal ao clicar no botão "×"
    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Fecha o modal clicando fora do conteúdo
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
} else {
    console.error("Erro: Elementos do modal não encontrados.");
}

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


document.getElementById("betForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita o reload da página

    const aposta = document.querySelector('input[name="aposta"]:checked').value;
    const qtd_cotas = document.getElementById("qtd_cotas").value;
    const id_evento = document.getElementById("id_evento").value;
    const valor_cota = 5.50; // Valor fixo informado no HTML
    console.log('qtd_cotas');
    // Informações do usuário (simuladas aqui, ajuste conforme seu sistema)
    const user_id = "3"; // Substituir com o ID real do usuário (token ou header)
    const email = "natabatista2908@gmail.com"; // Substituir com o email real do usuário

    try {
        const response = await fetch("http://127.0.0.1:3000/betOnEvent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "user_id": user_id,
                "email": email,
            },
            body: JSON.stringify({
                qtd_cotas: qtd_cotas,
                id_evento: 1,
                valor_cota: valor_cota,
                aposta: aposta,
            }),
        });

        if (response.ok) {
            const result = await response.text();
            alert("Aposta realizada com sucesso: " + result);
        } else {
            const error = await response.text();
            alert("Erro ao realizar aposta: " + error);
        }
    } catch (err) {
        console.error("Erro na requisição:", err);
        alert("Erro de conexão com o servidor.");
    }
});


function submitEvent() {
    const team1 = document.getElementById('team1').innerText;
    const team2 = document.getElementById('team2').innerText;

    fetch('http://localhost:3000/addNewEventRoute', {
        method: 'POST',
        headers: {
            'id_criador': '3', // Exemplo: pode ser dinâmico
            'title': `${team1} vs ${team2}`, // Gerando o título com os times
            'description': 'Jogo válido pela 30ª rodada do Brasileirão!',
            'eventDate': '2024-12-01T15:00:00Z',
            'betsStart': '2024-11-25T10:00:00Z',
            'betsEnd': '2024-11-30T23:59:00Z',
            'value': '100',
            'email': 'criador@exemplo.com',
        },
    })
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error('Erro:', error));
}


