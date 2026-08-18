
<form>
	<input
		type="text"
		class="search-input search"
		placeholder="Search"
	/>
	<p></p>
	<select >
		<option value="scramjet">Scramjet</option>
		<option value="prism">Scramjet v2</option>
		<option value="uv">Ultraviolet</option>
	</select>
	<select >
		<option value="libcurl">Libcurl</option>
		<option value="epoxy">Epoxy</option>
	</select>
</form>
<iframe ></iframe>

<style>
	:global(body) {
		height: 100vh;
		width: 100vw;
		margin: 0;
		border: none;
		display: flex;
		flex-direction: column;
	}
	iframe {
		width: 100%;
		flex-grow: 1;
		border: none;
		margin: 0;
	}
	.loading-status {
		padding: 16px;
		font-family: var(--font-family-body);
		color: var(--color-text);
	}
	.loading-title {
		margin: 0 0 8px;
		font-weight: bold;
	}
	.loading-item {
		margin: 4px 0;
		color: var(--color-text-subtle);
	}
	.loading-check {
		color: var(--color-pin);
	}
	.loading-pending {
		color: var(--color-text-subtle);
	}
</style>
