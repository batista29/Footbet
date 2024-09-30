import express from 'express';
import { Router, Request, Response } from 'express'

const backend = express();
const route = Router();
const port = 3000;

backend.use(express.json());

//rotas de serviços
backend.post('/login', (req: Request, res: Response) => {
    res.send('Login funcionando');
})

backend.post('/signUp', (req, res) => {
    res.send('Cadastro funcionando');
});

backend.get('/carteira', (req: Request, res: Response) => {
    res.send('Carteira funcionando');
})

backend.get('/apostasFeitas', (req, res) => {
    res.send('Apostas feitas funcionando');
});

//Subindo servidor
backend.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`);
})