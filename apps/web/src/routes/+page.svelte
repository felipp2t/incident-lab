<script lang="ts">
  import { onMount } from "svelte";
  import { tick } from "svelte";

  type User = { id: string; email: string; name: string };
  type MembershipRole = "admin" | "respondente" | "visualizador";
  type Organization = { id: string; name: string; role: MembershipRole };
  type Me = {
    user: User;
    activeOrganizationId: string | null;
    activeOrganizationRole: MembershipRole | null;
    organizations: Organization[];
  };

  let user = $state<User | null>(null);
  let me = $state<Me | null>(null);
  let email = $state("");
  let password = $state("");
  let organizationName = $state("");
  let memberUserId = $state("");
  let memberRole = $state<Exclude<MembershipRole, "admin">>("respondente");
  let selectedOrganizationId = $state("");
  let pendingCommandId = $state<string | null>(null);
  let pendingMemberCommandId = $state<string | null>(null);
  let busy = $state(false);
  let loadingContext = $state(true);
  let error = $state("");
  let status = $state("");
  let heading = $state<HTMLHeadingElement>();
  let errorSummary = $state<HTMLParagraphElement>();

  const apiErrorMessages: Record<string, string> = {
    authentication_required: "Sua sessão expirou. Entre novamente.",
    organization_not_found: "Essa organização não está disponível para você.",
    not_found: "Essa organização não está disponível para você.",
    user_not_found: "Não encontramos uma identidade com esse ID.",
    organization_membership_exists: "Essa pessoa já pertence à organização ativa.",
    invalid_membership_role: "Escolha um papel válido para o membro.",
    idempotency_conflict: "Esse comando já foi usado com outros dados. Tente novamente.",
    forbidden: "Você não tem permissão para executar essa ação."
  };

  async function errorFromResponse(response: Response, fallback: string) {
    let body: { error?: string } | null = null;
    try {
      body = await response.json();
    } catch {
      // Keep the fallback when the server does not return JSON.
    }
    return new Error(apiErrorMessages[body?.error ?? ""] ?? fallback);
  }

  function isMe(value: unknown): value is Me {
    if (!value || typeof value !== "object") return false;
    const candidate = value as Partial<Me>;
    return Boolean(candidate.user && Array.isArray(candidate.organizations));
  }

  function isMembershipRole(value: unknown): value is MembershipRole {
    return value === "admin" || value === "respondente" || value === "visualizador";
  }

  async function focusError() {
    await tick();
    errorSummary?.focus();
  }

  async function loadMe() {
    const response = await fetch("/api/me");
    if (response.status === 401) {
      user = null;
      me = null;
      selectedOrganizationId = "";
      return false;
    }
    if (!response.ok) throw await errorFromResponse(response, "Não foi possível carregar seu contexto.");

    const body: unknown = await response.json();
    if (!isMe(body)) throw new Error("A resposta do contexto está inválida.");

    user = body.user;
    me = body;
    selectedOrganizationId = body.activeOrganizationId ?? "";
    return true;
  }

  onMount(() => {
    loadingContext = true;
    void loadMe()
      .catch(async (cause) => {
        error = cause instanceof Error ? cause.message : "Não foi possível carregar seu contexto.";
        status = "";
        await focusError();
      })
      .finally(() => {
        loadingContext = false;
      });
  });

  async function login(event: SubmitEvent) {
    event.preventDefault();
    busy = true;
    loadingContext = true;
    error = "";
    status = "Entrando…";
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw await errorFromResponse(response, "E-mail ou senha inválidos.");
      const body = await response.json();
      if (!body.user) throw new Error("A resposta de login está inválida.");
      user = body.user as User;
      password = "";
      const loaded = await loadMe();
      if (!loaded) throw new Error("Não foi possível carregar seu contexto.");
      status = `Sessão iniciada como ${user?.name}.`;
      await tick();
      heading?.focus();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Não foi possível entrar.";
      status = "";
      await focusError();
    } finally {
      busy = false;
      loadingContext = false;
    }
  }

  async function createOrganization(event: SubmitEvent) {
    event.preventDefault();
    busy = true;
    loadingContext = true;
    error = "";
    status = "Criando organização…";
    pendingCommandId ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": pendingCommandId
        },
        body: JSON.stringify({ name: organizationName })
      });
      if (!response.ok) throw await errorFromResponse(response, "Não foi possível criar a organização.");
      const body = await response.json();
      if (!body.organization || !body.membership || body.membership.role !== "admin") {
        throw new Error("A resposta da organização está inválida.");
      }
      const loaded = await loadMe();
      if (!loaded) throw new Error("Não foi possível carregar a organização criada.");
      organizationName = "";
      pendingCommandId = null;
      status = `Organização ${body.organization.name} criada. Você é o primeiro administrador.`;
      await tick();
      heading?.focus();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Não foi possível criar a organização.";
      status = "";
      await focusError();
    } finally {
      busy = false;
      loadingContext = false;
    }
  }

  async function switchActiveOrganization(event: Event) {
    const organizationId = (event.currentTarget as HTMLSelectElement).value;
    const previousOrganizationId = me?.activeOrganizationId ?? "";
    if (!organizationId || organizationId === previousOrganizationId || !me) return;

    busy = true;
    error = "";
    status = "Trocando organização…";
    try {
      const response = await fetch("/api/me/active-organization", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ organizationId })
      });
      if (!response.ok) throw await errorFromResponse(response, "Não foi possível trocar a organização.");
      const body: unknown = await response.json();
      if (
        !body ||
        typeof body !== "object" ||
        (body as { activeOrganizationId?: unknown }).activeOrganizationId !== organizationId ||
        !isMembershipRole((body as { activeOrganizationRole?: unknown }).activeOrganizationRole)
      ) {
        throw new Error("A resposta da organização ativa está inválida.");
      }

      const activeOrganizationRole = (body as { activeOrganizationRole: MembershipRole }).activeOrganizationRole;
      me = { ...me, activeOrganizationId: organizationId, activeOrganizationRole };
      selectedOrganizationId = organizationId;
      status = `Organização ativa: ${me.organizations.find((entry) => entry.id === organizationId)?.name ?? "selecionada"}.`;
    } catch (cause) {
      selectedOrganizationId = previousOrganizationId;
      error = cause instanceof Error ? cause.message : "Não foi possível trocar a organização.";
      status = "";
      await focusError();
    } finally {
      busy = false;
    }
  }

  async function associateMember(event: SubmitEvent) {
    event.preventDefault();
    const organizationId = me?.activeOrganizationId;
    if (!organizationId || me?.activeOrganizationRole !== "admin") {
      error = "Somente um administrador da organização ativa pode associar membros.";
      status = "";
      await focusError();
      return;
    }

    busy = true;
    error = "";
    status = "Associando membro…";
    pendingMemberCommandId ??= crypto.randomUUID();
    try {
      const response = await fetch(`/api/organizations/${organizationId}/members`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": pendingMemberCommandId
        },
        body: JSON.stringify({ userId: memberUserId.trim(), role: memberRole })
      });
      if (!response.ok) throw await errorFromResponse(response, "Não foi possível associar o membro.");

      const body: unknown = await response.json();
      if (
        !body ||
        typeof body !== "object" ||
        (body as { organizationId?: unknown }).organizationId !== organizationId ||
        (body as { userId?: unknown }).userId !== memberUserId.trim() ||
        (body as { role?: unknown }).role !== memberRole
      ) {
        throw new Error("A resposta da associação está inválida.");
      }

      const loaded = await loadMe();
      if (!loaded) throw new Error("Não foi possível atualizar seu contexto.");
      memberUserId = "";
      pendingMemberCommandId = null;
      status = `Membro associado como ${memberRole}.`;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Não foi possível associar o membro.";
      status = "";
      await focusError();
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head>
  <title>IncidentLab</title>
  <meta name="description" content="Laboratório de detecção e resposta a incidentes" />
</svelte:head>

<main>
  <header>
    <p class="eyebrow">IncidentLab</p>
    <h1 bind:this={heading} tabindex="-1">{user ? "Seu laboratório" : "Entre no laboratório"}</h1>
    <p class="lede">
      {user
        ? "Escolha o contexto de trabalho e confira seu papel antes de operar."
        : "Use a identidade de demonstração provisionada no ambiente local."}
    </p>
  </header>

  {#if error}
    <p id="form-error" bind:this={errorSummary} class="message error" role="alert" tabindex="-1">{error}</p>
  {/if}
  <p class="message" role="status" aria-live="polite" aria-atomic="true">{status}</p>

  {#if loadingContext}
    <section aria-live="polite" aria-busy="true">
      <p>Carregando seu contexto…</p>
    </section>
  {:else if user && me && me.organizations.length === 0}
    <form onsubmit={createOrganization} aria-busy={busy}>
      <p class="eyebrow">Primeiro acesso</p>
      <h2 id="create-organization">Crie sua organização</h2>
      <p>A organização será o limite de acesso para serviços e incidentes.</p>
      <label for="organization-name">Nome da organização <span>(obrigatório)</span></label>
      <input id="organization-name" name="organization-name" type="text" bind:value={organizationName} required maxlength="120" autocomplete="organization" aria-describedby={error ? "form-error" : undefined} disabled={busy} />
      <button type="submit" disabled={busy}>{busy ? "Criando…" : "Criar organização"}</button>
    </form>
  {:else if user && me}
    <section aria-labelledby="context-heading">
      <p class="eyebrow">Contexto atual</p>
      <h2 id="context-heading">{me.organizations.find((entry) => entry.id === me?.activeOrganizationId)?.name ?? "Sem organização ativa"}</h2>
      <p>Você está conectado como <strong>{me.user.name}</strong> ({me.user.email}).</p>

      <label for="active-organization">Organização ativa</label>
      <select id="active-organization" bind:value={selectedOrganizationId} onchange={switchActiveOrganization} disabled={busy}>
        <option value="" disabled>Selecione uma organização</option>
        {#each me.organizations as entry}
          <option value={entry.id}>{entry.name} — {entry.role}</option>
        {/each}
      </select>

      <p class="role-summary">Papel atual: <strong>{me.activeOrganizationRole ?? "sem papel"}</strong>.</p>

      <div class="organization-list">
        <p class="eyebrow">Seus vínculos</p>
        <ul aria-label="Organizações e papéis">
          {#each me.organizations as entry}
            <li><strong>{entry.name}</strong><span>{entry.role}</span></li>
          {/each}
        </ul>
      </div>
    </section>

    {#if me.activeOrganizationId && me.activeOrganizationRole === "admin"}
      <form onsubmit={associateMember} aria-busy={busy} aria-labelledby="associate-member-heading">
        <p class="eyebrow">Administração</p>
        <h2 id="associate-member-heading">Associar membro</h2>
        <p>Use o ID de uma identidade já conhecida pelo sistema.</p>
        <label for="member-user-id">ID do usuário <span>(obrigatório)</span></label>
        <input id="member-user-id" name="member-user-id" type="text" bind:value={memberUserId} required autocomplete="off" aria-describedby={error ? "form-error" : undefined} disabled={busy} />

        <label for="member-role">Papel</label>
        <select id="member-role" name="member-role" bind:value={memberRole} disabled={busy}>
          <option value="respondente">Respondente — pode operar incidentes</option>
          <option value="visualizador">Visualizador — somente consulta</option>
        </select>
        <button type="submit" disabled={busy}>{busy ? "Associando…" : "Associar membro"}</button>
      </form>
    {/if}
  {:else}
    <form onsubmit={login} aria-busy={busy}>
      <label for="email">E-mail <span>(obrigatório)</span></label>
      <input id="email" name="email" type="email" bind:value={email} required autocomplete="username" aria-describedby={error ? "form-error" : undefined} disabled={busy} />

      <label for="password">Senha <span>(obrigatório)</span></label>
      <input id="password" name="password" type="password" bind:value={password} required autocomplete="current-password" aria-describedby={error ? "form-error" : undefined} disabled={busy} />

      <button type="submit" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
    </form>
  {/if}
</main>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) {
    margin: 0;
    color: #292621;
    background: #f4f0e8;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  :global(button), :global(input) { font: inherit; }
  main { width: min(100% - 2rem, 42rem); margin: 0 auto; padding: 12vh 0 4rem; }
  header { margin-bottom: 2.5rem; }
  h1 { max-width: 12ch; margin: .4rem 0 1rem; font: 600 clamp(2.6rem, 8vw, 5rem)/.95 Georgia, serif; letter-spacing: -.05em; }
  h2 { margin: .35rem 0 .75rem; font: 600 2rem/1.1 Georgia, serif; }
  p { line-height: 1.6; }
  .eyebrow { margin: 0; color: #70695f; font-size: .78rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  .lede { max-width: 42rem; color: #625c53; font-size: 1.08rem; }
  form, section { display: grid; gap: .75rem; padding: 1.5rem; border: 1px solid #d7d0c5; background: #faf8f3; }
  label { margin-top: .35rem; font-weight: 650; }
  label span { color: #70695f; font-size: .85em; font-weight: 500; }
  input, select { width: 100%; min-height: 3rem; padding: .7rem .8rem; border: 1px solid #938a7e; border-radius: .25rem; background: #fff; color: inherit; }
  input:focus-visible, select:focus-visible, button:focus-visible { outline: 3px solid #315c4b; outline-offset: 3px; }
  button { min-height: 3rem; margin-top: .75rem; padding: .7rem 1rem; border: 0; border-radius: .25rem; color: #fff; background: #315c4b; font-weight: 700; cursor: pointer; }
  button:hover { background: #24483a; }
  button:disabled { cursor: wait; opacity: .65; }
  .message { min-height: 1.6rem; }
  .error { color: #8a2525; font-weight: 650; }
  .role-summary { margin-bottom: 0; }
  .organization-list { display: grid; gap: .25rem; margin-top: .75rem; padding-top: 1rem; border-top: 1px solid #d7d0c5; }
  .organization-list .eyebrow { margin-bottom: .25rem; }
  .organization-list ul { display: grid; gap: .25rem; margin: 0; padding: 0; list-style: none; }
  .organization-list li { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: baseline; gap: .25rem 1rem; margin: 0; }
  .organization-list li strong { overflow-wrap: anywhere; }
  .organization-list span { color: #625c53; }
  @media (max-width: 36rem) {
    main { padding-top: 4rem; }
    .organization-list li { grid-template-columns: 1fr; gap: 0; }
  }
</style>
