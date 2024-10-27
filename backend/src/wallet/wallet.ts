import { Request, RequestHandler, Response } from "express";
import { RowDataPacket, FieldPacket } from 'mysql2';
import { resolve } from "path";

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
            conn.query(`INSERT INTO Transacao VALUES(${id_wallet},${id_user}, ${value}, '${type}');`, function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
                if (!err) {
                    res.statusCode = 200;
                    //retornando 1, que é a quantidade de campos alterados, se nao retornar 1 é porque deu erro
                    res.send(fields);
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

    async function seeBalance(id_user: number) {
        return await new Promise((resolve, reject) => {
            if (id_user) {
                let conn = connectDatabase();
                conn.query(`SELECT SUM(value) as 'saldo' FROM Transacao WHERE id_user = ${id_user};`, function (err: Error, data: RowDataPacket[]) {
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
        const balance = Number(await seeBalance(id_user));

        //verificando se nao vem campo vazio
        if (id_wallet && id_user && value && type && balance >= value && Math.sign(value) !== -1) {
            //conectando com o banco, fiz a função para nao ter que copiar 7 linhas toda hora
            let conn = connectDatabase();
            conn.query(`INSERT INTO Transacao VALUES(${id_wallet},${id_user}, -${value}, '${type}');`, function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
                if (!err) {
                    res.statusCode = 200;
                    //retornando 1, que é a quantidade de campos alterados, se nao retornar 1 é porque deu erro
                    res.send(fields);
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
}