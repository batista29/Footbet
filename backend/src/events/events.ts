import { Request, RequestHandler, Response } from "express";
import oracledb from "oracledb";

// Namespace para agrupar todos os métodos e funções relacionados aos eventos
export namespace EventsHandler {

    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    // Função para conectar ao banco de dados
    async function getConnection() {
        return await oracledb.getConnection({
            user: "hr",
            password: 'mypw',
            connectString: "localhost/FREEPDB1",
        });
    }

    // Tipo Evento
    type Event = {
        id: number;
        title: string;
        description: string;
        eventDate: Date;
        betsStart: Date;
        betsEnd: Date;
        valueYes: number;
        valueNo: number;
        status: string;
    };

    // Função para salvar um novo evento no banco de dados
    async function saveNewEvent(ev: Event): Promise<void> {
        const connection = await getConnection();
        await connection.execute(
            `INSERT INTO Evento (id, title, description, eventDate, betsStart, betsEnd, valueYes, valueNo, status)
             VALUES (:id, :title, :description, :eventDate, :betsStart, :betsEnd, :valueYes, :valueNo, :status)`,
            {
                id: ev.id,
                title: ev.title,
                description: ev.description,
                eventDate: ev.eventDate,
                betsStart: ev.betsStart,
                betsEnd: ev.betsEnd,
                valueYes: ev.valueYes,
                valueNo: ev.valueNo,
                status: ev.status,
            },
            { autoCommit: true }
        );
    }

    // Rota para adicionar um novo evento
    export const addNewEventRoute: RequestHandler = async (req, resp) => {
        try {
            const pId = req.get('id');
            const pTitle = req.get('title');
            const pDescription = req.get('description');
            const pEventDate: any = req.get('eventDate');
            const pBetsStart: any = req.get('betsStart');
            const pBetsEnd: any = req.get('betsEnd');
            const pValueYes = req.get('valueYes');
            const pValueNo = req.get('valueNo');
            const pStatus = "analise";

            if (pTitle && pDescription && pEventDate) {
                const newEvent: Event = {
                    id: Number(pId),
                    title: pTitle,
                    description: pDescription,
                    eventDate: new Date(pEventDate),
                    betsStart: new Date(pBetsStart),
                    betsEnd: new Date(pBetsEnd),
                    valueYes: Number(pValueYes),
                    valueNo: Number(pValueNo),
                    status: pStatus,
                };
                await saveNewEvent(newEvent);
                resp.status(200).send('Novo evento adicionado com sucesso.');
            } else {
                resp.status(400).send('Dados inválidos.');
            }
        } catch (error) {
            console.error('Erro ao adicionar evento:', error);
            resp.status(500).send('Erro interno.');
        }
    };

    // Função para excluir um evento (alterar status para 'deleted')
    export async function deleteEvent(id: number): Promise<void> {
        const connection = await getConnection();
        await connection.execute(
            `UPDATE Evento SET status = 'deleted' WHERE id = :id`,
            { id },
            { autoCommit: true }
        );
    }

    // Rota para excluir um evento
    export const deleteEventRoute: RequestHandler = async (req, resp) => {
        try {
            const pId = req.get('id');
            if (!pId) {
                resp.status(400).send('ID inválido.');
                return;
            }
            await deleteEvent(Number(pId));
            resp.status(200).send('Evento excluído com sucesso.');
        } catch (error) {
            console.error('Erro ao excluir o evento:', error);
            resp.status(500).send('Erro interno.');
        }
    };

    // Função para encontrar apostadores vencedores
    export async function findBettors(id: number, betResult: string): Promise<any[]> {
        const connection = await getConnection();
        let query = '';
        if (betResult.toLowerCase() === 's') {
            query = "SELECT id_participante FROM Participa WHERE id_evento = :id AND aposta = 's'";
        } else if (betResult.toLowerCase() === 'n') {
            query = "SELECT id_participante FROM Participa WHERE id_evento = :id AND aposta = 'n'";
        } else {
            throw new Error('Resultado da aposta inválido.');
        }
        const result = await connection.execute(query, { id }, { outFormat: oracledb.OUT_FORMAT_ARRAY });
        await connection.close();
        return result.rows || [];
    }

    // Função para calcular o total apostado pelos vencedores
    export async function sumOfIncomingsWinners(id: number, betResult: string): Promise<number> {
        const connection = await getConnection();
        const result = await connection.execute(
            `SELECT sum(total_apostado) FROM Participa WHERE id_evento = :id AND aposta = :betResult`,
            { id, betResult },
            { outFormat: oracledb.OUT_FORMAT_ARRAY }
        );
        await connection.close();
        return Number(result.rows);
    }

    // Função para calcular o total apostado no evento
    export async function sumOfIncomings(id: number): Promise<number> {
        const connection = await getConnection();
        const result = await connection.execute(
            `SELECT sum(total_apostado) FROM Participa WHERE id_evento = :id`,
            { id },
            { outFormat: oracledb.OUT_FORMAT_ARRAY }
        );
        await connection.close();
        return Number(result.rows);
    }

    // Função para encerrar um evento e distribuir prêmios
    export async function finishEvent(id: number, betResult: string): Promise<void> {
        const connection = await getConnection();
        try {
            await connection.execute(
                `UPDATE Evento SET status = 'finished' WHERE id = :id`,
                { id },
                { autoCommit: true }
            );

            const vencedores = await findBettors(id, betResult);
            const total_apostado = await sumOfIncomings(id);
            const total_vencedores = await sumOfIncomingsWinners(id, betResult);

            for (const vencedor of vencedores) {
                const idParticipante = vencedor[0];
                const valorResult = await connection.execute(
                    `SELECT total_apostado FROM Participa WHERE id_evento = :id_evento AND id_participante = :id_participante`,
                    { id_evento: id, id_participante: idParticipante },
                    { outFormat: oracledb.OUT_FORMAT_ARRAY }
                );
                const valorApostado = Number(valorResult);
                const prize = (valorApostado / total_vencedores) * total_apostado;

                await connection.execute(
                    `UPDATE Transacao SET value = value + :prize WHERE id_user = :id`,
                    { prize, id: idParticipante },
                    { autoCommit: true }
                );
            }
        } catch (error) {
            console.error('Erro ao encerrar o evento:', error);
            throw error;
        } finally {
            await connection.close();
        }
    }

    // Rota para encerrar um evento
    export const finishEventRoute: RequestHandler = async (req, resp) => {
        try {
            const pId = req.get('id');
            const pBetResult = req.get('betResult');

            if (!pId || !pBetResult) {
                resp.status(400).send('Dados inválidos.');
                return;
            }

            await finishEvent(Number(pId), pBetResult);
            resp.status(200).send('Evento encerrado com sucesso.');
        } catch (error) {
            console.error('Erro na rota:', error);
            resp.status(500).send('Erro ao encerrar o evento.');
        }
    };
}
