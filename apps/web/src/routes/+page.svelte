<script lang="ts">
  import { tick } from "svelte";

  type User = { id: string; email: string; name: string };
  type Organization = { id: string; name: string; createdAt: string };

  let user = $state<User | null>(null);
  let organization = $state<Organization | null>(null);
  let email = $state("");
  let password = $state("");
  let organizationName = $state("");
  let pendingCommandId = $state<string | null>(null);
  let busy = $state(false);
  let error = $state("");
  let status = $state("");
  let heading: HTMLHeadingElement;
  let errorSummary: HTMLParagraphElement;

  async function login(event: SubmitEvent) {
    event.preventDefault();
    busy = true;
    error = "";
    status = "Entrando…";
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error("E-mail ou senha inválidos.");
      const body = await response.json();
      user = body.user;
      password = "";
      status = `Sessão iniciada como ${user?.name}.`;
      await tick();
      heading.focus();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Não foi possível entrar.";
      status = "";
      await tick();
      errorSummary.focus();
    } finally {
      busy = false;
    }
  }

  async function createOrganization(event: SubmitEvent) {
    event.preventDefault();
    busy = true;
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
      if (!response.ok) throw new Error("Não foi possível criar a organização.");
      const body = await response.json();
      organization = body.organization;
      organizationName = "";
      pendingCommandId = null;
      status = `Organização ${organization?.name} criada. Você é o primeiro administrador.`;
      await tick();
      heading.focus();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Não foi possível criar a organização.";
      status = "";
      await tick();
      errorSummary.focus();
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
    <h1 bind:this={heading} tabindex="-1">{user ? "Crie sua organização" : "Entre no laboratório"}</h1>
    <p class="lede">
      {user
        ? "A organização será o limite de acesso para serviços e incidentes."
        : "Use a identidade de demonstração provisionada no ambiente local."}
    </p>
  </header>

  {#if error}
    <p id="form-error" bind:this={errorSummary} class="message error" role="alert" tabindex="-1">{error}</p>
  {/if}
  <p class="message" role="status" aria-live="polite" aria-atomic="true">{status}</p>

  {#if organization}
    <section aria-labelledby="organization-created">
      <p class="eyebrow">Organização ativa</p>
      <h2 id="organization-created">{organization.name}</h2>
      <p>Seu vínculo foi criado com o papel <strong>admin</strong>.</p>
    </section>
  {:else if user}
    <form onsubmit={createOrganization} aria-busy={busy}>
      <label for="organization-name">Nome da organização <span>(obrigatório)</span></label>
      <input id="organization-name" name="organization-name" type="text" bind:value={organizationName} required maxlength="120" autocomplete="organization" aria-describedby={error ? "form-error" : undefined} />
      <button type="submit" disabled={busy}>{busy ? "Criando…" : "Criar organização"}</button>
    </form>
  {:else}
    <form onsubmit={login} aria-busy={busy}>
      <label for="email">E-mail <span>(obrigatório)</span></label>
      <input id="email" name="email" type="email" bind:value={email} required autocomplete="username" aria-describedby={error ? "form-error" : undefined} />

      <label for="password">Senha <span>(obrigatório)</span></label>
      <input id="password" name="password" type="password" bind:value={password} required autocomplete="current-password" aria-describedby={error ? "form-error" : undefined} />

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
  input { width: 100%; min-height: 3rem; padding: .7rem .8rem; border: 1px solid #938a7e; border-radius: .25rem; background: #fff; color: inherit; }
  input:focus-visible, button:focus-visible { outline: 3px solid #315c4b; outline-offset: 3px; }
  button { min-height: 3rem; margin-top: .75rem; padding: .7rem 1rem; border: 0; border-radius: .25rem; color: #fff; background: #315c4b; font-weight: 700; cursor: pointer; }
  button:hover { background: #24483a; }
  button:disabled { cursor: wait; opacity: .65; }
  .message { min-height: 1.6rem; }
  .error { color: #8a2525; font-weight: 650; }
  @media (max-width: 36rem) { main { padding-top: 4rem; } }
</style>
