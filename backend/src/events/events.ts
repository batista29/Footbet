import { Request, RequestHandler, Response } from "express";
import { RowDataPacket, FieldPacket } from 'mysql2';
import nodemailer from "nodemailer";
import oracledb from "oracledb";

// Namespace para agrupar todos os métodos e funções relacionados aos eventos
export namespace EventsHandler {

    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    // Função para conectar ao banco de dados
    function connectDatabase() {
        var mysql = require('mysql2');
        const conn = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'footbet'
        });

        return conn;
    }
    // Tipo Evento
    type Event = {
        id: number;
        id_criador: number;
        title: string;
        description: string;
        eventDate: Date;
        betsStart: Date;
        betsEnd: Date;
        value: number;
        status: string;
        email: string;
    };

    // Função para salvar um novo evento no banco de dados
    async function saveNewEvent(ev: Event): Promise<void> {
        const connection = await connectDatabase();
        await connection.execute(
            `INSERT INTO Evento (id_evento, id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email)
             VALUES (:id, :id_criador, :title, :description, :eventDate, :betsStart, :betsEnd, :value, :status, :email)`,
            {
                id: ev.id,
                id_criador: ev.id_criador,
                title: ev.title,
                description: ev.description,
                eventDate: ev.eventDate,
                betsStart: ev.betsStart,
                betsEnd: ev.betsEnd,
                value: ev.value,
                status: ev.status,
                email: ev.email,
            },
            { autoCommit: true }
        );
    }

    // Rota para adicionar um novo evento
    export const addNewEventRoute: RequestHandler = async (req, res) => {
        try {
            const pId = req.get('id');
            const pid_criador = req.get('id_criador')
            const pTitle = req.get('title');
            const pDescription = req.get('description');
            const pEventDate: any = req.get('eventDate');
            const pBetsStart: any = req.get('betsStart');
            const pBetsEnd: any = req.get('betsEnd');
            const pValue = req.get('value');
            const pStatus = "analise";
            const pemail = req.get('email');

            if (pTitle && pDescription && pEventDate) {
                const newEvent: Event = {
                    id: Number(pId),
                    id_criador: Number(pid_criador),
                    title: pTitle,
                    description: pDescription,
                    eventDate: new Date(pEventDate),
                    betsStart: new Date(pBetsStart),
                    betsEnd: new Date(pBetsEnd),
                    value: Number(pValue),
                    status: pStatus,
                    email: pemail as string,
                };
                await saveNewEvent(newEvent);
                res.status(200).send('Novo evento adicionado com sucesso.');
            } else {
                res.status(400).send('Dados inválidos.');
            }
        } catch (error) {
            console.error('Erro ao adicionar evento:', error);
            res.status(500).send('Erro interno.');
        }
    };

    //Função para avaliar um novo evento
    export const evaluateNewEvent: RequestHandler = async (req, res) => {
        const id_evento = req.get('id_evento');
        const status = req.get('status');
        const rejectionReason = req.get('rejectioReason');

        if (!id_evento || !status || (status !== "aceito" && status !== "rejeitado")) {
            return res.status(400).send('Dados inválidos.');
        }
        const connection = await connectDatabase();
        try {
            const eventResult = await connection.execute('SELECT id_criador FROM Evento WHERE id_evento = :id_evento', { id_evento });
            const eventRows = eventResult.rows as Array<{ ID_CRIADOR: string }>;

            if (eventRows.length === 0) {
                return res.status(404).send('Evento não encontrado.');
            }
            const id_criador = eventRows[0].ID_CRIADOR;
            const emailResult = await connection.execute('SELECT email FROM User WHERE token = :id_criador', { id_criador });
            const emailRows = emailResult.rows as Array<{ EMAIL: string }>;

            if (emailRows.length === 0) {
                return res.status(404).send('E-mail do criador não encontrado.');
            }
            const email = emailRows[0].EMAIL;

            if (status === 'rejeitado') {
                await connection.execute('UPDATE Evento SET status = :status WHERE id_evento = :id_evento',
                    { status, reason: rejectionReason, id_evento });
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'testepuccamp@gmail.com',
                        pass: 'ugjaxfamlczvwuae',
                    },
                });
                await transporter.sendMail({
                    from: 'testepuccamp@gmail.com',
                    to: email,
                    subject: 'Seu evento foi reprovado!',
                    text: Seu evento foi reprovado pelo seguinte motivo: ${ rejectionReason },
                });
            console.log(Email enviado para ${ email });
        }
            // Para o status "aceito"
            await connection.execute('UPDATE Evento SET status = :status WHERE id_evento = :id_evento', { status: 'aceito', id_evento });
        return res.status(200).send(Evento com ID ${ id_evento } foi aprovado e está disponível para divulgação.);
    } catch (error) {
        console.error('Erro ao avaliar o evento:', error);
        res.status(500).send('Erro interno ao processar o pedido.');
    } finally {
        await connection.close();
    }
};

// Função para excluir um evento (alterar status para 'deleted')
export async function deleteEvent(id: number): Promise<void> {
    const connection = await connectDatabase();
    await connection.execute(
        UPDATE Evento SET status = 'deleted' WHERE id = : id,
        { id },
        { autoCommit: true }
    );
}

// Rota para excluir um evento
export const deleteEventRoute: RequestHandler = async (req, res) => {
    try {
        const pId = req.get('id');
        if (!pId) {
            res.status(400).send('ID inválido.');
            return;
        }
        await deleteEvent(Number(pId));
        res.status(200).send('Evento excluído com sucesso.');
    } catch (error) {
        console.error('Erro ao excluir o evento:', error);
        res.status(500).send('Erro interno.');
    }
};

async function seeBalance(id_user: number) {
    return await new Promise((resolve, reject) => {
        if (id_user) {
            let conn = connectDatabase();
            conn.query(SELECT SUM(value) as 'saldo' FROM Transacao WHERE user_id = ${ id_user };,
            function (err: Error, data: RowDataPacket[]) {
                if (!err || data && data.length > 0) {
                    resolve(data[0].saldo);
                }
                reject(null);
            });
}
        })
    }

export const withdrawFunds: RequestHandler = async (req, res) => {
    const id_wallet = Number(req.get('id_wallet'));
    const id_user = Number(req.get('id_user'));
    let value = Number(req.get('value'));
    const type = 'saque';
    const balance = Number(await seeBalance(id_user));
    const connection = await connectDatabase();

    //verificando se nao vem campo vazio
    if (id_wallet && id_user && value && type && balance >= value && Math.sign(value) !== -1) {
        let conn = connectDatabase();
        conn.query(INSERT INTO Transacao(id_wallet, user_id, value, type) VALUES(${ id_wallet }, ${ id_user }, -${ value }, '${type}');, function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
            if (!err) {
                res.statusCode = 200;
                //retornando 1, que é a quantidade de campos alterados, se nao retornar 1 é porque deu erro
                res.send(fields);
            } else {
                //erro caso nao envie a informações corretas para o banco
                res.statusCode = 400;
                res.send("Error")
            }
        });
        // Calcular a taxa de saque com base no valor
        let feePercentage;
        try {
            if (value <= 100) {
                feePercentage = 0.04;
            } else if (value <= 1000) {
                feePercentage = 0.03;
            } else if (value <= 5000) {
                feePercentage = 0.02;
            } else if (value <= 100000) {
                feePercentage = 0.01;
            } else {
                feePercentage = 0;
            }

            const fee = value * feePercentage;
            const netvalue = value + fee;

            if (netvalue > balance) {
                res.status(400).send('Saldo insuficiente após a aplicação da taxa.');
                return;
            }
            // Atualizar o saldo da carteira após o saque
            const newBalance = balance - netvalue;
            await connection.execute('UPDATE Transacao SET BALANCE = :newBalance WHERE id_wallet = :id_wallet', { newBalance, id_wallet });

            // Inserir a transação na tabela Transacao
            await connection.execute(
                INSERT INTO Transacao(id_wallet, value, type, date_transation) VALUES(: id_wallet, : value, : type, SYSDATE), { id_wallet, value, type: 'saque' }
            );
            await connection.commit();
            res.status(200).send(Saque de R$${ value.toFixed(2) } realizado com sucesso! Taxa aplicada: R$${ fee.toFixed(2) }". Saldo atual: R$${id_user.balance.toFixed(2)})
        } catch (error) {
            console.error("Erro durante o saque:", error);
            res.status(500).send("Erro ao processar o saque.");
        } finally {
            await connection.close();
        }
    }
};

// Função para apostar em um evento
export const betOnEvent: RequestHandler = async (req, res) => {
    const connection = await connectDatabase();
    try {
        const id_criador = Number(req.get('id_criador'));
        const id_evento = Number(req.get('id_evento'));
        let value = Number(req.get('value'));
        const prediction = req.get('prediction') as 'Sim' | 'Não';

        // Verifica se o usuário existe
        const userResult = await connection.execute(SELECT * FROM User WHERE id_criador = : id_criador, { id_criador });
        const userRows = userResult as Array<{ balance: number }>;

        if (userRows.length === 0) {
            return res.status(404).send("Usuário não encontrado.");
        }
        const user = userRows[0];
        const eventResult = await connection.execute(SELECT * FROM Evento WHERE id = : id_evento, { id_evento });
        const eventRows = eventResult as Array<{ status: string }>;

        if (eventRows.length === 0 || eventRows[0].status !== "aceito") {
            return res.status(404).send("Evento não encontrado ou não disponível para apostas.");
        }
        // Verifica saldo do usuário
        if (user.balance < value) {
            return res.status(400).send("Saldo insuficiente! Por favor, faça um crédito na sua carteira.");
        }
        // Registrar aposta e deduzir saldo do usuário
        await connection.execute(INSERT INTO Transacao(event_id, id_criador, value, prediction) VALUES(: id_evento, : id_criador, : value, : prediction),
            { id_evento, id_criador, value, prediction });
        // Atualizar saldo do usuário
        await connection.execute(UPDATE Transacao SET balance = balance - : value WHERE token = : token, { value, id_criador });
        res.status(200).send(Aposta de R$${ value } realizada no evento "${id_evento}".Saldo atual: R$${ user.balance.toFixed(2) })
        await connection.commit();
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao realizar a aposta.");
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
    const connection = await connectDatabase();
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
    const connection = await connectDatabase();
    const result = await connection.execute(
        SELECT sum(total_apostado) FROM Participa WHERE id_evento = : id AND aposta = : betResult,
        { id, betResult },
        { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );
    await connection.close();
    return Number(result.rows);
}

// Função para calcular o total apostado no evento
export async function sumOfIncomings(id: number): Promise<number> {
    const connection = await connectDatabase();
    const result = await connection.execute(
        SELECT sum(total_apostado) FROM Participa WHERE id_evento = : id,
        { id },
        { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );
    await connection.close();
    return Number(result.rows);
}

// Função para encerrar um evento e distribuir prêmios
export async function finishEvent(id: number, betResult: string): Promise<void> {
    const connection = await connectDatabase();
    try {
        await connection.execute(
            UPDATE Evento SET status = 'finished' WHERE id = : id,
            { id },
            { autoCommit: true }
        );

        const vencedores = await findBettors(id, betResult);
        const total_apostado = await sumOfIncomings(id);
        const total_vencedores = await sumOfIncomingsWinners(id, betResult);

        for (const vencedor of vencedores) {
            const idParticipante = vencedor[0];
            const valorResult = await connection.execute(
                SELECT total_apostado FROM Participa WHERE id_evento = : id_evento AND id_participante = : id_participante,
                { id_evento: id, id_participante: idParticipante },
                { outFormat: oracledb.OUT_FORMAT_ARRAY }
            );
            const valorApostado = Number(valorResult);
            const prize = (valorApostado / total_vencedores) * total_apostado;

            await connection.execute(
                UPDATE Transacao SET value = value + : prize WHERE id_user = : id,
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
export const finishEventRoute: RequestHandler = async (req, res) => {
    try {
        const pId = req.get('id');
        const pBetResult = req.get('betResult');

        if (!pId || !pBetResult) {
            res.status(400).send('Dados inválidos.');
            return;
        }

        await finishEvent(Number(pId), pBetResult);
        res.status(200).send('Evento encerrado com sucesso.');
    } catch (error) {
        console.error('Erro na rota:', error);
        res.status(500).send('Erro ao encerrar o evento.');
    }
}

}