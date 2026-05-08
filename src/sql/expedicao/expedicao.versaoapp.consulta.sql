SELECT *
FROM (
	SELECT
		CodVersaoApp,
		NomeApp,
		Ativo,
		IdEmpresa,
		IdExecutavel,
		DataVersaoApp,
		Versao,
		ServerHost,
		PathExec
	FROM Expedicao.VersaoApp
) VersaoAppConsulta
