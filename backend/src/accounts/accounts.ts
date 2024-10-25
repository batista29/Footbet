import { Request, RequestHandler, Response } from "express";
import oracledb from "oracledb";

export namespace AccountsHandler {

    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    // Função para estabelecer conexão com o OracleDB
    async function getConnection() {
        const connection = await oracledb.getConnection({
            user: "hr",
            password: "mypw",
            connectString: "localhost/FREEPDB1"
        });
    }

    export type UserAccount = {
        user_id: string;
        full_name: string;
        username: string;
        email: string;
        password: string;
        token: string;
        birth_date: Date;
    };

    // Função para salvar uma nova conta
    export async function saveNewAccount(newAccount: UserAccount): Promise<string | undefined> {
        try {
            const connection = await getConnection();
            const result = await connection.execute(
                `INSERT INTO Users (user_id, full_name, username, password, email, birth_date)
                VALUES (:user_id, :full_name, :username, :password, :email, :birth_date)`,
                {
                    user_id: newAccount.user_id,
                    full_name: newAccount.full_name,
                    username: newAccount.username,
                    password: newAccount.password,
                    email: newAccount.email,
                    birth_date: newAccount.birth_date
                },
                { autoCommit: true }
            );
            await connection.close();
            return result.lastRowid;
        }
        catch (err) {
            console.error("Erro ao salvar a conta!", err);
            return undefined;
        }
    }

    // Função para verificar se a conta existe e as informações estão corretas
    async function verifyAccount(email: string, password: string): Promise<boolean> {
        try {
            const connection = await getConnection();
            const result = await connection.execute(
                `SELECT COUNT(*) AS count
                FROM Users
                WHERE email = :email AND password = :password`,
                { email, password }
            );

            await connection.close();
            const count = (result.rows as any[])[0]?.count || 0;
            return count > 0;
        } catch (err) {
            console.error("Erro ao verificar conta! ", err);
            return false;
        }
    }

    //funcao para tratar o cadastro
    export const createAccountRoute: RequestHandler = async (req: Request, res: Response) => {
        // Passo 1 - Receber os parâmetros para criar a conta
        const userId = req.get('userid');
        const fullName = req.get('fullname');
        const username = req.get('username');
        const password = req.get('password');
        const email = req.get('email');
        const birthDate = req.get('birth date');

        if (userId && fullName && username && password && email && birthDate) {
            // prosseguir com o cadastro...
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
            }
            else {
                res.status(500).send("Erro ao criar a conta. Tente novamente.");
            }
        }
        else {
            res.status(400).send("Parâmetros inválidos ou faltantes.");
        }
    };


    //funcao para tratar o login
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

    //Função de atualização de conta
    export const updateAccount: RequestHandler = async (req: Request, res: Response) => {
        const userId = req.get('userid');
        const fullName = req.get('fullname');
        const username = req.get('username');
        const password = req.get('password');
        const email = req.get('email');
        const birthDate = req.get('birth date');

        if (userId && (fullName || username || password || email || birthDate)) {
            try {
                const connection = await getConnection();
                const result = await connection.execute(
                    `UPDATE Users SET 
                        full_name = COALESCE(:full_name, full_name),
                        username = COALESCE(:username, username),
                        password = COALESCE(:password, password),
                        email = COALESCE(:email, email),
                        birth_date = COALESCE(:birth_date, birth_date)
                    WHERE user_id = :user_id`,
                    {
                        user_id: userId,
                        full_name: fullName,
                        username: username,
                        password: password,
                        email: email,
                        birth_date: birthDate ? new Date(birthDate) : undefined
                    },
                    { autoCommit: true }
                );

                await connection.close();
                if (result.rowsAffected) {
                    res.status(200).send(`Conta com ID ${userId} atualizada com sucesso.`);
                } else {
                    res.status(404).send(`Usuário com ID ${userId} não encontrado.`);
                }
            } catch (error) {
                console.error("Error updating account:", error);
                res.status(500).send("Erro ao atualizar a conta.");
            }
        } else {
            res.status(400).send("Parâmetros inválidos ou faltantes.");
        }
    };

    //Função de deletar a conta
    export const deleteAccount: RequestHandler = async (req: Request, res: Response) => {
        const userId = req.get('userid');
        if (userId) {
            try {
                const connection = await getConnection();
                const result = await connection.execute(
                    `DELETE FROM User WHERE user_id = user_id`,
                    { user_id: userId },
                    { autoCommit: true }
                );

                await connection.close();
                if (result.rowsAffected) {
                    res.status(200).send(`Conta com ID ${userId} excluida com sucesso.`);
                } else {
                    res.status(404).send(`Usuário com ID ${userId} não encontrado.`);
                }
            } catch (error) {
                console.error("Error deleting account:", error);
                res.status(500).send("Erro ao atualizar a conta.");
            }
        } else {
            res.status(400).send("Parâmetros 'userid' inválidos ou faltantes.");
        }
    };
}
