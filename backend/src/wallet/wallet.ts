import { Request, RequestHandler, Response } from "express";
import { RowDataPacket, FieldPacket } from 'mysql2';

export namespace walletHandler {

    //Carteira do usuario
    export type UserWallet = {
        id: number;
        value: number;
    }

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

    //Verificando se os dados estão vindo e chamando a função de add deposito
    export const addFunds: RequestHandler = (req: Request, res: Response) => {
        const id_wallet = Number(req.get('id_wallet'));
        const id_user = Number(req.get('id_user'));
        let value = Number(req.get('value'));
        const type = 'deposito';

        //verificando se nao vem campo vazio
        if (id_wallet && id_user && value && type && Math.sign(value) !== -1) {
            //conectando com o banco, fiz a função para nao ter que copiar 7 linhas toda hora
            let conn = connectDatabase();
            conn.query(`INSERT INTO Transacao (id_wallet,user_id,value,type) VALUES(${id_wallet},${id_user}, ${value}, '${type}');`, function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
                if (!err) {
                    res.statusCode = 200;
                    //retornando 1, que é a quantidade de campos alterados, se nao retornar 1 é porque deu erro
                    res.send("Deposito realizado com sucesso");
                } else {
                    //erro caso nao envie a informações corretas para o banco
                    res.statusCode = 400;
                    res.send("Error")
                }
            });
        } else {
            //erro caso nao tenha todos os campos preenchidos
            res.statusCode = 400;
            res.send("Error");
        }
    }

    export async function getBalance(req: Request, res: Response) {
        const id_user = Number(req.get('id_user'));
        console.log("id para ver saldo: ",id_user)

        if (id_user) {
            let conn = connectDatabase();
            conn.query(`SELECT SUM(value) as 'saldo' FROM Transacao WHERE user_id = ${id_user};`, function (err: Error, data: RowDataPacket[]) {
                if (!err) {
                    res.statusCode = 200;
                    res.send(data[0].saldo);
                } else {
                    res.statusCode = 400;
                    res.send("Error")
                }
            });
            conn.end();
        }
    }

    //Ester

export async function getDeposits(req: Request, res: Response) {
    const id_user = Number(req.get('id_user'));  
    console.log("Id para ver depósitos:", id_user);

    if (!id_user) {
        return res.status(400).json({ message: "ID do usuário não fornecido." });
    }

    try {
        const conn = await connectDatabase();
        conn.query(
            `SELECT value, date_transation FROM Transacao WHERE user_id = ? AND type = 'deposito'`,
            [id_user],
            (err: Error, data: RowDataPacket[]) => {
                if (err) {
                    console.error("Erro na consulta ao banco:", err);
                    return res.status(500).json({ message: "Erro interno no servidor." });
                }

                if (data.length > 0) {
                    res.status(200).json(data);
                } else {
                    res.status(404).json({ message: "Nenhum depósito encontrado." });
                }
            }
        );
        conn.end();
    } catch (error) {
        console.error("Erro na conexão ou consulta ao banco:", error);
        return res.status(500).json({ message: "Erro ao acessar o banco de dados." });
    }
}

export async function getWithDrawals(req: Request, res: Response) {
    const id_user = Number(req.get('id_user'));  
    console.log("Id para ver saques:", id_user);

    if (!id_user) {
        return res.status(400).json({ message: "ID do usuário não fornecido." });
    }

    try {
        const conn = await connectDatabase();
        conn.query(
            `SELECT value, date_transation FROM Transacao WHERE user_id = ? AND type = 'saque'`,
            [id_user],
            (err: Error, data: RowDataPacket[]) => {
                if (err) {
                    console.error("Erro na consulta ao banco:", err);
                    return res.status(500).json({ message: "Erro interno no servidor." });
                }

                if (data.length > 0) {
                    res.status(200).json(data);
                } else {
                    res.status(404).json({ message: "Nenhum depósito encontrado." });
                }
            }
        );
        conn.end();
    } catch (error) {
        console.error("Erro na conexão ou consulta ao banco:", error);
        return res.status(500).json({ message: "Erro ao acessar o banco de dados." });
    }
}

    async function seeBalance(id_user: number) {
        return await new Promise((resolve, reject) => {
            if (id_user) {
                let conn = connectDatabase();
                conn.query(`SELECT SUM(value) as 'saldo' FROM Transacao WHERE user_id = ${id_user};`,
                    function (err: Error, data: RowDataPacket[]) {
                        if (!err || data && data.length > 0) {
                            resolve(data[0].saldo);
                        }
                        reject(null);
                    });
            }
        })
    }

    export const withdrawFunds: RequestHandler = async (req: Request, res: Response) => {
        const id_wallet = Number(req.get('id_wallet'));
        const id_user = Number(req.get('id_user'));
        let value = Number(req.get('value'));
        const type = 'saque';

        // calcular taxa
        let tax = 0;
        if (value <= 100) {
            tax = 0.04;
        } else if (value <= 1000) {
            tax = 0.03;
        } else if (value <= 5000) {
            tax = 0.02;
        } else if (value <= 100000) {
            tax = 0.01;
        }

        const fee = value * tax;
        const netValue = value + fee;

        const balance = Number(await seeBalance(id_user));

        //verificando se nao vem campo vazio
        if (balance < netValue) {
            res.statusCode = 400;
            res.send("Saldo insuficiente");
        } else {
            if (id_wallet && id_user && type && Math.sign(value) !== -1) {
                //conectando com o banco, fiz a função para nao ter que copiar 7 linhas toda hora
                let conn = connectDatabase();
                conn.query(`INSERT INTO Transacao (id_wallet,user_id,value,type) VALUES(${id_wallet},${id_user}, -${netValue}, '${type}');`, function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
                    if (!err) {
                        res.statusCode = 200;
                        //retornando 1, que é a quantidade de campos alterados, se nao retornar 1 é porque deu erro
                        res.send("Saque concluido com sucesso");
                    } else {
                        //erro caso nao envie a informações corretas para o banco
                        res.statusCode = 400;
                        res.send("Informações inválidas");
                    }
                });
            } else {
                //erro caso nao tenha todos os campos preenchidos
                res.statusCode = 400;
                res.send("Erro nas informações");
            }
        }
    }
}