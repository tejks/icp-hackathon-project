<script lang="ts">
	import clsx from 'clsx';

	interface DecimalInputProps {
		class?: string;
		placeholder?: string;
		value?: number;
		required?: boolean;
		name: string;
		className?: string;
	}

	let {
		class: className,
		placeholder,
		value,
		required,
		name,
		className: cls
	}: DecimalInputProps = $props();

	function onKeyDown(event: KeyboardEvent) {
		const key = event.key;

		const isNumeric = /^[0-9]$/.test(key);
		const isDecimalSeparator = key === '.' || key === ',';
		const isBackspace = key === 'Backspace';

		if (!(isNumeric || isDecimalSeparator || isBackspace)) {
			event.preventDefault();
		}

		// Allow only one decimal separator
		if (
			isDecimalSeparator &&
			(value?.toString().includes('.') || value?.toString().includes(','))
		) {
			event.preventDefault();
		}
	}
</script>

<div class="rounded-lg border-2 border-gradient-to-r from-primary to-secondary">
	<input
		class={clsx(
			'w-full rounded-3xl bg-transparent px-3 py-2 text-sm text-neutral-600 font-normal placeholder-primary placeholder:italic placeholder:text-slate-400 lg:px-4 lg:py-2 lg:text-base',
			className
		)}
		{name}
		autocomplete="off"
		onkeydown={onKeyDown}
		type="text"
		bind:value
		{placeholder}
		pattern="^[0-9]*[.,]?[0-9]$"
		{required}
	/>
</div>
