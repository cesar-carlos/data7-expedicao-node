/**
 * Exemplos de uso do sistema de controle de transações
 * ConnectionSqlServerMssql - Transaction Control Examples
 */

import ConnectionSqlServerMssql from '../src/infra/connection.sql.server.mssql';

export class TransactionExamples {
  private connection = ConnectionSqlServerMssql.getInstance();

  /**
   * Exemplo 1: Controle Manual de Transação
   * Usado quando você precisa de controle fino sobre quando fazer commit/rollback
   */
  async manualTransactionExample() {
    let transactionId: string | null = null;

    try {
      // Inicia uma transação com timeout de 60 segundos
      transactionId = await this.connection.beginTransaction('user-update-tx', 60000);

      // Obtém o request da transação
      const request = this.connection.getTransactionRequest(transactionId);

      // Executa operações SQL na transação
      await request.query(`
        UPDATE Usuarios
        SET Nome = 'Novo Nome', UltimaAtualizacao = GETDATE()
        WHERE CodUsuario = 1
      `);

      await request.query(`
        INSERT INTO LogAtualizacoes (CodUsuario, Acao, DataHora)
        VALUES (1, 'UPDATE_NOME', GETDATE())
      `);

      // Se tudo deu certo, confirma a transação
      await this.connection.commitTransaction(transactionId);
      console.log('Transação manual concluída com sucesso!');
    } catch (error) {
      // Se algo deu errado, desfaz a transação
      if (transactionId) {
        await this.connection.rollbackTransaction(transactionId);
      }
      console.error('Erro na transação manual:', error);
      throw error;
    }
  }

  /**
   * Exemplo 2: Transação Automática (Recomendado)
   * O sistema gerencia automaticamente commit/rollback
   */
  async automaticTransactionExample() {
    try {
      const result = await this.connection.executeInTransaction(async (request, txId) => {
        console.log(`Executando operações na transação: ${txId}`);

        // Insere um novo produto
        const insertResult = await request.query(`
          INSERT INTO Produtos (Nome, Preco, Estoque)
          OUTPUT INSERTED.CodProduto
          VALUES ('Produto Exemplo', 99.99, 10)
        `);

        const novoProdutoId = insertResult.recordset[0].CodProduto;

        // Atualiza estatísticas
        await request.query(`
          UPDATE EstatisticasProdutos
          SET TotalProdutos = TotalProdutos + 1,
              UltimaAtualizacao = GETDATE()
        `);

        // Log da operação
        await request.query(`
          INSERT INTO LogOperacoes (Tipo, Descricao, DataHora)
          VALUES ('PRODUTO_CRIADO', 'Produto ${novoProdutoId} criado', GETDATE())
        `);

        return { produtoId: novoProdutoId, sucesso: true };
      }, 45000); // Timeout de 45 segundos

      console.log('Produto criado com sucesso:', result);
      return result;
    } catch (error) {
      console.error('Erro na transação automática:', error);
      throw error;
    }
  }

  /**
   * Exemplo 3: Múltiplas Transações Concorrentes
   * Útil para operações independentes que podem rodar em paralelo
   */
  async multipleTransactionsExample() {
    try {
      // Inicia múltiplas transações
      const tx1 = await this.connection.beginTransaction('update-user-1');
      const tx2 = await this.connection.beginTransaction('update-user-2');
      const tx3 = await this.connection.beginTransaction('update-user-3');

      const request1 = this.connection.getTransactionRequest(tx1);
      const request2 = this.connection.getTransactionRequest(tx2);
      const request3 = this.connection.getTransactionRequest(tx3);

      // Executa operações em paralelo
      const operations = [
        request1.query('UPDATE Usuarios SET UltimoAcesso = GETDATE() WHERE CodUsuario = 1'),
        request2.query('UPDATE Usuarios SET UltimoAcesso = GETDATE() WHERE CodUsuario = 2'),
        request3.query('UPDATE Usuarios SET UltimoAcesso = GETDATE() WHERE CodUsuario = 3'),
      ];

      await Promise.all(operations);

      // Commit de todas as transações
      await Promise.all([
        this.connection.commitTransaction(tx1),
        this.connection.commitTransaction(tx2),
        this.connection.commitTransaction(tx3),
      ]);

      console.log('Múltiplas transações concluídas com sucesso!');
    } catch (error) {
      console.error('Erro em transações múltiplas:', error);
      // O sistema fará rollback automático das transações que expirarem
      throw error;
    }
  }

  /**
   * Exemplo 4: Tratamento de Timeout
   * Demonstra como lidar com transações que demoram muito
   */
  async timeoutTransactionExample() {
    try {
      // Transação com timeout curto (5 segundos)
      await this.connection.executeInTransaction(async (request) => {
        // Simula operação demorada
        await request.query("WAITFOR DELAY '00:00:10'"); // Espera 10 segundos
        await request.query('SELECT 1'); // Esta não será executada devido ao timeout
      }, 5000); // Timeout de 5 segundos
    } catch (error) {
      console.log('Transação cancelada devido ao timeout (comportamento esperado)');
      // O rollback foi feito automaticamente
    }
  }

  /**
   * Exemplo 5: Monitoramento de Transações
   * Como verificar o status das transações ativas
   */
  async monitoringExample() {
    // Inicia algumas transações para demonstração
    const tx1 = await this.connection.beginTransaction('monitor-test-1');
    const tx2 = await this.connection.beginTransaction('monitor-test-2');

    // Obtém métricas gerais
    const metrics = this.connection.getMetrics();
    console.log('Métricas gerais:', {
      totalTransactions: metrics.totalTransactions,
      activeTransactions: metrics.activeTransactions,
      failedTransactions: metrics.failedTransactions,
    });

    // Lista transações ativas
    const activeTransactions = this.connection.getActiveTransactions();
    console.log('Transações ativas:', activeTransactions);

    // Limpa as transações de teste
    await this.connection.rollbackTransaction(tx1);
    await this.connection.rollbackTransaction(tx2);
  }

  /**
   * Exemplo 6: Cleanup de Emergência
   * Como fazer rollback de todas as transações ativas
   */
  async emergencyCleanupExample() {
    try {
      // Simula algumas transações "perdidas"
      await this.connection.beginTransaction('lost-tx-1');
      await this.connection.beginTransaction('lost-tx-2');
      await this.connection.beginTransaction('lost-tx-3');

      console.log('Transações ativas antes do cleanup:', this.connection.getActiveTransactions().length);

      // Faz rollback de todas as transações ativas
      await this.connection.rollbackAllTransactions();

      console.log('Transações ativas após cleanup:', this.connection.getActiveTransactions().length);
    } catch (error) {
      console.error('Erro no cleanup de emergência:', error);
    }
  }
}

// Exemplo de uso em um service/repository
export class UserService {
  private connection = ConnectionSqlServerMssql.getInstance();

  async createUserWithProfile(userData: any, profileData: any) {
    return this.connection.executeInTransaction(async (request) => {
      // Insere o usuário
      const userResult = await request.query(`
        INSERT INTO Usuarios (Nome, Email, DataCriacao)
        OUTPUT INSERTED.CodUsuario
        VALUES (@nome, @email, GETDATE())
      `);

      const userId = userResult.recordset[0].CodUsuario;

      // Insere o perfil
      await request.query(`
        INSERT INTO PerfilUsuario (CodUsuario, Bio, Telefone)
        VALUES (@userId, @bio, @telefone)
      `);

      // Atualiza contadores
      await request.query(`
        UPDATE Estatisticas
        SET TotalUsuarios = TotalUsuarios + 1
      `);

      return { userId, success: true };
    });
  }
}

/*
COMO USAR OS EXEMPLOS:

// Instanciar a classe
const examples = new TransactionExamples();

// Executar um exemplo
examples.automaticTransactionExample()
  .then(result => console.log('Sucesso:', result))
  .catch(error => console.error('Erro:', error));

// Usar o service
const userService = new UserService();
userService.createUserWithProfile(
  { nome: 'João', email: 'joao@email.com' },
  { bio: 'Desenvolvedor', telefone: '123456789' }
);
*/
