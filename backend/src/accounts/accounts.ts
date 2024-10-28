import { Request, RequestHandler, Response } from "express";
import { RowDataPacket, FieldPacket } from 'mysql2';

export namespace AccountsHandler {

    // Função para estabelecer conexão com o MySQL
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

    export type UserAccount = {
        user_id: number;
        full_name: string;
        username: string;
        email: string;
        password: string;
        birth_date: string;
    };

    // Função para salvar uma nova conta
    export async function saveNewAccount(newAccount: UserAccount): Promise<number | undefined> {
        return await new Promise((resolve, reject) => {
            if (newAccount) {
                const conn = connectDatabase();
                conn.query(
                    `INSERT INTO User(user_id, full_name, username, email,password_user, birth_date)
                    VALUES (${newAccount.user_id}, '${newAccount.full_name}','${newAccount.username}',
                    '${newAccount.email}', '${newAccount.password}', '${newAccount.birth_date}');`,
                    function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
                        if (!err) {
                            resolve(newAccount.user_id);
                        }
                        reject(null);
                    });
            }
        })
    }

    // Função para tratar o cadastro
    export const signUp: RequestHandler = async (req: Request, res: Response) => {
        // Receber os parâmetros para criar a conta
        const userId = Number(req.get('userid'));
        const fullName = req.get('fullname');
        const username = req.get('username');
        const password = req.get('password');
        const email = req.get('email');
        const birthDate = req.get('birthdate');

        if (userId && fullName && username && password && email && birthDate) {
            const newAccount: UserAccount = {
                user_id: userId,
                full_name: fullName,
                username: username,
                password: password,
                email: email,
                birth_date: birthDate
            };
            const ID = await saveNewAccount(newAccount);

            if (ID) {
                res.status(200).send(`Nova conta adicionada.`);
            } else {
                res.status(500).send("Erro ao criar a conta. Tente novamente.");
            }
        } else {
            res.status(400).send("Parâmetros inválidos ou faltantes.");
        }
    };

    // Função para verificar se a conta existe e as informações estão corretas
    async function verifyAccount(email: string, password: string): Promise<string | null> {
        return await new Promise((resolve, reject) => {
            if (email && password) {
                const conn = connectDatabase();
                conn.query(
                    `SELECT * FROM User WHERE email = '${email}' AND password_user = '${password}'`,
                    function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
                        if (!err && data.length > 0) {
                            resolve(data[0].token);
                        }
                        reject(null);
                    });
            }
        })
    }

    // Função para tratar o login
    export const login: RequestHandler = async (req: Request, res: Response) => {
        const email = req.get('email');
        const password = req.get('password');

        if (email && password) {
            const token = await verifyAccount(email, password);
            if (token) {
                res.status(200).send("Login efetuado com sucesso. Seu token: " + token);
            } else {
                res.status(401).send("Email ou senha incorretos.");
            }
        } else {
            res.status(400).send("Parâmetros inválidos ou faltantes.");
        }
    };
}