drop database footbet;
create database footbet;
use footbet;

CREATE TABLE Usuario(
    id_user INTEGER NOT NULL PRIMARY KEY,
    nome_completo varchar(255) NOT NULL,
    nome_user VARCHAR(20) NOT NULL,
    email VARCHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL,
    token VARCHAR(32) UNIQUE,
    data_nascimento DATE NOT NULL
);

CREATE TABLE Transacao(
    id_wallet INTEGER NOT NULL PRIMARY KEY,
    id_user INTEGER NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    type VARCHAR(8),
    CONSTRAINT CHK_type CHECK (type ='saque' or type='deposito'),
    FOREIGN KEY (id_user) REFERENCES Usuario(id_user)
);

CREATE TABLE Evento(
    id_evento INTEGER NOT NULL PRIMARY KEY,
    id_criador INTEGER NOT NULL,
    titulo VARCHAR(50) NOT NULL,
    descricao VARCHAR(50) NOT NULL,
    time1 VARCHAR(15) NOT NULL,
    time2 VARCHAR(15) NOT NULL,
    aprovado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(id_criador) REFERENCES Usuario(id_user)
);

CREATE TABLE Participa(
    id_participante INTEGER NOT NULL,
    id_evento INTEGER NOT NULL,
    FOREIGN KEY(id_participante) REFERENCES Usuario(id_user),
    FOREIGN KEY(id_evento) REFERENCES Evento(id_evento)
);

INSERT INTO Usuario VALUES(1,'Natã Batista', 'natabatista', 'natabatista2908@gmail.com', '123', '1h234j', '2007/05/20');
INSERT INTO Usuario VALUES(2,'Jhenifer Laís', 'JLais', 'Lais@Wager.com', 'WagerBest123', 'FEWUFIEJOQDHRUY32HEFU3RB2UT', '2004/02/21');

SELECT * FROM Usuario;
SELECT * FROM Transacao;