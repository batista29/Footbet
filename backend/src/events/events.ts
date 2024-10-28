import { Request, RequestHandler, Response } from "express";
import nodemailer from "nodemailer";
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
        id_creator: number;
        title: string;
        description: string;
        eventDate: Date;
        betsStart: Date;
        betsEnd: Date;
        value: number;
        status: string;
        email: string;
        creatorToken: string;
    };
    // Função para salvar um novo evento no banco de dados
    async function saveNewEvent(ev: Event): Promise<void> {
        const connection = await getConnection();
        await connection.execute(
            `INSERT INTO Evento (id_evento, id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email, ciadorToken)
             VALUES (:id, :id_creator, :title, :description, :eventDate, :betsStart, :betsEnd, :value, :status, :email, :creatorToken)`,
            {
                id: ev.id,
                id_creator: ev.id_creator,
                title: ev.title,
                description: ev.description,
                eventDate: ev.eventDate,
                betsStart: ev.betsStart,
                betsEnd: ev.betsEnd,
                value: ev.value,
                status: ev.status,
                email: ev.email,
                creatorToken: ev.creatorToken,
            },
            { autoCommit: true }
        );
    }

    // Rota para adicionar um novo evento
    export const addNewEventRoute: RequestHandler = async (req, resp) => {
        try {
            const pId = req.get('id');
            const pId_creator = req.get('id_creator'); //ver se não é erro aqui
            const pTitle = req.get('title');
            const pDescription = req.get('description');
            const pEventDate: any = req.get('eventDate');
            const pBetsStart: any = req.get('betsStart');
            const pBetsEnd: any = req.get('betsEnd');
            const pValue = req.get('value');
            const pStatus = "analise";
            const pemail = req.get('email');
            const pcreatorToken = req.get('creatorToken')

            if (pTitle && pDescription && pEventDate) {
                const newEvent: Event = {
                    id: Number(pId),
                    id_creator: Number(pId_creator),
                    title: pTitle,
                    description: pDescription,
                    eventDate: new Date(pEventDate),
                    betsStart: new Date(pBetsStart),
                    betsEnd: new Date(pBetsEnd),
                    value: Number(pValue),
                    status: pStatus,
                    email: pemail as string,
                    creatorToken: pcreatorToken as string,

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

    export const evaluateNewEvent: RequestHandler = async (req, resp) => {
        const eventId = req.get('eventId');
        const status = req.get('status');
        const rejectionReason = req.get('rejectioReason');
        const token = req.get('token');

        if (!eventId || !status || (status !== "aceito" && status !== "rejeitado")) {
            return resp.status(400).send('Dados inválidos.');
        }
        const connection = await getConnection();
        try {
            const eventResult = await connection.execute('SELECT creatorToken FROM events WHERE ID = :eventId', { eventId });
            const eventRows = eventResult.rows as Array<{ CREATORTOKEN: string }>;

            if (eventRows.length === 0) {
                return resp.status(404).send('Evento não encontrado.');
            }
            const creatorToken = eventRows[0].CREATORTOKEN;
            const emailResult = await connection.execute('SELECT email FROM accounts WHERE token = :creatorToken', { creatorToken });
            const emailRows = emailResult.rows as Array<{ EMAIL: string }>;

            if (emailRows.length === 0) {
                return resp.status(404).send('E-mail do criador não encontrado.');
            }
            const email = emailRows[0].EMAIL;

            if (status === 'rejeitado') {
                await connection.execute('UPDATE events SET status = :status WHERE id = :eventId',
                    { status, reason: rejectionReason, eventId });
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'puccampinas@gmail.com',
                        pass: 'puccamp',
                    },
                });
                await transporter.sendMail({
                    from: 'puccampinas@gmail.com',
                    to: email,
                    subject: 'Seu evento foi reprovado!',
                    text: `Seu evento foi reprovado pelo seguinte motivo: ${rejectionReason}`,
                });
                console.log(`Email enviado para ${email}`);
            }
            // Para o status "aceito"
            await connection.execute('UPDATE events SET status = :status WHERE id = :eventId', { status: 'aceito', eventId });
            return resp.status(200).send(`Evento com ID ${eventId} foi aprovado e está disponível para divulgação.`);
        } catch (error) {
            console.error('Erro ao avaliar o evento:', error);
            resp.status(500).send('Erro interno ao processar o pedido.');
        } finally {
            await connection.close();
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

    // Função para apostar em um evento
    export const betOnEvent: RequestHandler = async (req, resp) => {
        const connection = await getConnection();
        try {
            const Token = Number(req.get('Token'));
            const eventId = Number(req.get('eventId'));
            const amount = Number(req.get('amount'));
            const prediction = req.get('prediction') as 'Sim' | 'Não';

            // Verifica se o usuário existe
            const userResult = await connection.execute(`SELECT * FROM user WHERE Token = :Token`, { Token });
            const userRows = userResult as Array<{ balance: number }>;

            if (userRows.length === 0) {
                return resp.status(404).send("Usuário não encontrado.");
            }
            const user = userRows[0];
            const eventResult = await connection.execute(`SELECT * FROM events WHERE id = :eventId`, { eventId });
            const eventRows = eventResult as Array<{ status: string }>;

            if (eventRows.length === 0 || eventRows[0].status !== "aceito") {
                return resp.status(404).send("Evento não encontrado ou não disponível para apostas.");
            }
            // Verifica saldo do usuário
            if (user.balance < amount) { // Supondo que balance é a segunda coluna
                return resp.status(400).send("Saldo insuficiente! Por favor, faça um crédito na sua carteira.");
            }
            // Registrar aposta e deduzir saldo do usuário
            await connection.execute(`INSERT INTO bets (event_id, Token, amount, prediction) VALUES (:eventId, :Token, :amount, :prediction)`,
                { eventId, Token, amount, prediction });
            // Atualizar saldo do usuário
            await connection.execute(`UPDATE users SET balance = balance - :amount WHERE Token = :Token`, { amount, Token });
            await connection.commit();

            // Atualizar o saldo local
            user.balance -= amount;
            resp.status(200).send(`Aposta de R$${amount} realizada no evento "${eventId}". Saldo atual: R$${user.balance.toFixed(2)}`)
        } catch (err) {
            console.error(err);
            resp.status(500).send("Erro ao realizar a aposta.");
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
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
    }

}
