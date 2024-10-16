import { Request, RequestHandler, Response } from "express";
import { RowDataPacket, FieldPacket } from 'mysql2';

/*
    Nampespace que contém tudo sobre "contas de usuários"
*/
export namespace AccountsHandler {

    function connectDatabase() {
        var mysql = require('mysql2');
        const conn = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'teste'
        });

        return conn;
    }

    export type UserAccount = {
        name: string;
        email: string;
        password: string;
        birthdate: string;
    };

   
    /**
     * Salva uma conta no banco de dados. 
     * @param ua conta de usuário do tipo @type {UserAccount}
     * @returns @type { number } o código da conta cadastrada como posição no array.
     */
    export function saveNewAccount(ua: UserAccount): number {
        accountsDatabase.push(ua);
        return accountsDatabase.length;
    }

    /**
     * Função para tratar a rota HTTP /signUp. 
     * @param req Requisição http tratada pela classe @type { Request } do express
     * @param res Resposta http a ser enviada para o cliente @type { Response }
     */
    export const createAccountRoute: RequestHandler = (req: Request, res: Response) => {
        // Passo 1 - Receber os parametros para criar a conta
        const pName = req.get('name');
        const pEmail = req.get('email');
        const pPassword = req.get('password');
        const pBirthdate = req.get('birthdate');

        if (pName && pEmail && pPassword && pBirthdate) {
            // prosseguir com o cadastro... 
            const newAccount: UserAccount = {
                name: pName,
                email: pEmail,
                password: pPassword,
                birthdate: pBirthdate
            }
            
            const ID = saveNewAccount(newAccount);
            res.statusCode = 200;
            res.send(`Nova conta adicionada. Código: ${ID}`);
        } else {
            res.statusCode = 400;
            res.send("Parâmetros inválidos ou faltantes.");
        }
    }

    //Para ver se a conta existe e as informações estão corretas
    function verifyAccount(email: string, password: string): boolean {
        let exists: boolean = false;

        accountsDatabase.find(account => {
            if (email === account.email && password === account.password) {
                exists = true;
            }
        })

        return exists;
    }

    export const login: RequestHandler = (req: Request, res: Response) => {
        const email = req.get('email');
        const password = req.get('password');

        if (email && password && verifyAccount(email, password)) {
            res.statusCode = 200;
            res.send(`Login efetuado`);
        } else {
            res.statusCode = 400;
            res.send("Email ou senha incorretos");
        }
    }
