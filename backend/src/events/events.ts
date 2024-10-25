import {Request, RequestHandler, Response} from "express";
import oracledb, {Connection} from "oracledb";
// namespace para agrupar todos os metodos e funções relacionados aos eventos
export namespace EventsHandler {

    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    //Conexão com bd
        async function getConnection() {
            const connection = await oracledb.getConnection({
                user: "hr",
                password: "mypw",
                connectString: "localhost/FREEPDB1"
            });
    }

    //Tipo Eventos
    type Event = {
        id: number;
        title: string;
        description: string;
        eventDate: Date;
        betsStart: Date;
        betsEnd: Date;
        status: string;
    };

    //Conexão com bd
    
    //função para salvar evento - Alterar para salvar no bd -
    async function saveNewEvent(ev: Event): Promise<void>{
        const connection = await getConnection();
        await connection.execute(
        `INSERT INTO Event (id, title, description, eventDate, betsStar, betsEnd, status)
        VALUES (:id, :title, :description, :eventDate, :betsStar, :betsEnd, :status)`,
        {
            id: ev.id,
            title: ev.title,
            description: ev.description,
            eventDate: ev.eventDate,
            betsStart: ev.betsStart,
            betsEnd: ev.betsEnd,
            status: ev.status
        },
        { autoCommit: true });
    }
    
    export const addNewEventRoute : RequestHandler = (req, resp)=>{
        // Receber os parametros para criar a conta 
        const pId = req.get('id');
        const pTitle = req.get('title');
        const pDescription = req.get('description');
        const pEventDate = req.get('eventDate');
        const pBetsStar = req.get('betsStar');
        const pBetsEnd = req.get('betsEnd');
        const pStatus = "waiting";

        //Verificar se os campos não são vazios
        if(pTitle && pDescription && pEventDate){
            const newEvent : Event = {
                id: Number(pId),
                title: pTitle,
                description: pDescription,
                eventDate: new Date(pEventDate),
                betsStart: new Date(pBetsStar),
                betsEnd: new Date(pBetsEnd),
                status: pStatus
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
    export async function deleteEvent(id: number): Promise<void>{
        const connection = await getConnection();
        const result = await connection.execute(
        `Update Event set status = 'deleted' where id = :id`,
        {id},
        { autoCommit: true });
    }
    //rota para excluir evento
    export const deleteEventRoute : RequestHandler = (req, resp)=>{
        // Receber os parametros para criar a conta 
        const pId = req.get('id');

        //Verificar se os campos não são vazios
        if(pId){
            deleteEvent(Number(pId));
        }else{
            resp.statusCode=  400;
            resp.send(`Erro na obtenção dos dados ou dados inválidos`);
        }
    }
    //função para "remover" eventos - Alterar para remover no bd -
    export async function finishEvent(id: number): Promise<void>{
        const connection = await getConnection();
        const result = await connection.execute(
        `Update Event set status = 'finished' where id = :id`,
        {id},
        { autoCommit: true });
    }
    //rota para excluir evento
    export const finishEventRoute : RequestHandler = (req, resp)=>{
        // Receber os parametros para criar a conta 
        const pId = req.get('id');

        //Verificar se os campos não são vazios
        if(pId){
            finishEvent(Number(pId));
        }else{
            resp.statusCode=  400;
            resp.send(`Erro na obtenção dos dados ou dados inválidos`);
        }
    }
    export const searchEventbyID: RequestHandler = (req, resp)=>{
        const pId = req.get('id');
        
    }
    export const evaluateNewEvent : RequestHandler = (req, resp)=>{
        

        
    }
}