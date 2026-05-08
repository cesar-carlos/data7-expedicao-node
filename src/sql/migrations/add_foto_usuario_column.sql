-- Script para adicionar a coluna FotoUsuario na tabela Expedicao.LoginApp

-- Verificar se a coluna já existe antes de adicionar
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'Expedicao'
    AND TABLE_NAME = 'LoginApp'
    AND COLUMN_NAME = 'FotoUsuario'
)
BEGIN
    ALTER TABLE Expedicao.LoginApp
    ADD FotoUsuario VARBINARY(MAX) NULL;

    PRINT 'Coluna FotoUsuario adicionada com sucesso na tabela Expedicao.LoginApp';
END
ELSE
BEGIN
    PRINT 'Coluna FotoUsuario já existe na tabela Expedicao.LoginApp';
END
