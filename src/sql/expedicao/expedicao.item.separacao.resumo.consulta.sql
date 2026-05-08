SELECT *
FROM (
SELECT
	ise.CodEmpresa,
	ise.CodSepararEstoque,
	se.Origem,
	se.CodOrigem,
	cpe.Situacao Situacao,
	ise.CodCarrinhoPercurso,
	ise.ItemCarrinhoPercurso,
	cpe.CodCarrinho,
	cart.Descricao DescricaoCarrinho,
	isee.CodLocalArmazenagem,
	ise.CodProduto,
	p.Nome NomeProduto,
	ise.CodUnidadeMedida,
	und.Descricao DescricaoUnidadeMedida,
	p.CodigoBarras1 CodigoBarras,
	p.Endereco CodProdutoEndereco,
	pe.Descricao DescricaoProdutoEndereco,
	SUM(ise.Quantidade) Quantidade
FROM Expedicao.ItemSeparacaoEstoque ise
INNER JOIN Expedicao.ItemSepararEstoque isee ON
	isee.CodEmpresa = ise.CodEmpresa
AND isee.CodSepararEstoque = ise.CodSepararEstoque
AND isee.CodProduto = ise.CodProduto
INNER JOIN Expedicao.SepararEstoque se ON
	se.CodEmpresa = ise.CodEmpresa
AND se.CodSepararEstoque = ise.CodSepararEstoque
INNER JOIN Produto p ON
	p.CodProduto = ise.CodProduto
INNER JOIN UnidadeMedida und ON
	und.CodUnidadeMedida = ise.CodUnidadeMedida
LEFT JOIN ProdutoEndereco pe ON
	pe.CodProdutoEndereco = p.Endereco
LEFT JOIN Expedicao.CarrinhoPercursoEstagio cpe ON
	cpe.CodEmpresa = ise.CodEmpresa
AND cpe.CodCarrinhoPercurso = ise.CodCarrinhoPercurso
AND cpe.Item = ise.ItemCarrinhoPercurso
LEFT JOIN Expedicao.Carrinho cart ON
	cart.CodEmpresa = cpe.CodEmpresa
AND cart.CodCarrinho = cpe.CodCarrinho
WHERE ise.Situacao NOT IN ('CA')
  AND cpe.Situacao NOT IN ('CANCELADA')
GROUP By
	ise.CodEmpresa,
	ise.CodSepararEstoque,
	se.Origem,
	se.CodOrigem,
	cpe.Situacao,
	ise.CodCarrinhoPercurso,
	ise.ItemCarrinhoPercurso,
	cpe.CodCarrinho,
	cart.Descricao,
	isee.CodLocalArmazenagem,
	ise.CodProduto,
	p.Nome,
	ise.CodUnidadeMedida,
	und.Descricao,
	p.CodigoBarras1,
	p.Endereco,
	pe.Descricao
) ItemSeparacaoResumoConsulta
