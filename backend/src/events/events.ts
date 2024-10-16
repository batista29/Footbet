import {Request, RequestHandler, Response} from "express";

// namespace para agrupar todos os metodos e funções relacionados aos eventos
export namespace EventsHandler {

    //Tipo Eventos

    type Event = {
        id: number;
        title: string;
        description: string;
        eventDate: Date;
        status: string;
    };

    //Array para simular bd
    let eventsArray: Event[]=[
        {id:1,title: "evento 1", description: "teste de eventos 1", eventDate: new Date('10/02/2005'), status:"accepted"},
        {id:2,title: "evento 2", description: "teste de eventos 2", eventDate: new Date('30/12/2023'), status:"waiting"},
        {id:3,title: "evento 3", description: "teste de eventos 3", eventDate: new Date('15/10/2024'), status: "rejected"},
    ]

    //função para salvar evento - Alterar para salvar no bd -
    export function saveNewEvent(ev: Event): number{
        eventsArray.push(ev);
        return eventsArray.length;
    }

    export const addNewEventRoute : RequestHandler = (req, resp)=>{
        // Receber os parametros para criar a conta 
        const pId = req.get('id');
        const pTitle = req.get('title');
        const pDescription = req.get('description');
        const pEventDate = req.get('password');
        const pStatus = "waiting";

        //Verificar se os campos não são vazios
        if(pTitle && pDescription && pEventDate){
            const newEvent : Event = {
                id: Number(pId),
                title: pTitle,
                description: pDescription,
                eventDate: new Date(pEventDate),
                status: pStatus,
            };
            const cont = saveNewEvent(newEvent);
            resp.statusCode=  200;
            resp.send(`Novo evento adicionado na lista de espera\n Evento n: ${cont}`);
        }else{
            resp.statusCode=  400;
            resp.send(`Erro na obtenção dos dados ou dados inválidos`);
        }

    }
    //função para "remover" eventos - Alterar para remover no bd -
    export function deleteEvent(id: number): void{

        const resul= eventsArray.find(ev =>{
            if(id === ev.id){
                
            }
        })
    }
    //rota para excluir evento
    export const deleteEventRoute : RequestHandler = (req, resp)=>{
        // Receber os parametros para criar a conta 
        const pId = req.get('id');

        //Verificar se os campos não são vazios
        if(pId){
            
        }else{
            resp.statusCode=  400;
            resp.send(`Erro na obtenção dos dados ou dados inválidos`);
        }
    }
}