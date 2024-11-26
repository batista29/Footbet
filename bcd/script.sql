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
    CONSTRAINT CHK_categoria CHECK (categoria ='libertadores' or categoria='brasileirão' or categoria='chapions' or categoria='copa do brasil' or categoria='sul americana' or categoria='estaduais' or categoria='la liga' or categoria='premier league')
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

SELECT * FROM mais_apostados;