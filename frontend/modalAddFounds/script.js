//Função principal para fazer transações
async function doTransaction() {
    const valueTransaction = document.getElementById('valueFounds').value;

    const myHeaders = new Headers();
    myHeaders.append("id_wallet", "4");
    myHeaders.append("id_user", "4");
    myHeaders.append("value", valueTransaction);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow"
    };

    await fetch("http://127.0.0.1:3000/addFunds", requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
}

//Função para chamar o modal
function openModal() {
    const modalFounds = document.getElementById('modalFounds');
    modalFounds.classList.remove('model');
}

//Função para fechar o modal
function closeModal() {
    const modalFounds = document.getElementById('modalFounds');
    modalFounds.classList.add('model');
}

//Funções para trocar a cor dos botões de opção do modal
function tradeBtnAddFoundsColor() {
    document.getElementById('btnAddFounds').style.backgroundColor = '#fff';
    document.getElementById('btnAddFounds').style.color = '#002852';
}

function tradeBtnWithDrawFounds() {
    document.getElementById('btnAddFounds').style.backgroundColor = '#fff';
    document.getElementById('btnAddFounds').style.color = '#002852';
}