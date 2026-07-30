<script>
	import '$lib/style/settings.css';
	import uploadImg from '$lib/img/icons/upload.png';
	import { downloadSnapshot, importOrigin, readManifest } from 'origin-snapshot';

	let includeSession = $state(false);
	let busy = $state(false);
	let exportMsg = $state(null);
	let importMsg = $state(null);
	let pending = $state(null);

	function formatDate(iso) {
		try {
			return new Date(iso).toLocaleString();
		} catch {
			return 'an unknown date';
		}
	}

	async function exportData() {
		if (busy) return;
		busy = true;
		exportMsg = null;
		try {
			await downloadSnapshot({ sessionStorage: includeSession });
			exportMsg = { type: 'ok', text: 'Snapshot downloaded.' };
		} catch (error) {
			exportMsg = { type: 'error', text: 'Export failed: ' + (error?.message ?? error) };
		} finally {
			busy = false;
		}
	}

	async function pickImport(event) {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file || busy) return;
		importMsg = null;
		try {
			const manifest = await readManifest(file);
			pending = { file, manifest };
		} catch {
			pending = null;
			importMsg = { type: 'error', text: "That file isn't a valid snapshot." };
		}
	}

	async function confirmImport() {
		if (!pending || busy) return;
		busy = true;
		try {
			await importOrigin(pending.file);
			importMsg = { type: 'ok', text: 'Restored. Reload the page to see your data.' };
			pending = null;
		} catch (error) {
			importMsg = { type: 'error', text: 'Import failed: ' + (error?.message ?? error) };
		} finally {
			busy = false;
		}
	}
</script>

<h1>Data</h1>
<div class="group">
	<div class="subGroup">
		<p class="subHeading">Export</p>
		<p class="desc">
			Bundle your localStorage, IndexedDB, and game saves into a single file you can back up or move
			to another device.
		</p>
		<div class="content">
			<button class="actionBtn" onclick={exportData} disabled={busy}>
				{busy ? 'Exporting…' : 'Export Data'}
			</button>
			<button
				class="toggleBtn"
				class:active={includeSession}
				onclick={() => (includeSession = !includeSession)}>Include session storage</button
			>
		</div>
		{#if exportMsg}
			<p
				class="desc statusMsg"
				class:statusError={exportMsg.type === 'error'}
				class:statusOk={exportMsg.type === 'ok'}
			>
				{exportMsg.text}
			</p>
		{/if}
	</div>

	<div class="subGroup">
		<p class="subHeading">Import</p>
		<p class="desc">
			Restore a snapshot saved from this site. This replaces your current data, so export a backup
			first if you're unsure.
		</p>
		<div class="content">
			<label class="actionBtn">
				<img class="icons" src={uploadImg} alt="" />
				Choose File
				<input type="file" accept=".galaxy,application/octet-stream" hidden onchange={pickImport} />
			</label>
		</div>

		{#if pending}
			<p class="desc">
				Restore from <strong>{pending.manifest.origin ?? 'an unknown origin'}</strong>, saved {formatDate(
					pending.manifest.createdAt
				)}?
			</p>
			<div class="content">
				<button class="actionBtn active" onclick={confirmImport} disabled={busy}>
					{busy ? 'Restoring…' : 'Restore'}
				</button>
				<button class="toggleBtn" onclick={() => (pending = null)} disabled={busy}>Cancel</button>
			</div>
		{/if}

		{#if importMsg}
			<p
				class="desc statusMsg"
				class:statusError={importMsg.type === 'error'}
				class:statusOk={importMsg.type === 'ok'}
			>
				{importMsg.text}
			</p>
		{/if}
	</div>
</div>

<style>
	.statusMsg {
		font-weight: 700;
	}
	.statusError {
		color: #ff6b6b;
	}
	.statusOk {
		color: #4ade80;
	}
	.actionBtn:disabled {
		opacity: 0.55;
		pointer-events: none;
	}
</style>
