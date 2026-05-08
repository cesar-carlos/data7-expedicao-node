SELECT CASE
    WHEN LEN(@@VERSION) <= 30 THEN 'SyBase'
    ELSE 'SQL Server'
  END Base,
  @@VERSION Versao