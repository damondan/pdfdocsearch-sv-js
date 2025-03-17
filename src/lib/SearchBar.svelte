<script>
	import { browser } from '$app/environment';
	import { createEventDispatcher } from 'svelte';
	import { searchQueryWritable } from '$lib/store.js';

	let searchQuery = $state('');
	let previousSearches = $state([]);
	let { selectedSubject, pdfBookTitles } = $props();
	let showDropdown = $state('false');
    let loading = $state(false);

	const dispatch = createEventDispatcher();

  // THis is a dispatch to the parent +page.svelte. 
	async function handleSearchDispatch() {
		searchQueryWritable.set(searchQuery);
		if (!searchQuery.trim()) {
			console.error('Search query is empty');
			return;
		}

    loading = true;
    dispatch('loadingChange', loading); // Notify parent about loading state

		// Update previousSearches (keep only last 5)
		if (!previousSearches.includes(searchQuery)) {
			previousSearches = [searchQuery, ...previousSearches].slice(0, 5);
		}
		console.log('pdf book titles ', pdfBookTitles);
		// Prepare payload for POST request
		const payload = {
			selectedSubject,
			searchQuery,
			pdfBookTitles
		};
		console.log('Payload before fetch:', payload);
		console.log('JSON Payload:', JSON.stringify(payload));
		try {
			// Send POST request to Express server
			const response = await fetch('http://localhost:3001/api/searchquery', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				console.log('Server error: in response ok false');
				throw new Error(`Server error: ${response.status}`);
			}

			const result = await response.json();
			console.log('Search results:', result);

			loading = false;
			dispatch('loadingChange', loading); // Notify parent search is done
			// Optionally dispatch results to parent
			dispatch('searchResults', result);

			// Clear input and hide dropdown after successful search
			searchQuery = '';
			showDropdown = false;
		} catch (error) {
			console.error('Error in handleSearch:', error);
			loading = false;
      		dispatch('loadingChange', loading);
		}
	}

	// Show dropdown if there are previous searches
	const handleInputClick = () => {
		if (previousSearches.length > 0) {
			showDropdown = true;
		}
	};

	/**
	 * Handles selecting a search term from the dropdown.
	 * @param {string} term - The search term selected
	 */
	const handleSelectSearch = (term) => {
		console.log('Selected:', term);
		searchQuery = term; // Populate input with selected term
		showDropdown = false; // Hide dropdown
	};

	const handleClickOutside = (event) => {
		const dropdown = document.getElementById('search-dropdown');
		const inputField = document.getElementById('search');
		if (dropdown?.contains(event.target) == false && inputField?.contains(event.target) == false) {
			showDropdown = false; // Hide dropdown if clicked outside
		}
	};

	const handleDelete = (searchTerm) => {
		previousSearches = previousSearches.filter((t) => t !== searchTerm);
	};

	// Close dropdown if clicked outside
	if (browser) {
		window.addEventListener('click', handleClickOutside);
	}
</script>

<div class="search-bar">
	<!-- Input Field with Click Event -->
	<input
		type="text"
		id="search"
		name="search"
		placeholder="Search..."
		bind:value={searchQuery}
		on:click={handleInputClick}
    	autocomplete="off"
	/>

	<!-- Search Button -->
	<button on:click={handleSearchDispatch}>Search</button>

  {#if loading}
    <div class="spinner"></div>
  {/if}

	<!-- Dropdown Menu -->
	{#if showDropdown && previousSearches.length > 0}
		<ul id="search-dropdn" class="dropdn-menu">
			{#each previousSearches as term}
				<li on:click={() => handleSelectSearch(term)}>
					{term}
					<button class="searchquery-delete" on:click|stopPropagation={() => handleDelete(term)}
						>X</button
					>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style lang="scss">
	.search-bar {
		display: flex;
		gap: 10px;
		position: relative; /* Anchor for absolute dropdown */
		margin-left:20%;
		margin-right:20%;
		box-shadow: 0 8px 8px rgba(0, 0, 0, 0.2);
		input {
			padding: 8px;
			font-size: 18px;
			border: 1px solid #ccc;
			border-radius: 4px;
			flex-grow: 1; /* Stretch input to fill space */
			font-family: 'Cursive',Comic sans-serif;
		}

		button {
			padding: 8px 16px;
			background-color: #0056b3;
			color: white;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 18px;
			font-family: 'Cursive',Comic sans-serif;
			box-shadow: 0 8px 8px rgba(0, 0, 0, 0.2);
			&:hover {
				background-color: rgb(15, 41, 175);
			}
		}

		.dropdn-menu {
			position: absolute;
			top: 100%; /* Position below input */
			left: 0;
			width: 100%; /* Match input width */
			background-color: #fff; /* White background */
			list-style: none;
			padding: 5px 0; /* Padding around list */
			margin: 0;
			z-index: 10; /* semi-colon expectedscss(css-semicolonexpected)Overlay other content */
			box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); 
		}

		#search-dropdn li {
			padding: 8px 12px; /* Rectangular padding */
			border: 1px solid #000; /* Black border */
			margin: 2px 5px; /* Space between items */
			cursor: pointer;
			background-color: #f9f9f9; /* Light background for contrast */
			&:hover {
				background-color: #e0e0e0; /* Hover effect */
			}
			.searchquery-delete {
				float: right;
				padding: 0 5px;
				background-color: #ff4d4d;
				color: white;
				border: none;
				border-radius: 4px;
				cursor: pointer;
				&:hover {
					background-color: #cc0000;
				}
			}
		}
	}
</style>
