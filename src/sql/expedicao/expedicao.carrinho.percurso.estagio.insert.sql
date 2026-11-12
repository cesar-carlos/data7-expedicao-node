SET NOCOUNT ON;

DECLARE @Out TABLE (
    CodEmpresa INT NOT NULL,
    CodCarrinhoPercurso INT NOT NULL,
    Item VARCHAR(5) NOT NULL,
    Origem VARCHAR(6) NOT NULL,
    CodOrigem INT NOT NULL,
    CodPercursoEstagio INT NOT NULL,
    CodCarrinho INT NOT NULL,
    Situacao VARCHAR(30) NOT NULL,
    DataInicio DATE NOT NULL,
    HoraInicio VARCHAR(8) NOT NULL,
    CodUsuarioInicio INT NOT NULL,
    NomeUsuarioInicio VARCHAR(30) NOT NULL,
    DataFinalizacao DATE NULL,
    HoraFinalizacao VARCHAR(8) NULL,
    CodUsuarioFinalizacao INT NULL,
    NomeUsuarioFinalizacao VARCHAR(30) NULL
  );

INSERT INTO Expedicao.CarrinhoPercursoEstagio(
    CodEmpresa,
    CodCarrinhoPercurso,
    Item,
    Origem,
    CodOrigem,
    CodPercursoEstagio,
    CodCarrinho,
    Situacao,
    DataInicio,
    HoraInicio,
    CodUsuarioInicio,
    NomeUsuarioInicio,
    DataFinalizacao,
    HoraFinalizacao,
    CodUsuarioFinalizacao,
    NomeUsuarioFinalizacao
  )
OUTPUT
    INSERTED.CodEmpresa,
    INSERTED.CodCarrinhoPercurso,
    INSERTED.Item,
    INSERTED.Origem,
    INSERTED.CodOrigem,
    INSERTED.CodPercursoEstagio,
    INSERTED.CodCarrinho,
    INSERTED.Situacao,
    INSERTED.DataInicio,
    INSERTED.HoraInicio,
    INSERTED.CodUsuarioInicio,
    INSERTED.NomeUsuarioInicio,
    INSERTED.DataFinalizacao,
    INSERTED.HoraFinalizacao,
    INSERTED.CodUsuarioFinalizacao,
    INSERTED.NomeUsuarioFinalizacao
  INTO @Out
VALUES (
    @CodEmpresa,
    @CodCarrinhoPercurso,
    CASE
      WHEN @Item = '00000'
      OR @Item = '' THEN (
        SELECT FORMAT(ISNULL(MAX(CAST(Item AS INT)), 0) + 1, '00000')
        FROM Expedicao.CarrinhoPercursoEstagio
        WHERE CodEmpresa = @CodEmpresa
          AND CodCarrinhoPercurso = @CodCarrinhoPercurso
      )
      ELSE @Item
    END,
    @Origem,
    @CodOrigem,
    @CodPercursoEstagio,
    @CodCarrinho,
    @Situacao,
    @DataInicio,
    @HoraInicio,
    @CodUsuarioInicio,
    @NomeUsuarioInicio,
    @DataFinalizacao,
    @HoraFinalizacao,
    @CodUsuarioFinalizacao,
    @NomeUsuarioFinalizacao
  );

SELECT
    CodEmpresa,
    CodCarrinhoPercurso,
    Item,
    Origem,
    CodOrigem,
    CodPercursoEstagio,
    CodCarrinho,
    Situacao,
    DataInicio,
    HoraInicio,
    CodUsuarioInicio,
    NomeUsuarioInicio,
    DataFinalizacao,
    HoraFinalizacao,
    CodUsuarioFinalizacao,
    NomeUsuarioFinalizacao
FROM @Out
