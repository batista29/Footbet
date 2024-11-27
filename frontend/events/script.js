//Função principal para fazer transações
async function AddEvent() {
    const title = document.getElementById('titulo').value;
    const description = document.getElementById('descricao').value;
    const eventDate = document.getElementById('dtEvento').value;
    const betsStart = document.getElementById('InicioApts').value;
    const betsEnd = document.getElementById('FimApts').value;
    const value = parseFloat(document.getElementById('valorCota').value.replace(',', '.'));
    const email = document.getElementById('email').value;
    console.log(title, description, eventDate,betsStart, betsEnd,value,email);

    if (title && description && eventDate &&betsStart &&betsEnd &&value && email) {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type","application/JSON");
        myHeaders.append("id_criador","1");
        myHeaders.append("title",title);
        myHeaders.append("description",description);
        myHeaders.append("eventDate",eventDate);
        myHeaders.append("betsStart",betsStart);
        myHeaders.append("betsEnd",betsEnd);
        myHeaders.append("value", value);
        myHeaders.append("email",email);

        const requestOptions = {
            method: "PUT",
            headers: myHeaders,
        };
        await fetch("http://localhost:3000/addNewEvent", requestOptions)
            .then((response) => {
                console.log(response.text());
                if (response.status === 200) {
                    alert(`Solicitação realizada com sucesso`);
                    document.getElementById("feedback").innerHTML =`<div class="alert alert-success" role="alert">
                                                                    Cadastro realizado com sucesso!</div>`;
                    // location.reload()
                } else {
                    document.getElementById("feedback").innerHTML =`<div class="alert alert-danger" role="alert">
                                                                    Erro ao realizar cadastro!</div>`;
                }
            })
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
    } else {
        
        document.getElementById("feedback").innerHTML =`<div class="alert alert-danger" role="alert">
                                                        Preencha todos os campos</div>`;
    }
}