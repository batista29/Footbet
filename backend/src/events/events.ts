import { Request, RequestHandler, Response } from "express";
import { RowDataPacket, FieldPacket } from 'mysql2';
import nodemailer from "nodemailer";
import oracledb from "oracledb";

// Namespace para agrupar todos os métodos e funções relacionados aos eventos
export namespace EventsHandler {

    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    // Função para conectar ao banco de dados
    function connectDatabase() {
        var mysql = require('mysql2/promise');
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

// Função para salvar um novo evento no banco de dados -
async function saveNewEvent(ev: Event): Promise <void> {
    let conn = await connectDatabase();
    conn.query(`INSERT INTO Evento (id_evento, id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email)
    VALUES (${ev.id}, ${ev.id_criador}, '${ev.title}', '${ev.description}', '${formatDateToMySQL(ev.eventDate)}', '${formatDateToMySQL(ev.betsStart)}', '${formatDateToMySQL(ev.betsEnd)}', ${ev.value}, '${ev.status}', '${ev.email}');`);
        
}

function formatDateToMySQL(date: Date): string {
    const isoString = date.toISOString(); // "2024-11-15T18:00:00.000Z"
    return isoString.slice(0, 19).replace('T', ' '); // "2024-11-15 18:00:00"
}


// Rota para adicionar um novo evento
export const addNewEventRoute: RequestHandler = async (req, res) => {
    try {
        const pId = req.query.id;
        const pid_criador = req.query.id_criador;
        const pTitle = req.query.title;
        const pDescription = req.query.description;
        const pEventDate = req.query.eventDate;
        const pBetsStart = req.query.betsStart;
        const pBetsEnd = req.query.betsEnd;
        const pValue = req.query.value;
        const pEmail = req.query.email;
        const pStatus = "analise"; // Status padrão

        if (!pTitle || !pDescription || !pEventDate) {
            return res.status(400).send('Dados inválidos.');
        }

        const newEvent: Event = {
            id: Number(pId),
            id_criador: Number(pid_criador),
            title: String(pTitle),
            description: String(pDescription),
            eventDate: new Date(pEventDate as string),
            betsStart: new Date(pBetsStart as string),
            betsEnd: new Date(pBetsEnd as string),
            value: Number(pValue),
            status: pStatus,
            email: String(pEmail),
        };

        await saveNewEvent(newEvent);
        res.status(200).send('Novo evento adicionado com sucesso.');
    } catch (error) {
        console.error('Erro ao adicionar evento:', error);
        res.status(500).send('Erro interno ao adicionar evento.');
    }
};

//Função para avaliar um novo evento
export const evaluateNewEvent: RequestHandler = async (req, res) => {
    const user_id = Number(req.get('user_id'));
    const id_evento = Number(req.get('id_evento'));
    const newStatus = req.get('status');
    const rejectionReason = String(req.get('rejectionReason'));
    
    // Log para depuração
    console.log({ user_id, id_evento, newStatus, rejectionReason });

    // Validação inicial dos dados
    if (!id_evento || !newStatus || (newStatus !== "aceito" && newStatus !== "rejeitado")) {
        return res.status(400).send('Dados inválidos.');
    }

    const validRejectionReasons = [
        'Texto confuso!',
        'Texto inapropriado',
        'Não respeita a política de privacidade ou os termos da plataforma!'
    ];

    // Validação do motivo de rejeição
    if (newStatus === 'rejeitado' && !validRejectionReasons.includes(rejectionReason)) {
        return res.status(400).send(`Motivo de reprovação inválido. Os motivos válidos são: 
            ${validRejectionReasons.join(', ')}.`);
    }

    const connection = await connectDatabase();
    try {
        const type_user = await searchTypeUser(user_id);
        
        if (type_user === 'moderador') {
            const [eventRows] = await connection.execute('SELECT id_criador FROM Evento WHERE id_evento = ?', [id_evento]);

            if (eventRows.length === 0) {
                return res.status(404).send('Evento não encontrado.');
            }

            const id_criador = eventRows[0].id_criador;
            const [emailRows] = await connection.execute('SELECT email FROM User WHERE user_id = ?', [id_criador]);

            if (emailRows.length === 0) {
                return res.status(404).send('E-mail do criador não encontrado.');
            }

            const email = emailRows[0].email;

            // Enviar email se o evento for rejeitado
            if (newStatus.toLowerCase() === 'rejeitado') {
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
                    text: `Seu evento foi reprovado pelo seguinte motivo: ${rejectionReason}`,
                });

                console.log(`Email enviado para ${email}`);
            }

            // Atualizar o status do evento
            await connection.execute('UPDATE Evento SET status = ? WHERE id_evento = ?', [newStatus, id_evento]);
            await connection.commit();
            res.status(200).send('Evento atualizado com sucesso.');
        } else {
            res.status(403).send('Acesso proibido!');
        }
    } catch (error) {
        console.error('Erro ao avaliar o evento:', error);
        res.status(500).send('Erro interno ao processar o pedido.');
    } finally {
        await connection.close();
    }
};

async function seeBalance(id_user: number): Promise<number> {
    return new Promise(async (resolve, reject) => {
        if (id_user) {
            const conn = await connectDatabase();
            conn.query(
                `SELECT SUM(value) AS saldo FROM Transacao WHERE user_id = ?`, 
                [id_user],
                function (err: Error, data: RowDataPacket[]) {
                    if (err || !data || data.length === 0) {
                        reject(err || new Error("Saldo não encontrado."));
                    } else {
                        resolve(data[0].saldo);
                    }
                }
            );
        } else {
            reject(new Error("ID do usuário inválido."));
        }
    });
}

export const withdrawFunds: RequestHandler = async (req, res) => {
    const connection = await connectDatabase();

    const id_wallet = Number(req.get('id_wallet'));
    const id_user = Number(req.get('id_user'));
    const value = Number(req.get('value'));
    const type = 'saque';

    try {
        const balance = await seeBalance(id_user);
        const connection = await connectDatabase();

        // Verificação de campos e saldo
        if (!id_wallet || !id_user || isNaN(value) || value <= 0 || balance < value) {
            return res.status(400).send('Dados inválidos ou saldo insuficiente.');
        }

        // Calcular a taxa de saque
        let feePercentage = 0;
        if (value <= 100) {
            feePercentage = 0.04;
        } else if (value <= 1000) {
            feePercentage = 0.03;
        } else if (value <= 5000) {
            feePercentage = 0.02;
        } else if (value <= 100000) {
            feePercentage = 0.01;
        }

        const fee = value * feePercentage;
        const netValue = value + fee;

        if (netValue > balance) {
            return res.status(400).send('Saldo insuficiente após a aplicação da taxa.');
        }

        // Inserir a transação na tabela Transacao
        await connection.execute(
            `INSERT INTO Transacao (id_wallet, user_id, value, type) VALUES (?, ?, -?, ?)`, 
            [id_wallet, id_user, value, type]
        );

        await connection.commit();
        res.status(200).send(`Saque de R$${value.toFixed(2)} realizado com sucesso! Taxa aplicada: R$${fee.toFixed(2)}. Saldo atual: R$${(balance - value).toFixed(2)}`);
    } catch (error) {
        console.error("Erro ao processar o saque:", error);
        res.status(500).send("Erro ao processar o saque.");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Erro ao fechar a conexão:", err);
            }
        }
    }
};

// Função para apostar em um evento
export const betOnEvent: RequestHandler = async (req, res) => {
    const connection = await connectDatabase();
    try {
        const email = req.get('email'); 
        const qtd_cotas = Number(req.get('qtd_cotas'));
        const id_evento = Number(req.get('id_evento'));
        const value = Number(req.get('value'));
        const aposta = req.get('aposta');

        // Verifica se o usuário existe pelo email
        const [userRows]: [RowDataPacket[], any] = await connection.execute(`SELECT * FROM User WHERE email = ?`, [email]);
        if (userRows.length === 0) {
            return res.status(404).send("Usuário não encontrado.");
        }

        const user = userRows[0];

        // Verifica se o evento existe e está aceito
        const [eventRows]: [RowDataPacket[], any] = await connection.execute(`SELECT * FROM Evento WHERE id_evento = ?`, [id_evento]);
        if (eventRows.length === 0 || eventRows[0].status !== "aceito") {
            return res.status(404).send("Evento não encontrado ou não disponível para apostas.");
        }

        // Verifica saldo do usuário usando a função seeBalance
        const currentBalance = await seeBalance(user.user_id);
        if (currentBalance < value) { 
            return res.status(400).send("Saldo insuficiente! Por favor, faça um crédito na sua carteira.");
        }

        // Registrar a aposta
        await connection.execute(
            `INSERT INTO Participa (id_participante, id_evento, qtd_cotas, total_apostado, aposta) VALUES (?, ?, ?, ?, ?)`,
            [user.user_id, id_evento, qtd_cotas, value, aposta]
        );

        await connection.commit();

        const newBalance = currentBalance - value; // Calcule o novo saldo
        res.status(200).send(`Aposta de R$${value.toFixed(2)} realizada no evento "${id_evento}". Saldo atual: R$${newBalance.toFixed(2)}`);
    } catch (err) {
        console.error("Erro ao realizar a aposta:", err);
        res.status(500).send("Erro ao realizar a aposta.");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Erro ao fechar a conexão:", err);
            }
        }
    }
};

// Função para obter o saldo do usuário
const getUserBalance = async (user_id: number, connection: any): Promise<number> => {
    const [balanceRows]: [RowDataPacket[], any] = await connection.execute(`SELECT SUM(value) AS saldo FROM Transacao WHERE user_id = ?`, [user_id]);
    return balanceRows.length > 0 ? balanceRows[0].saldo : 0;
};

// Função para excluir um evento (alterar status para 'deleted')
export async function deleteEvent(id: number): Promise<void> {
    const conn = await connectDatabase();
    await conn.query(
        `UPDATE Evento SET status = 'excluido' WHERE id_evento = ${id};`
    );
}
// identificar tipo de usuario
export async function searchTypeUser(id_user: number) : Promise<string >{
    const connection = await connectDatabase();
    try{
    const [rows] = await connection.query(
        `SELECT type_user FROM User WHERE user_id = ?`, [id_user]
    );

    // Verifica se há resultados
    if (rows.length > 0) {
        return rows[0].type_user; // Retorna o valor do campo type_user
    } else {
        return 'null'; // Retorna null se não houver resultados
    }
} catch (error) {
    console.error('Erro ao buscar tipo de usuário:', error);
    throw error; // Lança o erro para ser tratado na chamada
}
    
}
// Rota para excluir um evento
export const deleteEventRoute: RequestHandler = async (req, res) => {
    try {
        console.log('Parâmetros recebidos:', req.query);
        const pId = req.query.id;
        const pid_user = req.query.id_user;
        
        if (!pId) {
            res.status(400).send('ID inválido.');
            return;
        }
        let user_type = await searchTypeUser(Number(pid_user));
        if(user_type == 'moderador'){
        await deleteEvent(Number(pId));
        res.status(200).send('Evento excluído com sucesso.');
        }else{
            res.status(403).send("Acesso negado!");
        }
    }catch (error) {
        console.error('Erro ao excluir o evento:', error);
        res.status(500).send('Erro interno.');
    }
};

// Função para encontrar apostadores vencedores
export async function findBettors(id: number, betResult: string): Promise<any[]> {
    const conn = await connectDatabase();
    try {
        let query = '';
        if (betResult.toLowerCase() === 'Sim') {
            query = `SELECT id_participante FROM Participa WHERE id_evento = ? AND aposta = ?`;
            const result = await conn.query(query, [id, 's']);
            return result[0] || []; // Acesso à primeira linha do resultado
        } else if (betResult.toLowerCase() === 'Não') {
            query = `SELECT id_participante FROM Participa WHERE id_evento = ? AND aposta = ?`;
            const result = await conn.query(query, [id, 'n']);
            return result[0] || []; // Acesso à primeira linha do resultado
        } else {
            throw new Error('Resultado da aposta inválido.');
        }
    } catch (error) {
        console.error('Erro ao encontrar apostadores:', error);
        throw error; // Lança o erro para que possa ser tratado em outro lugar
    } finally {
        await conn.close();
    }
}


// Função para calcular o total apostado pelos vencedores
export async function sumOfIncomingsWinners(id: number, betResult: string): Promise<number> {
    const conn = await connectDatabase();
    try {
        const [rows] = await conn.query(
            `SELECT SUM(total_apostado) AS totalVencedores FROM Participa WHERE id_evento = ? AND aposta = ?;`,
            [id, betResult] // Uso de placeholders para segurança
        );

        // Retorna o totalVencedores ou 0 se não houver resultados
        return rows[0]?.totalVencedores ? Number(rows[0].totalVencedores) : 0;
    } catch (error) {
        console.error('Erro ao calcular total de vencedores:', error);
        throw error; // Lança o erro para tratamento em outro lugar
    } finally {
        await conn.end(); // Fecha a conexão
    }
}


// Função para calcular o total apostado no evento
export async function sumOfIncomings(id: number): Promise<number> {
    const conn = await connectDatabase();
    try {
        const [rows] = await conn.query(
            `SELECT SUM(total_apostado) AS totalGeral FROM Participa WHERE id_evento = ?;`,
            [id] // Uso de placeholders para segurança
        );

        // Retorna o totalGeral ou 0 se não houver resultados
        return rows[0]?.totalGeral?Number(rows[0].totalGeral) : 0;
    } catch (error) {
        console.error('Erro ao calcular total apostado:', error);
        throw error; // Lança o erro para tratamento em outro lugar
    } finally {
        await conn.end(); // Fecha a conexão
    }
}


// Função para encerrar um evento e distribuir prêmios
export async function finishEvent(id: number, betResult: string): Promise<void> {
    const connection = await connectDatabase();
    try {
        await connection.query(
            `UPDATE Evento SET status = 'encerrado' WHERE id_evento = ?;`,
            [id] // Uso de placeholders para evitar injeção SQL
        );

        const vencedores = await findBettors(id, betResult);
        const total_apostado = await sumOfIncomings(id);
        const total_vencedores = await sumOfIncomingsWinners(id, betResult);

        for (const vencedor of vencedores) {
            const idParticipante = vencedor.id_participante; // Acesse o ID do vencedor corretamente
            const [valorResult] = await connection.query(
                `SELECT total_apostado FROM Participa WHERE id_evento = ? AND id_participante = ?;`,
                [id, idParticipante] // Uso de placeholders
            );

            const valorApostado = Number(valorResult[0]?.total_apostado || 0); // Acessa o valor corretamente
            const prize = (valorApostado / total_vencedores) * total_apostado;

            const [id_wallet_result] = await connection.query(
                `SELECT id_wallet FROM Transacao WHERE user_id = ?;`,
                [idParticipante]
            );

            const id_wallet = id_wallet_result[0]?.id_wallet; // Acessa o ID da wallet corretamente
            await connection.query(
                `INSERT INTO Transacao (id_wallet, user_id, value, type) VALUES (?, ?, ?, ?);`,
                [id_wallet, idParticipante, prize, 'deposito'] // Uso de placeholders
            );
        }
    } catch (error) {
        console.error('Erro ao encerrar o evento:', error);
        throw error; // Lança o erro para tratamento em outro lugar
    } finally {
        await connection.close();
    }
}
// Rota para encerrar um evento
export const finishEventRoute: RequestHandler = async (req, res) => {
    try {
        const pId = req.query.id;
        const pId_user = req.query.id_user;
        const pBetResult = req.query.betResult;

        if (!pId || !pBetResult || !pId_user) {
            res.status(400).send('Dados inválidos.');
            return;
        }

        const user_type = await searchTypeUser(Number(pId_user));
        if (user_type === 'moderador') {
            await finishEvent(Number(pId), String(pBetResult));
            res.status(200).send('Evento encerrado com sucesso.');
        } else {
            res.status(403).send('Acesso Negado.');
        }
    } catch (error) {
        console.error('Erro na rota:', error);
        res.status(500).send('Erro ao encerrar o evento.');
    }
}

}