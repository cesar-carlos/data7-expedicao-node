import { createRouter, createWebHashHistory } from 'vue-router';

import ConnectionsPage from '../features/monitor/ConnectionsPage.vue';
import ErrorLog from '../features/monitor/ErrorLog.vue';
import LiveLog from '../features/monitor/LiveLog.vue';
import DatabasePage from '../features/settings/DatabasePage.vue';
import ExpedicaoPage from '../features/settings/ExpedicaoPage.vue';
import ServerPage from '../features/settings/ServerPage.vue';
import WindowPage from '../features/settings/WindowPage.vue';
import MainLayout from '../layouts/MainLayout.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', redirect: { name: 'server' } },
        {
          path: 'servico',
          name: 'server',
          component: ServerPage,
          meta: { title: 'Serviço', lead: 'Porta em que a API e o Socket.IO atendem nesta máquina.' },
        },
        {
          path: 'banco',
          name: 'database',
          component: DatabasePage,
          meta: { title: 'SQL Server', lead: 'A senha gravada não volta para a tela. Preencha de novo só para trocar.' },
        },
        {
          path: 'expedicao',
          name: 'expedicao',
          component: ExpedicaoPage,
          meta: { title: 'Expedição', lead: 'A escuta avisa os clientes conectados quando a separação muda.' },
        },
        {
          path: 'janela',
          name: 'window',
          component: WindowPage,
          meta: { title: 'Janela', lead: 'Estas opções não reiniciam a API. Iniciar com o Windows vale para todos os usuários.' },
        },
        {
          path: 'conexoes',
          name: 'connections',
          component: ConnectionsPage,
          meta: {
            title: 'Conexões',
            lead: 'Coletores ligados agora. A trilha mostra só o cliente aberto, com o texto cortado.',
          },
        },
        {
          path: 'console',
          name: 'console',
          component: LiveLog,
          meta: { title: 'Console', lead: 'Saída ao vivo do processo do servidor.' },
        },
        {
          path: 'erros',
          name: 'errors',
          component: ErrorLog,
          meta: { title: 'Erros', lead: 'Falhas gravadas nesta instalação.' },
        },
      ],
    },
  ],
});
