# Walkthrough — Integração Painel Admin ↔ Site Principal

## O que foi feito

A integração completa do painel administrativo com o site principal foi finalizada. Agora todos os dados fluem por uma única camada de estado global (`AppDataContext`), eliminando silos isolados e garantindo que alterações feitas no admin reflitam imediatamente nas páginas públicas.

---

## Arquivos Alterados

### 1. `context/AppDataContext.tsx` *(criado anteriormente)*
Camada de dados compartilhada. Centraliza:
- **Advogados** (`lawyers`) — persistidos via `localStorage`
- **Clientes** (`clients`), **Estagiários** (`interns`), **Secretárias** (`secretaries`)
- **Serviços** (`services`, `serviceGroups`)
- Funções de mutação: `updateLawyer`, `updateClient`, `updateIntern`, `updateSecretary`, `updateServices`, `updateServiceGroups`

### 2. `index.tsx` *(alterado anteriormente)*
Envolve toda a árvore de componentes com `<AppDataProvider>`, garantindo que qualquer componente possa consumir o contexto.

### 3. `App.tsx`
- Consome `useAppData()` em vez de `useState<Lawyer[]>` local
- Passa `onNavigate={handleNavigate}` ao `<AdminDashboard>` ✅

### 4. `components/admin/AdminDashboard.tsx`
- **Removido** `useState<Lawyer[]>(mockLawyers)` local
- Agora usa `const { lawyers, updateLawyer } = useAppData()` — dados sincronizados globalmente
- Passa `updateLawyer` diretamente como `onLawyerUpdate` ao `RegistrationsTab`
- Botão **"← Site"** no header navega para `landing` via `onNavigate`
- Link **"Ir para o site público"** na sidebar também usa `onNavigate`

### 5. `components/admin/RegistrationsTab.tsx`
- **Removidos** os 3 `useState` locais de clientes/estagiários/secretárias que liam do `localStorage` diretamente
- Agora usa `const { clients, interns, secretaries, updateClient, updateIntern, updateSecretary } = useAppData()`
- Salvamentos passam pelo contexto → persistência centralizada, sem duplicação

### 6. `components/admin/ServicesManagementTab.tsx`
- **Removido** o `useEffect` de inicialização via `localStorage` para serviços
- Agora usa `const { services, serviceGroups: groups, updateServices } = useAppData()`
- `saveServicesToStorage()` agora chama `updateServices()` do contexto
- Descontos por grupo (`groupDiscounts`) permanecem em estado local (não são dados públicos)

### 7. `components/layout/Header.tsx`
- **"Painel Admin"** no desktop: antes era um `<span>` estático. Agora é um `<button>` que chama `onNavigate('adminDashboard')`, com indicador de aba ativa
- **"Painel Admin"** no mobile: adicionado ao menu drawer, visível apenas quando `user?.role === 'admin'`

---

## Build de Produção

```
✓ 1049 modules transformed.
✓ built in 29.41s
```

**0 erros de TypeScript. 0 erros de compilação.**
Apenas 2 warnings CSS pré-existentes (escaping de cor Tailwind `#1A1730`) e aviso padrão de chunk grande (esperado para SPA deste porte).

---

## Fluxo de Dados — Antes vs. Depois

| Componente | Antes | Depois |
|---|---|---|
| `AdminDashboard` | `useState(mockLawyers)` isolado | `useAppData().lawyers` compartilhado |
| `RegistrationsTab` | 3× `useState` + `localStorage` direto | `useAppData()` centralizado |
| `ServicesManagementTab` | `useEffect` + `localStorage` manual | `useAppData().services` compartilhado |
| `Header` (admin) | `<span>` estático | `<button>` navegável |

---

## Próximas Integrações Facilitadas

Com o `AppDataContext` já implantado, as próximas integrações se resumem a:
1. **Qualquer página pública** que precise de dados atualizados: basta usar `useAppData()`
2. **Novos tabs do admin**: consomem contexto sem props drilling
3. **Backend/API real**: substitua apenas os `mockXxx` dentro de `AppDataContext.tsx` — sem tocar em componentes
