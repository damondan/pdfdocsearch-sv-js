<script>
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	import SearchBar from "$lib/SearchBar.svelte";
	import PdfBlock from "$lib/PdfBlock.svelte";
	import Footer from "$lib/Footer.svelte";
	import { PdfBookResult } from "$lib/classes/PdfBookResult.js";
	import { searchQueryWritable } from "$lib/store.js";

	/**
	 * @typedef {Object} ISearchData
	 * @property {string} message
	 * @property {Object.<string, Array<{pageNum: number, text: string}>>|null} results
	 * @property {number} total
	 */

	/** @type {string} */
	let selectedSubject = $state("");
	
	/** @type {{ data: { dataPdfSubjects: string[] } }} */
	let { data } = $props();
	
	/** @type {string[]} */
	let setDataPdfSubjects = data.dataPdfSubjects;
	
	/** @type {import('svelte/store').Writable<string[]>} */
	let pdfBooksGetFromSubject = writable([]);
	
	/** @type {string[]} */
	let pdfBookCheckFromPdfTab = $state([]);
	
	/** @type {ISearchData | string | null} */
	let mySearchData = $state(null);
	
	/** @type {boolean} */
	let isLoading = $state(false);
	
	/** @type {string[] | null} */
	let pdfBooksRetFromSearch = $state(null);
	
	/** @type {PdfBookResult[]} */
	let pdfBooksAsResultObjects = $state([]);
	
	/** @type {string} */
	let activeTab = $state("pdfs");
	
	/** @type {PdfBookResult[]} */
	let checkedResults = [];
	
	/** @type {boolean} */
	let isCheckAll = $state(false);
	
	/** @type {number} */
	let totalCount = $derived(pdfBooksAsResultObjects.length);

	// onMount - receives passed { data } = $props(); from +page.server.js - setDataPdfSubjects - these are Pdf
	// subjects and within is the pdf books or pdf content.
	onMount(() => {
		console.log("onMount")
		if (setDataPdfSubjects.length > 0) {
			selectedSubject = setDataPdfSubjects[0]; // Set default to the first subject
			handleLoadPdfTitlesFromSubject(selectedSubject); // Automatically trigger the fetch for the first subject
		}
	});

	// openTab - facilitates changing of the tabs of pdf and results
	/**
	 * Opens a specific tab
	 * @param {string} tabName - The name of the tab to open
	 */
	function openTab(tabName) {
		console.log("Open tab:", tabName);
		activeTab = tabName;
	}

	// handleSubjectChange - when there is a subject change, update the pdfs in the main body by
	// calling handleLoadPdfTitlesFromSubject
	/**
 * @param {Event} event - The change event
 */
function handleSubjectChange(event) {
    if (event.target) {
        const target = /** @type {HTMLSelectElement} */(event.target);
        const subject = target.value;
        selectedSubject = subject;
        if (subject) {
            handleLoadPdfTitlesFromSubject(subject);
        } else {
            pdfBooksGetFromSubject.set([]);
        }
    }
}

	//handleLoadPdfTitlesFromSubject - takes a subject as argument and calls the node.js docker container api
	//to return just the titles of those pdf books by subject or folder name
	/**
	 * Loads PDF titles for a given subject
	 * @param {string} subject - The subject to load PDF titles for
	 * @returns {Promise<void>}
	 */
	async function handleLoadPdfTitlesFromSubject(subject) {
		console.log("In handleLoadPdfTitlesFromSubject");
		try {
			//for local
			// const response = await fetch(
			// 	`http://localhost:3001/api/pdf-titles/${subject}`
			// );
			
			//for vercel
			 const response = await fetch(
			 	`/api/pdf-titles/${subject}`
			 );
			const data = await response.json();

			pdfBooksGetFromSubject.set(data || []);
		} catch (error) {
			console.error("Error fetching PDF titles:", error);
		}
	}

	//This refers to the spinner - it is an event listener for the +page.svelte component or parent that is set
	// in the SearchBar component below - on:loadingChange={handleLoadingChange}
	//SearchBar component dispatches - dispatch('loadingChange', loading); loading is a boolean.
	//Below there is an - if isLoading is true or false which displays the spinner.
	/**
	 * Handles loading state changes from SearchBar component
	 * @param {CustomEvent<boolean>} event - The loading change event
	 */
	function handleLoadingChange(event) {
		isLoading = event.detail;
	}

	//This is also an event listener for +page.svelte or the parent component to the SearchBar child component.
	//SearchBar below on:searchResults={handleLoadPdfDataFromPdfTab}. In SearchBar component - dispatch('searchResults', result);
	//The result is passed as searchResults and when that variable is set with the results, it executes the below
	//function through it being used as an event listener with the data in results. mySearchData, being json data,
	//is modified into an array format. Lastly, it steps through the array to input the pdf attributes into creating
	//a PdfBookResult object that is than stored into a pdfBooksAsResultObjects array.
	/**
	 * Handles search results from SearchBar component
	 * @param {CustomEvent} event - The search results event
	 */
		function handleLoadPdfDataFromPdfTab(event) {
		mySearchData = event.detail;
		console.log("IN HANDLELOADPDFDATAFROMPDFTAB");
		
		// First check if it's a string (error cases)
		if (typeof mySearchData === "string") {
			if (mySearchData === "noPdfCheckBoxesChecked") {
				console.log("NO Pdfs chosen");
				alert("Choose a Pdf.");
			} else if (mySearchData === "pdfsOverLimit") {
				alert("Pdf book search limit is 25");
			} else {
				alert("Search returned 0 for " + $searchQueryWritable);
			}
			return; // Exit early for string cases
		}
		
		// Now TypeScript knows mySearchData is ISearchData or null
		if (mySearchData && mySearchData.results != null && Object.keys(mySearchData.results).length > 0) {
			console.log("MYSEARCHDATA IF STATEMENT - NOT NULL AND LENGTH > 0 ");
			pdfBooksRetFromSearch = Object.keys(mySearchData.results);
			// Create PdfResult instances
			pdfBooksAsResultObjects = [];
			//for (const title of pdfTitlesReturned) {
			if (pdfBooksRetFromSearch != null) {
				for (let i = 0; i < pdfBooksRetFromSearch.length; i++) {
					const matches = mySearchData.results[pdfBooksRetFromSearch[i]];
					for (const { pageNum, text } of matches) {
						const sentence = findSentenceForPdfPage(
							text,
							$searchQueryWritable,
						);
						pdfBooksAsResultObjects.push(
							new PdfBookResult(
								pdfBooksRetFromSearch[i],
								pageNum,
								sentence,
								text,
							),
						);
					}
				}
			} else {
				console.log("PDFBOOKSASRESULTOBJECTS IS SET TO EMPTY");
				pdfBooksAsResultObjects = [];
			}
		} else {
			alert("Search returned 0 for " + $searchQueryWritable);
		}
	}

	//In clicking the Download button displayed in the Results tab, this function is executed. The checkedResults
	//data is initialized through the handleCheckboxChangeForPdfBlock function below. handleCheckboxChangeForPdfBlock is
	//an event listener for the +page.svelte component or parent to the PdfBlock component or child.
	//Below -> <PdfBlock {result} on:delete={handleDeleteForPdfBlock} on:change={(e) => handleCheckboxChangeForPdfBlock(result, e)}
	//checkedResults is formatted below to set the downloaded text in a more readable manner.
	function handleDownloadPdfsForPdfBlock() {
		const checkedResultsBlob = checkedResults
			.map(
				(result) =>
					`${result._bookTitle}, Page ${result._pageNum}: ${result._sentence}\n\n${result._pageText}\n`,
			)
			.join("\n");

		const blob = new Blob([checkedResultsBlob], { type: "text/plain" });
		const url = window.URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = "docsearchdownload-text.txt"; // Filename for the download
		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	}

	//Used in handleLoadPdfDataFromPdfTab(event) to return the sentence within the page which
	//holds the searchQuery term. The sentence is placed initially in the PdfBlock as a quick
	//reference and in wanting to look further, can click on the block to open the full page.
	/**
	 * Finds a sentence containing the search term within the page text
	 * @param {string} text - The page text to search through
	 * @param {string} subject - The search term to find
	 * @returns {string} The sentence containing the search term or an error message
	 */
	const findSentenceForPdfPage = (text, subject) => {
		if (!text || !subject) return "No page text or sentence found";
		const errSubject = subject.toLowerCase();
		const sub = `\\b${subject}\\b`;

		const sentenceRegex = new RegExp(
			`[^.?!]*${sub}[^.?!]*(?:[.?!]|$)`,
			"gi",
		);
		const match = sentenceRegex.exec(text);

		if (match) {
			return match[0].trim(); // Return the first matching sentence
		} else {
			return `No sentence found containing "${errSubject}".`;
		}
	};

	//handleCheckboxChangeForPdfBlock is an event listener for the +page.svelte component or parent
	// to the PdfBlock component or child.
	//Below -> <PdfBlock {result} on:delete={handleDeleteForPdfBlock} on:change={(e) => handleCheckboxChangeForPdfBlock(result, e)}
	//The parent listens for a dipatch from PdfBlock -> dispatch('change', { result, checked }); checkedResults is set with
	//the proper array of PdfBookResult which has been checked in the Results tab.
	/**
	 * Handles checkbox changes for PDF blocks
	 * @param {PdfBookResult} result - The PDF result object
	 * @param {CustomEvent} event - The checkbox change event
	 */
	function handleCheckboxChangeForPdfBlock(result, event) {
		console.log("IN handleCheckboxChange");
		result.isChecked = event.detail.checked;
		console.log("result is ", result);
		if (event.detail.checked) {
			checkedResults.push(result);
			console.log("checkedResults adding ", checkedResults);
		} else {
			checkedResults = checkedResults.filter((r) => r !== result);
			console.log("checkedResults deleting ", checkedResults);
		}
		// checkedResultsWritable.set(checkedResults);
		console.log("Checked results:", checkedResults);
		for (let i = 0; i < checkedResults.length; i++) {
			console.log("Number " + i + " " + checkedResults[i]);
		}
	}

	//This checks all of the pdf book titles from the pdf tab.
	//<input type="checkbox" id="checkall-id" bind:checked={isCheckAll} onchange={handleCheckAll}/>
	// If the Pdf tab is open, this checkbox will appear. isCheckAll is initialized on change from a
	//$derived rune functionality. If there is equality in the derived attributes, the isAllChecked is
	//updated to true, to than execute and update the isCheckAll to true.
	/**
	 * @param {Event} event - The checkbox change event
	 */
	function handleCheckAll(event) {
		if (event.target) {
			const target = /** @type {HTMLInputElement} */(event.target);
			isCheckAll = target.checked;
			if (isCheckAll) {
				pdfBookCheckFromPdfTab = $pdfBooksGetFromSubject;
			} else {
				// Uncheck all: clear the array
				pdfBookCheckFromPdfTab = [];
			}
		}
	}

	/** @type {boolean} */
	let isAllChecked = $derived(
		pdfBookCheckFromPdfTab.length === $pdfBooksGetFromSubject.length &&
			$pdfBooksGetFromSubject.length > 0,
	);
	$effect(() => {
		isCheckAll = isAllChecked;
	});

	/**
	 * Handles delete events for PDF blocks
	 * @param {CustomEvent} event - The delete event
	 */
	function handleDeleteForPdfBlock(event) {
		const resultToDelete = event.detail; // Assuming PdfBlock emits the result
		pdfBooksAsResultObjects = pdfBooksAsResultObjects.filter(
			(r) => r !== resultToDelete,
		);
	}

</script>

<svelte:head>
	<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
</svelte:head>

<div class="container">
	<nav class="routing">
		<a href="/">home</a>
		<a href="/diagram">diagram</a>
	</nav>
	{#if activeTab == "results"}
    <div class="download-r-checkall-buttons">
      <input
        type="button"
        id="download-id"
        value="Download"
        onclick={handleDownloadPdfsForPdfBlock}
      />
      <div class="total-count">
        <p
          style="min-width: 150px; overflow: visible; white-space: nowrap; margin: 0;"
        >
          Total Count is {totalCount}
        </p>
      </div>
    </div>
	{:else}
		<div class="download-r-checkall-buttons">
			<input
				type="checkbox"
				id="checkall-id"
				bind:checked={isCheckAll}
				onchange={handleCheckAll}
			/>
		</div>
	{/if}
	<div class="header">
		<h1>Pdf Search JS</h1>
		<SearchBar
			{selectedSubject}
			pdfBookTitles={pdfBookCheckFromPdfTab}
			on:searchResults={handleLoadPdfDataFromPdfTab}
			on:loadingChange={handleLoadingChange}
		/>
		{#if isLoading}
			<div class="spinner-overlay">
				<div class="spinner"></div>
			</div>
		{/if}
	</div>
	<div class="pdfsubjects-dropdnlist">
		<label for="pdf-options" id="pdf-label">PDF Subjects:</label>
		<select onchange={handleSubjectChange}>
			{#each setDataPdfSubjects as pdfSubject}
				<option id="pdfsubject" value={pdfSubject}>{pdfSubject}</option>
			{/each}
		</select>
	</div>
	<div class="tab-bar">
		<div class="w3-row">
			<a href="javascript:void(0)" onclick={() => openTab("pdfs")}>
				<div
					class="w3-third tablink w3-bottombar w3-hover-light-grey w3-padding {activeTab ===
					'pdfs'
						? 'active w3-border-green'
						: ''}"
					style="text-align:center;"
				>
					Pdfs
				</div>
			</a>
			<a href="javascript:void(0)" onclick={() => openTab("results")}>
				<div
					class="w3-third tablink w3-bottombar w3-hover-light-grey w3-padding {activeTab ===
					'results'
						? 'active w3-border-green'
						: ''}"
					style="text-align:center;"
				>
					Results
				</div>
			</a>
		</div>
	</div>
	<div class="tab-content">
		<div
			id="pdfs"
			class="w3-container tab"
			style:display={activeTab === "pdfs" ? "block" : "none"}
		>
			{#if $pdfBooksGetFromSubject.length > 0}
				<ul class="pdf-titles-list">
					{#each $pdfBooksGetFromSubject as title}
						<li class="pdf-title-block">
							<input
								type="checkbox"
								id={title}
								class="pdf-title-item"
								bind:group={pdfBookCheckFromPdfTab}
								value={title}
							/>
							<label for={title} class="pdf-title-label"
								>{title}</label
							>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div
			id="results"
			class="w3-container tab"
			style:display={activeTab === "results" ? "block" : "none"}
		>
			{#each pdfBooksAsResultObjects as result}
				<PdfBlock
					{result}
					on:delete={handleDeleteForPdfBlock}
					on:change={(e) =>
						handleCheckboxChangeForPdfBlock(result, e)}
				/>
			{/each}
		</div>
	</div>

	<div class="footer">
		<Footer />
	</div>
</div>

<style lang="scss">
	@import "$lib/styles/mainpage.scss";
</style>