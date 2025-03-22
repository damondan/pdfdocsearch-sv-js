<script>
	import { browser } from "$app/environment";
	import { createEventDispatcher } from "svelte";
	import { searchQueryWritable } from "$lib/store.js";
	import { previousSearchesWritable } from "$lib/store.js";
	let searchQuery = $state("");
	//let previousSearches = $state([]);
	let { selectedSubject, pdfBookTitles } = $props();
	let showDropdown = $state(false);
	let loading = $state(false);

	const dispatch = createEventDispatcher();

	// THis is a dispatch to the parent +page.svelte.
	async function handleSearchDispatch() {
		searchQueryWritable.set(searchQuery);
		if (!searchQuery.trim()) {
			console.error("Search query is empty");
			return;
		}

		updateSearch(searchQuery);

		console.log("pdf book titles ", pdfBookTitles);
	
		const payload = {
			selectedSubject,
			searchQuery,
			pdfBookTitles,
		};
		console.log("Payload before fetch:", payload);
		console.log("JSON Payload:", JSON.stringify(payload));
		console.log("pdfBookTitles length is " + pdfBookTitles.length);
		console.log("pdfBookTitles is " + pdfBookTitles);
		console.log(typeof pdfBookTitles);  // Check the type of pdfBookTitles
		console.log(Array.isArray(pdfBookTitles)); 
		console.log(Object.keys(pdfBookTitles));
		pdfBookTitles = Array.from(pdfBookTitles);
		//Object.keys(pdfBookTitles).length <= 25 && Object.keys(pdfBookTitles).length != 0
		if (pdfBookTitles.length != 0 && pdfBookTitles.length <= 25) {
			loading = true;
			dispatch("loadingChange", loading); 

			try {
				const timeoutPromise = new Promise((_, reject) => {
					setTimeout(() => {
						reject(new Error('Search timed out after 1 minute'));
					}, 5000); // 60,000 milliseconds = 1 minute - 60000,5000
				});

				const fetchPromise = fetch('http://localhost:3001/api/searchquery', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				}).then((response) => {
					if (!response.ok) {
						console.log('Server error: in response ok false');
						throw new Error(`Server error: ${response.status}`);
					}
					return response.json();
				});
			
				const result = await Promise.race([fetchPromise, timeoutPromise]);

				console.log('Search results:', result);

				loading = false;
				dispatch('loadingChange', loading); // Notify parent search is done
				dispatch('searchResults', result);

				// Clear input and hide dropdown after successful search
				searchQuery = '';
				showDropdown = false;

			} catch (error) {
				console.error('Error in handleSearch:', error);
				loading = false;
				dispatch('loadingChange', loading);

				if (error.message === 'Search timed out after 1 minute') {
					console.log("error.message");
					dispatch('searchTimeout', 'Search took too long'); 
				}
			}//catch
		} else {
			console.log("in else too big");
			loading = false;
			dispatch('loadingChange', loading);
			dispatch('searchResults', 'booksOverLimit');
		}
	}

	// Show dropdown if there are previous searches
	const handleInputClick = () => {
		if ($previousSearchesWritable.length > 0) {
			showDropdown = true;
		}
	};

	/**
	 * Handles selecting a search term from the dropdown.
	 * @param {string} term - The search term selected
	 */
	const handleSelectSearch = (term) => {
		console.log("Selected:", term);
		searchQuery = term; // Populate input with selected term
		showDropdown = false; // Hide dropdown
	};

	const handleClickOutside = (event) => {
		const dropdown = document.getElementById("search-dropdn");
		const inputField = document.getElementById("search");
		if (
			dropdown?.contains(event.target) == false &&
			inputField?.contains(event.target) == false
		) {
			showDropdown = false; // Hide dropdown if clicked outside
		}
	};

	function handleInputKeydown(event) {
		if (event.key === "Enter") {
			console.log("Enter key pressed");
			handleSearchDispatch();
		}
	}

	const handleDelete = (searchTerm) => {
		previousSearchesWritable.update((searches) => {
			return searches.filter((term) => term !== searchTerm);
		});
	};

	function updateSearch(searchWord){
		previousSearchesWritable.update(searches => {
		if (!searches.includes(searchWord)) {
			searches = [searchWord, ...searches].slice(0, 10);
		}
		return searches;
		});
	}

	// Close dropdown if clicked outside
	if (browser) {
		window.addEventListener("click", handleClickOutside);
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
		on:keydown={handleInputKeydown}
		autocomplete="off"
	/>

	<!-- Search Button -->
	<button on:click={handleSearchDispatch}>Search</button>

	{#if loading}
		<div class="spinner"></div>
	{/if}

	<!-- Dropdown Menu -->
	{#if showDropdown && $previousSearchesWritable.length > 0}
		<ul id="search-dropdn" class="dropdn-menu">
			{#each $previousSearchesWritable as term}
				<li on:click={() => handleSelectSearch(term)}>
					{term}
					<button
						class="searchquery-delete"
						on:click|stopPropagation={() => handleDelete(term)}
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
		gap: 5px;
		position: relative; /* Anchor for absolute dropdown */
		margin-left: 20%;
		margin-right: 20%;
		box-shadow: 0 8px 8px rgba(0, 0, 0, 0.2);
		input {
			flex-grow: 1; /* Stretch input to fill space */
			font-family:
				"Cursive",
				Comic sans-serif;
			font-size: 18px;
			padding: 8px;
			border: 1px solid #ccc;
			border-radius: 4px;
		}

		button {
			background-color: #0056b3;
			color: white;
			padding: 8px 16px;
			border: none;
			border-radius: 4px;
			font-family:
				"Cursive",
				Comic sans-serif;
			font-size: 18px;
			box-shadow: 0 8px 8px rgba(0, 0, 0, 0.2);
			&:hover {
				background-color: rgb(15, 41, 175);
			}
			cursor: pointer;
		}

		.dropdn-menu {
			position: absolute;
			background-color: #fff; /* White background */
			top: 100%; /* Position below input */
			left: 0;
			border-radius: 4px;
			width: 240px; /* Match input width */
			list-style: none;
			padding: 5px 0; /* Padding around list */
			margin: 0;
			z-index: 10; /* semi-colon expectedscss(css-semicolonexpected)Overlay other content */
			box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
		}

		#search-dropdn li {
			background-color: #f9f9f9;
			padding: 8px 12px; /* Rectangular padding */
			border: 1px solid #000; /* Black border */
			border-radius: 4px;
			margin: 2px 5px; /* Space between items */
			&:hover {
				background-color: #e0e0e0; /* Hover effect */
			}
			cursor: pointer;

			.searchquery-delete {
				background-color: #ff4d4d;
				color: white;
				float: right;
				padding: 0 4px;
				border: none;
				border-radius: 4px;
				&:hover {
					background-color: #cc0000;
				}
				cursor: pointer;
			}
		}
	}
</style>
