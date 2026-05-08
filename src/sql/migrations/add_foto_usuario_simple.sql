-- Script simples para adicionar a coluna FotoUsuario

ALTER TABLE Expedicao.LoginApp
ADD FotoUsuario VARBINARY(MAX) NULL;
