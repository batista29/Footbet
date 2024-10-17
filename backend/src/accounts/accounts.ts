import { Request, RequestHandler, Response } from "express";
import oracledb from "oracledb";

/*
    Namespace que contém tudo sobre "contas de usuários"
*/
export namespace AccountsHandler {

    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    async function connection() {
        const connection = await oracledb.getConnection({
            user: "hr",
            password: mypw,
            connectString: "localhost/FREEPDB1"
        });

        const result = await connection.execute(
            `SELECT manager_id, department_id, department_name
             FROM Users
             WHERE manager_id = :id`,
            [103],  // bind value for :id
        );

        console.log(result.rows);
        await connection.close();
    }
}

export type UserAccount = {
    user_id: string;
    full_name: string;
    username: string;
    password: string;
    email: string;
    birth_date: Date;
};

export function saveNewAccount() {
    /* Insert logic */
}

/**
 * Função para tratar a rota HTTP /signUp. 
 * @param req Requisição http tratada pela classe @type { Request } do express
 * @param res Resposta http a ser enviada para o cliente @type { Response }
 */
export const createAccountRoute: RequestHandler = (req: Request, res: Response) => {
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
        const ID = saveNewAccount();
        res.statusCode = 200;
        res.send(`Nova conta adicionada. Código: ${ID}`);
    } else {
        res.statusCode = 400;
        res.send("Parâmetros inválidos ou faltantes.");
    }
};

// Para verificar se a conta existe e as informações estão corretas
function verifyAccount(email: string, password: string): boolean {
    let exists: boolean = false;
    /*
    accountsDatabase.find(account => {
        if (email === account.email && password === account.password) {
            exists = true;
=======
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
    })*/
    // select para verificar se o email e senha estão no banco
    return exists;
}

export const login: RequestHandler = (req: Request, res: Response) => {
    const email = req.get('email');
    const password = req.get('password');

    if (email && password && verifyAccount(email, password)) {
        res.statusCode = 200;
        res.send(`Login efetuado com sucesso`);
    } else {
        res.statusCode = 400;
        res.send("Email ou senha incorretos");
    }
};
