import { Request, RequestHandler, Response } from "express";

/*
    Nampespace que contém tudo sobre "contas de usuários"
*/
export namespace AccountsHandler {

    /**
     * Tipo UserAccount
     */
    export type UserAccount = {
        name: string;
        email: string;
        password: string;
        birthdate: string;
    };

    //Carteira do usuario
    export type UserWallet = {
        id: number;
        value: number;
    }

    // Array que representa uma coleção de contas. 
    let accountsDatabase: UserAccount[] = [];

    //array para armazenar valores de contas dos usuarios
    let walletDatabase: UserWallet[] = [];

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

    //Adicionando deposito
    function addValue(newDeposit: UserWallet): number {
        walletDatabase.push(newDeposit);
        return walletDatabase.length;
    }

    //Verificando se os dados estão vindo e chamando a função de add deposito
    export const deposit: RequestHandler = (req: Request, res: Response) => {
        const id = Number(req.get('id'));
        const value = Number(req.get('value'));

        if (id && value) {
            const newDeposit: UserWallet = {
                id: id,
                value: value
            }
            const ok = addValue(newDeposit);
            res.statusCode = 200;
            res.send(`Quantidade de depositos feitos: ${ok}`);
        } else {
            res.statusCode = 400;
        }
    }

    //Para ver os depositos
    export const seeDeposits: RequestHandler = (req: Request, res: Response) => {
        console.log(walletDatabase.length);
        if (walletDatabase.length >= 1) {
            res.statusCode = 200;
            res.json(walletDatabase);
        } else {
            res.statusCode = 404;
        }
    }
}