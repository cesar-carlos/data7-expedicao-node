INSERT INTO integracao.CobrancaDigitalPix (
    SysId,
    Sequencia,
    TxId,
    DataCriacao,
    DataExpiracao,
    QrCode,
    ImagemQrcode,
    Valor
  )
VALUES (
    @SysId,
    @Sequencia,
    @TxId,
    @DataCriacao,
    @DataExpiracao,
    @QrCode,
    @ImagemQrcode,
    @Valor
  )