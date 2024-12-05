//Função principal para fazer transações
async function AddEvent() {
    const title = document.getElementById('titulo').value;
    const description = document.getElementById('descricao').value;
    const eventDate = document.getElementById('dtEvento').value;
    const betsStart = document.getElementById('InicioApts').value;
    const betsEnd = document.getElementById('FimApts').value;
    const value = parseFloat(document.getElementById('valorCota').value.replace(',', '.'));
    const email = document.getElementById('email').value;
    const categoria = document.getElementById('categoria').value;
    console.log(title, description, eventDate,betsStart, betsEnd,value,email,categoria);

    let infos_user= JSON.parse(localStorage.getItem('dados_user'));
    let id_user = infos_user.user_id;  // ID do usuário
    console.log(id_user); // ID do usuário

    if (title && description && eventDate &&betsStart &&betsEnd &&value && email) {
        const dataev = new Date(eventDate);
        const InicioApts = new Date(betsStart);
        const FimApts = new Date(betsEnd);
        if(dataev <= InicioApts || dataev <=FimApts){
            document.getElementById("feedback").innerHTML =`<div class="alert alert-danger" role="alert">
                                                        As data de aposta devem ser anterior a data do evento!</div>`;
            return;                                            
        }else if(FimApts<=InicioApts){
            document.getElementById("feedback").innerHTML =`<div class="alert alert-danger" role="alert">
            A data de fim das apostas devem ser posterior a data de início!</div>`;
            return;
        }
        const myHeaders = new Headers();
        myHeaders.append("Content-Type","application/JSON");
        myHeaders.append("id_criador",id_user);
        myHeaders.append("title",title);
        myHeaders.append("description",description);
        myHeaders.append("eventDate",eventDate);
        myHeaders.append("betsStart",betsStart);
        myHeaders.append("betsEnd",betsEnd);
        myHeaders.append("value", value);
        myHeaders.append("email",email);
        myHeaders.append("categoria",categoria);

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
        };
        await fetch("http://localhost:3000/addNewEvent", requestOptions)
            .then((response) => {
                console.log(response.text());
                if (response.status === 200) {
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