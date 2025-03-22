import { writable } from 'svelte/store';

// Create the store in a separate file
export const searchQueryWritable = writable('');
export const previousSearchesWritable = writable([]);