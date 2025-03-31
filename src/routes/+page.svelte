<script>
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	import SearchBar from "$lib/SearchBar.svelte";
	import PdfBlock from "$lib/PdfBlock.svelte";
	import Footer from "$lib/Footer.svelte";
	import { PdfBookResult } from "$lib/classes/PdfBookResult.js";
	import { searchQueryWritable } from "$lib/store.js";

	let selectedSubject = $state("");
	let { data } = $props();
	let setDataPdfSubjects = data.dataPdfSubjects;
	let pdfBooksGetFromSubject = writable([]);
	let pdfBookCheckFromPdfTab = $state([]);
	let mySearchData = $state(null);
	let isLoading = false;
	let pdfBooksRetFromSearch = $state(null);
	let pdfBooksAsResultObjects = $state([]);
	let activeTab = $state("pdfs");
	let checkedResults = [];
	let isCheckAll = $state(false);
	let totalCount = $state();

	// onMount - receives passed { data } = $props(); from +page.server.js - setDataPdfSubjects - these are Pdf
	// subjects and within is the pdf books or pdf content.
	onMount(() => {
		if (setDataPdfSubjects.length > 0) {
			selectedSubject = setDataPdfSubjects[0]; // Set default to the first subject
			handleLoadPdfTitlesFromSubject(selectedSubject); // Automatically trigger the fetch for the first subject
		}
	});

	// openTab - facilitates changing of the tabs of pdf and results
	function openTab(tabName) {
		console.log("Open tab:", tabName);
		activeTab = tabName;
	}

	// handleSubjectChange - when there is a subject change, update the pdfs in the main body by
	// calling handleLoadPdfTitlesFromSubject
	function handleSubjectChange(event) {
		const subject = event.target.value;
		selectedSubject = subject;
		if (subject) {
			handleLoadPdfTitlesFromSubject(subject);
		} else {
			pdfBooksGetFromSubject.set([]);
		}
	}

	//handleLoadPdfTitlesFromSubject - takes a subject as argument and calls the node.js docker container api
	//to return just the titles of those pdf books by subject or folder name
	async function handleLoadPdfTitlesFromSubject(subject) {
		try {
			const response = await fetch(
				`http://localhost:3001/api/pdf-titles/${subject}`,
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
	function handleLoadingChange(event) {
		isLoading = event.detail;
	}

	function handleTimeOut(event) {
		console.log("handleTimeOut event.detail is " + event.detail);
		handleLoadPdfDataFromPdfTab(event);
	}

	//This is also an event listener for +page.svelte or the parent component to the SearchBar child component.
	//SearchBar below on:searchResults={handleLoadPdfDataFromPdfTab}. In SearchBar component - dispatch('searchResults', result);
	//The result is passed as searchResults and when that variable is set with the results, it executes the below
	//function through it being used as an event listener with the data in results. mySearchData, being json data,
	//is modified into an array format. Lastly, it steps through the array to input the pdf attributes into creating
	//a PdfBookResult object that is than stored into a pdfBooksAsResultObjects array.
	function handleLoadPdfDataFromPdfTab(event) {
		mySearchData = event.detail;
		console.log("IN HANDLELOADPDFDATAFROMPDFTAB");
		showTotalCount(mySearchData.total);

		if (mySearchData.results != null && Object.keys(mySearchData.results).length > 0) {
			console.log("MYSEARCHDATA IF STATEMENT - NOT NULL AND LENGTH > 0 ");
			pdfBooksRetFromSearch = Object.keys(mySearchData.results);
			// Create PdfResult instances
			pdfBooksAsResultObjects = [];
			//for (const title of pdfTitlesReturned) {
			if (pdfBooksRetFromSearch != null) {
				for (let i = 0; i < pdfBooksRetFromSearch.length; i++) {
					const matches =
						mySearchData.results[pdfBooksRetFromSearch[i]];
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
		
		} else if (mySearchData == "noPdfCheckBoxesChecked"){
			console.log("NO Pdfs chosen");
			alert("Choose a Pdf.");
		}else if (mySearchData == "pdfsOverLimit"){
			alert("Pdf book search limit is 25");
		}else{
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
	function handleCheckAll() {
		//pdfBooksGetFromSubject
		isCheckAll = event.target.checked;
		if (isCheckAll) {
			pdfBookCheckFromPdfTab = $pdfBooksGetFromSubject;
		} else {
			// Uncheck all: clear the array
			pdfBookCheckFromPdfTab = [];
		}
	}

	let isAllChecked = $derived(
		pdfBookCheckFromPdfTab.length === $pdfBooksGetFromSubject.length &&
			$pdfBooksGetFromSubject.length > 0,
	);
	$effect(() => {
		isCheckAll = isAllChecked;
	});

	function handleDeleteForPdfBlock(event) {
		const resultToDelete = event.detail; // Assuming PdfBlock emits the result
		pdfBooksAsResultObjects = pdfBooksAsResultObjects.filter(
			(r) => r !== resultToDelete,
		);
		totalCount = pdfBooksAsResultObjects.length;
	}

	function showTotalCount(totalCnt){
  		totalCount = totalCnt;
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
				onclick={handleDownloadPdfsForPdfBlock}/>
				<div class= "total-count">
					<p>Total Count is {totalCount}</p>
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
			on:searchTimeout={handleTimeOut}
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
			<!-- <option value="" disabled>Select a subject</option> -->
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
