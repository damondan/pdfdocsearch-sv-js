import { render, fireEvent, screen } from '@testing-library/svelte';
import { vi } from 'vitest';
import Page from './+page.svelte';  // Assuming this is the path to your page.svelte

test('renders checkbox and binds value', () => {
  render(Page);

  // Find the checkbox element by its ID or role
  const checkbox = screen.getByRole('checkbox', { name: /checkall/i });
  
  // Assert the checkbox is rendered
  expect(checkbox).toBeInTheDocument();
  
  // Ensure it's initially unchecked
  expect(checkbox.checked).toBe(false);
});

test('checkbox updates the bound variable', async () => {
  render(Page);

  const checkbox = screen.getByRole('checkbox', { name: /checkall/i });
  
  // Simulate clicking the checkbox to check it
  await fireEvent.click(checkbox);

  // Assert that the checkbox is now checked
  expect(checkbox.checked).toBe(true);
});

test('handleCheckAll function is called when checkbox changes', async () => {
  const handleCheckAll = vi.fn();  // Mock function
  render(Page, {
    props: { handleCheckAll }  // Pass mock function as prop if it's needed in the component
  });

  const checkbox = screen.getByRole('checkbox', { name: /checkall/i });

  // Trigger a change on the checkbox
  await fireEvent.change(checkbox, { target: { checked: true } });

  // Assert that the handleCheckAll function is called
  expect(handleCheckAll).toHaveBeenCalledTimes(1);
});
