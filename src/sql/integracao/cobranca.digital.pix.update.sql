UPDATE integracao.CobrancaDigitalPix
SET TxId = @TxId,
  DataCriacao = @DataCriacao,
  DataExpiracao = @DataExpiracao,
  QrCode = @QrCode,
  ImagemQrcode = @ImagemQrcode,
  Valor = @Valor
WHERE SysId = @SysId
  AND Sequencia = @Sequencia