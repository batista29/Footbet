//Função principal para fazer transações
async function doWithDraw() {
    const valueTransaction = parseFloat(document.getElementById('valueFoundsWithDraw').value.replace(',', '.'));
    //teste de commit
    if (valueTransaction) {

        let infos_user = JSON.parse(localStorage.getItem('dados_user'));
        let id_user = infos_user.user_id;  // ID do usuário
        console.log(id_user);  // ID do usuário
        const myHeaders = new Headers();
        myHeaders.append("id_wallet", id_user);
        myHeaders.append("id_user", id_user);
        myHeaders.append("value", valueTransaction);

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow"
        };

        await fetch("http://127.0.0.1:3000/withdrawFunds", requestOptions)
            .then((response) => {
                console.log(response.json);
                if (response.status === 200) {
                    alert(`Saque de R$${valueTransaction} realizado com sucesso`);
                    // location.reload()
                } else {
                    alert("Informação inválida, digite números positivos");
                }
            })
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
    } else {
        alert("Digite todas as informações pedidas");
    }
}

//Função para chamar o modal
function openModal() {
    const modalFounds = document.getElementById('modalFounds');
    modalFounds.classList.remove('model');
}

//Função para fechar o modal
function closeModal() {
    window.location.href = "../accounts/login.html";
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