import { Request, RequestHandler, Response } from "express";
import mysql, { RowDataPacket } from "mysql2/promise"; 

export namespace AccountsHandler {

    // Função para estabelecer conexão com o MySQL
    async function getConnection() {
        return await mysql.createConnection({
            host: 'localhost',
            user: 'root',          
            password: '',          
            database: 'footbet'    
        });
    }

    export type UserAccount = {
        user_id: string;
        full_name: string;
        username: string;
        email: string;
        password: string;
        birth_date: Date;
    };

    // Função para salvar uma nova conta
    export async function saveNewAccount(newAccount: UserAccount): Promise<string | undefined> {
        try {
            const connection = await getConnection();
            const [result] = await connection.execute(
                `INSERT INTO Users (user_id, full_name, username, password, email, birth_date)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    newAccount.user_id,
                    newAccount.full_name,
                    newAccount.username,
                    newAccount.password,
                    newAccount.email,
                    newAccount.birth_date
                ]
            );
            await connection.end();

            const insertId = (result as any).insertId;
            return insertId ? String(insertId) : undefined;
        } catch (err) {
            console.error("Erro ao salvar a conta!", err);
            return undefined;
        }
    }

    // Função para verificar se a conta existe e as informações estão corretas
    async function verifyAccount(email: string, password: string): Promise<boolean> {
        try {
            const connection = await getConnection();
            const [rows] = await connection.execute<RowDataPacket[]>(
                `SELECT COUNT(*) AS count FROM Users WHERE email = ? AND password = ?`,
                [email, password]
            );
            await connection.end();

            const count = rows[0]?.count || 0;
            return count > 0;
        } catch (err) {
            console.error("Erro ao verificar conta!", err);
            return false;
        }
    }

    // Função para tratar o cadastro
    export const createAccountRoute: RequestHandler = async (req: Request, res: Response) => {
        // Receber os parâmetros para criar a conta
        const userId = req.get('userid');
        const fullName = req.get('fullname');
        const username = req.get('username');
        const password = req.get('password');
        const email = req.get('email');
        const birthDate = req.get('birth date');

        if (userId && fullName && username && password && email && birthDate) {
            const newAccount: UserAccount = {
                user_id: userId,
                full_name: fullName,
                username: username,
                password: password,
                email: email,
                birth_date: new Date(birthDate)
            };
            const ID = await saveNewAccount(newAccount);

            if (ID) {
                res.status(200).send(`Nova conta adicionada. Código: ${ID}`);
            } else {
                res.status(500).send("Erro ao criar a conta. Tente novamente.");
            }
        } else {
            res.status(400).send("Parâmetros inválidos ou faltantes.");
        }
    };

    // Função para tratar o login
    export const login: RequestHandler = async (req: Request, res: Response) => {
        const email = req.get('email');
        const password = req.get('password');

        if (email && password) {
            const isValid = await verifyAccount(email, password);
            if (isValid) {
                res.status(200).send("Login efetuado com sucesso.");
            } else {
                res.status(401).send("Email ou senha incorretos.");
            }
        } else {
            res.status(400).send("Parâmetros inválidos ou faltantes.");
        }
    };
}