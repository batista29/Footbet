import { Request, RequestHandler, Response } from "express";
import { RowDataPacket, FieldPacket } from 'mysql2';
import nodemailer from "nodemailer";
import oracledb from "oracledb";

// Namespace para agrupar todos os métodos e funções relacionados aos eventos
export namespace EventsHandler {

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
        id_criador: number;
        title: string;
        description: string;
        eventDate: Date;
        betsStart: Date;
        betsEnd: Date;
        value: number;
        status: string;
        email: string;
        categoria: string;
    };

    // Função para obter o saldo do usuário
    const seeBalance = async (user_id: number): Promise<number> => {
        const connection = await connectDatabase();
        const [balanceRows]: [RowDataPacket[], any] = await connection.execute(`SELECT SUM(value) AS saldo FROM Transacao WHERE user_id = ?`, [user_id]);
        console.log(balanceRows)
        return balanceRows.length > 0 ? balanceRows[0].saldo : 0;
    };

    // Função para salvar um novo evento no banco de dados -
    async function saveNewEvent(ev: Event): Promise<void> {
        let conn = await connectDatabase();
        conn.query(`INSERT INTO Evento (id_evento, id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email, categoria)
    VALUES (default, ${ev.id_criador}, '${ev.title}', '${ev.description}', '${formatDateToMySQL(ev.eventDate)}', '${formatDateToMySQL(ev.betsStart)}', '${formatDateToMySQL(ev.betsEnd)}', ${ev.value}, '${ev.status}', '${ev.email}', '${ev.categoria}');`);

    }

    function formatDateToMySQL(date: Date): string {
        const isoString = date.toISOString(); // "2024-11-15T18:00:00.000Z"
        return isoString.slice(0, 19).replace('T', ' '); // "2024-11-15 18:00:00"
    }


    // Rota para adicionar um novo evento
    export const addNewEventRoute: RequestHandler = async (req, res) => {
        try {
            const pid_criador = req.get('id_criador');
            const pTitle = req.get('title');
            const pDescription = req.get('description');
            const pEventDate = req.get('eventDate');
            const pBetsStart = req.get('betsStart');
            const pBetsEnd = req.get('betsEnd');
            const pValue = req.get('value');
            const pEmail = req.get('email');
            const pStatus = "analise"; // Status padrão
            const pCategoria = req.get('categoria');

            console.log(pid_criador, pTitle, pDescription, pEventDate, pBetsStart, pBetsEnd, pValue, pEmail, pStatus, pCategoria);

            if (!pTitle || !pDescription || !pEventDate) {
                return res.status(400).send('Dados inválidos.');
            }

            const newEvent: Event = {
                id_criador: Number(pid_criador),
                title: String(pTitle),
                description: String(pDescription),
                eventDate: new Date(pEventDate as string),
                betsStart: new Date(pBetsStart as string),
                betsEnd: new Date(pBetsEnd as string),
                value: Number(pValue),
                status: pStatus,
                email: String(pEmail),
                categoria: String(pCategoria)
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
        if (!id_evento || !newStatus) {
            return res.status(400).json({ messsage: 'Dados inválidos.' });
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
                    return res.status(404).json({ message: 'Evento não encontrado.' });
                }

                const id_criador = eventRows[0].id_criador;
                const [emailRows] = await connection.execute('SELECT email FROM User WHERE user_id = ?', [id_criador]);

                if (emailRows.length === 0) {
                    return res.status(404).json({ message: 'E-mail do criador não encontrado.' });
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
                res.status(200).send({ message: 'Evento atualizado com sucesso.' });
            } else {
                res.status(403).json({ message: 'Acesso proibido!' });
            }
        } catch (error) {
            console.error('Erro ao avaliar o evento:', error);
            res.status(500).json({ message: 'Erro interno ao processar o pedido.', error });
        } finally {
            await connection.close();
        }
    };

    // Função para apostar em um evento
    export const betOnEvent: RequestHandler = async (req, res) => {
        const email = req.get('email');
        const id_evento = Number(req.get('id_evento'));
        const qtd_cotas = Number(req.get('qtd_cotas'));
        const valor_cota = Number(req.get('valor_cota'));
        const aposta = req.get('aposta');
        console.log(email, id_evento, qtd_cotas, valor_cota, aposta)
        // Verificar se algum dos parâmetros é undefined
        if (!email || !id_evento || !qtd_cotas || !valor_cota || !aposta) {
            console.log("Erro: Dados inválidos. Parâmetros obrigatórios não fornecidos.");
            return res.status(400).send("Erro: Todos os parâmetros são obrigatórios.");
        }
        const connection = await connectDatabase();
        try {
            const value = valor_cota * qtd_cotas;

            // Verifica se o usuário existe pelo email
            const [userRows]: [RowDataPacket[], any] = await connection.execute(`SELECT * FROM User WHERE email = ?`, [email]);
            // console.log("Resultados da busca de usuário:", userRows);

            if (userRows.length === 0) {
                console.log("Usuário não encontrado.");
                return res.status(404).send("Usuário não encontrado.");
            }
            console.log(qtd_cotas);

            const user = userRows[0];
            console.log("Usuário encontrado:", user.user_id);

            // Verifica se o evento existe e está aceito
            const [eventRows]: [RowDataPacket[], any] = await connection.execute(`SELECT * FROM Evento WHERE id_evento = ?`, [id_evento]);
            console.log("Resultados da busca de evento:", eventRows);

            // função esta parando aqui

            if (eventRows.length === 0 || eventRows[0].status !== "ativo") {
                console.log("Evento não encontrado ou não disponível para apostas.");
                return res.status(404).send("Evento não encontrado ou não disponível para apostas.");
            }

            // Verifica saldo do usuário usando a função seeBalance
            const balance = await seeBalance(user.user_id);

            if (balance < value) {
                console.log("Saldo insuficiente! Saldo disponível:", balance, "Valor da aposta:", value);
                return res.status(400).json("Saldo insuficiente! Por favor, faça um crédito na sua carteira.");
            } else {
                // Registrar a aposta
                await connection.execute(
                    `INSERT INTO Participa (id_participante, id_evento, qtd_cotas, total_apostado, aposta) VALUES (?, ?, ?, ?, ?)`,
                    [user.user_id, id_evento, qtd_cotas, value, aposta]
                );

                await connection.execute(
                    `INSERT INTO Transacao (id_wallet,user_id,value,type) VALUES(?, ?, ?, ?)`,
                    [user.user_id, user.user_id, -value, 'saque']
                );

                await connection.commit();

                res.status(200).send("Aposta realizada com sucesso");
            }
        } catch (err) {
            console.error("Erro ao realizar a aposta:", err);
            res.status(500).send("Erro ao realizar a aposta.");
        }
    };

    // Função para excluir um evento (alterar status para 'deleted')
    export async function deleteEvent(id: number): Promise<void> {
        const conn = await connectDatabase();
        await conn.query(
            `UPDATE Evento SET status = 'excluido' WHERE id_evento = ${id};`
        );
    }
    // identificar tipo de usuario
    export async function searchTypeUser(id_user: number): Promise<string> {
        const connection = await connectDatabase();
        try {
            const [rows] = await connection.query(
                `SELECT type_user FROM User WHERE user_id = ?`, [id_user]
            );

            // Verifica se há resultados
            if (rows.length > 0) {
                return rows[0].type_user;
            } else {
                return 'null';
            }
        } catch (error) {
            console.error('Erro ao buscar tipo de usuário:', error);
            throw error;
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
            if (user_type == 'moderador') {
                await deleteEvent(Number(pId));
                res.status(200).send('Evento excluído com sucesso.');
            } else {
                res.status(403).send("Acesso negado!");
            }
        } catch (error) {
            console.error('Erro ao excluir o evento:', error);
            res.status(500).send('Erro interno.');
        }
    };

    // Função para encontrar apostadores vencedores
    export async function findBettors(id: number, betResult: string): Promise<any[]> {
        const conn = await connectDatabase();
        try {
            let query = '';
            if (betResult.toLowerCase() === 'sim') {
                query = `SELECT id_participante FROM Participa WHERE id_evento = ? AND aposta = ?`;
                const result = await conn.query(query, [id, 's']);
                return result[0] || [];
            } else if (betResult.toLowerCase() === 'nao') {
                query = `SELECT id_participante FROM Participa WHERE id_evento = ? AND aposta = ?`;
                const result = await conn.query(query, [id, 'n']);
                return result[0] || [];
            } else {
                throw new Error('Resultado da aposta inválido.');
            }
        } catch (error) {
            console.error('Erro ao encontrar apostadores:', error);
            throw error;
        } finally {
            await conn.close();
        }
    }


    // Função para calcular o total apostado pelos vencedores
    export async function sumOfIncomingsWinners(id: number, betResult: string): Promise<number> {
        const conn = await connectDatabase();
        try {
            let query;
            if (betResult.toLowerCase() == 'sim') {
                query = `SELECT SUM(total_apostado) AS totalVencedores FROM Participa WHERE id_evento = ? AND aposta = 's';`;
            } else if (betResult.toLowerCase() == 'nao') {
                query = `SELECT SUM(total_apostado) AS totalVencedores FROM Participa WHERE id_evento = ? AND aposta = 'n';`;
            }
            const [rows] = await conn.query(query,
                [id]
            );
            // Retorna o totalVencedores ou 0 se não houver resultados
            return rows[0]?.totalVencedores ? Number(rows[0].totalVencedores) : 0;
        } catch (error) {
            console.error('Erro ao calcular total de vencedores:', error);
            throw error;
        } finally {
            await conn.end();
        }
    }


    // Função para calcular o total apostado pelos vencedores
    export async function sumOfIncomingsLosers(id: number, betResult: string): Promise<number> {
        const conn = await connectDatabase();
        try {
            let query;
            if (betResult.toLowerCase() == 'sim') {
                query = `SELECT SUM(total_apostado) AS totalPerdedores FROM Participa WHERE id_evento = ? AND aposta = 'n';`;
            } else if (betResult.toLowerCase() == 'nao') {
                query = `SELECT SUM(total_apostado) AS totalPerdedores FROM Participa WHERE id_evento = ? AND aposta = 's';`;
            }
            const [rows] = await conn.query(query,
                [id]
            );
            // Retorna o totalVencedores ou 0 se não houver resultados
            return rows[0]?.totalPerdedores ? Number(rows[0].totalPerdedores) : 0;
        } catch (error) {
            console.error('Erro ao calcular total de vencedores:', error);
            throw error;
        } finally {
            await conn.end();
        }
    }


    // Função para encerrar um evento e distribuir prêmios
    export async function finishEvent(id: number, betResult: string): Promise<void> {
        const connection = await connectDatabase();
        try {

            const vencedores = await findBettors(id, betResult);
            const total_perdedores = await sumOfIncomingsLosers(id, betResult);
            console.log("total_perdedores ", total_perdedores);
            const total_vencedores = await sumOfIncomingsWinners(id, betResult);

            for (const vencedor of vencedores) {
                const idParticipante = vencedor.id_participante;
                const [valorResult] = await connection.query(
                    `SELECT total_apostado FROM Participa WHERE id_evento = ? AND id_participante = ?;`,
                    [id, idParticipante]
                );

                const valorApostado = Number(valorResult[0]?.total_apostado || 0);
                var prize: number = ((valorApostado / total_vencedores) * total_perdedores) + valorApostado;

                console.log("Valor que devia voltar: ", prize)
                await connection.query(
                    `INSERT INTO Transacao (id_wallet, user_id, value, type) VALUES (?, ?, ?, ?);`,
                    [idParticipante, idParticipante, prize.toFixed(2), 'deposito']
                );
            }
        } catch (error) {
            console.error('Erro ao encerrar o evento:', error);
            throw error; // Lança o erro para tratamento em outro lugar
        } finally {
            await connection.query(
                `UPDATE Evento SET status = 'encerrado' WHERE id_evento = ?;`,
                [id]
            );
            await connection.close();
        }
    }
    // Rota para encerrar um evento
    export const finishEventRoute: RequestHandler = async (req, res) => {
        const connection = await connectDatabase();
        try {
            const pId = Number(req.get('id_evento'));
            const pId_user = Number(req.get('id_user'));
            const pBetResult = req.get('betResult');
            console.log(pId, pBetResult, pId_user);

            if (!pId || !pBetResult || !pId_user) {
                res.status(400).json({ message: 'Dados inválidos.' });
                return;
            }

            const user_type = await searchTypeUser(Number(pId_user));
            if (user_type === 'moderador') {
                // verificar se o evento ja não foi encerrado
                const [rows] = await connection.query(
                    `SELECT status FROM Evento WHERE id_evento = ?;`,
                    [pId]
                );
                if (rows.length > 0 && rows[0].status === 'encerrado') {
                    res.status(403).json({ message: "Este evento já foi finalizado!" });
                } else {
                    await finishEvent(Number(pId), String(pBetResult));
                    res.status(200).json({ message: 'Evento encerrado com sucesso.' });
                }
            } else {
                res.status(403).json({ message: 'Acesso Negado.' });
            }


        } catch (error) {
            console.error('Erro na rota:', error);
            res.status(500).json({ message: 'Erro ao encerrar o evento.' });
        }
    }
    export const getEvents: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const filter = req.get('filter')?.toLocaleLowerCase();

        const connection = await connectDatabase();
        let results;

        try {
            if (filter === 'pendente') {
                results = await connection.execute(
                    "SELECT * FROM Evento WHERE status = 'pendente'"
                );
            } else if (filter === 'futuros') {
                results = await connection.execute(
                    "SELECT * FROM Evento WHERE dataEvento > CURDATE()"
                );
            } else if (filter === 'passado') {
                results = await connection.execute(
                    "SELECT * FROM Evento WHERE dataEvento < CURDATE()"
                );
            } else {
                results = await connection.execute(`SELECT * FROM Evento where status = ${filter}`);
            }

            // Adiciona o log para verificar o conteúdo de results.rows
            if (results[0] && results[0].length > 0) {
                console.log("Eventos encontrados:", results[0]);
                res.status(200).json(results[0]);
            } else {
                console.log("Nenhum evento encontrado para o filtro aplicado.");
                res.status(404).send('Nenhum evento encontrado.');
            }
        } catch (error) {
            console.error("Erro ao buscar eventos:", error);
            res.status(500).send("Erro ao buscar eventos.");
        } finally {
            await connection.close();
        }
    };

    export const searchEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const keyword = req.get('keyword');

        if (!keyword) {
            res.status(400).send('A palavra-chave é obrigatória.');
            return;
        }

        let connection;

        try {
            connection = await connectDatabase();
            const results = await connection.execute(
                `SELECT * FROM Evento WHERE titulo LIKE '%${keyword}%' OR descricao LIKE '%${keyword}%' OR categoria LIKE '%${keyword}%' AND status = 'ativo'`,
                // Coloca os '%' no valor do parâmetro
            );

            if (results && results[0].length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).send('Nenhum evento encontrado com essa palavra-chave.');
            }
        } catch (error) {
            res.status(500).send('Erro ao buscar eventos.');
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Erro ao fechar a conexão:', closeError);
                }
            }
        }
    };

    //Mostrar eventos mais apostados
    export const topEvents: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        let connection;

        try {
            connection = await connectDatabase();
            const results = await connection.execute(
                `SELECT * FROM mais_apostados LIMIT 10;`,
                // Coloca os '%' no valor do parâmetro
            );

            if (results && results[0].length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404);
            }
        } catch (error) {
            res.status(500).send('Erro ao buscar eventos.');
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Erro ao fechar a conexão:', closeError);
                }
            }
        }
    };

    //Eventos por categoria
    export const category: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const categoria = req.get('categoria');
        console.log(categoria);
        let connection;

        try {
            connection = await connectDatabase();
            const results = await connection.execute(
                `SELECT * FROM evento WHERE categoria = '${categoria}' and status = 'ativo';`,
            );

            if (results && results[0].length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404);
            }
        } catch (error) {
            res.status(500).send('Erro ao buscar eventos.');
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Erro ao fechar a conexão:', closeError);
                }
            }
        }
    };

    // Ester
    export async function getbets(req: Request, res: Response) {
        const id_user = Number(req.get('id_user'));
        console.log("Id para ver Apostas:", id_user);

        if (!id_user) {
            return res.status(400).json({ message: "ID do usuário não fornecido." });
        }

        try {
            const conn = await connectDatabase();

            // Usando 'execute' ou 'query' com 'await'
            const [rows] = await conn.execute(
                `SELECT e.titulo, p.qtd_cotas, p.total_apostado 
                 FROM Evento as e
                 JOIN Participa as p ON e.id_evento = p.id_evento 
                 WHERE p.id_participante = ?`,
                [id_user]
            );

            if (rows.length > 0) {
                console.log("Encontrou");
                res.status(200).json(rows); // Retorna os dados encontrados
                console.log("Dados encontrados: ", rows);
            } else {
                res.status(404).json({ message: "Nenhuma aposta encontrada." });
            }

        } catch (error) {
            console.error("Erro na conexão ou consulta ao banco:", error);
            return res.status(500).json({ message: "Erro ao acessar o banco de dados." });
        }
    }

    export async function getAllEvents(req: Request, res: Response) {
        let conn;
        try {
            conn = await connectDatabase(); // Conectando ao banco
            // Usando await para consultar com promessas
            const [rows] = await conn.execute(
                `SELECT id_evento, id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, status, email FROM Evento where status = 'ativo'`
            );

            if (rows.length > 0) {
                return res.status(200).json(rows);
            } else {
                return res.status(404).json({ message: "Nenhum evento encontrado." });
            }
        } catch (error) {
            console.error("Erro na conexão ou consulta ao banco:", error);
            return res.status(500).json({ message: "Erro ao acessar o banco de dados." });
        } finally {
            if (conn) {
                conn.end();
            }
        }
    }
    export async function getAllEventsAdmin(req: Request, res: Response) {
        let conn;
        try {
            conn = await connectDatabase(); // Conectando ao banco
            // Usando await para consultar com promessas
            const [rows] = await conn.execute(
                `SELECT id_evento, id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, status, email FROM Evento`
            );

            if (rows.length > 0) {
                return res.status(200).json(rows);
            } else {
                return res.status(404).json({ message: "Nenhum evento encontrado." });
            }
        } catch (error) {
            console.error("Erro na conexão ou consulta ao banco:", error);
            return res.status(500).json({ message: "Erro ao acessar o banco de dados." });
        } finally {
            if (conn) {
                conn.end();
            }
        }
    }
    export async function getEventbyID(req: Request, res: Response) {
        let conn;
        const id_evento = Number(req.get('id_evento'));
        console.log("Id do evento para Apostas:", id_evento);
        try {
            conn = await connectDatabase(); // Conectando ao banco
            // Usando await para consultar com promessas
            const [rows] = await conn.execute(
                `SELECT id_evento, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota FROM Evento where id_evento = ${id_evento}`
            );

            if (rows.length > 0) {
                return res.status(200).json(rows);
            } else {
                return res.status(404).json({ message: "Nenhum evento encontrado." });
            }
        } catch (error) {
            console.error("Erro na conexão ou consulta ao banco:", error);
            return res.status(500).json({ message: "Erro ao acessar o banco de dados." });
        } finally {
            if (conn) {
                conn.end();
            }
        }
    }

}