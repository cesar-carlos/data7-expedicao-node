UPDATE Expedicao.PercursoEstagio
SET Descricao = @Descricao,
  Ativo = @Ativo,
  Origem = @Origem,
  Sequencia = @Sequencia
WHERE CodPercursoEstagio = @CodPercursoEstagio