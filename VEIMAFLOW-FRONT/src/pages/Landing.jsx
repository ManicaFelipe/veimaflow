import React from 'react';
import { Link } from 'react-router-dom';
import logoMark from '../assets/branding/logo-mark.svg';
import productShot from '/illustrations/product-shot.svg';

export default function Landing() {
  return (
    <main className="relative overflow-hidden">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400 via-indigo-400 to-cyan-400 opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-400 to-blue-400 opacity-20 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="px-6 lg:px-10 pt-12 pb-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-blue-200 dark:border-blue-900/40 bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 backdrop-blur">
              <img src={logoMark} alt="VemaFlow" className="h-6 w-6" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Gerencie fluxos com velocidade e controle</span>
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
              Orquestre seus projetos<br className="hidden sm:block" /> com clareza e ritmo
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-xl">
              Centralize tarefas, alinhe times e visualize resultados em tempo real. Do planejamento à execução, tudo no mesmo fluxo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
                Começar agora
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-5 py-3 text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-400 dark:hover:bg-blue-950/40">
                Ver demonstração
              </Link>
              <a href="#features" className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Conheça os recursos →
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Sem complicação • Kanban inteligente • Métricas em tempo real</span>
            </div>
          </div>

          <div className="relative">
            {/* Product preview card */}
            <div className="relative rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-white/70 dark:bg-gray-800/70 shadow-xl backdrop-blur p-4">
              <div className="h-64 sm:h-80 rounded-xl overflow-hidden">
                <img src={productShot} alt="VemaFlow product preview" className="h-full w-full object-cover" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-600 dark:text-gray-300">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3">Tarefas priorizadas</div>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3">SLA e métricas</div>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3">Workflow personalizável</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 lg:px-10 py-12 bg-white/60 dark:bg-gray-900/40">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold">Recursos que aceleram seus resultados</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Foco no essencial: clareza, colaboração e controle.</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Kanban inteligente', desc: 'Organize tarefas por status, prioridade e responsáveis com arrastar e soltar.' },
              { title: 'Métricas em tempo real', desc: 'Acompanhe SLAs, throughput e lead time para decisões rápidas.' },
              { title: 'Colaboração segura', desc: 'Autenticação, perfis e registro de atividades integrados.' },
              { title: 'API pronta', desc: 'Documentação em /swagger e endpoints REST padronizados.' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md transition">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 mb-3" />
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="px-6 lg:px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold">Seu fluxo, do planejamento ao impacto</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Planeje', desc: 'Defina objetivos, escopo e prioridades.' },
              { step: '2', title: 'Execute', desc: 'Organize o trabalho em sprints e acompanhe o Kanban.' },
              { step: '3', title: 'Meça', desc: 'Monitore métricas e SLAs em dashboards.' },
              { step: '4', title: 'Otimize', desc: 'Ajuste processos com base em dados reais.' },
            ].map((s, i) => (
              <div key={i} className="relative rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/80 dark:bg-gray-800/50">
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center shadow">{s.step}</div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-white shadow hover:bg-blue-700">
              Criar conta gratuita
            </Link>
            <a href="/swagger/index.html" className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800">
              Ver API em Swagger
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-10 py-10 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoMark} alt="VemaFlow" className="h-6 w-6" />
            <span className="font-semibold">VemaFlow</span>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <a href="/swagger/index.html" className="hover:text-gray-900 dark:hover:text-white">API Docs</a>
            <Link to="/login" className="hover:text-gray-900 dark:hover:text-white">Entrar</Link>
            <Link to="/register" className="hover:text-gray-900 dark:hover:text-white">Cadastrar</Link>
          </nav>
          <p className="text-xs text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} VemaFlow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
