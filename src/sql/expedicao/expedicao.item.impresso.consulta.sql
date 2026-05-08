SELECT *
FROM (
SELECT
	eise.CodEmpresa,
	eise.CodSepararEstoque,
	eise.Item,
	eise.Origem,
	eise.CodOrigem,
	eise.ItemOrigem,
	ob.CodProdutoVendido,
	ese.Data DataSepararEstoque,
	ese.Hora HoraSepararEstoque,
	ese.Situacao,
	ob.CodTipoOperacaoSaida,
	tosob.Descricao DescricaoTipoOperacaoSaida,
	ob.CodVendedor,
	vob.NomeReduzido NomeVendedor,
	ese.TipoEntidade,
	ese.CodEntidade,
	ese.NomeEntidade,
	ese.CodPrioridade,
	ep.Descricao DescricaoPrioridade,
	ob.CodCliente,
	ob.NomeCliente,
	cob.NomeFantasia NomeFantasiaCliente,
	ob.CodFornecedor CodTransportadora,
	ftob.NomeFantasia NomeFantasiaTransportadora,
	ftob.RazaoSocial RazaoSocialTransportadora,
	ob.CodMunicipio CodMunicipioEntrega,
	mob.Nome NomeMunicipioEntrega,
	eise.CodLocalArmazenagem,
	la.Nome NomeLocalArmazenagem,
	eise.CodSetorEstoque,
	ess.Descricao DescricaoSetorEstoque,
	eise.CodProduto,
	p.Nome NomeProduto,
	p.Descricao DescricaoProduto,
	p.CodGrupoProduto,
	gp.Nome NomeGrupoProduto,
	p.CodMarca,
	m.Nome NomeMarca,
	p.CodigoFabricante,
	p.CodigoFornecedor,
	p.CodigoReferencia,
	p.CodigoBarras1 CodigoBarras,
	pe.Descricao DescricaoEnderecoProduto,
	eise.CodUnidadeMedida,
	und.Descricao DescricaoUnidadeMedida,
	eise.Quantidade,
	eise.QuantidadeInterna,
	eise.QuantidadeExterna,
	eise.QuantidadeSeparacao,
	ese.Historico HistoricoSepararEstoque,
	ese.Observacao ObservacaoSepararEstoque,
	ob.Observacao OrcamentoObservacao
FROM Expedicao.ItemSepararEstoque eise
INNER JOIN Expedicao.SepararEstoque ese ON
	ese.CodEmpresa = eise.CodEmpresa
AND ese.CodSepararEstoque = eise.CodSepararEstoque
INNER JOIN Produto p ON
	p.CodProduto = eise.CodProduto
LEFT JOIN GrupoProduto gp ON
	gp.CodGrupoProduto = p.CodGrupoProduto
LEFT JOIN Marca m ON
	m.CodMarca = p.CodMarca
LEFT JOIN UnidadeMedida und ON
	und.CodUnidadeMedida = eise.CodUnidadeMedida
LEFT JOIN ProdutoEndereco pe ON
	pe.CodProdutoEndereco = p.Endereco
LEFT JOIN Expedicao.SetorEstoque ess ON
	ess.CodSetorEstoque = p.CodSetorEstoque
LEFT JOIN LocalArmazenagem la ON
	la.CodLocalArmazenagem = eise.CodLocalArmazenagem
LEFT JOIN Expedicao.Prioridade ep ON
	ep.CodPrioridade = ese.CodPrioridade
LEFT JOIN OrcamentoBalcao ob ON
	ob.CodEmpresa = ese.CodEmpresa
AND ob.CodOrcamento = ese.CodOrigem
AND ese.Origem = 'OB'
LEFT JOIN TipoOperacaoSaida tosob ON
	tosob.CodEmpresa = ob.CodEmpresa
AND tosob.CodTipoOperacaoSaida = ob.CodTipoOperacaoSaida
LEFT JOIN Vendedor vob ON
	vob.CodVendedor = ob.CodVendedor
LEFT JOIN Cliente cob ON
	cob.CodCliente = ob.CodCliente
LEFT JOIN Fornecedor ftob ON
	ftob.CodFornecedor = ob.CodFornecedor
LEFT JOIN Municipio mob ON
	mob.CodMunicipio = ob.CodMunicipio
) ItemExpedicaoImpressoConsulta
