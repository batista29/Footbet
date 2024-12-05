drop database footbet;
create database footbet;
use footbet;

CREATE TABLE User(
    user_id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    full_name varchar(255) NOT NULL,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password_user VARCHAR(20) NOT NULL,
    token VARCHAR(32) UNIQUE NOT NULL,
    birth_date timestamp NOT NULL,
    type_user VARCHAR(10) NOT NULL,
    CONSTRAINT CHK_type_user CHECK (type_user ='moderador' or type_user='comum')
);

INSERT INTO User(user_id, full_name, username, email, password_user, token, birth_date, type_user)
VALUES(DEFAULT,'Larissa Furlan', 'larissafurlan', 'larissafurlan@gmail.com', '123', 'oTGxxkHLQQJDmLJEBL9DQCrlaof7ap9J', '2005-08-29', 'moderador');

INSERT INTO User(user_id, full_name, username, email, password_user, token, birth_date, type_user)
VALUES(DEFAULT,'Maria Gabriella', 'mariagabriella', 'mariagabriella@gmail.com', '12345', 'BAoex3xEcwgnvaYQQWx9TvHHEePU1EQa', '2005-04-05', 'moderador');

CREATE TABLE Transacao(
    id_wallet INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    value decimal(10,2) NOT NULL DEFAULT 0,
    type VARCHAR(8),
    CONSTRAINT CHK_type CHECK (type ='saque' or type='deposito'),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    date_transation timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Evento(
    id_evento INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_criador INTEGER NOT NULL,
    titulo VARCHAR(50) NOT NULL,
    descricao VARCHAR(50) NOT NULL,
    dataEvento DATE,
    inicioApostas datetime,
    fimApostas datetime,
    valor_cota decimal(10,2),
    status varchar(20) Default 'analise',
    email varchar(50),
    categoria varchar(30),
    FOREIGN KEY(id_criador) REFERENCES User(user_id),
    CONSTRAINT CHK_categoria CHECK (categoria ='libertadores' or categoria='brasileirao' or categoria='champions' or categoria='copa do brasil' or categoria='sul americana' or categoria='estaduais' or categoria='la liga' or categoria='premier league')
);

CREATE TABLE Participa(
    id_participante INTEGER NOT NULL,
    id_evento INTEGER NOT NULL,
    qtd_cotas integer,
    total_apostado decimal(10,2),
    aposta varchar(3),
    CONSTRAINT ck_aposta CHECK (aposta ='s' or aposta = 'n'),
    FOREIGN KEY(id_participante) REFERENCES User(user_id),
    FOREIGN KEY(id_evento) REFERENCES Evento(id_evento)
);

SELECT * FROM User;
SELECT * FROM Transacao;

SELECT SUM(value) as 'saldo' FROM Transacao WHERE user_id = 2;

SELECT token FROM User WHERE email = 'natabatista2908@gmail.com' AND password_user = '123';

CREATE OR REPLACE VIEW mais_apostados AS
SELECT 
    eve.id_evento, 
    eve.titulo, 
    eve.descricao, 
    eve.dataEvento, 
    eve.inicioApostas, 
    eve.fimApostas, 
    eve.valor_cota, 
    eve.categoria, 
    SUM(par.total_apostado) AS total_apostado
FROM Evento eve
JOIN Participa par ON eve.id_evento = par.id_evento
WHERE eve.status = 'ativo'
GROUP BY 
    eve.id_evento, 
    eve.titulo, 
    eve.descricao, 
    eve.dataEvento, 
    eve.inicioApostas, 
    eve.fimApostas, 
    eve.valor_cota, 
    eve.categoria
ORDER BY 
    total_apostado DESC;

SELECT * FROM mais_apostados LIMIT 10;



-- INSERTS

-- Libertadores
INSERT INTO Evento (id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email, categoria)
VALUES 
(1, 'Final Libertadores', 'Grande final da Libertadores', '2024-12-15', '2024-12-10 10:00:00', '2024-12-15 18:00:00', 1.5, 'ativo', 'natabatista2908@gmail.com', 'libertadores'),
(1, 'Semifinal Libertadores', 'Partida emocionante da semifinal', '2024-12-10', '2024-12-05 10:00:00', '2024-12-10 18:00:00', 1.8, 'ativo', 'natabatista2908@gmail.com', 'libertadores');

-- Brasileirão
INSERT INTO Evento (id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email, categoria)
VALUES 
(1, 'Rodada Brasileirão 1', 'Partida decisiva pela liderança', '2024-11-20', '2024-11-15 12:00:00', '2024-11-20 20:00:00', 2.0, 'ativo', 'natabatista2908@gmail.com', 'brasileirao'),
(1, 'Rodada Brasileirão 2', 'Clássico nacional emocionante', '2024-11-27', '2024-11-22 12:00:00', '2024-11-27 20:00:00', 2.5, 'ativo', 'natabatista2908@gmail.com', 'brasileirao');
INSERT INTO Evento (id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email, categoria)
VALUES 
(1, 'Rodada Brasileirão 3', 'Partida importante pela classificação', '2024-12-01', '2024-11-26 10:00:00', '2024-12-01 20:00:00', 1.9, 'ativo', 'natabatista2908@gmail.com', 'brasileirao'),
(1, 'Rodada Brasileirão 4', 'Disputa entre líderes', '2024-12-08', '2024-12-03 10:00:00', '2024-12-08 20:00:00', 2.2, 'ativo', 'natabatista2908@gmail.com', 'brasileirao'),
(1, 'Rodada Brasileirão 5', 'Partida entre rivais históricos', '2024-12-15', '2024-12-10 10:00:00', '2024-12-15 20:00:00', 2.0, 'ativo', 'natabatista2908@gmail.com', 'brasileirao'),
(1, 'Rodada Brasileirão 6', 'Jogo decisivo contra o rebaixamento', '2024-12-22', '2024-12-17 10:00:00', '2024-12-22 20:00:00', 1.8, 'ativo', 'natabatista2908@gmail.com', 'brasileirao'),
(1, 'Rodada Brasileirão 7', 'Confronto direto por vaga no G4', '2025-01-05', '2024-12-31 10:00:00', '2025-01-05 20:00:00', 2.1, 'ativo', 'natabatista2908@gmail.com', 'brasileirao'),
(1, 'Rodada Brasileirão 8', 'Grande jogo entre favoritos ao título', '2025-01-12', '2025-01-07 10:00:00', '2025-01-12 20:00:00', 2.4, 'ativo', 'natabatista2908@gmail.com', 'brasileirao'),
(1, 'Rodada Brasileirão 9', 'Partida cheia de expectativas', '2025-01-19', '2025-01-14 10:00:00', '2025-01-19 20:00:00', 2.3, 'ativo', 'natabatista2908@gmail.com', 'brasileirao'),
(1, 'Rodada Brasileirão 10', 'Última rodada do campeonato', '2025-01-26', '2025-01-21 10:00:00', '2025-01-26 20:00:00', 2.6, 'ativo', 'natabatista2908@gmail.com', 'brasileirao');

-- Champions League
INSERT INTO Evento (id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email, categoria)
VALUES 
(1, 'Fase de Grupos 1', 'Partida importante da fase de grupos', '2024-10-15', '2024-10-10 10:00:00', '2024-10-15 22:00:00', 3.0, 'ativo', 'natabatista2908@gmail.com', 'champions'),
(1, 'Fase de Grupos 2', 'Confronto decisivo entre grandes clubes', '2024-10-18', '2024-10-13 10:00:00', '2024-10-18 22:00:00', 2.8, 'ativo', 'natabatista2908@gmail.com', 'champions');

-- Copa do Brasil
INSERT INTO Evento (id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email, categoria)
VALUES 
(1, 'Quartas de Final 1', 'Grande confronto das quartas', '2024-06-15', '2024-06-10 08:00:00', '2024-06-15 20:00:00', 1.7, 'ativo', 'natabatista2908@gmail.com', 'copa do brasil'),
(1, 'Quartas de Final 2', 'Disputa acirrada pelas quartas', '2024-06-22', '2024-06-17 08:00:00', '2024-06-22 20:00:00', 1.9, 'ativo', 'natabatista2908@gmail.com', 'copa do brasil');

-- Sul Americana
INSERT INTO Evento (id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email, categoria)
VALUES 
(1, 'Semifinal Sul Americana 1', 'Jogo acirrado na semifinal', '2024-07-10', '2024-07-05 14:00:00', '2024-07-10 22:00:00', 1.6, 'ativo', 'natabatista2908@gmail.com', 'sul americana'),
(1, 'Semifinal Sul Americana 2', 'Decisão emocionante na semifinal', '2024-07-17', '2024-07-12 14:00:00', '2024-07-17 22:00:00', 1.8, 'ativo', 'natabatista2908@gmail.com', 'sul americana');

-- Estaduais
INSERT INTO Evento (id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email, categoria)
VALUES 
(1, 'Final Estadual SP', 'Grande final do campeonato paulista', '2024-04-15', '2024-04-10 09:00:00', '2024-04-15 18:00:00', 2.0, 'ativo', 'natabatista2908@gmail.com', 'estaduais'),
(1, 'Final Estadual RJ', 'Grande final do campeonato carioca', '2024-04-20', '2024-04-15 09:00:00', '2024-04-20 18:00:00', 2.1, 'ativo', 'natabatista2908@gmail.com', 'estaduais');

-- La Liga
INSERT INTO Evento (id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email, categoria)
VALUES 
(1, 'El Clásico 1', 'Confronto histórico entre Real e Barça', '2024-03-10', '2024-03-05 08:00:00', '2024-03-10 20:00:00', 3.5, 'ativo', 'natabatista2908@gmail.com', 'la liga'),
(1, 'El Clásico 2', 'Revanche entre Real e Barça', '2024-03-17', '2024-03-12 08:00:00', '2024-03-17 20:00:00', 3.8, 'ativo', 'natabatista2908@gmail.com', 'la liga');

-- Premier League
INSERT INTO Evento (id_criador, titulo, descricao, dataEvento, inicioApostas, fimApostas, valor_cota, status, email, categoria)
VALUES 
(1, 'Rodada Premier League 1', 'Partida decisiva pelo título', '2024-05-12', '2024-05-07 10:00:00', '2024-05-12 20:00:00', 2.5, 'ativo', 'natabatista2908@gmail.com', 'premier league'),
(1, 'Rodada Premier League 2', 'Clássico inglês', '2024-05-19', '2024-05-14 10:00:00', '2024-05-19 20:00:00', 2.7, 'ativo', 'natabatista2908@gmail.com', 'premier league');