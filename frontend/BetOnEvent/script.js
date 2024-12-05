function sair() {
    localStorage.clear();
    window.location.href = '../accounts/login.html';
}

// 
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

// carregar dados evento na apgina
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

function formatDatetime(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function obterId() {
    const id = localStorage.getItem('id_aposta');
    return id;
}

var id = obterId();
var valor_cota = null;

async function carregar(id) {
    if (id) {
        const myHeader = new Headers();
        myHeader.append("Content-Type", "application/json");
        myHeader.append("id_evento", id);

        const requestOptions = {
            method: "POST",
            headers: myHeader,
        };

        try {
            // Esperando a resposta da requisição
            const result = await fetch("http://localhost:3000/getEventbyID", requestOptions);

            if (result.ok) {
                const infos_event = await result.json();  // Converter a resposta para JSON

                let id_aposta = infos_event[0].id_evento;
                localStorage.setItem('id_aposta', id_aposta);
                console.log('id do item', id_aposta)

                // Verificar o conteúdo da resposta
                console.log("Resposta do backend:", infos_event);//retornando results normal
                document.getElementById('titulo').innerHTML = `${infos_event[0].titulo}`;
                document.getElementById('descricao').innerHTML = `${infos_event[0].descricao}`;
                document.getElementById('dtEvento').innerHTML = `Data do evento: ${formatDate(infos_event[0].dataEvento)}`;
                document.getElementById('inicio').innerHTML = `Inicio das Apostas: ${formatDatetime(infos_event[0].inicioApostas)}`;
                document.getElementById('fim').innerHTML = `Fim das Apostas: ${formatDatetime(infos_event[0].fimApostas)}`;
                valor_cota = infos_event[0].valor_cota;
            } else {
                console.log("Campo 'saldo' não encontrado na resposta.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
        }
    } else {
        console.log("Erro: ID de usuário não fornecido.");

    }
}
let infos_user = JSON.parse(localStorage.getItem('dados_user'));
let id_user = infos_user.user_id;  // ID do usuário
console.log(id_user);// ID do usuário
carregar(id);

function passData() {
    const idEvento = obterId();
    const inputIdEvento = document.getElementById("idEventoModal");
    if (idEvento) {
        inputIdEvento.value = idEvento; // Atribui o ID ao input
    } else {
        inputIdEvento.value = "ID não encontrado"; // Caso não encontre o ID
    }
    document.getElementById("valorCota").textContent = `R$ ${valor_cota}`;
    document.getElementById("cota").value = `${valor_cota}`;
}

async function makeBet() {
    let infos_user = JSON.parse(localStorage.getItem('dados_user'));
    let email = infos_user.email;  // ID do usuário
    // ID do usuário
    const id_evento = document.getElementById("idEventoModal").value;
    const qtd_cotas = document.getElementById("qtd_cotas").value;
    const valor_cota = document.getElementById("cota").value;
    const aposta = document.getElementById("aposta").value;
    console.log(email, aposta);
    if (email) {
        const myHeader = new Headers();
        myHeader.append("Content-Type", "application/json");
        myHeader.append("email", email);
        myHeader.append("id_evento", id_evento);
        myHeader.append("qtd_cotas", qtd_cotas);
        myHeader.append("valor_cota", valor_cota);
        myHeader.append("aposta", aposta);

        const requestOptions = {
            method: "POST",
            headers: myHeader,
        };

        try {
            // Esperando a resposta da requisição
            const result = await fetch("http://localhost:3000/betOnEvent", requestOptions);

            if (result.ok) {
                alert("Aposta realizada com sucesso!");  // Converter a resposta para JSON

            } else {
                alert("Erro ao realizar aposta!");
                console.log(result.text());
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
        }
    } else {
        console.log("Erro: email não fornecido.");

    }
}