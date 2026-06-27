<script setup lang="ts">
const pc = useMobilePc();
</script>

<template>
  <main class="min-h-screen bg-paper">
    <section class="border-b border-ink/10 bg-ink text-paper">
      <div class="mx-auto flex min-h-[26vh] max-w-5xl flex-col justify-end px-5 pb-7 pt-8">
        <p class="text-sm uppercase tracking-[0.18em] text-paper/65">MobilePC-Agent</p>
        <h1 class="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
          Control your Windows PC from a mobile prompt.
        </h1>
        <p class="mt-4 max-w-2xl text-base leading-7 text-paper/75">
          Tasks relay through the API, execute locally on the paired desktop agent, and stream logs back here.
        </p>
      </div>
    </section>

    <section class="mx-auto grid max-w-5xl gap-4 px-5 py-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div class="space-y-4">
        <div class="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">Pairing</h2>
              <p class="text-sm text-ink/60">Create a short-lived device secret for the Windows agent.</p>
            </div>
            <span class="rounded-full bg-signal/10 px-3 py-1 text-xs font-medium text-signal">{{ pc.status.value }}</span>
          </div>

          <div class="mt-4 grid gap-3">
            <button class="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white active:scale-[0.99]" @click="pc.createPairing">
              Create pairing
            </button>
            <button class="rounded-md border border-ink/15 px-4 py-3 text-sm font-semibold active:scale-[0.99]" :disabled="!pc.mobileToken.value" @click="pc.connectMobile">
              Connect mobile socket
            </button>
          </div>

          <dl class="mt-4 grid gap-3 text-sm">
            <div class="rounded-md bg-paper p-3">
              <dt class="text-ink/55">Pair code</dt>
              <dd class="mt-1 break-all font-mono text-lg font-semibold">{{ pc.pairCode.value }}</dd>
            </div>
            <div class="rounded-md bg-paper p-3">
              <dt class="text-ink/55">Agent .env</dt>
              <dd class="mt-1 break-all font-mono text-xs leading-5">
                DEVICE_ID={{ pc.deviceId.value }}<br>
                AGENT_TOKEN={{ pc.agentToken.value }}
              </dd>
            </div>
          </dl>
        </div>

        <div v-if="pc.approval.value" class="rounded-md border border-caution/30 bg-white p-4 shadow-sm">
          <h2 class="text-lg font-semibold text-caution">Approval required</h2>
          <p class="mt-2 text-sm text-ink/70">{{ pc.approval.value.reason }}</p>
          <div class="mt-4 grid grid-cols-2 gap-3">
            <button class="rounded-md border border-ink/15 px-4 py-3 text-sm font-semibold" @click="pc.decideApproval(false)">
              Deny
            </button>
            <button class="rounded-md bg-caution px-4 py-3 text-sm font-semibold text-white" @click="pc.decideApproval(true)">
              Approve
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">Task</h2>
              <p class="text-sm text-ink/60">Send the first demo prompt to the paired PC.</p>
            </div>
            <span class="text-xs text-ink/50">{{ pc.connected.value ? "socket online" : "socket offline" }}</span>
          </div>
          <textarea
            v-model="pc.prompt.value"
            class="mt-4 min-h-32 w-full resize-none rounded-md border border-ink/15 bg-paper p-3 text-sm leading-6 outline-none focus:border-steel"
          />
          <button class="mt-3 w-full rounded-md bg-signal px-4 py-3 text-sm font-semibold text-white active:scale-[0.99]" @click="pc.submitTask">
            Run on PC
          </button>
        </div>

        <div class="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Live logs</h2>
            <span class="font-mono text-xs text-ink/45">{{ pc.activeTaskId.value }}</span>
          </div>
          <div class="mt-4 max-h-[38vh] min-h-48 space-y-2 overflow-auto">
            <p v-if="pc.logs.value.length === 0" class="text-sm text-ink/55">No logs yet.</p>
            <div v-for="line in pc.logs.value" :key="line.id" class="rounded-md bg-paper px-3 py-2">
              <div class="flex items-center justify-between gap-3">
                <span class="text-xs font-semibold uppercase text-steel">{{ line.level }}</span>
                <time class="text-xs text-ink/45">{{ new Date(line.at).toLocaleTimeString() }}</time>
              </div>
              <p class="mt-1 text-sm leading-6">{{ line.message }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <h2 class="text-lg font-semibold">Results</h2>
          <p class="mt-2 text-sm text-ink/60">Recording and capture artifact paths reported by the local agent.</p>
          <ul class="mt-3 space-y-2 text-sm">
            <li v-for="artifact in pc.artifacts.value" :key="artifact" class="break-all rounded-md bg-paper p-3 font-mono text-xs">
              {{ artifact }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>
