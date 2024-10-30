import { error } from "console";
import { Request, RequestHandler, Response } from "express";
import { RowDataPacket, FieldPacket, ResultSetHeader } from 'mysql2';

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

    // Gera uma string de 10 caracteres aleatórios
    function generateRandomString(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }

        return result;
    }

    // Função para salvar uma nova conta
    export async function saveNewAccount(newAccount: UserAccount): Promise<string | undefined> {
        const token = generateRandomString(32);
        return await new Promise((resolve, reject) => {
            if (newAccount) {
                const conn = connectDatabase();
                conn.query(
                    `INSERT INTO User(user_id, full_name, username, email, password_user, token, birth_date, type_user)
                    VALUES (DEFAULT, '${newAccount.full_name}','${newAccount.username}',
                    '${newAccount.email}', '${newAccount.password}', '${token}' ,'${newAccount.birth_date}', 'comum');`,
                    function (err: Error, data: RowDataPacket[], fields: FieldPacket, result: ResultSetHeader) {
                        if (!err) {
                            resolve(token);
                        }
                        else {
                            // res.status(500).send('Conta já existente ou com informações inadequadas');
                            resolve(err.name);
                        }
                    });
            }
        })
    }

    //funcao para verificar se é maior de idade
    function validAge(birthDate: string): boolean {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDifference = today.getMonth() - birth.getMonth();

        // Ajuste da idade se o mês e o dia de nascimento ainda não ocorreram este ano
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age >= 18;
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

        if (fullName && username && password && email && birthDate) {
            if (!validAge(birthDate)) {
                res.status(400).send("O usuário deve ser maior de idade.");
                return;
            }
        }

        if (fullName && username && password && email && birthDate) {
            const newAccount: UserAccount = {
                user_id: userId,
                full_name: fullName,
                username: username,
                password: password,
                email: email,
                birth_date: birthDate
            };

            const token = await saveNewAccount(newAccount);
            console.log(token);

            if (token !== "Error") {
                res.status(200).send(`Nova conta adicionada. Token: ` + token);
            }
            else {
                res.status(500).send("Conta já existente ou com informações inadequadas!");
            }
        }
        else {
            res.status(400).send("Parâmetros inválidos ou faltantes.");
        }
    };

    // Função para verificar se a conta existe e as informações estão corretas
    async function verifyAccount(email: string, password: string): Promise<string | number> {
        return await new Promise((resolve, reject) => {
            if (email && password) {
                const conn = connectDatabase();
                conn.query(
                    `SELECT * FROM User WHERE email = '${email}' AND password_user = '${password}'`,
                    function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
                        if (!err && data.length > 0) {
                            resolve(data[0].token);
                        } else {
                            resolve(data.length);
                        }
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
            }
            else {
                res.status(401).send("Email ou senha incorretos.");
            }
        }
        else {
            res.status(400).send("Parâmetros inválidos ou faltantes.");
        }
    };
}